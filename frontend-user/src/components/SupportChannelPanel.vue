<template>
  <section id="support-channels" class="section section-light support-section">
    <div class="container">
      <SectionTitle
        title="客服渠道与响应承诺"
        subtitle="查看各渠道每周服务时段、联系电话优先级与响应承诺，合理安排咨询时间"
      />

      <!-- 渠道切换 -->
      <div class="channel-tabs">
        <button
          v-for="channel in channels"
          :key="channel.id"
          class="channel-tab"
          :class="{ active: channel.id === activeId, offline: !channel.enabled }"
          @click="selectChannel(channel.id)"
        >
          <el-icon :size="18"><component :is="channel.icon" /></el-icon>
          <span class="tab-name">{{ channel.name }}</span>
          <i class="state-dot" :class="`dot-${stateOf(channel)}`"></i>
          <span v-if="!channel.enabled" class="tab-flag">停用</span>
        </button>
      </div>

      <!-- 渠道详情 -->
      <div class="channel-detail">
        <div class="detail-main">
          <!-- 状态横幅 -->
          <div class="state-banner" :class="`banner-${snapshot.state}`">
            <div class="state-info">
              <el-icon :size="24"><component :is="stateIcon" /></el-icon>
              <div>
                <div class="state-label">{{ stateLabel }}</div>
                <p class="state-hint">{{ stateHint }}</p>
              </div>
            </div>
            <div v-if="snapshot.nextOpeningLabel" class="next-open">
              <el-icon><Clock /></el-icon>
              <span>即将开放：{{ snapshot.nextOpeningLabel }}</span>
            </div>
          </div>

          <!-- 停用 / 跨日 / 冲突原因标记 -->
          <div v-if="issues.length" class="issue-tags">
            <el-tag
              v-for="(issue, index) in issues"
              :key="index"
              :type="issueTagType(issue.type)"
              :effect="issue.type === 'conflict' ? 'dark' : 'plain'"
              round
            >
              {{ issue.reason }}
            </el-tag>
          </div>

          <!-- 响应承诺 -->
          <div class="info-card promise-card">
            <h4>
              <el-icon><Timer /></el-icon>
              响应承诺
            </h4>
            <p class="promise-main">{{ activeChannel.responsePromise }}</p>
            <p v-if="activeChannel.promiseNote" class="promise-note">{{ activeChannel.promiseNote }}</p>
          </div>

          <!-- 联系电话（按优先级） -->
          <div class="info-card phone-card">
            <h4>
              <el-icon><Phone /></el-icon>
              联系电话
              <span class="h4-sub">（按优先级排序）</span>
            </h4>
            <template v-if="sortedPhones.length">
              <div v-for="phone in sortedPhones" :key="phone.number" class="phone-item">
                <el-tag
                  :type="phone.priority === 1 ? 'primary' : 'info'"
                  effect="plain"
                  size="small"
                >
                  {{ phone.priority === 1 ? '优先' : `备选 ${phone.priority - 1}` }}
                </el-tag>
                <a class="phone-number" :href="`tel:${phone.number}`">{{ phone.number }}</a>
                <span class="phone-label">{{ phone.label }}</span>
              </div>
            </template>
            <p v-else class="phone-empty">该渠道暂未配置联系电话，请通过下方表单留言</p>
          </div>
        </div>

        <!-- 每周服务时段 -->
        <div class="schedule-card">
          <h4>
            <el-icon><Calendar /></el-icon>
            每周服务时段
          </h4>
          <ul class="schedule-list">
            <li
              v-for="day in weekSchedule"
              :key="day.key"
              :class="{ today: day.isToday }"
            >
              <span class="day-name">
                {{ day.label }}
                <em v-if="day.isToday">今天</em>
              </span>
              <span class="day-periods">
                <template v-if="day.periods.length">
                  <span v-for="(period, i) in day.periods" :key="i" class="period">
                    {{ formatPeriod(period) }}
                    <el-tag v-if="isCrossDayPeriod(period)" type="warning" size="small" effect="plain">
                      跨日
                    </el-tag>
                  </span>
                </template>
                <span v-else class="rest">休息</span>
              </span>
              <span v-if="day.isToday" class="day-state" :class="`text-${snapshot.state}`">
                {{ stateLabel }}
              </span>
            </li>
          </ul>
          <p class="schedule-tip">以上均为北京时间，跨日时段的结束时间为次日</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SectionTitle from '@/components/SectionTitle.vue'
