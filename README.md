# short-video-copy

把一句话选题写成短视频文案：**钩子 + 口播稿 + 分镜表 + 发布文案**。

按「平台 · 品类 · 调性」预设组合，时长按语速算出来，不靠估。

## 一行安装

```bash
npx -y linwanjiu/short-video-copy
```

Windows PowerShell（网络正常）：

```powershell
irm https://raw.githubusercontent.com/linwanjiu/short-video-copy/main/install.ps1 | iex
```

国内网络（GitHub 直连不稳时）：

```powershell
irm https://ghproxy.net/https://raw.githubusercontent.com/linwanjiu/short-video-copy/main/install.ps1 | iex
```

作为 DSH 插件安装（技能随包走，不落盘）：

```bash
dsh plugin --profile web add github:linwanjiu/short-video-copy
```

> 安装器会保留你已有的 `profile.md`，不会覆盖你的设置。要强制覆盖加 `--force`。

## 它解决什么问题

大多数"AI 写文案"只解决**说什么**，不解决**说多久**。

这个技能把两件事一起管：

1. **结构** —— 平台决定节奏，品类决定骨架，调性决定句式，钩子决定前 3 秒
2. **时间** —— 时长按字数算，不是拍脑袋分

第 2 点是它和普通文案 prompt 最大的区别：口播稿每行带字数和秒数，分镜时间直接复制，不算第二遍。

## 怎么用

默认流程是**先出稿、再收参数**：

```
你给一句话想法
 ↓
第一版：通用稿（口播 + 分镜 + 发布文案，带计时）
 ↓
四问：平台？调性？结构？要不要反转/双钩子？
 ↓
第二版：按你的回答重写，只改受影响的段落
 ↓
说"以后都这样" → 写进 profile.md，下次默认生效
```

四问长这样：

| # | 问什么 | 选项 |
|---|---|---|
| 1 | 平台 | 抖音 / 小红书 / 视频号 / B站 / 通用 |
| 2 | 调性 | 犀利 / 亲切 / 幽默 / 克制专业 / 清晰直接 |
| 3 | 结构 | 口播三段 / 科普 / 故事 / 剧情 |
| 4 | 反转与钩子 | 不加 / 中段转折 / 结尾反转 / 双钩子 |

如果一次就把平台和调性说清了，会跳过问卷直接出定向稿。

## 结构

```
skills/short-video-copy/    技能本体（插件与安装器都发这个目录）
  SKILL.md                  引擎：四个预设怎么叠、输出什么、怎么自检
  profile.md                当前选择 ← 只改这个
  presets/
    hooks.md                8 类钩子，每类 5–7 条中文公式
    tones.md                5 档调性：句长 / 动词 / 距离 / 禁用词
    platforms.md            抖音 / 小红书 / 视频号 / B站
    categories.md           通用 / 科普 / 带货 / 个人IP / 剧情 / 口播
    timing.md               计时模型：公式、语速表、容量反推
  references/analysis.md    拆解模式：分析参考视频并给改写方向
  scripts/timing.mjs        输入台词，输出带字数的计时表
  examples/demo-sleep.md    完整示例

lib/                        插件入口：向 ctx.skills 注册技能 provider
bin/install.mjs             安装器（复制技能到 ~/.dsh/skills）
install.ps1                 Windows 一行安装
cordis.patch.yml            插件补丁
test/plugin.test.mjs        插件接口自测
```

## 怎么调风格

不要改 `SKILL.md`，改 `profile.md`：

```yaml
platform: 通用        # 抖音 / 小红书 / 视频号 / B站
category: 通用        # 知识科普 / 带货 / 个人IP / 剧情 / 口播
tone: 清晰直接        # 犀利 / 亲切 / 幽默 / 克制专业
duration: 30          # 15 / 30 / 45 / 60
density: 中           # 低 / 中 / 高
person: 第二人称
cta: 关注
banned: 赋能, 闭环, 抓手, 颗粒度
```

**临时改**：说"这版改成小红书"，只改这一版，不动文件。
**永久改**：说"以后都用小红书"，写进 `profile.md` 并在改动记录里留一行。

## 计时怎么算

```
单句时长 = 字数 / 语速 + 0.2 × 逗号数 + 0.35 × 句号数
```

语速：抖音 4.5 字/秒、小红书 3.8、视频号 3.5、B站 4.2。

先按容量表控制总字数（15 秒抖音约 55 字），再逐句累加。**顺序反了必然超时。**

可以直接跑：

```bash
node skills/short-video-copy/scripts/timing.mjs --rate 4.5 "你越补觉，越累。" "欠的不是时间，是节奏。"
```

## 边界

- 不编数据。没给数字就用可验证的模糊量，或者直接问。
- 医疗、金融、教育类不写具体效果承诺。
- 不用绝对化用语（最、第一、根治、百分百）。

## 来源与许可证

钩子公式结构、拆解流程、平台差异分别改编自三个 **MIT** 项目，版权行与许可证全文见 [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md)，简短版见 [CREDITS.md](CREDITS.md)。

⚠️ 其中还有一个被间接引用的上游仓库**没有声明许可证**，本项目未使用其内容，具体说明也在 `THIRD-PARTY-NOTICES.md` 里。

本项目自身：MIT。
