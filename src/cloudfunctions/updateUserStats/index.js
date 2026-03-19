const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { totalSessions, totalDuration, streakDays, lastTrainDate } = event
  
  try {
    const result = await db.collection('users').where({
      openid: wxContext.OPENID
    }).update({
      data: {
        totalSessions,
        totalDuration,
        streakDays,
        lastTrainDate,
        updatedAt: db.serverDate()
      }
    })
    
    return {
      success: true,
      data: result
    }
  } catch (err) {
    console.error('更新失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
