# ⚙️ 配置检查清单

在运行项目前，请完成以下配置：

## 必须配置（❌ 不配置无法运行）

### 1. 微信小程序 AppID
- **文件**: `src/manifest.json`
- **位置**: `mp-weixin.appid`
- **获取方式**: 
  1. 登录 https://mp.weixin.qq.com/
  2. 进入开发 → 开发管理 → 开发设置
  3. 复制"开发者 ID"中的 AppID
- **示例**:
```json
{
  "mp-weixin": {
    "appid": "wx1234567890abcdef",
    ...
  }
}
```

### 2. 云开发环境 ID
- **文件**: `src/App.vue`
- **位置**: `wx.cloud.init.env`
- **获取方式**:
  1. 打开微信开发者工具
  2. 点击"云开发"按钮
  3. 复制环境 ID（如：tigang-app-env）
- **示例**:
```javascript
wx.cloud.init({
  env: 'tigang-app-env', // 替换为你的环境 ID
  traceUser: true
})
```

### 3. 云函数环境配置
- **文件**: `src/cloudfunctions/login/index.js`
- **说明**: 确保使用 `cloud.DYNAMIC_CURRENT_ENV`
- **检查**:
```javascript
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // ✅ 正确
})
```

---

## 推荐配置（⚠️ 不配置可运行，但功能受限）

### 4. 指导视频文件
- **位置**: `static/video/guide.mp4`
- **说明**: 训练页面的动作指导视频
- **临时方案**: 可使用占位视频或跳过
- **建议**: 
  - 视频时长：30-60 秒
  - 格式：MP4
  - 大小：< 10MB
  - 内容：提肛动作标准演示

### 5. 默认头像
- **位置**: `static/images/default-avatar.png`
- **说明**: 游客模式或未设置头像时显示
- **建议**:
  - 尺寸：200x200px
  - 格式：PNG
  - 风格：与主题色协调

---

## 可选配置（✨ 增强功能）

### 6. TTS 语音插件
- **说明**: 训练时的语音提示
- **现状**: 已实现降级方案（Toast 提示）
- **增强**: 可安装第三方 TTS 插件
- **参考**: https://ext.dcloud.net.cn/

### 7. 隐私协议 URL
- **位置**: 微信小程序后台
- **说明**: 小程序审核必需
- **配置**: 
  1. 登录小程序后台
  2. 设置 → 基本设置 → 隐私协议
  3. 填写隐私协议内容

### 8. 小程序类目
- **位置**: 微信小程序后台
- **建议**: 运动健康
- **说明**: 影响审核和功能范围

---

## 配置验证步骤

### Step 1: 检查 manifest.json
```bash
# 打开文件
cat src/manifest.json | grep appid

# 应该看到类似输出：
# "appid": "wx1234567890abcdef"
# 而不是："appid": ""
```

### Step 2: 检查 App.vue
```bash
# 打开文件
cat src/App.vue | grep "env:"

# 应该看到类似输出：
# env: 'tigang-app-env'
# 而不是：env: ''
```

### Step 3: 运行配置检查脚本
```bash
# Mac/Linux
./start.sh

# Windows
start.bat
```

脚本会自动检查：
- ✅ Node.js 是否安装
- ✅ 依赖是否安装
- ✅ AppID 是否配置

---

## 配置错误排查

### 错误 1: "appid 无效"
**原因**: AppID 未配置或配置错误  
**解决**: 
1. 检查 manifest.json 中 appid 字段
2. 确认小程序已注册
3. 重启微信开发者工具

### 错误 2: "云开发环境不存在"
**原因**: 环境 ID 错误或云开发未开通  
**解决**:
1. 检查 App.vue 中环境 ID
2. 确认云开发已开通
3. 重新创建云环境

### 错误 3: "云函数调用失败"
**原因**: 云函数未上传  
**解决**:
1. 微信开发者工具中右键云函数目录
2. 选择"上传并部署：云端安装依赖"
3. 检查云函数日志

### 错误 4: "数据库操作失败"
**原因**: 数据库集合未创建或权限错误  
**解决**:
1. 云开发控制台创建 users 集合
2. 设置权限为"所有用户可读写"
3. 检查集合名称是否正确

---

## 快速配置模板

### manifest.json 配置模板
```json
{
  "mp-weixin": {
    "appid": "你的 AppID",
    "setting": {
      "urlCheck": false,
      "es6": true,
      "postcss": true,
      "minified": true
    },
    "usingComponents": true,
    "cloud": true
  }
}
```

### App.vue 配置模板
```javascript
export default {
  onLaunch: function() {
    console.log('App Launch')
    if (wx?.cloud) {
      wx.cloud.init({
        env: '你的环境 ID',
        traceUser: true
      })
    }
  }
}
```

---

## 配置完成确认

完成所有配置后，你应该能够：

- [ ] 运行 `npm run dev:mp-weixin` 无报错
- [ ] 在微信开发者工具中看到项目
- [ ] 首页正常显示
- [ ] 点击模式卡片能跳转
- [ ] 训练页面动画正常
- [ ] 个人中心可以登录

如果以上都通过，恭喜！配置完成！🎉

---

## 需要帮助？

1. 查看 `README.md` - 完整项目说明
2. 查看 `DEPLOYMENT.md` - 部署指南
3. 查看 `TESTING.md` - 测试指南
4. 查看 `PROJECT_SUMMARY.md` - 项目总结

---

**祝配置顺利！** 🚀
