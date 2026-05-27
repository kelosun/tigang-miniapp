const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});
const db = cloud.database();
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  console.log("用户登录，openid:", openid);

  try {
    const users = db.collection("users");
    const queryResult = await users
      .where({
        openid: openid,
      })
      .get();

    if (queryResult.data.length > 0) {
      // 老用户：更新登录时间
      await users.doc(queryResult.data[0]._id).update({
        data: {
          lastLoginTime: db.serverDate(),
        },
      });

      console.log("老用户登录成功");

      return {
        success: true,
        data: queryResult.data[0],
        message: "登录成功",
      };
    } else {
      // 新用户：创建记录
      const result = await users.add({
        data: {
          openid: openid,
          nickName: "提肛达人",
          avatarUrl: "",
          gender: 0,
          city: "",
          province: "",
          country: "China",
          language: "zh_CN",
          totalSessions: 0,
          totalDuration: 0,
          streakDays: 0,
          lastTrainDate: null,
          createdAt: db.serverDate(),
          lastLoginTime: db.serverDate(),
        },
      });

      console.log("新用户创建成功");

      return {
        success: true,
        data: {
          _id: result._id,
          openid: openid,
          nickName: "提肛达人",
          avatarUrl: "",
          totalSessions: 0,
          totalDuration: 0,
          streakDays: 0,
        },
        message: "注册成功",
      };
    }
  } catch (err) {
    console.error("登录失败:", err);
    return {
      success: false,
      error: err.message,
      errCode: err.errCode,
    };
  }
};
