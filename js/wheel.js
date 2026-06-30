import { angleFromCenter, angleDelta, accumulateScroll, regionForPoint } from './wheel-math.js';

export function attachWheel(el, onCommand, opts = {}) {
  const haptics = opts.haptics !== false;
  let dragging = false, moved = false;
  let lastAngle = 0, carry = 0;
  let cx = 0, cy = 0, rOuter = 0, rInner = 0;
  let startRegion = 'outside';
  let holdTimer = null, longPressed = false;

  function geom() {
    const r = el.getBoundingClientRect();
    cx = r.left + r.width / 2;
    cy = r.top + r.height / 2;
    rOuter = r.width / 2;
    rInner = rOuter * 0.42;
  }

  function point(e) {
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX, y: t.clientY };
  }

  function vibrate() { if (haptics && navigator.vibrate) navigator.vibrate(8); }

  function onDown(e) {
    geom();
    const p = point(e);
    dragging = true; moved = false; longPressed = false;
    carry = 0;
    lastAngle = angleFromCenter(cx, cy, p.x, p.y);
    startRegion = regionForPoint(cx, cy, p.x, p.y, rOuter, rInner);
    if (startRegion === 'center') {
      holdTimer = setTimeout(() => { longPressed = true; onCommand('PLAY_PAUSE'); }, 500);
    }
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    const p = point(e);
    const a = angleFromCenter(cx, cy, p.x, p.y);
    const d = angleDelta(lastAngle, a);
    lastAngle = a;
    if (Math.abs(d) > 1.5) { moved = true; if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } }
    const { steps, carry: c } = accumulateScroll(carry, d, opts.stepDeg || 15);
    carry = c;
    for (let i = 0; i < Math.abs(steps); i++) {
      onCommand(steps > 0 ? 'SCROLL_NEXT' : 'SCROLL_PREV');
      vibrate();
    }
    e.preventDefault();
  }

  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    if (longPressed) return;            // 长按已处理
    if (moved) return;                  // 是滑动,不算点击
    const map = { center: 'SELECT', menu: 'MENU', prev: 'PREV', next: 'NEXT', playpause: 'PLAY_PAUSE' };
    const cmd = map[startRegion];
    if (cmd) onCommand(cmd);
  }

  el.addEventListener('touchstart', onDown, { passive: false });
  el.addEventListener('touchmove', onMove, { passive: false });
  el.addEventListener('touchend', onUp);
  el.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}
