<template>
  <Transition name="warp-fade">
    <div v-if="visible" class="splash-screen" ref="splashContainer">
      <!-- 第0层 - 深空底色与星云 -->
      <div class="deep-space-bg">
        <div class="space-gradient"></div>
        <!-- 彩色星云 -->
        <div class="nebula nebula-purple"></div>
        <div class="nebula nebula-cyan"></div>
        <div class="nebula nebula-green"></div>
        <div class="nebula nebula-red"></div>
      </div>

      <!-- 第1层 - Canvas 粒子星空 -->
      <canvas ref="starCanvas" class="star-canvas"></canvas>

      <!-- 第2层 - 静态星尘闪烁 -->
      <div class="star-dust">
        <div v-for="dust in dustParticles" :key="dust.id" class="dust-particle" :style="dust.style"></div>
      </div>

      <!-- 第3层 - 赛博数字雨 -->
      <div class="digital-rain">
        <div v-for="rain in rainLines" :key="rain.id" class="rain-line" :style="rain.style"></div>
      </div>

      <!-- 第4层 - 装饰性天体 -->
      <div class="cosmic-planets" ref="planetsContainer">
        <!-- 主星 - 带星环的蓝紫色行星 -->
        <div class="planet main-planet">
          <div class="planet-body"></div>
          <div class="planet-ring"></div>
          <div class="planet-glow"></div>
        </div>
        <!-- 红巨星 -->
        <div class="planet red-giant">
          <div class="planet-body"></div>
          <div class="planet-glow"></div>
        </div>
        <!-- 毒气星 -->
        <div class="planet toxic-planet">
          <div class="planet-body"></div>
          <div class="planet-glow"></div>
        </div>
        <!-- 熔岩金星 -->
        <div class="planet lava-planet">
          <div class="planet-body"></div>
          <div class="planet-glow"></div>
        </div>
        <!-- 冰霜世界 -->
        <div class="planet ice-planet">
          <div class="planet-body"></div>
        </div>
        <!-- 紫水晶星 -->
        <div class="planet crystal-planet">
          <div class="planet-body"></div>
        </div>
        <!-- 小型陨石 -->
        <div class="asteroid asteroid-1"></div>
        <div class="asteroid asteroid-2"></div>
        <div class="asteroid asteroid-3"></div>
      </div>

      <!-- 主内容 - 玻璃拟态面板 -->
      <div class="glass-panel" :class="{ 'warp-shake': isWarping }" ref="glassPanel">
        <div class="panel-border"></div>
        <div class="panel-content">
          <!-- Logo -->
          <div class="logo-container">
            <div class="logo-icon">
              <svg viewBox="0 0 100 100" class="music-icon">
                <!-- 音符图标 -->
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#a5f3fc;stop-opacity:1" />
                  </linearGradient>
                </defs>
                <circle cx="25" cy="75" r="12" fill="url(#logoGradient)" class="note-circle" />
                <circle cx="65" cy="65" r="12" fill="url(#logoGradient)" class="note-circle delay" />
                <rect x="35" y="20" width="4" height="55" fill="url(#logoGradient)" class="note-stem" />
                <rect x="75" y="15" width="4" height="50" fill="url(#logoGradient)" class="note-stem delay" />
                <path d="M 39 20 Q 57 10 79 15" stroke="url(#logoGradient)" stroke-width="4" fill="none"
                  class="note-beam" />
              </svg>
            </div>
            <div class="logo-ring"></div>
            <div class="logo-ring delay-1"></div>
            <div class="logo-ring delay-2"></div>
          </div>

          <!-- 应用名称 - 金属渐变效果 -->
          <h1 class="app-name">
            <span class="char" v-for="(char, index) in appNameChars" :key="index"
              :style="{ animationDelay: `${index * 0.08}s` }">
              {{ char }}
            </span>
          </h1>

          <!-- 加载指示器 -->
          <div class="loading-indicator">
            <div class="loading-bar">
              <div class="loading-progress"></div>
              <div class="loading-glow"></div>
            </div>
            <p class="loading-text">{{ loadingText }}</p>
          </div>
        </div>

        <!-- 能量光晕 -->
        <div class="energy-glow" :class="{ active: isWarping }"></div>
      </div>

      <!-- 底部信息 -->
      <div class="splash-footer">

      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'finished'): void
}>()

