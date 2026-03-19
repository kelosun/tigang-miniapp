const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { code } = event
  
  try {
    const res = await cloud.openapi.auth.code2Session({
      appid: process.env.APPID,
      js_code: code,
      grant_type: 'authorization_code',
      secret: process.env.SECRET
    })
    
    const { openid, session_key, unionid } = res
    
    const userResult = await db.collection('users').where({
      openid: openid
    }).get()
    
    let userData
    
    if (userResult.data.length > 0) {
      userData = userResult.data[0]
      await db.collection('users').doc(userData._id).update({
        data: {
          lastLoginTime: db.serverDate()
        }
      })
    } else {
      const result = await db.collection('users').add({
        data: {
          openid,
          unionid,
          session_key,
          nickName: '提肛达人',
          avatarUrl: '',
          gender: 0,
          city: '',
          province: '',
          country: 'China',
          language: 'zh_CN',
          totalSessions: 0,
          totalDuration: 0,
          streakDays: 0,
          lastTrainDate: null,
          createdAt: db.serverDate(),
          lastLoginTime: db.serverDate()
        }
      })
      
      userData = {
        _id: result._id,
        openid,
        unionid,
        nickName: '提肛达人',
        avatarUrl: '',
        gender: 0,
        city: '',
        province: '',
        country: 'China',
        language: 'zh_CN',
        totalSessions: 0,
        totalDuration: 0,
        streakDays: 0,
        lastTrainDate: null
      }
    }
    
    return {
      success: true,
      data: userData
    }
  } catch (err) {
    console.error('登录失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
