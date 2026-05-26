<template>
  <view class="train-container">
    <!-- 模式信息 -->
    <view class="mode-header">
      <button class="train-back-btn" @click="handleBackNavigation">
        <text class="train-back-icon">‹</text>
      </button>
      <view class="mode-copy">
        <text class="mode-title">{{ modeInfo.name }}</text>
        <text class="mode-subtitle">{{ modeInfo.desc }}</text>
      </view>
      <view class="voice-pill">语音开</view>
    </view>

    <view class="voice-cue-slot">
      <text v-if="voiceCueText" class="voice-cue-text">{{ voiceCueText }}</text>
    </view>

    <!-- 训练计时器 -->
    <view class="clock-section">
      <view class="butt-clock" :class="[currentPhase, { active: isPlaying }]">
        <view class="butt-shape" aria-hidden="true">
          <view class="butt-figure">
            <image class="butt-outline-layer" src="/static/images/training-outline.svg" mode="aspectFit" />
            <image class="pelvic-muscle-layer" src="/static/images/training-muscle.svg" mode="aspectFit" />
          </view>
        </view>
      </view>

      <view class="training-time-panel">
        <view class="phase-indicator">
          <text class="phase-kicker">本次训练时间</text>
          <text class="phase-timer">{{ formatDuration(elapsedTime) }}</text>
          <view class="phase-meta-row">
            <view class="phase-status-pill">
              <text class="phase-badge">{{ phaseText }}</text>
              <text v-if="isPlaying" class="phase-countdown">{{ formatPhaseTime(phaseTimeLeft) }}</text>
              <text v-else class="phase-waiting">待开始</text>
            </view>
          </view>
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

    <view class="controls-section">
      <view class="controls-row">
        <button
          :class="endHoldProgress > 0 ? 'control-btn secondary end-control active' : 'control-btn secondary end-control'"
          @touchstart="startEndHold" @touchend="cancelEndHold" @touchcancel="cancelEndHold">
          <view :class="endHoldProgress > 0 ? 'hold-ring active' : 'hold-ring'"
            :style="endHoldProgress > 0 ? holdRingStyle : {}">
            <text class="btn-icon stop-icon">■</text>
          </view>
        </button>

        <button class="control-btn primary" :class="{ started: hasTrainingStarted, playing: isPlaying }"
          @click="togglePlay">
          <view v-if="isPlaying" class="pause-mark">
            <view class="pause-bar"></view>
            <view class="pause-bar"></view>
          </view>
          <text v-else class="btn-icon-large">▶</text>
        </button>

        <button class="control-btn secondary guide-control" @click="showGuide">
          <text class="btn-icon guide-icon">i</text>
        </button>
      </view>
    </view>

    <view v-if="showExitConfirmModal" class="exit-overlay">
      <view class="exit-card" @click.stop>
        <view class="exit-handle"></view>
        <text class="exit-title">结束本次训练？</text>
        <text class="exit-copy">当前训练正在进行。继续训练会回到计时，结束训练会保存已完成的时间和次数。</text>
        <view class="exit-actions">
          <button class="exit-btn secondary" @click="continueTraining">继续训练</button>
          <button class="exit-btn danger" @click="confirmExitTraining">结束训练</button>
        </view>
      </view>
    </view>

    <view v-if="showFinishModal" class="finish-overlay">
      <view class="finish-card">
        <view class="finish-mark">
          <text class="finish-mark-text">✓</text>
        </view>
        <text class="finish-title">训练完成</text>
        <text class="finish-subtitle">本次节奏已记录，保持稳定比一次练很久更重要</text>

        <view class="finish-stats">
          <view class="finish-stat">
            <text class="finish-value">{{ finishSummary.count }}</text>
            <text class="finish-label">完成次数</text>
          </view>
          <view class="finish-divider"></view>
          <view class="finish-stat">
            <text class="finish-value">{{ finishSummary.duration }}</text>
            <text class="finish-label">本次时长</text>
          </view>
        </view>

        <button class="finish-btn" @click="confirmFinish">返回首页</button>
      </view>
    </view>

    <!-- 指导视频弹窗 -->
    <view v-if="showGuideModal" class="modal-overlay" @click="showGuideModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">动作指导</text>
          <text class="modal-close" @click="showGuideModal = false">✕</text>
        </view>
        <view class="modal-body">
          <video class="guide-video" src="/static/video/guide.mp4" :controls="true" :autoplay="true" :loop="true" />
          <view class="guide-tips">
            <text class="tip-item">✓ 保持自然呼吸，不要憋气</text>
            <text class="tip-item">✓ 收缩时感受肌肉收紧</text>
            <text class="tip-item">✓ 放松时完全放松肌肉</text>
            <text class="tip-item">✓ 找到正确的肌肉群</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { onBackPress, onUnload } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import {
  TRAINING_MODES,
  advancePhase,
  createTrainingSession,
  formatElapsedSeconds,
  formatPhaseMilliseconds,
  getEndHoldProgress,
  getPhaseVoiceText,
  isEndHoldComplete,
  pauseTraining,
  shouldPromptBeforeLeavingTraining,
  startTraining,
  tickElapsedSecond,
  tickPhase
} from '@/utils/training-session';

