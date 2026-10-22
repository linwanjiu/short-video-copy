#!/usr/bin/env node
/**
 * short-video-copy 安装器
 *
 *   npx -y linwanjiu/short-video-copy
 *   node bin/install.mjs --dir "D:\work\skills"
 *
 * 只做一件事：把 skills/short-video-copy 复制到 DSH 的用户技能目录。
 * 已存在的 profile.md 默认不覆盖（那是用户的设置），要覆盖加 --force。
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(HERE, '..');
const SKILL_SRC = path.join(PKG_ROOT, 'skills', 'short-video-copy');

const args = process.argv.slice(2);
const opt = (name, fallback = '') => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
const FORCE = args.includes('--force');
const DIR = path.resolve(opt('dir', path.join(os.homedir(), '.dsh', 'skills')));
const DEST = path.join(DIR, 'short-video-copy');

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;

if (!fs.existsSync(path.join(SKILL_SRC, 'SKILL.md'))) {
  console.error(`找不到技能源目录：${SKILL_SRC}`);
  process.exit(1);
}

fs.mkdirSync(DEST, { recursive: true });

const kept = [];
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) {
      copyDir(s, d);
      continue;
    }
    if (!FORCE && e.name === 'profile.md' && fs.existsSync(d)) {
      kept.push(path.relative(SKILL_SRC, s));
      continue;
    }
    fs.copyFileSync(s, d);
  }
}

copyDir(SKILL_SRC, DEST);

console.log('');
console.log(`short-video-copy 已安装到 ${DEST}`);
if (kept.length) console.log(yellow(`  保留了你的 ${kept.join(', ')}（要覆盖加 --force）`));
console.log('');
console.log(green('下一步'));
console.log('  在 DSH 新会话里说：写个短视频文案，主题是「…」');
console.log(dim('  或先打开 profile.md 设定平台与调性'));
console.log('');
