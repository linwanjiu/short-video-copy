/**
 * 内置技能提供者。
 *
 * DSH 通过 ctx.skills 的 provider 注册表解析技能。Dsh 期望的接口很小：
 *   { name, list(lookup) -> candidate[], get(candidate, lookup) -> definition }
 *
 * 本模块只做两件事：一层目录扫描 + frontmatter 解析。
 * 没有运行时依赖，安装不会因为 peer 版本冲突炸掉。
 *
 * @module short-video-copy/provider
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';

/** 包内技能的优先级：低于用户自己的项目/用户级技能，避免抢占同名技能。 */
export const BUNDLED_SKILL_RANK = 600;

/** 注册到 ctx.skills 的 provider 名。 */
export const PROVIDER_NAME = 'short-video-copy';

const SKILL_FILE = 'SKILL.md';
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEY_RE = /^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/;

function unquote(value) {
  const text = value.trim();
  if (text.length >= 2) {
    const a = text[0];
    const b = text[text.length - 1];
    if ((a === '"' && b === '"') || (a === "'" && b === "'")) return text.slice(1, -1);
  }
  return text;
}

/**
 * 解析 `---` 包裹的 frontmatter，返回属性与正文。
 * 只支持浅层标量：本项目自己的技能就是这么写的。
 */
export function parseFrontmatter(raw) {
  const lines = String(raw).split(/\r?\n/);
  if (!lines.length || lines[0].trim() !== '---') throw new Error('frontmatter 必须以 --- 开头');
  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end < 0) throw new Error('frontmatter 没有闭合的 ---');

  const attrs = {};
  let lastKey = '';
  for (let i = 1; i < end; i += 1) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (/^[ \t]/.test(line)) {
      if (lastKey) attrs[lastKey] = `${attrs[lastKey]} ${line.trim()}`.trim();
      continue;
    }
    const m = KEY_RE.exec(line.trim());
    if (!m) continue;
    lastKey = m[1];
    attrs[lastKey] = unquote(m[2]);
  }
  return { attrs, body: lines.slice(end + 1).join('\n') };
}

function discover(skillsDir, warn) {
  let dirents;
  try {
    dirents = readdirSync(skillsDir, { withFileTypes: true });
  } catch (error) {
    warn(`读不到技能目录 ${skillsDir}: ${error.message}`);
    return [];
  }
  const found = [];
  for (const d of dirents) {
    const full = join(skillsDir, d.name);
    if (d.isDirectory()) {
      const file = join(full, SKILL_FILE);
      try {
        if (statSync(file).isFile()) found.push({ dir: full, file });
      } catch {
        warn(`跳过 ${d.name}: 没有 ${SKILL_FILE}`);
      }
      continue;
    }
    if (d.isFile() && d.name.endsWith('.md') && d.name !== SKILL_FILE) {
      found.push({ dir: skillsDir, file: full });
    }
  }
  return found;
}

/**
 * 创建 provider。
 * @param {{ skillsDir: string, enabledSkills?: string[], onWarn?: (m: string) => void }} options
 */
export function createProvider(options = {}) {
  const { skillsDir, enabledSkills = [], onWarn } = options;
  const warn = typeof onWarn === 'function' ? onWarn : () => {};
  const allowed = new Set(enabledSkills.map(String));
  let cache;

  function candidates() {
    if (cache) return cache;
    cache = discover(skillsDir, warn)
      .map(({ dir, file }) => {
        let parsed;
        try {
          parsed = parseFrontmatter(readFileSync(file, 'utf8'));
        } catch (error) {
          warn(`跳过 ${file}: ${error.message}`);
          return undefined;
        }
        const name = String(parsed.attrs.name || '').trim();
        if (!NAME_RE.test(name)) {
          warn(`跳过 ${file}: name 必须是 kebab-case，实际是 ${JSON.stringify(parsed.attrs.name)}`);
          return undefined;
        }
        const description = String(parsed.attrs.description || '').trim();
        if (!description) {
          warn(`跳过 ${name}: 缺少 description`);
          return undefined;
        }
        const whenToUse = parsed.attrs.whenToUse ? String(parsed.attrs.whenToUse).trim() : undefined;
        const dirName = basename(dir);
        if (file === join(dir, SKILL_FILE) && dirName !== name) {
          warn(`${name}: 目录名 ${dirName} 与 frontmatter 不一致（以 frontmatter 为准）`);
        }
        return {
          name,
          description,
          whenToUse,
          invocation: { modelInvocable: true, userInvocable: true },
          source: 'bundled',
          provider: PROVIDER_NAME,
          path: file,
          resourceBase: { kind: 'directory', path: dir },
          rank: BUNDLED_SKILL_RANK,
          locator: file,
        };
      })
      .filter(Boolean)
      .filter((c) => allowed.size === 0 || allowed.has(c.name))
      .sort((a, b) => a.name.localeCompare(b.name));
    return cache;
  }

  return {
    name: PROVIDER_NAME,

    async list(lookup) {
      if (lookup?.signal?.aborted) return [];
      return candidates();
    },

    async get(candidate, lookup) {
      if (lookup?.signal?.aborted) return undefined;
      let parsed;
      try {
        parsed = parseFrontmatter(readFileSync(candidate.locator, 'utf8'));
      } catch (error) {
        warn(`无法加载 ${candidate.name}: ${error.message}`);
        return undefined;
      }
      return {
        name: candidate.name,
        description: candidate.description,
        whenToUse: candidate.whenToUse,
        invocation: candidate.invocation,
        source: 'bundled',
        provider: PROVIDER_NAME,
        path: candidate.path,
        resourceBase: candidate.resourceBase,
        content: parsed.body.replace(/^\s*\n/, ''),
      };
    },
  };
}
