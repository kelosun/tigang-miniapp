import { defineStore } from 'pinia'

interface UserInfo {
  openid?: string
  nickName?: string
  avatarUrl?: string
  gender?: number
  city?: string
  province?: string
  country?: string
  language?: string
}

interface UserState {
  isLoggedIn: boolean
  userInfo: UserInfo | null
  totalSessions: number
  totalDuration: number
  streakDays: number
  lastTrainDate: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    isLoggedIn: false,
    userInfo: null,
    totalSessions: 0,
    totalDuration: 0,
    streakDays: 0,
    lastTrainDate: null
  }),
  
  getters: {
    displayName: (state) => state.userInfo?.nickName || '游客用户',
    displayAvatar: (state) => state.userInfo?.avatarUrl || '/static/images/default-avatar.png'
  },
  
  actions: {
    async login() {
      try {
        const { code } = await uni.login({ provider: 'weixin' })
        
        const result = await uni.cloud.callFunction({
          name: 'login',
          data: { code }
        })
        
        if (result.result.success) {
          const userData = result.result.data
          this.userInfo = {
            openid: userData.openid,
            nickName: userData.nickName || '提肛达人',
            avatarUrl: userData.avatarUrl || '/static/images/default-avatar.png',
            gender: userData.gender,
            city: userData.city,
            province: userData.province,
            country: userData.country,
            language: userData.language
          }
          this.isLoggedIn = true
          this.totalSessions = userData.totalSessions || 0
          this.totalDuration = userData.totalDuration || 0
          this.streakDays = userData.streakDays || 0
          this.lastTrainDate = userData.lastTrainDate || null
        }
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },
    
    logout() {
      this.isLoggedIn = false
      this.userInfo = null
    },
    
    updateTrainStats(duration: number) {
      const today = new Date().toDateString()
      
      if (this.lastTrainDate !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (this.lastTrainDate === yesterday.toDateString()) {
          this.streakDays += 1
        } else if (this.lastTrainDate !== today) {
          this.streakDays = 1
        }
        
        this.lastTrainDate = today
        this.totalSessions += 1
      }
      
      this.totalDuration += duration
      
      this.syncToCloud()
    },
    
    async syncToCloud() {
      if (!this.isLoggedIn) return
      
      try {
        await uni.cloud.callFunction({
          name: 'updateUserStats',
          data: {
            totalSessions: this.totalSessions,
            totalDuration: this.totalDuration,
            streakDays: this.streakDays,
            lastTrainDate: this.lastTrainDate
          }
        })
      } catch (error) {
        console.error('同步数据失败:', error)
      }
    }
  },
  
  persist: {
    key: 'tigang_user_store',
    storage: {
      getItem: (key: string) => {
        return uni.getStorageSync(key)
      },
      setItem: (key: string, value: string) => {
        uni.setStorageSync(key, value)
      }
    },
    paths: ['isLoggedIn', 'userInfo', 'totalSessions', 'totalDuration', 'streakDays', 'lastTrainDate']
  }
})