const visible = ref(true)
const isWarping = ref(false)
const starCanvas = ref<HTMLCanvasElement | null>(null)
const splashContainer = ref<HTMLElement | null>(null)
const planetsContainer = ref<HTMLElement | null>(null)
const glassPanel = ref<HTMLElement | null>(null)

// 应用名称拆分为字符数组
const appNameChars = '故里音乐助手'.split('')

// 加载文字
const loadingTexts = ['正在初始化引擎...', '连接星际网络...', '加载音乐库...', '准备启航...']
const loadingTextIndex = ref(0)
const loadingText = computed(() => loadingTexts[loadingTextIndex.value])

let loadingTextInterval: number | null = null
let animationFrameId: number | null = null
let stars: Star[] = []
let starSpeed = 0.5

interface Star {
  x: number
  y: number
  z: number
  prevZ: number
  color: string
  size: number
}

// 生成固定的星尘数据
const dustParticles = Array.from({ length: 60 }, (_, i) => {
  const random = (min: number, max: number) => Math.random() * (max - min) + min
  return {
    id: i,
    style: {
      left: `${random(0, 100)}%`,
      top: `${random(0, 100)}%`,
      width: `${random(1, 3)}px`,
      height: `${random(1, 3)}px`,
      animationDelay: `${random(0, 5)}s`,
      animationDuration: `${random(2, 5)}s`
    }
  }
})

// 生成固定的数字雨数据
const rainLines = Array.from({ length: 30 }, (_, i) => {
  const random = (min: number, max: number) => Math.random() * (max - min) + min
  const colors = [
    'linear-gradient(180deg, transparent, #22d3ee, transparent)',
    'linear-gradient(180deg, transparent, #818cf8, transparent)',
    'linear-gradient(180deg, transparent, #a78bfa, transparent)',
    'linear-gradient(180deg, transparent, #ffffff, transparent)'
  ]
  return {
    id: i,
    style: {
      left: `${random(0, 100)}%`,
      height: `${random(50, 200)}px`,
      background: colors[Math.floor(random(0, colors.length))],
      animationDelay: `${random(0, 3)}s`,
      animationDuration: `${random(1.5, 3)}s`,
      opacity: random(0.3, 0.8)
    }
  }
})

