<template>
  <div class="contact-page">
    <!-- 页面头部 -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">联系我们</h1>
        <p class="page-subtitle">期待与您的合作，共创智慧物流新未来</p>
      </div>
    </section>
    
    <!-- 联系方式 -->
    <section class="section section-light">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-info">
            <h2>联系方式</h2>
            <p class="info-desc">
              如有任何问题或合作意向，欢迎通过以下方式联系我们，我们将在24小时内回复您。
            </p>
            
            <div class="info-list">
              <div class="info-item">
                <div class="info-icon">
                  <el-icon :size="24"><Location /></el-icon>
                </div>
                <div class="info-content">
                  <h4>公司地址</h4>
                  <p>广州市天河区科技园创新大厦A座18楼</p>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-icon">
                  <el-icon :size="24"><Phone /></el-icon>
                </div>
                <div class="info-content">
                  <h4>联系电话</h4>
                  <p>400-888-8888</p>
                  <p class="sub">工作时间：周一至周五 9:00-18:00</p>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-icon">
                  <el-icon :size="24"><Message /></el-icon>
                </div>
                <div class="info-content">
                  <h4>电子邮箱</h4>
                  <p>contact@zhiyun.com</p>
                  <p class="sub">商务合作：business@zhiyun.com</p>
                </div>
              </div>
              
              <div class="info-item">
                <div class="info-icon">
                  <el-icon :size="24"><ChatDotRound /></el-icon>
                </div>
                <div class="info-content">
                  <h4>在线客服</h4>
                  <p>7x24小时在线支持</p>
                </div>
              </div>
            </div>
            
            <div class="social-section">
              <h4>关注我们</h4>
              <div class="social-links">
                <a href="#" class="social-item" title="微信公众号">
                  <el-icon :size="20"><ChatDotRound /></el-icon>
                </a>
                <a href="#" class="social-item" title="微博">
                  <el-icon :size="20"><Share /></el-icon>
                </a>
                <a href="#" class="social-item" title="抖音">
                  <el-icon :size="20"><VideoCamera /></el-icon>
                </a>
              </div>
            </div>
          </div>
          
          <div class="contact-form-wrapper">
            <div class="form-card">
              <h3>在线留言</h3>
              <p class="form-desc">填写以下表单，我们将尽快与您联系</p>
              
              <el-form 
                ref="formRef"
                :model="form" 
                :rules="rules" 
                label-position="top"
                @submit.prevent="handleSubmit"
              >
                <el-form-item label="您的姓名" prop="name">
                  <el-input v-model="form.name" placeholder="请输入您的姓名" />
                </el-form-item>
                
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="form.phone" placeholder="请输入您的联系电话" />
                </el-form-item>
                
                <el-form-item label="电子邮箱" prop="email">
                  <el-input v-model="form.email" placeholder="请输入您的电子邮箱" />
                </el-form-item>
                
                <el-form-item label="公司名称" prop="company">
                  <el-input v-model="form.company" placeholder="请输入您的公司名称" />
                </el-form-item>
                
                <el-form-item label="咨询内容" prop="message">
                  <el-input 
                    v-model="form.message" 
                    type="textarea" 
                    :rows="4"
                    placeholder="请描述您的需求或问题"
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button 
                    type="primary" 
                    size="large" 
                    :loading="submitting"
                    style="width: 100%"
                    @click="handleSubmit"
                  >
                    提交留言
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 地图区域 -->
    <section class="map-section">
      <a 
        href="https://map.baidu.com/search/%E5%B9%BF%E5%B7%9E%E5%B8%82%E5%A4%A9%E6%B2%B3%E5%8C%BA%E7%A7%91%E6%8A%80%E5%9B%AD/@12615115.52,2642045.75,17z" 
        target="_blank"
        class="map-link"
      >
        <div class="map-bg"></div>
        <div class="map-overlay">
          <div class="map-marker">
            <el-icon :size="24"><Location /></el-icon>
          </div>
          <div class="map-info">
            <h4>广州知运信息技术有限公司</h4>
            <p><el-icon><Location /></el-icon> 广州市天河区科技园创新大厦A座18楼</p>
            <div class="map-channels">
              <span class="map-channels-label">客服渠道</span>
              <span
                v-for="channel in supportChannels"
                :key="channel.id"
                class="map-channel"
                @click.stop.prevent="jumpToChannel(channel.id)"
              >
                {{ channel.name }}
              </span>
            </div>
            <span class="map-tip">点击查看详细位置</span>
          </div>
        </div>
      </a>
    </section>

    <!-- 客服渠道与响应承诺 -->
    <SupportChannelPanel />

    <!-- 常见问题 -->
    <section class="section section-gray">
      <div class="container">
        <SectionTitle 
          title="常见问题" 
          subtitle="快速了解您关心的问题"
        />
        <div class="faq-list">
          <el-collapse v-model="activeFaq">
            <el-collapse-item 
              v-for="faq in faqs" 
              :key="faq.question"
              :title="faq.question"
              :name="faq.question"
            >
              <p>{{ faq.answer }}</p>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import SectionTitle from '@/components/SectionTitle.vue'
