<template>
  <view class="train-container">
    <!-- 模式信息 -->
    <view class="mode-header">
      <text class="mode-title">{{ modeInfo.name }}</text>
      <text class="mode-subtitle">{{ modeInfo.desc }}</text>
    </view>
    
    <!-- 臀部时钟 -->
    <view class="clock-section">
      <view class="butt-clock" :class="[currentPhase, { active: isPlaying }]">
        <!-- 臀部轮廓 -->
        <svg class="butt-svg" viewBox="0 0 200 200">
          <!-- 左臀 -->
          <ellipse 
            class="butt-cheek left"
            :class="{ contracting: currentPhase === 'contract' }"
            cx="70" 
            cy="100" 
            rx="50" 
            ry="70"
            :style="buttStyle"
          />
          <!-- 右臀 -->
          <ellipse 
            class="butt-cheek right"
            :class="{ contracting: currentPhase === 'contract' }"
            cx="130" 
            cy="100" 
            rx="50" 
            ry="70"
            :style="buttStyle"
          />
          <!-- 中心线 -->
          <path 
            class="center-line"
            d="M 100 60 Q 100 100 100 140"
            stroke="rgba(255,255,255,0.6)"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
          />
        </svg>
        
        <!-- 阶段指示器 -->
        <view class="phase-indicator">
          <text class="phase-text">{{ phaseText }}</text>
          <text class="phase-timer">{{ formatTime(phaseTimeLeft) }}</text>
        </view>
      </view>
      
      <!-- 计数显示 -->
      <view class="counter-display">
        <text class="counter-label">本次训练</text>
        <view class="counter-value">
          <text class="count">{{ counter }}</text>
          <text class="count-unit">次</text>
        </view>
      </view>
    </view>
    
    <!-- 控制按钮组 -->
    <view class="controls-section">
      <view class="controls-row">
        <!-- 结束按钮 -->
        <button 
          class="control-btn secondary"
          @click="stopTraining"
        >
          <text class="btn-icon">⏹</text>
          <text class="btn-text">结束</text>
        </button>
        
        <!-- 播放/暂停按钮 -->
        <button 
          class="control-btn primary"
          :class="{ playing: isPlaying }"
          @click="togglePlay"
        >
          <text class="btn-icon-large">{{ isPlaying ? '⏸' : '▶' }}</text>
          <text class="btn-text">{{ isPlaying ? '暂停' : '开始' }}</text>
        </button>
        
        <!-- 指导按钮 -->
        <button 
          class="control-btn secondary"
          @click="showGuide"
        >
          <text class="btn-icon">📹</text>
          <text class="btn-text">指导</text>
        </button>
      </view>
      
      <!-- 进度条 -->
      <view class="progress-section" v-if="totalTime > 0">
        <text class="progress-label">训练进度</text>
        <progress 
          class="progress-bar"
          :percent="(elapsedTime / totalTime) * 100"
          activeColor="#4ECDC4"
          backgroundColor="#E5E7EB"
        />
        <text class="progress-time">{{ formatTime(elapsedTime) }} / {{ formatTime(totalTime) }}</text>
      </view>
    </view>
    
    <!-- 指导视频弹窗 -->
    <uni-modal 
      v-if="showGuideModal"
      title="动作指导"
      :show-cancel="false"
      @confirm="showGuideModal = false"
    >
      <view class="guide-content">
        <video 
          class="guide-video"
          src="/static/video/guide.mp4"
          :controls="true"
          :autoplay="true"
          :loop="true"
        />
        <view class="guide-tips">
          <text class="tip-item">✓ 保持自然呼吸，不要憋气</text>
          <text class="tip-item">✓ 收缩时感受肌肉收紧</text>
          <text class="tip-item">✓ 放松时完全放松肌肉</text>
          <text class="tip-item">✓ 找到正确的肌肉群</text>
        </view>
      </view>
    </uni-modal>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'uni-app/composables/router'
import { useUserStore } from '@/store/user'

const route = useRoute()
const userStore = useUserStore()

