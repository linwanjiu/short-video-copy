# 第三方声明

本项目的部分结构与公式改编自以下开源项目。**所有被使用的项目均为 MIT 协议**，允许商用、修改、再分发，条件是保留版权声明与许可证文本。

## 1. rediumvex/viral-hooks-skill

- 地址：https://github.com/rediumvex/viral-hooks-skill
- 许可证：MIT
- 版权：Copyright (c) 2026 Roman Knox
- 用在哪：`presets/hooks.md` 的八类钩子划分与公式骨架
- 改动：公式模板按中文语境重写，示例全部替换，压缩 10 类为 8 类

## 2. hongfamonvAI/hook-lab

- 地址：https://github.com/hongfamonvAI/hook-lab
- 许可证：MIT
- 版权：Copyright (c) 2026 Patrick
- 用在哪：`references/analysis.md` 的拆解流程、风格标签、改写方向结构
- 改动：去掉原项目的 yt-dlp 抓取脚本，改为"有链接先抓，抓不到就请用户提供"，并本地化输出格式

## 3. feichanggege/ecommerce-visual-copywriting-skill

- 地址：https://github.com/feichanggege/ecommerce-visual-copywriting-skill
- 许可证：MIT
- 版权：Copyright (c) 2026 OpenClaw Community
- 用在哪：`presets/platforms.md` 的平台差异思路（原项目为电商视觉 playbook）
- 改动：从"电商页面视觉"改写为"短视频节奏与 CTA"，平台范围改为抖音/小红书/视频号/B站

## 关于 jakeolschewski/social-media-hooks-database

- 地址：https://github.com/jakeolschewski/social-media-hooks-database
- 许可证：**仓库未声明任何许可证**
- 状态：**本项目未直接使用该仓库的任何内容。**
  rediumvex 的 MIT 项目在 README 中称其钩子库改编自该仓库，我们只从 rediumvex 的 MIT 版本获取结构，不接触上游原文。
- 建议：如果你打算直接使用该仓库的内容，请先联系作者取得授权；无许可证默认保留所有权利。

---

## MIT 许可证全文（适用于上述三个项目）

```
MIT License

Copyright (c) 2026 Roman Knox
Copyright (c) 2026 Patrick
Copyright (c) 2026 OpenClaw Community

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