const userStore = useUserStore()

let timer: any = null
let phaseTimer: any = null
let endHoldTimer: any = null
let endHoldStartTime = 0
let elapsedTimerBaseTime = 0
let elapsedTimerBaseSeconds = 0
const END_HOLD_REQUIRED_MS = 1200

const getModeFromUrl = () => {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    const currentPage = pages[pages.length - 1] as any
    return (currentPage.options?.mode as 'normal' | 'advanced' | 'king') || 'normal'
  }
  return 'normal'
}

const routeMode = getModeFromUrl()
const mode = TRAINING_MODES[routeMode] ? routeMode : 'normal'
const modeInfo = TRAINING_MODES[mode]
const session = ref(createTrainingSession(mode))
const showGuideModal = ref(false)
const showFinishModal = ref(false)
const showExitConfirmModal = ref(false)
const endHoldProgress = ref(0)
const voiceCueText = ref('')
const finishSummary = ref({
  count: 0,
  duration: '00:00'
})
let hasSavedCurrentSession = false
let allowPageLeave = false

const isPlaying = computed(() => session.value.isPlaying)
const currentPhase = computed(() => session.value.currentPhase)
const phaseTimeLeft = computed(() => session.value.phaseTimeLeftMs)
const counter = computed(() => session.value.counter)
const elapsedTime = computed(() => session.value.elapsedSeconds)
const hasTrainingStarted = computed(() => currentPhase.value !== 'ready' || elapsedTime.value > 0)
const holdRingStyle = computed(() => ({
  background: `conic-gradient(#ff826d ${endHoldProgress.value}%, #eef1f3 ${endHoldProgress.value}% 100%)`
}))
const endHoldLabel = computed(() => (endHoldProgress.value > 0 ? `${endHoldProgress.value}%` : '长按'))

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

const speak = (text: string) => {
  voiceCueText.value = text
}

const clearTimers = () => {
  clearInterval(timer)
  clearInterval(phaseTimer)
  timer = null
  phaseTimer = null
  elapsedTimerBaseTime = 0
  elapsedTimerBaseSeconds = session.value.elapsedSeconds
}

const clearEndHold = () => {
  clearInterval(endHoldTimer)
  endHoldTimer = null
  endHoldStartTime = 0
  endHoldProgress.value = 0
}

const runPhaseTimer = () => {
  clearInterval(phaseTimer)
  phaseTimer = setInterval(() => {
    if (!session.value.isPlaying) return

    const tickedSession = tickPhase(session.value, 100)
    if (tickedSession.phaseTimeLeftMs > 0) {
      session.value = tickedSession
      return
    }

    session.value = advancePhase(tickedSession)
    speak(getPhaseVoiceText(session.value.currentPhase))
  }, 100)
}

