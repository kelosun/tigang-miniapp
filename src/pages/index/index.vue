<template>
  <view class="container">
    <view class="page-head">
      <view class="brand-block">
        <text class="brand-title">今天你提肛了吗</text>
        <text class="brand-subtitle">轻量盆底肌训练</text>
      </view>
    </view>

    <view class="notice-line" v-if="userStore.isLoggedIn">
      <text>已登录 · 数据自动同步 · 连续 {{ userStore.streakDays }} 天</text>
    </view>
    <view class="notice-line" v-else @click="navigateToProfile">
      <text>点击登录，同步训练数据</text>
    </view>

    <view class="user-panel" @click="navigateToProfile">
      <view v-if="showProfileUpdatedTip" class="profile-updated-tip">
        <text class="profile-updated-tip-text">资料已更新，首页已同步你的头像和昵称</text>
      </view>

      <view class="user-info">
        <image
          class="avatar"
          :src="userStore.displayAvatar"
          mode="aspectFill"
        />
        <view class="user-details">
          <text class="user-name">{{ userStore.displayName }}</text>
          <text class="user-status">
            {{ userStore.isLoggedIn ? `已连续打卡 ${userStore.streakDays} 天` : '点击登录，同步数据' }}
          </text>
        </view>
        <view class="member-tag">{{ userStore.isLoggedIn ? '已同步' : '登录' }}</view>
      </view>

      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ userStore.totalSessions }}</text>
          <text class="stat-label">训练次数</text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-value">{{ formatDuration(userStore.totalDuration) }}</text>
          <text class="stat-label">累计时长</text>
        </view>
      </view>
    </view>
    
    <view class="today-card">
      <view>
        <text class="today-title">今日锻炼</text>
        <text class="today-desc">建议保持短时、多次、稳定节奏</text>
      </view>
      <view class="today-value">
        <text class="today-number">{{ userStore.totalSessions }}</text>
        <text class="today-unit">次</text>
      </view>
    </view>

    <view class="modes-section">
      <view class="section-head">
        <text class="section-title">今天你提肛了吗</text>
        <text class="section-action">3 个模式</text>
      </view>
      
      <view class="modes-grid">
        <view 
          class="mode-card mode-normal"
          @click="selectMode('normal')"
        >
          <view class="mode-visual">
            <text class="mode-watermark">BASIC</text>
            <view class="mode-pulse mode-pulse-normal"></view>
          </view>
          <view class="mode-content">
            <view class="mode-title-row">
              <text class="mode-name">普通模式</text>
              <text class="mode-badge">免费</text>
            </view>
            <text class="mode-desc">适合新手入门</text>
            <text class="mode-duration">时长 {{ getModeDuration('normal') }}</text>
            <text class="mode-rhythm">收缩 3s · 放松 3s</text>
          </view>
          <button class="start-btn" @click.stop="selectMode('normal')">立即开始</button>
        </view>
        
        <view 
          class="mode-card mode-advanced"
          @click="selectMode('advanced')"
        >
          <view class="mode-visual">
            <text class="mode-watermark">ADVANCE</text>
            <view class="mode-pulse mode-pulse-advanced"></view>
          </view>
          <view class="mode-content">
            <view class="mode-title-row">
              <text class="mode-name">进阶模式</text>
              <text class="mode-badge">耐力</text>
            </view>
            <text class="mode-desc">提升肌肉耐力</text>
            <text class="mode-duration">时长 {{ getModeDuration('advanced') }}</text>
            <text class="mode-rhythm">收缩 5s · 放松 3s</text>
          </view>
          <button class="start-btn" @click.stop="selectMode('advanced')">立即开始</button>
        </view>
        
        <view 
          class="mode-card mode-king"
          @click="selectMode('king')"
        >
          <view class="mode-visual">
            <text class="mode-watermark">POWER</text>
            <view class="mode-pulse mode-pulse-king"></view>
          </view>
          <view class="mode-content">
            <view class="mode-title-row">
              <text class="mode-name">王者模式</text>
              <text class="mode-badge">挑战</text>
            </view>
            <text class="mode-desc">高强度挑战</text>
            <text class="mode-duration">时长 {{ getModeDuration('king') }}</text>
            <text class="mode-rhythm">收缩 5s · 放松 2s · 快缩 1s×3</text>
          </view>
          <button class="start-btn" @click.stop="selectMode('king')">立即开始</button>
        </view>
      </view>
    </view>
    
    <view class="footer-tip">
      <text class="tip-text">建议每日训练 2-3 次，每次 5-10 分钟</text>
    </view>

    <view class="bottom-nav">
      <view class="nav-item nav-active">
        <text class="nav-symbol">⌁</text>
        <text class="nav-text">锻炼</text>
      </view>
      <view class="nav-item" @click="navigateToProfile">
        <text class="nav-symbol">○</text>
        <text class="nav-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/store/user'
