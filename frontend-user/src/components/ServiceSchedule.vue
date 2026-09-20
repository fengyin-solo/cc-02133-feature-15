<template>
  <section id="service-schedule" class="section section-gray schedule-section">
    <div class="container">
      <SectionTitle
        title="客服时段与响应承诺"
        subtitle="各渠道服务状态实时更新，以下为您当前有效的排班安排"
      />

      <!-- 元信息 -->
      <div class="schedule-meta">
        <span class="meta-item">
          <el-icon><Clock /></el-icon>
          当前时间：{{ nowLabel }}
        </span>
        <span class="meta-item">
          <el-icon><Calendar /></el-icon>
          排班更新于 {{ SCHEDULE_UPDATED_AT }}，为当前有效安排
        </span>
      </div>

      <!-- 渠道切换 -->
      <div class="channel-tabs">
        <button
          v-for="ch in serviceChannels"
          :key="ch.key"
          class="channel-tab"
          :class="{ active: ch.key === modelValue, 'is-disabled': ch.status === 'disabled' }"
          @click="switchChannel(ch.key)"
        >
          <el-icon :size="18"><component :is="ch.icon" /></el-icon>
          <span class="tab-name">{{ ch.name }}</span>
          <i class="status-dot" :class="`dot-${channelStates[ch.key]}`"></i>
        </button>
      </div>

      <!-- 状态横幅 -->
      <div class="status-banner" :class="`banner-${status.state}`">
        <el-icon :size="22"><component :is="bannerIcon" /></el-icon>
        <div class="banner-text">
          <p class="banner-title">{{ bannerTitle }}</p>
          <p class="banner-sub">{{ bannerSub }}</p>
        </div>
      </div>

      <!-- 渠道级信息冲突 -->
      <div v-if="claimConflict" class="conflict-alert">
        <el-icon><WarningFilled /></el-icon>
        <span>信息冲突：{{ claimConflict }}</span>
      </div>

      <div class="schedule-body">
        <!-- 每周服务时段 -->
        <div class="schedule-card weekly-card" :class="{ 'is-disabled': isDisabled }">
          <div class="card-head">
            <h3>每周服务时段</h3>
            <span v-if="isDisabled" class="disabled-tip">渠道停用中，以下为恢复后排班</span>
          </div>
          <ul class="day-list">
            <li
              v-for="day in WEEKDAYS"
              :key="day.value"
              class="day-row"
              :class="{ today: day.value === todayWeekday }"
            >
              <div class="day-main">
                <span class="day-label">
                  {{ day.label }}
                  <em v-if="day.value === todayWeekday" class="today-tag">今天</em>
                </span>
                <div class="day-slots">
                  <template v-if="weeklyInfo[day.value].slots.length">
                    <span
                      v-for="(slot, i) in weeklyInfo[day.value].slots"
                      :key="i"
                      class="slot"
                      :class="{ overnight: slot.overnight, conflict: slot.conflict }"
                      :title="slot.overnight ? `跨日时段：结束时间为次日 ${slot.end}` : ''"
                    >
                      {{ slot.start }}-{{ slot.end }}
                      <i v-if="slot.overnight" class="slot-tag tag-overnight">跨日</i>
                      <i v-if="slot.conflict" class="slot-tag tag-conflict">冲突</i>
                    </span>
                  </template>
                  <span v-else class="rest">休息</span>
                </div>
                <span
                  v-if="day.value === todayWeekday && !isDisabled"
                  class="day-live"
                  :class="status.state"
                >
                  {{ status.state === 'open' ? '服务中' : '休息中' }}
                </span>
              </div>
              <p
                v-for="(reason, i) in weeklyInfo[day.value].reasons"
                :key="i"
                class="day-conflict"
              >
                <el-icon><WarningFilled /></el-icon>
                时段冲突：{{ reason }}，状态已按并集计算，请以客服实际安排为准
              </p>
            </li>
          </ul>
          <div class="sla-box">
            <el-icon :size="20"><Timer /></el-icon>
            <div>
              <span class="sla-label">响应承诺</span>
              <p>{{ channel.sla }}</p>
            </div>
          </div>
        </div>

        <!-- 联系电话优先级 -->
        <div class="schedule-card phone-card">
          <div class="card-head">
            <h3>联系电话优先级</h3>
          </div>
          <ul class="phone-list">
            <li v-for="phone in phoneStatuses" :key="phone.number" class="phone-row">
              <span class="priority-badge" :class="`p${phone.priority}`">P{{ phone.priority }}</span>
              <div class="phone-info">
                <p class="phone-number">
                  {{ phone.number }}
                  <span class="phone-label">{{ phone.label }}</span>
                </p>
                <p class="phone-note">{{ phone.note }}</p>
              </div>
              <span class="phone-status" :class="{ open: phone.open }">
                {{ phone.open ? '可拨打' : '休息中' }}
              </span>
            </li>
          </ul>
          <p class="phone-tip">按优先级顺序拨打，占线或休息中请尝试下一优先级号码</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import SectionTitle from '@/components/SectionTitle.vue'