const runElapsedTimer = () => {
  clearInterval(timer)
  elapsedTimerBaseTime = Date.now()
  elapsedTimerBaseSeconds = session.value.elapsedSeconds

  timer = setInterval(() => {
    if (!session.value.isPlaying) return

    const measuredElapsedSeconds = elapsedTimerBaseSeconds + Math.floor((Date.now() - elapsedTimerBaseTime) / 1000)
    const deltaSeconds = measuredElapsedSeconds - session.value.elapsedSeconds
    if (deltaSeconds <= 0) return

    session.value = tickElapsedSecond(session.value, deltaSeconds)
    if (session.value.elapsedSeconds >= session.value.totalSeconds) {
      stopTraining()
    }
  }, 200)
}

const togglePlay = () => {
  if (session.value.isPlaying) {
    session.value = pauseTraining(session.value)
    clearTimers()
    speak('已暂停')
    return
  }

  session.value = startTraining(session.value)
  speak(getPhaseVoiceText(session.value.currentPhase))
  runPhaseTimer()
  runElapsedTimer()
}

const stopTraining = () => {
  if (showFinishModal.value) return

  session.value = pauseTraining(session.value)
  clearTimers()
  voiceCueText.value = ''

  if (session.value.elapsedSeconds > 0 && !hasSavedCurrentSession) {
    userStore.updateTrainStats(session.value.elapsedSeconds)
    hasSavedCurrentSession = true
  }

  finishSummary.value = {
    count: session.value.counter,
    duration: formatDuration(session.value.elapsedSeconds)
  }
  showFinishModal.value = true
}

const startEndHold = () => {
  if (showFinishModal.value) return

  clearInterval(endHoldTimer)
  endHoldStartTime = Date.now()
  endHoldProgress.value = 0
  endHoldTimer = setInterval(() => {
    const heldMs = Date.now() - endHoldStartTime
    endHoldProgress.value = getEndHoldProgress(heldMs, END_HOLD_REQUIRED_MS)

    if (isEndHoldComplete(heldMs, END_HOLD_REQUIRED_MS)) {
      clearEndHold()
      stopTraining()
    }
  }, 40)
}

const cancelEndHold = () => {
  if (!endHoldTimer) return
  clearEndHold()
}

const showGuide = () => {
  showGuideModal.value = true
}

const confirmFinish = () => {
  allowPageLeave = true
  showFinishModal.value = false
  uni.reLaunch({
    url: '/pages/index/index'
  })
}

const leaveTrainingPage = () => {
  allowPageLeave = true
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  })
}

const requestExitTraining = () => {
  if (showFinishModal.value) return true
  if (!shouldPromptBeforeLeavingTraining(session.value)) return false
  showGuideModal.value = false
  showExitConfirmModal.value = true
  return true
}

const handleBackNavigation = () => {
  if (requestExitTraining()) return
  leaveTrainingPage()
}

const continueTraining = () => {
  showExitConfirmModal.value = false
}

const confirmExitTraining = () => {
  showExitConfirmModal.value = false
  stopTraining()
}

const formatPhaseTime = (ms: number) => formatPhaseMilliseconds(ms)
const formatDuration = (seconds: number) => formatElapsedSeconds(seconds)

onBackPress(() => {
  if (allowPageLeave) return false
  return requestExitTraining()
})

onUnload(() => {
  if (!allowPageLeave && session.value.elapsedSeconds > 0 && !hasSavedCurrentSession) {
    userStore.updateTrainStats(session.value.elapsedSeconds)
    hasSavedCurrentSession = true
  }
})

onUnmounted(() => {
  clearTimers()
  clearEndHold()
})
</script>

