// 轮盘的纯数学:角度、最短角差、滚动累计、点击落区。DOM 无关。

// 12 点钟为 0,顺时针增大,返回 [0,360)。
export function angleFromCenter(cx, cy, x, y) {
  const dx = x - cx;
  const dy = y - cy;
  let deg = Math.atan2(dx, -dy) * 180 / Math.PI; // -dy:屏幕 y 向下
  if (deg < 0) deg += 360;
  return deg;
}

// 最短带符号差 (-180,180],正=顺时针。
export function angleDelta(prev, next) {
  let d = next - prev;
  while (d > 180) d -= 360;
  while (d <= -180) d += 360;
  return d;
}

// 累计角度,每满 stepDeg 产出一格;返回 {steps, carry}。
export function accumulateScroll(carry, deltaDeg, stepDeg = 15) {
  const total = carry + deltaDeg;
  const steps = Math.trunc(total / stepDeg);
  const newCarry = total - steps * stepDeg;
  return { steps, carry: newCarry };
}

// 落区判定。
export function regionForPoint(cx, cy, x, y, rOuter, rInner) {
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy);
  if (dist < rInner) return 'center';
  if (dist > rOuter) return 'outside';
  const a = angleFromCenter(cx, cy, x, y);
  if (a >= 315 || a < 45) return 'menu';   // 顶
  if (a < 135) return 'next';              // 右
  if (a < 225) return 'playpause';         // 底
  return 'prev';                           // 左
}
