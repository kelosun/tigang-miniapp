# 提肛了 - 健康提肛训练小程序

一款专注于盆底肌训练的健康小程序，帮助用户养成科学的提肛习惯。

## 功能特性

### 核心功能
- ✅ **三种训练模式**：普通模式、进阶模式、王者模式
- ✅ **臀部样式时钟**：可视化收缩/放松状态
- ✅ **语音提示**：TTS 实时指导训练节奏
- ✅ **动作指导视频**：标准动作演示
- ✅ **个人数据中心**：训练次数、时长、连续打卡统计
- ✅ **微信云开发**：数据云端同步，支持多设备

### 训练模式

| 模式 | 适合人群 | 节奏 |
|------|---------|------|
| 普通模式 | 新手入门 | 收缩 3s → 放松 3s |
| 进阶模式 | 提升耐力 | 收缩 5s → 放松 3s |
| 王者模式 | 高强度挑战 | 收缩 5s → 放松 2s → 快速收缩 1s×3 |

## 技术栈

- **框架**: uni-app (Vue 3)
- **平台**: 微信小程序
- **状态管理**: Pinia + 持久化插件
- **后端**: 微信云开发
- **语音**: TTS 文字转语音
- **样式**: SCSS

## 快速开始

### 环境要求

- Node.js >= 16
- HBuilderX (推荐) 或 VS Code
- 微信开发者工具
- 微信小程序账号

### 安装步骤

1. **克隆项目**
```bash
cd /Users/kelosun/Workspace/tigang-app
```

2. **安装依赖**
```bash
npm install
```

3. **配置小程序 AppID**
   - 打开 `src/manifest.json`
   - 填入你的微信小程序 AppID
   - 或使用测试号

4. **配置云开发环境**
   - 打开微信开发者工具
   - 点击"云开发"按钮
   - 创建云环境（如：tigang-app-env）
   - 将环境 ID 填入 `src/manifest.json` 的 `mp-weixin.cloud` 字段

5. **上传云函数**
   - 在微信开发者工具中
   - 右键点击 `src/cloudfunctions` 目录
   - 选择"上传并部署：云端安装依赖"
   - 分别上传 `login` 和 `updateUserStats` 两个函数

6. **运行项目**

**方式一：VSCode（推荐 - 仅小程序）**
```bash
npm run dev:mp-weixin
```
微信开发者工具导入 `dist/dev/mp-weixin`

**方式二：HBuilderX（功能全）**
- 打开项目后，点击"运行" -> "运行到小程序模拟器"

**对比**：
| 编辑器 | 优势 | 劣势 |
|--------|------|------|
| VSCode | 插件多、Git 好、自定义高 | 需手动配置、无云打包 |
| HBuilderX | 开箱即用、提示完善、真机调试 | 插件少、生态小 |

> 💡 **建议**：只开发小程序用 VSCode；需要打包 App 用 HBuilderX

2. **安装依赖**
```bash
npm install
```

3. **配置小程序 AppID**
   - 打开 `src/manifest.json`
   - 填入你的微信小程序 AppID
   - 或使用测试号

4. **配置云开发环境**
   - 打开微信开发者工具
   - 点击"云开发"按钮
   - 创建云环境（如：tigang-app-env）
   - 将环境 ID 填入 `src/manifest.json` 的 `mp-weixin.cloud` 字段

5. **上传云函数**
   - 在微信开发者工具中
   - 右键点击 `src/cloudfunctions` 目录
   - 选择"上传并部署：云端安装依赖"
   - 分别上传 `login` 和 `updateUserStats` 两个函数

6. **创建数据库**
   - 在云开发控制台
   - 创建集合 `users`
   - 设置权限为"所有用户可读写"

7. **运行项目**
```bash
# 开发模式
npm run dev:mp-weixin

# 或使用 HBuilderX
# 打开项目后，点击"运行" -> "运行到小程序模拟器"
```

## 项目结构

```
tigang-app/
├── src/
│   ├── pages/              # 页面
│   │   ├── index/         # 首页（模式选择）
│   │   ├── train/         # 训练页面
│   │   └── profile/       # 个人中心
│   ├── components/         # 组件
│   ├── store/             # 状态管理
│   │   └── user.ts        # 用户状态
│   ├── utils/             # 工具函数
│   ├── styles/            # 全局样式
│   │   ├── variables.scss # 变量
│   │   └── common.scss    # 公共类
│   ├── cloudfunctions/    # 云函数
│   │   ├── login/        # 登录函数
│   │   └── updateUserStats/ # 更新统计
│   ├── App.vue           # 应用配置
│   ├── main.js           # 入口文件
│   ├── manifest.json     # 应用配置
│   └── pages.json        # 页面配置
├── static/               # 静态资源
│   ├── audio/           # 音频文件
│   └── video/           # 视频文件
├── package.json
└── vite.config.js
```

## 数据库设计

### users 集合

```typescript
interface User {
  _id: string
  openid: string
  unionid?: string
  session_key: string
  nickName: string
  avatarUrl: string
  gender: number
  city: string
  province: string
  country: string
  language: string
  totalSessions: number      // 总训练次数
  totalDuration: number      // 总时长（秒）
  streakDays: number         // 连续天数
  lastTrainDate: string | null
  createdAt: Date
  lastLoginTime: Date
  updatedAt?: Date
}
```

## UI 设计

### 配色方案
- **主色调**: 薄荷绿 `#4ECDC4`
- **辅助色**: 浅绿 `#95E1D3`
- **点缀色**: 珊瑚红 `#F38181`
- **成功色**: 草绿 `#96C93D`

### 设计原则
- 清新健康风格
- 简洁直观的交互
- 友好的视觉反馈
- 舒适的动画效果

## 待开发功能

- [ ] 训练历史记录（日历视图）
- [ ] 成就徽章系统
- [ ] 语音包选择（温柔女声/磁性男声）
- [ ] 自定义训练时长
- [ ] 匿名排行榜
- [ ] 好友 PK 功能
- [ ] 训练提醒通知
- [ ] 数据导出功能

## 部署上线

### 小程序审核注意事项

1. **类目选择**: 选择"运动健康"类目
2. **隐私协议**: 需在小程序后台配置隐私协议
3. **功能说明**: 准备详细的功能说明文档
4. **测试账号**: 如需登录，提供测试账号

### 版本发布流程

1. 在 HBuilderX 中点击"发行"
2. 选择"小程序 - 微信"
3. 上传代码到微信开发者工具
4. 在微信开发者工具中提交审核
5. 审核通过后发布上线

## 开发团队

- 开发者：Sun
- 框架：uni-app
- 设计工具：即时设计/Figma

## 许可证

MIT License

## 反馈与支持

如有问题或建议，欢迎通过以下方式反馈：
- 小程序内"意见反馈"功能
- Email: your-email@example.com

---

**健康提示**: 建议每日训练 2-3 次，每次 5-10 分钟。如有不适，请立即停止训练并咨询医生。