<style lang="scss" scoped>
.train-container {
  min-height: 100vh;
  background: #fbfaf8;
  padding: calc(env(safe-area-inset-top) + 18rpx) 32rpx calc(env(safe-area-inset-bottom) + 48rpx);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.mode-header {
  display: grid;
  grid-template-columns: 96rpx 1fr 132rpx;
  align-items: start;
  min-height: 104rpx;
  margin-bottom: 8rpx;
}

.train-back-btn {
  grid-column: 1;
  justify-self: start;
  width: 72rpx;
  height: 72rpx;
  line-height: 72rpx;
  padding: 0;
  border-radius: 50%;
  background: #ffffff;
  border: 1rpx solid #edf0f2;
  box-shadow: 0 8rpx 22rpx rgba(22, 30, 42, 0.06);
}

.train-back-btn::after {
  border: none;
}

.train-back-icon {
  display: block;
  color: #172232;
  font-size: 58rpx;
  line-height: 66rpx;
  font-weight: 500;
}

.mode-copy {
  grid-column: 2;
  text-align: center;
  min-width: 0;
}

.mode-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #172232;
  margin-bottom: $spacing-xs;
}

.mode-subtitle {
  display: block;
  font-size: 24rpx;
  color: #98a1ad;
}

.voice-pill {
  justify-self: end;
  grid-column: 3;
  margin-top: 64rpx;
  min-width: 112rpx;
  height: 58rpx;
  line-height: 58rpx;
  border-radius: $radius-full;
  background-color: #fff4cc;
  color: #9a6a00;
  font-size: 26rpx;
  font-weight: 600;
  text-align: center;
}

.voice-cue-slot {
  height: 52rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 18rpx;
  box-sizing: border-box;
}

.voice-cue-text {
  max-width: 520rpx;
  min-height: 52rpx;
  line-height: 52rpx;
  padding: 0 38rpx;
  border-radius: 999rpx;
  background: #17342f;
  color: #e9fff8;
  font-size: 30rpx;
  font-weight: 800;
  text-align: center;
  box-shadow: 0 14rpx 30rpx rgba(22, 185, 157, 0.18);
}

.exit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1150;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 28rpx calc(env(safe-area-inset-bottom) + 28rpx);
  background: rgba(16, 27, 40, 0.46);
  box-sizing: border-box;
}

.exit-card {
  width: 100%;
  background: #ffffff;
  border-radius: 22rpx;
  padding: 26rpx 34rpx 32rpx;
  box-shadow: 0 28rpx 86rpx rgba(11, 18, 32, 0.22);
  box-sizing: border-box;
}

.exit-handle {
  width: 72rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #dde3e8;
  margin: 0 auto 26rpx;
}

.exit-title {
  display: block;
  font-size: 38rpx;
  font-weight: 900;
  color: #172232;
  margin-bottom: 14rpx;
  text-align: center;
}

.exit-copy {
  display: block;
  font-size: 26rpx;
  color: #6f7a88;
  line-height: 1.7;
  text-align: center;
  margin-bottom: 30rpx;
}

.exit-actions {
  display: flex;
  gap: 18rpx;
}

.exit-btn {
  flex: 1;
  height: 82rpx;
  line-height: 82rpx;
  border-radius: 999rpx;
  padding: 0;
  font-size: 27rpx;
  font-weight: 800;
}

.exit-btn::after {
  border: none;
}

.exit-btn.secondary {
  background: #f1f4f6;
  color: #334155;
}

.exit-btn.danger {
  background: #ff826d;
  color: #ffffff;
}

.clock-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 28rpx;
  margin-bottom: 24rpx;
}

.butt-clock {
  width: 520rpx;
  height: 350rpx;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8rpx;
  transition: transform $transition-normal, box-shadow $transition-normal;

  &.active {
    transform: translateY(-2rpx);
  }

  &.relax,
  &.ready {
    .pelvic-muscle-layer {
      transform: translateY(10px) scaleX(1.02) scaleY(0.96);
    }
  }

  &.contract,
  &.quick-contract {
    .pelvic-muscle-layer {
      transform: translateY(-18px) scaleX(0.78) scaleY(1.08);
    }
  }
}

.butt-shape {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 520rpx;
  height: 350rpx;
  transform: translate(-50%, -50%);
}

