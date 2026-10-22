#!/usr/bin/env node
/**
 * 口播计时器：按字数和标点算出每句时长，输出可直接贴进文案的表格。
 *
 *   node scripts/timing.mjs --rate 4.5 "你越补觉，越累。" "欠的不是时间，是节奏。"
 *   node scripts/timing.mjs --rate 3.8 --json lines.json
 *
 * 规则见 presets/timing.md：时长 = 字数/语速 + 0.2×逗号 + 0.35×句号
 */
const COMMA = 0.2;
const PERIOD = 0.35;

const args = process.argv.slice(2);
const rateIdx = args.indexOf("--rate");
const rate = rateIdx !== -1 ? Number(args[rateIdx + 1]) : 4.2;
const jsonIdx = args.indexOf("--json");
const jsonPath = jsonIdx !== -1 ? args[jsonIdx + 1] : null;

const skip = new Set();
if (rateIdx !== -1) skip.add(rateIdx).add(rateIdx + 1);
if (jsonIdx !== -1) skip.add(jsonIdx).add(jsonIdx + 1);
let lines = args.filter((_, i) => !skip.has(i));

if (jsonPath) {
  const { readFileSync } = await import("node:fs");
  lines = JSON.parse(readFileSync(jsonPath, "utf8"));
}
if (!lines.length) {
  console.error("用法: node scripts/timing.mjs --rate 4.5 \"台词1\" \"台词2\"");
  process.exit(1);
}

const commas = (s) => (s.match(/[，、；：—]/g) || []).length;
const periods = (s) => (s.match(/[。！？]/g) || []).length;
const chars = (s) => (s.match(/[\u4e00-\u9fa5A-Za-z0-9]/g) || []).length;

let t = 0;
const rows = [];
for (const text of lines) {
  const c = chars(text);
  const d = c / rate + commas(text) * COMMA + periods(text) * PERIOD;
  const start = t;
  t += d;
  rows.push({ start, end: t, chars: c, text });
}

console.log("| 时间 | 字数 | 秒 | 台词 |");
console.log("|---|---|---|---|");
for (const r of rows) {
  console.log(
    `| ${r.start.toFixed(1)}–${r.end.toFixed(1)}s | ${r.chars} | ${(r.end - r.start).toFixed(1)} | ${r.text} |`,
  );
}
const totalChars = rows.reduce((a, r) => a + r.chars, 0);
console.log("");
console.log(`总计 ${t.toFixed(1)}s / ${totalChars} 字 / ${rate} 字每秒`);
if (rows.some((r) => r.end - r.start < 1.2)) console.log("⚠ 有镜头短于 1.2 秒，建议合并");
if (rows.some((r) => r.end - r.start > 6)) console.log("⚠ 有镜头长于 6 秒，建议拆分");