import { needsProfileCompletion } from '@/utils/user-profile'
import { TRAINING_MODES, formatElapsedSeconds } from '@/utils/training-session'

const userStore = useUserStore()
const hasPromptedProfileCompletion = ref(false)
const showProfileUpdatedTip = ref(false)

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`
}

const getModeDuration = (mode: 'normal' | 'advanced' | 'king') => {
  return formatElapsedSeconds(TRAINING_MODES[mode].totalSeconds)
}

const selectMode = (mode: 'normal' | 'advanced' | 'king') => {
  uni.navigateTo({
    url: `/pages/train/train?mode=${mode}`
  })
}

const navigateToProfile = () => {
  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '登录提示',
      content: '登录后可同步训练数据，查看历史记录',
      confirmText: '立即登录',
      success: (res) => {
        if (res.confirm) {
          handleLogin()
        }
      }
    })
  } else {
    uni.navigateTo({
      url: '/pages/profile/profile'
    })
  }
}

const promptProfileCompletion = () => {
  if (!userStore.isLoggedIn || !needsProfileCompletion(userStore.userInfo) || hasPromptedProfileCompletion.value) {
    return
  }

  hasPromptedProfileCompletion.value = true
  uni.showModal({
    title: '完善资料',
    content: '当前显示的是默认资料，去“我的”页确认头像和昵称后，首页会显示你的专属信息。',
    confirmText: '去完善',
    cancelText: '稍后再说',
    success: (res) => {
      if (res.confirm) {
        uni.navigateTo({
          url: '/pages/profile/profile'
        })
      }
    }
  })
}

const handleLogin = async () => {
  try {
    uni.showLoading({ title: '登录中...' })
    await userStore.login()
    uni.hideLoading()
    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500
    })
    // 强制刷新页面数据
    setTimeout(() => {
      uni.pageScrollTo({ scrollTop: 0 })
    }, 100)
    setTimeout(() => {
      promptProfileCompletion()
    }, 250)
  } catch (error: any) {
    uni.hideLoading()
    console.error('登录错误:', error)
    uni.showToast({
      title: error?.message || '登录失败',
      icon: 'none',
      duration: 2000
    })
  }
}

onShow(() => {
  const profileUpdated = uni.getStorageSync('profile_updated_once')
  if (profileUpdated) {
    uni.removeStorageSync('profile_updated_once')
    showProfileUpdatedTip.value = true
    setTimeout(() => {
      showProfileUpdatedTip.value = false
    }, 2500)
  }

  promptProfileCompletion()
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  box-sizing: border-box;
  background: #fbfaf8;
  padding: calc(env(safe-area-inset-top) + 44rpx) 28rpx 160rpx;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 22rpx;
}

.brand-block {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 40rpx;
  line-height: 1.2;
  font-weight: 800;
  color: #14202e;
}

.brand-subtitle {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #98a1ad;
}

.notice-line {
  font-size: 24rpx;
  color: #9aa2ad;
  margin-bottom: 26rpx;
}

.user-panel {
  background: #ffffff;
  border: 1rpx solid #edf0f2;
  border-radius: 8rpx;
  padding: 26rpx 28rpx;
  box-shadow: 0 14rpx 38rpx rgba(23, 31, 42, 0.05);
  margin-bottom: 24rpx;
}

.profile-updated-tip {
  background-color: #eefbf7;
  border-radius: 8rpx;
  padding: 16rpx 20rpx;
  margin-bottom: 22rpx;
}

.profile-updated-tip-text {
  display: block;
  font-size: 24rpx;
  color: #258b72;
  line-height: 1.5;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 28rpx;
}

.avatar {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  background-color: #f2f5f7;
  border: 4rpx solid #ffffff;
  box-shadow: 0 8rpx 18rpx rgba(22, 30, 42, 0.08);
}

.user-details {
  flex: 1;
  min-width: 0;
  margin-left: 22rpx;
}

.user-name {
  display: block;
  font-size: 34rpx;
  line-height: 1.25;
  font-weight: 800;
  color: #172232;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-status {
  display: block;
  font-size: 24rpx;
  color: #9aa2ad;
}

.member-tag {
  flex-shrink: 0;
  min-width: 92rpx;
  height: 48rpx;
  line-height: 48rpx;
  border-radius: 999rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #176b59;
  background: #dff8ee;
}

.stats-row {
  display: flex;
  align-items: center;
  background-color: #f8faf9;
  border-radius: 8rpx;
  padding: 26rpx 18rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: 36rpx;
  line-height: 1.2;
  font-weight: 800;
  color: #172232;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #99a2ad;
}

.stat-divider {
  width: 1rpx;
  height: 54rpx;
  background-color: #e7ecef;
  margin: 0 18rpx;
}

.today-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #182333;
  border-radius: 8rpx;
  padding: 30rpx 32rpx;
  margin-bottom: 54rpx;
  box-shadow: 0 18rpx 44rpx rgba(24, 35, 51, 0.12);
}

.today-title {
  display: block;
  font-size: 32rpx;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.today-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.66);
}

.today-value {
  display: flex;
  align-items: flex-end;
}

.today-number {
  font-size: 54rpx;
  line-height: 1;
  font-weight: 800;
  color: #ffc33d;
}

.today-unit {
  margin-left: 6rpx;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.72);
}

.modes-section {
  padding: 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 38rpx;
  line-height: 1.25;
  font-weight: 800;
  color: #172232;
}

.section-action {
  font-size: 24rpx;
  color: #9aa2ad;
}

.modes-grid {
  display: flex;
  flex-direction: column;
}

.mode-card {
  background-color: #ffffff;
  border-radius: 8rpx;
  overflow: hidden;
  border: 1rpx solid #edf0f2;
  box-shadow: 0 12rpx 34rpx rgba(22, 30, 42, 0.05);
  margin-bottom: 26rpx;

  &:active {
    transform: scale(0.98);
  }
}

.mode-normal {
  .start-btn {
    background: #ffc329;
    color: #172232;
  }
}

.mode-advanced {
  .start-btn {
    background: #50d7bd;
    color: #10241f;
  }
}

.mode-king {
  .start-btn {
    background: #ff826d;
    color: #ffffff;
  }
}

.mode-visual {
  position: relative;
  height: 220rpx;
  background: linear-gradient(135deg, #223044 0%, #111927 100%);
  overflow: hidden;
}

.mode-watermark {
  position: absolute;
  left: 28rpx;
  bottom: 16rpx;
  font-size: 92rpx;
  line-height: 1;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.12);
  letter-spacing: 0;
}

.mode-pulse {
  position: absolute;
  top: 46rpx;
  right: 56rpx;
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  border: 14rpx solid rgba(255, 255, 255, 0.32);
  box-shadow: 0 0 0 28rpx rgba(255, 255, 255, 0.06);
}

.mode-pulse-normal {
  border-color: rgba(255, 195, 41, 0.78);
  background: rgba(255, 195, 41, 0.1);
}

.mode-pulse-advanced {
  border-color: rgba(80, 215, 189, 0.78);
  background: rgba(80, 215, 189, 0.1);
}

.mode-pulse-king {
  border-color: rgba(255, 130, 109, 0.78);
  background: rgba(255, 130, 109, 0.1);
}

.mode-content {
  padding: 30rpx 30rpx 10rpx;
}

.mode-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.mode-name {
  font-size: 36rpx;
  line-height: 1.25;
  font-weight: 800;
  color: #172232;
}

.mode-badge {
  margin-left: 18rpx;
  padding: 6rpx 18rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
  color: #15966f;
  background: #ddf8eb;
}

.mode-desc {
  display: block;
  font-size: 26rpx;
  color: #66717f;
  margin-bottom: 12rpx;
}

.mode-duration {
  display: block;
  font-size: 25rpx;
  color: #172232;
  font-weight: 800;
  margin-bottom: 8rpx;
}

.mode-rhythm {
  display: block;
  font-size: 24rpx;
  color: #9aa2ad;
  line-height: 1.5;
}

.start-btn {
  width: 180rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 999rpx;
  padding: 0;
  margin: 10rpx 30rpx 30rpx auto;
  font-size: 26rpx;
  font-weight: 800;
}

.start-btn::after {
  border: none;
}

.footer-tip {
  margin: 8rpx 0 34rpx;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #8d97a3;
  background-color: #ffffff;
  padding: 18rpx 28rpx;
  border-radius: 999rpx;
  display: inline-block;
  border: 1rpx solid #edf0f2;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  height: 132rpx;
  padding-bottom: env(safe-area-inset-bottom);
  background: #ffffff;
  border-top: 1rpx solid #eef1f3;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.nav-item {
  min-width: 160rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #98a1ad;
}

.nav-active {
  color: #172232;
}

.nav-symbol {
  height: 42rpx;
  line-height: 42rpx;
  font-size: 42rpx;
  font-weight: 800;
}

.nav-text {
  margin-top: 8rpx;
  font-size: 22rpx;
  font-weight: 700;
}
</style>