import SupportChannelPanel from '@/components/SupportChannelPanel.vue'
import { SUPPORT_CHANNELS } from '@/data/supportChannels'

const route = useRoute()
const router = useRouter()

const supportChannels = SUPPORT_CHANNELS

// 从地图卡片跳转到对应客服渠道
const jumpToChannel = (channelId) => {
  router.push({
    path: '/contact',
    query: { ...route.query, channel: channelId },
    hash: '#support-channels'
  })
}

const formRef = ref(null)
const submitting = ref(false)
const activeFaq = ref([])

const form = reactive({
  name: '',
  phone: '',
  email: '',
  company: '',
  message: ''
})

const rules = {
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入您的联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入您的电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  message: [
    { required: true, message: '请输入咨询内容', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      // 模拟提交
      setTimeout(() => {
        submitting.value = false
        ElMessage.success('留言提交成功，我们将尽快与您联系！')
        formRef.value.resetFields()
      }, 1500)
    }
  })
}

const faqs = [
  {
    question: '知运的产品适合什么规模的企业？',
    answer: '知运的产品适合各种规模的企业，从中小型企业到大型集团都有对应的解决方案。我们提供灵活的部署方式和定价策略，可以根据您的业务规模和需求进行定制。'
  },
  {
    question: '系统部署需要多长时间？',
    answer: '根据项目复杂度不同，标准产品部署通常需要2-4周，定制化项目需要1-3个月。我们会在项目启动前提供详细的实施计划和时间表。'
  },
  {
    question: '是否提供系统培训服务？',
    answer: '是的，我们提供完整的培训服务，包括管理员培训、操作员培训和在线培训课程。确保您的团队能够熟练使用系统。'
  },
  {
    question: '系统是否支持与现有ERP对接？',
    answer: '支持。知运系统提供标准化的API接口，可以与主流ERP系统（如SAP、Oracle、用友、金蝶等）进行无缝对接。'
  },
  {
    question: '数据安全如何保障？',
    answer: '我们采用多层安全防护措施，包括数据加密传输、访问权限控制、定期安全审计等。系统已通过等保三级认证，确保您的数据安全。'
  }
]
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables.scss' as *;

.page-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: $spacing-xxl 0;
  text-align: center;
  color: #fff;
}

.page-title {
  font-size: $font-size-xxxl;
  font-weight: 700;
  margin-bottom: $spacing-sm;
}

.page-subtitle {
  font-size: $font-size-lg;
  opacity: 0.75;
}

.contact-grid {
  display: flex;
  gap: $spacing-xxl;
}

