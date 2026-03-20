<template>
  <view class="container">
    <!-- 顶部个人信息区 -->
    <view class="header" @click="navigateToProfile">
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
        <view class="arrow-icon">›</view>
      </view>
      
      <!-- 统计数据 -->
      <view class="stats-row" v-if="userStore.isLoggedIn">
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
    
    <!-- 模式选择区 -->
    <view class="modes-section">
      <text class="section-title">选择训练模式</text>
      
      <view class="modes-grid">
        <!-- 普通模式 -->
        <view 
          class="mode-card mode-normal"
          @click="selectMode('normal')"
        >
          <view class="mode-icon">🌱</view>
          <text class="mode-name">普通模式</text>
          <text class="mode-desc">适合新手入门</text>
          <text class="mode-rhythm">收缩 3s · 放松 3s</text>
        </view>
        
        <!-- 进阶模式 -->
        <view 
          class="mode-card mode-advanced"
          @click="selectMode('advanced')"
        >
          <view class="mode-icon">🔥</view>
          <text class="mode-name">进阶模式</text>
          <text class="mode-desc">提升肌肉耐力</text>
          <text class="mode-rhythm">收缩 5s · 放松 3s</text>
        </view>
        
        <!-- 王者模式 -->
        <view 
          class="mode-card mode-king"
          @click="selectMode('king')"
        >
          <view class="mode-icon">👑</view>
          <text class="mode-name">王者模式</text>
          <text class="mode-desc">高强度挑战</text>
          <text class="mode-rhythm">收缩 5s · 放松 2s · 快缩 1s×3</text>
        </view>
      </view>
    </view>
    
    <!-- 底部提示 -->
    <view class="footer-tip">
      <text class="tip-text">💡 建议每日训练 2-3 次，每次 5-10 分钟</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${minutes}分${secs}秒` : `${minutes}分钟`
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
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F7FA 0%, #E8F4F8 100%);
  padding: 0;
}

.header {
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  padding: calc(env(safe-area-inset-top) + 88rpx) $spacing-lg $spacing-md;
  border-radius: 0 0 $radius-xl $radius-xl;
  box-shadow: $shadow-lg;
  margin-bottom: $spacing-md;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: $spacing-md;
  cursor: pointer;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: $radius-full;
  border: 3rpx solid rgba(255, 255, 255, 0.8);
  background-color: $white;
}

.user-details {
  flex: 1;
  margin-left: $spacing-md;
}

.user-name {
  display: block;
  font-size: $font-md;
  font-weight: 600;
  color: $white;
  margin-bottom: 2rpx;
}

.user-status {
  display: block;
  font-size: $font-xs;
  color: rgba(255, 255, 255, 0.9);
}

.arrow-icon {
  font-size: 40rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-left: $spacing-sm;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: $radius-md;
  padding: $spacing-sm $spacing-md;
  backdrop-filter: blur(10rpx);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-value {
  font-size: $font-xl;
  font-weight: 700;
  color: $white;
  margin-bottom: 2rpx;
}

.stat-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.stat-divider {
  width: 2rpx;
  height: 40rpx;
  background-color: rgba(255, 255, 255, 0.4);
  margin: 0 $spacing-md;
}

.modes-section {
  padding: 0 $spacing-lg;
}

.section-title {
  display: block;
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.modes-grid {
  display: grid;
  gap: $spacing-md;
}

.mode-card {
  background-color: $card-bg;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-shadow: $shadow-md;
  transition: all $transition-normal;
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
    box-shadow: $shadow-sm;
  }
}

.mode-normal {
  border-left: 6rpx solid $mode-normal;
  
  .mode-name {
    color: $mode-normal;
  }
}

.mode-advanced {
  border-left: 6rpx solid $mode-advanced;
  
  .mode-name {
    color: $mode-advanced;
  }
}

.mode-king {
  border-left: 6rpx solid $mode-king;
  
  .mode-name {
    color: $mode-king;
  }
}

.mode-icon {
  font-size: 48rpx;
  margin-bottom: $spacing-sm;
}

.mode-name {
  display: block;
  font-size: $font-lg;
  font-weight: 600;
  margin-bottom: $spacing-xs;
}

.mode-desc {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  margin-bottom: $spacing-sm;
}

.mode-rhythm {
  display: block;
  font-size: $font-xs;
  color: $text-placeholder;
  background-color: $gray-50;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  align-self: flex-start;
}

.footer-tip {
  margin-top: $spacing-2xl;
  padding: $spacing-lg;
  text-align: center;
}

.tip-text {
  font-size: $font-sm;
  color: $text-secondary;
  background-color: rgba($primary-color, 0.1);
  padding: $spacing-sm $spacing-md;
  border-radius: $radius-full;
  display: inline-block;
}
</style>
