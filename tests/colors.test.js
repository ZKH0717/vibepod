import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PALETTE, hashString, colorForSong } from '../js/colors.js';

test('PALETTE 非空且每项有 from/to 十六进制色', () => {
  assert.ok(PALETTE.length >= 6);
  for (const c of PALETTE) {
    assert.match(c.from, /^#[0-9A-Fa-f]{6}$/);
    assert.match(c.to, /^#[0-9A-Fa-f]{6}$/);
  }
});

test('hashString 稳定:同串同值', () => {
  assert.equal(hashString('夜空中最亮的星'), hashString('夜空中最亮的星'));
});

test('hashString 非负', () => {
  assert.ok(hashString('稻香') >= 0);
  assert.ok(hashString('') >= 0);
});

test('colorForSong 稳定:同歌恒返回同一渐变对', () => {
  const a = colorForSong('晴天');
  const b = colorForSong('晴天');
  assert.deepEqual(a, b);
});

test('colorForSong 结果来自 PALETTE', () => {
  const c = colorForSong('七里香');
  assert.ok(PALETTE.some(p => p.from === c.from && p.to === c.to));
});

test('colorForSong 空标题也返回合法渐变对', () => {
  const c = colorForSong('');
  assert.match(c.from, /^#[0-9A-Fa-f]{6}$/);
});
