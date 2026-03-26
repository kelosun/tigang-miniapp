export const DEFAULT_NICKNAME = '提肛达人'
export const DEFAULT_AVATAR = '/static/images/default-avatar.png'
export const WECHAT_ANONYMOUS_NICKNAME = '微信用户'

function hasMeaningfulText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasDefinedValue(value) {
  return value !== undefined && value !== null
}

function pickProfileValue(wechatValue, cloudValue) {
  return hasMeaningfulText(wechatValue) ? wechatValue : cloudValue
}

export function mergeUserProfile(cloudUser = {}, wechatProfile = null) {
  if (!wechatProfile) {
    return { ...cloudUser }
  }

  const mergedProfile = {
    ...cloudUser,
    nickName: pickProfileValue(wechatProfile.nickName, cloudUser.nickName),
    avatarUrl: pickProfileValue(wechatProfile.avatarUrl, cloudUser.avatarUrl),
    gender: wechatProfile.gender ?? cloudUser.gender,
    city: pickProfileValue(wechatProfile.city, cloudUser.city),
    province: pickProfileValue(wechatProfile.province, cloudUser.province),
    country: pickProfileValue(wechatProfile.country, cloudUser.country),
    language: pickProfileValue(wechatProfile.language, cloudUser.language)
  }

  Object.keys(mergedProfile).forEach((key) => {
    if (!hasDefinedValue(mergedProfile[key])) {
      delete mergedProfile[key]
    }
  })

  return mergedProfile
}

export function shouldUseWechatProfile(cloudUser = {}, wechatProfile = null) {
  if (!wechatProfile) {
    return false
  }

  const mergedProfile = mergeUserProfile(cloudUser, wechatProfile)

  return [
    'nickName',
    'avatarUrl',
    'gender',
    'city',
    'province',
    'country',
    'language'
  ].some((field) => mergedProfile[field] !== cloudUser[field])
}

export function needsProfileCompletion(userInfo = null) {
  if (!userInfo) {
    return false
  }

  const nickName = userInfo.nickName || ''
  const avatarUrl = userInfo.avatarUrl || ''

  return (
    !hasMeaningfulText(nickName) ||
    nickName === DEFAULT_NICKNAME ||
    nickName === WECHAT_ANONYMOUS_NICKNAME ||
    !hasMeaningfulText(avatarUrl) ||
    avatarUrl === DEFAULT_AVATAR
  )
}
