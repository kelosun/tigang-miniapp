<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="profile-header">
      <image 
        class="avatar-large" 
        :src="userStore.displayAvatar" 
        mode="aspectFill"
      />
      <text class="user-name">{{ userStore.displayName }}</text>
      <text class="user-id" v-if="userStore.isLoggedIn">ID: {{ userStore.userInfo?.openid?.slice(-8) }}</text>
      
      <button 
        v-if="!userStore.isLoggedIn"
        class="login-btn"
        @click="handleLogin"
      >
        立即登录
      </button>
    </view>
    
    <!-- 统计数据 -->
    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-icon">📊</view>
        <view class="stat-content">
          <text class="stat-value">{{ userStore.totalSessions }}</text>
          <text class="stat-label">训练次数</text>
        </view>
      </view>
      
      <view class="stat-card">
        <view class="stat-icon">⏱</view>
        <view class="stat-content">
          <text class="stat-value">{{ formatDuration(userStore.totalDuration) }}</text>
          <text class="stat-label">累计时长</text>
        </view>
      </view>
      
      <view class="stat-card">
        <view class="stat-icon">🔥</view>
        <view class="stat-content">
          <text class="stat-value">{{ userStore.streakDays }}</text>
          <text class="stat-label">连续天数</text>
        </view>
      </view>
    </view>
    
    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-item" @click="showHistory">
        <text class="menu-icon">📅</text>
        <text class="menu-text">训练历史</text>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @click="showAchievements">
        <text class="menu-icon">🏆</text>
        <text class="menu-text">成就徽章</text>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @click="showSettings">
        <text class="menu-icon">⚙️</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @click="showFeedback">
        <text class="menu-icon">💬</text>
        <text class="menu-text">意见反馈</text>
        <text class="menu-arrow">›</text>
      </view>
      
      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
    
    <!-- 退出登录 -->
    <view class="logout-section" v-if="userStore.isLoggedIn">
      <button class="logout-btn" @click="handleLogout">
        退出登录
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`
}

const handleLogin = async () => {
  try {
    uni.showLoading({ title: '登录中...' })
    await userStore.login()
    uni.hideLoading()
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '登录失败',
      icon: 'none'
    })
  }
}

const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        uni.showToast({
          title: '已退出',
          icon: 'success'
        })
      }
    }
  })
}

const showHistory = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const showAchievements = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const showSettings = () => {
  uni.showToast({
    title: '功能开发中',
    icon: 'none'
  })
}

const showFeedback = () => {
  uni.showModal({
    title: '意见反馈',
    editable: true,
    placeholderText: '请输入您的建议或问题',
    success: (res) => {
      if (res.confirm && res.content) {
        // TODO: 提交反馈到云数据库
        uni.showToast({
          title: '感谢反馈',
          icon: 'success'
        })
      }
    }
  })
}

const showAbout = () => {
  uni.showModal({
    title: '关于提肛了',
    content: '版本：1.0.0\n\n提肛了是一款专注于盆底肌训练的健康小程序，帮助用户养成科学的提肛习惯。\n\n开发者：Sun',
    showCancel: false
  })
}
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background-color: $bg-color;
  padding: $spacing-lg;
}

.profile-header {
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  border-radius: $radius-xl;
  padding: $spacing-2xl $spacing-lg;
  text-align: center;
  margin-bottom: $spacing-lg;
  box-shadow: $shadow-lg;
}

.avatar-large {
  width: 160rpx;
  height: 160rpx;
  border-radius: $radius-full;
  border: 6rpx solid rgba(255, 255, 255, 0.8);
  background-color: $white;
  margin-bottom: $spacing-md;
}

.user-name {
  display: block;
  font-size: $font-xl;
  font-weight: 600;
  color: $white;
  margin-bottom: $spacing-xs;
}

.user-id {
  display: block;
  font-size: $font-xs;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: $spacing-md;
}

.login-btn {
  background-color: $white;
  color: $primary-color;
  border: none;
  border-radius: $radius-full;
  padding: $spacing-sm $spacing-2xl;
  font-size: $font-md;
  font-weight: 600;
  margin-top: $spacing-md;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-md;
  margin-bottom: $spacing-lg;
}

.stat-card {
  background-color: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  font-size: 40rpx;
  margin-bottom: $spacing-sm;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: $font-xl;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: $spacing-xs;
}

.stat-label {
  font-size: $font-xs;
  color: $text-secondary;
}

.menu-section {
  background-color: $card-bg;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-lg;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: $spacing-md $spacing-lg;
  border-bottom: 1rpx solid $border-light;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: $gray-50;
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: $spacing-md;
}

.menu-text {
  flex: 1;
  font-size: $font-md;
  color: $text-primary;
}

.menu-arrow {
  font-size: 40rpx;
  color: $gray-400;
}

.logout-section {
  text-align: center;
  padding-top: $spacing-lg;
}

.logout-btn {
  background-color: transparent;
  color: $text-secondary;
  border: 2rpx solid $border-color;
  border-radius: $radius-full;
  padding: $spacing-sm $spacing-2xl;
  font-size: $font-md;
}
</style>
