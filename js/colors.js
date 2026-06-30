// 歌名 → 专属固定撞色背景(纯函数,DOM 无关)。
// 颜色为深色系,在黑底上显质感、与玫红形成张力。每块用 from→to 做柔和渐变。

export const PALETTE = [
  { from: '#1F6E63', to: '#0D2E2A' }, // 深青绿
  { from: '#274690', to: '#121E3C' }, // 暗钴蓝
  { from: '#5B2A6B', to: '#26122E' }, // 暗紫
  { from: '#2E4D3A', to: '#13211A' }, // 墨绿
  { from: '#8A5A1E', to: '#39250C' }, // 暗琥珀
  { from: '#6B2438', to: '#2C0F18' }, // 酒红偏紫
  { from: '#1E5A6E', to: '#0C262E' }, // 暗孔雀蓝
  { from: '#4A4668', to: '#1E1C2C' }, // 暗靛
];

// FNV-1a 风格的稳定字符串哈希,返回非负整数。
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0; // 转无符号
}

// 歌多于色盘时允许复用同色;优先保证同歌固定。
export function colorForSong(title) {
  const idx = hashString(title || '') % PALETTE.length;
  return PALETTE[idx];
}
