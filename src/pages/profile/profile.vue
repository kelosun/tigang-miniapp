<template>
  <view class="profile-container">
    <view class="profile-header">
      <view class="profile-main">
        <view class="avatar-wrap">
          <image
            class="avatar-large"
            :src="userStore.displayAvatar"
            mode="aspectFill"
          />
          <text class="vip-mark">{{ userStore.isLoggedIn ? 'VIP' : '未登' }}</text>
        </view>

        <view class="profile-copy">
          <view class="name-row">
            <text class="user-name">{{ userStore.displayName }}</text>
            <text class="member-badge" v-if="userStore.isLoggedIn">会员</text>
          </view>
          <text class="user-id" v-if="userStore.isLoggedIn">ID: {{ userStore.userInfo?.openid?.slice(-8) }}</text>
          <text class="user-id" v-else>登录后同步训练数据</text>
        </view>
      </view>

      <button
        v-if="userStore.isLoggedIn"
        class="edit-profile-entry"
        @click="openProfileEditor"
      >
        编辑资料
      </button>

      <button
        v-if="!userStore.isLoggedIn"
        class="login-btn"
        @click="handleLogin"
      >
        立即登录
      </button>
    </view>

    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-content">
          <text class="stat-value">{{ userStore.totalSessions }}</text>
          <text class="stat-label">训练次数</text>
        </view>
      </view>

      <view class="stat-card">
        <view class="stat-content">
          <text class="stat-value">{{ formatDuration(userStore.totalDuration) }}</text>
          <text class="stat-label">累计时长</text>
        </view>
      </view>

      <view class="stat-card">
        <view class="stat-content">
          <text class="stat-value">{{ userStore.streakDays }}</text>
          <text class="stat-label">连续天数</text>
        </view>
      </view>
    </view>

    <view class="menu-section">
      <view class="menu-title-row">
        <text class="menu-title">更多服务</text>
      </view>

      <view class="menu-item" @click="showHistory">
        <text class="menu-icon">历</text>
        <text class="menu-text">训练历史</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="showAchievements">
        <text class="menu-icon">章</text>
        <text class="menu-text">成就徽章</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="showSettings">
        <text class="menu-icon">设</text>
        <text class="menu-text">设置</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="showFeedback">
        <text class="menu-icon">馈</text>
        <text class="menu-text">意见反馈</text>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="showAbout">
        <text class="menu-icon">关</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="logout-section" v-if="userStore.isLoggedIn">
      <button class="logout-btn" @click="handleLogout">
        退出登录
      </button>
    </view>

    <view v-if="userStore.isLoggedIn && showLogoutConfirmModal" class="sheet-overlay" @click="cancelLogout">
      <view class="logout-confirm-card sheet-card" @click.stop>
        <view class="sheet-handle"></view>
        <text class="logout-confirm-title">退出登录？</text>
        <text class="logout-confirm-copy">退出后本机将切换为未登录状态，已同步的数据仍会保留在账号中。</text>
        <view class="logout-confirm-actions">
          <button class="logout-confirm-btn secondary" @click="cancelLogout">取消</button>
          <button class="logout-confirm-btn danger" @click="confirmLogout">退出登录</button>
        </view>
      </view>
    </view>

    <view v-if="userStore.isLoggedIn && showProfileEditor" class="sheet-overlay" @click="closeProfileEditor">
      <view class="profile-edit-card sheet-card" @click.stop>
        <button class="sheet-close" @click="closeProfileEditor">×</button>
        <view class="sheet-handle"></view>
        <view class="card-head">
          <text class="edit-title">编辑资料</text>
        </view>
        <text class="edit-tip">头像和昵称会同步显示在首页与个人中心。</text>

        <!-- #ifdef MP-WEIXIN -->
        <button class="avatar-picker" open-type="chooseAvatar" @chooseavatar="handleChooseAvatar">
          <image class="avatar-preview" :src="profileForm.avatarUrl || userStore.displayAvatar" mode="aspectFill" />
          <view class="avatar-picker-copy">
            <text class="avatar-picker-text">更换头像</text>
            <text class="avatar-picker-sub">使用微信头像或重新选择</text>
          </view>
          <text class="picker-arrow">›</text>
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
    </view>

    <view v-if="showFeedbackModal" class="sheet-overlay" @click="closeFeedback">
      <view class="feedback-card sheet-card" @click.stop>
        <button class="sheet-close" @click="closeFeedback">×</button>
        <view class="sheet-handle"></view>
        <view class="card-head">
          <text class="edit-title">意见反馈</text>
        </view>
        <text class="edit-tip">告诉我们哪里不好用，或你希望增加什么训练功能。</text>
        <textarea
          class="feedback-input"
          :value="feedbackContent"
          placeholder="请输入你的建议或问题"
          maxlength="300"
          @input="handleFeedbackInput"
        />
        <button class="save-profile-btn" @click="submitFeedback">提交反馈</button>
      </view>
    </view>

    <view v-if="showAboutModal" class="sheet-overlay" @click="closeAbout">
      <view class="about-card sheet-card" @click.stop>
        <button class="sheet-close" @click="closeAbout">×</button>
        <view class="sheet-handle"></view>
        <view class="about-logo">提</view>
        <text class="about-title">关于提肛了</text>
        <text class="about-version">版本 1.0.0</text>
        <text class="about-copy">专注盆底肌训练的轻量小程序，帮助用户用短时、稳定、可持续的方式建立训练习惯。</text>
        <view class="about-note">
          <text>如训练中出现不适，请立即停止并咨询专业医生。</text>
        </view>
        <button class="save-profile-btn" @click="closeAbout">知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useUserStore } from '@/store/user'
