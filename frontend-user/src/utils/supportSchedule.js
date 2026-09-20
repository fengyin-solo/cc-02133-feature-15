// 客服渠道时段计算工具

export const WEEKDAY_LABELS = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日'
}

export const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// 结束时间不晚于开始时间，视为跨日时段（如 22:00 - 次日 06:00）
export const isCrossDayPeriod = (period) => toMinutes(period.end) <= toMinutes(period.start)

// Date -> 周键（1=周一 ... 7=周日）
const dayKeyOf = (date) => {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

export const getDayPeriods = (channel, dayKey) => {
  const periods = channel.schedule?.[dayKey]
  return Array.isArray(periods) ? periods : []
}

export const hasAnyPeriod = (channel) =>
  Object.values(channel.schedule || {}).some((list) => Array.isArray(list) && list.length > 0)

export const formatPeriod = (period) =>
  isCrossDayPeriod(period) ? `${period.start} - 次日 ${period.end}` : `${period.start} - ${period.end}`

// 信息冲突检测：启用但未排期、启停状态与说明不一致、同日时段重叠
export const detectConflicts = (channel) => {
  const conflicts = []

  if (channel.enabled && !hasAnyPeriod(channel)) {
    conflicts.push('渠道已启用但未配置任何服务时段')
  }
  if (channel.enabled && channel.disabledReason) {
    conflicts.push('渠道状态为启用，但仍保留停用说明')
  }
  if (!channel.enabled && !channel.disabledReason) {
    conflicts.push('渠道已停用但未说明原因')
  }

  for (const [dayKey, periods] of Object.entries(channel.schedule || {})) {
    if (!Array.isArray(periods) || periods.length < 2) continue
    const sorted = [...periods].sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]
      const curr = sorted[i]
      // 跨日时段的结束时间在次日，不参与同日重叠判断
      if (isCrossDayPeriod(prev) || isCrossDayPeriod(curr)) continue
      if (toMinutes(curr.start) < toMinutes(prev.end)) {
        conflicts.push(
          `${WEEKDAY_LABELS[Number(dayKey)]}时段重叠：${prev.start}-${prev.end} 与 ${curr.start}-${curr.end}`
        )
      }
    }
  }

  return conflicts
}

// 渠道当前状态：open 服务中 / closed 休息中 / disabled 已停用 / unscheduled 暂未排期
export const getChannelState = (channel, now) => {
  if (!channel.enabled) return 'disabled'
  if (!hasAnyPeriod(channel)) return 'unscheduled'
  return isOpenAt(channel, now) ? 'open' : 'closed'
}

export const isOpenAt = (channel, date) => {
  if (!channel.enabled) return false
  const nowMin = date.getHours() * 60 + date.getMinutes()
  const todayKey = dayKeyOf(date)

  for (const period of getDayPeriods(channel, todayKey)) {
    if (isCrossDayPeriod(period)) {
      if (nowMin >= toMinutes(period.start)) return true
    } else if (nowMin >= toMinutes(period.start) && nowMin < toMinutes(period.end)) {
      return true
    }
  }

  // 前一日跨日时段延续到今日凌晨的部分
  const yesterdayKey = todayKey === 1 ? 7 : todayKey - 1
  for (const period of getDayPeriods(channel, yesterdayKey)) {
    if (isCrossDayPeriod(period) && nowMin < toMinutes(period.end)) return true
  }

  return false
}

// 从 from 时刻起，未来 8 天内最近一次开放时间
export const findNextOpening = (channel, from) => {
  if (!channel.enabled || !hasAnyPeriod(channel)) return null

  for (let offset = 0; offset < 8; offset++) {
    const day = new Date(from.getFullYear(), from.getMonth(), from.getDate() + offset)
    const periods = [...getDayPeriods(channel, dayKeyOf(day))].sort(
      (a, b) => toMinutes(a.start) - toMinutes(b.start)
    )
    for (const period of periods) {
      const [h, m] = period.start.split(':').map(Number)
      const startAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m)
      if (startAt > from) return startAt
    }
  }
  return null
}

export const formatNextOpening = (date, now) => {
  const hm = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86400000)

  if (diffDays <= 0) return `今天 ${hm}`
  if (diffDays === 1) return `明天 ${hm}`
  if (diffDays <= 7) return `${WEEKDAY_LABELS[dayKeyOf(date)]} ${hm}`
  return `${date.getMonth() + 1}月${date.getDate()}日 ${hm}`
}

// 汇总需要在视图上标出的原因：渠道停用 / 时段跨日 / 信息冲突
export const collectChannelIssues = (channel) => {
  const issues = []

  if (!channel.enabled) {
    issues.push({ type: 'disabled', reason: channel.disabledReason || '该渠道暂时停用' })
  }

  const crossDays = Object.entries(channel.schedule || {})
    .filter(([, periods]) => Array.isArray(periods) && periods.some(isCrossDayPeriod))
    .map(([dayKey]) => Number(dayKey))
    .sort((a, b) => a - b)
  if (crossDays.length > 0) {
    const label = crossDays.length === 7 ? '每日' : crossDays.map((k) => WEEKDAY_LABELS[k]).join('、')
    issues.push({ type: 'crossday', reason: `${label}的服务时段跨越零点，结束时间为次日` })
  }

  for (const reason of detectConflicts(channel)) {
    issues.push({ type: 'conflict', reason })
  }

  return issues
}
