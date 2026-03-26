import test from 'node:test'
import assert from 'node:assert/strict'

import {
  mergeUserProfile,
  shouldUseWechatProfile
} from '../src/utils/user-profile.js'

test('should use wechat profile when cloud user still has default nickname and avatar', () => {
  const cloudUser = {
    openid: 'openid-123',
    nickName: '提肛达人',
    avatarUrl: '',
    totalSessions: 3
  }

  const wechatProfile = {
    nickName: '小明',
    avatarUrl: 'https://wx.qlogo.cn/avatar',
    gender: 1,
    city: 'Shanghai'
  }

  assert.equal(shouldUseWechatProfile(cloudUser, wechatProfile), true)
  assert.deepEqual(mergeUserProfile(cloudUser, wechatProfile), {
    openid: 'openid-123',
    nickName: '小明',
    avatarUrl: 'https://wx.qlogo.cn/avatar',
    gender: 1,
    city: 'Shanghai',
    totalSessions: 3
  })
})

test('should keep existing custom cloud profile when wechat profile is missing', () => {
  const cloudUser = {
    openid: 'openid-123',
    nickName: '自定义昵称',
    avatarUrl: 'https://example.com/avatar.png'
  }

  assert.equal(shouldUseWechatProfile(cloudUser, null), false)
  assert.deepEqual(mergeUserProfile(cloudUser, null), cloudUser)
})
