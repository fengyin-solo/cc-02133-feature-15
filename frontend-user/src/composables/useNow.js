import { ref, onUnmounted } from 'vue'

// 实时时钟：驱动客服状态、即将开放时间等随时间刷新
export function useNow(interval = 30000) {
  const now = ref(new Date())
  const timer = setInterval(() => {
    now.value = new Date()
  }, interval)
  onUnmounted(() => clearInterval(timer))
  return now
}
