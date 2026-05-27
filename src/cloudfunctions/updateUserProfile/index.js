const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const { nickName, avatarUrl, gender, city, province, country, language } = event

  try {
    const result = await db.collection('users').where({
      openid: wxContext.OPENID
    }).update({
      data: {
        nickName,
        avatarUrl,
        gender,
        city,
        province,
        country,
        language,
        updatedAt: db.serverDate()
      }
    })

    return {
      success: true,
      data: result
    }
  } catch (err) {
    console.error('更新用户资料失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
