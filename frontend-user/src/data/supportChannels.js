// 客服渠道配置
// schedule 键：1=周一 ... 7=周日；end <= start 视为跨日时段（结束时间为次日）

export const WEEK_DAYS = [
  { key: 1, label: '周一' },
  { key: 2, label: '周二' },
  { key: 3, label: '周三' },
  { key: 4, label: '周四' },
  { key: 5, label: '周五' },
  { key: 6, label: '周六' },
  { key: 7, label: '周日' }
]

export const SUPPORT_CHANNELS = [
  {
    id: 'online',
    name: '在线客服',
    icon: 'Service',
    description: '官网在线会话，工作日实时答疑',
    enabled: true,
    disabledReason: '',
    responsePromise: '服务时段内首次响应不超过 5 分钟',
    promiseNote: '非服务时段的留言将在下一个工作日 2 小时内回复',
    phones: [
      { number: '400-888-8888', label: '全国客服热线', priority: 1 },
      { number: '020-8888-6666', label: '售前咨询专线', priority: 2 }
    ],
    schedule: {
      1: [{ start: '09:00', end: '18:00' }],
      2: [{ start: '09:00', end: '18:00' }],
      3: [{ start: '09:00', end: '18:00' }],
      4: [{ start: '09:00', end: '18:00' }],
      5: [{ start: '09:00', end: '18:00' }],
      6: [{ start: '10:00', end: '16:00' }],
      7: []
    }
  },
  {
    id: 'hotline',
    name: '夜间紧急热线',
    icon: 'PhoneFilled',
    description: '面向系统故障、在途异常等紧急情况的夜间值班电话',
    enabled: true,
    disabledReason: '',
    responsePromise: '夜间紧急问题 30 分钟内响应',
    promiseNote: '仅受理紧急事项，一般咨询请使用在线客服',
    phones: [
      { number: '400-888-9999', label: '夜间值班热线', priority: 1 },
      { number: '138-0000-8888', label: '值班经理手机', priority: 2 }
    ],
    schedule: {
      1: [{ start: '22:00', end: '06:00' }],
      2: [{ start: '22:00', end: '06:00' }],
      3: [{ start: '22:00', end: '06:00' }],
      4: [{ start: '22:00', end: '06:00' }],
      5: [{ start: '22:00', end: '06:00' }],
      6: [{ start: '22:00', end: '06:00' }],
      7: [{ start: '22:00', end: '06:00' }]
    }
  },
  {
    id: 'wechat',
    name: '微信客服',
    icon: 'ChatDotRound',
    description: '微信公众号会话客服',
    enabled: false,
    disabledReason: '公众号客服系统升级维护中，预计 2026-09-30 恢复',
    responsePromise: '恢复后服务时段内 10 分钟内响应',
    promiseNote: '停用期间请通过在线客服或电话联系',
    phones: [],
    schedule: {
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
    id: 'email',
    name: '邮件支持',
    icon: 'Message',
    description: '商务合作与方案咨询邮件通道',
    enabled: true,
    disabledReason: '',
    responsePromise: '工作日 24 小时内邮件回复',
    promiseNote: '商务合作请发送至 business@zhiyun.com',
    phones: [],
    schedule: {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: []
    }
  }
]
