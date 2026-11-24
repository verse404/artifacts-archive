(function () {
  'use strict';

  const { WORLD_MAP_GZ_B64, MUSEUMS, BM_PLACE_NAMES } = window.MUSEUM_DATA || {};
  if (!MUSEUMS) return;
  const INITIAL_RAW_HASH = window.location.hash || '';

  const DEG2RAD = Math.PI / 180;
  const EARTH_KM = 6371;
  const SUPPORTED_MUSEUMS = Object.keys(MUSEUMS);
  const STORAGE_SAVED_KEY = 'artifacts_archive_saved_v1';
  const STORAGE_BEST_KEY = 'artifacts_archive_quiz_best_v1';

  const STORY_INDEX = [
    { id: 'silkroad', en: '01 · Oases of the Silk Road', zh: '01 · 丝路遗珍与石窟流散', subEn: '6 stops · 5 museums · 37,195 km', subZh: '6 件国宝 · 5 馆 · 37,195 km' },
    { id: 'benin', en: '02 · Benin & West African Courts', zh: '02 · 贝宁与西非王庭圣器', subEn: '6 stops · 4 museums · 33,063 km', subZh: '6 件国宝 · 4 馆 · 33,063 km' },
    { id: 'scripts', en: '03 · Deciphering Ancient Scripts', zh: '03 · 破译五千年古文字密码', subEn: '6 stops · 4 museums · 34,618 km', subZh: '6 件国宝 · 4 馆 · 34,618 km' },
    { id: 'monuments', en: '04 · Divided Monuments', zh: '04 · 同殿异乡：分裂的古迹', subEn: '6 stops · 4 museums · 28,969 km', subZh: '6 件国宝 · 4 馆 · 28,969 km' },
    { id: 'oceans', en: '05 · Across Three Oceans', zh: '05 · 跨越重洋：瓷路与远航', subEn: '6 stops · 3 museums · 53,380 km', subZh: '6 件国宝 · 3 馆 · 53,380 km' }
  ];

  const ERA_INDEX = [
    { id: 'neolithic', en: 'Neolithic & Early Rivers (6000–2000 BC)', zh: '新石器与早期大河文明（前6000–前2000）', lo: -6500, hi: -2000 },
    { id: 'bronze', en: 'Bronze Age Empires (2000–1000 BC)', zh: '青铜帝国时代（前2000–前1000）', lo: -2000, hi: -1000 },
    { id: 'axial', en: 'Iron & Axial Age (1000–300 BC)', zh: '铁器与轴心时代（前1000–前300）', lo: -1000, hi: -300 },
    { id: 'classical', en: 'Classical Empires (300 BC – AD 500)', zh: '古典帝国时代（前300–公元500）', lo: -300, hi: 500 },
    { id: 'medieval', en: 'Medieval & Silk Road (AD 500–1400)', zh: '中世纪与丝路盛世（公元500–1400）', lo: 500, hi: 1400 },
    { id: 'earlymod', en: 'Renaissance & Ming–Qing (1400–1800)', zh: '文艺复兴与明清时期（1400–1800）', lo: 1400, hi: 1800 },
    { id: 'modern', en: 'Modern World (1800–2023)', zh: '近现代世界（1800–2023）', lo: 1800, hi: 2030 }
  ];

  const QUIZ_ERA_BUCKETS = [
    { id: 'ancient', en: 'Ancient (Before 300 BC)', zh: '上古（公元前300年以前）', lo: -20000, hi: -300 },
    { id: 'classical', en: 'Classical (300 BC – AD 500)', zh: '古典（前300–公元500）', lo: -299, hi: 500 },
    { id: 'medieval', en: 'Medieval (AD 500 – 1450)', zh: '中古（公元500–1450）', lo: 501, hi: 1450 },
    { id: 'modern', en: 'Early Modern & Modern (1450+)', zh: '明清近现代（1450年以后）', lo: 1451, hi: 2030 }
  ];

  const SPLIT_TWIN_PRESETS = [
    { id: 'idia', en: 'Twin Queen Idia Masks (BM ↔ Met)', zh: '孪生伊迪亚象牙面具（大英 ↔ 大都会）', a: 'bm:45', b: 'met:29' },
    { id: 'parthenon', en: 'Parthenon Marbles (BM ↔ Louvre)', zh: '帕特农神庙雕塑（大英 ↔ 卢浮宫）', a: 'bm:34', b: 'louvre:26' },
    { id: 'scripts', en: 'Rosetta Stone ↔ Code of Hammurabi', zh: '罗塞塔石碑 ↔ 汉谟拉比法典', a: 'bm:17', b: 'louvre:0' },
    { id: 'silkroad', en: 'Dunhuang ↔ Khara-Khoto Silks', zh: '敦煌绢画 ↔ 黑水城曼荼罗', a: 'bm:3', b: 'hermitage:0' },
    { id: 'nile', en: 'Bust of Nefertiti ↔ Temple of Dendur', zh: '娜芙蒂蒂胸像 ↔ 丹铎神庙', a: 'berlin:0', b: 'met:9' }
  ];

  // Build unified index of all 325 curated masterpieces & 101 homelands
  const MASTERPIECES = [];
  const MASTER_BY_KEY = new Map();
  const HOMELANDS_MAP = new Map();

  function parseMidYear(dateStr) {
    const s = String(dateStr || '').trim();
    if (!s) return 0;
    const bcMatches = s.match(/(\d+)\s*BC/gi);
    const nums = s.match(/\d+/g);
    if (!nums || !nums.length) return 0;
    const isBc = Boolean(bcMatches && bcMatches.length > 0);
    const n1 = parseInt(nums[0], 10);
    const n2 = nums.length > 1 ? parseInt(nums[1], 10) : n1;
    if (isBc) {
      const hasAd = /\bAD\b/i.test(s) || (bcMatches.length === 1 && nums.length > 1 && n2 < n1 && !/BC\s*$/i.test(s));
      const y1 = -n1;
      const y2 = hasAd ? n2 : -n2;
      return Math.round((y1 + y2) * 0.5);
    }
    return Math.round((n1 + n2) * 0.5);
  }

  function haversineKm(lon1, lat1, lon2, lat2) {
    const p1 = lat1 * DEG2RAD;
    const p2 = lat2 * DEG2RAD;
    const dp = (lat2 - lat1) * DEG2RAD;
    const dl = (lon2 - lon1) * DEG2RAD;
    const a = Math.sin(dp * 0.5) * Math.sin(dp * 0.5) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl * 0.5) * Math.sin(dl * 0.5);
    return 2 * EARTH_KM * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  function lonLatToVec3(lon, lat) {
    const phi = lat * DEG2RAD;
    const lam = lon * DEG2RAD;
    const c = Math.cos(phi);
    return [c * Math.sin(lam), Math.sin(phi), c * Math.cos(lam)];
  }

  function rotateVec(vx, vy, vz, cosLon, sinLon, cosLat, sinLat) {
    const x1 = vx * cosLon + vz * sinLon;
    const z1 = -vx * sinLon + vz * cosLon;
    const y2 = vy * cosLat - z1 * sinLat;
    const z2 = vy * sinLat + z1 * cosLat;
    return [x1, y2, z2];
  }

  function slerpVec3(a, b, u) {
    let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    dot = Math.max(-1, Math.min(1, dot));
    const om = Math.acos(dot);
    if (om < 1e-4) return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
    const s = Math.sin(om);
    const wA = Math.sin((1 - u) * om) / s;
    const wB = Math.sin(u * om) / s;
    return [a[0] * wA + b[0] * wB, a[1] * wA + b[1] * wB, a[2] * wA + b[2] * wB];
  }

  (function buildCatalogIndices() {
    for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
      const mid = SUPPORTED_MUSEUMS[mIdx];
      const m = MUSEUMS[mid];
      if (!m) continue;
      let localOffset = 0;
      const cMeta = {};
      for (let r = 0; r < m.countriesSpec.length; r++) {
        const [cEn, cZh, cnt, , cLon, cLat] = m.countriesSpec[r];
        cMeta[cEn] = { zh: cZh, lon: cLon, lat: cLat, offset: localOffset };
        if (!HOMELANDS_MAP.has(cEn)) {
          HOMELANDS_MAP.set(cEn, { en: cEn, zh: cZh, lon: cLon, lat: cLat, total: 0, museums: 0 });
        }
        const h = HOMELANDS_MAP.get(cEn);
        h.total += cnt;
        h.museums += 1;
        localOffset += cnt;
      }

      const fMap = m.featuredByCountry || {};
      const cKeys = Object.keys(fMap);
      for (let k = 0; k < cKeys.length; k++) {
        const cEn = cKeys[k];
        const cm = cMeta[cEn];
        if (!cm) continue;
        const list = fMap[cEn] || [];
        for (let i = 0; i < list.length; i++) {
          const f = list[i];
          const key = mid + ':' + f.sprite;
          const distKm = cEn === m.hostCountryEn ? 0 : Math.round(haversineKm(cm.lon, cm.lat, m.hostLon, m.hostLat));
          const midYr = parseMidYear(f.date);
          const rawReg = f.reg || '';
          const fullReg = rawReg
            ? ((rawReg.startsWith(m.regPrefix + ' ') || rawReg.startsWith(m.regPrefix + '.')) ? rawReg : (m.regPrefix + ' ' + rawReg))
            : m.regPrefix;
          const item = {
            key,
            museumId: mid,
            sprite: f.sprite,
            localId: cm.offset + i,
            countryEn: cEn,
            countryZh: cm.zh,
            lon: cm.lon,
            lat: cm.lat,
            hostLon: m.hostLon,
            hostLat: m.hostLat,
            distKm,
            en: f.en,
            zh: f.zh,
            date: f.date || '',
            midYr,
            acq: f.acq || m.acqStart,
            mat: f.mat || '',
            matZh: f.matZh || f.mat || '',
            descEn: f.descEn || '',
            descZh: f.descZh || '',
            reg: fullReg,
            objUrl: f.objUrl || f.bmUrl || ''
          };
          MASTERPIECES.push(item);
          if (!MASTER_BY_KEY.has(key)) MASTER_BY_KEY.set(key, item);
        }
      }
    }
  })();

  const HOMELANDS = Array.from(HOMELANDS_MAP.values()).sort((a, b) => b.total - a.total);

  // Image cache (zero redundant full-res canvas copies!)
  const imgCache = {};
  function getMuseumImg(mid) {
    const m = MUSEUMS[mid] || MUSEUMS.bm;
    if (imgCache[m.id] && imgCache[m.id].loaded) return Promise.resolve(imgCache[m.id]);
    if (imgCache[m.id] && imgCache[m.id].promise) return imgCache[m.id].promise;
    const entry = { img: null, cols: m.atlasCols, tileSize: m.tileSize, loaded: false, promise: null };
    entry.promise = new Promise((resolve) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { entry.img = im; entry.loaded = true; resolve(entry); };
      im.onerror = () => { entry.loaded = true; resolve(entry); };
      im.src = m.atlasUri;
    });
    imgCache[m.id] = entry;
    return entry.promise;
  }

  function paintThumb(cnv, mid, spriteIdx, coverCrop) {
    if (!cnv) return;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = '#221c16';
    ctx.fillRect(0, 0, cnv.width, cnv.height);
    getMuseumImg(mid).then((ent) => {
      if (!ent || !ent.img) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const ts = ent.tileSize;
      const sx = (spriteIdx % ent.cols) * ts;
      const sy = Math.floor(spriteIdx / ent.cols) * ts;
      ctx.clearRect(0, 0, cnv.width, cnv.height);
      if (coverCrop) {
        const ch = Math.round(ts * 0.75);
        const cy = sy + Math.round((ts - ch) * 0.40);
        ctx.drawImage(ent.img, sx, cy, ts, ch, 0, 0, cnv.width, cnv.height);
      } else {
        ctx.drawImage(ent.img, sx, sy, ts, ts, 0, 0, cnv.width, cnv.height);
      }
    });
  }

  function getLang() {
    const bridge = window.__ARTIFACTS_STUDIO_BRIDGE__;
    if (bridge && typeof bridge.getLang === 'function') return bridge.getLang();
    return (document.documentElement.lang || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  }

  function fmtNum(n) {
    return Math.round(n || 0).toLocaleString(getLang() === 'zh' ? 'zh-CN' : 'en-US');
  }

  function isX20Path() {
    const p = window.location.pathname || '';
    return p.includes('/www/') || p.includes('artifacts-archive') || p.includes('artifacts-stories') || p.includes('artifacts-creation-age') || p.includes('artifacts-catalog');
  }

  function pageUrl(kind) {
    const x = isX20Path();
    if (kind === 'index') return x ? './artifacts-archive.html' : './index.html';
    if (kind === 'stories') return x ? './artifacts-stories.html' : './stories.html';
    if (kind === 'age') return x ? './artifacts-creation-age.html' : './creation-age.html';
    if (kind === 'catalog') return x ? './artifacts-catalog.html' : './catalog.html';
    return './index.html';
  }

  function buildObjUrl(item) {
    const m = MUSEUMS[item.museumId] || MUSEUMS.bm;
    const allowed = m.urls.allowedOriginPrefix;
    if (item.objUrl && item.objUrl.startsWith(allowed)) return item.objUrl;
    const spUrl = m.spriteObjectUrls && m.spriteObjectUrls[item.sprite];
    if (typeof spUrl === 'string' && spUrl.startsWith(allowed)) return spUrl;
    const place = (BM_PLACE_NAMES && BM_PLACE_NAMES[item.countryEn]) || item.countryEn;
    const cand = m.urls.searchPrefix + encodeURIComponent(place) + m.urls.searchSuffix;
    return cand.startsWith(allowed) ? cand : m.urls.collectionHome;
  }

  function buildGlobeUrlForItem(item) {
    const parts = [];
    if (item.museumId !== 'bm') parts.push('museum=' + encodeURIComponent(item.museumId));
    if (getLang() === 'zh') parts.push('lang=zh');
    parts.push('country=' + encodeURIComponent(item.countryEn));
    parts.push('id=' + String(item.localId));
    return pageUrl('index') + '#' + parts.join('&');
  }

  function museumShortName(mid) {
    const m = MUSEUMS[mid];
    if (!m) return mid;
    const mc = (m.copy && m.copy[getLang()]) || m.copy.en;
    return mc.shortName || mid;
  }

  function countryLabel(en, zh) {
    if (getLang() === 'zh') return zh || en;
    return en === 'United States of America' ? 'United States' : en;
  }

  // =========================================================================
  // Saved Bookmarks ("My Exhibition") Persistence (Non-PII allowlisted keys)
  // =========================================================================
  function loadSavedKeys() {
    try {
      const raw = window.localStorage.getItem(STORAGE_SAVED_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr.filter(k => typeof k === 'string' && MASTER_BY_KEY.has(k)).slice(0, 36);
    } catch (_) {
      return [];
    }
  }

  function persistSavedKeys(keys) {
    try {
      window.localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(keys.slice(0, 36)));
    } catch (_) {}
  }

  function loadBestQuizScore() {
    try {
      const v = parseInt(window.localStorage.getItem(STORAGE_BEST_KEY) || '0', 10);
      return Number.isFinite(v) && v >= 0 && v <= 25000 ? v : 0;
    } catch (_) {
      return 0;
    }
  }

  function saveBestQuizScore(sc) {
    try {
      window.localStorage.setItem(STORAGE_BEST_KEY, String(Math.max(loadBestQuizScore(), sc)));
    } catch (_) {}
  }

  const studioState = {
    savedKeys: loadSavedKeys(),
    cmpMode: 'artifacts', // 'artifacts' | 'museums'
    cmpArtA: 'bm:45',
    cmpArtB: 'met:29',
    cmpMusA: 'bm',
    cmpMusB: 'louvre',
    activeTab: 'challenge', // 'challenge' | 'compare' | 'exhibition'
    cmdkIdx: 0,
    cmdkItems: []
  };

  // =========================================================================
  // Toast Helper
  // =========================================================================
  let elToast = null;
  let toastTimer = 0;
  function showToast(msg) {
    if (!elToast) {
      elToast = document.createElement('div');
      elToast.className = 'studio-toast';
      elToast.setAttribute('role', 'status');
      elToast.setAttribute('aria-live', 'polite');
      document.body.appendChild(elToast);
    }
    elToast.textContent = msg;
    elToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => elToast.classList.remove('show'), 2400);
  }

  function toggleSavedKey(key) {
    if (!MASTER_BY_KEY.has(key)) return false;
    const idx = studioState.savedKeys.indexOf(key);
    let added = false;
    if (idx >= 0) {
      studioState.savedKeys.splice(idx, 1);
    } else {
      if (studioState.savedKeys.length >= 36) studioState.savedKeys.pop();
      studioState.savedKeys.unshift(key);
      added = true;
    }
    persistSavedKeys(studioState.savedKeys);
    updateNavBadges();
    showToast(added
      ? (getLang() === 'zh' ? '★ 已加入「我的虚拟展厅」' : '★ Saved to My Exhibition')
      : (getLang() === 'zh' ? '已从「我的虚拟展厅」移除' : 'Removed from My Exhibition'));
    if (studioBackdrop && studioBackdrop.classList.contains('open') && studioState.activeTab === 'exhibition') {
      renderExhibitionTab();
    }
    return added;
  }

  // =========================================================================
  // Feature #4B: Archival Postcard (.png) Offscreen Canvas Exporter (1200x675)
  // =========================================================================
  async function downloadPostcardPng(item) {
    if (!item) return;
    const ent = await getMuseumImg(item.museumId);
    const cnv = document.createElement('canvas');
    cnv.width = 1200;
    cnv.height = 675;
    const ctx = cnv.getContext('2d');

    // Warm sunlit vellum background
    const bg = ctx.createLinearGradient(0, 0, 1200, 675);
    bg.addColorStop(0, '#fcf8ee');
    bg.addColorStop(0.55, '#f3e7cf');
    bg.addColorStop(1, '#e7d5b4');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 1200, 675);

    // Double museum archival frame
    ctx.strokeStyle = 'rgba(154, 118, 58, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, 1152, 627);
    ctx.strokeStyle = 'rgba(154, 118, 58, 0.25)';
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 32, 1136, 611);

    // Left Square Ultra-HD Studio Plate (540x540)
    const px = 56, py = 67, ps = 540;
    ctx.fillStyle = '#1e1914';
    ctx.fillRect(px, py, ps, ps);
    if (ent && ent.img) {
      const ts = ent.tileSize;
      const sx = (item.sprite % ent.cols) * ts;
      const sy = Math.floor(item.sprite / ent.cols) * ts;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(ent.img, sx, sy, ts, ts, px, py, ps, ps);
    }
    ctx.strokeStyle = 'rgba(184, 137, 68, 0.72)';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, ps, ps);

    // Right Archival Editorial Copy
    const rx = 636;
    const maxW = 508;
    ctx.fillStyle = '#8c6223';
    ctx.font = '700 16px "Google Sans Code", monospace';
    ctx.fillText('ARTIFACTS ARCHIVE  ·  文物档案库', rx, 102);

    ctx.fillStyle = '#2c2116';
    ctx.font = '700 34px Georgia, serif';
    const wrapLines = (text, maxWidth, fontStr, lineLimit) => {
      ctx.font = fontStr;
      const words = text.split(' ');
      const lines = [];
      let cur = '';
      for (let i = 0; i < words.length; i++) {
        const cand = cur ? (cur + ' ' + words[i]) : words[i];
        if (ctx.measureText(cand).width <= maxWidth) {
          cur = cand;
        } else {
          if (cur) lines.push(cur);
          cur = words[i];
          if (lines.length >= lineLimit - 1) break;
        }
      }
      if (cur && lines.length < lineLimit) lines.push(cur);
      return lines;
    };

    const enLines = wrapLines(item.en, maxW, '700 33px Georgia, serif', 2);
    let yCursor = 152;
    for (let i = 0; i < enLines.length; i++) {
      ctx.fillText(enLines[i], rx, yCursor);
      yCursor += 42;
    }

    ctx.fillStyle = '#6c4d24';
    ctx.font = '600 22px "Noto Serif SC", "PingFang SC", sans-serif';
    ctx.fillText(item.zh.slice(0, 22), rx, yCursor + 6);
    yCursor += 46;

    // Provenance Pill Box
    ctx.fillStyle = 'rgba(255, 251, 243, 0.88)';
    ctx.strokeStyle = 'rgba(168, 130, 74, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(rx, yCursor, maxW, 132, 14);
    ctx.fill();
    ctx.stroke();

    const m = MUSEUMS[item.museumId];
    const mEn = (m && m.copy && m.copy.en && m.copy.en.shortName) || item.museumId;
    const mZh = (m && m.copy && m.copy.zh && m.copy.zh.shortName) || mEn;
    ctx.fillStyle = '#8c6223';
    ctx.font = '700 13px "Google Sans Code", monospace';
    ctx.fillText('PROVENANCE & DISPLACEMENT', rx + 18, yCursor + 28);

    ctx.fillStyle = '#2c2116';
    ctx.font = '700 18px sans-serif';
    ctx.fillText(item.countryEn + ' (' + item.countryZh + ')  →  ' + mEn, rx + 18, yCursor + 58);

    ctx.fillStyle = '#554331';
    ctx.font = '600 15px "Google Sans Code", monospace';
    const distBadge = item.distKm > 0
      ? ('Great-Circle Distance: ' + item.distKm.toLocaleString('en-US') + ' km  ·  ' + mZh)
      : ('Domestic Host Collection  ·  ' + mZh);
    ctx.fillText(distBadge, rx + 18, yCursor + 88);

    ctx.fillStyle = '#6e573b';
    ctx.font = '500 14px "Google Sans Code", monospace';
    ctx.fillText('Created: ' + item.date + '   ·   Acquired: ' + item.acq + '   ·   ' + item.reg, rx + 18, yCursor + 114);
    yCursor += 162;

    // Archival description excerpt
    ctx.fillStyle = '#3f3020';
    const dLines = wrapLines(item.descEn || item.mat, maxW, '400 16px Georgia, serif', 4);
    for (let i = 0; i < dLines.length; i++) {
      ctx.fillText(dLines[i], rx, yCursor);
      yCursor += 25;
    }

    // Footer stamp
    ctx.fillStyle = '#857058';
    ctx.font = '600 13px "Google Sans Code", monospace';
    ctx.fillText('10 WORLD MUSEUMS · 45,008 ARTIFACTS · ARTIFACTS-ARCHIVE.ONRENDER.COM', rx, 606);

    cnv.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = item.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
      a.download = 'artifacts-archive-' + (slug || item.key.replace(':', '-')) + '.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast(getLang() === 'zh' ? '🖼 已导出超高清文物明信片 (.png)' : '🖼 Archival Postcard (.png) downloaded');
    }, 'image/png');
  }

  // =========================================================================
  // Build DOM Shells (Navbar Buttons, Command Palette, Studio Modal)
  // =========================================================================
  let navCmdkBtn = null;
  let navStudioBtn = null;
  let navSavedBadge = null;

  function injectNavbarTools() {
    const navRight = document.querySelector('#site-nav .nav-right');
    if (!navRight || document.getElementById('st-nav-tools')) return;

    const wrap = document.createElement('div');
    wrap.id = 'st-nav-tools';
    wrap.className = 'st-nav-tools';

    navCmdkBtn = document.createElement('button');
    navCmdkBtn.id = 'studio-cmdk-trigger';
    navCmdkBtn.type = 'button';
    navCmdkBtn.className = 'st-nav-tool-btn';
    navCmdkBtn.addEventListener('click', openCmdk);

    navStudioBtn = document.createElement('button');
    navStudioBtn.id = 'studio-modal-trigger';
    navStudioBtn.type = 'button';
    navStudioBtn.className = 'st-nav-tool-btn is-gold';
    navStudioBtn.addEventListener('click', () => openStudio(studioState.activeTab));

    wrap.appendChild(navCmdkBtn);
    wrap.appendChild(navStudioBtn);
    navRight.insertBefore(wrap, navRight.firstChild);
    updateNavBadges();
  }

  function updateNavBadges() {
    if (!navCmdkBtn || !navStudioBtn) return;
    const zh = getLang() === 'zh';
    navCmdkBtn.replaceChildren();
    const sTxt = document.createElement('span');
    sTxt.textContent = zh ? '🔍 搜索' : '🔍 Search';
    const kbd = document.createElement('span');
    kbd.className = 'st-kbd-chip';
    kbd.textContent = '⌘K';
    navCmdkBtn.appendChild(sTxt);
    navCmdkBtn.appendChild(kbd);
    navCmdkBtn.setAttribute('aria-label', zh ? '全局快捷搜索 (Command+K)' : 'Global quick search (Command+K)');

    navStudioBtn.replaceChildren();
    const stLbl = document.createElement('span');
    stLbl.textContent = zh ? '🎯 挑战与对比' : '🎯 Studio';
    navStudioBtn.appendChild(stLbl);
    if (studioState.savedKeys.length > 0) {
      navSavedBadge = document.createElement('span');
      navSavedBadge.className = 'st-count-pill';
      navSavedBadge.textContent = String(studioState.savedKeys.length);
      navStudioBtn.appendChild(navSavedBadge);
    }
    navStudioBtn.setAttribute('aria-label', zh ? '打开策展工作室（寻源挑战、孪生对比、我的展厅）' : 'Open Curator Studio (3D Challenge, Compare, My Exhibition)');
  }

  // Contextual Save / Compare / Postcard bar injected into index.html #artifact-modal
  function injectModalContextButtons() {
    const modalActions = document.querySelector('#artifact-modal .modal-actions');
    if (!modalActions || document.getElementById('studio-modal-ctx')) return;
    const strip = document.createElement('div');
    strip.id = 'studio-modal-ctx';
    strip.className = 'studio-ctx-strip';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'studio-mini-btn';
    saveBtn.id = 'studio-ctx-save';
    saveBtn.addEventListener('click', () => {
      const active = window.__ARTIFACTS_STUDIO_BRIDGE__ && window.__ARTIFACTS_STUDIO_BRIDGE__.getActiveArtifact();
      if (!active) {
        showToast(getLang() === 'zh' ? '请在图录中选择高清镇馆名作进行收藏' : 'Select a curated HD masterpiece to save');
        return;
      }
      toggleSavedKey(active.museumId + ':' + active.sprite);
    });

    const cmpBtn = document.createElement('button');
    cmpBtn.type = 'button';
    cmpBtn.className = 'studio-mini-btn';
    cmpBtn.id = 'studio-ctx-cmp';
    cmpBtn.addEventListener('click', () => {
      const active = window.__ARTIFACTS_STUDIO_BRIDGE__ && window.__ARTIFACTS_STUDIO_BRIDGE__.getActiveArtifact();
      if (active && MASTER_BY_KEY.has(active.museumId + ':' + active.sprite)) {
        studioState.cmpArtA = active.museumId + ':' + active.sprite;
      }
      studioState.cmpMode = 'artifacts';
      openStudio('compare');
    });

    const cardBtn = document.createElement('button');
    cardBtn.type = 'button';
    cardBtn.className = 'studio-mini-btn is-gold';
    cardBtn.id = 'studio-ctx-postcard';
    cardBtn.addEventListener('click', () => {
      const active = window.__ARTIFACTS_STUDIO_BRIDGE__ && window.__ARTIFACTS_STUDIO_BRIDGE__.getActiveArtifact();
      const item = active ? MASTER_BY_KEY.get(active.museumId + ':' + active.sprite) : null;
      if (!item) {
        showToast(getLang() === 'zh' ? '请打开任意高清名作导出明信片' : 'Open any HD masterpiece to export a postcard');
        return;
      }
      downloadPostcardPng(item);
    });

    strip.appendChild(saveBtn);
    strip.appendChild(cmpBtn);
    strip.appendChild(cardBtn);
    modalActions.appendChild(strip);
    syncContextButtonsLabels();
  }

  function syncContextButtonsLabels() {
    const zh = getLang() === 'zh';
    const b1 = document.getElementById('studio-ctx-save');
    const b2 = document.getElementById('studio-ctx-cmp');
    const b3 = document.getElementById('studio-ctx-postcard');
    if (b1) b1.textContent = zh ? '★ 收藏展厅' : '★ Save';
    if (b2) b2.textContent = zh ? '⇄ 同屏对比' : '⇄ Compare';
    if (b3) b3.textContent = zh ? '🖼 明信片' : '🖼 Postcard';
  }

  // =========================================================================
  // Feature #1: Global ⌘K Command Palette
  // =========================================================================
  let cmdkBackdrop = null;
  let cmdkInput = null;
  let cmdkResults = null;
  let cmdkFooter = null;

  function ensureCmdkDom() {
    if (cmdkBackdrop) return;
    cmdkBackdrop = document.createElement('div');
    cmdkBackdrop.id = 'studio-cmdk-backdrop';
    cmdkBackdrop.className = 'studio-backdrop';
    cmdkBackdrop.setAttribute('role', 'dialog');
    cmdkBackdrop.setAttribute('aria-modal', 'true');
    cmdkBackdrop.setAttribute('aria-label', 'Global quick search');
    cmdkBackdrop.addEventListener('click', (e) => {
      if (e.target === cmdkBackdrop) closeCmdk();
    });

    const dlg = document.createElement('div');
    dlg.className = 'cmdk-dialog';

    const row = document.createElement('div');
    row.className = 'cmdk-input-row';
    const ic = document.createElement('span');
    ic.className = 'cmdk-search-icon';
    ic.setAttribute('aria-hidden', 'true');
    ic.textContent = '🔍';

    cmdkInput = document.createElement('input');
    cmdkInput.id = 'cmdk-input';
    cmdkInput.type = 'search';
    cmdkInput.autocomplete = 'off';
    cmdkInput.spellcheck = false;
    cmdkInput.setAttribute('aria-label', 'Search museums, homelands, masterpieces, stories, and eras');
    cmdkInput.addEventListener('input', () => {
      studioState.cmdkIdx = 0;
      renderCmdkResults(cmdkInput.value);
    });
    cmdkInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (studioState.cmdkItems.length) {
          studioState.cmdkIdx = (studioState.cmdkIdx + 1) % studioState.cmdkItems.length;
          highlightCmdkRow();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (studioState.cmdkItems.length) {
          studioState.cmdkIdx = (studioState.cmdkIdx - 1 + studioState.cmdkItems.length) % studioState.cmdkItems.length;
          highlightCmdkRow();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const chosen = studioState.cmdkItems[studioState.cmdkIdx];
        if (chosen && typeof chosen.run === 'function') {
          closeCmdk();
          chosen.run();
        }
      }
    });

    const escBtn = document.createElement('button');
    escBtn.type = 'button';
    escBtn.className = 'cmdk-esc-btn';
    escBtn.textContent = 'ESC';
    escBtn.addEventListener('click', closeCmdk);

    row.appendChild(ic);
    row.appendChild(cmdkInput);
    row.appendChild(escBtn);

    cmdkResults = document.createElement('div');
    cmdkResults.className = 'cmdk-results';

    cmdkFooter = document.createElement('div');
    cmdkFooter.className = 'cmdk-footer';

    dlg.appendChild(row);
    dlg.appendChild(cmdkResults);
    dlg.appendChild(cmdkFooter);
    cmdkBackdrop.appendChild(dlg);
    document.body.appendChild(cmdkBackdrop);
  }

  function openCmdk() {
    ensureCmdkDom();
    const zh = getLang() === 'zh';
    cmdkInput.placeholder = zh
      ? '搜索 10 座博物馆、101 个原属国、325 件国宝、5 条故事线、挑战与对比…'
      : 'Search 10 museums, 101 homelands, 325 HD masterpieces, 5 stories, eras, or Studio…';
    cmdkFooter.textContent = zh
      ? '↑↓ 选择 · Enter 直达 · Esc 关闭 · 支持中英文实时检索'
      : '↑↓ Navigate · Enter Open · Esc Close · Searches across all 4 pages';
    cmdkInput.value = '';
    studioState.cmdkIdx = 0;
    renderCmdkResults('');
    cmdkBackdrop.classList.add('open');
    setTimeout(() => cmdkInput.focus(), 30);
  }

  function closeCmdk() {
    if (cmdkBackdrop) cmdkBackdrop.classList.remove('open');
  }

  function highlightCmdkRow() {
    const btns = cmdkResults.querySelectorAll('.cmdk-item');
    for (let i = 0; i < btns.length; i++) {
      const act = i === studioState.cmdkIdx;
      btns[i].classList.toggle('active', act);
      if (act) btns[i].scrollIntoView({ block: 'nearest' });
    }
  }

  function renderCmdkResults(rawQ) {
    const q = String(rawQ || '').trim().toLowerCase();
    const zh = getLang() === 'zh';
    const langHash = zh ? 'lang=zh' : '';
    const bridge = window.__ARTIFACTS_STUDIO_BRIDGE__;
    const groups = [];

    // 1. Quick Studio & Pages
    const quick = [
      { icon: '🎯', title: zh ? '3D 地球仪寻源挑战（5 轮猜原属国）' : 'Play 3D Globe Origin Challenge (5 Rounds)', sub: zh ? '看高清文物照，在 3D 地球仪上点击原属地测距得分' : 'Pin the homeland on a 3D globe & score by Haversine km', badge: zh ? '挑战' : 'Game', run: () => openStudio('challenge') },
      { icon: '⇄', title: zh ? '孪生国宝 & 博物馆同屏对比' : 'Compare Split Twins & Museums Side-by-Side', sub: zh ? '伊迪亚王太后面具、帕特农浮雕、十大博物馆横向对照' : 'Queen Idia masks, Parthenon reliefs & 10-museum metrics', badge: zh ? '对比' : 'Compare', run: () => openStudio('compare') },
      { icon: '★', title: zh ? '我的虚拟展厅 & 明信片导出 (.png)' : 'My Exhibition Bookmarks & Postcard Exporter (.png)', sub: zh ? ('已收藏 ' + studioState.savedKeys.length + ' 件国宝 · 生成可分享展厅链接') : (studioState.savedKeys.length + ' saved works · Shareable URL & 1200×675 PNG cards'), badge: zh ? '展厅' : 'Saved', run: () => openStudio('exhibition') },
      { icon: '✦', title: zh ? '策展故事线（5 大主题 · 30 件跨馆国宝）' : 'Curator Stories (5 Guided Journeys · 30 Masterworks)', sub: zh ? '含语音导览与六宝一键飞返原址合璧' : 'Scrollytelling tours with Audio Guide & Reunite Home', badge: zh ? '页面' : 'Page', run: () => { window.location.href = pageUrl('stories') + (langHash ? '#' + langHash : ''); } },
      { icon: '⏳', title: zh ? '文明诞生纪年图谱（前6000–2023）' : 'Creation Age Chronicle (6000 BC – AD 2023)', sub: zh ? '八大历史纪年严格筛选与同时代文明对照' : 'Strict creation-age filtering across 8 historical eras', badge: zh ? '页面' : 'Page', run: () => { window.location.href = pageUrl('age') + (langHash ? '#' + langHash : ''); } },
      { icon: '▤', title: zh ? '全部 45,008 件文物完整总名录' : 'Complete 45,008-Artifact Master Catalogue', sub: zh ? '多维检索、101×10 全景矩阵与 CSV 导出' : 'Faceted search, 101×10 matrix & CSV export', badge: zh ? '页面' : 'Page', run: () => { window.location.href = pageUrl('catalog') + (langHash ? '#' + langHash : ''); } }
    ];
    const quickHits = q ? quick.filter(x => (x.title + ' ' + x.sub).toLowerCase().includes(q)) : quick.slice(0, 4);
    if (quickHits.length) groups.push({ label: zh ? '策展工具与展馆页面' : 'Studio Tools & Pages', items: quickHits });

    // 2. Curator Stories
    const stHits = STORY_INDEX.filter(s => !q || (s.en + ' ' + s.zh + ' ' + s.subEn).toLowerCase().includes(q)).slice(0, q ? 5 : 2).map(s => ({
      icon: '📖',
      title: zh ? s.zh : s.en,
      sub: zh ? s.subZh : s.subEn,
      badge: zh ? '故事线' : 'Story',
      run: () => {
        const h = (langHash ? (langHash + '&') : '') + 'story=' + encodeURIComponent(s.id);
        window.location.href = pageUrl('stories') + '#' + h;
      }
    }));
    if (stHits.length) groups.push({ label: zh ? '五大策展故事线' : 'Curator Stories', items: stHits });

    // 3. Museums (10)
    const musHits = SUPPORTED_MUSEUMS.map(mid => {
      const m = MUSEUMS[mid];
      const enN = (m.copy && m.copy.en && m.copy.en.shortName) || mid;
      const zhN = (m.copy && m.copy.zh && m.copy.zh.shortName) || enN;
      const city = (m.copy && m.copy[zh ? 'zh' : 'en'] && m.copy[zh ? 'zh' : 'en'].hostCity) || '';
      const tot = m.countriesSpec.reduce((s, r) => s + r[2], 0);
      return { mid, enN, zhN, city, tot };
    }).filter(x => !q || (x.enN + ' ' + x.zhN + ' ' + x.city + ' ' + x.mid).toLowerCase().includes(q)).slice(0, q ? 6 : 3).map(x => ({
      icon: '🏛',
      title: zh ? x.zhN : x.enN,
      sub: x.city + ' · ' + fmtNum(x.tot) + (zh ? ' 件馆藏' : ' artifacts'),
      badge: zh ? '博物馆' : 'Museum',
      run: () => {
        if (bridge && bridge.page === 'index') bridge.focusMuseum(x.mid);
        else {
          const p = ['museum=' + encodeURIComponent(x.mid)];
          if (langHash) p.push(langHash);
          window.location.href = pageUrl('index') + '#' + p.join('&');
        }
      }
    }));
    if (musHits.length) groups.push({ label: zh ? '十大世界博物馆' : 'World Museums', items: musHits });

    // 4. Homelands (101)
    const hmHits = HOMELANDS.filter(h => !q || (h.en + ' ' + h.zh).toLowerCase().includes(q)).slice(0, q ? 6 : 3).map(h => ({
      icon: '🌍',
      title: countryLabel(h.en, h.zh),
      sub: fmtNum(h.total) + (zh ? (' 件馆藏 · 分布于 ' + h.museums + ' 座博物馆') : (' artifacts across ' + h.museums + ' museums')),
      badge: zh ? '原属国' : 'Homeland',
      run: () => {
        if (bridge && bridge.page === 'index') bridge.focusHomeland(h.en);
        else {
          const p = ['lens=homeland', 'homeland=' + encodeURIComponent(h.en)];
          if (langHash) p.push(langHash);
          window.location.href = pageUrl('index') + '#' + p.join('&');
        }
      }
    }));
    if (hmHits.length) groups.push({ label: zh ? '101 个原属国与地区' : 'Origin Homelands', items: hmHits });

    // 5. Masterpieces (325)
    const mHits = MASTERPIECES.filter(it => {
      if (!q) return it.key === 'bm:17' || it.key === 'bm:56' || it.key === 'bm:3' || it.key === 'berlin:0';
      return (it.en + ' ' + it.zh + ' ' + it.countryEn + ' ' + it.countryZh + ' ' + it.reg + ' ' + it.mat + ' ' + it.matZh).toLowerCase().includes(q);
    }).slice(0, q ? 12 : 4).map(it => ({
      museumId: it.museumId,
      sprite: it.sprite,
      title: zh ? it.zh : it.en,
      sub: countryLabel(it.countryEn, it.countryZh) + ' → ' + museumShortName(it.museumId) + ' · ' + it.date,
      badge: it.distKm > 0 ? (fmtNum(it.distKm) + ' km') : (zh ? '本土' : 'Host'),
      run: () => {
        if (bridge && bridge.page === 'index') bridge.focusMasterpiece(it.museumId, it.countryEn, it.sprite);
        else window.location.href = buildGlobeUrlForItem(it);
      }
    }));
    if (mHits.length) groups.push({ label: zh ? '325 件超高清镇馆名作' : 'Verified HD Masterpieces (325)', items: mHits });

    // 6. Creation Eras (8)
    if (q) {
      const eHits = ERA_INDEX.filter(er => (er.en + ' ' + er.zh).toLowerCase().includes(q)).slice(0, 4).map(er => ({
        icon: '⏳',
        title: zh ? er.zh : er.en,
        sub: zh ? '在文明诞生纪年页查看同时代全球造物' : 'Explore contemporaneous global works in Creation Age',
        badge: zh ? '纪年' : 'Era',
        run: () => {
          const p = ['era=' + encodeURIComponent(er.id)];
          if (langHash) p.push(langHash);
          window.location.href = pageUrl('age') + '#' + p.join('&');
        }
      }));
      if (eHits.length) groups.push({ label: zh ? '历史纪年时期' : 'Historical Eras', items: eHits });
    }

    cmdkResults.replaceChildren();
    studioState.cmdkItems = [];
    if (!groups.length) {
      const emp = document.createElement('div');
      emp.className = 'cmdk-empty';
      emp.textContent = zh ? '未找到匹配的文物、国家或博物馆，请尝试其他关键词。' : 'No matching museums, homelands, or masterpieces found.';
      cmdkResults.appendChild(emp);
      return;
    }

    const frag = document.createDocumentFragment();
    for (let g = 0; g < groups.length; g++) {
      const grp = groups[g];
      const lbl = document.createElement('div');
      lbl.className = 'cmdk-group-lbl';
      lbl.textContent = grp.label;
      frag.appendChild(lbl);

      for (let i = 0; i < grp.items.length; i++) {
        const it = grp.items[i];
        const flatIdx = studioState.cmdkItems.length;
        studioState.cmdkItems.push(it);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cmdk-item' + (flatIdx === studioState.cmdkIdx ? ' active' : '');
        btn.addEventListener('mouseenter', () => {
          studioState.cmdkIdx = flatIdx;
          highlightCmdkRow();
        });
        btn.addEventListener('click', () => {
          closeCmdk();
          it.run();
        });

        const th = document.createElement('span');
        th.className = 'cmdk-thumb';
        if (it.museumId && typeof it.sprite === 'number') {
          const cv = document.createElement('canvas');
          cv.width = 68;
          cv.height = 68;
          paintThumb(cv, it.museumId, it.sprite, false);
          th.appendChild(cv);
        } else {
          th.textContent = it.icon || '✦';
        }

        const tx = document.createElement('span');
        tx.className = 'cmdk-item-text';
        const t1 = document.createElement('span');
        t1.className = 'cmdk-item-title';
        t1.textContent = it.title;
        const t2 = document.createElement('span');
        t2.className = 'cmdk-item-sub';
        t2.textContent = it.sub;
        tx.appendChild(t1);
        tx.appendChild(t2);

        const bd = document.createElement('span');
        bd.className = 'cmdk-item-badge';
        bd.textContent = it.badge;

        btn.appendChild(th);
        btn.appendChild(tx);
        btn.appendChild(bd);
        frag.appendChild(btn);
      }
    }
    cmdkResults.appendChild(frag);
  }

  // =========================================================================
  // Archival Studio Overlay Shell (Challenge · Compare · My Exhibition)
  // =========================================================================
  let studioBackdrop = null;
  let elStudioTitle = null;
  let elTabBtns = {};
  let elPanes = {};

  function ensureStudioDom() {
    if (studioBackdrop) return;
    studioBackdrop = document.createElement('div');
    studioBackdrop.id = 'studio-modal-backdrop';
    studioBackdrop.className = 'studio-backdrop';
    studioBackdrop.setAttribute('role', 'dialog');
    studioBackdrop.setAttribute('aria-modal', 'true');
    studioBackdrop.setAttribute('aria-label', 'Curator Studio');
    studioBackdrop.addEventListener('click', (e) => {
      if (e.target === studioBackdrop) closeStudio();
    });

    const dlg = document.createElement('div');
    dlg.className = 'studio-dialog';

    const hdr = document.createElement('div');
    hdr.className = 'studio-header';

    const br = document.createElement('div');
    br.className = 'studio-brand';
    elStudioTitle = document.createElement('h2');
    elStudioTitle.className = 'studio-brand-title';
    br.appendChild(elStudioTitle);

    const tabs = document.createElement('div');
    tabs.className = 'studio-tabs';
    tabs.setAttribute('role', 'tablist');
    ['challenge', 'compare', 'exhibition'].forEach((tid) => {
      const tb = document.createElement('button');
      tb.type = 'button';
      tb.className = 'studio-tab-btn';
      tb.setAttribute('role', 'tab');
      tb.addEventListener('click', () => switchStudioTab(tid));
      elTabBtns[tid] = tb;
      tabs.appendChild(tb);
    });

    const cls = document.createElement('button');
    cls.type = 'button';
    cls.className = 'studio-close-btn';
    cls.setAttribute('aria-label', 'Close Curator Studio');
    cls.textContent = '×';
    cls.addEventListener('click', closeStudio);

    hdr.appendChild(br);
    hdr.appendChild(tabs);
    hdr.appendChild(cls);

    const body = document.createElement('div');
    body.className = 'studio-body';
    ['challenge', 'compare', 'exhibition'].forEach((tid) => {
      const pane = document.createElement('div');
      pane.className = 'studio-pane';
      pane.id = 'studio-pane-' + tid;
      elPanes[tid] = pane;
      body.appendChild(pane);
    });

    dlg.appendChild(hdr);
    dlg.appendChild(body);
    studioBackdrop.appendChild(dlg);
    document.body.appendChild(studioBackdrop);
  }

  function syncStudioChromeLabels() {
    if (!studioBackdrop) return;
    const zh = getLang() === 'zh';
    elStudioTitle.textContent = zh ? '策展工作室 · Curator Studio' : 'Curator Studio';
    elTabBtns.challenge.textContent = zh ? '🎯 3D 寻源挑战' : '🎯 3D Origin Challenge';
    elTabBtns.compare.textContent = zh ? '⇄ 孪生与馆际对比' : '⇄ Side-by-Side Compare';
    elTabBtns.exhibition.textContent = (zh ? '★ 我的虚拟展厅 (' : '★ My Exhibition (') + studioState.savedKeys.length + ')';
  }

  function openStudio(tabId) {
    ensureStudioDom();
    studioBackdrop.classList.add('open');
    switchStudioTab(tabId || studioState.activeTab || 'challenge');
  }

  function closeStudio() {
    if (studioBackdrop) studioBackdrop.classList.remove('open');
    quizState.rafActive = false;
  }

  function switchStudioTab(tabId) {
    studioState.activeTab = tabId;
    syncStudioChromeLabels();
    ['challenge', 'compare', 'exhibition'].forEach((tid) => {
      const act = tid === tabId;
      elTabBtns[tid].classList.toggle('active', act);
      elTabBtns[tid].setAttribute('aria-selected', String(act));
      elPanes[tid].classList.toggle('active', act);
    });
    if (tabId === 'challenge') {
      renderChallengeTab();
    } else {
      quizState.rafActive = false;
      if (tabId === 'compare') renderCompareTab();
      else renderExhibitionTab();
    }
  }

  // =========================================================================
  // Feature #2: "Guess the Origin" 3D Globe Challenge (5 Rounds, Sphere Raycast)
  // =========================================================================
  const quizState = {
    worldDecoded: false,
    borderArcs3D: [],
    landDots3D: [],
    deck: [],
    roundIdx: 0,
    score: 0,
    guessLon: null,
    guessLat: null,
    guessEra: null,
    revealed: false,
    finished: false,
    rotLon: -20 * DEG2RAD,
    rotLat: 22 * DEG2RAD,
    targetRotLon: -20 * DEG2RAD,
    targetRotLat: 22 * DEG2RAD,
    isDragging: false,
    hasDragged: false,
    dragX: 0,
    dragY: 0,
    rafActive: false
  };

  async function decodeQuizWorldMap() {
    if (quizState.worldDecoded || !WORLD_MAP_GZ_B64) return;
    quizState.worldDecoded = true;
    try {
      const binStr = atob(WORLD_MAP_GZ_B64);
      const gz = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) gz[i] = binStr.charCodeAt(i);
      const ds = new DecompressionStream('gzip');
      const rawBuf = await new Response(new Response(gz).body.pipeThrough(ds)).arrayBuffer();
      const dv = new DataView(rawBuf);
      let off = 4;
      const numArcs = dv.getUint16(off, true);
      off += 2;
      const arcs = new Array(numArcs);
      for (let i = 0; i < numArcs; i++) {
        const len = dv.getUint16(off, true);
        off += 2;
        const pts = new Array(len);
        let px = 0, py = 0;
        for (let j = 0; j < len; j++) {
          px += dv.getInt16(off, true);
          py += dv.getInt16(off + 2, true);
          off += 4;
          pts[j] = lonLatToVec3(px / 8, py / 8);
        }
        arcs[i] = pts;
      }
      quizState.borderArcs3D = arcs;
    } catch (_) {}
  }

  function startNewQuizMatch() {
    // Pick 5 diverse non-duplicate countries from overseas/curated masterpieces
    const pool = MASTERPIECES.filter(m => m.distKm > 400).slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    const chosen = [];
    const usedCountries = new Set();
    for (let i = 0; i < pool.length && chosen.length < 5; i++) {
      if (usedCountries.has(pool[i].countryEn)) continue;
      usedCountries.add(pool[i].countryEn);
      chosen.push(pool[i]);
    }
    quizState.deck = chosen;
    quizState.roundIdx = 0;
    quizState.score = 0;
    quizState.finished = false;
    resetRoundState();
  }

  function resetRoundState() {
    quizState.guessLon = null;
    quizState.guessLat = null;
    quizState.guessEra = null;
    quizState.revealed = false;
    quizState.targetRotLon = -22 * DEG2RAD;
    quizState.targetRotLat = 20 * DEG2RAD;
  }

  function bucketForYear(yr) {
    for (let i = 0; i < QUIZ_ERA_BUCKETS.length; i++) {
      if (yr >= QUIZ_ERA_BUCKETS[i].lo && yr <= QUIZ_ERA_BUCKETS[i].hi) return QUIZ_ERA_BUCKETS[i].id;
    }
    return 'medieval';
  }

  let quizCanvasEl = null;
  function renderChallengeTab() {
    decodeQuizWorldMap();
    if (!quizState.deck.length) startNewQuizMatch();
    const zh = getLang() === 'zh';
    const pane = elPanes.challenge;
    pane.replaceChildren();

    const item = quizState.deck[quizState.roundIdx] || quizState.deck[0];
    const best = loadBestQuizScore();

    const grid = document.createElement('div');
    grid.className = 'quiz-grid';

    // Left Card
    const card = document.createElement('div');
    card.className = 'quiz-card';

    const scoreStrip = document.createElement('div');
    scoreStrip.className = 'quiz-score-strip';
    const rLbl = document.createElement('span');
    rLbl.textContent = (zh ? '第 ' : 'ROUND ') + (quizState.roundIdx + 1) + ' / 5';
    const sLbl = document.createElement('span');
    sLbl.textContent = (zh ? '得分 ' : 'SCORE ') + fmtNum(quizState.score) + ' · ' + (zh ? '最高 ' : 'BEST ') + fmtNum(Math.max(best, quizState.score));
    scoreStrip.appendChild(rLbl);
    scoreStrip.appendChild(sLbl);

    const frame = document.createElement('div');
    frame.className = 'quiz-plate-frame';
    const plateCnv = document.createElement('canvas');
    plateCnv.id = 'studio-quiz-plate';
    plateCnv.width = 420;
    plateCnv.height = 420;
    paintThumb(plateCnv, item.museumId, item.sprite, false);
    const badge = document.createElement('div');
    badge.className = 'quiz-mystery-badge';
    if (quizState.revealed) {
      badge.textContent = (zh ? item.zh : item.en) + ' · ' + countryLabel(item.countryEn, item.countryZh) + ' (' + item.date + ')';
    } else {
      badge.textContent = zh
        ? ('材质线索：' + (item.matZh || '馆藏珍品') + ' · 请在右侧 3D 地球仪点击它的故乡！')
        : ('Material clue: ' + (item.mat || 'Museum Masterpiece') + ' — Pin its origin on the 3D globe!');
    }
    frame.appendChild(plateCnv);
    frame.appendChild(badge);

    const eraLbl = document.createElement('div');
    eraLbl.className = 'quiz-era-lbl';
    eraLbl.textContent = zh ? '步骤 2（可选加分 +1,000）：猜猜它的创作年代' : 'Step 2 (+1,000 bonus): Guess its creation period';

    const eraWrap = document.createElement('div');
    eraWrap.className = 'quiz-era-pills';
    const trueBucket = bucketForYear(item.midYr);
    for (let i = 0; i < QUIZ_ERA_BUCKETS.length; i++) {
      const eb = QUIZ_ERA_BUCKETS[i];
      const b = document.createElement('button');
      b.type = 'button';
      let cls = 'quiz-era-btn';
      if (quizState.revealed) {
        if (eb.id === trueBucket) cls += ' correct';
        else if (quizState.guessEra === eb.id) cls += ' wrong';
      } else if (quizState.guessEra === eb.id) {
        cls += ' active';
      }
      b.className = cls;
      b.textContent = zh ? eb.zh : eb.en;
      if (!quizState.revealed) {
        b.addEventListener('click', () => {
          quizState.guessEra = eb.id;
          renderChallengeTab();
        });
      }
      eraWrap.appendChild(b);
    }

    const fb = document.createElement('div');
    fb.id = 'studio-quiz-feedback';
    fb.className = 'quiz-feedback';
    if (quizState.finished) {
      fb.textContent = zh
        ? ('🏆 5 轮寻源挑战完成！最终得分：' + fmtNum(quizState.score) + ' / 25,000 分（历史最高：' + fmtNum(loadBestQuizScore()) + ' 分）。')
        : ('🏆 5-Round Challenge Complete! Final Score: ' + fmtNum(quizState.score) + ' / 25,000 pts (Best: ' + fmtNum(loadBestQuizScore()) + ').');
    } else if (quizState.revealed) {
      const errKm = Math.round(haversineKm(quizState.guessLon, quizState.guessLat, item.lon, item.lat));
      const geoPts = Math.round(4000 * Math.exp(-errKm / 2600));
      const eraPts = quizState.guessEra === trueBucket ? 1000 : 0;
      fb.textContent = zh
        ? ('误差 ' + fmtNum(errKm) + ' km（地理 +' + fmtNum(geoPts) + ' 分，年代 +' + fmtNum(eraPts) + ' 分）· 现藏于' + museumShortName(item.museumId) + '（距故乡 ' + fmtNum(item.distKm) + ' km）。')
        : ('Off by ' + fmtNum(errKm) + ' km (Geo +' + fmtNum(geoPts) + ', Era +' + fmtNum(eraPts) + ') · Held at ' + museumShortName(item.museumId) + ' (' + fmtNum(item.distKm) + ' km from home).');
    } else if (quizState.guessLon !== null) {
      fb.textContent = zh
        ? ('已落点：' + quizState.guessLat.toFixed(1) + '°, ' + quizState.guessLon.toFixed(1) + '° — 可继续微调或点击「锁定猜测」揭晓！')
        : ('Pin placed at ' + quizState.guessLat.toFixed(1) + '°, ' + quizState.guessLon.toFixed(1) + '° — click Lock Guess to score!');
    } else {
      fb.textContent = zh
        ? '步骤 1：拖动旋转右侧 3D 地球仪，直接点击你认为这件国宝诞生的国家或地区。'
        : 'Step 1: Drag to rotate the 3D globe on the right, then click where this masterpiece originated.';
    }

    const acts = document.createElement('div');
    acts.className = 'quiz-actions';
    if (quizState.finished) {
      const replayBtn = document.createElement('button');
      replayBtn.type = 'button';
      replayBtn.className = 'btn-primary-gold';
      replayBtn.textContent = zh ? '🔄 再来一局 (5 轮新国宝)' : '🔄 Play Again (5 New Works)';
      replayBtn.addEventListener('click', () => {
        startNewQuizMatch();
        renderChallengeTab();
      });
      acts.appendChild(replayBtn);
    } else if (!quizState.revealed) {
      const lockBtn = document.createElement('button');
      lockBtn.id = 'studio-quiz-lock-btn';
      lockBtn.type = 'button';
      lockBtn.className = 'btn-primary-gold';
      lockBtn.textContent = zh ? '✓ 锁定猜测并揭晓' : '✓ Lock Guess & Reveal';
      lockBtn.disabled = quizState.guessLon === null;
      lockBtn.addEventListener('click', () => {
        if (quizState.guessLon === null) return;
        const errKm = haversineKm(quizState.guessLon, quizState.guessLat, item.lon, item.lat);
        const geoPts = Math.round(4000 * Math.exp(-errKm / 2600));
        const eraPts = quizState.guessEra === trueBucket ? 1000 : 0;
        quizState.score += geoPts + eraPts;
        quizState.revealed = true;
        quizState.targetRotLon = -item.lon * DEG2RAD;
        quizState.targetRotLat = Math.max(-1.1, Math.min(1.1, item.lat * DEG2RAD));
        if (quizState.roundIdx === quizState.deck.length - 1) {
          quizState.finished = true;
          saveBestQuizScore(quizState.score);
        }
        renderChallengeTab();
      });
      acts.appendChild(lockBtn);
    } else {
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'btn-primary-gold';
      nextBtn.textContent = zh ? '下一轮国宝 ›' : 'Next Round ›';
      nextBtn.addEventListener('click', () => {
        quizState.roundIdx++;
        resetRoundState();
        renderChallengeTab();
      });
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'studio-mini-btn';
      saveBtn.textContent = zh ? '★ 收藏' : '★ Save';
      saveBtn.addEventListener('click', () => toggleSavedKey(item.key));

      const cardBtn = document.createElement('button');
      cardBtn.type = 'button';
      cardBtn.className = 'studio-mini-btn';
      cardBtn.textContent = zh ? '🖼 明信片' : '🖼 Postcard';
      cardBtn.addEventListener('click', () => downloadPostcardPng(item));

      acts.appendChild(nextBtn);
      acts.appendChild(saveBtn);
      acts.appendChild(cardBtn);
    }

    card.appendChild(scoreStrip);
    card.appendChild(frame);
    card.appendChild(eraLbl);
    card.appendChild(eraWrap);
    card.appendChild(fb);
    card.appendChild(acts);

    // Right Interactive 3D Globe Stage
    const stage = document.createElement('div');
    stage.className = 'quiz-globe-stage';
    quizCanvasEl = document.createElement('canvas');
    quizCanvasEl.id = 'studio-quiz-canvas';
    quizCanvasEl.setAttribute('aria-label', zh ? '可点击落点的 3D 寻源地球仪' : 'Clickable 3D globe for origin guess');
    const hint = document.createElement('div');
    hint.className = 'quiz-globe-hint';
    hint.textContent = quizState.revealed
      ? (zh ? ('★ 真实原属地：' + countryLabel(item.countryEn, item.countryZh) + ' → 现藏：' + museumShortName(item.museumId)) : ('★ True Origin: ' + countryLabel(item.countryEn, item.countryZh) + ' → ' + museumShortName(item.museumId)))
      : (zh ? '拖动旋转地球 · 单击表面放置你的黄金定位针' : 'Drag to rotate · Click the globe surface to drop your pin');
    stage.appendChild(quizCanvasEl);
    stage.appendChild(hint);

    wireQuizGlobePointer(quizCanvasEl);

    grid.appendChild(card);
    grid.appendChild(stage);
    pane.appendChild(grid);

    if (!quizState.rafActive) {
      quizState.rafActive = true;
      requestAnimationFrame(renderQuizGlobeLoop);
    }
  }

  function wireQuizGlobePointer(cnv) {
    cnv.addEventListener('pointerdown', (e) => {
      quizState.isDragging = true;
      quizState.hasDragged = false;
      quizState.dragX = e.clientX;
      quizState.dragY = e.clientY;
      cnv.setPointerCapture(e.pointerId);
    });
    cnv.addEventListener('pointermove', (e) => {
      if (!quizState.isDragging) return;
      const dx = e.clientX - quizState.dragX;
      const dy = e.clientY - quizState.dragY;
      if (Math.hypot(dx, dy) > 3) quizState.hasDragged = true;
      quizState.dragX = e.clientX;
      quizState.dragY = e.clientY;
      quizState.targetRotLon += dx * 0.0056;
      quizState.targetRotLat = Math.max(-1.28, Math.min(1.28, quizState.targetRotLat + dy * 0.0056));
    });
    cnv.addEventListener('pointerup', (e) => {
      const wasClick = !quizState.hasDragged;
      quizState.isDragging = false;
      if (!wasClick || quizState.revealed) return;
      const rect = cnv.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      const cx = rect.width * 0.5;
      const cy = rect.height * 0.52;
      const baseR = Math.min(rect.width, rect.height) * 0.41;
      const dx = (lx - cx) / baseR;
      const dy = (cy - ly) / baseR;
      const r2 = dx * dx + dy * dy;
      if (r2 > 1) return;
      // Exact inverse orthographic sphere raycast!
      const z2 = Math.sqrt(Math.max(0, 1 - r2));
      const cosLon = Math.cos(quizState.rotLon), sinLon = Math.sin(quizState.rotLon);
      const cosLat = Math.cos(quizState.rotLat), sinLat = Math.sin(quizState.rotLat);
      const vy = dy * cosLat + z2 * sinLat;
      const z1 = -dy * sinLat + z2 * cosLat;
      const vx = dx * cosLon - z1 * sinLon;
      const vz = dx * sinLon + z1 * cosLon;
      quizState.guessLat = Math.asin(Math.max(-1, Math.min(1, vy))) / DEG2RAD;
      quizState.guessLon = Math.atan2(vx, vz) / DEG2RAD;
      renderChallengeTab();
    });
  }

  let quizBaseCanvas = null;
  let quizBaseCtx = null;
  let quizBaseKey = '';
  let quizLastFrameSig = '';

  function renderQuizGlobeLoop() {
    if (!quizState.rafActive || !quizCanvasEl || !studioBackdrop || !studioBackdrop.classList.contains('open')) {
      quizState.rafActive = false;
      return;
    }
    const rect = quizCanvasEl.getBoundingClientRect();
    const w = Math.max(260, rect.width);
    const h = Math.max(260, rect.height);
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const pw = Math.round(w * dpr);
    const ph = Math.round(h * dpr);
    if (quizCanvasEl.width !== pw || quizCanvasEl.height !== ph) {
      quizCanvasEl.width = pw;
      quizCanvasEl.height = ph;
      quizBaseKey = '';
      quizLastFrameSig = '';
    }

    const dLon = quizState.targetRotLon - quizState.rotLon;
    const dLat = quizState.targetRotLat - quizState.rotLat;
    if (Math.abs(dLon) > 2e-4) quizState.rotLon += dLon * 0.14;
    else quizState.rotLon = quizState.targetRotLon;
    if (Math.abs(dLat) > 2e-4) quizState.rotLat += dLat * 0.14;
    else quizState.rotLat = quizState.targetRotLat;

    const frameSig = quizState.rotLon.toFixed(4) + '|' + quizState.rotLat.toFixed(4) + '|' +
      pw + '|' + ph + '|' + quizState.borderArcs3D.length + '|' +
      String(quizState.guessLon) + '|' + String(quizState.guessLat) + '|' +
      quizState.revealed + '|' + quizState.roundIdx + '|' + getLang();
    if (frameSig === quizLastFrameSig) {
      requestAnimationFrame(renderQuizGlobeLoop);
      return;
    }
    quizLastFrameSig = frameSig;

    const cx = w * 0.5;
    const cy = h * 0.52;
    const baseR = Math.min(w, h) * 0.41;
    const cosLon = Math.cos(quizState.rotLon), sinLon = Math.sin(quizState.rotLon);
    const cosLat = Math.cos(quizState.rotLat), sinLat = Math.sin(quizState.rotLat);

    const bKey = quizState.rotLon.toFixed(4) + '|' + quizState.rotLat.toFixed(4) + '|' + pw + '|' + ph + '|' + quizState.borderArcs3D.length;
    if (bKey !== quizBaseKey) {
      if (!quizBaseCanvas) {
        quizBaseCanvas = document.createElement('canvas');
        quizBaseCtx = quizBaseCanvas.getContext('2d');
      }
      if (quizBaseCanvas.width !== pw || quizBaseCanvas.height !== ph) {
        quizBaseCanvas.width = pw;
        quizBaseCanvas.height = ph;
      }
      const bCtx = quizBaseCtx;
      bCtx.save();
      bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bCtx.clearRect(0, 0, w, h);

      // Sunlit vellum sphere
      const sph = bCtx.createRadialGradient(cx - baseR * 0.25, cy - baseR * 0.25, baseR * 0.08, cx, cy, baseR);
      sph.addColorStop(0, '#faf3e4');
      sph.addColorStop(0.65, '#efe2c7');
      sph.addColorStop(1, '#d4bd93');
      bCtx.fillStyle = sph;
      bCtx.beginPath();
      bCtx.arc(cx, cy, baseR, 0, Math.PI * 2);
      bCtx.fill();

      // Borders (no circular clip, zero array allocs, screen-space vertex decimation)
      bCtx.strokeStyle = 'rgba(148, 120, 82, 0.62)';
      bCtx.lineWidth = 0.95;
      const arcs = quizState.borderArcs3D;
      for (let i = 0; i < arcs.length; i++) {
        const arc = arcs[i];
        bCtx.beginPath();
        let st = false;
        let lx = -9999, ly = -9999;
        for (let j = 0; j < arc.length; j++) {
          const p = arc[j];
          const px = p[0], py = p[1], pz = p[2];
          const x1 = px * cosLon + pz * sinLon;
          const z1 = -px * sinLon + pz * cosLon;
          const z2 = py * sinLat + z1 * cosLat;
          if (z2 > 0.015) {
            const y2 = py * cosLat - z1 * sinLat;
            const sx = cx + x1 * baseR;
            const sy = cy - y2 * baseR;
            if (!st) { bCtx.moveTo(sx, sy); lx = sx; ly = sy; st = true; }
            else if (Math.abs(sx - lx) + Math.abs(sy - ly) >= 1.6 || j === arc.length - 1) {
              bCtx.lineTo(sx, sy); lx = sx; ly = sy;
            }
          } else {
            st = false;
          }
        }
        bCtx.stroke();
      }
      bCtx.restore();
      quizBaseKey = bKey;
    }

    const ctx = quizCanvasEl.getContext('2d');
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, pw, ph);
    if (quizBaseCanvas) ctx.drawImage(quizBaseCanvas, 0, 0);
    ctx.scale(dpr, dpr);

    const drawPin = (lon, lat, color, label) => {
      const v = lonLatToVec3(lon, lat);
      const r = rotateVec(v[0], v[1], v[2], cosLon, sinLon, cosLat, sinLat);
      if (r[2] < 0.02) return;
      const sx = cx + r[0] * baseR;
      const sy = cy - r[1] * baseR;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fffaf0';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (label) {
        ctx.font = '700 11px "Google Sans Flex", "Noto Sans SC", sans-serif';
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(38, 27, 16, 0.90)';
        ctx.beginPath();
        ctx.roundRect(sx - tw * 0.5 - 7, sy + 10, tw + 14, 20, 999);
        ctx.fill();
        ctx.fillStyle = '#fffaf0';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, sx, sy + 20);
      }
    };

    const drawArc = (lon1, lat1, lon2, lat2, strokeStyle, dashed) => {
      const v1 = lonLatToVec3(lon1, lat1);
      const v2 = lonLatToVec3(lon2, lat2);
      ctx.save();
      ctx.beginPath();
      let pen = false;
      for (let k = 0; k <= 36; k++) {
        const u = k / 36;
        const p3 = slerpVec3(v1, v2, u);
        const lift = 1 + Math.sin(u * Math.PI) * 0.15;
        const r = rotateVec(p3[0] * lift, p3[1] * lift, p3[2] * lift, cosLon, sinLon, cosLat, sinLat);
        if (r[2] > -0.05) {
          const sx = cx + r[0] * baseR;
          const sy = cy - r[1] * baseR;
          if (!pen) { ctx.moveTo(sx, sy); pen = true; } else ctx.lineTo(sx, sy);
        } else pen = false;
      }
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 2.4;
      if (dashed) ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();
    };

    const item = quizState.deck[quizState.roundIdx];
    const zh = getLang() === 'zh';
    if (quizState.guessLon !== null) {
      drawPin(quizState.guessLon, quizState.guessLat, '#d08b26', zh ? '你的猜测' : 'Your Guess');
    }
    if (quizState.revealed && item) {
      if (quizState.guessLon !== null) {
        drawArc(quizState.guessLon, quizState.guessLat, item.lon, item.lat, '#c2402b', true);
      }
      drawArc(item.lon, item.lat, item.hostLon, item.hostLat, '#2f7a57', false);
      drawPin(item.lon, item.lat, '#2f7a57', '★ ' + countryLabel(item.countryEn, item.countryZh));
      drawPin(item.hostLon, item.hostLat, '#2c2116', museumShortName(item.museumId));
    }

    ctx.restore();
    requestAnimationFrame(renderQuizGlobeLoop);
  }

  // =========================================================================
  // Feature #3: Side-by-Side Comparison ("Split Twins" & Museum vs. Museum)
  // =========================================================================
  function renderCompareTab() {
    const zh = getLang() === 'zh';
    const pane = elPanes.compare;
    pane.replaceChildren();

    const topBar = document.createElement('div');
    topBar.className = 'cmp-mode-bar';

    const modeGrp = document.createElement('div');
    modeGrp.className = 'studio-tabs';
    const btnArt = document.createElement('button');
    btnArt.type = 'button';
    btnArt.className = 'studio-tab-btn' + (studioState.cmpMode === 'artifacts' ? ' active' : '');
    btnArt.textContent = zh ? '🏺 孪生国宝对照 (Artifact vs. Artifact)' : '🏺 Split Twins (Artifact vs. Artifact)';
    btnArt.addEventListener('click', () => { studioState.cmpMode = 'artifacts'; renderCompareTab(); });

    const btnMus = document.createElement('button');
    btnMus.type = 'button';
    btnMus.className = 'studio-tab-btn' + (studioState.cmpMode === 'museums' ? ' active' : '');
    btnMus.textContent = zh ? '🏛 博物馆馆藏对照 (Museum vs. Museum)' : '🏛 Museum vs. Museum';
    btnMus.addEventListener('click', () => { studioState.cmpMode = 'museums'; renderCompareTab(); });

    modeGrp.appendChild(btnArt);
    modeGrp.appendChild(btnMus);
    topBar.appendChild(modeGrp);
    pane.appendChild(topBar);

    if (studioState.cmpMode === 'artifacts') {
      renderArtifactCompare(pane, zh);
    } else {
      renderMuseumCompare(pane, zh);
    }
  }

  function renderArtifactCompare(pane, zh) {
    const preBar = document.createElement('div');
    preBar.className = 'cmp-presets';
    for (let i = 0; i < SPLIT_TWIN_PRESETS.length; i++) {
      const pr = SPLIT_TWIN_PRESETS[i];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cmp-preset-btn' + (studioState.cmpArtA === pr.a && studioState.cmpArtB === pr.b ? ' active' : '');
      b.textContent = zh ? pr.zh : pr.en;
      b.addEventListener('click', () => {
        studioState.cmpArtA = pr.a;
        studioState.cmpArtB = pr.b;
        renderCompareTab();
      });
      preBar.appendChild(b);
    }
    pane.appendChild(preBar);

    const itA = MASTER_BY_KEY.get(studioState.cmpArtA) || MASTERPIECES[0];
    const itB = MASTER_BY_KEY.get(studioState.cmpArtB) || MASTERPIECES[1];

    const grid = document.createElement('div');
    grid.className = 'cmp-split-grid';

    const makeCol = (item, side) => {
      const col = document.createElement('div');
      col.className = 'cmp-col-card';

      const sel = document.createElement('select');
      sel.className = 'cmp-select';
      sel.setAttribute('aria-label', side === 'A' ? 'Select first masterpiece' : 'Select second masterpiece');
      for (let i = 0; i < MASTERPIECES.length; i++) {
        const m = MASTERPIECES[i];
        const opt = document.createElement('option');
        opt.value = m.key;
        opt.textContent = (zh ? m.zh : m.en) + ' — ' + museumShortName(m.museumId);
        if (m.key === item.key) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener('change', () => {
        if (side === 'A') studioState.cmpArtA = sel.value;
        else studioState.cmpArtB = sel.value;
        renderCompareTab();
      });

      const pBox = document.createElement('div');
      pBox.className = 'cmp-plate-box';
      const cnv = document.createElement('canvas');
      cnv.width = 480;
      cnv.height = 360;
      paintThumb(cnv, item.museumId, item.sprite, true);
      pBox.appendChild(cnv);

      const h3 = document.createElement('h3');
      h3.className = 'cmp-title';
      h3.textContent = zh ? item.zh : item.en;

      const tbl = document.createElement('table');
      tbl.className = 'cmp-meta-table';
      const rows = [
        [zh ? '原属国 / 地区' : 'Origin Homeland', countryLabel(item.countryEn, item.countryZh)],
        [zh ? '现藏博物馆' : 'Holding Museum', museumShortName(item.museumId)],
        [zh ? '创作年代' : 'Creation Age', item.date],
        [zh ? '入藏年份' : 'Acquisition Year', zh ? (item.acq + ' 年') : String(item.acq)],
        [zh ? '距故乡航程' : 'Distance From Home', item.distKm > 0 ? (fmtNum(item.distKm) + ' km') : (zh ? '本馆所在国珍藏' : 'Domestic Host')],
        [zh ? '材质工艺' : 'Material', zh ? item.matZh : item.mat],
        [zh ? '馆藏编号' : 'Inventory No.', item.reg]
      ];
      for (let r = 0; r < rows.length; r++) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = rows[r][0];
        const td = document.createElement('td');
        td.textContent = rows[r][1];
        tr.appendChild(th);
        tr.appendChild(td);
        tbl.appendChild(tr);
      }

      const acts = document.createElement('div');
      acts.className = 'exh-item-actions';
      const sv = document.createElement('button');
      sv.type = 'button';
      sv.className = 'studio-mini-btn';
      sv.textContent = studioState.savedKeys.includes(item.key) ? (zh ? '★ 已收藏' : '★ Saved') : (zh ? '☆ 收藏' : '☆ Save');
      sv.addEventListener('click', () => { toggleSavedKey(item.key); renderCompareTab(); });

      const pc = document.createElement('button');
      pc.type = 'button';
      pc.className = 'studio-mini-btn is-gold';
      pc.textContent = zh ? '🖼 明信片' : '🖼 Postcard';
      pc.addEventListener('click', () => downloadPostcardPng(item));

      const ext = document.createElement('a');
      ext.className = 'studio-mini-btn';
      ext.href = buildObjUrl(item);
      ext.target = '_blank';
      ext.rel = 'noopener noreferrer';
      ext.textContent = zh ? '馆方档案 ↗' : 'Museum Record ↗';

      acts.appendChild(sv);
      acts.appendChild(pc);
      acts.appendChild(ext);

      col.appendChild(sel);
      col.appendChild(pBox);
      col.appendChild(h3);
      col.appendChild(tbl);
      col.appendChild(acts);
      return col;
    };

    grid.appendChild(makeCol(itA, 'A'));
    grid.appendChild(makeCol(itB, 'B'));
    pane.appendChild(grid);

    const yrDiff = Math.abs(itA.midYr - itB.midYr);
    const sepKm = Math.round(haversineKm(itA.hostLon, itA.hostLat, itB.hostLon, itB.hostLat));
    const delta = document.createElement('div');
    delta.className = 'cmp-delta-banner';
    delta.textContent = zh
      ? ('年代相差约 ' + fmtNum(yrDiff) + ' 年  ·  两座现藏博物馆相隔 ' + fmtNum(sepKm) + ' km  ·  ' + (itA.countryEn === itB.countryEn ? ('同源于' + countryLabel(itA.countryEn, itA.countryZh)) : (countryLabel(itA.countryEn, itA.countryZh) + ' ↔ ' + countryLabel(itB.countryEn, itB.countryZh))))
      : ('Created ~' + fmtNum(yrDiff) + ' years apart  ·  Holding museums separated by ' + fmtNum(sepKm) + ' km  ·  ' + (itA.countryEn === itB.countryEn ? ('Shared Homeland: ' + countryLabel(itA.countryEn, itA.countryZh)) : (countryLabel(itA.countryEn, itA.countryZh) + ' ↔ ' + countryLabel(itB.countryEn, itB.countryZh))));
    pane.appendChild(delta);
  }

  function renderMuseumCompare(pane, zh) {
    const mA = MUSEUMS[studioState.cmpMusA] || MUSEUMS.bm;
    const mB = MUSEUMS[studioState.cmpMusB] || MUSEUMS.louvre;
    const statsOf = (m) => {
      let tot = 0, host = 0;
      const map = new Map();
      for (let i = 0; i < m.countriesSpec.length; i++) {
        const [cEn, cZh, cnt] = m.countriesSpec[i];
        tot += cnt;
        if (cEn === m.hostCountryEn) host += cnt;
        map.set(cEn, { cnt, zh: cZh });
      }
      const curated = Object.values(m.featuredByCountry || {}).reduce((s, a) => s + a.length, 0);
      return { tot, host, intl: tot - host, countries: m.countriesSpec.length, curated, map };
    };
    const sA = statsOf(mA);
    const sB = statsOf(mB);

    const overlap = [];
    sA.map.forEach((vA, cEn) => {
      if (sB.map.has(cEn)) {
        const vB = sB.map.get(cEn);
        overlap.push({ en: cEn, zh: vA.zh, a: vA.cnt, b: vB.cnt, sum: vA.cnt + vB.cnt });
      }
    });
    overlap.sort((x, y) => y.sum - x.sum);

    const grid = document.createElement('div');
    grid.className = 'cmp-split-grid';

    const makeMCol = (m, st, side) => {
      const col = document.createElement('div');
      col.className = 'cmp-col-card';
      const sel = document.createElement('select');
      sel.className = 'cmp-select';
      sel.setAttribute('aria-label', side === 'A' ? 'Select first museum' : 'Select second museum');
      for (let i = 0; i < SUPPORTED_MUSEUMS.length; i++) {
        const mid = SUPPORTED_MUSEUMS[i];
        const opt = document.createElement('option');
        opt.value = mid;
        opt.textContent = museumShortName(mid);
        if (mid === m.id) opt.selected = true;
        sel.appendChild(opt);
      }
      sel.addEventListener('change', () => {
        if (side === 'A') studioState.cmpMusA = sel.value;
        else studioState.cmpMusB = sel.value;
        renderCompareTab();
      });

      const h3 = document.createElement('h3');
      h3.className = 'cmp-title';
      h3.textContent = museumShortName(m.id);

      const tbl = document.createElement('table');
      tbl.className = 'cmp-meta-table';
      const intlPct = ((st.intl / Math.max(1, st.tot)) * 100).toFixed(1) + '%';
      const rows = [
        [zh ? '馆藏建档总数' : 'Total Catalogued', fmtNum(st.tot)],
        [zh ? '海外来源文物' : 'International Provenance', fmtNum(st.intl) + ' (' + intlPct + ')'],
        [zh ? '本土馆藏' : 'Domestic Host Holdings', fmtNum(st.host)],
        [zh ? '覆盖原属国' : 'Homelands Covered', fmtNum(st.countries)],
        [zh ? '高清镇馆名作' : 'Verified HD Plates', fmtNum(st.curated)],
        [zh ? '入藏时间跨度' : 'Acquisition Span', m.acqStart + ' – ' + m.acqEnd]
      ];
      for (let r = 0; r < rows.length; r++) {
        const tr = document.createElement('tr');
        const th = document.createElement('th'); th.textContent = rows[r][0];
        const td = document.createElement('td'); td.textContent = rows[r][1];
        tr.appendChild(th); tr.appendChild(td);
        tbl.appendChild(tr);
      }
      col.appendChild(sel);
      col.appendChild(h3);
      col.appendChild(tbl);
      return col;
    };

    grid.appendChild(makeMCol(mA, sA, 'A'));
    grid.appendChild(makeMCol(mB, sB, 'B'));
    pane.appendChild(grid);

    const top5Str = overlap.slice(0, 5).map(o => countryLabel(o.en, o.zh) + ' (' + fmtNum(o.a) + ' vs ' + fmtNum(o.b) + ')').join(' · ');
    const banner = document.createElement('div');
    banner.className = 'cmp-delta-banner';
    banner.textContent = zh
      ? ('两馆共有 ' + overlap.length + ' 个重叠文物原属国 — Top 5：' + top5Str)
      : (overlap.length + ' Shared Origin Homelands — Top 5 Overlap: ' + top5Str);
    pane.appendChild(banner);
  }

  // =========================================================================
  // Feature #4: My Exhibition Bookmarks + Shareable URL + Postcard Exporter
  // =========================================================================
  function renderExhibitionTab() {
    const zh = getLang() === 'zh';
    const pane = elPanes.exhibition;
    pane.replaceChildren();

    const bar = document.createElement('div');
    bar.className = 'exh-topbar';

    const addRow = document.createElement('div');
    addRow.className = 'exh-add-row';
    const addSel = document.createElement('select');
    addSel.className = 'cmp-select';
    addSel.setAttribute('aria-label', zh ? '选择国宝加入我的展厅' : 'Choose a masterpiece to add to My Exhibition');
    for (let i = 0; i < MASTERPIECES.length; i++) {
      const m = MASTERPIECES[i];
      const opt = document.createElement('option');
      opt.value = m.key;
      opt.textContent = (zh ? m.zh : m.en) + ' · ' + museumShortName(m.museumId);
      addSel.appendChild(opt);
    }
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn-primary-gold';
    addBtn.textContent = zh ? '+ 加入我的展厅' : '+ Add to Exhibition';
    addBtn.addEventListener('click', () => {
      if (!studioState.savedKeys.includes(addSel.value)) {
        toggleSavedKey(addSel.value);
      } else {
        showToast(zh ? '该国宝已在你的展厅中' : 'Already in My Exhibition');
      }
    });
    addRow.appendChild(addSel);
    addRow.appendChild(addBtn);

    const shareBtn = document.createElement('button');
    shareBtn.type = 'button';
    shareBtn.className = 'btn-secondary-vellum';
    shareBtn.textContent = zh ? '🔗 复制展厅分享链接' : '🔗 Copy Shareable Link';
    shareBtn.addEventListener('click', () => {
      const keys = studioState.savedKeys.length ? studioState.savedKeys : ['bm:17', 'bm:56', 'berlin:0', 'louvre:0'];
      const base = window.location.origin + window.location.pathname;
      const shareUrl = base + '#exhibit=' + encodeURIComponent(keys.join(',')) + (zh ? '&lang=zh' : '');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast(zh ? '🔗 已复制可分享的个人展厅链接！' : '🔗 Shareable exhibition URL copied!');
        }).catch(() => showToast(shareUrl));
      } else {
        showToast(shareUrl);
      }
    });

    bar.appendChild(addRow);
    bar.appendChild(shareBtn);
    pane.appendChild(bar);

    if (!studioState.savedKeys.length) {
      const empty = document.createElement('div');
      empty.className = 'cmdk-empty';
      const p = document.createElement('p');
      p.textContent = zh
        ? '你的个人展厅目前为空。你可以从上方下拉菜单添加任意 325 件镇馆名作，或在浏览地球仪/对比页时点击「★ 收藏」。'
        : 'Your personal exhibition is currently empty. Add any of the 325 HD masterpieces above, click ★ Save while browsing, or load a starter showcase below.';
      const starterBtn = document.createElement('button');
      starterBtn.type = 'button';
      starterBtn.className = 'btn-primary-gold';
      starterBtn.textContent = zh ? '✦ 一键载入 6 件精选跨馆名作' : '✦ Load 6 Featured Cross-Museum Icons';
      starterBtn.addEventListener('click', () => {
        studioState.savedKeys = ['bm:17', 'bm:56', 'bm:3', 'met:29', 'louvre:0', 'berlin:0'];
        persistSavedKeys(studioState.savedKeys);
        updateNavBadges();
        syncStudioChromeLabels();
        renderExhibitionTab();
      });
      empty.appendChild(p);
      empty.appendChild(starterBtn);
      pane.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'exh-cards-grid';
    for (let i = 0; i < studioState.savedKeys.length; i++) {
      const item = MASTER_BY_KEY.get(studioState.savedKeys[i]);
      if (!item) continue;

      const card = document.createElement('article');
      card.className = 'exh-item-card';

      const cnv = document.createElement('canvas');
      cnv.className = 'exh-item-canvas';
      cnv.width = 400;
      cnv.height = 300;
      paintThumb(cnv, item.museumId, item.sprite, true);

      const body = document.createElement('div');
      body.className = 'exh-item-body';
      const h3 = document.createElement('h3');
      h3.className = 'exh-item-title';
      h3.textContent = zh ? item.zh : item.en;

      const meta = document.createElement('div');
      meta.className = 'exh-item-meta';
      meta.textContent = countryLabel(item.countryEn, item.countryZh) + ' → ' + museumShortName(item.museumId) +
        (item.distKm > 0 ? (' · ' + fmtNum(item.distKm) + ' km') : '');

      const acts = document.createElement('div');
      acts.className = 'exh-item-actions';

      const pcBtn = document.createElement('button');
      pcBtn.type = 'button';
      pcBtn.className = 'studio-mini-btn is-gold';
      pcBtn.textContent = zh ? '🖼 导出明信片 (.png)' : '🖼 Postcard (.png)';
      pcBtn.addEventListener('click', () => downloadPostcardPng(item));

      const cmpBtn = document.createElement('button');
      cmpBtn.type = 'button';
      cmpBtn.className = 'studio-mini-btn';
      cmpBtn.textContent = zh ? '⇄ 对比' : '⇄ Compare';
      cmpBtn.addEventListener('click', () => {
        studioState.cmpArtA = item.key;
        studioState.cmpMode = 'artifacts';
        switchStudioTab('compare');
      });

      const rmBtn = document.createElement('button');
      rmBtn.type = 'button';
      rmBtn.className = 'studio-mini-btn';
      rmBtn.textContent = zh ? '移除' : 'Remove';
      rmBtn.addEventListener('click', () => toggleSavedKey(item.key));

      acts.appendChild(pcBtn);
      acts.appendChild(cmpBtn);
      acts.appendChild(rmBtn);

      body.appendChild(h3);
      body.appendChild(meta);
      body.appendChild(acts);
      card.appendChild(cnv);
      card.appendChild(body);
      grid.appendChild(card);
    }
    pane.appendChild(grid);
  }

  // =========================================================================
  // Global Keyboard Shortcuts (⌘K / Ctrl+K, Esc) & #exhibit= Deep-Link Import
  // =========================================================================
  function checkSharedExhibitHash(sourceHash) {
    const pick = typeof sourceHash === 'string' && sourceHash.includes('exhibit=')
      ? sourceHash
      : ((window.location.hash || '').includes('exhibit=') ? window.location.hash : INITIAL_RAW_HASH);
    const raw = String(pick || '').replace(/^#/, '');
    if (!raw.includes('exhibit=')) return;
    const params = new URLSearchParams(raw);
    const exh = params.get('exhibit');
    if (!exh) return;
    const valid = exh.split(',').map(s => s.trim()).filter(k => MASTER_BY_KEY.has(k)).slice(0, 36);
    if (valid.length) {
      studioState.savedKeys = Array.from(new Set([...valid, ...studioState.savedKeys])).slice(0, 36);
      persistSavedKeys(studioState.savedKeys);
      updateNavBadges();
      openStudio('exhibition');
    }
  }

  window.addEventListener('hashchange', () => checkSharedExhibitHash(window.location.hash));

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdkBackdrop && cmdkBackdrop.classList.contains('open')) closeCmdk();
      else openCmdk();
      return;
    }
    if (e.key === 'Escape') {
      if (cmdkBackdrop && cmdkBackdrop.classList.contains('open')) {
        e.stopPropagation();
        closeCmdk();
      } else if (studioBackdrop && studioBackdrop.classList.contains('open')) {
        e.stopPropagation();
        closeStudio();
      }
    }
  });

  // React automatically whenever host page switches English <-> 中文
  if (typeof MutationObserver === 'function') {
    new MutationObserver(() => {
      updateNavBadges();
      syncContextButtonsLabels();
      if (studioBackdrop && studioBackdrop.classList.contains('open')) {
        switchStudioTab(studioState.activeTab);
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }

  function bootStudio() {
    injectNavbarTools();
    injectModalContextButtons();
    checkSharedExhibitHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootStudio);
  } else {
    bootStudio();
  }
})();
