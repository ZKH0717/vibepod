// 一次性脚本：用 Node 内置 zlib 生成合法 PNG 图标（深色底 + 玫红圆环 + 中心实心圆）。
// 零依赖。生成后此脚本可删除。
import zlib from 'node:zlib';
import { writeFileSync } from 'node:fs';

const BG = [0x0a, 0x0a, 0x0c];       // #0A0A0C 近黑
const ROSE = [0xe0, 0x47, 0x6b];     // #E0476B 玫红

// 基于 512 的设计参数
const BASE = 512;
const RING_R = 150;       // 圆环半径
const RING_W = 14;        // 圆环线宽（比 svg 略粗，缩小后更清晰）
const CENTER_R = 58;      // 中心实心圆半径

function blend(bg, fg, a) {
  return Math.round(bg * (1 - a) + fg * a);
}

function renderRGBA(size) {
  const s = size / BASE;
  const cx = size / 2, cy = size / 2;
  const ringR = RING_R * s, ringW = RING_W * s, centerR = CENTER_R * s;
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      const dist = Math.hypot(dx, dy);
      let r = BG[0], g = BG[1], b = BG[2];
      // 圆环：|dist - ringR| <= ringW/2，边缘 1px 抗锯齿
      const ringEdge = Math.abs(dist - ringR) - ringW / 2;
      const ringCov = Math.max(0, Math.min(1, 0.5 - ringEdge));
      if (ringCov > 0) {
        r = blend(r, ROSE[0], ringCov); g = blend(g, ROSE[1], ringCov); b = blend(b, ROSE[2], ringCov);
      }
      // 中心实心圆
      const cenCov = Math.max(0, Math.min(1, 0.5 - (dist - centerR)));
      if (cenCov > 0) {
        r = blend(r, ROSE[0], cenCov); g = blend(g, ROSE[1], cenCov); b = blend(b, ROSE[2], cenCov);
      }
      const i = (y * size + x) * 4;
      buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = 255;
    }
  }
  return buf;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}

function toPNG(rgba, size) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  // 每行前缀 filter byte 0
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

for (const size of [180, 192, 512]) {
  const png = toPNG(renderRGBA(size), size);
  writeFileSync(`icons/icon-${size}.png`, png);
  console.log(`wrote icons/icon-${size}.png (${png.length} bytes)`);
}
