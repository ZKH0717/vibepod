import { colorForSong } from './colors.js';

function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

export function createUI(screenEl) {
  function renderMenu(menuIndex) {
    const items = ['歌曲', '正在播放'];
    screenEl.className = 'screen screen-menu';
    screenEl.innerHTML = `
      <div class="status-bar"><span class="brand">iPod</span></div>
      <ul class="menu-list">
        ${items.map((t, i) => `<li class="${i === menuIndex ? 'sel' : ''}">${t}<span class="chev">›</span></li>`).join('')}
      </ul>`;
  }

  function renderList(listIndex, songs) {
    screenEl.className = 'screen screen-list';
    if (!songs.length) {
      screenEl.innerHTML = `
        <div class="status-bar"><span>歌曲</span></div>
        <div class="empty"><div class="empty-dot">♪</div><p>还没有歌<br><button id="import-empty">点这里导入</button></p></div>`;
      return;
    }
    screenEl.innerHTML = `
      <div class="status-bar"><span>歌曲</span><span class="count">${listIndex + 1}/${songs.length}</span></div>
      <ul class="song-list">
        ${songs.map((s, i) => `<li class="${i === listIndex ? 'sel' : ''}" data-index="${i}">
          <span class="t">${esc(s.title || '未知')}</span>
          <span class="a">${esc(s.artist || '')}</span>
          <button class="del-btn" data-del-id="${s.id}" aria-label="删除">×</button></li>`).join('')}
      </ul>`;
    const sel = screenEl.querySelector('.song-list li.sel');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  }

  function renderNow(now) {
    screenEl.className = 'screen screen-now';
    const c = colorForSong(now.title || '');
    const pct = now.duration ? (now.currentTime / now.duration) * 100 : 0;
    const volPct = Math.round((now.volume || 0) * 100);
    const modeIcon = now.npMode === 'volume' ? '🔊' : '⏩';
    const bar = now.npMode === 'volume'
      ? `<div class="bar"><div class="fill" style="width:${volPct}%"></div></div>
         <div class="times"><span>音量</span><span>${volPct}%</span></div>`
      : `<div class="bar"><div class="fill" style="width:${pct}%"></div></div>
         <div class="times"><span>${fmtTime(now.currentTime)}</span><span>${fmtTime(now.duration)}</span></div>`;
    screenEl.innerHTML = `
      <div class="np-bg" style="background:linear-gradient(160deg, ${c.from}, ${c.to});"></div>
      <div class="np-content">
        <div class="np-mode">${modeIcon}</div>
        <div class="np-meta">
          <div class="np-title">${esc(now.title || '未知')}</div>
          <div class="np-artist">${esc(now.artist || '')}</div>
        </div>
        <div class="np-state">${now.playing ? '▶' : '❚❚'}</div>
        ${bar}
      </div>`;
  }

  return {
    render(view) {
      if (view.screen === 'menu') renderMenu(view.menuIndex);
      else if (view.screen === 'list') renderList(view.listIndex, view.songs);
      else renderNow(view.now);
    },
    // Fix #5: light update for now-playing screen — avoids full innerHTML rebuild on every timeupdate
    updateNowProgress(now) {
      const fill = screenEl.querySelector('.fill');
      const times = screenEl.querySelector('.times');
      const modeEl = screenEl.querySelector('.np-mode');
      if (!fill || !times || !modeEl) { return; }
      const pct = now.duration ? (now.currentTime / now.duration) * 100 : 0;
      const volPct = Math.round((now.volume || 0) * 100);
      const modeIcon = now.npMode === 'volume' ? '🔊' : '⏩';
      modeEl.textContent = modeIcon;
      if (now.npMode === 'volume') {
        fill.style.width = volPct + '%';
        times.innerHTML = `<span>音量</span><span>${volPct}%</span>`;
      } else {
        fill.style.width = pct + '%';
        times.innerHTML = `<span>${fmtTime(now.currentTime)}</span><span>${fmtTime(now.duration)}</span>`;
      }
      // update play/pause indicator
      const stateEl = screenEl.querySelector('.np-state');
      if (stateEl) stateEl.textContent = now.playing ? '▶' : '❚❚';
    },
  };
}