import { DEFAULT_AVATAR, DEFAULT_NICKNAME } from '@/utils/user-profile'

const userStore = useUserStore()
const isSavingProfile = ref(false)
const showProfileEditor = ref(false)
const showFeedbackModal = ref(false)
const showAboutModal = ref(false)
const showLogoutConfirmModal = ref(false)
const feedbackContent = ref('')
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
  showLogoutConfirmModal.value = true
}

const cancelLogout = () => {
  showLogoutConfirmModal.value = false
}

const confirmLogout = () => {
  showLogoutConfirmModal.value = false
  userStore.logout()
  uni.showToast({
    title: '已退出',
    icon: 'success'
  })
}

const openProfileEditor = () => {
  showProfileEditor.value = true
}

const closeProfileEditor = () => {
  if (isSavingProfile.value) return
  showProfileEditor.value = false
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

    showProfileEditor.value = false

    setTimeout(() => {
      uni.reLaunch({
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
  feedbackContent.value = ''
  showFeedbackModal.value = true
}

const closeFeedback = () => {
  showFeedbackModal.value = false
}

const handleFeedbackInput = (event: any) => {
  feedbackContent.value = event?.detail?.value || ''
}

const submitFeedback = () => {
  if (!feedbackContent.value.trim()) {
    uni.showToast({
      title: '请先填写反馈内容',
      icon: 'none'
    })
    return
  }

  // TODO: 提交反馈到云数据库
  showFeedbackModal.value = false
  uni.showToast({
    title: '感谢反馈',
    icon: 'success'
  })
}

const showAbout = () => {
  showAboutModal.value = true
}

const closeAbout = () => {
  showAboutModal.value = false
}
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  box-sizing: border-box;
  background: #fbfaf8;
  padding: 28rpx 28rpx calc(env(safe-area-inset-bottom) + 40rpx);
}

.profile-header {
  background: #ffffff;
  border: 1rpx solid #edf0f2;
  border-radius: 8rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 14rpx 38rpx rgba(23, 31, 42, 0.05);
}

.profile-main {
  display: flex;
  align-items: center;
}

.avatar-wrap {
  position: relative;
  width: 112rpx;
  height: 112rpx;
  flex-shrink: 0;
}

.avatar-large {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background-color: #f2f5f7;
  border: 4rpx solid #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(22, 30, 42, 0.08);
}

.vip-mark {
  position: absolute;
  left: 50%;
  bottom: -12rpx;
  transform: translateX(-50%);
  min-width: 62rpx;
  height: 30rpx;
  line-height: 30rpx;
  border-radius: 999rpx;
  text-align: center;
  background: #182333;
  color: #ffc33d;
  font-size: 18rpx;
  font-weight: 800;
}

.profile-copy {
  flex: 1;
  min-width: 0;
  margin-left: 28rpx;
}

.name-row {
  display: flex;
  align-items: center;
  min-width: 0;
  margin-bottom: 10rpx;
}

.user-name {
  display: block;
  max-width: 360rpx;
  font-size: 40rpx;
  line-height: 1.2;
  font-weight: 800;
  color: #172232;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-badge {
  flex-shrink: 0;
  margin-left: 18rpx;
  padding: 4rpx 14rpx;
  border-radius: 8rpx;
  background: #fff5d7;
  color: #ad7100;
  font-size: 22rpx;
  font-weight: 700;
}

.user-id {
  display: block;
  font-size: 26rpx;
  color: #9aa2ad;
}

.login-btn {
  width: 220rpx;
  height: 70rpx;
  line-height: 70rpx;
  background-color: #ffc33d;
  color: #172232;
  border: none;
  border-radius: 999rpx;
  padding: 0;
  font-size: 28rpx;
  font-weight: 800;
  margin: 30rpx 0 0;
}

.login-btn::after {
  border: none;
}

.edit-profile-entry {
  width: 180rpx;
  height: 62rpx;
  line-height: 62rpx;
  background: #182333;
  color: #ffffff;
  border: none;
  border-radius: 999rpx;
  padding: 0;
  font-size: 24rpx;
  font-weight: 800;
  margin: 26rpx 0 0 auto;
}

.edit-profile-entry::after {
  border: none;
}

.profile-edit-card {
  background-color: #ffffff;
  border-radius: 18rpx 18rpx 0 0;
  padding: 30rpx;
  box-shadow: 0 -24rpx 58rpx rgba(15, 23, 42, 0.16);
}

.sheet-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1100;
  display: flex;
  align-items: flex-end;
  background: rgba(15, 23, 42, 0.42);
}

.sheet-card {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  padding-bottom: calc(env(safe-area-inset-bottom) + 34rpx);
}

.sheet-handle {
  width: 72rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #dde3e8;
  margin: 0 auto 28rpx;
}

.sheet-close {
  position: absolute;
  top: 24rpx;
  right: 28rpx;
  width: 56rpx;
  height: 56rpx;
  line-height: 52rpx;
  padding: 0;
  border-radius: 50%;
  background: #f1f4f6;
  color: #596474;
  font-size: 38rpx;
  font-weight: 500;
  z-index: 2;
}

.sheet-close::after {
  border: none;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 12rpx;
  padding-right: 72rpx;
}

.edit-title {
  display: block;
  font-size: 34rpx;
  line-height: 1.25;
  font-weight: 800;
  color: #172232;
}

.edit-status {
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  background: #e3f8ef;
  color: #15966f;
  font-size: 22rpx;
  font-weight: 700;
}

.edit-tip {
  display: block;
  font-size: 24rpx;
  color: #8d97a3;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.avatar-picker {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #f8faf9;
  border-radius: 8rpx;
  border: 1rpx solid #edf0f2;
  padding: 22rpx;
  margin-bottom: 20rpx;
  box-sizing: border-box;
}

.avatar-picker::after {
  border: none;
}

.avatar-preview {
  width: 92rpx;
  height: 92rpx;
  border-radius: 50%;
  background-color: #ffffff;
  flex-shrink: 0;
}

.avatar-preview-static {
  display: block;
  margin: 0 auto 20rpx;
}

.avatar-picker-copy {
  flex: 1;
  min-width: 0;
  margin-left: 22rpx;
}

.avatar-picker-text {
  display: block;
  font-size: 28rpx;
  font-weight: 800;
  color: #172232;
  margin-bottom: 6rpx;
}

.avatar-picker-sub {
  display: block;
  font-size: 22rpx;
  color: #9aa2ad;
}

.picker-arrow {
  font-size: 42rpx;
  color: #a8b0ba;
}

.nickname-input {
  width: 100%;
  height: 92rpx;
  background-color: #f8faf9;
  border-radius: 8rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #172232;
  margin-bottom: 20rpx;
}

.feedback-card,
.about-card,
.logout-confirm-card {
  background: #ffffff;
  border-radius: 18rpx 18rpx 0 0;
  padding: 30rpx;
  box-shadow: 0 -24rpx 58rpx rgba(15, 23, 42, 0.16);
}

.logout-confirm-title {
  display: block;
  font-size: 36rpx;
  line-height: 1.25;
  font-weight: 900;
  color: #172232;
  margin-bottom: 14rpx;
}

.logout-confirm-copy {
  display: block;
  font-size: 25rpx;
  line-height: 1.65;
  color: #6b7582;
  margin-bottom: 28rpx;
}

.logout-confirm-actions {
  display: flex;
  gap: 18rpx;
}

.logout-confirm-btn {
  flex: 1;
  height: 84rpx;
  line-height: 84rpx;
  border-radius: 999rpx;
  padding: 0;
  font-size: 27rpx;
  font-weight: 800;
}

.logout-confirm-btn::after {
  border: none;
}

.logout-confirm-btn.secondary {
  background: #f1f4f6;
  color: #334155;
}

.logout-confirm-btn.danger {
  background: #fff4f2;
  color: #d94b3d;
  border: 2rpx solid #ffd6d0;
}

.feedback-input {
  width: 100%;
  min-height: 220rpx;
  background: #f8faf9;
  border: 1rpx solid #edf0f2;
  border-radius: 10rpx;
  padding: 22rpx;
  box-sizing: border-box;
  font-size: 27rpx;
  color: #172232;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.about-card {
  text-align: center;
}

.about-logo {
  width: 108rpx;
  height: 108rpx;
  line-height: 108rpx;
  border-radius: 28rpx;
  background: #182333;
  color: #ffc33d;
  font-size: 54rpx;
  font-weight: 900;
  margin: 8rpx auto 24rpx;
}

.about-title {
  display: block;
  font-size: 40rpx;
  font-weight: 900;
  color: #172232;
  margin-bottom: 8rpx;
}

.about-version {
  display: block;
  font-size: 24rpx;
  color: #9aa2ad;
  margin-bottom: 24rpx;
}

.about-copy {
  display: block;
  font-size: 27rpx;
  line-height: 1.7;
  color: #596474;
  text-align: left;
  margin-bottom: 24rpx;
}

.about-note {
  background: #fff8e8;
  border-radius: 10rpx;
  padding: 20rpx;
  color: #9a6a00;
  font-size: 24rpx;
  line-height: 1.6;
  text-align: left;
  margin-bottom: 28rpx;
}

.save-profile-btn {
  width: 100%;
  height: 84rpx;
  line-height: 84rpx;
  background: #182333;
  color: #ffffff;
  border: none;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 800;
  padding: 0;
}

.save-profile-btn::after {
  border: none;
}

.save-profile-btn[disabled] {
  opacity: 0.7;
}

.stats-section {
  display: flex;
  margin: 0 -8rpx 24rpx;
}

.stat-card {
  flex: 1;
  min-width: 0;
  background-color: #ffffff;
  border-radius: 8rpx;
  padding: 26rpx 8rpx;
  margin: 0 8rpx;
  border: 1rpx solid #edf0f2;
  box-shadow: 0 8rpx 24rpx rgba(22, 30, 42, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

.stat-value {
  max-width: 200rpx;
  font-size: 32rpx;
  line-height: 1.25;
  font-weight: 800;
  color: #172232;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-label {
  font-size: 22rpx;
  color: #9aa2ad;
}

.menu-section {
  background-color: #ffffff;
  border-radius: 8rpx;
  overflow: hidden;
  border: 1rpx solid #edf0f2;
  box-shadow: 0 12rpx 34rpx rgba(22, 30, 42, 0.05);
  margin-bottom: 28rpx;
}

.menu-title-row {
  padding: 28rpx 30rpx 10rpx;
}

.menu-title {
  font-size: 32rpx;
  line-height: 1.25;
  font-weight: 800;
  color: #172232;
}

.menu-item {
  display: flex;
  align-items: center;
  min-height: 98rpx;
  padding: 0 30rpx;
  border-bottom: 1rpx solid #edf0f2;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:active {
    background-color: #f8faf9;
  }
}

.menu-icon {
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  border-radius: 50%;
  text-align: center;
  font-size: 22rpx;
  font-weight: 800;
  color: #172232;
  background: #f0f3f5;
  margin-right: 22rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: #172232;
  font-weight: 700;
}

.menu-arrow {
  font-size: 42rpx;
  color: #a8b0ba;
}

.logout-section {
  padding-top: 8rpx;
}

.logout-btn {
  background-color: #fff4f2;
  color: #d94b3d;
  border: 2rpx solid #ffd6d0;
  border-radius: 8rpx;
  padding: 0;
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  font-weight: 800;
  box-shadow: 0 10rpx 28rpx rgba(217, 75, 61, 0.08);
}

.logout-btn::after {
  border: none;
}
</style>