import { SUPPORT_CHANNELS, WEEK_DAYS } from '@/data/supportChannels'
import {
  isCrossDayPeriod,
  formatPeriod,
  collectChannelIssues,
  getChannelState,
  getDayPeriods,
  findNextOpening,
  formatNextOpening
} from '@/utils/supportSchedule'

const route = useRoute()
const router = useRouter()

const channels = SUPPORT_CHANNELS
const STORAGE_KEY = 'zhiyun-support-channel'

const normalize = (value) => (Array.isArray(value) ? value[0] : value)
const isValidId = (id) => channels.some((c) => c.id === id)
const readStored = () => {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}
const writeStored = (id) => {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // 隐私模式等场景下忽略写入失败
  }
}

// 初始渠道：URL query 优先，其次本地缓存，最后默认第一个渠道
const resolveInitial = () => {
  const fromQuery = normalize(route.query.channel)
  if (isValidId(fromQuery)) return fromQuery
  const stored = readStored()
  if (isValidId(stored)) return stored
  return channels[0].id
}

const activeId = ref(resolveInitial())
const now = ref(new Date())
let timer = null

onMounted(() => {
  // 将当前有效渠道同步到地址栏，保证刷新、返回后展示一致
  if (normalize(route.query.channel) !== activeId.value) {
    router.replace({ query: { ...route.query, channel: activeId.value } })
  }
  timer = window.setInterval(() => {
    now.value = new Date()
  }, 30 * 1000)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})

const selectChannel = (id) => {
  if (id === activeId.value) return
  activeId.value = id
  writeStored(id)
  router.push({ query: { ...route.query, channel: id } })
}

// 浏览器前进/后退、地图卡片跳转时同步选中渠道
watch(
  () => route.query.channel,
  (value) => {
    const id = normalize(value)
    if (isValidId(id) && id !== activeId.value) {
      activeId.value = id
      writeStored(id)
    }
  }
)

const activeChannel = computed(
  () => channels.find((c) => c.id === activeId.value) || channels[0]
)

const stateOf = (channel) => getChannelState(channel, now.value)

const snapshot = computed(() => {
  const state = getChannelState(activeChannel.value, now.value)
  const next = state === 'closed' ? findNextOpening(activeChannel.value, now.value) : null
  return {
    state,
    nextOpeningLabel: next ? formatNextOpening(next, now.value) : ''
  }
})

const STATE_META = {
  open: { label: '服务中', icon: 'CircleCheck', hint: '当前为服务时段，咨询将按承诺时效响应' },
  closed: { label: '休息中', icon: 'Clock', hint: '当前为非服务时段，可先留言或稍后再来' },
  disabled: { label: '已停用', icon: 'CircleClose', hint: '' },
  unscheduled: { label: '暂未排期', icon: 'Warning', hint: '渠道已启用但尚未配置服务时段，请暂时通过其他渠道联系' }
}

const stateLabel = computed(() => STATE_META[snapshot.value.state].label)
const stateIcon = computed(() => STATE_META[snapshot.value.state].icon)
const stateHint = computed(() => {
  if (snapshot.value.state === 'disabled') {
    return activeChannel.value.disabledReason || '该渠道暂时停用'
  }
  return STATE_META[snapshot.value.state].hint
})

const issues = computed(() => collectChannelIssues(activeChannel.value))

const issueTagType = (type) => {
  if (type === 'conflict') return 'danger'
  if (type === 'crossday') return 'warning'
  return 'info'
}

const sortedPhones = computed(() =>
  [...(activeChannel.value.phones || [])].sort((a, b) => a.priority - b.priority)
)

const todayKey = computed(() => {
  const day = now.value.getDay()
  return day === 0 ? 7 : day
})

const weekSchedule = computed(() =>
  WEEK_DAYS.map((day) => ({
    ...day,
    isToday: day.key === todayKey.value,
    periods: getDayPeriods(activeChannel.value, day.key)
  }))
)
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.channel-tabs {
  display: flex;
  justify-content: center;
  gap: $spacing-md;
  flex-wrap: wrap;
  margin-bottom: $spacing-xl;
}

