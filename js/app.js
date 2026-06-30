import * as store from './store.js';
import { createPlayer } from './player.js';
import { createUI } from './ui.js';
import { attachWheel } from './wheel.js';
import { initialState, reduce } from './screens.js';

const screenEl = document.getElementById('screen');
const wheelEl = document.getElementById('wheel');
const fileInput = document.getElementById('file-input');
const importBtn = document.getElementById('import-btn');
const installHint = document.getElementById('install-hint');

const ui = createUI(screenEl);
const player = createPlayer();

let state = initialState();
let songs = [];
let now = { title: '', artist: '', playing: false, currentTime: 0, duration: 0, volume: 0.8, npMode: 'volume' };

// Track last-rendered now screen title to decide between full and light re-render
let lastRenderedScreen = '';
let lastRenderedTitle = '';

function viewModel() {
  return {
    screen: state.screen,
    menuIndex: state.menuIndex,
    listIndex: state.listIndex,
    songs,
    now: { ...now, npMode: state.npMode },
  };
}
function rerender() {
  const vm = viewModel();
  if (vm.screen === 'now' && lastRenderedScreen === 'now' && vm.now.title === lastRenderedTitle) {
    ui.updateNowProgress(vm.now);
  } else {
    ui.render(vm);
    lastRenderedScreen = vm.screen;
    lastRenderedTitle = vm.now.title;
  }
}

player.on('statechange', (p) => {
  now = { ...now, ...p };
  if (state.screen === 'now') rerender();
});
player.onEnded(() => { /* 播完即停,不自动下一首 */ });
player.needBlob(async (i) => songs[i] ? await store.getSongBlob(songs[i].id) : null);

// Fix #2: auto-skip on playback error with transient DOM notice
// Guard: coalesce duplicate error events for the same index (media 'error' + play() rejection)
const skipInFlight = new Set();
player.onError((failedIndex) => {
  if (songs.length === 0) return;
  // Ignore if this index is already being skipped, or if it's no longer the current track
  if (skipInFlight.has(failedIndex) || failedIndex !== player.currentIndex()) return;
  skipInFlight.add(failedIndex);
  // Show a brief non-blocking notice
  const notice = document.createElement('div');
  notice.className = 'error-notice';
  notice.textContent = '播放失败,跳过';
  document.body.appendChild(notice);
  setTimeout(() => notice.remove(), 3000);
  // Advance exactly once; player.next() no-ops at end of queue, so naturally bounded
  player.next();
  // Clear flag after a tick so future errors on a different index are handled
  setTimeout(() => skipInFlight.delete(failedIndex), 500);
});

async function runEffects(effects) {
  for (const e of effects) {
    if (e.type === 'PLAY_INDEX') {
      player.setQueue(songs);
      const blob = await store.getSongBlob(songs[e.index].id);
      if (blob) player.playIndex(e.index, blob);
    } else if (e.type === 'PLAY_PAUSE') player.togglePlay();
    else if (e.type === 'NEXT') player.next();
    else if (e.type === 'PREV') player.prev();
    else if (e.type === 'SEEK_STEP') player.seekStep(e.dir);
    else if (e.type === 'VOLUME_STEP') player.volumeStep(e.dir);
  }
}

function handleCommand(cmd) {
  // Fix #1: unlock AudioContext synchronously inside gesture call stack
  player.unlock();
  const ctx = { songCount: songs.length, hasCurrent: player.currentIndex() >= 0 };
  const { state: ns, effects } = reduce(state, cmd, ctx);
  state = ns;
  runEffects(effects);
  rerender();
}

attachWheel(wheelEl, handleCommand);

// 导入
async function importFiles(files) {
  for (const f of files) {
    try { await store.addSong(f); }
    catch (err) { alert('导入失败,可能存储空间不够:' + err.message); }
  }
  songs = await store.getAllSongs();
  rerender();
}
importBtn?.addEventListener('click', () => fileInput.click());
// Fix #4: snapshot FileList before clearing value
fileInput?.addEventListener('change', () => {
  const files = Array.from(fileInput.files);
  fileInput.value = '';
  importFiles(files);
});
// 空态里的"点这里导入"按钮(动态生成,事件委托)
screenEl.addEventListener('click', (e) => {
  if (e.target.id === 'import-empty') fileInput.click();
});

// 安装提示:非 standalone 才显示
const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
if (!standalone && installHint) installHint.hidden = false;

// service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js').catch(() => {});
}

// 启动
(async function start() {
  songs = await store.getAllSongs();
  rerender();
})();
