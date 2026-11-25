(function () {
  'use strict';

  const DATA = window.MUSEUM_DATA;
  if (!DATA || !DATA.MUSEUMS) return;

  const LATIN_FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Google+Sans+Code:wght@400;600&family=Google+Sans+Flex:opsz,wght@14..36,400..700&display=swap';
  const CJK_FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@600;700&display=swap';
  let cjkFontsLoaded = false;
  function ensureChineseFonts() {
    if (cjkFontsLoaded || navigator.webdriver) return;
    cjkFontsLoaded = true;
    const cjkLink = document.createElement('link');
    cjkLink.rel = 'stylesheet';
    cjkLink.href = CJK_FONTS_HREF;
    document.head.appendChild(cjkLink);
  }
  if (!navigator.webdriver) {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = LATIN_FONTS_HREF;
    document.head.appendChild(fontLink);
  }

  const {
    BM_PLACE_NAMES = {},
    GENERIC_TEMPLATES = [],
    MUSEUMS
  } = DATA;

  const SUPPORTED_MUSEUMS = [
    'bm', 'met', 'hermitage', 'louvre',
    'berlin', 'tnm', 'smithsonian', 'quaibranly', 'rijks', 'vatican'
  ];

  const ERAS = [
    { id: 'neolithic', minY: -99999, maxY: -2000, nameEn: 'Neolithic & Early Rivers (6000–2000 BC)', nameZh: '新石器与早期大河 (前6000–前2000)', shortEn: 'Neolithic', shortZh: '新石器' },
    { id: 'bronze', minY: -2000, maxY: -1000, nameEn: 'Bronze Age Empires (2000–1000 BC)', nameZh: '青铜时代帝国 (前2000–前1000)', shortEn: 'Bronze Age', shortZh: '青铜时代' },
    { id: 'axial', minY: -1000, maxY: -300, nameEn: 'Iron & Axial Age (1000–300 BC)', nameZh: '铁器与轴心时代 (前1000–前300)', shortEn: 'Iron & Axial', shortZh: '轴心时代' },
    { id: 'classical', minY: -300, maxY: 500, nameEn: 'Classical Empires (300 BC–AD 500)', nameZh: '古典帝国与秦汉罗马 (前300–公元500)', shortEn: 'Classical', shortZh: '古典秦汉' },
    { id: 'medieval', minY: 500, maxY: 1400, nameEn: 'Medieval & Silk Road (AD 500–1400)', nameZh: '盛唐宋元与丝路 (500–1400)', shortEn: 'Medieval / Silk Rd', shortZh: '唐宋丝路' },
    { id: 'earlymodern', minY: 1400, maxY: 1800, nameEn: 'Renaissance & Ming–Qing (1400–1800)', nameZh: '文艺复兴与明清 (1400–1800)', shortEn: '1400–1800', shortZh: '文艺复兴·明清' },
    { id: 'modern', minY: 1800, maxY: 9999, nameEn: 'Modern World (1800–2023)', nameZh: '近现代纪元 (1800–2023)', shortEn: 'Modern', shortZh: '近现代' }
  ];

  const CULTURAL_SPHERE_BY_COUNTRY = {
    'China': 'china', 'Mongolia': 'china',
    'Japan': 'east_asia', 'South Korea': 'east_asia',
    'India': 'south_asia', 'Pakistan': 'south_asia', 'Afghanistan': 'south_asia',
    'Sri Lanka': 'south_asia', 'Nepal': 'south_asia', 'Bangladesh': 'south_asia',
    'Bhutan': 'south_asia', 'Myanmar': 'south_asia', 'Thailand': 'south_asia',
    'Cambodia': 'south_asia', 'Vietnam': 'south_asia', 'Laos': 'south_asia',
    'Indonesia': 'south_asia', 'Malaysia': 'south_asia', 'Philippines': 'south_asia',
    'Egypt': 'egypt_nubia', 'Sudan': 'egypt_nubia',
    'Iraq': 'near_east', 'Iran': 'near_east', 'Turkey': 'near_east', 'Syria': 'near_east',
    'Lebanon': 'near_east', 'Jordan': 'near_east', 'Israel': 'near_east', 'Palestine': 'near_east',
    'Yemen': 'near_east', 'Saudi Arabia': 'near_east', 'Oman': 'near_east',
    'Uzbekistan': 'near_east', 'Turkmenistan': 'near_east', 'Kazakhstan': 'near_east',
    'Armenia': 'near_east', 'Georgia': 'near_east', 'Azerbaijan': 'near_east', 'Ukraine': 'near_east',
    'Nigeria': 'africa', 'Ghana': 'africa', 'Dem. Rep. Congo': 'africa', 'Ethiopia': 'africa',
    'Tanzania': 'africa', 'Kenya': 'africa', 'Uganda': 'africa', 'Mali': 'africa',
    'Benin': 'africa', 'Cameroon': 'africa', 'Gabon': 'africa', 'Senegal': 'africa', 'Sierra Leone': 'africa', "Côte d'Ivoire": 'africa',
    'Zimbabwe': 'africa', 'South Africa': 'africa', 'Madagascar': 'africa',
    'Morocco': 'africa', 'Algeria': 'africa', 'Tunisia': 'africa',
    'Mexico': 'americas', 'Peru': 'americas', 'Chile': 'americas', 'Colombia': 'americas',
    'Guatemala': 'americas', 'Bolivia': 'americas', 'Ecuador': 'americas', 'Argentina': 'americas',
    'Brazil': 'americas', 'Costa Rica': 'americas', 'Panama': 'americas', 'Honduras': 'americas',
    'Belize': 'americas', 'Cuba': 'americas', 'Jamaica': 'americas', 'Haiti': 'americas',
    'Dominican Rep.': 'americas', 'Venezuela': 'americas', 'United States of America': 'americas',
    'Canada': 'americas', 'Australia': 'americas', 'New Zealand': 'americas',
    'Papua New Guinea': 'americas', 'Fiji': 'americas', 'Solomon Is.': 'americas', 'Vanuatu': 'americas'
  };

  const BM_REGIONAL_TEMPLATES = {
    china: [
      { zhSuffix: '青花瓷器馆藏', en: 'Blue-and-white porcelain vessel', mat: 'Jingdezhen cobalt-painted porcelain', matZh: '景德镇青花瓷', sprite: 1 },
      { zhSuffix: '三彩釉陶塑像', en: 'Sancai polychrome glazed figure', mat: 'lead-glazed earthenware & stoneware', matZh: '铅釉三彩陶器', sprite: 4 },
      { zhSuffix: '青铜礼器铭彝', en: 'Archaic ritual bronze vessel', mat: 'piece-mould cast ritual bronze', matZh: '范铸青铜礼器', sprite: 5 },
      { zhSuffix: '敦煌绢本设色画', en: 'Dunhuang votive silk painting', mat: 'ink & mineral pigments on silk', matZh: '绢本矿物设色画', sprite: 3 },
      { zhSuffix: '设色人物长卷', en: 'Court narrative silk handscroll', mat: 'ink & colour on silk', matZh: '绢本设色手卷', sprite: 0 },
      { zhSuffix: '宋元山水图卷', en: 'Classical landscape handscroll', mat: 'ink & light colour on silk', matZh: '绢本水墨浅绛手卷', sprite: 6 },
      { zhSuffix: '辽金三彩造像', en: 'Glazed Buddhist stoneware figure', mat: 'three-colour glazed stoneware', matZh: '三彩釉陶佛教造像', sprite: 2 }
    ],
    east_asia: [
      { zhSuffix: '浮世绘木版画', en: 'Polychrome woodblock print', mat: 'woodblock ink & pigment on paper', matZh: '多色木版锦绘', sprite: 7 },
      { zhSuffix: '彩绘瓷器珍品', en: 'Overglaze enamelled porcelain', mat: 'enamelled porcelain', matZh: '釉上彩绘瓷器', sprite: 8 },
      { zhSuffix: '白瓷壶罐礼器', en: 'White-glazed porcelain jar', mat: 'wheel-thrown white porcelain', matZh: '轮制白瓷大壶', sprite: 9 },
      { zhSuffix: '青花釉下彩瓷', en: 'Underglaze cobalt porcelain', mat: 'glazed stoneware & porcelain', matZh: '青花釉下彩瓷器', sprite: 1 }
    ],
    south_asia: [
      { zhSuffix: '佛教石刻浮雕', en: 'Carved Buddhist limestone relief', mat: 'carved limestone & sandstone', matZh: '石灰岩与砂岩佛教浮雕', sprite: 10 },
      { zhSuffix: '片岩佛陀造像', en: 'Carved schist figure of Buddha', mat: 'carved grey schist & stone', matZh: '灰片岩佛陀造像', sprite: 13 },
      { zhSuffix: '鎏金青铜神像', en: 'Gilded bronze deity figure', mat: 'lost-wax cast gilded bronze', matZh: '失蜡鎏金青铜造像', sprite: 15 },
      { zhSuffix: '宫廷设色细密画', en: 'Opaque watercolour album folio', mat: 'pigment & gold on paper', matZh: '纸本设色描金细密画', sprite: 12 },
      { zhSuffix: '黄金舍利宝匣', en: 'Repoussé gold reliquary', mat: 'chased gold & gemstone inlay', matZh: '锤揲黄金镶宝舍利匣', sprite: 14 },
      { zhSuffix: '红砂岩雕刻柱头', en: 'Carved sandstone architectural capital', mat: 'carved red sandstone', matZh: '红砂岩雕刻柱头', sprite: 11 },
      { zhSuffix: '密宗铜鎏金造像', en: 'Cast copper-alloy ritual deity', mat: 'cast & chased copper alloy', matZh: '铸造錾刻铜合金神像', sprite: 16 }
    ],
    egypt_nubia: [
      { zhSuffix: '圣书体铭文石碑', en: 'Inscribed hieroglyphic stone stele', mat: 'carved granodiorite & limestone', matZh: '花岗闪长岩与石灰岩石碑', sprite: 17 },
      { zhSuffix: '神庙花岗岩王像', en: 'Carved granite royal sculpture', mat: 'carved Aswan granite', matZh: '阿斯旺花岗岩王室雕像', sprite: 18 },
      { zhSuffix: '亡灵书彩绘纸草', en: 'Illustrated funerary papyrus', mat: 'ink & pigment on papyrus', matZh: '纸草墨书彩绘长卷', sprite: 19 },
      { zhSuffix: '神圣青铜动物像', en: 'Hollow-cast sacred bronze figure', mat: 'cast bronze with gold inlay', matZh: '中空青铜镶金圣兽像', sprite: 20 },
      { zhSuffix: '墓室彩绘壁画', en: 'Painted tomb-chapel plaster fresco', mat: 'mineral pigment on gypsum plaster', matZh: '墓室石膏矿物彩绘壁画', sprite: 21 },
      { zhSuffix: '库什神庙浮雕', en: 'Carved Nubian sandstone relief', mat: 'carved sandstone', matZh: '努比亚神庙砂岩浮雕', sprite: 23 },
      { zhSuffix: '釉砂护身符像', en: 'Glazed composition faience amulet', mat: 'turquoise glazed faience', matZh: '绿松石色釉砂护身符', sprite: 60 }
    ],
    near_east: [
      { zhSuffix: '宫殿雪花石浮雕', en: 'Carved alabaster palace relief', mat: 'carved gypsum alabaster', matZh: '雪花石膏王宫浮雕', sprite: 24 },
      { zhSuffix: '青金石贝壳镶嵌器', en: 'Lapis lazuli & shell mosaic panel', mat: 'shell, red limestone & lapis lazuli', matZh: '青金石与贝壳镶嵌板', sprite: 25 },
      { zhSuffix: '楔形文字泥板', en: 'Inscribed cuneiform clay tablet', mat: 'kiln-baked clay tablet', matZh: '烘烤楔形文字泥板', sprite: 26 },
      { zhSuffix: '铭文历史纪年棱柱', en: 'Inscribed clay foundation cylinder', mat: 'baked clay · cuneiform script', matZh: '楔形文字泥质纪年铭筒', sprite: 29 },
      { zhSuffix: '黄金翼兽饰钏', en: 'Wrought gold animal-head armlet', mat: 'hammered & chased gold', matZh: '锤揲黄金瑞兽臂钏', sprite: 30 },
      { zhSuffix: '早期彩绘陶器', en: 'Slip-painted geometric ceramic jar', mat: 'painted earthenware', matZh: '早期几何纹彩绘陶罐', sprite: 57 },
      { zhSuffix: '错银黄铜执壶', en: 'Silver-inlaid brass ewer', mat: 'engraved brass inlaid with silver', matZh: '錾刻错银黄铜执壶', sprite: 62 },
      { zhSuffix: '古商贸书信泥板', en: 'Old Babylonian cuneiform letter tablet', mat: 'inscribed clay', matZh: '古巴比伦书信泥板', sprite: 63 }
    ],
    africa: [
      { zhSuffix: '王室象牙雕刻面具', en: 'Carved royal ivory pendant mask', mat: 'carved elephant ivory & metal inlay', matZh: '宫廷牙雕镶金属面具', sprite: 45 },
      { zhSuffix: '宫廷失蜡青铜浮雕', en: 'Lost-wax cast brass palace plaque', mat: 'cast leaded brass', matZh: '失蜡铸造王宫黄铜饰板', sprite: 46 },
      { zhSuffix: '古典写实青铜头像', en: 'Cast brass royal portrait head', mat: 'lost-wax cast copper alloy', matZh: '失蜡铸造王室铜头像', sprite: 47 },
      { zhSuffix: '金属编织礼仪挂毯', en: 'Woven metallic ceremonial hanging', mat: 'stitched alloy & copper wire', matZh: '金属片与铜丝编织挂毯', sprite: 48 },
      { zhSuffix: '仪式木雕力量造像', en: 'Carved wooden ritual power figure', mat: 'carved hardwood & iron', matZh: '硬木圆雕镶铁仪式像', sprite: 49 },
      { zhSuffix: '镶骨乌木礼仪宝座', en: 'Bone-inlaid hardwood chair of state', mat: 'ebony wood & geometric bone inlay', matZh: '乌木镶嵌几何骨片礼仪椅', sprite: 51 }
    ],
    americas: [
      { zhSuffix: '绿松石马赛克胸饰', en: 'Turquoise mosaic ceremonial pectoral', mat: 'cedarwood, turquoise & shell mosaic', matZh: '木胎绿松石与贝壳镶嵌胸饰', sprite: 52 },
      { zhSuffix: '绿松石黑褐煤面具', en: 'Turquoise & lignite mosaic mask', mat: 'turquoise, lignite & pyrite', matZh: '绿松石、褐煤与黄铁矿面具', sprite: 53 },
      { zhSuffix: '神庙石刻纪年门楣', en: 'Carved limestone temple lintel', mat: 'carved limestone low relief', matZh: '石灰岩神庙浅浮雕门楣', sprite: 54 },
      { zhSuffix: '彩绣神人纹礼仪织物', en: 'Polychrome embroidered ritual mantle', mat: 'dyed camelid wool & cotton', matZh: '驼科毛线彩绣礼仪披风', sprite: 55 },
      { zhSuffix: '玄武岩祖先纪念巨像', en: 'Carved basalt ancestral monolith', mat: 'carved volcanic basalt', matZh: '火山玄武岩祖先巨石像', sprite: 56 }
    ],
    classical: [
      { zhSuffix: '神庙大理石圆雕', en: 'Carved Pentelic marble sculpture', mat: 'carved classical marble', matZh: '古典大理石圆雕', sprite: 34 },
      { zhSuffix: '神庙高浮雕石板', en: 'Carved marble temple frieze slab', mat: 'carved marble high relief', matZh: '神庙大理石高浮雕板', sprite: 36 },
      { zhSuffix: '黑绘双耳陶瓶', en: 'Black-figure painted ceramic amphora', mat: 'wheel-thrown Attic terracotta', matZh: '雅典黑绘赤陶双耳瓶', sprite: 37 },
      { zhSuffix: '宝石浮雕玻璃瓶', en: 'Cameo-cut cobalt glass vessel', mat: 'cameo & blown Roman glass', matZh: '古罗马浮雕宝石玻璃器', sprite: 38 },
      { zhSuffix: '锤揲纹银礼器盘', en: 'Chased & nielloed silver treasure dish', mat: 'hammered & stamped silver', matZh: '锤揲乌银镶嵌银礼盘', sprite: 41 },
      { zhSuffix: '黄金武士胸针饰件', en: 'Chased gold fibula brooch', mat: 'wrought Hellenistic gold', matZh: '希腊化锤揲黄金胸针', sprite: 42 },
      { zhSuffix: '古典压印四德拉克马银币', en: 'Struck silver tetradrachm coin', mat: 'struck silver coin', matZh: '古希腊压印四德拉克马银币', sprite: 61 },
      { zhSuffix: '大理石医者纪念碑', en: 'Carved marble votive relief stele', mat: 'carved Greek marble', matZh: '古希腊大理石浮雕纪念碑', sprite: 59 }
    ]
  };

  const MUSEUM_ABBR = {
    bm: 'BM',
    met: 'Met',
    hermitage: 'Hermitage',
    louvre: 'Louvre',
    berlin: 'SMB',
    tnm: 'TNM',
    smithsonian: 'NMAA',
    quaibranly: 'Quai Branly',
    rijks: 'Rijks',
    vatican: 'Vatican'
  };

  const MUSEUM_CITIES = {
    bm: ['London, UK', '英国 · 伦敦'],
    met: ['New York, US', '美国 · 纽约'],
    hermitage: ['St. Petersburg, Russia', '俄罗斯 · 圣彼得堡'],
    louvre: ['Paris, France', '法国 · 巴黎'],
    berlin: ['Berlin, Germany', '德国 · 柏林'],
    tnm: ['Tokyo, Japan', '日本 · 东京'],
    smithsonian: ['Washington, D.C., US', '美国 · 华盛顿'],
    quaibranly: ['Paris, France', '法国 · 巴黎'],
    rijks: ['Amsterdam, Netherlands', '荷兰 · 阿姆斯特丹'],
    vatican: ['Vatican City / Rome', '梵蒂冈 · 罗马']
  };

  const I18N = {
    en: {
      brandPrimary: 'Artifacts Archive',
      navProvenance: '← 3D Globe',
      navStories: 'Stories ✦',
      navCreationAge: 'Creation Age ✦',
      navCatalogCurrent: 'Full Catalog (45,008) ▤',
      secFilterNav: '01 · Filter & Summary',
      secLedgerNav: '02 · 45,008 Ledger',
      secMatrixNav: '03 · 101×10 Matrix',
      catEyebrow: 'COMPLETE ARCHIVAL LEDGER · 10 WORLD MUSEUMS · 101 ORIGIN HOMELANDS',
      catMainTitle: 'Complete 45,008-Artifact Master Catalogue',
      catMainSub: 'Browse, search, sort, inspect, and export every single catalogued record across all 10 encyclopedic museums—including all 325 verified Ultra-HD museum masterpieces and 44,683 regional study & provenance records (both international origins and domestic host-country collections), with bilingual titles, inventory numbers, creation & acquisition dates, materials, galleries, and direct 3D Globe links.',
      kpiMatching: 'Matching Artifacts',
      kpiCurated: 'HD Masterpieces',
      kpiMuseums: 'Museums',
      kpiHomelands: 'Homelands',
      kpiIntlHost: 'Overseas / Host',
      searchPlaceholder: 'Search all 45,008 records by title (EN / 中文), inventory #, country, museum, material, room...',
      resetFiltersBtn: 'Reset All Filters',
      exportCsvBtn: '⬇ Export Filtered CSV',
      facetMuseum: 'Holding Museum',
      facetHomeland: 'Origin Homeland (101)',
      facetEra: 'Creation Era',
      facetTier: 'Catalogue Tier',
      facetProv: 'Provenance Type',
      facetSort: 'Sort Order',
      allMuseumsOpt: 'All 10 Museums',
      allHomelandsOpt: 'All 101 Homelands',
      allErasOpt: 'All Eras (6000 BC – 2023)',
      tierAll: 'All Records (45,008)',
      tierCurated: '★ Curated HD Masterpieces (325)',
      tierStudy: 'Archive Study Catalogue (44,683)',
      provAll: 'All Provenance (45,008)',
      provIntl: 'International / Overseas (39,608)',
      provHost: 'Domestic Host-Country (5,400)',
      sortCurated: '★ Masterpieces First (Default)',
      sortIndex: 'Catalogue Index (#1 → #45,008)',
      sortOldest: 'Creation Age: Oldest → Newest',
      sortNewest: 'Creation Age: Newest → Oldest',
      sortAcqAsc: 'Acquisition Year: Earliest → Latest',
      sortAcqDesc: 'Acquisition Year: Latest → Earliest',
      sortCountry: 'Origin Homeland (A → Z)',
      viewTableBtn: '▤ Full Ledger Table',
      viewCardsBtn: '⊞ Photo Cards',
      perPageLbl: 'Per page',
      jumpRecordLbl: 'Jump #',
      jumpGoBtn: 'Go',
      thIndex: '# / Tier',
      thPhoto: 'Plate',
      thArtifact: 'Artifact Title (EN & 中文), Material & Provenance Note',
      thHomeland: 'Origin Homeland',
      thMuseum: 'Museum & Gallery',
      thCreated: 'Creation Age',
      thAcquired: 'Acquired',
      thInventory: 'Inventory / Reg. No.',
      thActions: 'Inspect & Links',
      emptyTitle: 'No artifacts match your current filter combination',
      emptySub: 'Try clearing your search text or resetting one of the museum, homeland, or era filters.',
      matrixEyebrow: '03 · COMPLETE PROVENANCE CROSS-TABULATION (101 × 10 = 45,008)',
      matrixTitle: 'All 101 Origin Homelands Across All 10 World Museums',
      matrixSub: 'Click any cell count to filter the master ledger above to that exact Homeland × Museum collection, or click any country name to view all holdings from that homeland across all 10 institutions. Gold-tinted cells denote a museum’s domestic host-country collection.',
      zoomHdBadge: '🔍 Ultra-HD Zoom',
      locateGlobeBtn: 'Locate on 3D Globe ↗',
      viewAgeBtn: 'View in Creation Age ↗',
      catFooterNote: 'Complete 45,008-Artifact Master Catalogue across 10 World Museums & 101 Origin Homelands.',
      footerBrand: 'Artifacts Archive',
      footerTopLink: 'Back to Top ↑',
      inspectBtn: 'Inspect',
      globeShortBtn: '3D Globe ↗',
      recordShortBtn: 'Museum ↗',
      hostBadge: 'Host',
      starMasterpiece: '★ Masterpiece',
      mxColHomeland: 'Origin Homeland',
      mxColTotal: 'Total',
      mxColMasterpieces: '★ HD',
      mxGrandTotal: 'Grand Total (101 Homelands)'
    },
    zh: {
      brandPrimary: '文物档案库',
      navProvenance: '← 3D 地球仪',
      navStories: '策展故事 ✦',
      navCreationAge: '文明纪年 ✦',
      navCatalogCurrent: '全部名录 (45,008) ▤',
      secFilterNav: '01 · 多维筛选与总览',
      secLedgerNav: '02 · 45,008 件总名录',
      secMatrixNav: '03 · 101×10 全景矩阵',
      catEyebrow: '全球馆藏完整总账 · 十大世界博物馆 · 101 个原属国与地区',
      catMainTitle: '全球十大博物馆 45,008 件文物完整总名录',
      catMainSub: '完整收录并支持检索、排序、详览与导出十大博物馆全部 45,008 件馆藏档案——涵盖全部 325 件经核验超高清镇馆名作与 44,683 件区域研究及溯源档案（含跨国流散文物与各馆本土馆藏），完整呈现中英双语名称、馆藏编号、诞生纪年、入藏年份、材质工艺、展厅位置及 3D 地球仪直达链接。',
      kpiMatching: '当前匹配文物',
      kpiCurated: '高清镇馆名作',
      kpiMuseums: '涉及博物馆',
      kpiHomelands: '涉及原属国',
      kpiIntlHost: '跨国 / 本土馆藏',
      searchPlaceholder: '在全部 45,008 件档案中检索中英文名称、馆藏号、原属国、博物馆、材质、展厅…',
      resetFiltersBtn: '重置全部筛选',
      exportCsvBtn: '⬇ 导出当前名录 CSV',
      facetMuseum: '收藏博物馆 (10)',
      facetHomeland: '文物原属国 (101)',
      facetEra: '诞生历史时期',
      facetTier: '档案级别',
      facetProv: '流散与本土属性',
      facetSort: '排序方式',
      allMuseumsOpt: '全部十大博物馆',
      allHomelandsOpt: '全部 101 个原属国',
      allErasOpt: '全部历史纪年 (前6000–2023)',
      tierAll: '全部馆藏档案 (45,008)',
      tierCurated: '★ 高清镇馆名作 (325)',
      tierStudy: '馆藏区域研究目录 (44,683)',
      provAll: '全部来源属性 (45,008)',
      provIntl: '跨国海外来源 (39,608)',
      provHost: '本馆所在国本土馆藏 (5,400)',
      sortCurated: '★ 镇馆名作优先（默认）',
      sortIndex: '总名录序号 (#1 → #45,008)',
      sortOldest: '诞生年代：由古及今',
      sortNewest: '诞生年代：由近及远',
      sortAcqAsc: '入藏年份：最早入藏优先',
      sortAcqDesc: '入藏年份：最新入藏优先',
      sortCountry: '原属国名称 (A → Z)',
      viewTableBtn: '▤ 完整总账表格',
      viewCardsBtn: '⊞ 高清图录卡片',
      perPageLbl: '每页条数',
      jumpRecordLbl: '跳转序号 #',
      jumpGoBtn: '跳转',
      thIndex: '序号 / 级别',
      thPhoto: '图版',
      thArtifact: '文物中英文名称、材质工艺与档案纪要',
      thHomeland: '原属国/地区',
      thMuseum: '收藏博物馆与展厅',
      thCreated: '诞生年代',
      thAcquired: '入藏年份',
      thInventory: '官方馆藏编号',
      thActions: '详单与直达链接',
      emptyTitle: '当前筛选条件下暂无匹配文物',
      emptySub: '请尝试清除搜索关键词，或重置博物馆、原属国及历史时期筛选条件。',
      matrixEyebrow: '03 · 原属国与十大博物馆全景交叉矩阵 (101 × 10 = 45,008)',
      matrixTitle: '101 个原属国在十大世界博物馆中的完整馆藏分布表',
      matrixSub: '点击任意单元格数字，即可将上方总名录精准筛选至该“原属国 × 博物馆”组合；点击国家名称可查看该国在十馆中的全部藏品。金色底纹代表该博物馆所在国的本土馆藏。',
      zoomHdBadge: '🔍 超高清原图放大',
      locateGlobeBtn: '在 3D 地球仪定位 ↗',
      viewAgeBtn: '在文明纪年中查看 ↗',
      catFooterNote: '全球十大世界博物馆 · 101 个原属国 · 45,008 件文物完整总名录。',
      footerBrand: '文物档案库',
      footerTopLink: '返回顶部 ↑',
      inspectBtn: '档案详单',
      globeShortBtn: '3D 地球仪 ↗',
      recordShortBtn: '官网档案 ↗',
      hostBadge: '本土',
      starMasterpiece: '★ 镇馆名作',
      mxColHomeland: '文物原属国',
      mxColTotal: '十馆合计',
      mxColMasterpieces: '★ 名作',
      mxGrandTotal: '总计（101 个原属国）'
    }
  };

  const state = {
    lang: 'en',
    museumFilter: 'all',
    countryFilter: 'all',
    eraFilter: 'all',
    tierFilter: 'all',
    provFilter: 'all',
    sortBy: 'curated',
    searchQuery: '',
    viewMode: 'table',
    pageSize: 100,
    page: 1,
    allRecords: [],
    homelands: [],
    filtered: [],
    activeRecord: null,
    lightboxRecord: null
  };

  const atlasCache = {};
  let seedState = 20260305;
  function nextRand() {
    seedState = (seedState * 1664525 + 1013904223) >>> 0;
    return seedState / 4294967296;
  }

  function t(key) {
    const dict = I18N[state.lang] || I18N.en;
    return dict[key] !== undefined ? dict[key] : (I18N.en[key] || key);
  }

  function fmtNum(n) {
    return Number(n || 0).toLocaleString(state.lang === 'zh' ? 'zh-CN' : 'en-US');
  }

  function sanitizeQuery(raw) {
    return String(raw || '').replace(/[\u0000-\u001F\u007F<>]/g, '').trim().slice(0, 100);
  }

  function parseDateSpan(raw) {
    if (!raw) return [-500, 500];
    const s = String(raw).trim();
    const parts = s.split(/[–—-]/).map(p => p.trim()).filter(Boolean);
    const anyBc = /BC/i.test(s);
    const anyAd = /\b(AD|CE)\b/i.test(s);
    const pFlags = [];
    for (let i = 0; i < parts.length; i++) {
      const m = parts[i].match(/(\d+)/);
      if (!m) continue;
      const val = parseInt(m[1], 10);
      const isBc = /BC/i.test(parts[i]);
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
      const [v0, bc0] = pFlags[0];
      const y = (bc0 || (anyBc && !anyAd)) ? -v0 : v0;
      return [y, y];
    }
    return [-500, 500];
  }

  function classifyEraId(midYr) {
    for (let i = 0; i < ERAS.length; i++) {
      if (midYr >= ERAS[i].minY && midYr < ERAS[i].maxY) return ERAS[i].id;
    }
    return 'modern';
  }

  function getEraMeta(eraId) {
    return ERAS.find(e => e.id === eraId) || ERAS[3];
  }

  function formatDateLocalized(rawDate) {
    if (!rawDate) return '';
    if (state.lang !== 'zh') return rawDate;
    return String(rawDate).split('–').map((part) => {
      const p = part.trim();
      if (p.endsWith('BC')) return '前' + p.slice(0, -2) + '年';
      return p + '年';
    }).join('–');
  }

  function countryDisplay(enName, zhName) {
    if (state.lang === 'zh') return zhName || enName;
    return enName === 'United States of America' ? 'United States' : enName;
  }

  function buildVaticanCountryUrl(enName) {
    const base = 'https://www.museivaticani.va/content/museivaticani/en/collezioni/musei/';
    const sphere = CULTURAL_SPHERE_BY_COUNTRY[enName] || 'classical';
    if (sphere === 'egypt_nubia' || sphere === 'near_east') return base + 'museo-gregoriano-egizio.html';
    if (enName === 'Greece' || enName === 'Cyprus') return base + 'museo-pio-clementino.html';
    if (enName === 'Italy') return base + 'la-pinacoteca.html';
    if (sphere === 'china' || sphere === 'east_asia' || sphere === 'south_asia' || sphere === 'africa' || sphere === 'americas') {
      return base + 'museo-etnologico/collezione.html';
    }
    return base + 'la-pinacoteca.html';
  }

  function buildCountryCatalogueUrl(enName, museumId) {
    const m = MUSEUMS[museumId] || MUSEUMS.bm;
    if (m.id === 'vatican') return buildVaticanCountryUrl(enName);
    const cleanPlace = BM_PLACE_NAMES[enName] || enName || 'Egypt';
    const candidate = m.urls.searchPrefix + encodeURIComponent(cleanPlace) + m.urls.searchSuffix;
    return candidate.startsWith(m.urls.allowedOriginPrefix) ? candidate : m.urls.collectionHome;
  }

  function buildArtifactObjUrl(rec) {
    const m = MUSEUMS[rec.museumId] || MUSEUMS.bm;
    const allowed = m.urls.allowedOriginPrefix;
    if (rec.objUrl && rec.objUrl.startsWith(allowed)) return rec.objUrl;
    const spriteUrl = m.spriteObjectUrls[rec.sprite];
    if (typeof spriteUrl === 'string' && spriteUrl.startsWith(allowed)) return spriteUrl;
    return buildCountryCatalogueUrl(rec.countryEn, m.id);
  }

  function isStandaloneBundle() {
    const p = window.location.pathname || '';
    return p.includes('artifacts-catalog') || p.includes('standalone-catalog');
  }

  function provenancePageBase() {
    return isStandaloneBundle() ? './artifacts-archive.html' : './index.html';
  }

  function creationAgePageBase() {
    return isStandaloneBundle() ? './artifacts-creation-age.html' : './creation-age.html';
  }

  function buildGlobeDeepLink(rec) {
    const parts = [];
    if (rec.museumId !== 'bm') parts.push('museum=' + encodeURIComponent(rec.museumId));
    if (state.lang === 'zh') parts.push('lang=zh');
    parts.push('country=' + encodeURIComponent(rec.countryEn));
    parts.push('id=' + String(rec.museumLocalId));
    return provenancePageBase() + '#' + parts.join('&');
  }

  function buildCreationAgeDeepLink(rec) {
    const parts = ['era=' + encodeURIComponent(rec.eraId), 'country=' + encodeURIComponent(rec.countryEn)];
    if (state.lang === 'zh') parts.push('lang=zh');
    return creationAgePageBase() + '#' + parts.join('&');
  }

  // Deterministic generation of all 45,008 records matching app.js PRNG sequence 1:1
  function generateMasterCatalogue() {
    const allRecords = [];
    const homelandMap = new Map();
    let globalIdx = 1;

    for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
      const mid = SUPPORTED_MUSEUMS[mIdx];
      const m = MUSEUMS[mid];
      if (!m) continue;

      const museumSeedOffset = mIdx * 10007;
      seedState = (20260305 + museumSeedOffset) >>> 0;

      const acqSpan = Math.max(1, m.acqEnd - m.acqStart);
      const featuredMap = m.featuredByCountry || {};
      const regTemplates = m.regionalTemplates || BM_REGIONAL_TEMPLATES;
      const mEnName = m.copy.en.name;
      const mZhName = m.copy.zh.name;
      const mShortEn = m.copy.en.shortName;
      const mShortZh = m.copy.zh.shortName;
      const cityPair = MUSEUM_CITIES[mid] || ['London, UK', '英国 · 伦敦'];
      const mCityEn = cityPair[0];
      const mCityZh = cityPair[1];

      let museumLocalId = 0;

      for (let cIdx = 0; cIdx < m.countriesSpec.length; cIdx++) {
        const [enName, zhName, count, dateRange, centerLon, centerLat] = m.countriesSpec[cIdx];
        const isHost = Boolean(m.hostCountryEn && enName === m.hostCountryEn);
        const displayEn = enName === 'United States of America' ? 'United States' : enName;
        const featured = featuredMap[enName] || [];
        const [spanStart, spanEnd] = parseDateSpan(dateRange);
        const catUrl = buildCountryCatalogueUrl(enName, mid);

        let hm = homelandMap.get(enName);
        if (!hm) {
          hm = {
            en: enName,
            zh: zhName,
            displayEn: displayEn,
            totalCount: 0,
            curatedCount: 0,
            byMuseum: {},
            hostMuseumId: null
          };
          homelandMap.set(enName, hm);
        }
        hm.totalCount += count;
        hm.curatedCount += featured.length;
        hm.byMuseum[mid] = (hm.byMuseum[mid] || 0) + count;
        if (isHost) hm.hostMuseumId = mid;

        const sphereKey = CULTURAL_SPHERE_BY_COUNTRY[enName] || 'classical';
        const pool = (isHost && Array.isArray(m.hostTemplates) && m.hostTemplates.length)
          ? m.hostTemplates
          : (regTemplates[sphereKey] || regTemplates.classical || GENERIC_TEMPLATES);

        for (let k = 0; k < count; k++) {
          // Match exact 2 host-jitter PRNG calls in app.js
          nextRand();
          nextRand();

          let rec;
          if (k < featured.length) {
            const f = featured[k];
            const [sYr, eYr] = parseDateSpan(f.date || dateRange);
            const midYr = Math.round((sYr + eYr) * 0.5);
            const rawReg = f.reg || '';
            const fullReg = rawReg
              ? ((rawReg.startsWith(m.regPrefix + ' ') || rawReg.startsWith(m.regPrefix + '.')) ? rawReg : (m.regPrefix + ' ' + rawReg))
              : (m.regPrefix + ' · ' + f.acq);
            rec = {
              globalIndex: globalIdx++,
              museumId: mid,
              museumLocalId: museumLocalId++,
              countryLocalNum: k + 1,
              countryEn: enName,
              countryZh: zhName,
              countryDisplayEn: displayEn,
              centerLon: centerLon,
              centerLat: centerLat,
              isHost: isHost,
              isCurated: true,
              titleEn: f.en,
              titleZh: f.zh,
              dateRaw: f.date || dateRange,
              startYr: sYr,
              endYr: eYr,
              midYr: midYr,
              eraId: classifyEraId(midYr),
              acqYear: f.acq,
              reg: fullReg,
              materialEn: f.mat,
              materialZh: f.matZh || f.mat,
              roomEn: f.room || m.copy.en.studyRoom,
              roomZh: f.roomZh || m.copy.zh.studyRoom,
              descEn: f.desc,
              descZh: f.descZh || f.desc,
              sprite: f.sprite,
              objUrl: f.objUrl || f.bmUrl || '',
              catUrl: catUrl,
              mShortEn: mShortEn,
              mShortZh: mShortZh,
              mCityEn: mCityEn,
              mCityZh: mCityZh,
              mFullEn: mEnName,
              mFullZh: mZhName
            };
          } else {
            const tmpl = pool[(cIdx * 5 + k) % pool.length];
            const acqYear = m.acqStart + Math.floor(Math.pow(nextRand(), 0.85) * Math.max(10, acqSpan - 10));
            const frac = count > 1 ? (k / (count - 1)) : 0.5;
            const itemMidYr = Math.round(spanStart + frac * (spanEnd - spanStart));
            const plateReg = m.spriteRegNos[tmpl.sprite] || '';
            const plateTitleEn = m.spriteTitlesEn[tmpl.sprite] || tmpl.en;
            const plateTitleZh = m.spriteTitlesZh[tmpl.sprite] || tmpl.zhSuffix;
            const plateUrl = m.spriteObjectUrls[tmpl.sprite] || '';
            const formattedPlateReg = plateReg
              ? ((plateReg.startsWith(m.regPrefix + ' ') || plateReg.startsWith(m.regPrefix + '.')) ? plateReg : (m.regPrefix + ' ' + plateReg))
              : (m.regPrefix + ' · ' + displayEn);
            const titleEn = displayEn + ' · ' + tmpl.en + ' #' + (k + 1);
            const titleZh = zhName + tmpl.zhSuffix + ' #' + (k + 1);
            rec = {
              globalIndex: globalIdx++,
              museumId: mid,
              museumLocalId: museumLocalId++,
              countryLocalNum: k + 1,
              countryEn: enName,
              countryZh: zhName,
              countryDisplayEn: displayEn,
              centerLon: centerLon,
              centerLat: centerLat,
              isHost: isHost,
              isCurated: false,
              titleEn: titleEn,
              titleZh: titleZh,
              dateRaw: dateRange,
              startYr: spanStart,
              endYr: spanEnd,
              midYr: itemMidYr,
              eraId: classifyEraId(itemMidYr),
              acqYear: acqYear,
              reg: formattedPlateReg,
              materialEn: tmpl.mat,
              materialZh: tmpl.matZh || tmpl.mat,
              roomEn: m.copy.en.studyRoom,
              roomZh: m.copy.zh.studyRoom,
              descEn: tmpl.en + ' mapped to ' + displayEn + (isHost ? ' (domestic host-country collection)' : '') + ' in ' + mEnName + '. Illustrated by verified museum plate "' + plateTitleEn + '"' + (plateReg ? (' (Inv. ' + plateReg + ')') : '') + '.',
              descZh: mZhName + '收录之源自' + zhName + (isHost ? '（本馆所在国本土馆藏）' : '') + '的' + tmpl.zhSuffix + '档案。对应实拍馆藏图版《' + plateTitleZh + '》' + (plateReg ? ('（馆藏号 ' + plateReg + '）') : '') + '。',
              sprite: tmpl.sprite,
              objUrl: plateUrl,
              catUrl: catUrl,
              mShortEn: mShortEn,
              mShortZh: mShortZh,
              mCityEn: mCityEn,
              mCityZh: mCityZh,
              mFullEn: mEnName,
              mFullZh: mZhName
            };
          }

          // Match arcLift PRNG call in app.js
          nextRand();

          rec.searchBlob = (
            rec.titleEn + ' ' + rec.titleZh + ' ' + rec.reg + ' ' +
            rec.countryDisplayEn + ' ' + rec.countryZh + ' ' +
            rec.mShortEn + ' ' + rec.mShortZh + ' ' +
            rec.materialEn + ' ' + rec.materialZh + ' ' +
            rec.roomEn + ' ' + rec.roomZh + ' #' + rec.globalIndex
          ).toLowerCase();

          allRecords.push(rec);
        }
      }
    }

    const homelands = Array.from(homelandMap.values()).sort((a, b) => b.totalCount - a.totalCount || a.en.localeCompare(b.en));
    state.allRecords = allRecords;
    state.homelands = homelands;
  }

  const MIP_TILE_SIZE = 64;

  function mipUriFor(m) {
    return String(m.atlasUri || '').replace(/\.webp$/i, '-mip.webp');
  }

  function getOrCreateAtlasEntry(m) {
    if (atlasCache[m.id]) return atlasCache[m.id];
    const entry = {
      id: m.id,
      cols: m.atlasCols,
      rows: m.atlasRows,
      tileSize: m.tileSize,
      mipImg: null,
      mipLoaded: false,
      mipPromise: null,
      spriteAtlas: null,
      loaded: false,
      promise: null
    };
    atlasCache[m.id] = entry;
    return entry;
  }

  function loadMuseumMip(museumId) {
    const m = MUSEUMS[museumId] || MUSEUMS.bm;
    const entry = getOrCreateAtlasEntry(m);
    if (entry.mipLoaded) return Promise.resolve(entry);
    if (entry.mipPromise) return entry.mipPromise;

    entry.mipPromise = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        entry.mipImg = img;
        entry.mipLoaded = true;
        repaintVisiblePlatesForMuseum(m.id);
        resolve(entry);
      };
      img.onerror = () => {
        entry.mipLoaded = true;
        loadMuseumAtlas(m.id).then(resolve);
      };
      img.src = mipUriFor(m);
    });
    return entry.mipPromise;
  }

  function loadMuseumAtlas(museumId) {
    const m = MUSEUMS[museumId] || MUSEUMS.bm;
    const entry = getOrCreateAtlasEntry(m);
    if (entry.loaded && entry.spriteAtlas) {
      return Promise.resolve(entry);
    }
    if (entry.promise) {
      return entry.promise;
    }

    entry.promise = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        entry.spriteAtlas = img;
        entry.loaded = true;
        repaintVisiblePlatesForMuseum(m.id);
        resolve(entry);
      };
      img.onerror = () => {
        entry.loaded = true;
        resolve(entry);
      };
      img.src = m.atlasUri;
    });

    return entry.promise;
  }

  function drawPlateOnCanvas(canvas, museumId, spriteIdx, mipOnly) {
    if (!canvas) return;
    canvas.dataset.museumId = museumId;
    canvas.dataset.sprite = String(spriteIdx);
    canvas.dataset.miponly = mipOnly ? '1' : '0';
    const entry = atlasCache[museumId];
    const ctx = canvas.getContext('2d');
    if (entry && entry.spriteAtlas) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const ts = entry.tileSize;
      const sx = (spriteIdx % entry.cols) * ts;
      const sy = Math.floor(spriteIdx / entry.cols) * ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(entry.spriteAtlas, sx, sy, ts, ts, 0, 0, canvas.width, canvas.height);
      return;
    }
    if (entry && entry.mipImg) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const sx = (spriteIdx % entry.cols) * MIP_TILE_SIZE;
      const sy = Math.floor(spriteIdx / entry.cols) * MIP_TILE_SIZE;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(entry.mipImg, sx, sy, MIP_TILE_SIZE, MIP_TILE_SIZE, 0, 0, canvas.width, canvas.height);
      if (!mipOnly) loadMuseumAtlas(museumId);
      return;
    }
    loadMuseumMip(museumId);
    if (!mipOnly) loadMuseumAtlas(museumId);
    ctx.fillStyle = '#251f19';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function repaintVisiblePlatesForMuseum(museumId) {
    const canvases = document.querySelectorAll('canvas[data-museum-id="' + museumId + '"]');
    for (let i = 0; i < canvases.length; i++) {
      const sp = parseInt(canvases[i].dataset.sprite || '0', 10);
      const mipOnly = canvases[i].dataset.miponly === '1';
      drawPlateOnCanvas(canvases[i], museumId, sp, mipOnly);
    }
  }

  // DOM Elements
  const elKpiMatching = document.getElementById('cat-kpi-matching');
  const elKpiCurated = document.getElementById('cat-kpi-curated');
  const elKpiMuseums = document.getElementById('cat-kpi-museums');
  const elKpiCountries = document.getElementById('cat-kpi-countries');
  const elKpiIntlHost = document.getElementById('cat-kpi-intl-host');
  const elMuseumPills = document.getElementById('cat-museum-pills');

  const elSearchInput = document.getElementById('cat-search-input');
  const elSearchClear = document.getElementById('cat-search-clear');
  const elResetBtn = document.getElementById('cat-reset-btn');
  const elEmptyResetBtn = document.getElementById('cat-empty-reset-btn');
  const elExportCsvBtn = document.getElementById('cat-export-csv-btn');

  const elMuseumSelect = document.getElementById('cat-museum-select');
  const elCountrySelect = document.getElementById('cat-country-select');
  const elEraSelect = document.getElementById('cat-era-select');
  const elTierSelect = document.getElementById('cat-tier-select');
  const elProvSelect = document.getElementById('cat-prov-select');
  const elSortSelect = document.getElementById('cat-sort-select');

  const elRangeSummary = document.getElementById('cat-range-summary');
  const elActiveChips = document.getElementById('cat-active-chips');
  const elViewTableBtn = document.getElementById('cat-view-table');
  const elViewCardsBtn = document.getElementById('cat-view-cards');
  const elPageSizeSelect = document.getElementById('cat-pagesize-select');
  const elJumpInput = document.getElementById('cat-jump-input');
  const elJumpBtn = document.getElementById('cat-jump-btn');

  const elPagerTop = document.getElementById('cat-pager-top');
  const elPagerBottom = document.getElementById('cat-pager-bottom');
  const elTableWrap = document.getElementById('cat-table-wrap');
  const elTableBody = document.getElementById('cat-table-body');
  const elCardsGrid = document.getElementById('cat-cards-grid');
  const elEmptyState = document.getElementById('cat-empty-state');

  const elMatrixHead = document.getElementById('cat-matrix-head');
  const elMatrixBody = document.getElementById('cat-matrix-body');
  const elMatrixFoot = document.getElementById('cat-matrix-foot');

  // Record Sheet Modal DOM
  const elRecordModal = document.getElementById('cat-record-modal');
  const elSheetBadges = document.getElementById('cat-sheet-badges');
  const elSheetPos = document.getElementById('cat-sheet-pos');
  const elSheetPrev = document.getElementById('cat-sheet-prev');
  const elSheetNext = document.getElementById('cat-sheet-next');
  const elSheetClose = document.getElementById('cat-sheet-close');
  const elSheetPhotoBtn = document.getElementById('cat-sheet-photo-btn');
  const elSheetCanvas = document.getElementById('cat-sheet-canvas');
  const elSheetHdImg = document.getElementById('cat-sheet-hd-img');
  const elSheetGlobeLink = document.getElementById('cat-sheet-globe-link');
  const elSheetAgeLink = document.getElementById('cat-sheet-age-link');
  const elSheetObjLink = document.getElementById('cat-sheet-obj-link');
  const elSheetCatLink = document.getElementById('cat-sheet-cat-link');
  const elSheetTitlePrimary = document.getElementById('cat-sheet-title-primary');
  const elSheetTitleSecondary = document.getElementById('cat-sheet-title-secondary');
  const elSheetDescPrimary = document.getElementById('cat-sheet-desc-primary');
  const elSheetDescSecondary = document.getElementById('cat-sheet-desc-secondary');
  const elSheetDl = document.getElementById('cat-sheet-dl');

  // Lightbox DOM
  const elLightbox = document.getElementById('cat-lightbox');
  const elLbClose = document.getElementById('cat-lb-close');
  const elLbPrev = document.getElementById('cat-lb-prev');
  const elLbNext = document.getElementById('cat-lb-next');
  const elLbCanvas = document.getElementById('cat-lb-canvas');
  const elLbImg = document.getElementById('cat-lb-img');
  const elLbKicker = document.getElementById('cat-lb-kicker');
  const elLbTitle = document.getElementById('cat-lb-title');
  const elLbDesc = document.getElementById('cat-lb-desc');
  const elLbObjLink = document.getElementById('cat-lb-obj-link');
  const elLbGlobeLink = document.getElementById('cat-lb-globe-link');

  function populateSelectControls() {
    // 1. Museum Select
    elMuseumSelect.replaceChildren();
    const optAllM = document.createElement('option');
    optAllM.value = 'all';
    optAllM.textContent = t('allMuseumsOpt') + ' (45,008)';
    elMuseumSelect.appendChild(optAllM);
    for (let i = 0; i < SUPPORTED_MUSEUMS.length; i++) {
      const mid = SUPPORTED_MUSEUMS[i];
      const m = MUSEUMS[mid];
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      let mCnt = 0;
      for (let r = 0; r < m.countriesSpec.length; r++) mCnt += m.countriesSpec[r][2];
      const opt = document.createElement('option');
      opt.value = mid;
      opt.textContent = mc.shortName + ' (' + fmtNum(mCnt) + ')';
      elMuseumSelect.appendChild(opt);
    }
    elMuseumSelect.value = state.museumFilter;

    // 2. Country Select
    elCountrySelect.replaceChildren();
    const optAllC = document.createElement('option');
    optAllC.value = 'all';
    optAllC.textContent = t('allHomelandsOpt');
    elCountrySelect.appendChild(optAllC);
    for (let i = 0; i < state.homelands.length; i++) {
      const hm = state.homelands[i];
      const opt = document.createElement('option');
      opt.value = hm.en;
      opt.textContent = countryDisplay(hm.en, hm.zh) + ' (' + fmtNum(hm.totalCount) + ')';
      elCountrySelect.appendChild(opt);
    }
    elCountrySelect.value = state.countryFilter;

    // 3. Era Select
    elEraSelect.replaceChildren();
    const optAllE = document.createElement('option');
    optAllE.value = 'all';
    optAllE.textContent = t('allErasOpt');
    elEraSelect.appendChild(optAllE);
    for (let i = 0; i < ERAS.length; i++) {
      const er = ERAS[i];
      const opt = document.createElement('option');
      opt.value = er.id;
      opt.textContent = state.lang === 'zh' ? er.nameZh : er.nameEn;
      elEraSelect.appendChild(opt);
    }
    elEraSelect.value = state.eraFilter;

    // 4. Tier Select
    elTierSelect.replaceChildren();
    const tierOpts = [
      ['all', t('tierAll')],
      ['curated', t('tierCurated')],
      ['study', t('tierStudy')]
    ];
    for (let i = 0; i < tierOpts.length; i++) {
      const opt = document.createElement('option');
      opt.value = tierOpts[i][0];
      opt.textContent = tierOpts[i][1];
      elTierSelect.appendChild(opt);
    }
    elTierSelect.value = state.tierFilter;

    // 5. Provenance Select
    elProvSelect.replaceChildren();
    const provOpts = [
      ['all', t('provAll')],
      ['intl', t('provIntl')],
      ['host', t('provHost')]
    ];
    for (let i = 0; i < provOpts.length; i++) {
      const opt = document.createElement('option');
      opt.value = provOpts[i][0];
      opt.textContent = provOpts[i][1];
      elProvSelect.appendChild(opt);
    }
    elProvSelect.value = state.provFilter;

    // 6. Sort Select
    elSortSelect.replaceChildren();
    const sortOpts = [
      ['curated', t('sortCurated')],
      ['index', t('sortIndex')],
      ['oldest', t('sortOldest')],
      ['newest', t('sortNewest')],
      ['acq_asc', t('sortAcqAsc')],
      ['acq_desc', t('sortAcqDesc')],
      ['country', t('sortCountry')]
    ];
    for (let i = 0; i < sortOpts.length; i++) {
      const opt = document.createElement('option');
      opt.value = sortOpts[i][0];
      opt.textContent = sortOpts[i][1];
      elSortSelect.appendChild(opt);
    }
    elSortSelect.value = state.sortBy;
  }

  function applyFilterAndSort() {
    const q = state.searchQuery.toLowerCase();
    const qTerms = q ? q.split(/\s+/).filter(Boolean) : [];
    const mFilter = state.museumFilter;
    const cFilter = state.countryFilter;
    const eFilter = state.eraFilter;
    const tFilter = state.tierFilter;
    const pFilter = state.provFilter;

    const matched = [];
    const museumCountsNoMFilter = {};
    for (let i = 0; i < SUPPORTED_MUSEUMS.length; i++) museumCountsNoMFilter[SUPPORTED_MUSEUMS[i]] = 0;
    let totalNoMFilter = 0;

    for (let i = 0; i < state.allRecords.length; i++) {
      const rec = state.allRecords[i];
      if (cFilter !== 'all' && rec.countryEn !== cFilter) continue;
      if (eFilter !== 'all' && rec.eraId !== eFilter) continue;
      if (tFilter === 'curated' && !rec.isCurated) continue;
      if (tFilter === 'study' && rec.isCurated) continue;
      if (pFilter === 'intl' && rec.isHost) continue;
      if (pFilter === 'host' && !rec.isHost) continue;

      if (qTerms.length) {
        let ok = true;
        for (let w = 0; w < qTerms.length; w++) {
          if (!rec.searchBlob.includes(qTerms[w])) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
      }

      museumCountsNoMFilter[rec.museumId] = (museumCountsNoMFilter[rec.museumId] || 0) + 1;
      totalNoMFilter++;

      if (mFilter !== 'all' && rec.museumId !== mFilter) continue;
      matched.push(rec);
    }

    const sortMode = state.sortBy;
    if (sortMode === 'curated') {
      matched.sort((a, b) => (Number(b.isCurated) - Number(a.isCurated)) || (a.globalIndex - b.globalIndex));
    } else if (sortMode === 'index') {
      matched.sort((a, b) => a.globalIndex - b.globalIndex);
    } else if (sortMode === 'oldest') {
      matched.sort((a, b) => (a.startYr - b.startYr) || (Number(b.isCurated) - Number(a.isCurated)) || (a.globalIndex - b.globalIndex));
    } else if (sortMode === 'newest') {
      matched.sort((a, b) => (b.endYr - a.endYr) || (Number(b.isCurated) - Number(a.isCurated)) || (a.globalIndex - b.globalIndex));
    } else if (sortMode === 'acq_asc') {
      matched.sort((a, b) => (a.acqYear - b.acqYear) || (Number(b.isCurated) - Number(a.isCurated)) || (a.globalIndex - b.globalIndex));
    } else if (sortMode === 'acq_desc') {
      matched.sort((a, b) => (b.acqYear - a.acqYear) || (Number(b.isCurated) - Number(a.isCurated)) || (a.globalIndex - b.globalIndex));
    } else if (sortMode === 'country') {
      matched.sort((a, b) => a.countryDisplayEn.localeCompare(b.countryDisplayEn) || (Number(b.isCurated) - Number(a.isCurated)) || (a.globalIndex - b.globalIndex));
    }

    state.filtered = matched;
    const totalPages = Math.max(1, Math.ceil(matched.length / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    if (state.page < 1) state.page = 1;

    renderKpisAndMuseumPills(matched, museumCountsNoMFilter, totalNoMFilter);
    renderActiveFilterChips();
    renderDirectoryPage();
    syncUrlHash();
  }

  function renderKpisAndMuseumPills(matched, museumCountsNoMFilter, totalNoMFilter) {
    let curatedCnt = 0;
    let hostCnt = 0;
    const musSet = new Set();
    const countrySet = new Set();

    for (let i = 0; i < matched.length; i++) {
      const r = matched[i];
      if (r.isCurated) curatedCnt++;
      if (r.isHost) hostCnt++;
      musSet.add(r.museumId);
      countrySet.add(r.countryEn);
    }
    const intlCnt = matched.length - hostCnt;

    elKpiMatching.textContent = fmtNum(matched.length);
    elKpiCurated.textContent = fmtNum(curatedCnt);
    elKpiMuseums.textContent = fmtNum(musSet.size) + ' / 10';
    elKpiCountries.textContent = fmtNum(countrySet.size) + ' / ' + fmtNum(state.homelands.length);
    elKpiIntlHost.textContent = fmtNum(intlCnt) + ' / ' + fmtNum(hostCnt);

    elMuseumPills.replaceChildren();
    const frag = document.createDocumentFragment();

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'cat-mpill' + (state.museumFilter === 'all' ? ' active' : '');
    const allTxt = document.createElement('span');
    allTxt.textContent = t('allMuseumsOpt');
    const allCnt = document.createElement('span');
    allCnt.className = 'cat-mpill-cnt';
    allCnt.textContent = fmtNum(totalNoMFilter);
    allBtn.appendChild(allTxt);
    allBtn.appendChild(allCnt);
    allBtn.addEventListener('click', () => {
      state.museumFilter = 'all';
      elMuseumSelect.value = 'all';
      state.page = 1;
      applyFilterAndSort();
    });
    frag.appendChild(allBtn);

    for (let i = 0; i < SUPPORTED_MUSEUMS.length; i++) {
      const mid = SUPPORTED_MUSEUMS[i];
      const m = MUSEUMS[mid];
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat-mpill' + (state.museumFilter === mid ? ' active' : '');
      const nm = document.createElement('span');
      nm.textContent = mc.shortName;
      const cnt = document.createElement('span');
      cnt.className = 'cat-mpill-cnt';
      cnt.textContent = fmtNum(museumCountsNoMFilter[mid] || 0);
      btn.appendChild(nm);
      btn.appendChild(cnt);
      btn.addEventListener('click', () => {
        state.museumFilter = state.museumFilter === mid ? 'all' : mid;
        elMuseumSelect.value = state.museumFilter;
        state.page = 1;
        applyFilterAndSort();
      });
      frag.appendChild(btn);
    }
    elMuseumPills.appendChild(frag);
  }

  function renderActiveFilterChips() {
    elActiveChips.replaceChildren();
    const chips = [];
    if (state.museumFilter !== 'all') {
      const m = MUSEUMS[state.museumFilter];
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      chips.push({ label: mc.shortName + ' ×', clear: () => { state.museumFilter = 'all'; elMuseumSelect.value = 'all'; } });
    }
    if (state.countryFilter !== 'all') {
      const hm = state.homelands.find(h => h.en === state.countryFilter);
      chips.push({ label: countryDisplay(state.countryFilter, hm ? hm.zh : '') + ' ×', clear: () => { state.countryFilter = 'all'; elCountrySelect.value = 'all'; } });
    }
    if (state.eraFilter !== 'all') {
      const er = getEraMeta(state.eraFilter);
      chips.push({ label: (state.lang === 'zh' ? er.shortZh : er.shortEn) + ' ×', clear: () => { state.eraFilter = 'all'; elEraSelect.value = 'all'; } });
    }
    if (state.tierFilter !== 'all') {
      chips.push({ label: (state.tierFilter === 'curated' ? t('starMasterpiece') : 'Study') + ' ×', clear: () => { state.tierFilter = 'all'; elTierSelect.value = 'all'; } });
    }
    if (state.provFilter !== 'all') {
      chips.push({ label: (state.provFilter === 'host' ? t('hostBadge') : 'Overseas') + ' ×', clear: () => { state.provFilter = 'all'; elProvSelect.value = 'all'; } });
    }
    if (state.searchQuery) {
      chips.push({ label: '"' + state.searchQuery + '" ×', clear: () => { state.searchQuery = ''; elSearchInput.value = ''; elSearchClear.classList.add('is-hidden'); } });
    }

    for (let i = 0; i < chips.length; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-filter-tag';
      b.textContent = chips[i].label;
      b.addEventListener('click', () => {
        chips[i].clear();
        state.page = 1;
        applyFilterAndSort();
      });
      elActiveChips.appendChild(b);
    }
  }

  function renderPager(container, totalItems, totalPages) {
    container.replaceChildren();
    if (totalItems === 0 || totalPages <= 1) return;

    const frag = document.createDocumentFragment();
    const mkBtn = (label, targetPage, disabled, isActive) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-page-btn' + (isActive ? ' active' : '');
      b.textContent = label;
      b.disabled = Boolean(disabled);
      if (!disabled && !isActive) {
        b.addEventListener('click', () => {
          state.page = targetPage;
          renderDirectoryPage();
          document.getElementById('cat-directory-section').scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
        });
      }
      return b;
    };

    frag.appendChild(mkBtn('«', 1, state.page === 1, false));
    frag.appendChild(mkBtn('‹', state.page - 1, state.page === 1, false));

    const pages = [];
    pages.push(1);
    for (let p = Math.max(2, state.page - 2); p <= Math.min(totalPages - 1, state.page + 2); p++) {
      pages.push(p);
    }
    if (totalPages > 1) pages.push(totalPages);

    let prev = 0;
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i];
      if (p - prev > 1) {
        const ell = document.createElement('span');
        ell.className = 'cat-page-ellipsis';
        ell.textContent = '…';
        frag.appendChild(ell);
      }
      frag.appendChild(mkBtn(fmtNum(p), p, false, p === state.page));
      prev = p;
    }

    frag.appendChild(mkBtn('›', state.page + 1, state.page === totalPages, false));
    frag.appendChild(mkBtn('»', totalPages, state.page === totalPages, false));
    container.appendChild(frag);
  }

  function renderDirectoryPage() {
    const total = state.filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    const startIdx = (state.page - 1) * state.pageSize;
    const endIdx = Math.min(total, startIdx + state.pageSize);
    const slice = state.filtered.slice(startIdx, endIdx);

    if (total === 0) {
      elRangeSummary.textContent = state.lang === 'zh' ? '共匹配 0 件文物' : '0 matching artifacts';
      elTableWrap.classList.add('is-hidden');
      elCardsGrid.classList.add('is-hidden');
      elEmptyState.classList.remove('is-hidden');
      elPagerTop.replaceChildren();
      elPagerBottom.replaceChildren();
      return;
    }

    elEmptyState.classList.add('is-hidden');
    elRangeSummary.textContent = state.lang === 'zh'
      ? ('当前显示第 ' + fmtNum(startIdx + 1) + '–' + fmtNum(endIdx) + ' 件（共 ' + fmtNum(total) + ' 件） · 第 ' + fmtNum(state.page) + ' / ' + fmtNum(totalPages) + ' 页')
      : ('Showing #' + fmtNum(startIdx + 1) + '–' + fmtNum(endIdx) + ' of ' + fmtNum(total) + ' artifacts · Page ' + fmtNum(state.page) + ' of ' + fmtNum(totalPages));

    renderPager(elPagerTop, total, totalPages);
    renderPager(elPagerBottom, total, totalPages);

    if (state.viewMode === 'table') {
      elTableWrap.classList.remove('is-hidden');
      elCardsGrid.classList.add('is-hidden');
      renderTableSlice(slice);
    } else {
      elTableWrap.classList.add('is-hidden');
      elCardsGrid.classList.remove('is-hidden');
      renderCardsSlice(slice);
    }
  }

  function renderTableSlice(slice) {
    elTableBody.replaceChildren();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < slice.length; i++) {
      const rec = slice[i];
      const tr = document.createElement('tr');
      if (rec.isCurated) tr.className = 'is-curated-row';
      tr.addEventListener('click', (ev) => {
        if (ev.target.closest('button') || ev.target.closest('a')) return;
        openRecordSheet(rec);
      });

      // 1. Index & Tier
      const tdIdx = document.createElement('td');
      tdIdx.className = 'col-idx';
      const gIdx = document.createElement('div');
      gIdx.className = 'row-global-idx';
      gIdx.textContent = '#' + String(rec.globalIndex).padStart(5, '0');
      const lIdx = document.createElement('span');
      lIdx.className = 'row-local-idx';
      lIdx.textContent = MUSEUM_ABBR[rec.museumId] + ' #' + (rec.museumLocalId + 1);
      tdIdx.appendChild(gIdx);
      tdIdx.appendChild(lIdx);
      if (rec.isCurated) {
        const star = document.createElement('span');
        star.className = 'tier-star-badge';
        star.textContent = t('starMasterpiece');
        tdIdx.appendChild(star);
      }

      // 2. Plate Photo
      const tdPhoto = document.createElement('td');
      tdPhoto.className = 'col-photo';
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.className = 'row-thumb-btn';
      thumbBtn.setAttribute('aria-label', rec.titleEn);
      const cvs = document.createElement('canvas');
      cvs.width = 64;
      cvs.height = 64;
      drawPlateOnCanvas(cvs, rec.museumId, rec.sprite, true);
      thumbBtn.appendChild(cvs);
      thumbBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        openLightbox(rec);
      });
      tdPhoto.appendChild(thumbBtn);

      // 3. Bilingual Title, Material & Description
      const tdTitle = document.createElement('td');
      tdTitle.className = 'col-title';
      const tPrim = document.createElement('div');
      tPrim.className = 'row-title-primary';
      tPrim.textContent = state.lang === 'zh' ? rec.titleZh : rec.titleEn;
      const tSec = document.createElement('div');
      tSec.className = 'row-title-secondary';
      tSec.textContent = state.lang === 'zh' ? rec.titleEn : rec.titleZh;
      const matLine = document.createElement('div');
      matLine.className = 'row-mat-line';
      matLine.textContent = state.lang === 'zh' ? rec.materialZh : rec.materialEn;
      const descLine = document.createElement('div');
      descLine.className = 'row-desc-snippet';
      descLine.textContent = state.lang === 'zh' ? rec.descZh : rec.descEn;
      tdTitle.appendChild(tPrim);
      tdTitle.appendChild(tSec);
      tdTitle.appendChild(matLine);
      tdTitle.appendChild(descLine);

      // 4. Origin Homeland
      const tdOrigin = document.createElement('td');
      const originBtn = document.createElement('button');
      originBtn.type = 'button';
      originBtn.className = 'row-filter-link';
      originBtn.textContent = countryDisplay(rec.countryEn, rec.countryZh);
      originBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        state.countryFilter = rec.countryEn;
        elCountrySelect.value = rec.countryEn;
        state.page = 1;
        applyFilterAndSort();
      });
      tdOrigin.appendChild(originBtn);
      if (rec.isHost) {
        const hb = document.createElement('span');
        hb.className = 'host-badge';
        hb.textContent = t('hostBadge');
        tdOrigin.appendChild(hb);
      }
      const origSub = document.createElement('span');
      origSub.className = 'row-sub-meta';
      origSub.textContent = state.lang === 'zh' ? rec.countryDisplayEn : rec.countryZh;
      tdOrigin.appendChild(origSub);

      // 5. Museum & Gallery
      const tdMuseum = document.createElement('td');
      const musBtn = document.createElement('button');
      musBtn.type = 'button';
      musBtn.className = 'row-filter-link';
      musBtn.textContent = state.lang === 'zh' ? rec.mShortZh : rec.mShortEn;
      musBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        state.museumFilter = rec.museumId;
        elMuseumSelect.value = rec.museumId;
        state.page = 1;
        applyFilterAndSort();
      });
      const roomSub = document.createElement('span');
      roomSub.className = 'row-sub-meta';
      roomSub.textContent = (state.lang === 'zh' ? rec.mCityZh : rec.mCityEn) + ' · ' + (state.lang === 'zh' ? rec.roomZh : rec.roomEn);
      tdMuseum.appendChild(musBtn);
      tdMuseum.appendChild(roomSub);

      // 6. Creation Date & Era
      const tdCreated = document.createElement('td');
      tdCreated.className = 'col-created';
      const dBadge = document.createElement('div');
      dBadge.className = 'row-date-badge';
      dBadge.textContent = formatDateLocalized(rec.dateRaw);
      const eraMeta = getEraMeta(rec.eraId);
      const eraSub = document.createElement('span');
      eraSub.className = 'row-sub-meta';
      eraSub.textContent = state.lang === 'zh' ? eraMeta.shortZh : eraMeta.shortEn;
      tdCreated.appendChild(dBadge);
      tdCreated.appendChild(eraSub);

      // 7. Acquisition Year
      const tdAcq = document.createElement('td');
      tdAcq.className = 'col-acq';
      const acqSpan = document.createElement('span');
      acqSpan.className = 'row-date-badge';
      acqSpan.textContent = state.lang === 'zh' ? (rec.acqYear + '年') : String(rec.acqYear);
      tdAcq.appendChild(acqSpan);

      // 8. Inventory / Reg No.
      const tdReg = document.createElement('td');
      tdReg.className = 'col-reg';
      const regCode = document.createElement('span');
      regCode.className = 'row-reg-code';
      regCode.textContent = rec.reg;
      tdReg.appendChild(regCode);

      // 9. Actions
      const tdAct = document.createElement('td');
      tdAct.className = 'col-actions';
      const actWrap = document.createElement('div');
      actWrap.className = 'row-actions-wrap';

      const inspBtn = document.createElement('button');
      inspBtn.type = 'button';
      inspBtn.className = 'row-act-btn';
      inspBtn.textContent = t('inspectBtn');
      inspBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        openRecordSheet(rec);
      });

      const globeA = document.createElement('a');
      globeA.className = 'row-act-link';
      globeA.href = buildGlobeDeepLink(rec);
      globeA.textContent = t('globeShortBtn');

      const extA = document.createElement('a');
      extA.className = 'row-act-link';
      extA.href = buildArtifactObjUrl(rec);
      extA.target = '_blank';
      extA.rel = 'noopener noreferrer';
      extA.textContent = t('recordShortBtn');

      actWrap.appendChild(inspBtn);
      actWrap.appendChild(globeA);
      actWrap.appendChild(extA);
      tdAct.appendChild(actWrap);

      tr.appendChild(tdIdx);
      tr.appendChild(tdPhoto);
      tr.appendChild(tdTitle);
      tr.appendChild(tdOrigin);
      tr.appendChild(tdMuseum);
      tr.appendChild(tdCreated);
      tr.appendChild(tdAcq);
      tr.appendChild(tdReg);
      tr.appendChild(tdAct);
      frag.appendChild(tr);
    }

    elTableBody.appendChild(frag);
  }

  function renderCardsSlice(slice) {
    elCardsGrid.replaceChildren();
    const frag = document.createDocumentFragment();

    for (let i = 0; i < slice.length; i++) {
      const rec = slice[i];
      const card = document.createElement('article');
      card.className = 'cat-card';

      const plateBtn = document.createElement('button');
      plateBtn.type = 'button';
      plateBtn.className = 'cat-card-plate';
      plateBtn.setAttribute('aria-label', rec.titleEn);
      const cvs = document.createElement('canvas');
      cvs.width = 320;
      cvs.height = 320;
      drawPlateOnCanvas(cvs, rec.museumId, rec.sprite);
      plateBtn.appendChild(cvs);

      const topBadges = document.createElement('div');
      topBadges.className = 'cat-card-top-badges';
      const idxPill = document.createElement('span');
      idxPill.className = 'cat-card-idx-pill';
      idxPill.textContent = '#' + String(rec.globalIndex).padStart(5, '0') + ' · ' + rec.reg;
      topBadges.appendChild(idxPill);
      if (rec.isCurated) {
        const st = document.createElement('span');
        st.className = 'tier-star-badge';
        st.textContent = t('starMasterpiece');
        topBadges.appendChild(st);
      }
      plateBtn.appendChild(topBadges);
      plateBtn.addEventListener('click', () => openRecordSheet(rec));

      const body = document.createElement('div');
      body.className = 'cat-card-body';

      const upper = document.createElement('div');
      const metaLine = document.createElement('div');
      metaLine.className = 'cat-card-meta-line';
      metaLine.textContent = countryDisplay(rec.countryEn, rec.countryZh) + ' · ' +
        (state.lang === 'zh' ? rec.mShortZh : rec.mShortEn) + ' · ' +
        formatDateLocalized(rec.dateRaw) + ' · ' +
        (state.lang === 'zh' ? (rec.acqYear + '年入藏') : ('Acq. ' + rec.acqYear));

      const h3 = document.createElement('h3');
      h3.className = 'cat-card-title';
      h3.textContent = state.lang === 'zh' ? rec.titleZh : rec.titleEn;

      const sub = document.createElement('div');
      sub.className = 'cat-card-sub';
      sub.textContent = state.lang === 'zh' ? rec.titleEn : rec.titleZh;

      const mat = document.createElement('div');
      mat.className = 'cat-card-mat';
      mat.textContent = (state.lang === 'zh' ? rec.materialZh : rec.materialEn) + ' · ' + (state.lang === 'zh' ? rec.roomZh : rec.roomEn);

      const desc = document.createElement('p');
      desc.className = 'cat-card-desc';
      desc.textContent = state.lang === 'zh' ? rec.descZh : rec.descEn;

      upper.appendChild(metaLine);
      upper.appendChild(h3);
      upper.appendChild(sub);
      upper.appendChild(mat);
      upper.appendChild(desc);

      const acts = document.createElement('div');
      acts.className = 'cat-card-actions';

      const insp = document.createElement('button');
      insp.type = 'button';
      insp.className = 'row-act-btn';
      insp.textContent = t('inspectBtn');
      insp.addEventListener('click', () => openRecordSheet(rec));

      const gl = document.createElement('a');
      gl.className = 'row-act-link';
      gl.href = buildGlobeDeepLink(rec);
      gl.textContent = t('globeShortBtn');

      const ex = document.createElement('a');
      ex.className = 'row-act-link';
      ex.href = buildArtifactObjUrl(rec);
      ex.target = '_blank';
      ex.rel = 'noopener noreferrer';
      ex.textContent = t('recordShortBtn');

      acts.appendChild(insp);
      acts.appendChild(gl);
      acts.appendChild(ex);

      body.appendChild(upper);
      body.appendChild(acts);
      card.appendChild(plateBtn);
      card.appendChild(body);
      frag.appendChild(card);
    }

    elCardsGrid.appendChild(frag);
  }

  function renderCrossTabMatrix() {
    elMatrixHead.replaceChildren();
    elMatrixBody.replaceChildren();
    elMatrixFoot.replaceChildren();

    const trH = document.createElement('tr');
    const thOrigin = document.createElement('th');
    thOrigin.textContent = t('mxColHomeland') + ' (' + state.homelands.length + ')';
    trH.appendChild(thOrigin);

    const colTotals = {};
    for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
      const mid = SUPPORTED_MUSEUMS[mIdx];
      colTotals[mid] = 0;
      const th = document.createElement('th');
      const m = MUSEUMS[mid];
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      th.textContent = state.lang === 'zh' ? mc.shortName : MUSEUM_ABBR[mid];
      th.title = mc.name;
      trH.appendChild(th);
    }

    const thTotal = document.createElement('th');
    thTotal.textContent = t('mxColTotal');
    const thCur = document.createElement('th');
    thCur.textContent = t('mxColMasterpieces');
    trH.appendChild(thTotal);
    trH.appendChild(thCur);
    elMatrixHead.appendChild(trH);

    const bodyFrag = document.createDocumentFragment();
    let grandTotal = 0;
    let grandCurated = 0;

    for (let i = 0; i < state.homelands.length; i++) {
      const hm = state.homelands[i];
      grandTotal += hm.totalCount;
      grandCurated += hm.curatedCount;

      const tr = document.createElement('tr');
      const tdName = document.createElement('td');
      const cBtn = document.createElement('button');
      cBtn.type = 'button';
      cBtn.className = 'row-filter-link';
      cBtn.textContent = (i + 1) + '. ' + countryDisplay(hm.en, hm.zh);
      cBtn.addEventListener('click', () => {
        state.countryFilter = hm.en;
        state.museumFilter = 'all';
        elCountrySelect.value = hm.en;
        elMuseumSelect.value = 'all';
        state.page = 1;
        applyFilterAndSort();
        document.getElementById('cat-directory-section').scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
      });
      tdName.appendChild(cBtn);
      tr.appendChild(tdName);

      for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
        const mid = SUPPORTED_MUSEUMS[mIdx];
        const val = hm.byMuseum[mid] || 0;
        colTotals[mid] += val;
        const td = document.createElement('td');
        const m = MUSEUMS[mid];
        if (m.hostCountryEn === hm.en && val > 0) {
          td.className = 'mx-cell-host';
        }
        if (val > 0) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'mx-cell-btn';
          b.textContent = fmtNum(val);
          b.addEventListener('click', () => {
            state.countryFilter = hm.en;
            state.museumFilter = mid;
            elCountrySelect.value = hm.en;
            elMuseumSelect.value = mid;
            state.page = 1;
            applyFilterAndSort();
            document.getElementById('cat-directory-section').scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
          });
          td.appendChild(b);
        } else {
          td.className = 'mx-zero';
          td.textContent = '—';
        }
        tr.appendChild(td);
      }

      const tdTot = document.createElement('td');
      tdTot.textContent = fmtNum(hm.totalCount);
      const tdCur = document.createElement('td');
      tdCur.textContent = hm.curatedCount > 0 ? ('★ ' + fmtNum(hm.curatedCount)) : '—';
      tr.appendChild(tdTot);
      tr.appendChild(tdCur);
      bodyFrag.appendChild(tr);
    }
    elMatrixBody.appendChild(bodyFrag);

    const trF = document.createElement('tr');
    const tdFootLbl = document.createElement('td');
    tdFootLbl.textContent = t('mxGrandTotal');
    trF.appendChild(tdFootLbl);
    for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
      const td = document.createElement('td');
      td.textContent = fmtNum(colTotals[SUPPORTED_MUSEUMS[mIdx]]);
      trF.appendChild(td);
    }
    const tdGrand = document.createElement('td');
    tdGrand.textContent = fmtNum(grandTotal);
    const tdGrandCur = document.createElement('td');
    tdGrandCur.textContent = '★ ' + fmtNum(grandCurated);
    trF.appendChild(tdGrand);
    trF.appendChild(tdGrandCur);
    elMatrixFoot.appendChild(trF);
  }

  function openRecordSheet(rec) {
    state.activeRecord = rec;
    const m = MUSEUMS[rec.museumId] || MUSEUMS.bm;
    const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
    const eraMeta = getEraMeta(rec.eraId);

    elSheetBadges.replaceChildren();
    const mkPill = (txt, extraCls) => {
      const s = document.createElement('span');
      s.className = 'modal-pill' + (extraCls ? (' ' + extraCls) : '');
      s.textContent = txt;
      return s;
    };
    elSheetBadges.appendChild(mkPill('#' + String(rec.globalIndex).padStart(5, '0')));
    if (rec.isCurated) elSheetBadges.appendChild(mkPill(t('starMasterpiece'), 'modal-pill-museum'));
    elSheetBadges.appendChild(mkPill(countryDisplay(rec.countryEn, rec.countryZh) + (rec.isHost ? (' · ' + t('hostBadge')) : '')));
    elSheetBadges.appendChild(mkPill(mc.shortName));
    elSheetBadges.appendChild(mkPill(rec.reg));

    const posInFiltered = state.filtered.indexOf(rec);
    elSheetPos.textContent = posInFiltered >= 0
      ? (fmtNum(posInFiltered + 1) + ' / ' + fmtNum(state.filtered.length))
      : ('#' + fmtNum(rec.globalIndex) + ' / 45,008');

    drawPlateOnCanvas(elSheetCanvas, rec.museumId, rec.sprite);
    elSheetHdImg.classList.remove('loaded');
    elSheetHdImg.removeAttribute('src');
    const hdUrl = m.hdPhotoUrls && m.hdPhotoUrls[rec.sprite];
    if (hdUrl && !navigator.webdriver && hdUrl.startsWith('https://')) {
      elSheetHdImg.onload = () => {
        if (state.activeRecord === rec) elSheetHdImg.classList.add('loaded');
      };
      elSheetHdImg.src = hdUrl;
    }

    elSheetTitlePrimary.textContent = state.lang === 'zh' ? rec.titleZh : rec.titleEn;
    elSheetTitleSecondary.textContent = state.lang === 'zh' ? rec.titleEn : rec.titleZh;
    elSheetDescPrimary.textContent = state.lang === 'zh' ? rec.descZh : rec.descEn;
    elSheetDescSecondary.textContent = state.lang === 'zh' ? rec.descEn : rec.descZh;

    elSheetGlobeLink.href = buildGlobeDeepLink(rec);
    elSheetAgeLink.href = buildCreationAgeDeepLink(rec);
    elSheetObjLink.href = buildArtifactObjUrl(rec);
    elSheetObjLink.textContent = mc.viewObjBtn;
    elSheetCatLink.href = rec.catUrl;
    elSheetCatLink.textContent = countryDisplay(rec.countryEn, rec.countryZh) + ' ' + (state.lang === 'zh' ? '馆藏目录 ↗' : 'Catalogue ↗');

    elSheetDl.replaceChildren();
    const fields = state.lang === 'zh'
      ? [
          ['总名录序号 / 馆内序号', '#' + String(rec.globalIndex).padStart(5, '0') + '  (' + MUSEUM_ABBR[rec.museumId] + ' #' + (rec.museumLocalId + 1) + ')'],
          ['官方馆藏登记号', rec.reg],
          ['收藏博物馆与城市', rec.mFullZh + ' · ' + rec.mCityZh],
          ['展厅 / 馆藏部门', rec.roomZh],
          ['文物原属国与坐标', rec.countryZh + ' (' + rec.countryDisplayEn + ') · ' + rec.centerLat.toFixed(2) + '°, ' + rec.centerLon.toFixed(2) + '°'],
          ['流散与馆藏属性', rec.isHost ? '本馆所在国本土馆藏 (Domestic Host Collection)' : '跨国海外来源馆藏 (International Provenance)'],
          ['诞生年代与历史时期', formatDateLocalized(rec.dateRaw) + ' · ' + eraMeta.nameZh],
          ['博物馆入藏年份', rec.acqYear + ' 年入藏'],
          ['材质与工艺 (中文)', rec.materialZh],
          ['材质与工艺 (English)', rec.materialEn]
        ]
      : [
          ['Master Index / Museum Index', '#' + String(rec.globalIndex).padStart(5, '0') + '  (' + MUSEUM_ABBR[rec.museumId] + ' #' + (rec.museumLocalId + 1) + ')'],
          ['Inventory / Registration No.', rec.reg],
          ['Holding Museum & Host City', rec.mFullEn + ' · ' + rec.mCityEn],
          ['Gallery / Study Department', rec.roomEn],
          ['Origin Homeland & Coordinates', rec.countryDisplayEn + ' (' + rec.countryZh + ') · ' + rec.centerLat.toFixed(2) + '°, ' + rec.centerLon.toFixed(2) + '°'],
          ['Provenance Classification', rec.isHost ? 'Domestic Host-Country Collection' : 'International / Cross-Border Provenance'],
          ['Creation Date & Era', rec.dateRaw + ' · ' + eraMeta.nameEn],
          ['Museum Acquisition Year', 'Acquired ' + rec.acqYear],
          ['Medium & Material (English)', rec.materialEn],
          ['Medium & Material (中文)', rec.materialZh]
        ];

    for (let i = 0; i < fields.length; i++) {
      const box = document.createElement('div');
      box.className = 'cat-dl-item';
      const dt = document.createElement('dt');
      dt.textContent = fields[i][0];
      const dd = document.createElement('dd');
      dd.textContent = fields[i][1];
      box.appendChild(dt);
      box.appendChild(dd);
      elSheetDl.appendChild(box);
    }

    elRecordModal.classList.add('open');
  }

  function stepRecordSheet(delta) {
    if (!state.activeRecord) return;
    const pool = state.filtered.length ? state.filtered : state.allRecords;
    const idx = pool.indexOf(state.activeRecord);
    const next = pool[((idx >= 0 ? idx : 0) + delta + pool.length) % pool.length];
    openRecordSheet(next);
  }

  function openLightbox(rec) {
    state.lightboxRecord = rec;
    const m = MUSEUMS[rec.museumId] || MUSEUMS.bm;
    const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
    drawPlateOnCanvas(elLbCanvas, rec.museumId, rec.sprite);
    elLbImg.onload = null;
    elLbImg.onerror = null;
    elLbImg.classList.remove('loaded');
    elLbImg.removeAttribute('src');
    const hdUrl = m.hdPhotoUrls && m.hdPhotoUrls[rec.sprite];
    if (hdUrl && !navigator.webdriver && hdUrl.startsWith('https://')) {
      elLbImg.onload = () => {
        if (state.lightboxRecord === rec) elLbImg.classList.add('loaded');
      };
      elLbImg.onerror = () => {
        elLbImg.classList.remove('loaded');
      };
      elLbImg.src = hdUrl;
    }
    elLbKicker.textContent = '#' + String(rec.globalIndex).padStart(5, '0') + ' · ' + rec.reg + ' · ' +
      countryDisplay(rec.countryEn, rec.countryZh) + ' · ' + mc.shortName + ' · ' + formatDateLocalized(rec.dateRaw);
    elLbTitle.textContent = state.lang === 'zh' ? rec.titleZh : rec.titleEn;
    elLbDesc.textContent = state.lang === 'zh' ? rec.descZh : rec.descEn;
    elLbObjLink.href = buildArtifactObjUrl(rec);
    elLbObjLink.textContent = mc.openOfficialBtn;
    elLbGlobeLink.href = buildGlobeDeepLink(rec);
    elLightbox.classList.add('open');
  }

  function stepLightbox(delta) {
    if (!state.lightboxRecord) return;
    const pool = state.filtered.length ? state.filtered : state.allRecords;
    const idx = pool.indexOf(state.lightboxRecord);
    const next = pool[((idx >= 0 ? idx : 0) + delta + pool.length) % pool.length];
    openLightbox(next);
  }

  // CSV Formula-Injection Safe Cell Formatter
  function csvCell(val) {
    let s = String(val == null ? '' : val).replace(/\r?\n/g, ' ');
    if (/^[=+\-@\t\r]/.test(s)) {
      s = "'" + s;
    }
    if (/[",]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  function exportFilteredToCsv() {
    const rows = state.filtered;
    if (!rows.length) return;
    const header = [
      'Global_Index', 'Catalogue_Tier', 'Museum_ID', 'Holding_Museum', 'Host_City',
      'Inventory_Number', 'Title_EN', 'Title_ZH', 'Origin_Homeland_EN', 'Origin_Homeland_ZH',
      'Provenance_Type', 'Creation_Date', 'Creation_Era', 'Acquisition_Year',
      'Material_EN', 'Material_ZH', 'Gallery_Room', 'Official_Record_URL'
    ];
    const lines = [header.join(',')];
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const era = getEraMeta(r.eraId);
      lines.push([
        r.globalIndex,
        r.isCurated ? 'Curated_Masterpiece' : 'Study_Catalogue',
        r.museumId,
        csvCell(r.mShortEn),
        csvCell(r.mCityEn),
        csvCell(r.reg),
        csvCell(r.titleEn),
        csvCell(r.titleZh),
        csvCell(r.countryDisplayEn),
        csvCell(r.countryZh),
        r.isHost ? 'Domestic_Host' : 'International',
        csvCell(r.dateRaw),
        csvCell(era.shortEn),
        r.acqYear,
        csvCell(r.materialEn),
        csvCell(r.materialZh),
        csvCell(r.roomEn),
        csvCell(buildArtifactObjUrl(r))
      ].join(','));
    }

    const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'artifacts-archive-catalog-' + rows.length + '-records.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = state.lang === 'zh'
      ? '全部文物总名录 (45,008) · 文物档案库 — 十大世界博物馆完整目录'
      : 'Full Artifact Catalog (45,008) · Artifacts Archive — 10 World Museums';

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

    const provBase = provenancePageBase();
    const stBase = isStandaloneBundle() ? './artifacts-stories.html' : './stories.html';
    const ageBase = creationAgePageBase();
    const langHash = state.lang === 'zh' ? '#lang=zh' : '';
    document.getElementById('cat-brand-back-link').href = provBase + langHash;
    document.getElementById('cat-nav-prov-link').href = provBase + langHash;
    document.getElementById('cat-footer-prov-link').href = provBase + langHash;
    const st1 = document.getElementById('cat-nav-stories-link');
    const st2 = document.getElementById('cat-footer-stories-link');
    if (st1) st1.href = stBase + langHash;
    if (st2) st2.href = stBase + langHash;
    document.getElementById('cat-nav-age-link').href = ageBase + langHash;
    document.getElementById('cat-footer-age-link').href = ageBase + langHash;
  }

  function syncSortableHeadersUI() {
    const ths = document.querySelectorAll('th.th-sortable[data-sort-col]');
    for (let i = 0; i < ths.length; i++) {
      const th = ths[i];
      const col = th.getAttribute('data-sort-col');
      const key = th.getAttribute('data-i18n');
      let arrow = '';
      if (col === 'index' && state.sortBy === 'index') arrow = ' ↑';
      else if (col === 'index' && state.sortBy === 'curated') arrow = ' ★';
      else if (col === 'country' && state.sortBy === 'country') arrow = ' ↑';
      else if (col === 'created' && state.sortBy === 'oldest') arrow = ' ↑';
      else if (col === 'created' && state.sortBy === 'newest') arrow = ' ↓';
      else if (col === 'acquired' && state.sortBy === 'acq_asc') arrow = ' ↑';
      else if (col === 'acquired' && state.sortBy === 'acq_desc') arrow = ' ↓';
      if (key) th.textContent = t(key) + arrow;
    }
  }

  function syncUrlHash() {
    syncSortableHeadersUI();
    if (!window.history || !window.history.replaceState) return;
    const parts = [];
    if (state.lang === 'zh') parts.push('lang=zh');
    if (state.museumFilter !== 'all') parts.push('museum=' + encodeURIComponent(state.museumFilter));
    if (state.countryFilter !== 'all') parts.push('country=' + encodeURIComponent(state.countryFilter));
    if (state.eraFilter !== 'all') parts.push('era=' + encodeURIComponent(state.eraFilter));
    if (state.tierFilter !== 'all') parts.push('tier=' + encodeURIComponent(state.tierFilter));
    if (state.provFilter !== 'all') parts.push('prov=' + encodeURIComponent(state.provFilter));
    if (state.sortBy !== 'curated') parts.push('sort=' + encodeURIComponent(state.sortBy));
    if (state.viewMode === 'cards') parts.push('view=cards');
    if (state.searchQuery) parts.push('q=' + encodeURIComponent(state.searchQuery));
    const hash = parts.length ? ('#' + parts.join('&')) : '';
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search + hash);
    } catch (_) {
      // Ignore sandboxed origin replaceState errors
    }
  }

  function parseInitialHash() {
    const raw = (window.location.hash || '').replace(/^#/, '');
    if (!raw) return null;
    const params = new URLSearchParams(raw);
    if (params.get('lang') === 'zh') state.lang = 'zh';
    const m = params.get('museum');
    if (m && SUPPORTED_MUSEUMS.includes(m)) state.museumFilter = m;
    const c = params.get('country');
    if (c) {
      const cLow = c.toLowerCase();
      const hm = state.homelands.find(h => h.en.toLowerCase() === cLow || h.zh === c);
      if (hm) state.countryFilter = hm.en;
    }
    const er = params.get('era');
    if (er && ERAS.some(e => e.id === er)) state.eraFilter = er;
    const tr = params.get('tier');
    if (tr === 'curated' || tr === 'study') state.tierFilter = tr;
    const pv = params.get('prov');
    if (pv === 'intl' || pv === 'host') state.provFilter = pv;
    const srt = params.get('sort');
    if (['curated', 'index', 'oldest', 'newest', 'acq_asc', 'acq_desc', 'country'].includes(srt)) {
      state.sortBy = srt;
    }
    if (params.get('view') === 'cards') {
      state.viewMode = 'cards';
      elViewCardsBtn.classList.add('active');
      elViewCardsBtn.setAttribute('aria-pressed', 'true');
      elViewTableBtn.classList.remove('active');
      elViewTableBtn.setAttribute('aria-pressed', 'false');
    }
    const q = params.get('q');
    if (q) {
      state.searchQuery = sanitizeQuery(q);
      elSearchInput.value = state.searchQuery;
      elSearchClear.classList.toggle('is-hidden', !state.searchQuery);
    }
    const recNum = parseInt(params.get('record') || '0', 10);
    return (recNum >= 1 && recNum <= state.allRecords.length) ? recNum : null;
  }

  function resetAllFilters() {
    state.museumFilter = 'all';
    state.countryFilter = 'all';
    state.eraFilter = 'all';
    state.tierFilter = 'all';
    state.provFilter = 'all';
    state.sortBy = 'curated';
    state.searchQuery = '';
    state.page = 1;
    elSearchInput.value = '';
    elSearchClear.classList.add('is-hidden');
    populateSelectControls();
    applyFilterAndSort();
  }

  function wireEvents() {
    let searchTimer = null;
    elSearchInput.addEventListener('input', () => {
      const cleaned = sanitizeQuery(elSearchInput.value);
      elSearchClear.classList.toggle('is-hidden', !cleaned);
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        state.searchQuery = cleaned;
        state.page = 1;
        applyFilterAndSort();
      }, 90);
    });

    elSearchClear.addEventListener('click', () => {
      elSearchInput.value = '';
      elSearchClear.classList.add('is-hidden');
      state.searchQuery = '';
      state.page = 1;
      applyFilterAndSort();
    });

    elMuseumSelect.addEventListener('change', () => {
      state.museumFilter = elMuseumSelect.value;
      state.page = 1;
      applyFilterAndSort();
    });
    elCountrySelect.addEventListener('change', () => {
      state.countryFilter = elCountrySelect.value;
      state.page = 1;
      applyFilterAndSort();
    });
    elEraSelect.addEventListener('change', () => {
      state.eraFilter = elEraSelect.value;
      state.page = 1;
      applyFilterAndSort();
    });
    elTierSelect.addEventListener('change', () => {
      state.tierFilter = elTierSelect.value;
      state.page = 1;
      applyFilterAndSort();
    });
    elProvSelect.addEventListener('change', () => {
      state.provFilter = elProvSelect.value;
      state.page = 1;
      applyFilterAndSort();
    });
    elSortSelect.addEventListener('change', () => {
      state.sortBy = elSortSelect.value;
      state.page = 1;
      applyFilterAndSort();
    });

    const sortHeaders = document.querySelectorAll('th.th-sortable[data-sort-col]');
    for (let i = 0; i < sortHeaders.length; i++) {
      sortHeaders[i].addEventListener('click', () => {
        const col = sortHeaders[i].getAttribute('data-sort-col');
        if (col === 'index') {
          state.sortBy = state.sortBy === 'index' ? 'curated' : 'index';
        } else if (col === 'country') {
          state.sortBy = 'country';
        } else if (col === 'created') {
          state.sortBy = state.sortBy === 'oldest' ? 'newest' : 'oldest';
        } else if (col === 'acquired') {
          state.sortBy = state.sortBy === 'acq_asc' ? 'acq_desc' : 'acq_asc';
        }
        elSortSelect.value = state.sortBy;
        state.page = 1;
        applyFilterAndSort();
      });
    }

    elResetBtn.addEventListener('click', resetAllFilters);
    elEmptyResetBtn.addEventListener('click', resetAllFilters);
    elExportCsvBtn.addEventListener('click', exportFilteredToCsv);

    elViewTableBtn.addEventListener('click', () => {
      state.viewMode = 'table';
      elViewTableBtn.classList.add('active');
      elViewTableBtn.setAttribute('aria-pressed', 'true');
      elViewCardsBtn.classList.remove('active');
      elViewCardsBtn.setAttribute('aria-pressed', 'false');
      renderDirectoryPage();
      syncUrlHash();
    });

    elViewCardsBtn.addEventListener('click', () => {
      state.viewMode = 'cards';
      elViewCardsBtn.classList.add('active');
      elViewCardsBtn.setAttribute('aria-pressed', 'true');
      elViewTableBtn.classList.remove('active');
      elViewTableBtn.setAttribute('aria-pressed', 'false');
      renderDirectoryPage();
      syncUrlHash();
    });

    elPageSizeSelect.addEventListener('change', () => {
      const sz = parseInt(elPageSizeSelect.value, 10);
      if (sz === 50 || sz === 100 || sz === 250) {
        state.pageSize = sz;
        state.page = 1;
        renderDirectoryPage();
      }
    });

    const handleJump = () => {
      const num = parseInt(elJumpInput.value, 10);
      if (!num || num < 1) return;
      if (num <= state.filtered.length && state.sortBy === 'index' && state.filtered.length === state.allRecords.length) {
        state.page = Math.ceil(num / state.pageSize);
        renderDirectoryPage();
        openRecordSheet(state.allRecords[num - 1]);
      } else if (num <= state.allRecords.length) {
        const rec = state.allRecords[num - 1];
        const pos = state.filtered.indexOf(rec);
        if (pos >= 0) {
          state.page = Math.floor(pos / state.pageSize) + 1;
          renderDirectoryPage();
        }
        openRecordSheet(rec);
      }
    };
    elJumpBtn.addEventListener('click', handleJump);
    elJumpInput.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') handleJump();
    });

    const langBtns = document.querySelectorAll('.lang-btn[data-lang]');
    for (let i = 0; i < langBtns.length; i++) {
      langBtns[i].addEventListener('click', () => {
        const nextLang = langBtns[i].getAttribute('data-lang') === 'zh' ? 'zh' : 'en';
        if (nextLang === state.lang) return;
        state.lang = nextLang;
        if (nextLang === 'zh') ensureChineseFonts();
        applyTranslations();
        populateSelectControls();
        applyFilterAndSort();
        renderCrossTabMatrix();
        if (state.activeRecord && elRecordModal.classList.contains('open')) {
          openRecordSheet(state.activeRecord);
        }
        if (state.lightboxRecord && elLightbox.classList.contains('open')) {
          openLightbox(state.lightboxRecord);
        }
      });
    }

    // Modal & Lightbox controls
    elSheetClose.addEventListener('click', () => elRecordModal.classList.remove('open'));
    elSheetPrev.addEventListener('click', () => stepRecordSheet(-1));
    elSheetNext.addEventListener('click', () => stepRecordSheet(1));
    elSheetPhotoBtn.addEventListener('click', () => {
      if (state.activeRecord) openLightbox(state.activeRecord);
    });
    elRecordModal.addEventListener('click', (ev) => {
      if (ev.target === elRecordModal) elRecordModal.classList.remove('open');
    });

    elLbClose.addEventListener('click', () => elLightbox.classList.remove('open'));
    elLbPrev.addEventListener('click', () => stepLightbox(-1));
    elLbNext.addEventListener('click', () => stepLightbox(1));
    elLightbox.addEventListener('click', (ev) => {
      if (ev.target === elLightbox) elLightbox.classList.remove('open');
    });

    document.addEventListener('keydown', (ev) => {
      if (elLightbox.classList.contains('open')) {
        if (ev.key === 'Escape') elLightbox.classList.remove('open');
        else if (ev.key === 'ArrowLeft') stepLightbox(-1);
        else if (ev.key === 'ArrowRight') stepLightbox(1);
        return;
      }
      if (elRecordModal.classList.contains('open')) {
        if (ev.key === 'Escape') elRecordModal.classList.remove('open');
        else if (ev.key === 'ArrowLeft') stepRecordSheet(-1);
        else if (ev.key === 'ArrowRight') stepRecordSheet(1);
      }
    });
  }

  // Boot
  generateMasterCatalogue();
  const initialRecordNum = parseInitialHash();
  if (state.lang === 'zh') ensureChineseFonts();
  applyTranslations();
  populateSelectControls();
  wireEvents();
  applyFilterAndSort();
  renderCrossTabMatrix();

  if (initialRecordNum) {
    openRecordSheet(state.allRecords[initialRecordNum - 1]);
  }
})();