// 模式配置
const modeConfig = {
  normal: {
    name: '普通模式',
    contractTime: 3000,
    relaxTime: 3000,
    phases: ['contract', 'relax'] as const
  },
  advanced: {
    name: '进阶模式',
    contractTime: 5000,
    relaxTime: 3000,
    phases: ['contract', 'relax'] as const
  },
  king: {
    name: '王者模式',
    contractTime: 5000,
    relaxTime: 2000,
    quickContractTime: 1000,
    quickContractCount: 3,
    phases: ['contract', 'relax', 'quick-contract'] as const
  }
}

const mode = (route.query.mode as 'normal' | 'advanced' | 'king') || 'normal'
const modeInfo = modeConfig[mode]

// 状态
const isPlaying = ref(false)
const currentPhase = ref<'contract' | 'relax' | 'quick-contract'>('relax')
const phaseTimeLeft = ref(0)
const counter = ref(0)
const elapsedTime = ref(0)
const totalTime = ref(600) // 默认 10 分钟，单位秒
const showGuideModal = ref(false)

let timer: any = null
let phaseTimer: any = null
let tts: any = null

// 计算属性
const phaseText = computed(() => {
  switch (currentPhase.value) {
    case 'contract':
      return '收紧'
    case 'relax':
      return '放松'
    case 'quick-contract':
      return '快缩'
    default:
      return '准备'
  }
})

const buttStyle = computed(() => {
  if (currentPhase.value === 'contract' || currentPhase.value === 'quick-contract') {
    return {
      transform: 'scale(0.9)',
      transition: 'transform 0.3s ease'
    }
  }
  return {
    transform: 'scale(1)',
    transition: 'transform 0.3s ease'
  }
})

// TTS 语音
const speak = (text: string) => {
  if (tts) {
    tts.speak({
      text: text,
      success: () => {},
      fail: (err: any) => console.error('TTS 失败:', err)
    })
  } else {
    // 降级方案：使用 uni.playVoice
    uni.showToast({
      title: text,
      icon: 'none',
      duration: 2000
    })
  }
}

// 相位循环
const runPhase = () => {
  if (!isPlaying.value) return
  
  const phases = modeInfo.phases
  const currentIndex = phases.indexOf(currentPhase.value)
  const nextIndex = (currentIndex + 1) % phases.length
  const nextPhase = phases[nextIndex]
  
  // 更新计数
  if (currentPhase.value === 'contract') {
    counter.value += 1
  }
  
  // 切换到下一阶段
  currentPhase.value = nextPhase
  
  // 设置下一阶段时间
  switch (nextPhase) {
    case 'contract':
      phaseTimeLeft.value = modeInfo.contractTime
      speak('收紧臀部，保持呼吸')
      break
    case 'relax':
      phaseTimeLeft.value = modeInfo.relaxTime
      speak('放松，深呼吸')
      break
    case 'quick-contract':
      phaseTimeLeft.value = modeInfo.quickContractTime! * modeInfo.quickContractCount!
      speak('快速收缩，三次')
      break
  }
  
  // 倒计时
  phaseTimer = setInterval(() => {
    phaseTimeLeft.value -= 100
    if (phaseTimeLeft.value <= 0) {
      clearInterval(phaseTimer)
      runPhase()
    }
  }, 100)
}

// 开始/暂停
const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  
  if (isPlaying.value) {
    // 开始训练
    if (currentPhase.value === 'relax' && phaseTimeLeft.value === 0) {
      // 第一次开始
      currentPhase.value = 'contract'
      phaseTimeLeft.value = modeInfo.contractTime
      speak('准备，开始收紧')
      runPhase()
    } else {
      // 继续暂停
      runPhase()
    }
    
    // 总计时
    timer = setInterval(() => {
      elapsedTime.value += 1
      if (elapsedTime.value >= totalTime.value) {
        stopTraining()
      }
    }, 1000)
  } else {
    // 暂停
    clearInterval(timer)
    clearInterval(phaseTimer)
    speak('已暂停')
  }
}

// 结束训练
const stopTraining = () => {
  isPlaying.value = false
  clearInterval(timer)
  clearInterval(phaseTimer)
  
  // 保存训练数据
  if (elapsedTime.value > 0) {
    userStore.updateTrainStats(elapsedTime.value)
  }
  
  uni.showModal({
    title: '训练结束',
    content: `本次训练 ${counter.value} 次，时长 ${formatTime(elapsedTime.value)}`,
    showCancel: false,
    success: () => {
      uni.navigateBack()
    }
  })
}

