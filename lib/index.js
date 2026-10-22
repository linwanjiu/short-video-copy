/**
 * dsh-video-pipeline 插件入口。
 *
 * 挂载后向 ctx.skills 注册一个 provider，把包内 skills/ 目录下的技能
 * 直接送进 agent 的技能目录——不需要往 ~/.dsh/skills 复制任何文件。
 *
 * @module dsh-video-pipeline
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProvider, PROVIDER_NAME } from './provider.js';

/** loader 行里用的插件名。 */
export const name = PROVIDER_NAME;

const SKILLS_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills');

/**
 * 注册内置技能提供者。
 * @param {{ inject: Function }} ctx - cordis 上下文
 * @param {{ enabledSkills?: string[] }} [config] - loader 行配置
 */
export function apply(ctx, config = {}) {
  const settings = config && typeof config === 'object' ? config : {};
  const provider = createProvider({
    skillsDir: SKILLS_DIR,
    enabledSkills: Array.isArray(settings.enabledSkills) ? settings.enabledSkills : [],
  });

  ctx.inject(['skills'], (skillCtx) => {
    skillCtx.skills.registerProvider(() => provider);
  });
}
