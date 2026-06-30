// 导航状态机:纯 reducer。状态由调用方持有,reduce 返回新状态 + 副作用列表。

export function initialState() {
  return { screen: 'menu', menuIndex: 0, listIndex: 0, npMode: 'volume' };
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function reduce(state, command, ctx) {
  const s = { ...state };
  const effects = [];
  const { songCount, hasCurrent } = ctx;

  if (s.screen === 'menu') {
    if (command === 'SCROLL_NEXT') s.menuIndex = clamp(s.menuIndex + 1, 0, 1);
    else if (command === 'SCROLL_PREV') s.menuIndex = clamp(s.menuIndex - 1, 0, 1);
    else if (command === 'SELECT') {
      if (s.menuIndex === 0) s.screen = 'list';
      else if (hasCurrent) s.screen = 'now';
    }
    return { state: s, effects };
  }

  if (s.screen === 'list') {
    if (command === 'SCROLL_NEXT') s.listIndex = clamp(s.listIndex + 1, 0, Math.max(0, songCount - 1));
    else if (command === 'SCROLL_PREV') s.listIndex = clamp(s.listIndex - 1, 0, Math.max(0, songCount - 1));
    else if (command === 'SELECT') {
      if (songCount > 0) {
        effects.push({ type: 'PLAY_INDEX', index: s.listIndex });
        s.screen = 'now';
      }
    } else if (command === 'MENU') s.screen = 'menu';
    return { state: s, effects };
  }

  // now
  if (command === 'SCROLL_NEXT' || command === 'SCROLL_PREV') {
    const dir = command === 'SCROLL_NEXT' ? 1 : -1;
    effects.push(s.npMode === 'volume'
      ? { type: 'VOLUME_STEP', dir }
      : { type: 'SEEK_STEP', dir });
  } else if (command === 'SELECT') {
    s.npMode = s.npMode === 'volume' ? 'progress' : 'volume';
  } else if (command === 'NEXT') effects.push({ type: 'NEXT' });
  else if (command === 'PREV') effects.push({ type: 'PREV' });
  else if (command === 'PLAY_PAUSE') effects.push({ type: 'PLAY_PAUSE' });
  else if (command === 'MENU') s.screen = 'list';
  return { state: s, effects };
}