.contact-info {
  flex: 1;
  
  h2 {
    font-size: $font-size-xxl;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.info-desc {
  font-size: $font-size-base;
  color: $text-secondary;
  line-height: $line-height-loose;
  margin-bottom: $spacing-xl;
}

.info-list {
  margin-bottom: $spacing-xl;
}

.info-item {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.info-icon {
  width: 48px;
  height: 48px;
  background: rgba($primary-color, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $primary-color;
  flex-shrink: 0;
}

.info-content {
  h4 {
    font-size: $font-size-base;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }
  
  p {
    font-size: $font-size-sm;
    color: $text-regular;
    
    &.sub {
      color: $text-secondary;
      margin-top: 2px;
    }
  }
}

.social-section {
  h4 {
    font-size: $font-size-base;
    color: $text-primary;
    margin-bottom: $spacing-md;
  }
}

.social-links {
  display: flex;
  gap: $spacing-sm;
}

.social-item {
  width: 40px;
  height: 40px;
  background: $bg-color;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-secondary;
  transition: all 0.3s;
  
  &:hover {
    background: $primary-color;
    color: #fff;
  }
}

.contact-form-wrapper {
  flex: 0 0 480px;
}

.form-card {
  background: $bg-white;
  padding: $spacing-xl;
  border-radius: $radius-lg;
  box-shadow: $shadow-lg;
  
  h3 {
    font-size: $font-size-xl;
    color: $text-primary;
    margin-bottom: $spacing-xs;
  }
  
  .form-desc {
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $spacing-lg;
  }
}

.map-section {
  height: 400px;
  background: $bg-color;
  position: relative;
  overflow: hidden;
}

.map-link {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  
  &:hover {
    .map-bg {
      transform: scale(1.02);
    }
    
    .map-tip {
      opacity: 1;
    }
  }
}

.map-bg {
  width: 100%;
  height: 100%;
  background-image: url('/18ddc586-03f5-4333-98f0-1c08353c594b.png');
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
}

.map-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.map-marker {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, $primary-color, $primary-dark);
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 24px rgba($primary-color, 0.5);
  margin-bottom: $spacing-md;
  animation: markerBounce 2s ease-in-out infinite;
  
  .el-icon {
    transform: rotate(45deg);
    color: #fff;
  }
}

@keyframes markerBounce {
  0%, 100% { transform: rotate(-45deg) translateY(0); }
  50% { transform: rotate(-45deg) translateY(-8px); }
}

.map-info {
  background: #fff;
  padding: $spacing-lg $spacing-xl;
  border-radius: $radius-lg;
  text-align: center;
  box-shadow: $shadow-lg;
  
  h4 {
    font-size: $font-size-lg;
    color: $text-primary;
    margin-bottom: $spacing-sm;
    font-weight: 600;
  }
  
  p {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    font-size: $font-size-sm;
    color: $text-secondary;
    margin-bottom: $spacing-sm;
    
    .el-icon {
      color: $primary-color;
    }
  }
}

.map-channels {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-bottom: $spacing-sm;
}

.map-channels-label {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.map-channel {
  font-size: $font-size-xs;
  color: $primary-color;
  border: 1px solid rgba($primary-color, 0.4);
  border-radius: $radius-lg;
  padding: 2px $spacing-xs;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: $primary-color;
    color: #fff;
  }
}

.map-tip {
  font-size: $font-size-xs;
  color: $primary-color;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.faq-list {
  max-width: 800px;
  margin: 0 auto;
  
  :deep(.el-collapse) {
    border: none;
  }
  
  :deep(.el-collapse-item__header) {
    font-size: $font-size-base;
    font-weight: 500;
    color: $text-primary;
    background: $bg-white;
    padding: $spacing-md $spacing-lg;
    border-radius: $radius-md;
    margin-bottom: $spacing-sm;
    border: none;
  }
  
  :deep(.el-collapse-item__wrap) {
    background: transparent;
    border: none;
  }
  
  :deep(.el-collapse-item__content) {
    padding: 0 $spacing-lg $spacing-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    line-height: $line-height-loose;
  }
}

@media (max-width: $breakpoint-lg) {
  .contact-grid {
    flex-direction: column;
  }
  
  .contact-form-wrapper {
    flex: none;
    width: 100%;
  }
}

@media (max-width: $breakpoint-md) {
  .page-title {
    font-size: $font-size-xxl;
  }
  
  .map-section {
    height: 300px;
  }
}
</style>
