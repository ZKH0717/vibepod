// 音频播放 + Web Audio 应用内音量。系统音量在 iOS 不可控,用 GainNode 替代。

export function createPlayer() {
  const audio = new Audio();
  audio.preload = 'auto';

  let ctx, gain;
  let volume = 0.8;

  function ensureAudioGraph() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      gain = ctx.createGain();
      gain.gain.value = volume;
      const src = ctx.createMediaElementSource(audio);
      src.connect(gain).connect(ctx.destination);
    } catch (e) {
      // AudioContext unavailable or blocked — swallow so UI navigation keeps working
      console.warn('AudioContext unavailable:', e);
    }
  }

  const listeners = { statechange: [], ended: [], error: [] };
  let needBlobCb = null;
  let queue = [];
  let index = -1;

  function emit() {
    const cur = queue[index] || {};
    const payload = {
      index,
      title: cur.title || '',
      artist: cur.artist || '',
      playing: !audio.paused && !!audio.src,
      currentTime: audio.currentTime || 0,
      duration: isFinite(audio.duration) ? audio.duration : 0,
      volume,
    };
    listeners.statechange.forEach(cb => cb(payload));
  }

  audio.addEventListener('timeupdate', emit);
  audio.addEventListener('play', emit);
  audio.addEventListener('pause', emit);
  audio.addEventListener('loadedmetadata', emit);
  audio.addEventListener('ended', () => listeners.ended.forEach(cb => cb(index)));
  audio.addEventListener('error', () => listeners.error.forEach(cb => cb(index)));

  function playBlob(i, blob) {
    index = i;
    if (audio.src) URL.revokeObjectURL(audio.src);
    audio.src = URL.createObjectURL(blob);
    ensureAudioGraph();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    audio.play().catch(() => listeners.error.forEach(cb => cb(index)));
    setMediaSession();
    emit();
  }

  function setMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const cur = queue[index] || {};
    navigator.mediaSession.metadata = new MediaMetadata({
      title: cur.title || '', artist: cur.artist || '',
    });
    navigator.mediaSession.setActionHandler('play', () => api.togglePlay());
    navigator.mediaSession.setActionHandler('pause', () => api.togglePlay());
    navigator.mediaSession.setActionHandler('previoustrack', () => api.prev());
    navigator.mediaSession.setActionHandler('nexttrack', () => api.next());
  }

  async function gotoRelative(delta) {
    const ni = index + delta;
    if (ni < 0 || ni >= queue.length) return;
    if (!needBlobCb) return;
    const blob = await needBlobCb(ni);
    if (blob) playBlob(ni, blob);
  }

  const api = {
    setQueue(songs) { queue = songs; },
    playIndex(i, blob) { playBlob(i, blob); },
    togglePlay() {
      if (!audio.src) return;
      if (audio.paused) { if (ctx && ctx.state === 'suspended') ctx.resume(); audio.play(); }
      else audio.pause();
    },
    next() { gotoRelative(1); },
    prev() {
      if (audio.currentTime > 3) { audio.currentTime = 0; emit(); }
      else gotoRelative(-1);
    },
    seekStep(dir) {
      if (!audio.src) return;
      const t = Math.max(0, Math.min((audio.duration || 0), audio.currentTime + dir * 5));
      audio.currentTime = t; emit();
    },
    volumeStep(dir) {
      volume = Math.max(0, Math.min(1, +(volume + dir * 0.1).toFixed(2)));
      if (gain) gain.gain.value = volume;
      emit();
    },
    unlock() {
      ensureAudioGraph();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    },
    currentIndex() { return index; },
    on(event, cb) { if (listeners[event]) listeners[event].push(cb); },
    onEnded(cb) { listeners.ended.push(cb); },
    onError(cb) { listeners.error.push(cb); },
    needBlob(cb) { needBlobCb = cb; },
  };
  return api;
}
