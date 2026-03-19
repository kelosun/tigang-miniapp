# 快速部署指南

## 第一步：准备工作（5 分钟）

### 1. 注册微信小程序
1. 访问 https://mp.weixin.qq.com/
2. 注册小程序账号
3. 完成开发者认证
4. 获取 AppID（开发设置中查看）

### 2. 开通云开发
1. 打开微信开发者工具
2. 创建空白小程序项目
3. 点击"云开发"按钮
4. 开通云开发服务（免费版即可）
5. 记录环境 ID（如：tigang-app-env）


### 3. 创建数据库
1. 进入云开发控制台
2. 点击"数据库"
3. 创建集合 `users`
4. 权限设置为"所有用户可读写"

## 第二步：配置项目（3 分钟）

### 1. 修改 AppID
打开 `src/manifest.json`，找到：
```json
"mp-weixin": {
  "appid": "你的小程序 AppID",
  ...
}
```
替换为你的 AppID。

### 2. 修改云环境 ID
打开 `src/App.vue`，找到：
```javascript
wx.cloud.init({
  env: 'tigang-app-env', // 替换为你的云环境 ID
  ...
})
```
替换为你的云环境 ID。

### 3. 修改云函数配置
打开 `src/cloudfunctions/login/index.js`，确保：
```javascript
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
})
```

## 第三步：安装依赖（2 分钟）

```bash
cd /Users/kelosun/Workspace/tigang-app
npm install
```

## 第四步：上传云函数（5 分钟）

### 方法一：使用微信开发者工具（推荐）

1. 打开微信开发者工具
2. 导入项目（选择项目目录）
3. 右键点击 `src/cloudfunctions/login` 文件夹
4. 选择"上传并部署：云端安装依赖"
5. 等待上传完成
6. 对 `updateUserStats` 重复步骤 3-5

### 方法二：使用命令行

```bash
# 上传 login 函数
cd src/cloudfunctions/login
npm install
cloud functions deploy login

# 上传 updateUserStats 函数
cd ../updateUserStats
npm install
cloud functions deploy updateUserStats
```

## 第五步：运行项目（1 分钟）

### 方式一：使用 VSCode（推荐 - 仅小程序开发）

**优势**：插件生态丰富、Git 集成好、自定义程度高、团队标准化

1. 打开 VSCode
2. 打开项目目录
3. 安装推荐插件（首次打开会提示）
4. 终端运行：
```bash
npm run dev:mp-weixin
```
5. 微信开发者工具导入 `dist/dev/mp-weixin`

**推荐插件**：
- uni-app（官方）
- Volar（Vue 3 支持）
- ESLint
- Prettier
- GitLens

### 方式二：使用 HBuilderX（功能最全）

**优势**：开箱即用、代码提示完善、真机调试方便、支持云打包

1. 下载并安装 HBuilderX
2. 打开项目目录
3. 点击"运行" → "运行到小程序模拟器"
4. 选择微信开发者工具路径
5. 等待编译完成

### 方式三：混合模式（生产推荐）

```
写代码 → VSCode（舒适编辑）
运行调试 → HBuilderX（一键运行）
打包发布 → HBuilderX（云打包）
```

**适用场景**：
- 需要打包 App（APK/IPA）
- 需要使用 uniCloud 云开发
- 团队部分成员习惯 HBuilderX

## 第六步：测试功能（10 分钟）

### 必测功能

1. **登录测试**
   - 点击顶部用户信息
   - 授权登录
   - 检查是否显示用户名和头像

2. **训练测试**
   - 选择任意模式
   - 点击开始按钮
   - 检查倒计时、动画、计数是否正常
   - 点击暂停/继续
   - 点击结束，检查数据是否保存

3. **个人中心**
   - 查看统计数据是否正确
   - 测试退出登录

4. **云同步**
   - 训练一次后，在云开发控制台查看 users 集合
   - 确认数据已保存

## 第七步：调试问题

### 常见问题及解决方案

#### 1. 云函数调用失败
**错误**: "cloud.callFunction is not defined"
**解决**: 
- 检查 App.vue 中是否初始化云开发
- 检查云环境 ID 是否正确
- 检查云函数是否上传成功

#### 2. 登录失败
**错误**: "invalid code"
**解决**:
- 检查 AppID 是否正确
- 检查小程序是否已备案
- 重新获取 code

#### 3. 数据库写入失败
**错误**: "errCode: -502001"
**解决**:
- 检查数据库集合是否创建
- 检查权限设置
- 检查 openid 是否正确

#### 4. 样式显示异常
**解决**:
- 清除缓存重新编译
- 检查 rpx 单位使用
- 在真机上测试

## 第八步：发布上线

### 1. 代码审核准备
- [ ] 完善隐私协议（小程序后台）
- [ ] 选择正确类目（运动健康）
- [ ] 准备功能截图
- [ ] 填写测试账号（如需登录）

### 2. 上传代码
1. 在 HBuilderX 中点击"发行"
2. 选择"小程序 - 微信"
3. 上传到微信开发者工具

### 3. 提交审核
1. 打开微信开发者工具
2. 点击右上角"上传"
3. 填写版本号和备注
4. 登录小程序后台
5. 版本管理 → 开发版本 → 提交审核

### 4. 审核通过后
1. 小程序后台收到通知
2. 点击"发布"
3. 用户即可搜索到小程序

## 预计总时间

### 使用 VSCode（仅小程序）
- 准备工作：15 分钟
- 配置项目：5 分钟
- 上传部署：10 分钟
- 测试调试：20 分钟
- **总计：约 50 分钟**

### 使用 HBuilderX（完整功能）
- 下载 HBuilderX：10 分钟
- 准备工作：15 分钟
- 配置项目：5 分钟
- 上传部署：10 分钟
- 测试调试：20 分钟
- **总计：约 60 分钟**

## 部署检查清单

- [ ] 小程序 AppID 已配置
- [ ] 云环境 ID 已配置
- [ ] 依赖已安装
- [ ] 云函数已上传
- [ ] 数据库集合已创建
- [ ] 功能测试通过
- [ ] 真机测试通过
- [ ] 隐私协议已配置
- [ ] 准备提交审核

## 技术支持

遇到问题可以：
1. 查看 uni-app 文档：https://uniapp.dcloud.net.cn/
2. 查看微信云开发文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html
3. 查看项目 README.md
4. 查看 TESTING.md 测试指南

---

**祝部署顺利！** 🎉
