/**
 * 插件接口自测：用假的 ctx 捕获 provider，不需要启动 DSH。
 *   node test/plugin.test.mjs
 */
import assert from 'node:assert/strict';
import { apply, name } from '../lib/index.js';

let provider;
const ctx = {
  inject(deps, fn) {
    assert.deepEqual(deps, ['skills']);
    fn({ skills: { registerProvider: (factory) => (provider = factory()) } });
  },
};

apply(ctx, {});
assert.ok(provider, 'provider 应当被注册');
assert.equal(provider.name, name);
assert.equal(typeof provider.list, 'function');

const list = await provider.list();
assert.ok(list.length >= 1, '应至少发现一个技能');

const skill = list.find((s) => s.name === 'short-video-copy');
assert.ok(skill, '应发现 short-video-copy');
assert.equal(skill.source, 'bundled');
assert.equal(skill.rank, 600);
assert.ok(skill.description.includes('短视频'), 'description 应说明用途');

const def = await provider.get(skill);
assert.ok(def);
assert.ok(def.content.includes('钩子'), '正文应包含钩子方法论');
assert.ok(def.content.includes('分镜'), '正文应包含分镜规则');
assert.ok(def.content.includes('时间必须算'), '正文应包含计时规则');

const abort = new AbortController();
abort.abort();
assert.deepEqual(await provider.list({ signal: abort.signal }), []);
assert.equal(await provider.get(skill, { signal: abort.signal }), undefined);

let filtered;
apply({ inject: (_d, fn) => fn({ skills: { registerProvider: (f) => (filtered = f()) } }) }, { enabledSkills: ['nope'] });
assert.deepEqual(await filtered.list(), []);

console.log('插件自测通过');
console.log('  技能:', list.map((s) => s.name).join(', '));
console.log('  正文长度:', def.content.length, '字符');
