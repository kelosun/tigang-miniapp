# VSCode 开发 uni-app 指南

## 📌 核心结论

**VSCode 完全可以开发 uni-app 项目，但需要区分场景：**

| 开发目标 | 推荐工具 | 原因 |
|---------|---------|------|
| 仅小程序/H5 | ✅ VSCode | 插件丰富、Git 强大、自定义高 |
| 需要打包 App | ⚠️ HBuilderX | 云打包功能独占 |
| 使用 uniCloud | ⚠️ HBuilderX | 可视化部署更方便 |
| 团队标准化 | ✅ VSCode | CI/CD 友好、配置统一 |

---

## 🚀 VSCode 开发方案

### 方案一：纯 CLI 模式（本项目采用）

**完全不需要 HBuilderX！**

#### 启动步骤

```bash
# 1. 打开项目
code /Users/kelosun/Workspace/tigang-app

# 2. 安装依赖（首次）
npm install

# 3. 运行开发服务器
npm run dev:mp-weixin

# 4. 微信开发者工具
# 导入目录：dist/dev/mp-weixin
```

#### 优点

- ✅ 完全自由，不依赖 HBuilderX
- ✅ 使用 VSCode 所有插件
- ✅ 团队开发标准化
- ✅ 支持 CI/CD 自动化
- ✅ 跨平台（Win/Mac/Linux）

#### 缺点

- ❌ 无法云端打包 App（需要时再装 HBuilderX）
- ❌ pages.json 无语法提示
- ❌ 真机调试需手动配置

---

### 方案二：VSCode + HBuilderX 混合模式

**写代码用 VSCode，运行打包用 HBuilderX**

#### 工作流程

```
1. 编辑代码 → VSCode（舒适、插件多）
2. 运行调试 → HBuilderX（一键运行到手机）
3. 云打包 → HBuilderX（生成 APK/IPA）
4. 部署 uniCloud → HBuilderX（可视化）
```

#### 适用场景

- 需要打包 App 上架应用商店
- 需要使用 uniCloud 云开发
- 团队部分成员习惯 HBuilderX

---

## 🛠️ VSCode 配置

### 必装插件

项目已配置 `.vscode/extensions.json`，打开项目会提示安装：

```json
{
  "recommendations": [
    "dcloudio.uni-app",        // uni-app 官方支持
    "Vue.volar",               // Vue 3 语言支持
    "dbaeumer.vscode-eslint",  // 代码检查
    "esbenp.prettier-vscode"   // 代码格式化
  ]
}
```

### 推荐插件（可选）

```
GitLens — Git supercharged     // Git 增强
Path Intellisense              // 路径自动补全
Auto Close Tag                 // 自动闭合标签
Auto Rename Tag                // 自动重命名标签
ES7+ React/Redux/React-Native  // 代码片段
```

### 配置文件

项目已包含 `.vscode/settings.json`，包含：
- 保存时自动格式化
- Vue 文件关联
- Emmet 支持
- 文件监听排除

---

## 📝 开发体验优化

### 1. 代码提示

**uni-app API 提示**：
- 安装 `uni-app` 官方插件
- 部分提示可能不如 HBuilderX 完善
- 可安装 `uni-app api` 插件增强

**pages.json 提示**：
- VSCode 原生不支持
- 可手动参考文档：https://uniapp.dcloud.net.cn/collocation/pages

### 2. 条件编译高亮

uni-app 条件编译在 VSCode 中可能显示为语法错误：

```vue
<!-- #ifdef MP-WEIXIN -->
<view>微信小程序专属</view>
<!-- #endif -->
```

**解决方案**：
- 安装 `uni-app` 插件后会有所改善
- 或在 settings.json 中忽略相关警告

### 3. 快捷运行

创建 VSCode 任务快捷运行：

`.vscode/tasks.json`：

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev:mp-weixin",
      "type": "npm",
      "script": "dev:mp-weixin",
      "problemMatcher": [],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "build:mp-weixin",
      "type": "npm",
      "script": "build:mp-weixin",
      "problemMatcher": []
    }
  ]
}
```

然后按 `Ctrl+Shift+B` (Win) / `Cmd+Shift+B` (Mac) 快速运行。

---

## 🔧 常见问题

### Q1: 为什么文档推荐 HBuilderX？

**原因**：
1. **官方出品**：HBuilderX 和 uni-app 同属 DCloud
2. **开箱即用**：无需配置，下载安装即可
3. **功能完整**：真机调试、云打包、uniCloud 部署
4. **代码提示**：对 uni-app API 和 pages.json 提示完善

**但这不代表 VSCode 不能用！** 只是 HBuilderX 在 uni-app 生态中有深度集成。

### Q2: VSCode 开发能否打包 App？

**可以，但有限制**：

```bash
# 可以生成离线包
npm run build:app-plus

# 但无法云端打包生成 APK/IPA
# 需要 APK/IPA 时必须用 HBuilderX
```

**解决方案**：
- 开发阶段用 VSCode
- 打包时临时用 HBuilderX
- 或使用本地打包（需要原生开发环境）

### Q3: 团队开发用哪个？

**推荐 VSCode**，原因：
1. **标准化**：配置文件可纳入版本控制
2. **CI/CD**：命令行友好，易于自动化
3. **插件统一**：通过 extensions.json 统一团队插件
4. **跨平台**：支持 Linux 服务器

### Q4: 真机调试怎么办？

**VSCode 方案**：
1. 运行 `npm run dev:mp-weixin`
2. 微信开发者工具打开
3. 使用微信开发者工具的真机调试功能

**HBuilderX 方案**：
1. 点击"运行" → "运行到手机或模拟器"
2. 自动识别 USB 连接的设备
3. 一键运行

---

## 📊 性能对比

| 指标 | VSCode | HBuilderX |
|------|--------|-----------|
| 启动速度 | 中等（插件多时慢） | 快 |
| 内存占用 | 较高（1-2GB） | 较低（500MB-1GB） |
| 编译速度 | 相同（都是 uni cli） | 相同 |
| 热更新 | 支持 | 支持（稍快） |
| 代码提示 | 良好 | 优秀 |

---

## 🎯 最佳实践

### 仅开发小程序（如本项目）

```bash
# 1. 使用 VSCode
code /Users/kelosun/Workspace/tigang-app

# 2. 运行开发服务器
npm run dev:mp-weixin

# 3. 微信开发者工具
# 导入 dist/dev/mp-weixin
# 开启自动编译
```

**优势**：
- 享受 VSCode 完整生态
- 无需安装 HBuilderX
- 开发体验最佳

### 需要打包 App

```bash
# 开发阶段：VSCode
npm run dev:app-plus

# 打包阶段：HBuilderX
# 1. 打开项目
# 2. 发行 → 原生 App-云打包
# 3. 生成 APK/IPA
```

---

## 📚 参考资源

- [uni-app CLI 官方文档](https://uniapp.dcloud.net.cn/worktile/CLI.html)
- [VSCode 开发 uni-app 最佳实践](https://ask.dcloud.net.cn/article/35451)
- [uni-app 插件市场](https://ext.dcloud.net.cn/)
- [unibest 脚手架（VSCode 友好）](https://github.com/unibest/unibest)

---

## 💡 总结

**HBuilderX 推荐但不是必须！**

- **小程序开发**：VSCode 完全够用，体验更好
- **App 开发**：开发用 VSCode，打包用 HBuilderX
- **团队协作**：推荐 VSCode，标准化程度高
- **个人开发**：根据习惯选择，两者皆可

**本项目（提肛了小程序）完全可以用 VSCode 开发，无需 HBuilderX！**

---

**祝开发愉快！** 🚀
