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

    <view v-if="userStore.isLoggedIn" class="profile-edit-card">
      <text class="edit-title">完善资料</text>
      <text class="edit-tip">微信现在需要你手动确认头像和昵称，保存后首页和个人页都会显示你设置的资料。</text>

      <!-- #ifdef MP-WEIXIN -->
      <button class="avatar-picker" open-type="chooseAvatar" @chooseavatar="handleChooseAvatar">
        <image class="avatar-preview" :src="profileForm.avatarUrl || userStore.displayAvatar" mode="aspectFill" />
        <text class="avatar-picker-text">点击更换头像</text>
      </button>

      <input
        class="nickname-input"
        type="nickname"
        :value="profileForm.nickName"
        placeholder="点击填写昵称"
        maxlength="20"
        @input="handleNicknameInput"
        @blur="handleNicknameInput"
      />
      <!-- #endif -->

      <!-- #ifndef MP-WEIXIN -->
      <image class="avatar-preview avatar-preview-static" :src="profileForm.avatarUrl || userStore.displayAvatar" mode="aspectFill" />
      <input
        class="nickname-input"
        :value="profileForm.nickName"
        placeholder="请输入昵称"
        maxlength="20"
        @input="handleNicknameInput"
        @blur="handleNicknameInput"
      />
      <!-- #endif -->

      <button class="save-profile-btn" :disabled="isSavingProfile" @click="handleSaveProfile">
        {{ isSavingProfile ? '保存中...' : '保存资料' }}
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
import { reactive, ref, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { DEFAULT_AVATAR, DEFAULT_NICKNAME } from '@/utils/user-profile'

const userStore = useUserStore()
const isSavingProfile = ref(false)
const profileForm = reactive({
  nickName: '',
  avatarUrl: ''
})

watch(
  () => userStore.userInfo,
  (userInfo) => {
    profileForm.nickName = userInfo?.nickName || ''
    profileForm.avatarUrl = userInfo?.avatarUrl || ''
  },
  { immediate: true }
)

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

const handleChooseAvatar = (event: any) => {
  const avatarUrl = event?.detail?.avatarUrl
  if (avatarUrl) {
    profileForm.avatarUrl = avatarUrl
  }
}

const handleNicknameInput = (event: any) => {
  profileForm.nickName = event?.detail?.value || ''
}

const uploadAvatarToCloud = async (filePath: string) => {
  if (!filePath || !filePath.startsWith('wxfile://')) {
    return filePath
  }

  const extension = filePath.split('.').pop() || 'png'
  const cloudPath = `avatars/${userStore.userInfo?.openid || 'anonymous'}-${Date.now()}.${extension}`
  const result = await wx.cloud.uploadFile({
    cloudPath,
    filePath
  })

  return result.fileID
}

const handleSaveProfile = async () => {
  const nickname = profileForm.nickName.trim()

  if (!nickname) {
    uni.showToast({
      title: '请先填写昵称',
      icon: 'none'
    })
    return
  }

  try {
    isSavingProfile.value = true
    uni.showLoading({ title: '保存中...' })

    const avatarUrl = await uploadAvatarToCloud(profileForm.avatarUrl || userStore.displayAvatar)
    const nextProfile = {
      nickName: nickname || DEFAULT_NICKNAME,
      avatarUrl: avatarUrl || userStore.displayAvatar || DEFAULT_AVATAR
    }

    userStore.setUserProfile(nextProfile)
    await userStore.syncProfileToCloud({
      ...userStore.userInfo,
      ...nextProfile
    })

    profileForm.nickName = nextProfile.nickName
    profileForm.avatarUrl = nextProfile.avatarUrl
    uni.setStorageSync('profile_updated_once', true)

    uni.hideLoading()
    uni.showToast({
      title: '资料已保存',
      icon: 'success'
    })

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }, 500)
  } catch (error) {
    uni.hideLoading()
    console.error('保存用户资料失败:', error)
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    })
  } finally {
    isSavingProfile.value = false
  }
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

.profile-edit-card {
  background-color: $card-bg;
  border-radius: $radius-xl;
  padding: $spacing-lg;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-lg;
}

.edit-title {
  display: block;
  font-size: $font-lg;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: $spacing-xs;
}

.edit-tip {
  display: block;
  font-size: $font-sm;
  color: $text-secondary;
  line-height: 1.6;
  margin-bottom: $spacing-lg;
}

.avatar-picker {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: $spacing-md;
  width: 100%;
  background-color: $bg-color;
  border-radius: $radius-lg;
  border: 2rpx dashed rgba($primary-color, 0.3);
  padding: $spacing-md;
  margin-bottom: $spacing-md;
}

.avatar-picker::after {
  border: none;
}

.avatar-preview {
  width: 112rpx;
  height: 112rpx;
  border-radius: $radius-full;
  background-color: $white;
  flex-shrink: 0;
}

.avatar-preview-static {
  display: block;
  margin: 0 auto $spacing-md;
}

.avatar-picker-text {
  font-size: $font-md;
  color: $text-primary;
}

.nickname-input {
  width: 100%;
  height: 88rpx;
  background-color: $bg-color;
  border-radius: $radius-lg;
  padding: 0 $spacing-md;
  box-sizing: border-box;
  font-size: $font-md;
  color: $text-primary;
  margin-bottom: $spacing-md;
}

.save-profile-btn {
  background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
  color: $white;
  border: none;
  border-radius: $radius-full;
  font-size: $font-md;
  font-weight: 600;
}

.save-profile-btn[disabled] {
  opacity: 0.7;
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
