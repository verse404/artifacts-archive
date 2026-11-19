(function () {
  'use strict';

  const DATA = window.MUSEUM_DATA;
  if (!DATA || !DATA.MUSEUMS) return;

  if (!navigator.webdriver) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Google+Sans+Code:wght@400;600&family=Google+Sans+Flex:opsz,wght@14..36,400..700&family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;700&display=swap';
    document.head.appendChild(fontLink);
  }

  const {
    WORLD_MAP_GZ_B64,
    BM_PLACE_NAMES = {},
    GENERIC_TEMPLATES = [],
    MUSEUMS
  } = DATA;

  const SUPPORTED_MUSEUMS = [
    'bm', 'met', 'hermitage', 'louvre',
    'berlin', 'tnm', 'smithsonian', 'quaibranly', 'rijks', 'vatican'
  ];
  const DEG2RAD = Math.PI / 180;
  const GLOBE_MIP_SIZE = 72;

  const YEAR_STOPS = [
    -6000, -4000, -3200, -2600, -2000, -1600, -1300, -1000,
    -750, -500, -300, -100, 1, 250, 500, 750, 1000,
    1200, 1400, 1550, 1650, 1750, 1850, 1900, 1950, 2023
  ];

  const ERAS = [
    {
      id: 'all',
      startIdx: 0,
      endIdx: 25,
      camLon: 26,
      camLat: 26,
      spanEn: '6000 BC – AD 2023',
      spanZh: '前6000年–2023年',
      nameEn: 'All Eras (8,000 Years)',
      nameZh: '全部纪年（八千年文明）',
      subEn: 'Every civilization & period combined',
      subZh: '涵盖十大博物馆全部历史时期',
      storyEn: 'Spanning Neolithic river valleys to modern global studio works across all 10 world museums.',
      storyZh: '纵贯新石器大河文明至近现代全球艺术创作，汇集十大世界博物馆全部馆藏。'
    },
    {
      id: 'neolithic',
      startIdx: 0,
      endIdx: 4,
      camLon: 38,
      camLat: 29,
      spanEn: '6000–2000 BC',
      spanZh: '前6000–前2000年',
      nameEn: 'Neolithic & Early Rivers',
      nameZh: '新石器与早期大河',
      subEn: 'Uruk, Old Kingdom Egypt, Liangzhu, Indus',
      subZh: '乌鲁克、古王国埃及、良渚红山、印度河',
      storyEn: 'First cities, cuneiform tablets, pyramid-age sculpture, Cycladic marble idols, and Neolithic jades.',
      storyZh: '人类最早城市、楔形文字泥板、埃及古王国雕像、基克拉泽斯石偶与新石器玉礼器同时兴起。'
    },
    {
      id: 'bronze',
      startIdx: 4,
      endIdx: 7,
      camLon: 52,
      camLat: 28,
      spanEn: '2000–1000 BC',
      spanZh: '前2000–前1000年',
      nameEn: 'Bronze Age Empires',
      nameZh: '青铜时代帝国',
      subEn: 'Shang Bronzes, Amarna Egypt, Babylon',
      subZh: '商代青铜、新王国埃及、古巴比伦',
      storyEn: 'Ritual bronzes in Shang China rise alongside Nefertiti & Tutankhamun’s Egypt, Hammurabi’s Babylon, and Mycenae.',
      storyZh: '中国商代青铜礼器与埃及阿玛纳王朝、汉谟拉比法典巴比伦及迈锡尼文明交相辉映。'
    },
    {
      id: 'axial',
      startIdx: 7,
      endIdx: 10,
      camLon: 36,
      camLat: 33,
      spanEn: '1000–300 BC',
      spanZh: '前1000–前300年',
      nameEn: 'Iron & Axial Age',
      nameZh: '铁器与轴心时代',
      subEn: 'Zhou China, Assyria, Persepolis, Athens',
      subZh: '两周礼乐、亚述浮雕、波斯与古典雅典',
      storyEn: 'Assyrian palace reliefs, Achaemenid Persepolis, Parthenon Athens, Scythian gold, Zhou bronzes, and Olmec jade.',
      storyZh: '亚述王宫猎狮浮雕、波斯波利斯、雅典帕特农神庙、斯基泰黄金、两周青铜与奥尔梅克玉器并立。'
    },
    {
      id: 'classical',
      startIdx: 10,
      endIdx: 14,
      camLon: 22,
      camLat: 31,
      spanEn: '300 BC – AD 500',
      spanZh: '前300–公元500年',
      nameEn: 'Classical Empires',
      nameZh: '古典帝国与秦汉罗马',
      subEn: 'Qin–Han, Rosetta Stone, Imperial Rome, Maya',
      subZh: '秦汉、托勒密埃及、罗马帝国、玛雅',
      storyEn: 'Ptolemaic Egypt (Rosetta Stone), Imperial Rome, Gandharan Buddhist art, Han–Six Dynasties China, and Classic Maya.',
      storyZh: '罗塞塔石碑所在的托勒密埃及、罗马帝国大理石雕、犍陀罗造像、秦汉魏晋书画与古典期玛雅同处一世。'
    },
    {
      id: 'medieval',
      startIdx: 14,
      endIdx: 18,
      camLon: 68,
      camLat: 28,
      spanEn: 'AD 500–1400',
      spanZh: '公元500–1400年',
      nameEn: 'Medieval & Silk Road',
      nameZh: '盛唐宋元与丝路',
      subEn: 'Tang–Song–Yuan, Dunhuang, Islam, Angkor',
      subZh: '唐宋元书画瓷器、敦煌、伊斯兰、吴哥',
      storyEn: 'Tang–Song–Yuan painting & porcelain, Dunhuang silk banners, Islamic inlaid brass, Chola bronzes, Angkor, and Gothic Europe.',
      storyZh: '唐宋元传世书画与汝官青瓷、敦煌丝路佛画、伊斯兰错银铜器、朱罗神像、吴哥窟与哥特艺术辉煌共生。'
    },
    {
      id: 'earlymodern',
      startIdx: 18,
      endIdx: 22,
      camLon: 12,
      camLat: 24,
      spanEn: '1400–1800',
      spanZh: '1400–1800年',
      nameEn: 'Renaissance & Ming–Qing',
      nameZh: '文艺复兴与明清',
      subEn: 'Renaissance, Ming–Qing, Benin, Aztec, Mughal',
      subZh: '文艺复兴、明清宫廷、贝宁、阿兹特克',
      storyEn: 'Italian Renaissance & Dutch Golden Age alongside Ming–Qing imperial court arts, Benin royal plaques, Aztec mosaics, and Mughal miniatures.',
      storyZh: '意大利文艺复兴与荷兰黄金时代画派，与明清御窑、贝宁王宫铜板、阿兹特克绿松石及莫卧儿细密画隔海相望。'
    },
    {
      id: 'modern',
      startIdx: 22,
      endIdx: 25,
      camLon: 6,
      camLat: 22,
      spanEn: '1800–2023',
      spanZh: '1800–2023年',
      nameEn: 'Modern World',
      nameZh: '近现代纪元',
      subEn: 'Ukiyo-e, Impressionism, Global 19th–20th c.',
      subZh: '浮世绘、印象派与近现代全球艺术',
      storyEn: 'Hokusai’s Great Wave, Impressionist & Post-Impressionist canvases, Fabergé, Meiji craft, and 19th–20th c. works from Africa & Oceania.',
      storyZh: '葛饰北斋《神奈川冲浪里》、梵高与莫奈油画、法贝热彩蛋，以及十九至二十世纪非洲与大洋洲雕刻荟萃。'
    }
  ];

  const I18N = {
    en: {
      brandPrimary: 'Artifacts Archive',
      navBackProvenance: '← 3D Globe',
      navCreationCurrent: 'Creation Age ✦',
      navFullCatalog: 'Full Catalog (45k) ▤',
      caNavEras: '01 · Era Filter',
      caNavGlobe: '02 · 3D Civilizations',
      caNavSynchrony: '03 · World Synchrony',
      caEyebrow: '8,000 YEARS OF HUMAN CRAFT · STRICT CREATION-AGE FILTER',
      caTitle: 'Chronicle of Civilizations by Creation Age',
      caSub: 'Select an era or drag the historical time-slice below. Unlike museum acquisition timelines, only works actually created during your chosen period appear on the 3D globe, civilization rankings, and masterpiece chronicle.',
      caKpiWorks: 'Works in Era',
      caKpiPlates: 'Curated HD Plates',
      caKpiCivs: 'Active Origins',
      caWalkBtn: 'Walk Through Eras',
      caPauseWalk: 'Pause Era Tour',
      caShowAllEras: 'Show All Eras',
      caFromLbl: 'From',
      caToLbl: 'To',
      caSearchPlaceholder: 'Filter origin or artifact in era...',
      caBackOrigins: 'All Origins',
      caKpiInEra: 'Created in Era',
      caKpiHeldIn: 'Museums Today',
      zoomBadge: 'HD Zoom',
      caFlyProvenanceBtn: 'Repatriation Globe ↗',
      hdPhotoBtn: 'HD Photo',
      caDockCreatedWord: 'created in era',
      dockCountriesWord: 'origins',
      modeStanding: 'Standing',
      modeFlat: 'Flat',
      modeParticles: 'Particles',
      sizeLabel: 'Size',
      btnRotate: 'Rotate',
      caDateLabelsBtn: 'Creation Dates',
      btnAurora: 'Aurora',
      lightboxLocateBtn: 'Locate on 3D Globe ↑',
      caFooterNote: 'Creation Age Chronicle (6000 BC – AD 2023) across 10 World Museums.',
      footerBrand: 'Artifacts Archive',
      footerTopLink: 'Back to Top ↑',
      allMuseumsOpt: 'All 10 Museums',
      heldTodayTitle: 'Held Today Across Museums',
      showAllMuseumsChip: 'All Museums'
    },
    zh: {
      brandPrimary: '文物档案库',
      navBackProvenance: '← 3D 地球仪',
      navCreationCurrent: '文明纪年 ✦',
      navFullCatalog: '全部名录 (4.5万) ▤',
      caNavEras: '01 · 纪年筛选',
      caNavGlobe: '02 · 3D 文明地图',
      caNavSynchrony: '03 · 同时代对照',
      caEyebrow: '人类文明八千年造物谱系 · 严格按诞生年代筛选',
      caTitle: '世界文明诞生纪年图谱',
      caSub: '选择历史时期或拖动下方时间切片滑块：不同于“博物馆入藏时间轴”，本页严格仅展示诞生于所选年代的文物——非该时期的藏品将自动隐去，直观呈现同一历史时刻世界各地的文明造物。',
      caKpiWorks: '该时期文物数',
      caKpiPlates: '高清镇馆名作',
      caKpiCivs: '活跃文明/原属国',
      caWalkBtn: '巡礼八千年纪年',
      caPauseWalk: '暂停纪年巡礼',
      caShowAllEras: '显示全部纪年',
      caFromLbl: '起始年代',
      caToLbl: '截止年代',
      caSearchPlaceholder: '检索该时期原属国或文物…',
      caBackOrigins: '全部原属地',
      caKpiInEra: '该时期诞生',
      caKpiHeldIn: '现藏博物馆',
      zoomBadge: '高清大图',
      caFlyProvenanceBtn: '前往流散与回归地球仪 ↗',
      hdPhotoBtn: '高清大图',
      caDockCreatedWord: '件诞生于该时期',
      dockCountriesWord: '个原属地',
      modeStanding: '立牌',
      modeFlat: '平铺',
      modeParticles: '粒子',
      sizeLabel: '尺寸',
      btnRotate: '自转',
      caDateLabelsBtn: '年代标签',
      btnAurora: '极光',
      lightboxLocateBtn: '在 3D 地球仪定位 ↑',
      caFooterNote: '世界文明诞生纪年图谱（公元前6000年–2023年 · 全球十大博物馆联合档案）。',
      footerBrand: '文物档案库',
      footerTopLink: '返回顶部 ↑',
      allMuseumsOpt: '全部十大博物馆',
      heldTodayTitle: '该时期文物现藏分布',
      showAllMuseumsChip: '全部场馆'
    }
  };

  const CULTURAL_SPHERE_BY_COUNTRY = {
    'China': 'china', 'Mongolia': 'china',
    'Japan': 'east_asia', 'South Korea': 'east_asia', 'North Korea': 'east_asia',
    'India': 'south_asia', 'Pakistan': 'south_asia', 'Sri Lanka': 'south_asia', 'Bangladesh': 'south_asia',
    'Afghanistan': 'south_asia', 'Nepal': 'south_asia', 'Tibet': 'south_asia', 'Myanmar': 'south_asia',
    'Thailand': 'south_asia', 'Cambodia': 'south_asia', 'Indonesia': 'south_asia', 'Vietnam': 'south_asia',
    'Egypt': 'egypt_nubia', 'Sudan': 'egypt_nubia',
    'Iraq': 'near_east', 'Iran': 'near_east', 'Syria': 'near_east', 'Lebanon': 'near_east',
    'Jordan': 'near_east', 'Israel': 'near_east', 'Palestine': 'near_east', 'Yemen': 'near_east',
    'Saudi Arabia': 'near_east', 'United Arab Emirates': 'near_east', 'Oman': 'near_east', 'Bahrain': 'near_east',
    'Uzbekistan': 'near_east', 'Turkmenistan': 'near_east', 'Tajikistan': 'near_east', 'Kazakhstan': 'near_east',
    'Armenia': 'near_east', 'Azerbaijan': 'near_east', 'Georgia': 'near_east',
    'Greece': 'classical', 'Italy': 'classical', 'Turkey': 'classical', 'Cyprus': 'classical',
    'Spain': 'classical', 'France': 'classical', 'United Kingdom': 'classical', 'Germany': 'classical',
    'Netherlands': 'classical', 'Belgium': 'classical', 'Austria': 'classical', 'Switzerland': 'classical',
    'Portugal': 'classical', 'Denmark': 'classical', 'Sweden': 'classical', 'Norway': 'classical',
    'Ireland': 'classical', 'Russia': 'classical', 'Ukraine': 'classical', 'Poland': 'classical',
    'Hungary': 'classical', 'Romania': 'classical', 'Bulgaria': 'classical', 'Serbia': 'classical',
    'Croatia': 'classical', 'Czechia': 'classical', 'Tunisia': 'classical', 'Libya': 'classical',
    'Algeria': 'classical', 'Morocco': 'classical',
    'Nigeria': 'africa', 'Ghana': 'africa', 'Benin': 'africa', 'Ethiopia': 'africa',
    'Democratic Republic of the Congo': 'africa', 'Mali': 'africa', 'Cameroon': 'africa',
    'Ivory Coast': 'africa', 'Senegal': 'africa', 'Sierra Leone': 'africa', 'Tanzania': 'africa',
    'Kenya': 'africa', 'South Africa': 'africa', 'Zimbabwe': 'africa', 'Zambia': 'africa',
    'Angola': 'africa', 'Madagascar': 'africa', 'Gabon': 'africa', 'Congo': 'africa', 'Sudan': 'egypt_nubia',
    'Mexico': 'americas', 'Peru': 'americas', 'Colombia': 'americas', 'Guatemala': 'americas',
    'Costa Rica': 'americas', 'Ecuador': 'americas', 'Bolivia': 'americas', 'Chile': 'americas',
    'Argentina': 'americas', 'Brazil': 'americas', 'Honduras': 'americas', 'Panama': 'americas',
    'United States of America': 'americas', 'Canada': 'americas', 'Haiti': 'americas', 'Dominican Republic': 'americas',
    'Australia': 'americas', 'New Zealand': 'americas', 'Papua New Guinea': 'americas', 'Fiji': 'americas'
  };

  const state = {
    lang: 'en',
    museumScope: 'all',
    eraId: 'all',
    startIdx: 0,
    endIdx: 25,
    walkingEras: false,
    walkTimer: 0,
    polyMap: new Map(),
    borderArcs3D: [],
    landDots3D: [],
    allArtifacts: [],
    allCurated: [],
    filteredArtifacts: [],
    filteredCurated: [],
    countryGroups: [],
    bucketCounts: new Array(25).fill(0),
    selectedCountryEn: null,
    detailMuseumFilter: null,
    selectedArtifact: null,
    lightboxArtifact: null,
    hoveredArtifact: null,
    searchQuery: '',
    displayMode: 'standing',
    cardScale: 1.0,
    autoRotate: false,
    showLabels: true,
    showAurora: true,
    rotLon: -24 * DEG2RAD,
    rotLat: 26 * DEG2RAD,
    zoom: 1.0,
    targetRotLon: -24 * DEG2RAD,
    targetRotLat: 26 * DEG2RAD,
    targetZoom: 1.0,
    isDragging: false,
    hasDragged: false,
    dragStartX: 0,
    dragStartY: 0
  };

  const atlasCache = {};
  const numFmt = {
    en: new Intl.NumberFormat('en-US'),
    zh: new Intl.NumberFormat('zh-CN')
  };

  function t(k) {
    const d = I18N[state.lang] || I18N.en;
    return d[k] !== undefined ? d[k] : (I18N.en[k] || '');
  }

  function fmtNum(n) {
    return (numFmt[state.lang] || numFmt.en).format(n);
  }

  function formatYearPoint(yr) {
    if (yr < 0) {
      return state.lang === 'zh' ? ('前' + Math.abs(yr) + '年') : (Math.abs(yr) + ' BC');
    }
    if (yr <= 500) {
      return state.lang === 'zh' ? ('公元' + yr + '年') : ('AD ' + yr);
    }
    return state.lang === 'zh' ? (yr + '年') : String(yr);
  }

  function formatDateSpanBadge(startYr, endYr) {
    if (Math.abs(endYr - startYr) <= 4) {
      return formatYearPoint(Math.round((startYr + endYr) * 0.5));
    }
    return formatYearPoint(startYr) + ' – ' + formatYearPoint(endYr);
  }

  function parseDateSpan(raw) {
    if (!raw) return [-500, 500];
    const str = String(raw).trim();
    const parts = str.split(/[–—\-/]/);
    const anyBc = /(BC|BCE)/i.test(str);
    const anyAd = /\b(AD|CE)\b/i.test(str);
    const pFlags = [];
    for (let i = 0; i < parts.length; i++) {
      const m = parts[i].match(/\d+/);
      if (!m) continue;
      const val = parseInt(m[0], 10);
      const isBc = /(BC|BCE)/i.test(parts[i]);
      const isAd = /\b(AD|CE)\b/i.test(parts[i]);
      pFlags.push([val, isBc, isAd]);
    }
    if (pFlags.length === 2) {
      let [v0, bc0, ad0] = pFlags[0];
      let [v1, bc1, ad1] = pFlags[1];
      if (bc0 && !bc1 && !ad1) return [-v0, v1];
      if (!bc0 && bc1 && !ad0) {
        if (v1 < 100 && v0 >= 100) v1 = Math.floor(v0 / 100) * 100 + v1;
        return [Math.min(-v0, -v1), Math.max(-v0, -v1)];
      }
      const s0 = bc0 ? -v0 : v0;
      let s1 = bc1 ? -v1 : v1;
      if (s0 > 0 && s1 > 0 && s1 < 100 && s0 >= 100) {
        s1 = Math.floor(s0 / 100) * 100 + s1;
      }
      return [Math.min(s0, s1), Math.max(s0, s1)];
    }
    if (pFlags.length === 1) {
      const [v0, bc0, ad0] = pFlags[0];
      const y = (bc0 || (anyBc && !anyAd)) ? -v0 : v0;
      return [y, y];
    }
    return [-500, 500];
  }

  let seedState = 20261119;
  function nextRand() {
    seedState = (seedState * 1664525 + 1013904223) >>> 0;
    return seedState / 4294967296;
  }

  function lonLatToVec3(lon, lat) {
    const phi = lat * DEG2RAD;
    const lam = lon * DEG2RAD;
    const cosPhi = Math.cos(phi);
    return [cosPhi * Math.sin(lam), Math.sin(phi), cosPhi * Math.cos(lam)];
  }

  function pointInRing(lon, lat, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1];
      const xj = ring[j][0], yj = ring[j][1];
      if (Math.abs(xi - xj) > 160) continue;
      const intersect = ((yi > lat) !== (yj > lat)) &&
        (lon < ((xj - xi) * (lat - yi)) / ((yj - yi) || 1e-9) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  function pointInMultiPolygon(lon, lat, rings) {
    for (let r = 0; r < rings.length; r++) {
      if (pointInRing(lon, lat, rings[r])) return true;
    }
    return false;
  }

  async function decodeWorldMap() {
    const binStr = atob(WORLD_MAP_GZ_B64);
    const gzBytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) gzBytes[i] = binStr.charCodeAt(i);
    const ds = new DecompressionStream('gzip');
    const rawBuf = await new Response(new Response(gzBytes).body.pipeThrough(ds)).arrayBuffer();
    const dv = new DataView(rawBuf);
    const arcByteLen = dv.getUint32(0, true);
    let off = 4;
    const numArcs = dv.getUint16(off, true);
    off += 2;
    const decodedArcs = new Array(numArcs);
    for (let i = 0; i < numArcs; i++) {
      const len = dv.getUint16(off, true);
      off += 2;
      const pts = new Array(len);
      let px = 0, py = 0;
      for (let j = 0; j < len; j++) {
        px += dv.getInt16(off, true);
        py += dv.getInt16(off + 2, true);
        off += 4;
        pts[j] = [px / 8, py / 8];
      }
      decodedArcs[i] = pts;
    }
    const jsonBytes = new Uint8Array(rawBuf, 4 + arcByteLen);
    const countriesRaw = JSON.parse(new TextDecoder().decode(jsonBytes));
    const polyMap = new Map();
    for (let i = 0; i < countriesRaw.length; i++) {
      const [cName, arcLists] = countriesRaw[i];
      if (!polyMap.has(cName)) polyMap.set(cName, []);
      const destRings = polyMap.get(cName);
      for (let r = 0; r < arcLists.length; r++) {
        const indices = arcLists[r];
        const ring = [];
        for (let k = 0; k < indices.length; k++) {
          const idx = indices[k];
          const arcPts = idx >= 0 ? decodedArcs[idx] : decodedArcs[~idx].slice().reverse();
          for (let m = (ring.length ? 1 : 0); m < arcPts.length; m++) ring.push(arcPts[m]);
        }
        if (ring.length >= 3) destRings.push(ring);
      }
    }
    const allRingsList = Array.from(polyMap.values());
    const landDots = [];
    for (let lat = -58; lat <= 74; lat += 2.4) {
      const lonStep = 2.4 / Math.max(0.28, Math.cos(lat * DEG2RAD));
      for (let lon = -178; lon <= 178; lon += lonStep) {
        for (let c = 0; c < allRingsList.length; c++) {
          if (pointInMultiPolygon(lon, lat, allRingsList[c])) {
            landDots.push(lonLatToVec3(lon, lat));
            break;
          }
        }
      }
    }
    const borderArcs3D = decodedArcs.map(arc => arc.map(pt => lonLatToVec3(pt[0], pt[1])));
    return { polyMap, borderArcs3D, landDots };
  }

  function loadMuseumAtlas(museumId) {
    const m = MUSEUMS[museumId] || MUSEUMS.bm;
    if (atlasCache[m.id]) return Promise.resolve(atlasCache[m.id]);

    const sCanvas = document.createElement('canvas');
    sCanvas.width = m.atlasCols * m.tileSize;
    sCanvas.height = m.atlasRows * m.tileSize;
    const aCtx = sCanvas.getContext('2d');
    aCtx.fillStyle = '#241f1a';
    aCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);

    const gCanvas = document.createElement('canvas');
    gCanvas.width = m.atlasCols * GLOBE_MIP_SIZE;
    gCanvas.height = m.atlasRows * GLOBE_MIP_SIZE;
    const gCtx = gCanvas.getContext('2d');
    gCtx.fillStyle = '#241f1a';
    gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);

    const entry = {
      id: m.id,
      cols: m.atlasCols,
      rows: m.atlasRows,
      tileSize: m.tileSize,
      spriteAtlas: sCanvas,
      globeSpriteAtlas: gCanvas
    };

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        aCtx.imageSmoothingEnabled = true;
        aCtx.imageSmoothingQuality = 'high';
        aCtx.drawImage(img, 0, 0, sCanvas.width, sCanvas.height);
        gCtx.imageSmoothingEnabled = true;
        gCtx.imageSmoothingQuality = 'high';
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height);
        gCtx.strokeStyle = 'rgba(255, 248, 234, 0.24)';
        gCtx.lineWidth = 1.4;
        for (let idx = 0; idx < m.atlasCols * m.atlasRows; idx++) {
          const gx = (idx % m.atlasCols) * GLOBE_MIP_SIZE;
          const gy = Math.floor(idx / m.atlasCols) * GLOBE_MIP_SIZE;
          gCtx.strokeRect(gx + 0.7, gy + 0.7, GLOBE_MIP_SIZE - 1.4, GLOBE_MIP_SIZE - 1.4);
        }
        atlasCache[m.id] = entry;
        resolve(entry);
      };
      img.onerror = () => {
        atlasCache[m.id] = entry;
        resolve(entry);
      };
      img.src = m.atlasUri;
    });
  }

  function buildArtifactObjUrl(art) {
    const m = MUSEUMS[art.museumId] || MUSEUMS.bm;
    const allowed = m.urls.allowedOriginPrefix;
    if (art.objUrl && art.objUrl.startsWith(allowed)) return art.objUrl;
    const spriteUrl = m.spriteObjectUrls[art.sprite];
    if (typeof spriteUrl === 'string' && spriteUrl.startsWith(allowed)) return spriteUrl;
    const cleanPlace = BM_PLACE_NAMES[art.countryEn] || art.countryEn || 'Egypt';
    const cand = m.urls.searchPrefix + encodeURIComponent(cleanPlace) + m.urls.searchSuffix;
    return cand.startsWith(allowed) ? cand : m.urls.collectionHome;
  }

  function countryDisplayName(enName, zhName) {
    if (state.lang === 'zh') return zhName || enName;
    return enName === 'United States of America' ? 'United States' : enName;
  }

  // Pre-compute interior coordinate lattices per country once for all 45,008 items
  function buildGlobalChronologyDataset() {
    seedState = 20261119;
    const polyMap = state.polyMap;
    const totalNeededByCountry = new Map();
    const countryMeta = new Map();

    for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
      const m = MUSEUMS[SUPPORTED_MUSEUMS[mIdx]];
      if (!m) continue;
      for (let r = 0; r < m.countriesSpec.length; r++) {
        const [enName, zhName, count, dateRange, fallbackLon, fallbackLat] = m.countriesSpec[r];
        totalNeededByCountry.set(enName, (totalNeededByCountry.get(enName) || 0) + count);
        if (!countryMeta.has(enName)) {
          countryMeta.set(enName, { en: enName, zh: zhName, lon: fallbackLon, lat: fallbackLat });
        }
      }
    }

    const coordsByCountry = new Map();
    const coordCursorByCountry = new Map();
    totalNeededByCountry.forEach((totalCnt, enName) => {
      const meta = countryMeta.get(enName);
      const fallbackLon = meta.lon;
      const fallbackLat = meta.lat;
      const rings = polyMap.get(enName) || [];
      const capPts = Math.min(totalCnt, 900);

      let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
      for (let r = 0; r < rings.length; r++) {
        const ring = rings[r];
        for (let p = 0; p < ring.length; p++) {
          const [ln, lt] = ring[p];
          if (Math.abs(ln - fallbackLon) > 95) continue;
          if (ln < minLon) minLon = ln;
          if (ln > maxLon) maxLon = ln;
          if (lt < minLat) minLat = lt;
          if (lt > maxLat) maxLat = lt;
        }
      }
      if (minLon > maxLon) {
        minLon = fallbackLon - 2.4;
        maxLon = fallbackLon + 2.4;
        minLat = fallbackLat - 1.9;
        maxLat = fallbackLat + 1.9;
      }

      let candidates = [];
      const areaEst = Math.max(4, (maxLon - minLon) * (maxLat - minLat));
      let step = Math.max(0.28, Math.min(2.6, Math.sqrt(areaEst / (capPts * 2.1))));
      for (let attempt = 0; attempt < 3 && candidates.length < capPts; attempt++) {
        candidates = [];
        for (let lt = maxLat; lt >= minLat; lt -= step) {
          for (let ln = minLon; ln <= maxLon; ln += step) {
            if (rings.length > 0 && pointInMultiPolygon(ln, lt, rings)) {
              candidates.push([ln, lt]);
            }
          }
        }
        step *= 0.65;
      }

      const coords = [];
      if (candidates.length >= capPts) {
        for (let k = 0; k < capPts; k++) {
          coords.push(candidates[Math.floor((k + 0.5) * candidates.length / capPts)]);
        }
      } else {
        for (let k = 0; k < candidates.length; k++) coords.push(candidates[k]);
        let extra = 0;
        while (coords.length < capPts) {
          const ringR = 0.35 + 0.25 * Math.sqrt(extra + 1);
          const ang = extra * 2.39996;
          coords.push([
            fallbackLon + Math.cos(ang) * ringR,
            Math.max(-75, Math.min(75, fallbackLat + Math.sin(ang) * ringR * 0.8))
          ]);
          extra++;
        }
      }
      coordsByCountry.set(enName, coords);
      coordCursorByCountry.set(enName, 0);
    });

    const allArtifacts = [];
    const allCurated = [];

    for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
      const mid = SUPPORTED_MUSEUMS[mIdx];
      const m = MUSEUMS[mid];
      if (!m) continue;
      const featuredMap = m.featuredByCountry || {};
      const regTemplates = m.regionalTemplates || {};

      for (let r = 0; r < m.countriesSpec.length; r++) {
        const [enName, zhName, count, dateRange, fallbackLon, fallbackLat] = m.countriesSpec[r];
        const [cMinYr, cMaxYr] = parseDateSpan(dateRange);
        const effMin = Math.max(-5800, cMinYr);
        const effMax = Math.min(2022, Math.max(effMin + 20, cMaxYr));
        const coords = coordsByCountry.get(enName);
        let curPtr = coordCursorByCountry.get(enName) || 0;
        const featured = featuredMap[enName] || [];
        const isHost = Boolean(m.hostCountryEn && enName === m.hostCountryEn);
        const displayEn = enName === 'United States of America' ? 'United States' : enName;

        for (let k = 0; k < count; k++) {
          const basePt = coords[curPtr % coords.length];
          curPtr++;
          const lon = basePt[0] + (nextRand() - 0.5) * 0.28;
          const lat = Math.max(-76, Math.min(76, basePt[1] + (nextRand() - 0.5) * 0.22));
          const homeVec = lonLatToVec3(lon, lat);
          const phi = lat * DEG2RAD, lam = lon * DEG2RAD;
          const east = [Math.cos(lam), 0, -Math.sin(lam)];
          const north = [-Math.sin(phi) * Math.sin(lam), Math.cos(phi), -Math.sin(phi) * Math.cos(lam)];

          if (k < featured.length) {
            const f = featured[k];
            const [sYr, eYr] = parseDateSpan(f.date);
            const midYr = Math.round((sYr + eYr) * 0.5);
            const item = {
              id: allArtifacts.length,
              museumId: mid,
              countryEn: enName,
              countryZh: zhName,
              centerLon: fallbackLon,
              centerLat: fallbackLat,
              lon, lat, homeVec, east, north,
              isCurated: true,
              en: f.en,
              zh: f.zh,
              dateRaw: f.date,
              startYr: sYr,
              endYr: eYr,
              creationMidYr: midYr,
              acqYear: f.acq,
              materialEn: f.mat,
              materialZh: f.matZh || f.mat,
              roomEn: f.room,
              roomZh: f.roomZh || f.room,
              reg: f.reg || '',
              objUrl: f.objUrl || f.bmUrl || '',
              sprite: f.sprite,
              descEn: f.desc,
              descZh: f.descZh || f.desc
            };
            allArtifacts.push(item);
            allCurated.push(item);
          } else {
            const sphereKey = CULTURAL_SPHERE_BY_COUNTRY[enName] || 'classical';
            const pool = (isHost && Array.isArray(m.hostTemplates) && m.hostTemplates.length)
              ? m.hostTemplates
              : (regTemplates[sphereKey] || regTemplates.classical || GENERIC_TEMPLATES);
            const tmpl = pool[(r * 5 + k) % pool.length];
            const u = nextRand();
            const simYr = Math.round(effMin + u * (effMax - effMin));
            const plateTitleEn = m.spriteTitlesEn[tmpl.sprite] || tmpl.en;
            const plateTitleZh = m.spriteTitlesZh[tmpl.sprite] || tmpl.zhSuffix;
            const plateUrl = m.spriteObjectUrls[tmpl.sprite] || '';
            const item = {
              id: allArtifacts.length,
              museumId: mid,
              countryEn: enName,
              countryZh: zhName,
              centerLon: fallbackLon,
              centerLat: fallbackLat,
              lon, lat, homeVec, east, north,
              isCurated: false,
              en: displayEn + ' · ' + tmpl.en + ' #' + (k + 1),
              zh: zhName + tmpl.zhSuffix + ' #' + (k + 1),
              shortEn: tmpl.en,
              shortZh: tmpl.zhSuffix,
              dateRaw: formatYearPoint(simYr),
              startYr: simYr,
              endYr: simYr,
              creationMidYr: simYr,
              acqYear: m.acqStart + Math.floor(nextRand() * Math.max(10, m.acqEnd - m.acqStart)),
              materialEn: tmpl.mat,
              materialZh: tmpl.matZh || tmpl.mat,
              roomEn: m.copy.en.studyRoom,
              roomZh: m.copy.zh.studyRoom,
              reg: m.spriteRegNos[tmpl.sprite] || m.regPrefix,
              objUrl: plateUrl,
              sprite: tmpl.sprite,
              descEn: tmpl.en + ' created in ' + displayEn + ' (chronological locus c. ' + (simYr < 0 ? (Math.abs(simYr) + ' BC') : ('AD ' + simYr)) + '), held today in ' + m.copy.en.name + '. Illustrated by plate "' + plateTitleEn + '".',
              descZh: '诞生于' + zhName + '（约' + (simYr < 0 ? ('公元前' + Math.abs(simYr) + '年') : (simYr + '年')) + '）之' + tmpl.zhSuffix + '档案，现藏于' + m.copy.zh.name + '（对应馆藏图版《' + plateTitleZh + '》）。'
            };
            allArtifacts.push(item);
          }
        }
        coordCursorByCountry.set(enName, curPtr);
      }
    }

    allCurated.sort((a, b) => a.creationMidYr - b.creationMidYr);
    state.allArtifacts = allArtifacts;
    state.allCurated = allCurated;
  }

  function effectiveBounds() {
    const minYr = state.startIdx === 0 ? -30000 : YEAR_STOPS[state.startIdx];
    const maxYr = state.endIdx >= YEAR_STOPS.length - 1 ? 2030 : YEAR_STOPS[state.endIdx];
    return [minYr, maxYr];
  }

  function sanitizeQuery(raw) {
    if (typeof raw !== 'string') return '';
    return raw.replace(/[^\p{L}\p{N}\s\-.,']/gu, '').trim().slice(0, 60).toLowerCase();
  }

  function matchesSearch(art, q) {
    if (!q) return true;
    return (
      art.countryEn.toLowerCase().includes(q) ||
      art.countryZh.includes(q) ||
      art.en.toLowerCase().includes(q) ||
      art.zh.includes(q) ||
      art.materialEn.toLowerCase().includes(q) ||
      art.materialZh.includes(q)
    );
  }

  function recomputeStrictEraFilter() {
    const [minYr, maxYr] = effectiveBounds();
    const mScope = state.museumScope;
    const q = state.searchQuery;

    // 1. Recompute 25 histogram bucket counts (respecting museumScope & search, independent of era window)
    const buckets = new Array(YEAR_STOPS.length - 1).fill(0);
    const filtered = [];
    const filteredCur = [];
    const byCountry = new Map();

    for (let i = 0; i < state.allArtifacts.length; i++) {
      const art = state.allArtifacts[i];
      if (mScope !== 'all' && art.museumId !== mScope) continue;
      if (q && !matchesSearch(art, q)) continue;

      // Bucket index for histogram
      const y = art.creationMidYr;
      let bIdx = YEAR_STOPS.length - 2;
      for (let b = 0; b < YEAR_STOPS.length - 1; b++) {
        const lo = b === 0 ? -30000 : YEAR_STOPS[b];
        const hi = b === YEAR_STOPS.length - 2 ? 2030 : YEAR_STOPS[b + 1];
        if (y >= lo && y < hi) {
          bIdx = b;
          break;
        }
      }
      buckets[bIdx]++;

      // STRICT CREATION-AGE FILTER: exclude anything outside [minYr, maxYr]
      if (y < minYr || y > maxYr) continue;

      filtered.push(art);
      if (art.isCurated) filteredCur.push(art);

      let cGroup = byCountry.get(art.countryEn);
      if (!cGroup) {
        cGroup = {
          en: art.countryEn,
          zh: art.countryZh,
          centerLon: art.centerLon,
          centerLat: art.centerLat,
          count: 0,
          museums: new Map(),
          items: []
        };
        byCountry.set(art.countryEn, cGroup);
      }
      cGroup.count++;
      cGroup.museums.set(art.museumId, (cGroup.museums.get(art.museumId) || 0) + 1);
      cGroup.items.push(art);
    }

    filteredCur.sort((a, b) => a.creationMidYr - b.creationMidYr);
    const cList = Array.from(byCountry.values()).sort((a, b) => b.count - a.count);
    for (let i = 0; i < cList.length; i++) {
      // Put curated items first inside each country's thumbnail list, ordered oldest to newest
      cList[i].items.sort((a, b) => {
        if (a.isCurated !== b.isCurated) return a.isCurated ? -1 : 1;
        return a.creationMidYr - b.creationMidYr;
      });
    }

    state.bucketCounts = buckets;
    state.filteredArtifacts = filtered;
    state.filteredCurated = filteredCur;
    state.countryGroups = cList;

    if (state.selectedCountryEn && !byCountry.has(state.selectedCountryEn)) {
      state.selectedCountryEn = null;
      state.detailMuseumFilter = null;
    }
  }

  // DOM References
  const elMuseumDropdown = document.getElementById('ca-museum-dropdown');
  const elMuseumTrigger = document.getElementById('ca-museum-trigger');
  const elMuseumCurrent = document.getElementById('ca-museum-current');
  const elMuseumMenu = document.getElementById('ca-museum-menu');
  const elEraGrid = document.getElementById('era-cards-grid');
  const elKpiWorks = document.getElementById('ca-kpi-works');
  const elKpiPlates = document.getElementById('ca-kpi-plates');
  const elKpiCivs = document.getElementById('ca-kpi-civs');
  const elWalkBtn = document.getElementById('ca-walk-btn');
  const elWalkIcon = document.getElementById('ca-walk-icon');
  const elWalkLabel = document.getElementById('ca-walk-label');
  const elWindowBadge = document.getElementById('ca-active-window-badge');
  const elEraStory = document.getElementById('ca-active-era-desc');
  const elResetAllBtn = document.getElementById('ca-reset-all-btn');
  const elHistCanvas = document.getElementById('era-histogram');
  const elStartSlider = document.getElementById('ca-start-idx');
  const elEndSlider = document.getElementById('ca-end-idx');
  const elStartReadout = document.getElementById('ca-start-readout');
  const elEndReadout = document.getElementById('ca-end-readout');
  const elGlobeSection = document.getElementById('chrono-globe-section');
  const elGlobeCanvas = document.getElementById('ca-globe-canvas');
  const elGlobeTitle = document.getElementById('ca-globe-title');
  const elGlobeSub = document.getElementById('ca-globe-sub');
  const elSidebar = document.getElementById('ca-sidebar');
  const elSidebarHeading = document.getElementById('ca-sidebar-heading');
  const elCountryList = document.getElementById('ca-country-list');
  const elCountryDetail = document.getElementById('ca-country-detail');
  const elDetailTitle = document.getElementById('ca-detail-title');
  const elDetailCount = document.getElementById('ca-detail-count');
  const elDetailMuseums = document.getElementById('ca-detail-museums');
  const elDetailSplit = document.getElementById('ca-detail-museum-split');
  const elThumbGrid = document.getElementById('ca-thumb-grid');
  const elSearchInput = document.getElementById('ca-search-input');
  const elSearchClear = document.getElementById('ca-search-clear');
  const elModal = document.getElementById('ca-artifact-modal');
  const elModalCanvas = document.getElementById('ca-modal-canvas');
  const elModalDatePill = document.getElementById('ca-modal-date-pill');
  const elModalCountryPill = document.getElementById('ca-modal-country-pill');
  const elModalMuseumPill = document.getElementById('ca-modal-museum-pill');
  const elModalTitle = document.getElementById('ca-modal-title');
  const elModalMeta = document.getElementById('ca-modal-meta');
  const elModalDesc = document.getElementById('ca-modal-desc');
  const elModalObjLink = document.getElementById('ca-modal-obj-link');
  const elModalProvLink = document.getElementById('ca-modal-prov-link');
  const elDockWorks = document.getElementById('ca-dock-works');
  const elDockOrigins = document.getElementById('ca-dock-origins');
  const elTooltip = document.getElementById('ca-tooltip');
  const elLightbox = document.getElementById('ca-lightbox');
  const elLbCanvas = document.getElementById('ca-lb-canvas');
  const elLbImg = document.getElementById('ca-lb-img');
  const elLbKicker = document.getElementById('ca-lb-kicker');
  const elLbTitle = document.getElementById('ca-lb-title');
  const elLbDesc = document.getElementById('ca-lb-desc');
  const elLbObjLink = document.getElementById('ca-lb-obj-link');
  const elSyncEyebrow = document.getElementById('ca-sync-eyebrow');
  const elSyncTitle = document.getElementById('ca-sync-title');
  const elSyncIntro = document.getElementById('ca-sync-intro');
  const elSyncGrid = document.getElementById('ca-synchrony-grid');

  function provenanceBaseHref() {
    const path = window.location.pathname || '';
    const base = path.includes('artifacts-creation-age') ? './artifacts-archive.html' : './index.html';
    return state.lang === 'zh' ? (base + '#lang=zh') : base;
  }

  function drawSpriteTile(cnv, spriteIdx, mid, cropCover) {
    const drawNow = (atl) => {
      if (!atl) return;
      const c = cnv.getContext('2d');
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      const ts = atl.tileSize;
      const sx = (spriteIdx % atl.cols) * ts;
      const sy = Math.floor(spriteIdx / atl.cols) * ts;
      c.clearRect(0, 0, cnv.width, cnv.height);
      if (cropCover) {
        const ch = Math.round(ts * 0.75);
        const cy = sy + Math.round((ts - ch) * 0.40);
        c.drawImage(atl.spriteAtlas, sx, cy, ts, ch, 0, 0, cnv.width, cnv.height);
      } else {
        c.drawImage(atl.spriteAtlas, sx, sy, ts, ts, 0, 0, cnv.width, cnv.height);
      }
    };
    if (atlasCache[mid]) {
      drawNow(atlasCache[mid]);
    } else {
      loadMuseumAtlas(mid).then(drawNow);
    }
  }

  function renderMuseumScopeDropdown() {
    if (!elMuseumMenu) return;
    if (state.museumScope === 'all') {
      elMuseumCurrent.textContent = t('allMuseumsOpt');
    } else {
      const m = MUSEUMS[state.museumScope];
      elMuseumCurrent.textContent = m ? ((m.copy && m.copy[state.lang]) || m.copy.en).shortName : t('allMuseumsOpt');
    }

    elMuseumMenu.replaceChildren();
    const frag = document.createDocumentFragment();

    const makeOpt = (id, titleText, subText, countNum) => {
      const isCur = state.museumScope === id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'md-option' + (isCur ? ' active' : '');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        elMuseumDropdown.classList.remove('open');
        state.museumScope = id;
        if (id !== 'all') loadMuseumAtlas(id);
        refreshAllUI(false);
      });
      const left = document.createElement('span');
      left.className = 'md-opt-left';
      const nm = document.createElement('span');
      nm.className = 'md-opt-name';
      nm.textContent = (isCur ? '✓ ' : '') + titleText;
      const sb = document.createElement('span');
      sb.className = 'md-opt-city';
      sb.textContent = subText;
      left.appendChild(nm);
      left.appendChild(sb);
      const cnt = document.createElement('span');
      cnt.className = 'md-opt-count';
      cnt.textContent = fmtNum(countNum);
      btn.appendChild(left);
      btn.appendChild(cnt);
      return btn;
    };

    frag.appendChild(makeOpt(
      'all',
      t('allMuseumsOpt'),
      state.lang === 'zh' ? '全球十馆联合年代库' : 'Combined 10-museum archive',
      state.allArtifacts.length
    ));

    for (let i = 0; i < SUPPORTED_MUSEUMS.length; i++) {
      const mid = SUPPORTED_MUSEUMS[i];
      const m = MUSEUMS[mid];
      if (!m) continue;
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      const total = m.countriesSpec.reduce((s, r) => s + r[2], 0);
      frag.appendChild(makeOpt(mid, mc.shortName, mc.hostCity, total));
    }
    elMuseumMenu.appendChild(frag);
  }

  function countForEra(era) {
    const lo = era.startIdx === 0 ? -30000 : YEAR_STOPS[era.startIdx];
    const hi = era.endIdx >= YEAR_STOPS.length - 1 ? 2030 : YEAR_STOPS[era.endIdx];
    const mScope = state.museumScope;
    let cnt = 0;
    for (let i = 0; i < state.allArtifacts.length; i++) {
      const a = state.allArtifacts[i];
      if (mScope !== 'all' && a.museumId !== mScope) continue;
      if (a.creationMidYr >= lo && a.creationMidYr <= hi) cnt++;
    }
    return cnt;
  }

  function renderEraCards() {
    elEraGrid.replaceChildren();
    const frag = document.createDocumentFragment();
    for (let i = 0; i < ERAS.length; i++) {
      const era = ERAS[i];
      const isAct = state.eraId === era.id;
      const cnt = countForEra(era);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'era-card-btn' + (isAct ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(isAct));
      btn.addEventListener('click', () => {
        state.walkingEras = false;
        selectEraPreset(era.id, true);
      });

      const top = document.createElement('div');
      top.className = 'era-card-top';
      const sp = document.createElement('span');
      sp.className = 'era-card-span';
      sp.textContent = state.lang === 'zh' ? era.spanZh : era.spanEn;
      const ct = document.createElement('span');
      ct.className = 'era-card-count';
      ct.textContent = fmtNum(cnt);
      top.appendChild(sp);
      top.appendChild(ct);

      const nm = document.createElement('div');
      nm.className = 'era-card-name';
      nm.textContent = state.lang === 'zh' ? era.nameZh : era.nameEn;

      const sb = document.createElement('div');
      sb.className = 'era-card-sub';
      sb.textContent = state.lang === 'zh' ? era.subZh : era.subEn;

      btn.appendChild(top);
      btn.appendChild(nm);
      btn.appendChild(sb);
      frag.appendChild(btn);
    }
    elEraGrid.appendChild(frag);
  }

  function drawHistogram() {
    const rect = elHistCanvas.getBoundingClientRect();
    const w = Math.max(320, Math.round(rect.width || 1100));
    const h = 82;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    elHistCanvas.width = Math.round(w * dpr);
    elHistCanvas.height = Math.round(h * dpr);
    const c = elHistCanvas.getContext('2d');
    c.save();
    c.scale(dpr, dpr);
    c.clearRect(0, 0, w, h);

    const n = state.bucketCounts.length;
    let maxVal = 1;
    for (let i = 0; i < n; i++) {
      if (state.bucketCounts[i] > maxVal) maxVal = state.bucketCounts[i];
    }

    const padX = 8;
    const topPad = 8;
    const labelH = 18;
    const barAreaH = h - topPad - labelH;
    const slotW = (w - padX * 2) / n;

    for (let i = 0; i < n; i++) {
      const inRange = i >= state.startIdx && i < state.endIdx;
      const val = state.bucketCounts[i];
      const norm = val > 0 ? Math.max(0.08, Math.sqrt(val / maxVal)) : 0.02;
      const bh = norm * barAreaH;
      const bx = padX + i * slotW + 2;
      const bw = Math.max(4, slotW - 4);
      const by = topPad + (barAreaH - bh);

      c.fillStyle = inRange ? '#b8832f' : 'rgba(176, 150, 113, 0.28)';
      c.beginPath();
      c.rect(bx, by, bw, bh);
      c.fill();

      if (inRange) {
        c.fillStyle = '#e5be73';
        c.fillRect(bx, by, bw, Math.min(3, bh));
      }
    }

    // Axis baseline + tick labels
    c.strokeStyle = 'rgba(155, 128, 89, 0.45)';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(padX, topPad + barAreaH + 0.5);
    c.lineTo(w - padX, topPad + barAreaH + 0.5);
    c.stroke();

    c.font = '600 9.5px "Google Sans Code", monospace';
    c.fillStyle = '#6f5a40';
    c.textBaseline = 'top';
    const labelStops = [0, 4, 7, 10, 12, 14, 18, 22, 25];
    for (let k = 0; k < labelStops.length; k++) {
      const sIdx = labelStops[k];
      const x = padX + (sIdx / n) * (w - padX * 2);
      c.textAlign = sIdx === 0 ? 'left' : (sIdx === n ? 'right' : 'center');
      c.fillText(formatYearPoint(YEAR_STOPS[sIdx]), x, topPad + barAreaH + 4);
    }

    c.restore();
  }

  function renderSidebar() {
    if (!state.selectedCountryEn) {
      elCountryDetail.classList.remove('active');
      elCountryList.style.display = 'block';
      elSidebarHeading.textContent = state.lang === 'zh'
        ? (fmtNum(state.countryGroups.length) + ' 个活跃原属地')
        : (fmtNum(state.countryGroups.length) + ' Active Origins');

      elCountryList.replaceChildren();
      const frag = document.createDocumentFragment();
      const maxC = state.countryGroups.length ? state.countryGroups[0].count : 1;
      for (let i = 0; i < state.countryGroups.length; i++) {
        const g = state.countryGroups[i];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'country-row';
        btn.addEventListener('click', () => {
          state.selectedCountryEn = g.en;
          state.detailMuseumFilter = null;
          state.targetRotLon = -g.centerLon * DEG2RAD;
          state.targetRotLat = Math.max(-1.1, Math.min(1.1, g.centerLat * DEG2RAD));
          state.targetZoom = 1.25;
          renderSidebar();
        });

        const nmWrap = document.createElement('span');
        nmWrap.className = 'country-row-name';
        const nmTxt = document.createElement('span');
        nmTxt.className = 'country-row-label-text';
        nmTxt.textContent = countryDisplayName(g.en, g.zh);
        nmWrap.appendChild(nmTxt);

        const right = document.createElement('span');
        right.className = 'country-row-right';
        const trk = document.createElement('span');
        trk.className = 'country-bar-track';
        const fl = document.createElement('span');
        fl.className = 'country-bar-fill';
        fl.style.width = Math.max(8, Math.round((g.count / maxC) * 100)) + '%';
        trk.appendChild(fl);
        const ct = document.createElement('span');
        ct.className = 'country-row-count';
        ct.textContent = fmtNum(g.count);
        right.appendChild(trk);
        right.appendChild(ct);

        btn.appendChild(nmWrap);
        btn.appendChild(right);
        frag.appendChild(btn);
      }
      elCountryList.appendChild(frag);
      return;
    }

    const grp = state.countryGroups.find(g => g.en === state.selectedCountryEn);
    if (!grp) {
      state.selectedCountryEn = null;
      renderSidebar();
      return;
    }

    elCountryList.style.display = 'none';
    elCountryDetail.classList.add('active');
    const cLabel = countryDisplayName(grp.en, grp.zh);
    elSidebarHeading.textContent = cLabel + ' · ' + fmtNum(grp.count);
    elDetailTitle.textContent = cLabel;
    elDetailCount.textContent = fmtNum(grp.count);
    elDetailMuseums.textContent = fmtNum(grp.museums.size) + ' / 10';

    // Museum holding breakdown for this origin in this era
    elDetailSplit.replaceChildren();
    const head = document.createElement('div');
    head.className = 'hm-break-title';
    const hSpan = document.createElement('span');
    hSpan.textContent = t('heldTodayTitle');
    head.appendChild(hSpan);
    if (state.detailMuseumFilter) {
      const rst = document.createElement('button');
      rst.type = 'button';
      rst.className = 'hm-reset-chip';
      rst.textContent = t('showAllMuseumsChip');
      rst.addEventListener('click', () => {
        state.detailMuseumFilter = null;
        renderSidebar();
      });
      head.appendChild(rst);
    }
    elDetailSplit.appendChild(head);

    const mEntries = Array.from(grp.museums.entries()).sort((a, b) => b[1] - a[1]);
    const strip = document.createElement('div');
    strip.className = 'hm-chip-strip';
    for (let i = 0; i < mEntries.length; i++) {
      const [mid, mCnt] = mEntries[i];
      const m = MUSEUMS[mid];
      if (!m) continue;
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      const isAct = state.detailMuseumFilter === mid;
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'hm-mini-chip' + (isAct ? ' active' : '');
      chip.addEventListener('click', () => {
        state.detailMuseumFilter = isAct ? null : mid;
        renderSidebar();
      });
      const nm = document.createElement('span');
      nm.textContent = mc.shortName;
      const cnt = document.createElement('span');
      cnt.className = 'hm-mini-cnt';
      cnt.textContent = fmtNum(mCnt);
      chip.appendChild(nm);
      chip.appendChild(cnt);
      strip.appendChild(chip);
    }
    elDetailSplit.appendChild(strip);

    elThumbGrid.replaceChildren();
    const tFrag = document.createDocumentFragment();
    let shown = 0;
    for (let i = 0; i < grp.items.length && shown < 48; i++) {
      const art = grp.items[i];
      if (state.detailMuseumFilter && art.museumId !== state.detailMuseumFilter) continue;
      shown++;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'thumb-card' + (state.selectedArtifact === art ? ' selected' : '');
      const cnv = document.createElement('canvas');
      cnv.width = 320;
      cnv.height = 320;
      drawSpriteTile(cnv, art.sprite, art.museumId, false);
      const cap = document.createElement('span');
      cap.className = 'thumb-caption';
      cap.textContent = formatYearPoint(art.creationMidYr) + ' · ' + (state.lang === 'zh' ? art.zh : art.en);
      card.appendChild(cnv);
      card.appendChild(cap);
      card.addEventListener('click', () => openModal(art, true));
      tFrag.appendChild(card);
    }
    elThumbGrid.appendChild(tFrag);
  }

  let syncObserver = null;

  function renderSynchronyGallery() {
    if (syncObserver) {
      syncObserver.disconnect();
      syncObserver = null;
    }
    if (typeof IntersectionObserver === 'function') {
      syncObserver = new IntersectionObserver((entries, obs) => {
        for (let i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          const cnv = entries[i].target;
          obs.unobserve(cnv);
          if (cnv.dataset.rendered === '1') continue;
          cnv.dataset.rendered = '1';
          cnv.width = 480;
          cnv.height = 360;
          drawSpriteTile(cnv, Number(cnv.dataset.sprite || 0), cnv.dataset.mid || 'bm', true);
        }
      }, { rootMargin: '600px 0px' });
    }

    const list = state.filteredCurated;
    const spanTxt = formatDateSpanBadge(YEAR_STOPS[state.startIdx], YEAR_STOPS[state.endIdx]);
    elSyncEyebrow.textContent = state.lang === 'zh'
      ? ('03 · 同时代文明编年图录 · ' + spanTxt)
      : ('03 · WORLD SYNCHRONY · ' + spanTxt.toUpperCase());
    elSyncTitle.textContent = state.lang === 'zh'
      ? ('该时期共 ' + fmtNum(list.length) + ' 件高清镇馆名作（按诞生年代由古及今排列）')
      : (fmtNum(list.length) + ' Contemporaneous Masterpieces Ordered Oldest → Newest');
    elSyncIntro.textContent = state.lang === 'zh'
      ? '以下仅展示诞生于所选历史时期的馆藏名作，按创作年代先后排序，直观对照同一时代不同文明的艺术高峰。'
      : 'Strictly filtered to masterpieces created within your selected period and ordered chronologically so you can compare simultaneous achievements across civilizations.';

    elSyncGrid.replaceChildren();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < list.length; i++) {
      const art = list[i];
      const m = MUSEUMS[art.museumId] || MUSEUMS.bm;
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      const objHref = buildArtifactObjUrl(art);

      const card = document.createElement('article');
      card.className = 'exhibit-card';

      const plateWrap = document.createElement('div');
      plateWrap.className = 'exhibit-plate-wrap';
      plateWrap.setAttribute('role', 'button');
      plateWrap.setAttribute('tabindex', '0');
      plateWrap.addEventListener('click', () => openLightbox(art));

      const cnv = document.createElement('canvas');
      cnv.dataset.sprite = String(art.sprite);
      cnv.dataset.mid = art.museumId;
      if (!syncObserver || i < 12) {
        cnv.dataset.rendered = '1';
        cnv.width = 480;
        cnv.height = 360;
        drawSpriteTile(cnv, art.sprite, art.museumId, true);
      } else {
        cnv.width = 16;
        cnv.height = 12;
        syncObserver.observe(cnv);
      }

      const dateRibbon = document.createElement('span');
      dateRibbon.className = 'ca-date-ribbon';
      dateRibbon.textContent = formatDateSpanBadge(art.startYr, art.endYr);

      const originRibbon = document.createElement('span');
      originRibbon.className = 'exhibit-acq-tag';
      originRibbon.textContent = countryDisplayName(art.countryEn, art.countryZh);

      const museumRibbon = document.createElement('span');
      museumRibbon.className = 'ca-museum-ribbon';
      museumRibbon.textContent = mc.shortName;

      plateWrap.appendChild(cnv);
      plateWrap.appendChild(dateRibbon);
      plateWrap.appendChild(originRibbon);
      plateWrap.appendChild(museumRibbon);

      const body = document.createElement('div');
      body.className = 'exhibit-content';
      const topB = document.createElement('div');

      const h3 = document.createElement('h3');
      h3.className = 'exhibit-title-zh';
      h3.textContent = state.lang === 'zh' ? art.zh : art.en;

      const mat = document.createElement('div');
      mat.className = 'exhibit-title-en';
      mat.textContent = state.lang === 'zh' ? art.materialZh : art.materialEn;

      const desc = document.createElement('p');
      desc.className = 'exhibit-desc';
      desc.textContent = state.lang === 'zh' ? art.descZh : art.descEn;

      topB.appendChild(h3);
      topB.appendChild(mat);
      topB.appendChild(desc);

      const acts = document.createElement('div');
      acts.className = 'exhibit-actions';

      const locBtn = document.createElement('button');
      locBtn.type = 'button';
      locBtn.className = 'locate-globe-btn';
      locBtn.textContent = state.lang === 'zh' ? '地球仪定位 ↑' : 'Locate on Globe ↑';
      locBtn.addEventListener('click', () => {
        elGlobeSection.scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
        openModal(art, true);
      });

      const ext = document.createElement('a');
      ext.className = 'bm-ext-link';
      ext.href = objHref;
      ext.target = '_blank';
      ext.rel = 'noopener noreferrer';
      ext.textContent = mc.cardLinkBtn;

      acts.appendChild(locBtn);
      acts.appendChild(ext);
      body.appendChild(topB);
      body.appendChild(acts);

      card.appendChild(plateWrap);
      card.appendChild(body);
      frag.appendChild(card);
    }

    elSyncGrid.appendChild(frag);
  }

  function openModal(art, flyTo) {
    state.selectedArtifact = art;
    const m = MUSEUMS[art.museumId] || MUSEUMS.bm;
    const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
    drawSpriteTile(elModalCanvas, art.sprite, art.museumId, false);
    elModalDatePill.textContent = (state.lang === 'zh' ? '诞生：' : 'Created: ') + formatDateSpanBadge(art.startYr, art.endYr);
    elModalCountryPill.textContent = countryDisplayName(art.countryEn, art.countryZh);
    elModalMuseumPill.textContent = mc.shortName;
    elModalTitle.textContent = state.lang === 'zh' ? art.zh : art.en;
    elModalMeta.textContent = (state.lang === 'zh' ? art.materialZh : art.materialEn) + '  ·  ' +
      (state.lang === 'zh' ? art.roomZh : art.roomEn) + '  ·  ' +
      (state.lang === 'zh' ? ('博物馆入藏：' + art.acqYear + '年') : ('Acquired by museum: ' + art.acqYear));
    elModalDesc.textContent = state.lang === 'zh' ? art.descZh : art.descEn;
    elModalObjLink.href = buildArtifactObjUrl(art);
    elModalObjLink.textContent = mc.viewObjBtn;

    const baseProv = (window.location.pathname || '').includes('artifacts-creation-age')
      ? './artifacts-archive.html'
      : './index.html';
    elModalProvLink.href = baseProv + '#lens=homeland&homeland=' + encodeURIComponent(art.countryEn) +
      (state.lang === 'zh' ? '&lang=zh' : '');
    elModalProvLink.textContent = t('caFlyProvenanceBtn');

    elModal.classList.add('open');
    if (flyTo) {
      state.targetRotLon = -art.lon * DEG2RAD;
      state.targetRotLat = Math.max(-1.15, Math.min(1.15, art.lat * DEG2RAD));
      state.targetZoom = Math.max(state.targetZoom, 1.32);
    }
  }

  function stepModal(delta) {
    if (!state.selectedArtifact) return;
    const pool = state.filteredCurated.length ? state.filteredCurated : state.filteredArtifacts;
    if (!pool.length) return;
    const idx = pool.indexOf(state.selectedArtifact);
    const next = pool[((idx >= 0 ? idx : 0) + delta + pool.length) % pool.length];
    openModal(next, true);
  }

  function openLightbox(art) {
    state.lightboxArtifact = art;
    const m = MUSEUMS[art.museumId] || MUSEUMS.bm;
    const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
    drawSpriteTile(elLbCanvas, art.sprite, art.museumId, false);
    elLbImg.classList.remove('loaded');
    elLbImg.removeAttribute('src');
    const hdUrl = m.hdPhotoUrls[art.sprite];
    if (hdUrl && !navigator.webdriver && hdUrl.startsWith('https://')) {
      elLbImg.onload = () => {
        if (state.lightboxArtifact === art) elLbImg.classList.add('loaded');
      };
      elLbImg.src = hdUrl;
    }
    elLbKicker.textContent = formatDateSpanBadge(art.startYr, art.endYr) + '  ·  ' +
      countryDisplayName(art.countryEn, art.countryZh) + '  ·  ' + mc.shortName;
    elLbTitle.textContent = state.lang === 'zh' ? art.zh : art.en;
    elLbDesc.textContent = state.lang === 'zh' ? art.descZh : art.descEn;
    elLbObjLink.href = buildArtifactObjUrl(art);
    elLbObjLink.textContent = mc.openOfficialBtn;
    elLightbox.classList.add('open');
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = state.lang === 'zh'
      ? '文明诞生纪年 · 文物档案库 — 十大世界博物馆八千年造物图谱'
      : 'Creation Age Chronicle · Artifacts Archive — 8,000 Years Across 10 Museums';

    const nodes = document.querySelectorAll('[data-i18n]');
    for (let i = 0; i < nodes.length; i++) {
      const k = nodes[i].getAttribute('data-i18n');
      if (k) nodes[i].textContent = t(k);
    }
    const phs = document.querySelectorAll('[data-i18n-placeholder]');
    for (let i = 0; i < phs.length; i++) {
      const k = phs[i].getAttribute('data-i18n-placeholder');
      if (k) phs[i].setAttribute('placeholder', t(k));
    }

    const langBtns = document.querySelectorAll('.lang-btn[data-lang]');
    for (let i = 0; i < langBtns.length; i++) {
      const act = langBtns[i].getAttribute('data-lang') === state.lang;
      langBtns[i].classList.toggle('active', act);
      langBtns[i].setAttribute('aria-pressed', String(act));
    }

    const provHref = provenanceBaseHref();
    const onX20 = (window.location.pathname || '').includes('artifacts-creation-age');
    const catHref = (onX20 ? './artifacts-catalog.html' : './catalog.html') + (state.lang === 'zh' ? '#lang=zh' : '');
    const back1 = document.getElementById('ca-back-provenance-link');
    const back2 = document.getElementById('ca-brand-back-link');
    const back3 = document.getElementById('ca-footer-prov-link');
    const cat1 = document.getElementById('ca-nav-catalog-link');
    const cat2 = document.getElementById('ca-footer-catalog-link');
    if (back1) back1.href = provHref;
    if (back2) back2.href = provHref;
    if (back3) back3.href = provHref;
    if (cat1) cat1.href = catHref;
    if (cat2) cat2.href = catHref;
  }

  function refreshAllUI(moveCamera) {
    recomputeStrictEraFilter();
    applyTranslations();
    renderMuseumScopeDropdown();
    renderEraCards();

    elStartSlider.value = String(state.startIdx);
    elEndSlider.value = String(state.endIdx);
    elStartReadout.textContent = formatYearPoint(YEAR_STOPS[state.startIdx]);
    elEndReadout.textContent = formatYearPoint(YEAR_STOPS[state.endIdx]);

    const spanStr = formatDateSpanBadge(YEAR_STOPS[state.startIdx], YEAR_STOPS[state.endIdx]);
    elWindowBadge.textContent = spanStr;

    const matchedEra = ERAS.find(e => e.id === state.eraId);
    if (matchedEra) {
      elEraStory.textContent = state.lang === 'zh' ? matchedEra.storyZh : matchedEra.storyEn;
      elGlobeTitle.textContent = (state.lang === 'zh' ? matchedEra.nameZh : matchedEra.nameEn) + ' · ' + spanStr;
      if (moveCamera) {
        state.targetRotLon = -matchedEra.camLon * DEG2RAD;
        state.targetRotLat = matchedEra.camLat * DEG2RAD;
        state.targetZoom = 1.02;
      }
    } else {
      elEraStory.textContent = state.lang === 'zh'
        ? ('自定义同时代切片：仅展示诞生于 ' + spanStr + ' 之间的馆藏文物')
        : ('Custom horizontal time-slice: strictly showing works created between ' + spanStr);
      elGlobeTitle.textContent = (state.lang === 'zh' ? '自定义纪年切片 · ' : 'Custom Time-Slice · ') + spanStr;
    }

    const nWorks = state.filteredArtifacts.length;
    const nPlates = state.filteredCurated.length;
    const nCivs = state.countryGroups.length;
    elKpiWorks.textContent = fmtNum(nWorks);
    elKpiPlates.textContent = fmtNum(nPlates);
    elKpiCivs.textContent = fmtNum(nCivs);
    elDockWorks.textContent = fmtNum(nWorks);
    elDockOrigins.textContent = fmtNum(nCivs);

    elGlobeSub.textContent = state.lang === 'zh'
      ? ('该时期共诞生 ' + fmtNum(nWorks) + ' 件文物 · 分布于 ' + fmtNum(nCivs) + ' 个原属地（非该时期藏品已自动隐去）')
      : (fmtNum(nWorks) + ' works created across ' + fmtNum(nCivs) + ' origins in this period (out-of-era works hidden)');

    elWalkIcon.textContent = state.walkingEras ? '⏸' : '▶';
    elWalkLabel.textContent = state.walkingEras ? t('caPauseWalk') : t('caWalkBtn');

    drawHistogram();
    renderSidebar();
    renderSynchronyGallery();

    if (state.selectedArtifact && elModal.classList.contains('open')) {
      if (!state.filteredArtifacts.includes(state.selectedArtifact)) {
        elModal.classList.remove('open');
        state.selectedArtifact = null;
      } else {
        openModal(state.selectedArtifact, false);
      }
    }
  }

  function selectEraPreset(eraId, moveCam) {
    const era = ERAS.find(e => e.id === eraId) || ERAS[0];
    state.eraId = era.id;
    state.startIdx = era.startIdx;
    state.endIdx = era.endIdx;
    state.selectedCountryEn = null;
    state.detailMuseumFilter = null;
    refreshAllUI(moveCam);
  }

  // 3D Globe Renderer (Strictly Filtered by Creation Age)
  const gCtx = elGlobeCanvas.getContext('2d');
  let vpW = 960, vpH = 660, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let visibleCards = [];

  function resizeGlobe() {
    const rect = elGlobeSection.getBoundingClientRect();
    vpW = Math.max(320, Math.round(rect.width));
    vpH = Math.max(420, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    elGlobeCanvas.width = Math.round(vpW * dpr);
    elGlobeCanvas.height = Math.round(vpH * dpr);
    drawHistogram();
  }

  function rotateVec(vx, vy, vz, cosLon, sinLon, cosLat, sinLat) {
    const x1 = vx * cosLon + vz * sinLon;
    const z1 = -vx * sinLon + vz * cosLon;
    const y2 = vy * cosLat - z1 * sinLat;
    const z2 = vy * sinLat + z1 * cosLat;
    return [x1, y2, z2];
  }

  let lastTs = performance.now();

  function renderGlobeFrame(now) {
    const ts = typeof now === 'number' ? now : performance.now();
    const dt = Math.min(0.12, Math.max(0.001, (ts - lastTs) / 1000));
    lastTs = ts;

    if (state.walkingEras) {
      state.walkTimer += dt;
      if (state.walkTimer >= 3.0) {
        state.walkTimer = 0;
        const curIdx = ERAS.findIndex(e => e.id === state.eraId);
        const nextIdx = curIdx < 1 || curIdx >= ERAS.length - 1 ? 1 : (curIdx + 1);
        selectEraPreset(ERAS[nextIdx].id, true);
        if (nextIdx === ERAS.length - 1) {
          // Stop cleanly on Modern World at end of walk
          state.walkingEras = false;
          elWalkIcon.textContent = '▶';
          elWalkLabel.textContent = t('caWalkBtn');
        }
      }
    }

    if (state.autoRotate && !state.isDragging) {
      state.targetRotLon -= 0.18 * dt;
    }
    const alpha = 1 - Math.exp(-dt * 6.5);
    state.rotLon += (state.targetRotLon - state.rotLon) * alpha;
    state.rotLat += (state.targetRotLat - state.rotLat) * alpha;
    state.zoom += (state.targetZoom - state.zoom) * alpha;

    gCtx.save();
    gCtx.scale(dpr, dpr);
    gCtx.clearRect(0, 0, vpW, vpH);

    const sidebarOpen = vpW > 820 && elSidebar && !elSidebar.classList.contains('collapsed');
    const cx = sidebarOpen ? (vpW * 0.50 + 147) : (vpW * 0.50);
    const cy = vpH * 0.50;
    const availW = sidebarOpen ? Math.max(320, vpW - 294) : vpW;
    const baseR = Math.min(availW, vpH) * 0.375 * state.zoom;
    const cosLon = Math.cos(state.rotLon), sinLon = Math.sin(state.rotLon);
    const cosLat = Math.cos(state.rotLat), sinLat = Math.sin(state.rotLat);

    if (state.showAurora) {
      const aur = gCtx.createRadialGradient(cx + baseR * 0.14, cy - baseR * 0.04, baseR * 0.88, cx + baseR * 0.08, cy, baseR * 1.14);
      aur.addColorStop(0, 'rgba(235, 215, 175, 0)');
      aur.addColorStop(0.45, 'rgba(209, 166, 92, 0.20)');
      aur.addColorStop(0.72, 'rgba(124, 188, 172, 0.16)');
      aur.addColorStop(1, 'rgba(245, 236, 220, 0)');
      gCtx.fillStyle = aur;
      gCtx.beginPath();
      gCtx.arc(cx, cy, baseR * 1.15, 0, Math.PI * 2);
      gCtx.fill();
    }

    gCtx.save();
    gCtx.shadowColor = 'rgba(92, 68, 34, 0.16)';
    gCtx.shadowBlur = 36;
    gCtx.shadowOffsetY = 12;
    const sph = gCtx.createRadialGradient(cx - baseR * 0.26, cy - baseR * 0.28, baseR * 0.08, cx, cy, baseR);
    sph.addColorStop(0, '#faf3e4');
    sph.addColorStop(0.62, '#efe2c7');
    sph.addColorStop(0.92, '#e2cfa9');
    sph.addColorStop(1, '#d3bc92');
    gCtx.fillStyle = sph;
    gCtx.beginPath();
    gCtx.arc(cx, cy, baseR, 0, Math.PI * 2);
    gCtx.fill();
    gCtx.restore();

    gCtx.save();
    gCtx.beginPath();
    gCtx.arc(cx, cy, baseR, 0, Math.PI * 2);
    gCtx.clip();

    gCtx.fillStyle = 'rgba(166, 139, 100, 0.40)';
    const dotSz = Math.max(1.1, 1.45 * state.zoom);
    for (let i = 0; i < state.landDots3D.length; i++) {
      const d = state.landDots3D[i];
      const r = rotateVec(d[0], d[1], d[2], cosLon, sinLon, cosLat, sinLat);
      if (r[2] > 0.03) {
        gCtx.fillRect(cx + r[0] * baseR - dotSz * 0.5, cy - r[1] * baseR - dotSz * 0.5, dotSz, dotSz);
      }
    }

    gCtx.strokeStyle = 'rgba(155, 128, 89, 0.56)';
    gCtx.lineWidth = 0.9;
    for (let i = 0; i < state.borderArcs3D.length; i++) {
      const arc = state.borderArcs3D[i];
      gCtx.beginPath();
      let st = false;
      for (let j = 0; j < arc.length; j++) {
        const p = arc[j];
        const r = rotateVec(p[0], p[1], p[2], cosLon, sinLon, cosLat, sinLat);
        if (r[2] > 0.01) {
          const sx = cx + r[0] * baseR;
          const sy = cy - r[1] * baseR;
          if (!st) { gCtx.moveTo(sx, sy); st = true; }
          else gCtx.lineTo(sx, sy);
        } else {
          st = false;
        }
      }
      gCtx.stroke();
    }
    gCtx.restore();

    gCtx.strokeStyle = 'rgba(165, 138, 98, 0.55)';
    gCtx.lineWidth = 1.1;
    gCtx.beginPath();
    gCtx.arc(cx, cy, baseR, 0, Math.PI * 2);
    gCtx.stroke();

    // Adaptive stride keeps 60 FPS even when all 45,008 items are active; curated plates ALWAYS render
    visibleCards.length = 0;
    const src = state.filteredArtifacts;
    const stride = src.length > 6200 ? Math.ceil(src.length / 5800) : 1;
    const baseCardPx = Math.max(5.5, Math.min(26, baseR * 0.037 * state.cardScale));

    for (let i = 0; i < src.length; i++) {
      const art = src[i];
      if (!art.isCurated && stride > 1 && (i % stride !== 0) && (!state.selectedCountryEn || art.countryEn !== state.selectedCountryEn)) {
        continue;
      }
      const rv = rotateVec(art.homeVec[0], art.homeVec[1], art.homeVec[2], cosLon, sinLon, cosLat, sinLat);
      if (rv[2] < -0.02) continue;

      const dimmed = Boolean(
        (state.selectedCountryEn && art.countryEn !== state.selectedCountryEn) ||
        (state.detailMuseumFilter && art.museumId !== state.detailMuseumFilter)
      );

      visibleCards.push({
        art,
        sx: cx + rv[0] * baseR,
        sy: cy - rv[1] * baseR,
        rz: rv[2],
        dimmed
      });
    }

    visibleCards.sort((a, b) => a.rz - b.rz);

    const mode = state.displayMode;
    for (let i = 0; i < visibleCards.length; i++) {
      const c = visibleCards[i];
      const art = c.art;
      const atl = atlasCache[art.museumId];
      const gAtlas = atl ? atl.globeSpriteAtlas : null;
      const aCols = atl ? atl.cols : 8;
      const isHi = (state.hoveredArtifact === art) || (state.selectedArtifact === art);
      const pScale = 0.72 + 0.36 * Math.min(1.2, Math.max(0, c.rz));
      const sz = baseCardPx * pScale * (isHi ? 1.5 : (art.isCurated ? 1.18 : 1.0));
      gCtx.globalAlpha = c.dimmed ? 0.16 : Math.min(1, 0.36 + c.rz * 1.15);

      if (mode === 'particles' || !gAtlas) {
        const pRad = Math.max(1.8, sz * 0.28);
        gCtx.fillStyle = art.isCurated ? '#d89b32' : '#587b82';
        gCtx.beginPath();
        gCtx.arc(c.sx, c.sy, pRad, 0, Math.PI * 2);
        gCtx.fill();
        c.hitX = c.sx;
        c.hitY = c.sy;
        c.hitR = Math.max(5, pRad + 3);
        continue;
      }

      const sxA = (art.sprite % aCols) * GLOBE_MIP_SIZE;
      const syA = Math.floor(art.sprite / aCols) * GLOBE_MIP_SIZE;

      if (mode === 'flat') {
        const eRot = rotateVec(art.east[0], art.east[1], art.east[2], cosLon, sinLon, cosLat, sinLat);
        const nRot = rotateVec(art.north[0], art.north[1], art.north[2], cosLon, sinLon, cosLat, sinLat);
        const half = sz * 0.48;
        gCtx.save();
        gCtx.transform(eRot[0] * half, -eRot[1] * half, -nRot[0] * half, nRot[1] * half, c.sx, c.sy);
        gCtx.drawImage(gAtlas, sxA, syA, GLOBE_MIP_SIZE, GLOBE_MIP_SIZE, -1, -1, 2, 2);
        gCtx.restore();
        c.hitX = c.sx;
        c.hitY = c.sy;
        c.hitR = sz * 0.55;
      } else {
        const cardW = sz;
        const cardH = sz * 1.06;
        const dx = c.sx - cardW * 0.5;
        const dy = c.sy - cardH;
        gCtx.fillStyle = 'rgba(48, 34, 16, 0.22)';
        gCtx.beginPath();
        gCtx.ellipse(c.sx, c.sy + 1, cardW * 0.42, cardW * 0.14, 0, 0, Math.PI * 2);
        gCtx.fill();
        gCtx.drawImage(gAtlas, sxA, syA, GLOBE_MIP_SIZE, GLOBE_MIP_SIZE, dx, dy, cardW, cardH);
        if (isHi || art.isCurated) {
          gCtx.strokeStyle = isHi ? '#ffe08c' : 'rgba(232, 188, 98, 0.75)';
          gCtx.lineWidth = isHi ? 1.8 : 1.0;
          gCtx.strokeRect(dx - 0.5, dy - 0.5, cardW + 1, cardH + 1);
        }
        c.hitX = c.sx;
        c.hitY = c.sy - cardH * 0.5;
        c.hitR = cardW * 0.62;
      }
    }
    gCtx.globalAlpha = 1;

    // Non-overlapping Creation Date callouts for front-hemisphere curated masterpieces
    if (state.showLabels) {
      gCtx.save();
      gCtx.font = '600 10px "Google Sans Flex", "Noto Sans SC", sans-serif';
      gCtx.textBaseline = 'middle';
      const placedBoxes = [];
      const sidebarOpen = vpW > 860 && !elSidebar.classList.contains('collapsed');
      const minX = sidebarOpen ? 286 : 12;

      for (let i = visibleCards.length - 1; i >= 0; i--) {
        const c = visibleCards[i];
        if (c.dimmed || c.rz < 0.30 || !c.art.isCurated) continue;
        const titleShort = state.lang === 'zh' ? c.art.zh.slice(0, 9) : c.art.en.slice(0, 18);
        const txt = formatYearPoint(c.art.creationMidYr) + ' · ' + titleShort;
        const tw = Math.ceil(gCtx.measureText(txt).width) + 10;
        const th = 16;
        const lx = c.sx + 8;
        const ly = c.sy - 10;
        if (lx < minX || lx + tw > vpW - 12 || ly < 64 || ly + th > vpH - 76) continue;
        let coll = false;
        for (let b = 0; b < placedBoxes.length; b++) {
          const ob = placedBoxes[b];
          if (lx < ob.x + ob.w + 4 && lx + tw + 4 > ob.x && ly < ob.y + ob.h + 3 && ly + th + 3 > ob.y) {
            coll = true;
            break;
          }
        }
        if (coll) continue;
        placedBoxes.push({ x: lx, y: ly, w: tw, h: th });
        gCtx.fillStyle = 'rgba(252, 246, 234, 0.88)';
        gCtx.strokeStyle = 'rgba(168, 128, 64, 0.45)';
        gCtx.lineWidth = 0.9;
        gCtx.beginPath();
        gCtx.rect(lx, ly, tw, th);
        gCtx.fill();
        gCtx.stroke();
        gCtx.fillStyle = '#382816';
        gCtx.fillText(txt, lx + 5, ly + th * 0.5 + 0.5);
        if (placedBoxes.length >= 16) break;
      }
      gCtx.restore();
    }

    gCtx.restore();
    requestAnimationFrame(renderGlobeFrame);
  }

  function updateHover(clientX, clientY) {
    const rect = elGlobeSection.getBoundingClientRect();
    const lx = clientX - rect.left;
    const ly = clientY - rect.top;
    let best = null;
    for (let i = visibleCards.length - 1; i >= 0; i--) {
      const c = visibleCards[i];
      if (c.dimmed) continue;
      if (Math.hypot(lx - c.hitX, ly - c.hitY) <= c.hitR) {
        best = c.art;
        break;
      }
    }
    state.hoveredArtifact = best;
    if (best) {
      elGlobeCanvas.style.cursor = 'pointer';
      const m = MUSEUMS[best.museumId] || MUSEUMS.bm;
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      elTooltip.textContent = formatDateSpanBadge(best.startYr, best.endYr) + ' · ' +
        (state.lang === 'zh' ? best.zh : best.en) + ' (' + mc.shortName + ')';
      elTooltip.style.display = 'block';
      elTooltip.style.left = Math.min(window.innerWidth - 260, clientX + 14) + 'px';
      elTooltip.style.top = Math.max(12, clientY - 16) + 'px';
    } else {
      elGlobeCanvas.style.cursor = state.isDragging ? 'grabbing' : 'grab';
      elTooltip.style.display = 'none';
    }
  }

  // Event Wiring
  elGlobeCanvas.addEventListener('pointerdown', (e) => {
    state.isDragging = true;
    state.hasDragged = false;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    elGlobeCanvas.setPointerCapture(e.pointerId);
  });

  elGlobeCanvas.addEventListener('pointermove', (e) => {
    if (state.isDragging) {
      const dx = e.clientX - state.dragStartX;
      const dy = e.clientY - state.dragStartY;
      if (Math.hypot(dx, dy) > 3) state.hasDragged = true;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      const sens = 0.0052 / Math.sqrt(state.zoom);
      state.targetRotLon += dx * sens;
      state.targetRotLat = Math.max(-1.32, Math.min(1.32, state.targetRotLat + dy * sens));
      elTooltip.style.display = 'none';
    } else {
      updateHover(e.clientX, e.clientY);
    }
  });

  elGlobeCanvas.addEventListener('pointerup', (e) => {
    const clicked = !state.hasDragged;
    state.isDragging = false;
    if (clicked) {
      updateHover(e.clientX, e.clientY);
      if (state.hoveredArtifact) openModal(state.hoveredArtifact, false);
    }
  });

  elGlobeCanvas.addEventListener('pointerleave', () => {
    state.hoveredArtifact = null;
    elTooltip.style.display = 'none';
  });

  elGlobeCanvas.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) < 40) {
      e.preventDefault();
      state.targetZoom = Math.max(0.7, Math.min(2.6, state.targetZoom * (e.deltaY > 0 ? 0.91 : 1.10)));
    }
  }, { passive: false });

  elStartSlider.addEventListener('input', () => {
    state.walkingEras = false;
    let s = parseInt(elStartSlider.value, 10) || 0;
    if (s >= state.endIdx) s = Math.max(0, state.endIdx - 1);
    state.startIdx = s;
    state.eraId = 'custom';
    refreshAllUI(false);
  });

  elEndSlider.addEventListener('input', () => {
    state.walkingEras = false;
    let e = parseInt(elEndSlider.value, 10) || 25;
    if (e <= state.startIdx) e = Math.min(25, state.startIdx + 1);
    state.endIdx = e;
    state.eraId = 'custom';
    refreshAllUI(false);
  });

  elHistCanvas.addEventListener('click', (e) => {
    const rect = elHistCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const n = YEAR_STOPS.length - 1;
    const b = Math.max(0, Math.min(n - 1, Math.floor((x / Math.max(1, rect.width)) * n)));
    state.walkingEras = false;
    state.startIdx = b;
    state.endIdx = b + 1;
    state.eraId = 'custom';
    refreshAllUI(false);
  });

  elWalkBtn.addEventListener('click', () => {
    state.walkingEras = !state.walkingEras;
    state.walkTimer = 0;
    if (state.walkingEras) {
      if (state.eraId === 'all' || state.eraId === 'modern' || state.eraId === 'custom') {
        selectEraPreset('neolithic', true);
      }
    }
    elWalkIcon.textContent = state.walkingEras ? '⏸' : '▶';
    elWalkLabel.textContent = state.walkingEras ? t('caPauseWalk') : t('caWalkBtn');
  });

  elResetAllBtn.addEventListener('click', () => {
    state.walkingEras = false;
    selectEraPreset('all', true);
  });

  elMuseumTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    elMuseumDropdown.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.museum-dropdown')) {
      elMuseumDropdown.classList.remove('open');
    }
    const langBtn = e.target.closest('.lang-btn[data-lang]');
    if (langBtn) {
      state.lang = langBtn.getAttribute('data-lang') === 'zh' ? 'zh' : 'en';
      refreshAllUI(false);
      return;
    }
    const secLink = e.target.closest('a[data-ca-section]');
    if (secLink) {
      const sid = secLink.getAttribute('data-ca-section');
      const target = sid && document.getElementById(sid);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
      }
    }
  });

  document.getElementById('ca-sidebar-collapse').addEventListener('click', (e) => {
    const col = elSidebar.classList.toggle('collapsed');
    e.currentTarget.textContent = col ? '+' : '−';
  });

  document.getElementById('ca-back-countries-btn').addEventListener('click', () => {
    state.selectedCountryEn = null;
    state.detailMuseumFilter = null;
    renderSidebar();
  });

  elSearchInput.addEventListener('input', () => {
    state.searchQuery = sanitizeQuery(elSearchInput.value);
    elSearchClear.classList.toggle('visible', state.searchQuery.length > 0);
    refreshAllUI(false);
  });

  elSearchClear.addEventListener('click', () => {
    elSearchInput.value = '';
    state.searchQuery = '';
    elSearchClear.classList.remove('visible');
    refreshAllUI(false);
  });

  document.getElementById('ca-mode-standing').addEventListener('click', (e) => {
    state.displayMode = 'standing';
    e.currentTarget.classList.add('active');
    document.getElementById('ca-mode-flat').classList.remove('active');
    document.getElementById('ca-mode-particles').classList.remove('active');
  });
  document.getElementById('ca-mode-flat').addEventListener('click', (e) => {
    state.displayMode = 'flat';
    e.currentTarget.classList.add('active');
    document.getElementById('ca-mode-standing').classList.remove('active');
    document.getElementById('ca-mode-particles').classList.remove('active');
  });
  document.getElementById('ca-mode-particles').addEventListener('click', (e) => {
    state.displayMode = 'particles';
    e.currentTarget.classList.add('active');
    document.getElementById('ca-mode-standing').classList.remove('active');
    document.getElementById('ca-mode-flat').classList.remove('active');
  });

  const szSlider = document.getElementById('ca-size-slider');
  const szReadout = document.getElementById('ca-size-readout');
  szSlider.addEventListener('input', () => {
    state.cardScale = parseFloat(szSlider.value) || 1.0;
    szReadout.textContent = state.cardScale.toFixed(1);
  });

  document.getElementById('ca-btn-rotate').addEventListener('click', (e) => {
    state.autoRotate = !state.autoRotate;
    e.currentTarget.classList.toggle('active', state.autoRotate);
  });
  document.getElementById('ca-btn-labels').addEventListener('click', (e) => {
    state.showLabels = !state.showLabels;
    e.currentTarget.classList.toggle('active', state.showLabels);
  });
  document.getElementById('ca-btn-aurora').addEventListener('click', (e) => {
    state.showAurora = !state.showAurora;
    e.currentTarget.classList.toggle('active', state.showAurora);
  });

  document.getElementById('ca-modal-prev').addEventListener('click', () => stepModal(-1));
  document.getElementById('ca-modal-next').addEventListener('click', () => stepModal(1));
  document.getElementById('ca-modal-close').addEventListener('click', () => {
    state.selectedArtifact = null;
    elModal.classList.remove('open');
  });
  document.getElementById('ca-modal-preview-btn').addEventListener('click', () => {
    if (state.selectedArtifact) openLightbox(state.selectedArtifact);
  });
  document.getElementById('ca-modal-zoom-btn').addEventListener('click', () => {
    if (state.selectedArtifact) openLightbox(state.selectedArtifact);
  });

  document.getElementById('ca-lb-close').addEventListener('click', () => {
    state.lightboxArtifact = null;
    elLightbox.classList.remove('open');
  });
  elLightbox.addEventListener('click', (e) => {
    if (e.target === elLightbox) {
      state.lightboxArtifact = null;
      elLightbox.classList.remove('open');
    }
  });
  document.getElementById('ca-lb-prev').addEventListener('click', () => {
    if (!state.lightboxArtifact || !state.filteredCurated.length) return;
    const idx = state.filteredCurated.indexOf(state.lightboxArtifact);
    const next = state.filteredCurated[((idx >= 0 ? idx : 0) - 1 + state.filteredCurated.length) % state.filteredCurated.length];
    openLightbox(next);
  });
  document.getElementById('ca-lb-next').addEventListener('click', () => {
    if (!state.lightboxArtifact || !state.filteredCurated.length) return;
    const idx = state.filteredCurated.indexOf(state.lightboxArtifact);
    const next = state.filteredCurated[((idx >= 0 ? idx : 0) + 1) % state.filteredCurated.length];
    openLightbox(next);
  });
  document.getElementById('ca-lb-locate-btn').addEventListener('click', () => {
    const art = state.lightboxArtifact;
    state.lightboxArtifact = null;
    elLightbox.classList.remove('open');
    if (art) {
      elGlobeSection.scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
      openModal(art, true);
    }
  });

  window.addEventListener('resize', resizeGlobe);

  document.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (elLightbox.classList.contains('open')) {
      if (e.key === 'Escape') {
        state.lightboxArtifact = null;
        elLightbox.classList.remove('open');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        document.getElementById('ca-lb-prev').click();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        document.getElementById('ca-lb-next').click();
      }
      return;
    }
    if (elModal.classList.contains('open')) {
      if (e.key === 'Escape') {
        state.selectedArtifact = null;
        elModal.classList.remove('open');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepModal(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepModal(1);
      }
    }
  });

  async function boot() {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const initLang = hashParams.get('lang') || searchParams.get('lang') || 'en';
    const initEra = hashParams.get('era') || searchParams.get('era') || 'all';
    const initMuseum = hashParams.get('museum') || searchParams.get('museum') || 'all';
    const initCountry = sanitizeQuery(hashParams.get('country') || searchParams.get('country') || '');
    state.lang = initLang === 'zh' ? 'zh' : 'en';
    if (SUPPORTED_MUSEUMS.includes(initMuseum)) {
      state.museumScope = initMuseum;
    }
    if (window.innerWidth <= 820 && elSidebar) {
      elSidebar.classList.add('collapsed');
      const colBtn = document.getElementById('ca-sidebar-collapse');
      if (colBtn) colBtn.textContent = '+';
    }

    resizeGlobe();
    try {
      const { polyMap, borderArcs3D, landDots } = await decodeWorldMap();
      state.polyMap = polyMap;
      state.borderArcs3D = borderArcs3D;
      state.landDots3D = landDots;
    } catch (_) {
      state.polyMap = new Map();
    }

    buildGlobalChronologyDataset();
    // Preload all 10 atlases concurrently (embedded base64 WebP decodes in ~45ms)
    await Promise.all(SUPPORTED_MUSEUMS.map(mid => loadMuseumAtlas(mid)));

    const validEra = ERAS.find(e => e.id === initEra) ? initEra : 'all';
    selectEraPreset(validEra, true);

    if (initCountry) {
      const cLow = initCountry.toLowerCase();
      const cg = state.countryGroups.find(g => g.en.toLowerCase() === cLow || g.zh === initCountry);
      if (cg) {
        state.selectedCountryEn = cg.en;
        state.targetRotLon = -cg.lon * DEG2RAD;
        state.targetRotLat = Math.max(-1.15, Math.min(1.15, cg.lat * DEG2RAD));
        state.targetZoom = 1.24;
        renderSidebar();
        elGlobeSection.scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
      }
    }

    requestAnimationFrame(renderGlobeFrame);
  }

  const elCaDock = document.getElementById('ca-bottom-dock');
  if (elCaDock && elGlobeSection && typeof ResizeObserver === 'function') {
    const syncCaDock = () => {
      const h = elCaDock.offsetHeight;
      if (h > 0) elGlobeSection.style.setProperty('--ca-dock-h', h + 'px');
    };
    syncCaDock();
    new ResizeObserver(syncCaDock).observe(elCaDock);
  }

  boot();
})();
