// 客服渠道排班与联系电话优先级数据
// 约定：weekly 以周一为 1、周日为 7；当 end <= start 时视为跨日时段（结束时间为次日）

export const SCHEDULE_UPDATED_AT = '2026-09-18'

export const serviceChannels = [
  {
    key: 'online',
    name: '在线客服',
    icon: 'ChatDotRound',
    desc: '官网与系统内即时会话窗口',
    status: 'active',
    // 渠道对外宣称，用于与实际排班做冲突校验
    claim: '7x24小时在线支持',
    sla: '工作时段 30 秒内响应；非工作时段留言将在下一时段开始后 30 分钟内优先处理',
    weekly: {
      1: [{ start: '09:00', end: '18:00' }, { start: '22:00', end: '02:00' }],
      2: [{ start: '09:00', end: '18:00' }],
      3: [{ start: '09:00', end: '18:00' }],
      4: [{ start: '09:00', end: '18:00' }],
      5: [{ start: '09:00', end: '18:00' }, { start: '22:00', end: '02:00' }],
      6: [{ start: '10:00', end: '16:00' }],
      7: []
    }
  },
  {
    key: 'phone',
    name: '电话客服',
    icon: 'Phone',
    desc: '客服热线与值班电话接听',
    status: 'active',
    claim: '',
    sla: '工作时段来电即时接听；漏接电话将在 2 小时内回拨',
    weekly: {
      1: [{ start: '09:00', end: '18:00' }],
      2: [{ start: '09:00', end: '18:00' }],
      // 周三存在两段重叠排班，用于演示时段冲突标注
      3: [{ start: '09:00', end: '18:00' }, { start: '14:00', end: '20:00' }],
      4: [{ start: '09:00', end: '18:00' }],
      5: [{ start: '09:00', end: '18:00' }],
      6: [],
      7: []
    }
  },
  {
    key: 'email',
    name: '邮件支持',
    icon: 'Message',
    desc: 'contact@zhiyun.com',
    status: 'active',
    claim: '',
    sla: '邮件随时可发送；工作时段内 2 小时内回复，最迟不超过 24 小时',
    weekly: {
      1: [{ start: '09:00', end: '18:00' }],
      2: [{ start: '09:00', end: '18:00' }],
      3: [{ start: '09:00', end: '18:00' }],
      4: [{ start: '09:00', end: '18:00' }],
      5: [{ start: '09:00', end: '18:00' }],
      6: [],
      7: []
    }
  },
  {
    key: 'wechat',
    name: '微信客服',
    icon: 'ChatLineRound',
    desc: '企业微信一对一服务',
    status: 'disabled',
    disabledReason: '企业微信系统升级维护，预计 2026-09-25 恢复，期间请改用在线客服或电话渠道',
    claim: '',
    sla: '恢复后工作时段 5 分钟内响应',
    weekly: {
      1: [{ start: '09:00', end: '21:00' }],
      2: [{ start: '09:00', end: '21:00' }],
      3: [{ start: '09:00', end: '21:00' }],
      4: [{ start: '09:00', end: '21:00' }],
      5: [{ start: '09:00', end: '21:00' }],
      6: [{ start: '10:00', end: '17:00' }],
      7: []
    }
  }
]

// 联系电话优先级：priority 越小越优先
export const phonePriorities = [
  {
    number: '400-888-8888',
    label: '全国客服热线',
    priority: 1,
    note: '第一优先级，工作日 9:00-18:00',
    weekly: {
      1: [{ start: '09:00', end: '18:00' }],
      2: [{ start: '09:00', end: '18:00' }],
      3: [{ start: '09:00', end: '18:00' }],
      4: [{ start: '09:00', end: '18:00' }],
      5: [{ start: '09:00', end: '18:00' }],
      6: [],
      7: []
    }
  },
  {
    number: '020-3838-6666',
    label: '广州本地直拨',
    priority: 2,
    note: '热线占线时建议拨打，工作日 9:00-18:00',
    weekly: {
      1: [{ start: '09:00', end: '18:00' }],
      2: [{ start: '09:00', end: '18:00' }],
      3: [{ start: '09:00', end: '18:00' }],
      4: [{ start: '09:00', end: '18:00' }],
      5: [{ start: '09:00', end: '18:00' }],
      6: [],
      7: []
    }
  },
  {
    number: '138-0013-8000',
    label: '紧急值班电话',
    priority: 3,
    note: '仅限紧急故障申报，每日 18:00-22:00',
    weekly: {
      1: [{ start: '18:00', end: '22:00' }],
      2: [{ start: '18:00', end: '22:00' }],
      3: [{ start: '18:00', end: '22:00' }],
      4: [{ start: '18:00', end: '22:00' }],
      5: [{ start: '18:00', end: '22:00' }],
      6: [{ start: '18:00', end: '22:00' }],
      7: [{ start: '18:00', end: '22:00' }]
    }
  }
]