// 显示指导
const showGuide = () => {
  showGuideModal.value = true
}

// 时间格式化
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 生命周期
onMounted(() => {
  // 初始化 TTS
  // @ts-ignore
  if (uni.createInnerAudioContext) {
    // 检查是否有 TTS 插件
    // @ts-ignore
    tts = uni.requireNativePlugin('tts')
  }
})

onUnmounted(() => {
  clearInterval(timer)
  clearInterval(phaseTimer)
})
</script>

<style lang="scss" scoped>
.train-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #E8F4F8 0%, #F5F7FA 100%);
  padding: $spacing-lg;
}

.mode-header {
  text-align: center;
  margin-bottom: $spacing-xl;
}

.mode-title {
  display: block;
  font-size: $font-2xl;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: $spacing-xs;
}

.mode-subtitle {
  display: block;
  font-size: $font-md;
  color: $text-secondary;
}

.clock-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-2xl;
}

.butt-clock {
  width: 400rpx;
  height: 400rpx;
  border-radius: $radius-full;
  background: linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 100%);
  box-shadow: $shadow-xl;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: $spacing-lg;
  
  &.active {
    box-shadow: 0 0 60rpx rgba($primary-color, 0.4);
  }
}

.butt-svg {
  width: 300rpx;
  height: 300rpx;
}

.butt-cheek {
  fill: #FFB6C1;
  transition: all 0.3s ease;
  
  &.contracting {
    fill: #FF9EAA;
  }
}

.center-line {
  opacity: 0.6;
}

.phase-indicator {
  position: absolute;
  bottom: 40rpx;
  text-align: center;
}

.phase-text {
  display: block;
  font-size: $font-lg;
  font-weight: 600;
  color: $white;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  margin-bottom: $spacing-xs;
}

.phase-timer {
  display: block;
  font-size: $font-2xl;
  font-weight: 700;
  color: $white;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.counter-display {
  background-color: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-lg $spacing-2xl;
  box-shadow: $shadow-md;
  text-align: center;
}

.counter-label {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-xs;
}

.counter-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.count {
  font-size: 80rpx;
  font-weight: 700;
  color: $primary-color;
  line-height: 1;
}

.count-unit {
  font-size: $font-lg;
  color: $text-regular;
  margin-left: $spacing-sm;
}

.controls-section {
  margin-bottom: $spacing-lg;
}

.controls-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-lg;
  margin-bottom: $spacing-lg;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: $white;
  border: none;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-lg;
  box-shadow: $shadow-md;
  transition: all $transition-normal;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.primary {
    width: 160rpx;
    height: 160rpx;
    border-radius: $radius-full;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    box-shadow: 0 8rpx 20rpx rgba($primary-color, 0.4);
    
    &.playing {
      background: linear-gradient(135deg, $accent-color 0%, #E57373 100%);
      box-shadow: 0 8rpx 20rpx rgba($accent-color, 0.4);
    }
  }
  
  &.secondary {
    width: 120rpx;
    height: 120rpx;
  }
}

.btn-icon {
  font-size: 40rpx;
  margin-bottom: $spacing-xs;
}

.btn-icon-large {
  font-size: 60rpx;
  margin-bottom: $spacing-xs;
}

.btn-text {
  font-size: $font-xs;
  color: $white;
  font-weight: 500;
}

.progress-section {
  background-color: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-md $spacing-lg;
  box-shadow: $shadow-sm;
}

.progress-label {
  display: block;
  font-size: $font-sm;
  color: $text-regular;
  margin-bottom: $spacing-sm;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
}

.progress-time {
  display: block;
  font-size: $font-xs;
  color: $text-secondary;
  text-align: right;
  margin-top: $spacing-xs;
}

.guide-content {
  padding: $spacing-md;
}

.guide-video {
  width: 100%;
  height: 400rpx;
  border-radius: $radius-md;
  margin-bottom: $spacing-md;
}

.guide-tips {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.tip-item {
  font-size: $font-sm;
  color: $text-regular;
}
</style>
