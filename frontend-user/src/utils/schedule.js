// 客服排班计算工具：时段解析、跨日识别、冲突检测、当前状态与即将开放时间

export const WEEKDAYS = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' }
]

const MINUTES_PER_DAY = 24 * 60

export function toMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// JS Date -> 周一为 1 ... 周日为 7
export function weekdayOf(date) {
  return ((date.getDay() + 6) % 7) + 1
}

export function minutesOf(date) {
  return date.getHours() * 60 + date.getMinutes()
}

// 分钟数（可超过 24h）-> HH:mm 字符串
export function toTimeString(minutes) {
  const m = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  const mm = String(m % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// 标准化时段：end <= start 视为跨日，结束分钟数 +24h
export function normalizeSlot(slot) {
  const startMin = toMinutes(slot.start)
  let endMin = toMinutes(slot.end)
  let overnight = false
  if (endMin <= startMin) {
    endMin += MINUTES_PER_DAY
    overnight = true
  }
  return { ...slot, startMin, endMin, overnight, conflict: false }
}

// 合并重叠时段（用于状态计算，跨日按 +24h 后的分钟数处理）
export function mergeSlots(slots) {
  const normalized = slots.map(normalizeSlot).sort((a, b) => a.startMin - b.startMin)
  const merged = []
  for (const slot of normalized) {
    const last = merged[merged.length - 1]
    if (last && slot.startMin < last.endMin) {
      last.endMin = Math.max(last.endMin, slot.endMin)
      last.end = toTimeString(last.endMin)
      last.overnight = last.endMin > MINUTES_PER_DAY
      last.merged = true
    } else {
      merged.push({ ...slot })
    }
  }
  return merged
}

// 分析整周排班：返回每日标准化时段（带跨日/冲突标记）与当日冲突原因
export function analyzeWeekly(weekly) {
  const result = {}
  for (let day = 1; day <= 7; day++) {
    const slots = (weekly[day] || []).map(normalizeSlot)
    const sorted = [...slots].sort((a, b) => a.startMin - b.startMin)
    const reasons = []
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startMin < sorted[i - 1].endMin) {
        sorted[i].conflict = true
        sorted[i - 1].conflict = true
        reasons.push(`${sorted[i - 1].start}-${sorted[i - 1].end} 与 ${sorted[i].start}-${sorted[i].end} 时段重叠`)
      }
    }
    result[day] = { slots, reasons }
  }
  return result
}

// 某日实际覆盖分钟数（含前一日跨日溢出部分），用于宣称校验
function dayCoverageMinutes(weekly, day) {
  const prev = day === 1 ? 7 : day - 1
  const intervals = []
  for (const s of mergeSlots(weekly[day] || [])) {
    intervals.push([s.startMin, Math.min(s.endMin, MINUTES_PER_DAY)])
  }
  for (const s of mergeSlots(weekly[prev] || [])) {
    if (s.endMin > MINUTES_PER_DAY) {
      intervals.push([0, s.endMin - MINUTES_PER_DAY])
    }
  }
  intervals.sort((a, b) => a[0] - b[0])
  let covered = 0
  let curStart = null
  let curEnd = null
  for (const [start, end] of intervals) {
    if (curStart === null) {
      curStart = start
      curEnd = end
    } else if (start <= curEnd) {
      curEnd = Math.max(curEnd, end)
    } else {
      covered += curEnd - curStart
      curStart = start
      curEnd = end
    }
  }
  if (curStart !== null) covered += curEnd - curStart
  return covered
}

// 渠道宣称（如 7x24 小时）与实际排班的冲突检测
export function detectClaimConflict(channel) {
  if (!channel.claim) return null
  const claimsFullDay = /7\s*[x×]\s*24|全天候|全天在线/.test(channel.claim)
  if (!claimsFullDay) return null
  const uncoveredDays = []
  for (let day = 1; day <= 7; day++) {
    if (dayCoverageMinutes(channel.weekly, day) < MINUTES_PER_DAY) {
      uncoveredDays.push(WEEKDAYS[day - 1].label)
    }
  }
  if (uncoveredDays.length === 0) return null
  return `渠道介绍为「${channel.claim}」，但当前排班未覆盖全天（${uncoveredDays.join('、')}等时段无排班），请以实际时段为准`
}

// 当前状态：open / closed / disabled
export function getChannelStatus(channel, now = new Date()) {
  if (channel.status === 'disabled') {
    return { state: 'disabled', reason: channel.disabledReason || '' }
  }
  const nowMin = minutesOf(now)
  const today = weekdayOf(now)
  // 今日时段
  for (const s of mergeSlots(channel.weekly[today] || [])) {
    if (nowMin >= s.startMin && nowMin < s.endMin) {
      return { state: 'open', until: s.end, overnight: s.endMin > MINUTES_PER_DAY }
    }
  }
  // 昨日跨日时段溢出到今日凌晨
  const yesterday = today === 1 ? 7 : today - 1
  for (const s of mergeSlots(channel.weekly[yesterday] || [])) {
    if (s.endMin > MINUTES_PER_DAY && nowMin < s.endMin - MINUTES_PER_DAY) {
      return { state: 'open', until: s.end, overnight: true }
    }
  }
  return { state: 'closed', next: getNextOpening(channel.weekly, now) }
}

// 即将开放时间：从今天起向后扫描 8 天
export function getNextOpening(weekly, now = new Date()) {
  const nowMin = minutesOf(now)
  const today = weekdayOf(now)
  for (let offset = 0; offset < 8; offset++) {
    const day = ((today - 1 + offset) % 7) + 1
    const slots = mergeSlots(weekly[day] || []).sort((a, b) => a.startMin - b.startMin)
    for (const s of slots) {
      if (offset === 0 && s.startMin <= nowMin) continue
      return { offset, day, time: s.start }
    }
  }
  return null
}

// 即将开放时间的展示文案
export function formatNextOpening(next) {
  if (!next) return ''
  const dayLabel = WEEKDAYS[next.day - 1].label
  if (next.offset === 0) return `今天 ${next.time}`
  if (next.offset === 1) return `明天 ${next.time}`
  if (next.offset === 2) return `后天 ${next.time}`
  if (next.offset === 7) return `下${dayLabel} ${next.time}`
  return `${dayLabel} ${next.time}`
}

// 任意 weekly 是否处于服务中（供电话优先级等复用）
export function isOpenNow(weekly, now = new Date()) {
  const nowMin = minutesOf(now)
  const today = weekdayOf(now)
  for (const s of mergeSlots(weekly[today] || [])) {
    if (nowMin >= s.startMin && nowMin < s.endMin) return true
  }
  const yesterday = today === 1 ? 7 : today - 1
  for (const s of mergeSlots(weekly[yesterday] || [])) {
    if (s.endMin > MINUTES_PER_DAY && nowMin < s.endMin - MINUTES_PER_DAY) return true
  }
  return false
}
