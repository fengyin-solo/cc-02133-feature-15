# 广州知运信息技术有限公司官网 - 项目设计文档

## 1. 系统架构

```mermaid
flowchart TD
    subgraph Frontend["前端 (Vue 3 + Vite)"]
        A[App.vue] --> B[Router]
        B --> C[Views]
        C --> C1[HomeView - 首页]
        C --> C2[AboutView - 关于我们]
        C --> C3[ProductView - 产品服务]
        C --> C4[CaseView - 案例展示]
        C --> C5[ContactView - 联系我们]
        
        D[Components]
        D --> D1[NavHeader - 导航栏]
        D --> D2[FooterSection - 页脚]
        D --> D3[HeroBanner - 首页横幅]
        D --> D4[FeatureCard - 特性卡片]
        D --> D5[ProductCard - 产品卡片]
        D --> D6[CaseCard - 案例卡片]
        D --> D7[ServiceSchedule - 客服时段与响应承诺视图]
    end
    
    subgraph Static["静态资源"]
        E[Assets]
        E --> E1[images/]
        E --> E2[styles/]
    end
```

## 2. 页面结构

| 页面 | 路由 | 描述 |
|------|------|------|
| 首页 | `/` | 公司介绍、核心业务、产品亮点 |
| 关于我们 | `/about` | 公司简介、发展历程、企业文化 |
| 产品服务 | `/products` | 智慧物流系统产品介绍 |
| 案例展示 | `/cases` | 成功案例展示 |
| 联系我们 | `/contact` | 联系方式、地图、客服时段与响应承诺、留言表单 |

## 3. UI/UX 规范

### 3.1 色彩体系
| 用途 | 色值 | 说明 |
|------|------|------|
| 主色调 | `#1890ff` | 科技蓝，体现智慧物流 |
| 辅助色 | `#52c41a` | 成功绿，物流畅通 |
| 强调色 | `#fa8c16` | 活力橙，创新活力 |
| 文字主色 | `#303133` | 标题文字 |
| 文字次色 | `#606266` | 正文文字 |
| 文字辅助 | `#909399` | 辅助说明 |
| 背景色 | `#f5f7fa` | 页面背景 |
| 卡片背景 | `#ffffff` | 卡片白色 |

### 3.2 字体规范
- 标题字体：`"PingFang SC", "Microsoft YaHei", sans-serif`
- 正文字体：`"PingFang SC", "Microsoft YaHei", sans-serif`
- H1: 36px / bold
- H2: 28px / bold
- H3: 22px / semibold
- 正文: 16px / regular
- 辅助: 14px / regular

### 3.3 间距规范
- 页面内边距: 24px
- 卡片内边距: 20px
- 元素间距: 16px
- 小间距: 8px

### 3.4 圆角规范
- 大圆角: 12px (卡片)
- 中圆角: 8px (按钮)
- 小圆角: 4px (输入框)

### 3.5 阴影规范
- 卡片阴影: `0 4px 12px rgba(0, 0, 0, 0.08)`
- 悬浮阴影: `0 8px 24px rgba(0, 0, 0, 0.12)`

## 4. 组件清单

| 组件名 | 功能 | 复用场景 |
|--------|------|----------|
| NavHeader | 顶部导航栏 | 全局 |
| FooterSection | 页脚信息 | 全局 |
| HeroBanner | 首页大图横幅 | 首页 |
| FeatureCard | 特性展示卡片 | 首页、产品页 |
| ProductCard | 产品介绍卡片 | 产品页 |
| CaseCard | 案例展示卡片 | 案例页 |
| SectionTitle | 区块标题 | 全局 |
| ServiceSchedule | 客服时段与响应承诺视图 | 联系页 |
| ContactForm | 联系表单 | 联系页 |

## 4.1 客服时段与响应承诺

联系页新增 `ServiceSchedule` 视图，位于联系方式区块与地图区块之间：

- **渠道切换**：在线客服 / 电话客服 / 邮件支持 / 微信客服，选中渠道持久化到 `localStorage`（键：`zhiyun-service-channel`），切换、刷新、返回后仍展示当前有效安排
- **每周时段表**：周一至周日各渠道服务时段，今天行高亮并显示实时状态（服务中 / 休息中）
- **状态横幅**：实时计算服务中（含服务截止时间）、休息中（含即将开放时间）、已停用（含停用原因）
- **异常标注**：渠道停用标出原因；跨日时段（如 22:00-次日02:00）打「跨日」标签；同日时段重叠打「冲突」标签并说明按并集计算；渠道宣称（如 7x24 小时）与实际排班不符时在顶部标出信息冲突原因
- **联系电话优先级**：按 P1-P3 展示热线号码、适用场景与实时可拨打状态
- **地图渠道直达**：地图卡片底部提供各渠道快捷入口，点击选中对应渠道并滚动定位到时段视图
- 数据与计算逻辑见 `src/data/serviceChannels.js`、`src/utils/schedule.js`，实时时钟见 `src/composables/useNow.js`（每 30s 刷新状态）

## 5. 响应式断点

| 断点 | 宽度 | 布局 |
|------|------|------|
| Desktop | ≥1200px | 4列栅格 |
| Tablet | 768px-1199px | 2列栅格 |
| Mobile | <768px | 单列 |