// 初始化Canvas星空
const initStarField = () => {
  const canvas = starCanvas.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 设置canvas尺寸
  const resizeCanvas = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // 创建星星
  const starColors = ['#ffffff', '#22d3ee', '#f87171', '#4ade80', '#818cf8', '#fbbf24']
  const starCount = 300

  stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * canvas.width - canvas.width / 2,
    y: Math.random() * canvas.height - canvas.height / 2,
    z: Math.random() * 1000,
    prevZ: 1000,
    color: starColors[Math.floor(Math.random() * starColors.length)],
    size: Math.random() * 2 + 0.5
  }))

  // 渲染循环
  const render = () => {
    // 实时计算中心点，确保穿梭点永远居中
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    stars.forEach((star) => {
      star.prevZ = star.z
      star.z -= starSpeed

      if (star.z <= 0) {
        star.x = Math.random() * canvas.width - canvas.width / 2
        star.y = Math.random() * canvas.height - canvas.height / 2
        star.z = 1000
        star.prevZ = 1000
      }

      // 投影坐标
      const scale = 500 / star.z
      const prevScale = 500 / star.prevZ
      const x = star.x * scale + centerX
      const y = star.y * scale + centerY
      const prevX = star.x * prevScale + centerX
      const prevY = star.y * prevScale + centerY

      // 判断是否在高速模式
      if (starSpeed > 5) {
        // 高速模式 - 绘制拉长的光线
        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = star.color
        ctx.lineWidth = star.size * scale * 0.5
        ctx.stroke()
      } else {
        // 常规模式 - 绘制星点
        const radius = Math.max(0.5, star.size * scale * 0.3)
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = star.color
        ctx.fill()
      }
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()
}

// 触发曲速跳跃动画
const triggerWarpDrive = () => {
  isWarping.value = true
  const warpDuration = 2500 // 2.5秒加速过程

  // 1. 星空加速 - 使用指数缓动让加速感更真实顺滑
  const startWarpTime = Date.now()
  const startSpeed = starSpeed
  const targetSpeed = 120

  const accelerateStars = () => {
    const now = Date.now()
    const progress = Math.min((now - startWarpTime) / warpDuration, 1)

    // EaseInExpo 曲线：前期缓慢积蓄能量，后期极速爆发
    // progress 0 -> 1, easeProgress 0 -> 1
    const easeProgress = progress === 0 ? 0 : Math.pow(2, 10 * progress - 10)

    starSpeed = startSpeed + (targetSpeed - startSpeed) * easeProgress

    if (progress < 1) {
      requestAnimationFrame(accelerateStars)
    }
  }
  accelerateStars()

  // 2. 星云消散 - 配合加速时长
  const nebulas = splashContainer.value?.querySelectorAll('.nebula')
  nebulas?.forEach((nebula) => {
    ; (nebula as HTMLElement).style.transition = `all ${warpDuration / 1000}s cubic-bezier(0.4, 0, 0.2, 1)`
      ; (nebula as HTMLElement).style.transform = 'scale(4)' // 放大更多
      ; (nebula as HTMLElement).style.opacity = '0'
  })

  // 3. 数字雨消失 - 稍微快一点，以免干扰视觉焦点
  const rainLines = splashContainer.value?.querySelectorAll('.rain-line')
  rainLines?.forEach((line) => {
    ; (line as HTMLElement).style.transition = 'opacity 1s ease-out'
      ; (line as HTMLElement).style.opacity = '0'
  })

  // 4. 星球飞散 - 配合加速时长
  const planets = planetsContainer.value?.querySelectorAll('.planet, .asteroid')
  planets?.forEach((planet, index) => {
    const el = planet as HTMLElement
    // 使用 ease-in 曲线，模拟被甩在身后的感觉
    el.style.transition = `all ${warpDuration / 1000}s cubic-bezier(0.55, 0.055, 0.675, 0.19)`

    // 生成随机飞散方向
    const angle = (index * 45) % 360
    const distance = 800 + Math.random() * 400 // 飞得更远
    const dx = Math.cos((angle * Math.PI) / 180) * distance
    const dy = Math.sin((angle * Math.PI) / 180) * distance
    // 靠近中心的变大(擦肩而过)，远离的变小
    const scale = Math.random() > 0.6 ? 3 + Math.random() : 0.1

    el.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`
    el.style.opacity = '0'
  })

  // 5. 星尘消失
  const dustParticles = splashContainer.value?.querySelectorAll('.dust-particle')
  dustParticles?.forEach((dust) => {
    ; (dust as HTMLElement).style.transition = 'opacity 1.5s ease-out'
      ; (dust as HTMLElement).style.opacity = '0'
  })

  // 6. 玻璃面板消失
  if (glassPanel.value) {
    glassPanel.value.style.transition = `opacity 0.5s ease-out ${warpDuration - 500}ms, transform ${warpDuration / 1000}s ease-in`
    glassPanel.value.style.opacity = '0'
    glassPanel.value.style.transform = 'scale(0.8)' // 稍微缩小，仿佛飞船远去
  }
}

// 等待数据预加载完成和最小显示时间后隐藏启动屏
onMounted(async () => {
  // 初始化Canvas星空
  initStarField()

  // 开始加载文字轮换
  loadingTextInterval = window.setInterval(() => {
    loadingTextIndex.value = (loadingTextIndex.value + 1) % loadingTexts.length
  }, 800) // 文字轮换慢一点

  const minDisplayTime = 2000 // 基础展示时间调整至2秒
  const startTime = Date.now()

  // 等待数据预加载完成
  const preloadPromise = window.__preloadPromise
  if (preloadPromise) {
    try {
      await preloadPromise
      console.log('[SplashScreen] Data preload finished')
    } catch (error) {
      console.error('[SplashScreen] Preload error:', error)
    }
  }

  // 如果禁用了过场动画，直接退出
  if (props.disabled) {
    visible.value = false
    setTimeout(() => {
      emit('finished')
    }, 500) // 等待淡出动画
    return
  }

  // 确保至少显示最小时间
  const elapsed = Date.now() - startTime
  const remaining = Math.max(0, minDisplayTime - elapsed)

  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining))
  }

  // 触发曲速跳跃效果
  triggerWarpDrive()

  // 等待曲速动画完成 (2.5s)
  await new Promise((resolve) => setTimeout(resolve, 2500))

  visible.value = false
  console.log('[SplashScreen] Hidden after', Date.now() - startTime, 'ms')

  // 等待淡出动画后通知父组件
  setTimeout(() => {
    emit('finished')
  }, 500)
})

onUnmounted(() => {
  if (loadingTextInterval) {
    clearInterval(loadingTextInterval)
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

// 暴露 visible 状态供父组件使用 (保留以兼容旧代码，虽然后续可能不再需要)
defineExpose({ visible })
</script>

<style lang="scss" scoped>
.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #000000;
}

// ==================== 第0层 - 深空底色与星云 ====================
.deep-space-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;

  .space-gradient {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 50%, #090a0f 0%, #000000 100%);
  }
}

.nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  animation: nebulaPulse 8s ease-in-out infinite;
  pointer-events: none;

  &.nebula-purple {
    width: 600px;
    height: 400px;
    top: -10%;
    right: -5%;
    background: radial-gradient(ellipse, rgba(168, 85, 247, 0.4) 0%, transparent 70%);
    animation-delay: 0s;
  }

  &.nebula-cyan {
    width: 500px;
    height: 350px;
    bottom: 10%;
    left: -10%;
    background: radial-gradient(ellipse, rgba(34, 211, 238, 0.3) 0%, transparent 70%);
    animation-delay: 2s;
  }

  &.nebula-green {
    width: 400px;
    height: 300px;
    top: 40%;
    left: 60%;
    background: radial-gradient(ellipse, rgba(74, 222, 128, 0.25) 0%, transparent 70%);
    animation-delay: 4s;
  }

  &.nebula-red {
    width: 350px;
    height: 250px;
    top: 60%;
    right: 20%;
    background: radial-gradient(ellipse, rgba(248, 113, 113, 0.2) 0%, transparent 70%);
    animation-delay: 6s;
  }
}

@keyframes nebulaPulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }

  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

// ==================== 第1层 - Canvas 粒子星空 ====================
.star-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
}

// ==================== 第2层 - 静态星尘闪烁 ====================
.star-dust {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.dust-particle {
  position: absolute;
  background: white;
  border-radius: 50%;
  animation: twinkle 3s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

@keyframes twinkle {

  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }

  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

// ==================== 第3层 - 赛博数字雨 ====================
.digital-rain {
  position: absolute;
  inset: 0;
  z-index: 3;
  overflow: hidden;
  pointer-events: none;
}

.rain-line {
  position: absolute;
  width: 2px;
  top: -200px;
  border-radius: 2px;
  animation: rainFall 2s linear infinite;
}

@keyframes rainFall {
  0% {
    transform: translateY(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(calc(100vh + 250px));
    opacity: 0;
  }
}

// ==================== 第4层 - 装饰性天体 ====================
.cosmic-planets {
  position: absolute;
  inset: 0;
  z-index: 4;
  pointer-events: none;
}

.planet {
  position: absolute;

  .planet-body {
    border-radius: 50%;
    position: relative;
    overflow: hidden;
  }

  .planet-glow {
    position: absolute;
    inset: -20%;
    border-radius: 50%;
    filter: blur(20px);
  }
}

// 主星 - 蓝紫色带星环
.main-planet {
  right: 5%;
  bottom: 10%;
  width: 180px;
  height: 180px;

  .planet-body {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 30%, #818cf8 0%, #4f46e5 50%, #1e1b4b 100%);
    box-shadow: inset -30px -20px 40px rgba(0, 0, 0, 0.6), inset 10px 10px 30px rgba(255, 255, 255, 0.1);
  }

  .planet-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 260px;
    height: 60px;
    border: 3px solid rgba(167, 139, 250, 0.5);
    border-radius: 50%;
    transform: translate(-50%, -50%) rotateX(75deg) rotateZ(-15deg);
    box-shadow: 0 0 20px rgba(167, 139, 250, 0.3);
  }

  .planet-glow {
    background: radial-gradient(ellipse, rgba(129, 140, 248, 0.4) 0%, transparent 70%);
  }
}

// 红巨星
.red-giant {
  left: 5%;
  top: 8%;
  width: 120px;
  height: 120px;

  .planet-body {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 35% 35%, #fca5a5 0%, #dc2626 40%, #7f1d1d 100%);
    box-shadow: inset -20px -15px 30px rgba(0, 0, 0, 0.5);
  }

  .planet-glow {
    background: radial-gradient(ellipse, rgba(248, 113, 113, 0.5) 0%, transparent 70%);
  }
}

// 毒气星
.toxic-planet {
  left: 15%;
  bottom: 25%;
  width: 80px;
  height: 80px;

  .planet-body {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 40% 40%, #86efac 0%, #22c55e 50%, #14532d 100%),
      repeating-conic-gradient(from 0deg, transparent 0deg, transparent 30deg, rgba(74, 222, 128, 0.3) 30deg, rgba(74, 222, 128, 0.3) 60deg);
    box-shadow: inset -15px -10px 20px rgba(0, 0, 0, 0.4);
  }

  .planet-glow {
    background: radial-gradient(ellipse, rgba(74, 222, 128, 0.4) 0%, transparent 70%);
  }
}

// 熔岩金星
.lava-planet {
  right: 20%;
  top: 15%;
  width: 50px;
  height: 50px;

  .planet-body {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 30%, #fef08a 0%, #eab308 50%, #78350f 100%);
    box-shadow: inset -10px -8px 15px rgba(0, 0, 0, 0.3);
  }

  .planet-glow {
    inset: -40%;
    background: radial-gradient(ellipse, rgba(251, 191, 36, 0.6) 0%, transparent 70%);
  }
}

// 冰霜世界
.ice-planet {
  left: 40%;
  top: 5%;
  width: 40px;
  height: 40px;

  .planet-body {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 35% 35%, #ffffff 0%, #a5f3fc 40%, #0891b2 100%);
    box-shadow: inset -8px -6px 12px rgba(0, 0, 0, 0.2);
  }
}

// 紫水晶星
.crystal-planet {
  right: 35%;
  bottom: 5%;
  width: 35px;
  height: 35px;

  .planet-body {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 30% 30%, #e9d5ff 0%, #a855f7 50%, #581c87 100%);
    box-shadow: inset -6px -5px 10px rgba(0, 0, 0, 0.3);
  }
}

// 小型陨石
.asteroid {
  position: absolute;
  background: linear-gradient(135deg, #525252 0%, #27272a 50%, #18181b 100%);
  box-shadow: inset -3px -2px 6px rgba(0, 0, 0, 0.5), inset 1px 1px 3px rgba(255, 255, 255, 0.1);

  &.asteroid-1 {
    width: 20px;
    height: 18px;
    top: 30%;
    right: 10%;
    border-radius: 40% 60% 50% 50%;
  }

  &.asteroid-2 {
    width: 15px;
    height: 12px;
    bottom: 40%;
    left: 25%;
    border-radius: 50% 40% 60% 50%;
  }

  &.asteroid-3 {
    width: 25px;
    height: 22px;
    top: 50%;
    left: 8%;
    border-radius: 60% 50% 40% 50%;
  }
}

// ==================== 玻璃拟态面板 ====================
.glass-panel {
  position: relative;
  z-index: 10;
  padding: 48px 64px;
  background: rgba(16, 20, 36, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);

  &.warp-shake {
    animation: warpShake 0.15s ease-in-out infinite;
  }
}

.panel-border {
  position: absolute;
  inset: -1px;
  border-radius: 25px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%);
  pointer-events: none;
  z-index: -1;
}

.energy-glow {
  position: absolute;
  inset: -4px;
  border-radius: 28px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  background: transparent;
  box-shadow: 0 0 30px rgba(34, 211, 238, 0.5), 0 0 60px rgba(34, 211, 238, 0.3), 0 0 90px rgba(34, 211, 238, 0.1),
    inset 0 0 30px rgba(34, 211, 238, 0.2);

  &.active {
    opacity: 1;
    animation: energyPulse 0.2s ease-in-out infinite;
  }
}

@keyframes warpShake {

  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }

  25% {
    transform: translate(-2px, 1px) rotate(-0.5deg);
  }

  50% {
    transform: translate(2px, -1px) rotate(0.5deg);
  }

  75% {
    transform: translate(-1px, -1px) rotate(-0.3deg);
  }
}

@keyframes energyPulse {

  0%,
  100% {
    box-shadow: 0 0 30px rgba(34, 211, 238, 0.5), 0 0 60px rgba(34, 211, 238, 0.3),
      0 0 90px rgba(34, 211, 238, 0.1), inset 0 0 30px rgba(34, 211, 238, 0.2);
  }

  50% {
    box-shadow: 0 0 40px rgba(34, 211, 238, 0.7), 0 0 80px rgba(34, 211, 238, 0.4),
      0 0 120px rgba(34, 211, 238, 0.2), inset 0 0 40px rgba(34, 211, 238, 0.3);
  }
}

.panel-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

// ==================== Logo ====================
.logo-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 32px;
}

.logo-icon {
  position: absolute;
  inset: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  .music-icon {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.5));
  }

  .note-circle {
    animation: noteBounce 1s ease-in-out infinite;

    &.delay {
      animation-delay: 0.2s;
    }
  }

  .note-stem,
  .note-beam {
    animation: noteGlow 1.5s ease-in-out infinite;

    &.delay {
      animation-delay: 0.3s;
    }
  }
}

@keyframes noteBounce {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
}

@keyframes noteGlow {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
  }
}

.logo-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(34, 211, 238, 0.4);
  border-radius: 50%;
  animation: ringExpand 2s ease-out infinite;

  &.delay-1 {
    animation-delay: 0.4s;
  }

  &.delay-2 {
    animation-delay: 0.8s;
  }
}

@keyframes ringExpand {
  0% {
    transform: scale(0.8);
    opacity: 1;
    border-color: rgba(34, 211, 238, 0.7);
  }

  100% {
    transform: scale(1.5);
    opacity: 0;
    border-color: rgba(34, 211, 238, 0);
  }
}

// ==================== 应用名称 ====================
.app-name {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 32px;
  display: flex;
  gap: 2px;
  font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;

  .char {
    display: inline-block;
    background: linear-gradient(180deg, #ffffff 0%, #a5f3fc 50%, #67e8f9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: charAppear 0.5s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
    text-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
  }
}

@keyframes charAppear {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ==================== 加载指示器 ====================
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.loading-bar {
  position: relative;
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.loading-progress {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #22d3ee 0%, #818cf8 50%, #a855f7 100%);
  border-radius: 2px;
  animation: loading 1.5s ease-in-out forwards;
}

.loading-glow {
  position: absolute;
  top: -2px;
  height: 8px;
  width: 60px;
  background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.8), transparent);
  animation: loadingGlow 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    width: 0%;
  }

  30% {
    width: 30%;
  }

  60% {
    width: 70%;
  }

  100% {
    width: 100%;
  }
}

@keyframes loadingGlow {
  0% {
    left: -60px;
  }

  100% {
    left: 200px;
  }
}

.loading-text {
  font-size: 0.929rem;
  color: rgba(165, 243, 252, 0.8);
  animation: textPulse 1s ease-in-out infinite;
  letter-spacing: 1px;
}

@keyframes textPulse {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

// ==================== 底部信息 ====================
.splash-footer {
  position: absolute;
  bottom: 24px;

  .version {
    font-size: 0.857rem;
    color: rgba(148, 163, 184, 0.5);
  }
}

// ==================== 淡出过渡 ====================
.warp-fade-leave-active {
  transition: opacity 0.4s ease-out;
}

.warp-fade-leave-to {
  opacity: 0;
}
</style>
