// IndexedDB 封装:存储导入的音频文件(Blob)与元数据。

const DB_NAME = 'ipod-db';
const STORE = 'songs';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db, mode) {
  return db.transaction(STORE, mode).objectStore(STORE);
}

// "艺人 - 标题.ext" → {title, artist};无分隔符则整名为 title。
function parseName(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  const parts = base.split(' - ');
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(' - ').trim() };
  }
  return { artist: '', title: base.trim() };
}

export async function addSong(file) {
  const { title, artist } = parseName(file.name);
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = tx(db, 'readwrite');
    const record = { title, artist, type: file.type, blob: file };
    const req = store.add(record);
    req.onsuccess = () => resolve({ id: req.result, title, artist });
    req.onerror = () => reject(req.error);
  });
}

export async function getAllSongs() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const out = [];
    const req = tx(db, 'readonly').openCursor();
    req.onsuccess = () => {
      const cur = req.result;
      if (cur) {
        const { id, title, artist } = cur.value;
        out.push({ id, title, artist });
        cur.continue();
      } else resolve(out);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getSongBlob(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').get(id);
    req.onsuccess = () => resolve(req.result ? req.result.blob : null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSong(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
