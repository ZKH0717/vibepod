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

function viewModel() {
  return {
    screen: state.screen,
    menuIndex: state.menuIndex,
    listIndex: state.listIndex,
    songs,
    now: { ...now, npMode: state.npMode },
  };
}
function rerender() { ui.render(viewModel()); }

player.on('statechange', (p) => {
  now = { ...now, ...p };
  if (state.screen === 'now') rerender();
});
player.onEnded(() => { /* MVP:播完即停,不自动下一首 */ });
player.needBlob(async (i) => songs[i] ? await store.getSongBlob(songs[i].id) : null);

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
  const ctx = { songCount: songs.length, hasCurrent: player.currentIndex() >= 0 };
  const { state: ns, effects } = reduce(state, cmd, ctx);
  state = ns;
  runEffects(effects);
  rerender();
}

attachWheel(wheelEl, handleCommand);

// 导入
async function importFiles(fileList) {
  for (const f of fileList) {
    try { await store.addSong(f); }
    catch (err) { alert('导入失败,可能存储空间不够:' + err.message); }
  }
  songs = await store.getAllSongs();
  rerender();
}
importBtn?.addEventListener('click', () => fileInput.click());
fileInput?.addEventListener('change', () => { importFiles(fileInput.files); fileInput.value = ''; });
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
