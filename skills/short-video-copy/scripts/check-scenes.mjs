#!/usr/bin/env node
/**
 * 校验 content.json 是否符合视频流水线的场景约定。
 *
 *   node scripts/check-scenes.mjs content.json
 *   node scripts/check-scenes.mjs            # 默认读当前目录的 content.json
 *
 * 只读校验，不改文件。退出码 1 表示有错误。
 */
import fs from 'node:fs';
import path from 'node:path';

const RATE = 4.2;
const MIN = 1.2;
const MAX = 3.5;

const LIMITS = {
  title: {text: 10, note: 18, min: 2.2},
  point: {text: 12, note: 20, min: 1.4},
  quote: {text: 12, note: 20, min: 2.0},
  outro: {text: 5, note: 20, min: 2.2},
  stat: {text: 0, note: 0, min: 1.8},
};

const file = process.argv[2] || 'content.json';
const abs = path.resolve(file);
if (!fs.existsSync(abs)) {
  console.error(`找不到文件：${abs}`);
  process.exit(1);
}

const raw = fs.readFileSync(abs, 'utf8').replace(/^\uFEFF/, '');
const content = JSON.parse(raw);
const errors = [];
const warns = [];

const chars = (s) => ((s || '').match(/[\u4e00-\u9fa5A-Za-z0-9]/g) || []).length;
const commas = (s) => ((s || '').match(/[，、；：—]/g) || []).length;
const periods = (s) => ((s || '').match(/[。！？]/g) || []).length;
const speak = (t) => chars(t) / RATE + commas(t) * 0.2 + periods(t) * 0.35;

if (!Array.isArray(content.scenes) || content.scenes.length === 0) {
  errors.push('缺少 scenes 数组，或为空');
}

const scenes = Array.isArray(content.scenes) ? content.scenes : [];

if (!content.style) warns.push('没有 style 字段，视频侧会用默认风格 simple');
if (!content.title) warns.push('没有 title 字段，剪映草稿会用"未命名"');
else if (chars(content.title) > 12) warns.push(`title 超过 12 字（${chars(content.title)}），草稿名会被截断`);

function estimate(s) {
  const base = speak(s.text || '');
  const type = s.type;
  if (type === 'stat') {
    const n = Array.isArray(s.items) ? s.items.length : 0;
    return Math.max(LIMITS.stat.min, 1.8 + Math.max(0, n - 1) * 0.3);
  }
  // 只算口播本身要多久；留白是设计余量，不计入单镜头上限
  return Math.max(LIMITS[type]?.min ?? 1.4, base);
}

const rows = [];
let total = 0;
scenes.forEach((s, i) => {
  const idx = i + 1;
  const type = s.type;
  const lim = LIMITS[type];
  const est = estimate(s);
  const t = chars(s.text || '');
  total += Math.min(MAX, Math.max(MIN, est));

  if (!lim) {
    errors.push(`第 ${idx} 段类型非法：${JSON.stringify(type)}`);
    return;
  }

  if (type === 'stat') {
    const items = Array.isArray(s.items) ? s.items : [];
    if (items.length === 0) errors.push(`第 ${idx} 段（stat）没有 items`);
    if (items.length > 3) errors.push(`第 ${idx} 段（stat）有 ${items.length} 张卡，最多 3 张`);
    items.forEach((it, k) => {
      if (typeof it.value !== 'number') errors.push(`第 ${idx} 段第 ${k + 1} 张卡 value 不是数字`);
      if (chars(it.label) > 6) warns.push(`第 ${idx} 段第 ${k + 1} 张卡 label 超过 6 字`);
    });
  } else {
    if (!t) errors.push(`第 ${idx} 段（${type}）没有 text`);
    else if (t > lim.text) errors.push(`第 ${idx} 段（${type}）正文 ${t} 字，超过 ${lim.text} 字，请拆句`);
  }

  if (est > MAX) warns.push(`第 ${idx} 段估算 ${est.toFixed(1)}s，超过 ${MAX}s 上限，视频侧会压缩`);
  if (est < MIN) warns.push(`第 ${idx} 段估算 ${est.toFixed(1)}s，低于 ${MIN}s，看不清`);

  rows.push({idx, type, text: type === 'stat' ? `${(s.items || []).length} 张卡` : (s.text || '').slice(0, 14), chars: t, est});
});

if (scenes.length && scenes[0].type !== 'title') warns.push('首段不是 title，开场会缺标题屏');
if (scenes.length && scenes[scenes.length - 1].type !== 'outro') warns.push('末段不是 outro，结尾没有收口');

const counts = {};
for (const s of scenes) counts[s.type] = (counts[s.type] || 0) + 1;
for (const [t, n] of Object.entries(counts)) {
  if (n > 3 && t !== 'point') warns.push(`连续/累计 ${t} 用了 ${n} 次，版式会单调`);
}

console.log(`文件：${abs}`);
console.log(`场景：${scenes.length} 段  |  估算时长：${total.toFixed(1)}s  |  风格：${content.style || '(默认)'}`);
console.log('');
console.log('| # | 类型 | 字数 | 估算 | 内容 |');
console.log('|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.idx} | ${r.type} | ${r.chars} | ${r.est.toFixed(1)}s | ${r.text} |`);
}

if (warns.length) {
  console.log('');
  console.log('警告：');
  warns.forEach((w) => console.log('  ! ' + w));
}
if (errors.length) {
  console.log('');
  console.log('错误：');
  errors.forEach((e) => console.log('  × ' + e));
  process.exit(1);
}
console.log('');
console.log('校验通过');
