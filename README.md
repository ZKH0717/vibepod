# VibePod — iPod 风格本地音乐播放器 PWA 🎵

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> 用浏览器还原经典 iPod Click Wheel 体验。纯原生 Web，零框架零依赖。
>
> A classic iPod Click Wheel experience in your browser. Pure vanilla web, zero framework, zero build step.

**在线体验 / Live Demo:** [https://zkh0717.github.io/vibepod](https://zkh0717.github.io/vibepod)（请在 Safari 中打开，添加到主屏幕获得全屏体验）

---

## 截图 / Screenshot

```
┌─────────────────────┐
│   ░░░ iPod ░░░       │
│ ┌─────────────────┐  │
│ │  歌曲          › │  │
│ │ [正在播放]     › │  │
│ └─────────────────┘  │
│       ┌───────┐       │
│       │ MENU  │       │
│   ◀── │  (●)  │ ──▶   │
│       │   ▶   │       │
│       └───────┘       │
└─────────────────────┘
```

---

## ✨ 已完成功能 / What's Done

### 核心体验
- **经典点按轮盘** — 画圈滚动（顺逆时针对应上下）、五键（MENU / ⏮ / ⏭ / ⏯ / 中心确认），支持触摸屏和鼠标
- **三屏导航** — 主菜单 ↔ 歌曲列表 ↔ 正在播放，MENU 逐级返回
- **本地音乐导入** — 点右上角 `＋` 导入 mp3/m4a 文件，持久保存到 IndexedDB
- **正在播放** — 每首歌专属固定撞色渐变背景、歌名/歌手、进度/音量条
- **应用内音量** — Web Audio GainNode，不影响系统音量
- **Media Session** — 锁屏控制中心显示歌名/歌手，支持锁屏切歌
- **PWA 全屏** — 添加到主屏幕后无浏览器 UI，离线可打开
- **触感反馈** — 滚动每格触发震动（支持时则用）

### 视觉
- 高级哑光黑主体 + 克制玫红（`#E0476B`）点缀
- PingFang SC 中文字体，几何无衬线英文数字
- 深色精选撞色盘（8 组），歌名哈希稳定映射

### 健壮性
- 无歌空态引导导入
- 导入失败 alert 提示
- 播放解码失败自动跳下一首 + 短暂通知
- AudioContext 手势同步解锁（iOS 兼容）
- 列表边界停住不越界
- 滚动性能优化（轻量重渲染）

---

## 📋 还未完成的 / Not Yet Implemented

> 以下功能在规划中，**欢迎感兴趣的朋友一起做！** 🙌

### 播放增强
- [ ] **自动连续播放** — 当前曲目结束后自动播放下一首
- [ ] **循环模式** — 单曲循环 / 列表循环
- [ ] **随机播放（Shuffle）**
- [ ] **播放队列管理** — 查看和调整即将播放的歌曲

### UI 增强
- [ ] **咔哒音效开关** — 画圈时的 iPod 经典咔哒声（目前已实现震动，音效待补 UI 开关）
- [ ] **列表快速滚动** — 右侧字母索引条
- [ ] **删除歌曲** — 从列表中移除已导入的歌曲
- [ ] **专辑封面** — 从文件元数据读取并显示
- [ ] **歌曲搜索/过滤**
- [ ] **动效优化** — 屏幕切换过渡动画、列表滑动动效

### 功能扩展
- [ ] **歌词显示**（接口已留位）
- [ ] **歌单 / 专辑分组**
- [ ] **均衡器（EQ）**
- [ ] **睡眠定时器**
- [ ] **Dark/Light 模式切换**
- [ ] **iPod 经典字体选项**

### 平台 & 部署
- [ ] Android 端 PWA 兼容测试
- [ ] 桌面端适配（宽屏布局）
- [ ] **GitHub Actions 自动部署到 Pages**

> 💡 觉得哪个有意思？提 Issue 或直接 PR！

---

## 🚀 使用步骤 / How to Use

### 在线使用（推荐）
1. 用 **iPhone Safari** 打开 [https://zkh0717.github.io/vibepod](https://zkh0717.github.io/vibepod)
2. 点击底部分享按钮 → **添加到主屏幕**
3. 从主屏幕图标打开，获得全屏无浏览器 UI 的 iPod 体验
4. 点右上角 `＋` 导入你本地的 mp3/m4a 音乐文件
5. 开始享受！用轮盘画圈浏览、播放

### 本地部署 / 自行托管
```bash
# 克隆仓库
git clone https://github.com/ZKH0717/vibepod.git
cd vibepod

# 用任意静态服务器启动（无需安装依赖）
python -m http.server 8000
# 或 npx serve .
# 或 php -S localhost:8000

# 浏览器打开 http://localhost:8000
```

> ⚠️ Service Worker 和 PWA 安装需要 HTTPS（localhost 除外）。如果部署到自己的服务器，请确保配置 HTTPS。

---

## 🏗️ 技术栈 / Tech Stack

| 层级 | 技术 |
|------|------|
| 语言 | HTML5, CSS3, JavaScript (ES Modules) |
| 框架 | **无** — 纯原生，零依赖零构建 |
| 存储 | IndexedDB（音频文件 + 元数据） |
| 音频 | Web Audio API（GainNode 应用内音量） |
| 锁屏 | Media Session API |
| 离线 | Service Worker（缓存应用外壳） |
| PWA | Web App Manifest（standalone 全屏） |
| 测试 | Node.js 内置 `node:test` + `node:assert` |

---

## 📁 项目结构 / Project Structure

```
vibepod/
├── index.html               # 唯一入口页面
├── manifest.json            # PWA 配置
├── service-worker.js        # 离线缓存
├── package.json             # 仅声明 type:module + test 脚本
├── VERIFY.md                # iPhone 真机验收清单
├── icons/                   # PWA 图标
│   ├── icon.svg
│   ├── icon-180.png
│   ├── icon-192.png
│   └── icon-512.png
├── styles/
│   └── ipod.css             # 全部视觉样式
├── js/
│   ├── app.js               # 启动装配 + 导入流程
│   ├── colors.js            # 歌名→专属撞色（纯函数）
│   ├── player.js            # 音频播放 + 应用内音量
│   ├── screens.js           # 导航状态机 reducer（纯函数）
│   ├── store.js             # IndexedDB 封装
│   ├── ui.js                # 三屏渲染
│   ├── wheel.js             # 轮盘触摸/鼠标输入
│   └── wheel-math.js        # 角度/滚动数学（纯函数）
├── tests/
│   ├── colors.test.js
│   ├── screens.test.js
│   ├── wheel-math.test.js
│   └── smoke.test.js
└── docs/
    └── superpowers/
        ├── specs/           # 设计文档
        └── plans/           # 实现计划
```

### 模块数据流
```
手指动 → wheel.js → 抽象指令 → screens.js(reducer) → effects + state
                                                            ↓
                                              ui.js(渲染)  player.js(播放)
```

---

## 🧪 运行测试 / Running Tests

纯函数模块（colors, wheel-math, screens）有单元测试：

```bash
npm test
```

---

## 🤝 一起做 / Contribute

欢迎贡献！无论是修 bug、补功能、还是优化体验：

1. Fork 本仓库
2. 创建你的特性分支：`git checkout -b feat/your-feature`
3. 提交改动：`git commit -m "feat: add your feature"`
4. 推送到你的分支：`git push origin feat/your-feature`
5. 提交 Pull Request

或者直接提 [Issue](https://github.com/ZKH0717/vibepod/issues) 讨论想法！

---

## 📝 已知限制 / Known Limitations

- **iOS PWA 后台播放有限** — iOS 对 Web 后台行为有限制，能做到的 Media Session 已做
- **存储可能被回收** — IndexedDB 在 iOS 上长期不用可能被系统清理，重新导入即可
- **不能改系统音量** — 使用 Web Audio 应用内音量替代（不影响铃声音量）
- **全屏需手动添加** — 必须 Safari「添加到主屏幕」一次，浏览器内无法全屏

---

## 📄 License

MIT © ZKH0717