import { serviceChannels, phonePriorities, SCHEDULE_UPDATED_AT } from '@/data/serviceChannels'
import {
  WEEKDAYS,
  weekdayOf,
  analyzeWeekly,
  detectClaimConflict,
  getChannelStatus,
  formatNextOpening,
  isOpenNow
} from '@/utils/schedule'
import { useNow } from '@/composables/useNow'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['update:modelValue'])

const now = useNow()

const channel = computed(
  () => serviceChannels.find((c) => c.key === props.modelValue) || serviceChannels[0]
)

const switchChannel = (key) => {
  emit('update:modelValue', key)
}

const todayWeekday = computed(() => weekdayOf(now.value))

const nowLabel = computed(() => {
  const d = now.value
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${WEEKDAYS[weekdayOf(d) - 1].label} ${hh}:${mm}`
})

const status = computed(() => getChannelStatus(channel.value, now.value))
const isDisabled = computed(() => channel.value.status === 'disabled')
const weeklyInfo = computed(() => analyzeWeekly(channel.value.weekly))
const claimConflict = computed(() => detectClaimConflict(channel.value))

const bannerIcon = computed(
  () =>
    ({
      open: 'CircleCheckFilled',
      closed: 'MoonNight',
      disabled: 'WarningFilled'
    }[status.value.state])
)

const bannerTitle = computed(() => {
  const name = channel.value.name
  switch (status.value.state) {
    case 'open':
      return `${name} · 服务中`
    case 'closed':
      return `${name} · 当前休息中`
    default:
      return `${name} · 已停用`
  }
})

const bannerSub = computed(() => {
  const s = status.value
  if (s.state === 'open') {
    return s.overnight ? `今日服务至次日 ${s.until}（跨日时段）` : `今日服务至 ${s.until}`
  }
  if (s.state === 'closed') {
    return s.next ? `即将开放：${formatNextOpening(s.next)}` : '近期暂无排班，请改用其他渠道'
  }
  return s.reason
})

// 各渠道实时状态（用于 tab 状态点）
const channelStates = computed(() => {
  const map = {}
  for (const ch of serviceChannels) {
    map[ch.key] = getChannelStatus(ch, now.value).state
  }
  return map
})

// 联系电话按优先级排序并计算实时可拨打状态
const phoneStatuses = computed(() =>
  [...phonePriorities]
    .sort((a, b) => a.priority - b.priority)
    .map((p) => ({ ...p, open: isOpenNow(p.weekly, now.value) }))
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.schedule-section {
  scroll-margin-top: 80px; // 锚点跳转时避开固定导航
}

.schedule-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: $spacing-md $spacing-xl;
  margin-bottom: $spacing-lg;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $text-secondary;

  .el-icon {
    color: $primary-color;
  }
}

.channel-tabs {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin-bottom: $spacing-lg;
}

.channel-tab {
  display: inline-flex;
  align-items: center;
  gap: $spacing-xs;
  padding: 10px $spacing-lg;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: 24px;
  font-size: $font-size-sm;
  color: $text-regular;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: $primary-color;
    color: $primary-color;
  }

  &.active {
    background: $primary-color;
    border-color: $primary-color;
    color: #fff;
    box-shadow: 0 4px 12px rgba($primary-color, 0.3);
  }

  &.is-disabled:not(.active) {
    border-style: dashed;
    color: $text-secondary;
  }
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;

  &.dot-open {
    background: $success-color;
    box-shadow: 0 0 0 3px rgba($success-color, 0.2);
  }

  &.dot-closed {
    background: $info-color;
  }

  &.dot-disabled {
    background: $warning-color;
    box-shadow: 0 0 0 3px rgba($warning-color, 0.2);
  }
}

.status-banner {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md $spacing-lg;
  border-radius: $radius-lg;
  margin-bottom: $spacing-lg;
  border: 1px solid transparent;

  &.banner-open {
    background: rgba($success-color, 0.08);
    border-color: rgba($success-color, 0.3);
    color: $success-color;
  }

  &.banner-closed {
    background: rgba($info-color, 0.08);
    border-color: rgba($info-color, 0.25);
    color: $info-color;
  }

  &.banner-disabled {
    background: rgba($warning-color, 0.08);
    border-color: rgba($warning-color, 0.3);
    color: $warning-color;
  }
}

.banner-text {
  .banner-title {
    font-size: $font-size-base;
    font-weight: 600;
    color: $text-primary;
  }

  .banner-sub {
    font-size: $font-size-sm;
    color: $text-regular;
    margin-top: 2px;
  }
}

.conflict-alert {
  display: flex;
  align-items: flex-start;
  gap: $spacing-xs;
  padding: $spacing-sm $spacing-md;
  margin-bottom: $spacing-lg;
  background: rgba($warning-color, 0.08);
  border: 1px solid rgba($warning-color, 0.3);
  border-radius: $radius-md;
  font-size: $font-size-sm;
  color: $text-regular;
  line-height: $line-height-base;

  .el-icon {
    color: $warning-color;
    margin-top: 3px;
    flex-shrink: 0;
  }
}

.schedule-body {
  display: flex;
  gap: $spacing-lg;
  align-items: stretch;
}

.schedule-card {
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-lg;
}

.weekly-card {
  flex: 1;
  min-width: 0;

  &.is-disabled {
    .day-list,
    .sla-box {
      opacity: 0.55;
    }
  }
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;

  h3 {
    font-size: $font-size-lg;
    color: $text-primary;
    font-weight: 600;
  }
}

.disabled-tip {
  font-size: $font-size-xs;
  color: $warning-color;
  background: rgba($warning-color, 0.1);
  padding: 2px $spacing-xs;
  border-radius: $radius-sm;
}

.day-list {
  list-style: none;
}

.day-row {
  padding: $spacing-sm $spacing-sm;
  border-radius: $radius-md;

  & + .day-row {
    border-top: 1px solid $border-light;
  }

  &.today {
    background: rgba($primary-color, 0.06);
    border-top-color: transparent;
  }
}

.day-main {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.day-label {
  flex: 0 0 76px;
  font-size: $font-size-sm;
  color: $text-primary;
  font-weight: 500;

  .today-tag {
    font-style: normal;
    font-size: $font-size-xs;
    color: #fff;
    background: $primary-color;
    border-radius: $radius-sm;
    padding: 1px 6px;
    margin-left: $spacing-xs;
  }
}

.day-slots {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;

  .rest {
    font-size: $font-size-sm;
    color: $text-placeholder;
  }
}

.slot {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: $font-size-sm;
  color: $text-regular;
  background: $bg-color;
  border-radius: $radius-sm;
  padding: 3px $spacing-xs;

  &.overnight {
    background: rgba($primary-color, 0.08);
    color: $primary-dark;
  }

  &.conflict {
    background: rgba($warning-color, 0.1);
    color: $warning-color;
  }
}

.slot-tag {
  font-style: normal;
  font-size: $font-size-xs;
  border-radius: $radius-sm;
  padding: 0 4px;

  &.tag-overnight {
    color: #fff;
    background: $primary-color;
  }

  &.tag-conflict {
    color: #fff;
    background: $warning-color;
  }
}

.day-live {
  flex-shrink: 0;
  font-size: $font-size-xs;
  border-radius: $radius-sm;
  padding: 2px $spacing-xs;

  &.open {
    color: $success-color;
    background: rgba($success-color, 0.1);
  }

  &.closed {
    color: $info-color;
    background: rgba($info-color, 0.1);
  }
}

.day-conflict {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-top: $spacing-xs;
  padding-left: 92px;
  font-size: $font-size-xs;
  color: $warning-color;
  line-height: $line-height-base;

  .el-icon {
    margin-top: 2px;
    flex-shrink: 0;
  }
}

.sla-box {
  display: flex;
  gap: $spacing-sm;
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: rgba($primary-color, 0.05);
  border-radius: $radius-md;
  color: $primary-color;

  .sla-label {
    display: block;
    font-size: $font-size-xs;
    color: $primary-color;
    font-weight: 600;
    margin-bottom: 2px;
  }

  p {
    font-size: $font-size-sm;
    color: $text-regular;
    line-height: $line-height-base;
  }
}

.phone-card {
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
}

.phone-list {
  list-style: none;
  flex: 1;
}

.phone-row {
  display: flex;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-md 0;

  & + .phone-row {
    border-top: 1px solid $border-light;
  }
}

.priority-badge {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-size-xs;
  font-weight: 700;
  color: #fff;

  &.p1 {
    background: linear-gradient(135deg, $primary-color, $primary-dark);
  }

  &.p2 {
    background: linear-gradient(135deg, $primary-light, $primary-color);
  }

  &.p3 {
    background: $info-color;
  }
}

.phone-info {
  flex: 1;
  min-width: 0;
}

.phone-number {
  font-size: $font-size-base;
  font-weight: 600;
  color: $text-primary;

  .phone-label {
    font-size: $font-size-xs;
    font-weight: 400;
    color: $text-secondary;
    margin-left: $spacing-xs;
  }
}

.phone-note {
  font-size: $font-size-xs;
  color: $text-secondary;
  margin-top: 2px;
}

.phone-status {
  flex-shrink: 0;
  font-size: $font-size-xs;
  color: $info-color;
  background: rgba($info-color, 0.1);
  border-radius: $radius-sm;
  padding: 2px $spacing-xs;

  &.open {
    color: $success-color;
    background: rgba($success-color, 0.1);
  }
}

.phone-tip {
  margin-top: $spacing-md;
  font-size: $font-size-xs;
  color: $text-secondary;
}

@media (max-width: $breakpoint-lg) {
  .schedule-body {
    flex-direction: column;
  }

  .phone-card {
    flex: none;
    width: 100%;
  }
}

@media (max-width: $breakpoint-md) {
  .day-main {
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  .day-label {
    flex-basis: 100%;
  }

  .day-conflict {
    padding-left: 0;
  }
}
</style>
