import { test } from 'node:test';
import assert from 'node:assert/strict';
import { angleFromCenter, angleDelta, accumulateScroll, regionForPoint } from '../js/wheel-math.js';

test('angleFromCenter:正上方=0,右=90,下=180,左=270', () => {
  assert.equal(Math.round(angleFromCenter(0, 0, 0, -10)), 0);
  assert.equal(Math.round(angleFromCenter(0, 0, 10, 0)), 90);
  assert.equal(Math.round(angleFromCenter(0, 0, 0, 10)), 180);
  assert.equal(Math.round(angleFromCenter(0, 0, -10, 0)), 270);
});

test('angleDelta:顺时针为正,跨 0 取最短', () => {
  assert.equal(angleDelta(10, 20), 10);
  assert.equal(angleDelta(350, 10), 20);   // 跨 0 顺时针
  assert.equal(angleDelta(10, 350), -20);  // 逆时针
});

test('accumulateScroll:满一格出一步,余量保留', () => {
  const r1 = accumulateScroll(0, 10, 15);
  assert.equal(r1.steps, 0);
  assert.equal(r1.carry, 10);
  const r2 = accumulateScroll(r1.carry, 10, 15); // 累计 20 → 1 步,余 5
  assert.equal(r2.steps, 1);
  assert.equal(r2.carry, 5);
});

test('accumulateScroll:逆时针出负步', () => {
  const r = accumulateScroll(0, -30, 15);
  assert.equal(r.steps, -2);
  assert.equal(r.carry, 0);
});

test('regionForPoint:中心圆', () => {
  assert.equal(regionForPoint(0, 0, 3, 0, 100, 40), 'center');
});

test('regionForPoint:环上四方向', () => {
  assert.equal(regionForPoint(0, 0, 0, -70, 100, 40), 'menu');      // 顶
  assert.equal(regionForPoint(0, 0, 70, 0, 100, 40), 'next');       // 右
  assert.equal(regionForPoint(0, 0, 0, 70, 100, 40), 'playpause');  // 底
  assert.equal(regionForPoint(0, 0, -70, 0, 100, 40), 'prev');      // 左
});

test('regionForPoint:环外', () => {
  assert.equal(regionForPoint(0, 0, 200, 0, 100, 40), 'outside');
});
