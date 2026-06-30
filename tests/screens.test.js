import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce } from '../js/screens.js';

const ctx = (songCount = 3, hasCurrent = false) => ({ songCount, hasCurrent });

test('初始在主菜单,menuIndex 0', () => {
  const s = initialState();
  assert.equal(s.screen, 'menu');
  assert.equal(s.menuIndex, 0);
});

test('菜单 SCROLL_NEXT 移到正在播放项,边界停住', () => {
  let { state } = reduce(initialState(), 'SCROLL_NEXT', ctx());
  assert.equal(state.menuIndex, 1);
  ({ state } = reduce(state, 'SCROLL_NEXT', ctx())); // 已在底,停住
  assert.equal(state.menuIndex, 1);
});

test('菜单选"歌曲"进入列表', () => {
  const { state } = reduce(initialState(), 'SELECT', ctx());
  assert.equal(state.screen, 'list');
});

test('菜单选"正在播放":无当前歌则忽略,有则进入', () => {
  let s = reduce(initialState(), 'SCROLL_NEXT', ctx()).state; // menuIndex=1
  let r = reduce(s, 'SELECT', ctx(3, false));
  assert.equal(r.state.screen, 'menu'); // 忽略
  r = reduce(s, 'SELECT', ctx(3, true));
  assert.equal(r.state.screen, 'now');
});

test('列表 SELECT 播放当前项并进入 now', () => {
  let s = reduce(initialState(), 'SELECT', ctx()).state; // list
  s = reduce(s, 'SCROLL_NEXT', ctx()).state;             // listIndex=1
  const r = reduce(s, 'SELECT', ctx());
  assert.equal(r.state.screen, 'now');
  assert.deepEqual(r.effects, [{ type: 'PLAY_INDEX', index: 1 }]);
});

test('列表 listIndex 边界:不越界', () => {
  let s = reduce(initialState(), 'SELECT', ctx()).state;
  s = reduce(s, 'SCROLL_PREV', ctx()).state; // 已在 0,停住
  assert.equal(s.listIndex, 0);
});

test('空列表 SELECT 不进入 now', () => {
  let s = reduce(initialState(), 'SELECT', ctx(0)).state;
  const r = reduce(s, 'SELECT', ctx(0));
  assert.equal(r.state.screen, 'list');
  assert.deepEqual(r.effects, []);
});

test('MENU 逐级返回:now→list→menu', () => {
  let s = reduce(initialState(), 'SELECT', ctx()).state;      // list
  s = reduce(s, 'SELECT', ctx()).state;                       // now
  s = reduce(s, 'MENU', ctx()).state;
  assert.equal(s.screen, 'list');
  s = reduce(s, 'MENU', ctx()).state;
  assert.equal(s.screen, 'menu');
});

test('now:SELECT 切换 npMode volume↔progress', () => {
  let s = reduce(initialState(), 'SELECT', ctx()).state; // list
  s = reduce(s, 'SELECT', ctx()).state;                  // now,默认 volume
  assert.equal(s.npMode, 'volume');
  s = reduce(s, 'SELECT', ctx()).state;
  assert.equal(s.npMode, 'progress');
});

test('now:SCROLL 按模式产出 VOLUME_STEP / SEEK_STEP', () => {
  let s = reduce(initialState(), 'SELECT', ctx()).state;
  s = reduce(s, 'SELECT', ctx()).state; // now,volume
  let r = reduce(s, 'SCROLL_NEXT', ctx());
  assert.deepEqual(r.effects, [{ type: 'VOLUME_STEP', dir: 1 }]);
  s = reduce(s, 'SELECT', ctx()).state; // progress
  r = reduce(s, 'SCROLL_PREV', ctx());
  assert.deepEqual(r.effects, [{ type: 'SEEK_STEP', dir: -1 }]);
});

test('now:NEXT/PREV/PLAY_PAUSE 产出对应 effect', () => {
  let s = reduce(initialState(), 'SELECT', ctx()).state;
  s = reduce(s, 'SELECT', ctx()).state; // now
  assert.deepEqual(reduce(s, 'NEXT', ctx()).effects, [{ type: 'NEXT' }]);
  assert.deepEqual(reduce(s, 'PREV', ctx()).effects, [{ type: 'PREV' }]);
  assert.deepEqual(reduce(s, 'PLAY_PAUSE', ctx()).effects, [{ type: 'PLAY_PAUSE' }]);
});