.butt-figure {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 440rpx;
  height: 440rpx;
  transform: translate(-50%, -50%);
}

.butt-outline-layer,
.pelvic-muscle-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 440rpx;
  height: 440rpx;
}

.butt-outline-layer {
  opacity: 0.94;
}

.pelvic-muscle-layer {
  transform-origin: center;
  transition: transform 0.42s ease;
}

.training-time-panel {
  width: 100%;
  text-align: center;
  margin-bottom: 18rpx;
}

.phase-indicator {
  text-align: center;
}

.phase-kicker {
  display: block;
  font-size: 25rpx;
  color: #8c96a3;
  margin-bottom: 8rpx;
  font-weight: 600;
}

.phase-timer {
  display: block;
  font-size: 72rpx;
  font-weight: 700;
  color: #172232;
  line-height: 1;
}

.phase-meta-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  margin-top: 24rpx;
}

.phase-status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  min-width: 220rpx;
  height: 46rpx;
}

.phase-badge {
  width: 86rpx;
  height: 46rpx;
  line-height: 46rpx;
  padding: 0;
  border-radius: 999rpx;
  background: #ffc329;
  color: #172232;
  font-size: 28rpx;
  font-weight: 900;
  text-align: center;
}

.phase-countdown {
  width: 96rpx;
  height: 46rpx;
  line-height: 46rpx;
  color: #788391;
  font-size: 26rpx;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  text-align: left;
}

.phase-waiting {
  height: 46rpx;
  line-height: 46rpx;
  padding: 0 22rpx;
  color: #788391;
  font-size: 26rpx;
  font-weight: 700;
  text-align: center;
  box-sizing: border-box;
}

.counter-display {
  background-color: $white;
  border-radius: 14rpx;
  padding: 22rpx 58rpx;
  margin-top: 36rpx;
  box-shadow: 0 12rpx 30rpx rgba(15, 23, 42, 0.12);
  text-align: center;
}

.counter-label {
  display: block;
  font-size: 26rpx;
  color: #7d8794;
  margin-bottom: 6rpx;
}

.counter-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.count {
  font-size: 64rpx;
  font-weight: 700;
  color: #ffc329;
  line-height: 1;
}

.count-unit {
  font-size: 30rpx;
  color: #596474;
  margin-left: 10rpx;
}

.controls-section {
  margin-top: auto;
  padding: 18rpx 8rpx calc(env(safe-area-inset-bottom) + 24rpx);
  overflow: visible;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 18rpx;
  min-height: 216rpx;
}

.control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: $radius-full;
  padding: 0;
  box-shadow: none;
  box-sizing: border-box;
  line-height: 1;
  overflow: visible;
  transition: all $transition-normal;

  &:active {
    transform: scale(0.95);
  }

  &.primary {
    width: 166rpx;
    height: 166rpx;
    border-radius: $radius-full;
    background: #fff4f2;
    box-shadow: 0 18rpx 38rpx rgba(217, 75, 61, 0.1);

    &.started,
    &.playing {
      background: #ffc329;
      box-shadow: 0 18rpx 38rpx rgba(255, 195, 41, 0.28);
    }

    &.playing {
      background: #ffc329;
      box-shadow: 0 18rpx 38rpx rgba(255, 195, 41, 0.28);
    }
  }

  &.secondary {
    width: 160rpx;
    min-height: 168rpx;
    background: transparent;
  }
}

.control-btn::after {
  border: none;
}

.btn-icon {
  width: 70rpx;
  height: 70rpx;
  line-height: 70rpx;
  border-radius: $radius-full;
  border: none;
  color: #202b38;
  font-size: 34rpx;
  text-align: center;
  background: #ffffff;
}