.channel-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  background: $bg-white;
  color: $text-regular;
  font-size: $font-size-base;
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
  }

  &.offline .tab-name {
    color: $text-secondary;
  }

  &.offline.active .tab-name {
    color: #fff;
  }
}

.state-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.dot-open {
    background: $success-color;
  }

  &.dot-closed {
    background: $warning-color;
  }

  &.dot-disabled {
    background: $text-placeholder;
  }

  &.dot-unscheduled {
    background: $danger-color;
  }
}

.tab-flag {
  font-size: $font-size-xs;
  color: $text-secondary;
  border: 1px solid currentColor;
  border-radius: $radius-sm;
  padding: 0 4px;
  line-height: 1.4;
}

.channel-detail {
  display: flex;
  gap: $spacing-xl;
  align-items: flex-start;
}

.detail-main {
  flex: 1;
  min-width: 0;
}

.state-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
  flex-wrap: wrap;
  padding: $spacing-md $spacing-lg;
  border-radius: $radius-lg;
  margin-bottom: $spacing-md;

  &.banner-open {
    background: #f0f9eb;
    border: 1px solid #e1f3d8;
    color: $success-color;
  }

  &.banner-closed {
    background: #fdf6ec;
    border: 1px solid #faecd8;
    color: $warning-color;
  }

  &.banner-disabled {
    background: #f4f4f5;
    border: 1px solid #e9e9eb;
    color: $info-color;
  }

  &.banner-unscheduled {
    background: #fef0f0;
    border: 1px solid #fde2e2;
    color: $danger-color;
  }
}

.state-info {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.state-label {
  font-size: $font-size-lg;
  font-weight: 600;
}

.state-hint {
  font-size: $font-size-sm;
  color: $text-regular;
  margin-top: 2px;
}

.next-open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-primary;
  background: rgba(255, 255, 255, 0.7);
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-md;
}

.issue-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.info-card {
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  padding: $spacing-lg;
  margin-bottom: $spacing-md;

  h4 {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: $font-size-base;
    color: $text-primary;
    margin-bottom: $spacing-md;

    .el-icon {
      color: $primary-color;
    }
  }
}

.h4-sub {
  font-size: $font-size-xs;
  color: $text-secondary;
  font-weight: 400;
}

.promise-main {
  font-size: $font-size-base;
  color: $text-primary;
  font-weight: 500;
}

.promise-note {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin-top: $spacing-xs;
}

.phone-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm 0;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }
}

.phone-number {
  font-size: $font-size-base;
  font-weight: 600;
  color: $primary-color;
}

.phone-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.phone-empty {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.schedule-card {
  flex: 0 0 420px;
  background: $bg-white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-lg;

  h4 {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: $font-size-base;
    color: $text-primary;
    margin-bottom: $spacing-md;

    .el-icon {
      color: $primary-color;
    }
  }
}

.schedule-list {
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm $spacing-sm;
    border-radius: $radius-md;

    &.today {
      background: rgba($primary-color, 0.06);
    }
  }
}

.day-name {
  flex: 0 0 76px;
  font-size: $font-size-sm;
  color: $text-primary;
  font-weight: 500;

  em {
    font-style: normal;
    font-size: $font-size-xs;
    color: $primary-color;
    margin-left: 4px;
  }
}

.day-periods {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $text-regular;

  .period {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .rest {
    color: $text-placeholder;
  }
}

.day-state {
  flex-shrink: 0;
  font-size: $font-size-xs;
  font-weight: 500;

  &.text-open {
    color: $success-color;
  }

  &.text-closed {
    color: $warning-color;
  }

  &.text-disabled {
    color: $info-color;
  }

  &.text-unscheduled {
    color: $danger-color;
  }
}

.schedule-tip {
  margin-top: $spacing-md;
  font-size: $font-size-xs;
  color: $text-secondary;
}

@media (max-width: $breakpoint-lg) {
  .channel-detail {
    flex-direction: column;
  }

  .schedule-card {
    flex: none;
    width: 100%;
  }
}

@media (max-width: $breakpoint-md) {
  .channel-tab {
    padding: 8px 14px;
    font-size: $font-size-sm;
  }

  .state-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
