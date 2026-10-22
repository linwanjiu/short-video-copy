# profile · 当前预设

改这里就换风格，不用动 SKILL.md。删掉某行 = 回到默认。

```yaml
# 平台：抖音 / 小红书 / 视频号 / B站 / 通用
platform: 通用

# 品类：知识科普 / 带货 / 个人IP / 剧情 / 口播
category: 通用

# 调性：清晰直接 / 犀利 / 亲切 / 幽默 / 克制专业
tone: 清晰直接

# 时长（秒）：15 / 30 / 60 / 90
duration: 30

# 信息密度：低（留白多，情绪为主）/ 中 / 高（干货密集）
density: 中

# 人称：第二人称 / 第一人称 / 无人称
person: 第二人称

# 结尾动作：关注 / 收藏 / 评论互动 / 转发 / 点击小黄车 / 私信
cta: 关注

# 禁用词，命中就重写那句
banned: 赋能, 闭环, 抓手, 颗粒度

# 必带元素，逗号分隔，可留空
must_include: 一个具体数字
```

## 常用组合

| 想做 | 这样填 |
|---|---|
| 抖音知识号 | `platform: 抖音` `category: 知识科普` `tone: 犀利` `duration: 15` `density: 高` |
| 小红书种草 | `platform: 小红书` `category: 带货` `tone: 亲切` `duration: 45` `density: 低` `cta: 收藏` |
| 视频号个人IP | `platform: 视频号` `category: 个人IP` `tone: 克制专业` `duration: 60` `cta: 转发` |
| B站硬核 | `platform: B站` `category: 知识科普` `tone: 克制专业` `duration: 90` `density: 高` |

## 改动记录

- 2026-10-22 初始版本，通用参数