.hold-ring {
  width: 92rpx;
  height: 92rpx;
  border-radius: $radius-full;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
  margin-bottom: 12rpx;
  background: transparent;
  transition: width 0.18s ease, height 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.hold-ring.active {
  padding: 8rpx;
  box-shadow: 0 14rpx 30rpx rgba(255, 130, 109, 0.14);
}

.stop-icon {
  font-size: 28rpx;
  color: #d94b3d;
  background: #fff4f2;
  box-shadow: 0 12rpx 26rpx rgba(217, 75, 61, 0.08);
}

.guide-icon {
  font-size: 44rpx;
  font-weight: 700;
  box-shadow: 0 12rpx 26rpx rgba(24, 35, 51, 0.08);
}

.btn-icon-large {
  font-size: 66rpx;
  margin-bottom: 8rpx;
  color: #d94b3d;
  line-height: 1;
}

.primary.started .btn-icon-large {
  color: #172232;
}

.pause-mark {
  width: 72rpx;
  height: 72rpx;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18rpx;
}

.pause-bar {
  width: 12rpx;
  height: 52rpx;
  border-radius: 999rpx;
  background: #172232;
}

.btn-text {
  font-size: 26rpx;
  color: #8e98a7;
  font-weight: 600;
}

.primary .btn-text {
  color: #172232;
}

.hold-hint {
  display: block;
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #b0bac5;
  line-height: 1;
  min-height: 22rpx;
}

.end-control,
.guide-control {
  justify-content: center;
}

.end-control.active {
  transform: translateY(-14rpx) scale(1.08);
}

.end-control.active .hold-ring {
  width: 118rpx;
  height: 118rpx;
  box-shadow: 0 20rpx 42rpx rgba(255, 130, 109, 0.28);
}

.end-control.active .btn-icon {
  width: 88rpx;
  height: 88rpx;
  line-height: 88rpx;
}

.guide-control .btn-icon {
  margin-bottom: 14rpx;
}

.end-control .btn-text,
.guide-control .btn-text {
  color: #596474;
}

.finish-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 44rpx;
  background: rgba(16, 27, 40, 0.48);
  box-sizing: border-box;
}

.finish-card {
  width: 100%;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 44rpx 36rpx 36rpx;
  box-sizing: border-box;
  text-align: center;
  box-shadow: 0 30rpx 90rpx rgba(11, 18, 32, 0.22);
}

.finish-mark {
  width: 108rpx;
  height: 108rpx;
  border-radius: $radius-full;
  background: #ffc329;
  margin: 0 auto 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 34rpx rgba(255, 195, 41, 0.26);
}

.finish-mark-text {
  color: #172232;
  font-size: 58rpx;
  line-height: 1;
  font-weight: 800;
}

.finish-title {
  display: block;
  font-size: 42rpx;
  font-weight: 800;
  color: #172232;
  margin-bottom: 14rpx;
}

.finish-subtitle {
  display: block;
  font-size: 25rpx;
  line-height: 1.6;
  color: #8b95a1;
  margin-bottom: 30rpx;
}

.finish-stats {
  display: flex;
  align-items: center;
  background: #f7faf9;
  border-radius: 12rpx;
  padding: 28rpx 12rpx;
  margin-bottom: 34rpx;
}

.finish-stat {
  flex: 1;
  min-width: 0;
}

.finish-value {
  display: block;
  font-size: 38rpx;
  font-weight: 800;
  color: #172232;
  margin-bottom: 8rpx;
}

.finish-label {
  display: block;
  font-size: 22rpx;
  color: #8b95a1;
}

.finish-divider {
  width: 1rpx;
  height: 58rpx;
  background: #e3e8ec;
}

.finish-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 999rpx;
  background: #182333;
  color: $white;
  font-size: 28rpx;
  font-weight: 800;
  padding: 0;
}

.finish-btn::after {
  border: none;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: $white;
  border-radius: $radius-lg;
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: $shadow-xl;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: $spacing-lg;
  border-bottom: 1rpx solid $border-light;
}

.modal-title {
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
}

.modal-close {
  font-size: 40rpx;
  color: $text-secondary;
  cursor: pointer;
  padding: $spacing-xs;
}

.modal-body {
  padding: $spacing-lg;
}
</style>
