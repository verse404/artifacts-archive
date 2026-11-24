(function () {
  'use strict';

  const DATA = window.MUSEUM_DATA;
  if (!DATA || !DATA.MUSEUMS) return;

  // Load Google Fonts non-blocking on live browsers (skip under offline headless WebDriver)
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
  const SUPPORTED_LANGS = ['en', 'zh'];

  // Extensible UI Localization Dictionary (English & Chinese; museum-specific copy comes from MUSEUMS[id].copy)
  const I18N = {
    en: {
      locale: 'en-US',
      htmlLang: 'en',
      brandPrimary: 'Artifacts Archive',
      navPrologue: '01 · Prologue',
      navGlobe: '02 · 3D Globe',
      navMethod: '04 · Data & Method',
      heroTitle: 'Artifacts Archive',
      heroMuseumBm: 'British Museum · London',
      heroMuseumMet: 'The Met · New York',
      heroMuseumHermitage: 'Hermitage · St. Petersburg',
      heroMuseumLouvre: 'Louvre · Paris',
      heroMuseumBerlin: 'Pergamon & Neues · Berlin',
      heroMuseumTnm: 'Tokyo National · Tokyo',
      heroMuseumSmithsonian: 'Smithsonian Asian · D.C.',
      heroMuseumQuaibranly: 'Quai Branly · Paris',
      heroMuseumRijks: 'Rijksmuseum · Amsterdam',
      heroMuseumVatican: 'Vatican Museums · Rome',
      globalScaleBanner: '10 World Museums · 45,008 Catalogued Artifacts · 325 Verified HD Masterpieces',
      sidebarMuseumLbl: 'Museum Archive (10)',
      navMuseumSwitchTip: 'Switch active museum archive',
      prevArtifactTip: 'Previous artifact (←)',
      nextArtifactTip: 'Next artifact (→)',
      gallerySearchPlaceholder: 'Filter masterpieces by title, country, or museum...',
      compare10Title: '10-Museum Comparative Archive (45,008 Catalogued Artifacts)',
      compare10Sub: 'Click any museum row to switch the 3D globe. Gold shows domestic host-country holdings; sepia shows international provenance.',
      legendHost: 'Host Country',
      legendIntl: 'International',
      museumShortBm: 'British Museum',
      museumCityBm: 'London · UK',
      museumShortMet: 'The Met',
      museumCityMet: 'New York · US',
      museumShortHermitage: 'Hermitage',
      museumCityHermitage: 'St. Petersburg',
      museumShortLouvre: 'Louvre',
      museumCityLouvre: 'Paris · France',
      museumShortBerlin: 'Pergamon · SMB',
      museumCityBerlin: 'Berlin · Germany',
      museumShortTnm: 'Tokyo National',
      museumCityTnm: 'Tokyo · Japan',
      museumShortSmithsonian: 'Smithsonian Asian',
      museumCitySmithsonian: 'Washington · US',
      museumShortQuaibranly: 'Quai Branly',
      museumCityQuaibranly: 'Paris · France',
      museumShortRijks: 'Rijksmuseum',
      museumCityRijks: 'Amsterdam · NL',
      museumShortVatican: 'Vatican Museums',
      museumCityVatican: 'Vatican · Rome',
      ledgerArtifactsLbl: 'Catalogued Artifacts →',
      ledgerCountriesLbl: 'Countries of Origin →',
      ledgerTimelineLbl: 'Acquisition Timeline ▶',
      ledgerMasterpiecesLbl: 'Verified HD Masterpieces ↓',
      mobileCountriesBtn: 'Countries',
      stageTitle: 'Artifacts Archive',
      sidebarToggleTip: 'Collapse or expand sidebar',
      searchPlaceholder: 'Search country or artifact...',
      clearSearchTip: 'Clear search',
      kpiArtifacts: 'Artifacts',
      kpiDateRange: 'Date Range',
      modalPreviewTip: 'Click to enlarge high-resolution photograph',
      zoomBadge: 'HD Zoom',
      countryCatSuffix: ' Catalogue ↗',
      hdPhotoBtn: 'HD Photo',
      copyBmUrlTip: 'Copy official museum object URL',
      dockArtifactsWord: 'artifacts',
      dockCountriesWord: 'countries',
      modeFlat: 'Flat',
      modeStanding: 'Standing',
      modeBoth: 'Both',
      modeParticles: 'Particles',
      sizeLabel: 'Size',
      btnRotate: 'Rotate',
      btnReturnHome: 'Return Home',
      btnReturning: 'Returning...',
      btnCollecting: 'Collecting...',
      btnHighlightTip: 'Cycle through curated museum highlights',
      btnHighlight: 'Highlight',
      btnLabels: 'Labels',
      btnOrigins: 'Origins',
      btnRing1: 'Ring',
      btnRing2: 'Ring2',
      btnRing3: 'Ring3',
      btnAurora: 'Aurora',
      lightboxLocateBtn: 'Locate on 3D Globe ↑',
      locateOnGlobeCardBtn: 'Locate on Globe ↑',
      plateClickTipPrefix: 'Click to view full-resolution photograph of ',
      bmTitleLinkTip: 'Open official museum record in a new tab',
      sec4Eyebrow: '04 · Provenance Distribution & Architecture',
      sec4Title: 'Concentration by Origin & Spatial Methodology',
      top12Title: 'Top 12 Countries by Catalogued Count',
      top12Sub: 'Click any country bar to fly the 3D globe to its homeland mosaic.',
      m1Num: 'METHOD 01 · SPATIAL LATTICE',
      m1Title: 'Point-in-Polygon Homeland Grids',
      m2Num: 'METHOD 02 · GREAT-CIRCLE KINEMATICS',
      m2Title: 'Chronological Gathering & One-Click Repatriation',
      m3Title: 'Verified Provenance & 60 FPS Projection',
      footerBrand: 'Artifacts Archive',
      footerCredit: ' — Interactive 10-museum spatial archive linking open records from ',
      footerGlobeLink: '3D Globe ↑',
      footerTopLink: 'Back to Top ↑',
      lensByMuseum: 'By Museum (10)',
      lensByHomeland: 'By Homeland (101)',
      sidebarHomelandLbl: 'Homeland Dispersal (101)',
      dockMuseumsWord: 'museums',
      kpiMuseums: 'Museums',
      hmBreakTitle: '10-Museum Distribution',
      hmShowAllBtn: 'All Museums',
      btnDisperse: 'Disperse to Museums',
      btnTimeline: 'Timeline',
      btnTimelineTip: 'Toggle interactive museum acquisition timeline',
      tlPlayTip: 'Play or pause chronological acquisition wave',
      tlAllYearsBtn: 'Reset',
      tlCloseTip: 'Hide timeline bar',
      tlDefaultHint: 'Play ▶ or drag slider to watch acquisitions fly into museums & land',
      ledgerArtifactsTip: 'Explore all catalogued artifacts on the 3D globe',
      ledgerCountriesTip: 'Browse all countries of origin (including host country)',
      ledgerTimelineTip: 'Play chronological acquisition timeline',
      ledgerMasterpiecesTip: 'Jump to the HD Masterpieces gallery',
      btnGoHomeTip: 'Launch one-click global repatriation flight',
      btnCollectTip: 'Gather all catalogued works back to the museum',
      navStories: 'Stories ✦',
      heroStoriesBtn: '5 Curator Stories ✦',
      navCreationAge: 'Creation Age ✦',
      navFullCatalog: 'Full Catalog ▤',
      heroFullCatalogBtn: 'Full 45,008 Catalog ▤',
      galleryCatalogCta: 'All 45,008 in Full Catalog ↗',
      tlAcqLabel: 'Acquisition',
      tlCreationLink: 'Creation Age ↗',
      tlLandedChip: 'Landed ✓',
      distLedgerTitle: 'Global Displacement Odometer & Farthest Masterworks',
      distLedgerSub: 'Exact great-circle Haversine distance from archaeological homeland to holding museum. Click any masterpiece to fly there on the 3D globe.',
      distKpiGlobalLbl: '10-Museum Overseas Distance',
      distKpiActiveLbl: 'Active Museum Avg.',
      distKpiMaxLbl: 'Farthest Masterwork'
    },
    zh: {
      locale: 'zh-CN',
      htmlLang: 'zh-CN',
      brandPrimary: '文物档案库',
      navPrologue: '01 · 序章导览',
      navGlobe: '02 · 3D 地球仪',
      navMethod: '04 · 数据与方法',
      heroTitle: '文物档案库',
      heroMuseumBm: '大英博物馆 · 伦敦',
      heroMuseumMet: '大都会博物馆 · 纽约',
      heroMuseumHermitage: '冬宫艾尔米塔什 · 圣彼得堡',
      heroMuseumLouvre: '卢浮宫博物馆 · 巴黎',
      heroMuseumBerlin: '佩加蒙与新博物馆 · 柏林',
      heroMuseumTnm: '东京国立博物馆 · 东京',
      heroMuseumSmithsonian: '史密森尼亚洲馆 · 华盛顿',
      heroMuseumQuaibranly: '凯布朗利博物馆 · 巴黎',
      heroMuseumRijks: '阿姆斯特丹国立博物馆',
      heroMuseumVatican: '梵蒂冈博物馆 · 罗马',
      globalScaleBanner: '全球十大博物馆 · 45,008 件馆藏文物 · 325 件高清镇馆名作',
      sidebarMuseumLbl: '当前博物馆档案 (10)',
      navMuseumSwitchTip: '切换当前浏览的博物馆',
      prevArtifactTip: '上一件文物 (←)',
      nextArtifactTip: '下一件文物 (→)',
      gallerySearchPlaceholder: '按名称、原属国或博物馆筛选名作…',
      compare10Title: '全球十大博物馆馆藏规模与本土占比对比（共 45,008 件）',
      compare10Sub: '点击任意博物馆即可切换 3D 地球仪；金色代表本馆所在国本土馆藏，深褐色代表跨国来源馆藏。',
      legendHost: '本馆所在国',
      legendIntl: '跨国馆藏',
      museumShortBm: '大英博物馆',
      museumCityBm: '英国 · 伦敦',
      museumShortMet: '大都会博物馆',
      museumCityMet: '美国 · 纽约',
      museumShortHermitage: '冬宫艾尔米塔什',
      museumCityHermitage: '俄罗斯 · 圣彼得堡',
      museumShortLouvre: '卢浮宫博物馆',
      museumCityLouvre: '法国 · 巴黎',
      museumShortBerlin: '佩加蒙与新博物馆',
      museumCityBerlin: '德国 · 柏林',
      museumShortTnm: '东京国立博物馆',
      museumCityTnm: '日本 · 东京',
      museumShortSmithsonian: '史密森尼亚洲馆',
      museumCitySmithsonian: '美国 · 华盛顿',
      museumShortQuaibranly: '凯布朗利博物馆',
      museumCityQuaibranly: '法国 · 巴黎',
      museumShortRijks: '荷兰国立博物馆',
      museumCityRijks: '荷兰 · 阿姆斯特丹',
      museumShortVatican: '梵蒂冈博物馆',
      museumCityVatican: '梵蒂冈 · 罗马',
      ledgerArtifactsLbl: '收录馆藏文物 →',
      ledgerCountriesLbl: '文物原属国家 →',
      ledgerTimelineLbl: '入藏时间轴回放 ▶',
      ledgerMasterpiecesLbl: '高清馆藏名作 ↓',
      mobileCountriesBtn: '国家列表',
      stageTitle: '文物档案库',
      sidebarToggleTip: '折叠或展开侧边栏',
      searchPlaceholder: '搜索国家或文物名称…',
      clearSearchTip: '清除搜索',
      kpiArtifacts: '馆藏数量',
      kpiDateRange: '年代跨度',
      modalPreviewTip: '点击放大查看高清文物摄影原图',
      zoomBadge: '高清大图',
      countryCatSuffix: '馆藏目录 ↗',
      hdPhotoBtn: '高清大图',
      copyBmUrlTip: '复制博物馆官方藏品链接',
      dockArtifactsWord: '件文物',
      dockCountriesWord: '个国家',
      modeFlat: '平铺',
      modeStanding: '立牌',
      modeBoth: '双显',
      modeParticles: '粒子',
      sizeLabel: '尺寸',
      btnRotate: '自转',
      btnReturnHome: '一键回家',
      btnReturning: '归乡飞行中…',
      btnCollecting: '汇集中…',
      btnHighlightTip: '依次巡礼馆藏精选镇馆名作',
      btnHighlight: '精选巡礼',
      btnLabels: '标签',
      btnOrigins: '航线',
      btnRing1: '星环1',
      btnRing2: '星环2',
      btnRing3: '星环3',
      btnAurora: '极光',
      lightboxLocateBtn: '在 3D 地球仪上定位 ↑',
      locateOnGlobeCardBtn: '地球仪定位 ↑',
      plateClickTipPrefix: '点击查看高清原图：',
      bmTitleLinkTip: '在新标签页打开官方藏品档案页',
      sec4Eyebrow: '04 · 文物来源分布与空间算法',
      sec4Title: '原属国集中度与空间排布方法',
      top12Title: '馆藏数量前 12 位原属国',
      top12Sub: '点击任意国家条形图，即可将 3D 地球仪飞行聚焦至该国文物矩阵。',
      m1Num: '方法 01 · 国土空间晶格',
      m1Title: '多边形内点国土矩阵采样',
      m2Num: '方法 02 · 大圆球面运动学',
      m2Title: '入藏时间轴汇聚与一键全球归乡',
      m3Title: '权威出处核验与 60 帧实时投影',
      footerBrand: '文物档案库',
      footerCredit: ' — 十大世界博物馆跨国馆藏空间档案重构，数据与高清影像直连自 ',
      footerGlobeLink: '3D 地球仪 ↑',
      footerTopLink: '返回顶部 ↑',
      lensByMuseum: '按博物馆 (10)',
      lensByHomeland: '按原属国 (101)',
      sidebarHomelandLbl: '原属国十馆流散 (101)',
      dockMuseumsWord: '座博物馆',
      kpiMuseums: '收藏馆数',
      hmBreakTitle: '十大博物馆收藏分布',
      hmShowAllBtn: '显示全部',
      btnDisperse: '流散至各馆',
      btnTimeline: '时间轴',
      btnTimelineTip: '显示或隐藏博物馆历史入藏时间轴',
      tlPlayTip: '播放或暂停历史入藏航迹与落馆动画',
      tlAllYearsBtn: '重置回乡',
      tlCloseTip: '隐藏时间轴面板',
      tlDefaultHint: '点击 ▶ 播放或拖动滑块，观看历年入藏文物起飞并最终落馆',
      ledgerArtifactsTip: '在 3D 地球仪上探索全部已建档馆藏文物',
      ledgerCountriesTip: '浏览全部原属国与地区（含本馆所在国）',
      ledgerTimelineTip: '播放博物馆历史入藏时间轴动画',
      ledgerMasterpiecesTip: '跳转至高清镇馆名作图录',
      btnGoHomeTip: '一键启动全球文物跨海飞返原属国动画',
      btnCollectTip: '观看历年文物汇集至现藏博物馆',
      navStories: '策展故事 ✦',
      heroStoriesBtn: '五大策展故事线 ✦',
      navCreationAge: '文明纪年 ✦',
      navFullCatalog: '全部名录 ▤',
      heroFullCatalogBtn: '全部 45,008 件总名录 ▤',
      galleryCatalogCta: '在 45,008 件总名录中检索 ↗',
      tlAcqLabel: '入藏航迹',
      tlCreationLink: '文明纪年 ↗',
      tlLandedChip: '全部落馆 ✓',
      distLedgerTitle: '全球文物流散总航程与距乡最远国宝榜',
      distLedgerSub: '按地球大圆（Haversine）公式精确测算每件文物从原属国到现藏博物馆的球面距离；点击任意国宝即可在 3D 地球仪定位。',
      distKpiGlobalLbl: '十大博物馆海外流散总里程',
      distKpiActiveLbl: '当前博物馆海外平均距乡',
      distKpiMaxLbl: '距故乡最远单件国宝'
    }
  };

  const HISTORICAL_MILESTONES = [
    {
      year: 1506,
      en: '1506 · Renaissance',
      zh: '1506 文艺复兴',
      noteEn: '1506 · Discovery of Laocoön & Papal Vatican Antiquarium',
      noteZh: '1506 年 · 《拉奥孔》出土与教廷古典雕塑收藏创立'
    },
    {
      year: 1753,
      en: '1753 · Enlightenment',
      zh: '1753 启蒙建馆',
      noteEn: '1753–1793 · Sloane Bequest, Hermitage & Louvre Foundations',
      noteZh: '1753–1793 年 · 大英博物馆、冬宫与卢浮宫相继创立'
    },
    {
      year: 1801,
      en: '1801 · Classical Wave',
      zh: '1801 古典潮',
      noteEn: '1801–1820 · Rosetta Stone, Parthenon Marbles & Nile Surveys',
      noteZh: '1801–1820 年 · 罗塞塔石碑、帕特农石雕与尼罗河考察潮'
    },
    {
      year: 1860,
      en: '1860 · Imperial Era',
      zh: '1860 晚清与两河',
      noteEn: '1860s · Nineveh Palaces, Yuanmingyuan & Colonial Expeditions',
      noteZh: '1860 年代 · 亚述王宫发掘与晚清圆明园文物海外流散'
    },
    {
      year: 1897,
      en: '1897 · Benin & Silk Road',
      zh: '1897 贝宁与敦煌',
      noteEn: '1894–1914 · Lombok, Benin 1897 & Dunhuang / Turfan Expeditions',
      noteZh: '1894–1914 年 · 龙目岛、1897 贝宁远征与敦煌西域探险'
    },
    {
      year: 1970,
      en: '1970 · UNESCO Era',
      zh: '1970 公约时代',
      noteEn: '1970+ · UNESCO Convention, Provenance Research & Restitutions',
      noteZh: '1970 年后 · 联合国教科文组织公约与当代溯源及返还'
    }
  ];

  const REGION_LABELS = {
    en: {
      host: 'Host Country',
      asia: 'East & South Asia',
      egypt: 'Egypt & Nubia',
      neareast: 'Near East & Steppe',
      med: 'Greece, Rome & Europe',
      africa: 'Africa & Maghreb',
      americas: 'Americas & Oceania'
    },
    zh: {
      host: '本馆所在国',
      asia: '东亚、中亚与南亚',
      egypt: '埃及与努比亚',
      neareast: '近东、波斯与草原',
      med: '希腊、罗马与欧洲',
      africa: '非洲与马格里布',
      americas: '美洲与大洋洲'
    }
  };

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

  // British Museum default 64-plate regional templates
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

  const GS_PATHS = {
    play: 'M8 5v14l11-7L8 5z',
    home: 'M12 3L4 9v12h16V9l-8-6zm6 16h-3v-6H9v6H6v-9l6-4.5 6 4.5v9z',
    hourglass: 'M6,2l0.01,6L10,12l-3.99,4.01L6,22h12v-6l-4-4l4-3.99V2H6z M16,16.5V20H8v-3.5l4-4L16,16.5z',
    spark: 'M12,22c0-5.52,4.48-10,10-10c-5.52,0-10-4.48-10-10c0,5.52-4.48,10-10,10C7.52,12,12,16.48,12,22z',
    globe: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z'
  };

  const GLOBE_MIP_SIZE = 64;
  const DEG2RAD = Math.PI / 180;
  const atlasCache = {};
  const atlasPromises = {};
  let activeAtlas = null;
  let loadedAtlasCount = 0;

  function repaintDeferredCanvases(mid) {
    const list = document.querySelectorAll('canvas[data-mid="' + mid + '"][data-cover]');
    for (let i = 0; i < list.length; i++) {
      const cnv = list[i];
      const sp = parseInt(cnv.dataset.sprite || '0', 10);
      if (cnv.dataset.cover === '1') {
        drawCoverPlateToCanvas(cnv, sp, mid);
      } else {
        drawSpriteToCanvas(cnv, sp, mid);
      }
    }
  }

  function loadMuseumAtlas(museumId, makeActive) {
    const m = MUSEUMS[museumId] || MUSEUMS.bm;
    if (atlasCache[m.id]) {
      if (makeActive) activeAtlas = atlasCache[m.id];
      return Promise.resolve(atlasCache[m.id]);
    }
    if (atlasPromises[m.id]) {
      return atlasPromises[m.id].then((ent) => {
        if (makeActive) activeAtlas = ent;
        return ent;
      });
    }

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
      spriteAtlas: null,
      globeSpriteAtlas: gCanvas,
      spriteColors: null
    };

    atlasPromises[m.id] = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      const finishMip = (bmp) => {
        if (bmp) {
          gCtx.drawImage(bmp, 0, 0, gCanvas.width, gCanvas.height);
          if (typeof bmp.close === 'function') bmp.close();
        } else {
          gCtx.imageSmoothingEnabled = true;
          gCtx.imageSmoothingQuality = 'medium';
          gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height);
        }
        // Pre-sample authentic dominant pigment color per sprite tile (<0.1ms) for 60 FPS motion LOD
        try {
          const pc = document.createElement('canvas');
          pc.width = m.atlasCols;
          pc.height = m.atlasRows;
          const pCtx = pc.getContext('2d');
          pCtx.drawImage(gCanvas, 0, 0, m.atlasCols, m.atlasRows);
          const pd = pCtx.getImageData(0, 0, m.atlasCols, m.atlasRows).data;
          const colors = new Array(m.atlasCols * m.atlasRows);
          for (let idx = 0; idx < colors.length; idx++) {
            const o = idx * 4;
            colors[idx] = 'rgb(' + pd[o] + ',' + pd[o + 1] + ',' + pd[o + 2] + ')';
          }
          entry.spriteColors = colors;
        } catch (_) {}
        gCtx.strokeStyle = 'rgba(255, 248, 234, 0.24)';
        gCtx.lineWidth = 1.2;
        for (let idx = 0; idx < m.atlasCols * m.atlasRows; idx++) {
          const gx = (idx % m.atlasCols) * GLOBE_MIP_SIZE;
          const gy = Math.floor(idx / m.atlasCols) * GLOBE_MIP_SIZE;
          gCtx.strokeRect(gx + 0.6, gy + 0.6, GLOBE_MIP_SIZE - 1.2, GLOBE_MIP_SIZE - 1.2);
        }
        atlasCache[m.id] = entry;
        loadedAtlasCount++;
        if (makeActive || state.museumId === m.id) activeAtlas = entry;
        repaintDeferredCanvases(m.id);
        resolve(entry);
      };
      img.onload = () => {
        entry.spriteAtlas = img;
        if (typeof window.createImageBitmap === 'function') {
          window.createImageBitmap(img, {
            resizeWidth: gCanvas.width,
            resizeHeight: gCanvas.height,
            resizeQuality: 'medium'
          }).then(finishMip).catch(() => finishMip(null));
        } else {
          finishMip(null);
        }
      };
      img.onerror = () => {
        atlasCache[m.id] = entry;
        loadedAtlasCount++;
        if (makeActive) activeAtlas = entry;
        resolve(entry);
      };
      img.src = m.atlasUri;
    });
    return atlasPromises[m.id];
  }

  function ensureMuseumAtlas(museumId) {
    return loadMuseumAtlas(museumId, true);
  }

  let seedState = 20260305;
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

  const state = {
    globeLens: 'museum',
    museumId: 'bm',
    homelandCountryEn: 'China',
    homelandFilterMuseumId: null,
    homelandBarsExpanded: false,
    homelandListTabActive: false,
    homelandPins: [],
    lang: 'en',
    polyMap: new Map(),
    countries: [],
    artifacts: [],
    curatedHighlights: [],
    borderArcs3D: [],
    landDots3D: [],
    ringEntries: [],
    rotLon: -22 * DEG2RAD,
    rotLat: 24 * DEG2RAD,
    zoom: 1.0,
    targetRotLon: -22 * DEG2RAD,
    targetRotLat: 24 * DEG2RAD,
    targetZoom: 1.0,
    displayMode: 'standing',
    cardScale: 1.0,
    autoRotate: false,
    showLabels: false,
    showOrigins: false,
    ringMode: 3,
    showAurora: true,
    isCollectedInHost: false,
    animatingFlight: false,
    flightDirection: 'home',
    flightProgress: 0,
    timelineVisible: true,
    timelineActive: false,
    timelinePlaying: false,
    timelineYear: 2013,
    tlMinYear: 1753,
    tlMaxYear: 2013,
    selectedCountry: null,
    lastFocusedCountry: null,
    selectedArtifact: null,
    lightboxArtifact: null,
    hoveredArtifact: null,
    hoveredMuseumPin: null,
    searchQuery: '',
    galleryRegion: 'all',
    galleryAllMuseums: false,
    gallerySearchQuery: '',
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    hasDragged: false
  };

  function curMuseum() {
    return MUSEUMS[state.museumId] || MUSEUMS.bm;
  }

  function mCopy() {
    const m = curMuseum();
    return (m.copy && m.copy[state.lang]) || m.copy.en;
  }

  // Locale-aware formatting helpers (Intl.NumberFormat per i18n standards)
  const numFormatters = {
    en: new Intl.NumberFormat('en-US'),
    zh: new Intl.NumberFormat('zh-CN')
  };

  function t(key) {
    const dict = I18N[state.lang] || I18N.en;
    return dict[key] !== undefined ? dict[key] : (I18N.en[key] || '');
  }

  function fmtNum(n) {
    const fmt = numFormatters[state.lang] || numFormatters.en;
    return fmt.format(n);
  }

  function countryName(c) {
    if (!c) return '';
    if (state.lang === 'zh') return c.zh;
    return c.en === 'United States of America' ? 'United States' : c.en;
  }

  function hostBadgeText() {
    return state.lang === 'zh' ? '本土' : 'Host';
  }

  function formatDateLocalized(rawDate, compact) {
    if (!rawDate) return '';
    if (state.lang !== 'zh') return rawDate;
    return rawDate.split('–').map((part) => {
      const p = part.trim();
      if (p.endsWith('BC')) {
        const yr = p.slice(0, -2);
        return compact ? ('前' + yr) : ('公元前' + yr + '年');
      }
      return compact ? p : (p + '年');
    }).join('–');
  }

  function artFullTitle(art) {
    if (!art) return '';
    if (state.lang === 'zh') return art.zh;
    return art.isCurated ? art.en : (countryName(art.country) + ' · ' + art.tmplEn + ' #' + art.localNum);
  }

  function artThumbCaption(art) {
    if (!art) return '';
    if (state.lang === 'zh') return art.zh;
    return art.isCurated ? art.en : (art.tmplEn + ' #' + art.localNum);
  }

  function artMaterial(art) {
    if (!art) return '';
    return state.lang === 'zh' ? (art.materialZh || art.material) : art.material;
  }

  function artRoom(art) {
    if (!art) return '';
    const artM = (art.museumId && MUSEUMS[art.museumId]) ? MUSEUMS[art.museumId] : curMuseum();
    const mc = (artM.copy && artM.copy[state.lang]) || artM.copy.en;
    return state.lang === 'zh' ? (art.roomZh || mc.studyRoom) : (art.room || mc.studyRoom);
  }

  function artDesc(art) {
    if (!art) return '';
    return state.lang === 'zh' ? (art.descZh || art.desc) : art.desc;
  }

  function formatAcqPhrase(year) {
    return state.lang === 'zh' ? (year + '年入藏') : ('Acquired ' + year);
  }

  function formatCardAcqShort(year) {
    return state.lang === 'zh' ? (year + '年入藏') : ('Acq. ' + year);
  }

  function formatRegBadge(art) {
    const m = (art && art.museumId && MUSEUMS[art.museumId]) ? MUSEUMS[art.museumId] : curMuseum();
    if (!art || !art.reg) return formatCardAcqShort(art ? art.acqYear : m.acqStart);
    if (art.reg.startsWith(m.regPrefix + ' ') || art.reg.startsWith(m.regPrefix + '.')) return art.reg;
    return m.regPrefix + ' ' + art.reg;
  }

  function formatCountryCatalogLabel(country) {
    const name = countryName(country);
    return name + t('countryCatSuffix');
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

  function buildCountryCatalogueUrl(country, explicitMuseumId) {
    const m = (explicitMuseumId && MUSEUMS[explicitMuseumId]) ? MUSEUMS[explicitMuseumId] : curMuseum();
    const rawCountry = country && country.en ? country.en : 'Egypt';
    if (m.id === 'vatican') {
      return buildVaticanCountryUrl(rawCountry);
    }
    const cleanPlace = BM_PLACE_NAMES[rawCountry] || rawCountry || 'Egypt';
    const candidate = m.urls.searchPrefix + encodeURIComponent(cleanPlace) + m.urls.searchSuffix;
    return candidate.startsWith(m.urls.allowedOriginPrefix) ? candidate : m.urls.collectionHome;
  }

  function buildArtifactObjUrl(art) {
    const m = (art && art.museumId && MUSEUMS[art.museumId]) ? MUSEUMS[art.museumId] : curMuseum();
    const allowed = m.urls.allowedOriginPrefix;
    if (art && typeof art.objUrl === 'string' && art.objUrl.startsWith(allowed)) {
      return art.objUrl;
    }
    const spriteUrl = art && m.spriteObjectUrls[art.sprite];
    if (typeof spriteUrl === 'string' && spriteUrl.startsWith(allowed)) {
      return spriteUrl;
    }
    return buildCountryCatalogueUrl(art ? art.country : null, m.id);
  }

  async function decodeWorldMap() {
    const binStr = atob(WORLD_MAP_GZ_B64);
    const gzBytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) gzBytes[i] = binStr.charCodeAt(i);

    const ds = new DecompressionStream('gzip');
    const decompressedStream = new Response(gzBytes).body.pipeThrough(ds);
    const rawBuf = await new Response(decompressedStream).arrayBuffer();
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
          for (let m = (ring.length ? 1 : 0); m < arcPts.length; m++) {
            ring.push(arcPts[m]);
          }
        }
        if (ring.length >= 3) destRings.push(ring);
      }
    }

    const allRingsList = Array.from(polyMap.values()).map((rings) => {
      let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
      for (let r = 0; r < rings.length; r++) {
        const ring = rings[r];
        for (let p = 0; p < ring.length; p++) {
          const ln = ring[p][0], lt = ring[p][1];
          if (ln < minLon) minLon = ln;
          if (ln > maxLon) maxLon = ln;
          if (lt < minLat) minLat = lt;
          if (lt > maxLat) maxLat = lt;
        }
      }
      return { rings, minLon, maxLon, minLat, maxLat };
    });
    const landDots = [];
    for (let lat = -58; lat <= 74; lat += 2.6) {
      const lonStep = 2.6 / Math.max(0.28, Math.cos(lat * DEG2RAD));
      for (let lon = -178; lon <= 178; lon += lonStep) {
        let onLand = false;
        for (let c = 0; c < allRingsList.length; c++) {
          const box = allRingsList[c];
          if (lat < box.minLat || lat > box.maxLat || lon < box.minLon || lon > box.maxLon) continue;
          if (pointInMultiPolygon(lon, lat, box.rings)) {
            onLand = true;
            break;
          }
        }
        if (onLand) landDots.push(lonLatToVec3(lon, lat));
      }
    }

    const borderArcs3D = decodedArcs.map(arc => arc.map(pt => lonLatToVec3(pt[0], pt[1])));
    return { polyMap, borderArcs3D, landDots };
  }

  function rebuildRingEntries() {
    const spokes = 180;
    const ringEntries = [];
    if (!state.artifacts.length) return;
    for (let i = 0; i < spokes; i++) {
      const art = state.artifacts[(i * 27) % state.artifacts.length];
      let labelText;
      if (state.lang === 'zh') {
        const shortZh = art.isCurated ? art.zh.slice(0, 10) : art.tmplZh.slice(0, 8);
        labelText = art.country.zh + ' · ' + shortZh;
      } else {
        const shortEn = (art.isCurated ? art.en : art.tmplEn).slice(0, 22);
        labelText = countryName(art.country) + ' · ' + shortEn;
      }
      ringEntries.push({
        angle: (i / spokes) * Math.PI * 2,
        text: labelText,
        len: 0.14 + (i % 5) * 0.032
      });
    }
    state.ringEntries = ringEntries;
  }

  function generateDatasetForActiveMuseum() {
    const m = curMuseum();
    const polyMap = state.polyMap;
    const countriesSpec = m.countriesSpec;
    const featuredMap = m.featuredByCountry || {};
    const regTemplates = m.regionalTemplates || BM_REGIONAL_TEMPLATES;
    const acqSpan = Math.max(1, m.acqEnd - m.acqStart);

    // Deterministic seed per museum so lattice & jitter are repeatable
    const museumSeedOffset = SUPPORTED_MUSEUMS.indexOf(m.id) * 10007;
    seedState = (20260305 + museumSeedOffset) >>> 0;

    const countries = [];
    const artifacts = [];
    const curatedHighlights = [];

    for (let cIdx = 0; cIdx < countriesSpec.length; cIdx++) {
      const [enName, zhName, count, dateRange, fallbackLon, fallbackLat] = countriesSpec[cIdx];
      const rings = polyMap.get(enName) || [];

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
        minLon = fallbackLon - 2.5;
        maxLon = fallbackLon + 2.5;
        minLat = fallbackLat - 2.0;
        maxLat = fallbackLat + 2.0;
      }

      let candidates = [];
      const areaEst = Math.max(4, (maxLon - minLon) * (maxLat - minLat));
      let step = Math.max(0.28, Math.min(2.6, Math.sqrt(areaEst / (count * 2.3))));

      for (let attempt = 0; attempt < 4 && candidates.length < count; attempt++) {
        candidates = [];
        for (let lt = maxLat; lt >= minLat; lt -= step) {
          for (let ln = minLon; ln <= maxLon; ln += step) {
            if (rings.length > 0 && pointInMultiPolygon(ln, lt, rings)) {
              candidates.push([ln, lt]);
            }
          }
        }
        step *= 0.62;
      }

      const coords = [];
      if (candidates.length >= count) {
        for (let k = 0; k < count; k++) {
          coords.push(candidates[Math.floor((k + 0.5) * candidates.length / count)]);
        }
      } else {
        for (let k = 0; k < candidates.length; k++) coords.push(candidates[k]);
        let extra = 0;
        while (coords.length < count) {
          const ringR = 0.35 + 0.28 * Math.sqrt(extra + 1);
          const ang = extra * 2.39996;
          coords.push([
            fallbackLon + Math.cos(ang) * ringR,
            Math.max(-75, Math.min(75, fallbackLat + Math.sin(ang) * ringR * 0.8))
          ]);
          extra++;
        }
      }

      const isHostCountry = Boolean(m.hostCountryEn && enName === m.hostCountryEn);
      const displayEn = enName === 'United States of America' ? 'United States' : enName;
      const countryObj = {
        index: cIdx,
        en: enName,
        zh: zhName,
        isHost: isHostCountry,
        count: count,
        dateRange: dateRange,
        centerLon: fallbackLon,
        centerLat: fallbackLat,
        artifacts: []
      };

      const featured = featuredMap[enName] || [];
      for (let k = 0; k < count; k++) {
        const [lon, lat] = coords[k];
        const homeVec = lonLatToVec3(lon, lat);
        const hJitterLon = m.hostLon + (nextRand() - 0.5) * 1.9;
        const hJitterLat = m.hostLat + (nextRand() - 0.5) * 1.3;
        const hostVec = lonLatToVec3(hJitterLon, hJitterLat);

        const phi = lat * DEG2RAD, lam = lon * DEG2RAD;
        const east = [Math.cos(lam), 0, -Math.sin(lam)];
        const north = [-Math.sin(phi) * Math.sin(lam), Math.cos(phi), -Math.sin(phi) * Math.cos(lam)];

        let item;
        if (k < featured.length) {
          const f = featured[k];
          item = {
            id: artifacts.length,
            localNum: k + 1,
            country: countryObj,
            zh: f.zh,
            en: f.en,
            tmplEn: f.en,
            tmplZh: f.zh,
            date: f.date,
            acqYear: f.acq,
            material: f.mat,
            materialZh: f.matZh || f.mat,
            room: f.room,
            roomZh: f.roomZh || f.room,
            reg: f.reg || '',
            objUrl: f.objUrl || f.bmUrl || '',
            sprite: f.sprite,
            desc: f.desc,
            descZh: f.descZh || f.desc,
            region: f.region || (isHostCountry ? 'host' : 'med'),
            isCurated: true
          };
          curatedHighlights.push(item);
        } else {
          const sphereKey = CULTURAL_SPHERE_BY_COUNTRY[enName] || 'classical';
          const pool = (isHostCountry && Array.isArray(m.hostTemplates) && m.hostTemplates.length)
            ? m.hostTemplates
            : (regTemplates[sphereKey] || regTemplates.classical || GENERIC_TEMPLATES);
          const tmpl = pool[(cIdx * 5 + k) % pool.length];
          const acqYear = m.acqStart + Math.floor(Math.pow(nextRand(), 0.85) * Math.max(10, acqSpan - 10));
          const plateReg = m.spriteRegNos[tmpl.sprite] || '';
          const plateTitleEn = m.spriteTitlesEn[tmpl.sprite] || tmpl.en;
          const plateTitleZh = m.spriteTitlesZh[tmpl.sprite] || tmpl.zhSuffix;
          const plateUrl = m.spriteObjectUrls[tmpl.sprite] || '';
          const mEnName = m.copy.en.name;
          const mZhName = m.copy.zh.name;
          const formattedPlateReg = plateReg
            ? ((plateReg.startsWith(m.regPrefix + ' ') || plateReg.startsWith(m.regPrefix + '.')) ? plateReg : (m.regPrefix + ' ' + plateReg))
            : (m.regPrefix + ' · ' + displayEn);
          item = {
            id: artifacts.length,
            localNum: k + 1,
            country: countryObj,
            zh: zhName + tmpl.zhSuffix + ' #' + (k + 1),
            en: displayEn + ' · ' + tmpl.en,
            tmplEn: tmpl.en,
            tmplZh: tmpl.zhSuffix,
            date: dateRange,
            acqYear: acqYear,
            material: tmpl.mat,
            materialZh: tmpl.matZh || tmpl.mat,
            room: m.copy.en.studyRoom,
            roomZh: m.copy.zh.studyRoom,
            reg: formattedPlateReg,
            objUrl: plateUrl,
            sprite: tmpl.sprite,
            desc: tmpl.en + ' mapped to ' + displayEn + (isHostCountry ? ' (domestic host-country collection)' : '') + ' in ' + mEnName + '. Illustrated by verified museum plate "' + plateTitleEn + '"' + (plateReg ? (' (Inv. ' + plateReg + ')') : '') + ' — click below to open this official object record or browse all ' + displayEn + ' holdings.',
            descZh: mZhName + '收录之源自' + zhName + (isHostCountry ? '（本馆所在国本土馆藏）' : '') + '的' + tmpl.zhSuffix + '档案。对应实拍馆藏图版《' + plateTitleZh + '》' + (plateReg ? ('（馆藏号 ' + plateReg + '）') : '') + '——点击下方按钮可直接打开官方藏品主页，或检索' + zhName + '全部馆藏目录。',
            region: 'study',
            isCurated: false
          };
        }

        item.museumId = m.id;
        item.lon = lon;
        item.lat = lat;
        item.homeVec = homeVec;
        item.hostVec = hostVec;
        item.east = east;
        item.north = north;
        item.acqNorm = Math.max(0, Math.min(1, (item.acqYear - m.acqStart) / acqSpan));
        item.arcLift = 0.14 + nextRand() * 0.18;

        countryObj.artifacts.push(item);
        artifacts.push(item);
      }

      countries.push(countryObj);
    }

    state.countries = countries;
    state.artifacts = artifacts;
    state.curatedHighlights = curatedHighlights;
    state.homelandPins = [];
    state.tlMinYear = m.acqStart;
    state.tlMaxYear = m.acqEnd;
    if (!state.timelineActive) {
      state.timelineYear = m.acqEnd;
    } else {
      state.timelineYear = Math.max(m.acqStart, Math.min(m.acqEnd, state.timelineYear));
    }
    state.lastFocusedCountry = countries[0] || null;
    rebuildRingEntries();
  }

  let cachedHomelandCatalog = null;
  function getHomelandCatalog() {
    if (cachedHomelandCatalog) return cachedHomelandCatalog;
    const map = new Map();
    for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
      const mid = SUPPORTED_MUSEUMS[mIdx];
      const m = MUSEUMS[mid];
      if (!m) continue;
      for (let r = 0; r < m.countriesSpec.length; r++) {
        const [enName, zhName, count, dateRange, fallbackLon, fallbackLat] = m.countriesSpec[r];
        let rec = map.get(enName);
        if (!rec) {
          rec = {
            en: enName,
            zh: zhName,
            totalCount: 0,
            curatedCount: 0,
            minAcqYear: m.acqStart,
            maxAcqYear: m.acqEnd,
            dateRange: dateRange,
            centerLon: fallbackLon,
            centerLat: fallbackLat,
            holdings: []
          };
          map.set(enName, rec);
        }
        const curList = (m.featuredByCountry && m.featuredByCountry[enName]) || [];
        rec.totalCount += count;
        rec.curatedCount += curList.length;
        if (m.acqStart < rec.minAcqYear) rec.minAcqYear = m.acqStart;
        if (m.acqEnd > rec.maxAcqYear) rec.maxAcqYear = m.acqEnd;
        rec.holdings.push({
          museumId: mid,
          count: count,
          curatedCount: curList.length,
          dateRange: dateRange,
          isHost: Boolean(m.hostCountryEn && enName === m.hostCountryEn)
        });
      }
    }
    const list = Array.from(map.values());
    for (let i = 0; i < list.length; i++) {
      list[i].holdings.sort((a, b) => b.count - a.count);
      list[i].index = i;
    }
    list.sort((a, b) => b.totalCount - a.totalCount);
    for (let i = 0; i < list.length; i++) list[i].index = i;
    cachedHomelandCatalog = list;
    return list;
  }

  function getHomelandEntry(enName) {
    const list = getHomelandCatalog();
    return list.find(h => h.en === enName) || list[0];
  }

  function generateDatasetForHomeland(homelandEn) {
    const entry = getHomelandEntry(homelandEn);
    state.homelandCountryEn = entry.en;
    const polyMap = state.polyMap;
    const enName = entry.en;
    const zhName = entry.zh;
    const displayEn = enName === 'United States of America' ? 'United States' : enName;
    const totalCount = entry.totalCount;
    const fallbackLon = entry.centerLon;
    const fallbackLat = entry.centerLat;
    const rings = polyMap.get(enName) || [];

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
      minLon = fallbackLon - 2.5;
      maxLon = fallbackLon + 2.5;
      minLat = fallbackLat - 2.0;
      maxLat = fallbackLat + 2.0;
    }

    let candidates = [];
    const areaEst = Math.max(4, (maxLon - minLon) * (maxLat - minLat));
    let step = Math.max(0.24, Math.min(2.4, Math.sqrt(areaEst / (totalCount * 2.2))));
    for (let attempt = 0; attempt < 4 && candidates.length < totalCount; attempt++) {
      candidates = [];
      for (let lt = maxLat; lt >= minLat; lt -= step) {
        for (let ln = minLon; ln <= maxLon; ln += step) {
          if (rings.length > 0 && pointInMultiPolygon(ln, lt, rings)) {
            candidates.push([ln, lt]);
          }
        }
      }
      step *= 0.62;
    }

    const coords = [];
    if (candidates.length >= totalCount) {
      for (let k = 0; k < totalCount; k++) {
        coords.push(candidates[Math.floor((k + 0.5) * candidates.length / totalCount)]);
      }
    } else {
      for (let k = 0; k < candidates.length; k++) coords.push(candidates[k]);
      let extra = 0;
      while (coords.length < totalCount) {
        const ringR = 0.35 + 0.25 * Math.sqrt(extra + 1);
        const ang = extra * 2.39996;
        coords.push([
          fallbackLon + Math.cos(ang) * ringR,
          Math.max(-75, Math.min(75, fallbackLat + Math.sin(ang) * ringR * 0.8))
        ]);
        extra++;
      }
    }

    seedState = (20260917 + entry.index * 7919) >>> 0;
    const countryObj = {
      index: 0,
      en: enName,
      zh: zhName,
      isHost: false,
      count: totalCount,
      dateRange: entry.dateRange,
      centerLon: fallbackLon,
      centerLat: fallbackLat,
      artifacts: []
    };

    const minAcq = entry.minAcqYear;
    const maxAcq = entry.maxAcqYear;
    const globalSpan = Math.max(1, maxAcq - minAcq);
    const curatedList = [];
    const studyList = [];
    const pins = [];
    let coordCursor = 0;

    for (let hIdx = 0; hIdx < entry.holdings.length; hIdx++) {
      const h = entry.holdings[hIdx];
      const mid = h.museumId;
      const m = MUSEUMS[mid];
      if (!m) continue;

      // Slight visual separation for the two Paris museums on globe pin projection
      const pinLon = mid === 'quaibranly' ? (m.hostLon - 1.15) : m.hostLon;
      const pinLat = mid === 'quaibranly' ? (m.hostLat - 0.55) : m.hostLat;
      pins.push({
        museumId: mid,
        count: h.count,
        curatedCount: h.curatedCount,
        isHost: h.isHost,
        lon: pinLon,
        lat: pinLat,
        vec3: lonLatToVec3(pinLon, pinLat)
      });

      const featured = (m.featuredByCountry && m.featuredByCountry[enName]) || [];
      const regTemplates = m.regionalTemplates || BM_REGIONAL_TEMPLATES;
      const mSpan = Math.max(1, m.acqEnd - m.acqStart);

      for (let k = 0; k < h.count; k++) {
        const [lon, lat] = coords[coordCursor % coords.length];
        coordCursor++;
        const homeVec = lonLatToVec3(lon, lat);
        const hJitterLon = pinLon + (nextRand() - 0.5) * 1.6;
        const hJitterLat = pinLat + (nextRand() - 0.5) * 1.1;
        const hostVec = lonLatToVec3(hJitterLon, hJitterLat);
        const phi = lat * DEG2RAD, lam = lon * DEG2RAD;
        const east = [Math.cos(lam), 0, -Math.sin(lam)];
        const north = [-Math.sin(phi) * Math.sin(lam), Math.cos(phi), -Math.sin(phi) * Math.cos(lam)];

        let item;
        if (k < featured.length) {
          const f = featured[k];
          item = {
            id: 0,
            localNum: k + 1,
            country: countryObj,
            zh: f.zh,
            en: f.en,
            tmplEn: f.en,
            tmplZh: f.zh,
            date: f.date,
            acqYear: f.acq,
            material: f.mat,
            materialZh: f.matZh || f.mat,
            room: f.room,
            roomZh: f.roomZh || f.room,
            reg: f.reg || '',
            objUrl: f.objUrl || f.bmUrl || '',
            sprite: f.sprite,
            desc: f.desc,
            descZh: f.descZh || f.desc,
            region: f.region || 'med',
            isCurated: true
          };
        } else {
          const sphereKey = CULTURAL_SPHERE_BY_COUNTRY[enName] || 'classical';
          const pool = (h.isHost && Array.isArray(m.hostTemplates) && m.hostTemplates.length)
            ? m.hostTemplates
            : (regTemplates[sphereKey] || regTemplates.classical || GENERIC_TEMPLATES);
          const tmpl = pool[(hIdx * 7 + k) % pool.length];
          const acqYear = m.acqStart + Math.floor(Math.pow(nextRand(), 0.85) * Math.max(10, mSpan - 10));
          const plateReg = m.spriteRegNos[tmpl.sprite] || '';
          const plateTitleEn = m.spriteTitlesEn[tmpl.sprite] || tmpl.en;
          const plateTitleZh = m.spriteTitlesZh[tmpl.sprite] || tmpl.zhSuffix;
          const plateUrl = m.spriteObjectUrls[tmpl.sprite] || '';
          const formattedPlateReg = plateReg
            ? ((plateReg.startsWith(m.regPrefix + ' ') || plateReg.startsWith(m.regPrefix + '.')) ? plateReg : (m.regPrefix + ' ' + plateReg))
            : (m.regPrefix + ' · ' + displayEn);
          item = {
            id: 0,
            localNum: k + 1,
            country: countryObj,
            zh: zhName + tmpl.zhSuffix + ' #' + (k + 1),
            en: displayEn + ' · ' + tmpl.en,
            tmplEn: tmpl.en,
            tmplZh: tmpl.zhSuffix,
            date: h.dateRange,
            acqYear: acqYear,
            material: tmpl.mat,
            materialZh: tmpl.matZh || tmpl.mat,
            room: m.copy.en.studyRoom,
            roomZh: m.copy.zh.studyRoom,
            reg: formattedPlateReg,
            objUrl: plateUrl,
            sprite: tmpl.sprite,
            desc: tmpl.en + ' originating from ' + displayEn + ' in ' + m.copy.en.name + '. Illustrated by verified plate "' + plateTitleEn + '" — click below to open its official record.',
            descZh: m.copy.zh.name + '所藏源自' + zhName + '的' + tmpl.zhSuffix + '档案（对应图版《' + plateTitleZh + '》）——点击下方可直达该馆官方档案页。',
            region: 'study',
            isCurated: false
          };
        }

        item.museumId = mid;
        item.lon = lon;
        item.lat = lat;
        item.homeVec = homeVec;
        item.hostVec = hostVec;
        item.east = east;
        item.north = north;
        item.acqNorm = Math.max(0, Math.min(1, (item.acqYear - minAcq) / globalSpan));
        item.arcLift = 0.16 + nextRand() * 0.18;

        if (item.isCurated) curatedList.push(item);
        else studyList.push(item);
      }
    }

    // Round-robin curated HD masterpieces across holding museums so thumbnails immediately showcase cross-museum diversity
    const curatedByM = new Map();
    for (let i = 0; i < curatedList.length; i++) {
      const ci = curatedList[i];
      if (!curatedByM.has(ci.museumId)) curatedByM.set(ci.museumId, []);
      curatedByM.get(ci.museumId).push(ci);
    }
    const interleavedCurated = [];
    const mBuckets = Array.from(curatedByM.values());
    let roundIdx = 0;
    let addedAny = true;
    while (addedAny) {
      addedAny = false;
      for (let b = 0; b < mBuckets.length; b++) {
        if (roundIdx < mBuckets[b].length) {
          interleavedCurated.push(mBuckets[b][roundIdx]);
          addedAny = true;
        }
      }
      roundIdx++;
    }

    const combined = interleavedCurated.concat(studyList);
    for (let i = 0; i < combined.length; i++) {
      combined[i].id = i;
      countryObj.artifacts.push(combined[i]);
    }

    // Build full homeland catalog rows for the "All 101 Homelands" tab
    const catalog = getHomelandCatalog();
    const homelandRows = catalog.map((hc, idx) => ({
      index: idx,
      en: hc.en,
      zh: hc.zh,
      isHost: false,
      count: hc.totalCount,
      museumsCount: hc.holdings.length,
      curatedCount: hc.curatedCount,
      dateRange: hc.dateRange,
      centerLon: hc.centerLon,
      centerLat: hc.centerLat,
      artifacts: hc.en === enName ? countryObj.artifacts : []
    }));

    const activeRow = homelandRows.find(r => r.en === enName) || countryObj;
    state.countries = homelandRows;
    state.artifacts = combined;
    state.curatedHighlights = interleavedCurated;
    state.homelandPins = pins;
    state.selectedCountry = state.homelandListTabActive ? null : activeRow;
    state.lastFocusedCountry = activeRow;
    state.tlMinYear = minAcq;
    state.tlMaxYear = maxAcq;
    if (!state.timelineActive) {
      state.timelineYear = maxAcq;
    } else {
      state.timelineYear = Math.max(minAcq, Math.min(maxAcq, state.timelineYear));
    }
    rebuildRingEntries();
  }

  let cachedAllMuseumsHighlights = null;
  function getAllMuseumsHighlights() {
    if (cachedAllMuseumsHighlights) return cachedAllMuseumsHighlights;
    const all = [];
    for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
      const mid = SUPPORTED_MUSEUMS[mIdx];
      const m = MUSEUMS[mid];
      if (!m || !m.featuredByCountry) continue;
      const zhByEn = {};
      for (let r = 0; r < m.countriesSpec.length; r++) {
        zhByEn[m.countriesSpec[r][0]] = m.countriesSpec[r][1];
      }
      const countryKeys = Object.keys(m.featuredByCountry);
      for (let c = 0; c < countryKeys.length; c++) {
        const enName = countryKeys[c];
        const isHostC = Boolean(m.hostCountryEn && enName === m.hostCountryEn);
        const stubCountry = {
          en: enName,
          zh: zhByEn[enName] || enName,
          isHost: isHostC
        };
        const list = m.featuredByCountry[enName] || [];
        for (let k = 0; k < list.length; k++) {
          const f = list[k];
          all.push({
            museumId: mid,
            localNum: k + 1,
            country: stubCountry,
            zh: f.zh,
            en: f.en,
            tmplEn: f.en,
            tmplZh: f.zh,
            date: f.date,
            acqYear: f.acq,
            material: f.mat,
            materialZh: f.matZh || f.mat,
            room: f.room,
            roomZh: f.roomZh || f.room,
            reg: f.reg || '',
            objUrl: f.objUrl || f.bmUrl || '',
            sprite: f.sprite,
            desc: f.desc,
            descZh: f.descZh || f.desc,
            region: f.region || (isHostC ? 'host' : 'med'),
            isCurated: true
          });
        }
      }
    }
    cachedAllMuseumsHighlights = all;
    return all;
  }

  function currentGallerySourceList() {
    if (state.galleryAllMuseums) return getAllMuseumsHighlights();
    if (state.globeLens === 'homeland') {
      return getAllMuseumsHighlights().filter(a => a.museumId === state.museumId);
    }
    return state.curatedHighlights;
  }

  function galleryItemMatchesSearch(art, q) {
    if (!q) return true;
    const m = MUSEUMS[art.museumId || state.museumId] || curMuseum();
    const mNameEn = m.copy.en.shortName.toLowerCase();
    const mNameZh = m.copy.zh.shortName;
    return (
      art.en.toLowerCase().includes(q) ||
      art.zh.includes(q) ||
      art.country.en.toLowerCase().includes(q) ||
      art.country.zh.includes(q) ||
      countryAliasHit(art.country.en, q) ||
      art.material.toLowerCase().includes(q) ||
      (art.materialZh && art.materialZh.includes(q)) ||
      (art.reg && art.reg.toLowerCase().includes(q)) ||
      mNameEn.includes(q) ||
      mNameZh.includes(q)
    );
  }

  // Safe DOM References (strictly zero unsafe HTML assignment)
  const elGlobeSection = document.getElementById('globe-section');
  const elCountryList = document.getElementById('country-list-view');
  const elCountryDetail = document.getElementById('country-detail-view');
  const elSidebar = document.getElementById('left-sidebar');
  const elSidebarHeading = document.getElementById('sidebar-heading');
  const elTabAllCountries = document.getElementById('tab-all-countries');
  const elTabCountryItems = document.getElementById('tab-country-items');
  const elSearchInput = document.getElementById('country-search-input');
  const elSearchClearBtn = document.getElementById('search-clear-btn');
  const elDetailTitle = document.getElementById('detail-country-title');
  const elKpiArtifacts = document.getElementById('kpi-artifacts');
  const elKpiDates = document.getElementById('kpi-dates');
  const elThumbGrid = document.getElementById('artifact-thumb-grid');
  const elHeaderSub = document.getElementById('header-sub');
  const elActiveBanner = document.getElementById('active-country-banner');
  const elFlightBanner = document.getElementById('flight-banner');
  const elTooltip = document.getElementById('globe-tooltip');
  const elModal = document.getElementById('artifact-modal');
  const elModalPreviewBtn = document.getElementById('modal-preview-wrap');
  const elModalCanvas = document.getElementById('modal-preview-canvas');
  const elModalCountryPill = document.getElementById('modal-country-pill');
  const elModalRegPill = document.getElementById('modal-reg-pill');
  const elModalTitle = document.getElementById('modal-title');
  const elModalMeta = document.getElementById('modal-meta');
  const elModalDesc = document.getElementById('modal-desc');
  const elModalLink = document.getElementById('modal-bm-link');
  const elModalCountryBmLink = document.getElementById('modal-country-bm-link');
  const elModalZoomBtn = document.getElementById('modal-zoom-btn');
  const elCopyLinkBtn = document.getElementById('modal-copy-link-btn');
  const elLightbox = document.getElementById('photo-lightbox');
  const elLightboxCanvas = document.getElementById('lightbox-canvas');
  const elLightboxImg = document.getElementById('lightbox-hd-img');
  const elLightboxKicker = document.getElementById('lightbox-kicker');
  const elLightboxTitle = document.getElementById('lightbox-title');
  const elLightboxDesc = document.getElementById('lightbox-desc');
  const elLightboxBmLink = document.getElementById('lightbox-bm-link');
  const elLightboxCountryBmLink = document.getElementById('lightbox-country-bm-link');
  const elLightboxLocateBtn = document.getElementById('lightbox-locate-btn');
  const elMasterpiecesGrid = document.getElementById('masterpieces-grid');
  const elTopOriginsBars = document.getElementById('top-origins-bars');
  const elMuseumsCompareBars = document.getElementById('museums-compare-bars');
  const elNavMuseumDropdown = document.getElementById('nav-museum-dropdown');
  const elNavMuseumTrigger = document.getElementById('nav-museum-trigger');
  const elNavMuseumCurrent = document.getElementById('nav-museum-current');
  const elNavMuseumMenu = document.getElementById('nav-museum-menu');
  const elSidebarMuseumDropdown = document.getElementById('sidebar-museum-dropdown');
  const elSidebarMuseumTrigger = document.getElementById('sidebar-museum-trigger');
  const elSidebarMuseumCurrent = document.getElementById('sidebar-museum-current');
  const elSidebarMuseumMeta = document.getElementById('sidebar-museum-meta');
  const elSidebarMuseumMenu = document.getElementById('sidebar-museum-menu');
  const elSidebarMuseumSwitcher = document.getElementById('sidebar-museum-switcher');
  const elSidebarHomelandSwitcher = document.getElementById('sidebar-homeland-switcher');
  const elSidebarHomelandDropdown = document.getElementById('sidebar-homeland-dropdown');
  const elSidebarHomelandTrigger = document.getElementById('sidebar-homeland-trigger');
  const elSidebarHomelandCurrent = document.getElementById('sidebar-homeland-current');
  const elSidebarHomelandMeta = document.getElementById('sidebar-homeland-meta');
  const elSidebarHomelandMenu = document.getElementById('sidebar-homeland-menu');
  const elLensByMuseum = document.getElementById('lens-by-museum');
  const elLensByHomeland = document.getElementById('lens-by-homeland');
  const elHomelandBreakdown = document.getElementById('homeland-museum-breakdown');
  const elKpiLblLeft = document.getElementById('kpi-lbl-left');
  const elKpiLblRight = document.getElementById('kpi-lbl-right');
  const elModalMuseumPill = document.getElementById('modal-museum-pill');
  const elModalHomelandFlipBtn = document.getElementById('modal-homeland-flip-btn');
  const elTimelineScrubber = document.getElementById('timeline-scrubber');
  const elTlPlayBtn = document.getElementById('tl-play-btn');
  const elTlYearBadge = document.getElementById('tl-year-badge');
  const elTlSlider = document.getElementById('tl-slider');
  const elTlCountReadout = document.getElementById('tl-count-readout');
  const elTlResetBtn = document.getElementById('tl-reset-btn');
  const elTlCloseBtn = document.getElementById('tl-close-btn');
  const elTlMilestones = document.getElementById('tl-milestones');
  const elTlEraCaption = document.getElementById('tl-era-caption');
  const elBtnTimeline = document.getElementById('btn-timeline');
  const elStatCountriesWord = document.getElementById('stat-countries-word');
  const elScopeActiveMuseum = document.getElementById('scope-active-museum');
  const elScopeAllMuseums = document.getElementById('scope-all-museums');
  const elGallerySearchInput = document.getElementById('gallery-search-input');
  const elGallerySearchClear = document.getElementById('gallery-search-clear');

  function closeAllMuseumDropdowns() {
    if (elNavMuseumDropdown && elNavMuseumTrigger) {
      elNavMuseumDropdown.classList.remove('open');
      elNavMuseumTrigger.setAttribute('aria-expanded', 'false');
    }
    if (elSidebarMuseumDropdown && elSidebarMuseumTrigger) {
      elSidebarMuseumDropdown.classList.remove('open');
      elSidebarMuseumTrigger.setAttribute('aria-expanded', 'false');
    }
    if (elSidebarHomelandDropdown && elSidebarHomelandTrigger) {
      elSidebarHomelandDropdown.classList.remove('open');
      elSidebarHomelandTrigger.setAttribute('aria-expanded', 'false');
    }
  }

  function renderHomelandDropdownMenu() {
    if (!elSidebarHomelandMenu) return;
    const catalog = getHomelandCatalog();
    const activeEntry = getHomelandEntry(state.homelandCountryEn);
    const activeName = countryName(activeEntry);
    if (elSidebarHomelandCurrent) elSidebarHomelandCurrent.textContent = activeName;
    if (elSidebarHomelandMeta) {
      elSidebarHomelandMeta.textContent = state.lang === 'zh'
        ? (fmtNum(activeEntry.totalCount) + '件 · ' + fmtNum(activeEntry.holdings.length) + '馆')
        : (fmtNum(activeEntry.totalCount) + ' · ' + fmtNum(activeEntry.holdings.length) + 'M');
    }

    elSidebarHomelandMenu.replaceChildren();
    const frag = document.createDocumentFragment();
    for (let i = 0; i < catalog.length; i++) {
      const hc = catalog[i];
      const isCur = hc.en === state.homelandCountryEn;
      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'md-option' + (isCur ? ' active' : '');
      opt.setAttribute('role', 'option');
      opt.setAttribute('aria-selected', String(isCur));
      opt.addEventListener('click', (ev) => {
        ev.stopPropagation();
        closeAllMuseumDropdowns();
        focusHomeland(hc.en);
      });

      const left = document.createElement('span');
      left.className = 'md-opt-left';
      const nm = document.createElement('span');
      nm.className = 'md-opt-name';
      nm.textContent = (isCur ? '✓ ' : '') + countryName(hc);
      const meta = document.createElement('span');
      meta.className = 'md-opt-city';
      meta.textContent = state.lang === 'zh'
        ? (fmtNum(hc.holdings.length) + ' 座博物馆' + (hc.curatedCount ? (' · ' + fmtNum(hc.curatedCount) + ' 件名作') : ''))
        : (fmtNum(hc.holdings.length) + ' museums' + (hc.curatedCount ? (' · ' + fmtNum(hc.curatedCount) + ' HD plates') : ''));
      left.appendChild(nm);
      left.appendChild(meta);

      const cnt = document.createElement('span');
      cnt.className = 'md-opt-count';
      cnt.textContent = fmtNum(hc.totalCount);

      opt.appendChild(left);
      opt.appendChild(cnt);
      frag.appendChild(opt);
    }
    elSidebarHomelandMenu.appendChild(frag);
  }

  function syncLensSwitcherUI() {
    const isHomeland = state.globeLens === 'homeland';
    const nHomelands = getHomelandCatalog().length;
    if (elLensByMuseum) {
      elLensByMuseum.classList.toggle('active', !isHomeland);
      elLensByMuseum.setAttribute('aria-pressed', String(!isHomeland));
      elLensByMuseum.textContent = state.lang === 'zh' ? '按博物馆 (10)' : 'By Museum (10)';
    }
    if (elLensByHomeland) {
      elLensByHomeland.classList.toggle('active', isHomeland);
      elLensByHomeland.setAttribute('aria-pressed', String(isHomeland));
      elLensByHomeland.textContent = state.lang === 'zh'
        ? ('按原属国 (' + fmtNum(nHomelands) + ')')
        : ('By Homeland (' + fmtNum(nHomelands) + ')');
    }
    if (elSidebarMuseumSwitcher) {
      elSidebarMuseumSwitcher.classList.toggle('is-hidden', isHomeland);
    }
    if (elSidebarHomelandSwitcher) {
      elSidebarHomelandSwitcher.classList.toggle('is-hidden', !isHomeland);
      const lbl = elSidebarHomelandSwitcher.querySelector('.sidebar-museum-label');
      if (lbl) {
        lbl.textContent = state.lang === 'zh'
          ? ('原属国十馆流散 (' + fmtNum(nHomelands) + ')')
          : ('Homeland Dispersal (' + fmtNum(nHomelands) + ')');
      }
    }
    if (elStatCountriesWord) {
      elStatCountriesWord.textContent = isHomeland
        ? (state.homelandListTabActive ? t('dockCountriesWord') : t('dockMuseumsWord'))
        : t('dockCountriesWord');
    }
  }

  function timelineWaveSpan() {
    return Math.max(18, Math.round((state.tlMaxYear - state.tlMinYear) * 0.10));
  }

  function timelineEndCursor() {
    return state.tlMaxYear + timelineWaveSpan();
  }

  function displayedTimelineYear() {
    return Math.min(state.tlMaxYear, Math.round(state.timelineYear));
  }

  function refreshSidebarForTimeline() {
    if (!state.countries.length) return;
    if (state.selectedCountry) {
      selectCountry(state.selectedCountry, true);
    } else {
      renderCountryList();
    }
  }

  function renderTimelineMilestones() {
    if (!elTlMilestones) return;
    elTlMilestones.replaceChildren();
    const frag = document.createDocumentFragment();
    const endCur = timelineEndCursor();
    const isAllLanded = state.timelineActive && state.timelineYear >= endCur - 1;

    for (let i = 0; i < HISTORICAL_MILESTONES.length; i++) {
      const ms = HISTORICAL_MILESTONES[i];
      if (ms.year < state.tlMinYear - 25 || ms.year > state.tlMaxYear) continue;
      const clampedYr = Math.max(state.tlMinYear, Math.min(state.tlMaxYear, ms.year));
      const chip = document.createElement('button');
      chip.type = 'button';
      const isAct = state.timelineActive && !isAllLanded && Math.abs(state.timelineYear - clampedYr) <= 8;
      chip.className = 'tl-milestone-chip' + (isAct ? ' active' : '');
      chip.textContent = state.lang === 'zh' ? ms.zh : ms.en;
      chip.title = state.lang === 'zh' ? ms.noteZh : ms.noteEn;
      chip.addEventListener('click', () => {
        state.timelinePlaying = false;
        setTimelineYear(clampedYr, true);
      });
      frag.appendChild(chip);
    }

    const landedChip = document.createElement('button');
    landedChip.type = 'button';
    landedChip.className = 'tl-milestone-chip' + (isAllLanded ? ' active' : '');
    landedChip.textContent = state.tlMaxYear + ' · ' + t('tlLandedChip');
    landedChip.addEventListener('click', () => {
      state.timelinePlaying = false;
      setTimelineYear(endCur, true);
    });
    frag.appendChild(landedChip);

    elTlMilestones.appendChild(frag);
  }

  function activeMilestoneNote(yr) {
    let best = null;
    let bestDist = 999;
    for (let i = 0; i < HISTORICAL_MILESTONES.length; i++) {
      const d = Math.abs(HISTORICAL_MILESTONES[i].year - yr);
      if (d < bestDist && d <= 28) {
        best = HISTORICAL_MILESTONES[i];
        bestDist = d;
      }
    }
    if (!best) return '';
    return state.lang === 'zh' ? best.noteZh : best.noteEn;
  }

  function syncTimelineScrubberUI() {
    if (!elTimelineScrubber) return;
    elTimelineScrubber.classList.toggle('open', state.timelineVisible);
    if (elBtnTimeline) elBtnTimeline.classList.toggle('active', state.timelineVisible);
    if (elModal) elModal.classList.toggle('scrubber-offset', state.timelineVisible);

    const endCur = timelineEndCursor();
    if (elTlSlider) {
      elTlSlider.min = String(state.tlMinYear);
      elTlSlider.max = String(endCur);
      elTlSlider.value = String(Math.round(state.timelineYear));
    }
    if (elTlPlayBtn) {
      elTlPlayBtn.textContent = state.timelinePlaying ? '⏸' : '▶';
    }
    if (elTlResetBtn) {
      elTlResetBtn.classList.toggle('active', !state.timelineActive);
      elTlResetBtn.textContent = t('tlAllYearsBtn');
    }

    const total = state.artifacts.length;
    if (!state.timelineActive) {
      if (elTlYearBadge) elTlYearBadge.textContent = state.tlMinYear + '–' + state.tlMaxYear;
      if (elTlCountReadout) {
        elTlCountReadout.textContent = state.lang === 'zh'
          ? ('共 ' + fmtNum(total) + ' 件')
          : (fmtNum(total) + ' items');
      }
      if (elTlEraCaption) elTlEraCaption.textContent = t('tlDefaultHint');
    } else {
      const yr = displayedTimelineYear();
      const isLanded = state.timelineYear >= endCur - 0.5;
      const isLandingRunway = state.timelineYear > state.tlMaxYear && !isLanded;
      let acqCnt = 0;
      for (let i = 0; i < total; i++) {
        if (state.artifacts[i].acqYear <= yr) acqCnt++;
      }
      const pct = total > 0 ? Math.round((acqCnt / total) * 100) : 0;
      if (elTlYearBadge) {
        if (isLanded) {
          elTlYearBadge.textContent = state.lang === 'zh' ? (yr + ' ✓ 落馆') : (yr + ' ✓');
        } else {
          elTlYearBadge.textContent = state.lang === 'zh' ? (yr + ' 年') : String(yr);
        }
      }
      if (elTlCountReadout) {
        elTlCountReadout.textContent = fmtNum(acqCnt) + ' / ' + fmtNum(total) + ' (' + pct + '%)';
      }
      if (elTlEraCaption) {
        if (isLanded) {
          if (state.globeLens === 'homeland') {
            const entry = getHomelandEntry(state.homelandCountryEn);
            elTlEraCaption.textContent = state.lang === 'zh'
              ? ('全部 ' + fmtNum(total) + ' 件' + countryName(entry) + '文物已抵达并落位全球 ' + fmtNum(entry.holdings.length) + ' 座博物馆')
              : ('All ' + fmtNum(total) + ' ' + countryName(entry) + ' works have completed flight and landed across ' + fmtNum(entry.holdings.length) + ' museums');
          } else {
            const mc = mCopy();
            elTlEraCaption.textContent = state.lang === 'zh'
              ? ('全部 ' + fmtNum(total) + ' 件入藏文物已飞抵并落位' + mc.hostCity + '（' + mc.shortName + '）')
              : ('All ' + fmtNum(total) + ' catalogued works have completed flight and landed in ' + mc.hostCity + ' (' + mc.shortName + ')');
          }
        } else if (isLandingRunway) {
          elTlEraCaption.textContent = state.lang === 'zh'
            ? ('收尾航段：最后一批入藏文物正降落至各馆坐标…')
            : ('Final landing phase — latest acquisitions touching down at destination museums…');
        } else {
          const note = activeMilestoneNote(yr);
          elTlEraCaption.textContent = note || (state.lang === 'zh'
            ? ('截至 ' + yr + ' 年已入藏 ' + fmtNum(acqCnt) + ' 件（未入藏年份暂隐）')
            : ('Acquired by ' + yr + ': ' + fmtNum(acqCnt) + ' works shown (later acquisitions hidden until acquired)'));
        }
      }
    }
    renderTimelineMilestones();
  }

  function setTimelineYear(yr, activate) {
    state.animatingFlight = false;
    elFlightBanner.classList.remove('visible');
    const endCur = timelineEndCursor();
    state.timelineYear = Math.max(state.tlMinYear, Math.min(endCur, yr));
    if (activate) state.timelineActive = true;
    syncTimelineScrubberUI();
    refreshSidebarForTimeline();
    updateCollectButtonUI();
  }

  function resetTimelineFilter() {
    state.timelinePlaying = false;
    state.timelineActive = false;
    state.isCollectedInHost = false;
    state.timelineYear = timelineEndCursor();
    syncTimelineScrubberUI();
    refreshSidebarForTimeline();
    updateCollectButtonUI();
  }

  function toggleTimelinePlayback() {
    if (!state.timelineVisible) {
      state.timelineVisible = true;
    }
    if (state.timelinePlaying) {
      state.timelinePlaying = false;
      syncTimelineScrubberUI();
      return;
    }
    state.animatingFlight = false;
    elFlightBanner.classList.remove('visible');
    const endCur = timelineEndCursor();
    if (!state.timelineActive || state.timelineYear >= endCur - 1) {
      state.timelineYear = state.tlMinYear;
    }
    state.timelineActive = true;
    state.timelinePlaying = true;
    syncTimelineScrubberUI();
    refreshSidebarForTimeline();
    updateCollectButtonUI();
  }

  function renderMuseumDropdownMenus() {
    const activeM = curMuseum();
    const activeCopy = mCopy();
    const activeArtCount = activeM.countriesSpec.reduce((s, r) => s + r[2], 0);
    if (elNavMuseumCurrent) elNavMuseumCurrent.textContent = activeCopy.shortName;
    if (elSidebarMuseumCurrent) elSidebarMuseumCurrent.textContent = activeCopy.shortName;
    if (elSidebarMuseumMeta) {
      elSidebarMuseumMeta.textContent = state.lang === 'zh'
        ? (activeCopy.hostCity + ' · ' + fmtNum(activeArtCount))
        : (activeCopy.hostCity + ' · ' + fmtNum(activeArtCount));
    }

    const targets = [elNavMuseumMenu, elSidebarMuseumMenu];
    for (let tIdx = 0; tIdx < targets.length; tIdx++) {
      const menuEl = targets[tIdx];
      if (!menuEl) continue;
      menuEl.replaceChildren();
      const frag = document.createDocumentFragment();
      for (let i = 0; i < SUPPORTED_MUSEUMS.length; i++) {
        const mid = SUPPORTED_MUSEUMS[i];
        const m = MUSEUMS[mid];
        if (!m) continue;
        const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
        const totalCnt = m.countriesSpec.reduce((s, r) => s + r[2], 0);
        const isCurrent = mid === state.museumId;

        const opt = document.createElement('button');
        opt.type = 'button';
        opt.className = 'md-option' + (isCurrent ? ' active' : '');
        opt.setAttribute('role', 'option');
        opt.setAttribute('aria-selected', String(isCurrent));
        opt.addEventListener('click', (ev) => {
          ev.stopPropagation();
          closeAllMuseumDropdowns();
          switchMuseum(mid);
        });

        const left = document.createElement('span');
        left.className = 'md-opt-left';
        const nm = document.createElement('span');
        nm.className = 'md-opt-name';
        nm.textContent = (isCurrent ? '✓ ' : '') + mc.shortName;
        const city = document.createElement('span');
        city.className = 'md-opt-city';
        city.textContent = mc.hostCity + ' · ' + m.acqStart + '–' + m.acqEnd;
        left.appendChild(nm);
        left.appendChild(city);

        const cnt = document.createElement('span');
        cnt.className = 'md-opt-count';
        cnt.textContent = fmtNum(totalCnt);

        opt.appendChild(left);
        opt.appendChild(cnt);
        frag.appendChild(opt);
      }
      menuEl.appendChild(frag);
    }
  }

  function renderMuseumsCompareBars() {
    if (!elMuseumsCompareBars) return;
    elMuseumsCompareBars.replaceChildren();
    const frag = document.createDocumentFragment();
    let maxTotal = 5468;
    const rows = [];
    for (let i = 0; i < SUPPORTED_MUSEUMS.length; i++) {
      const mid = SUPPORTED_MUSEUMS[i];
      const m = MUSEUMS[mid];
      if (!m) continue;
      let total = 0;
      let hostCnt = 0;
      for (let r = 0; r < m.countriesSpec.length; r++) {
        const cRow = m.countriesSpec[r];
        total += cRow[2];
        if (m.hostCountryEn && cRow[0] === m.hostCountryEn) hostCnt += cRow[2];
      }
      if (total > maxTotal) maxTotal = total;
      rows.push({ mid, m, total, hostCnt, intlCnt: Math.max(0, total - hostCnt) });
    }
    rows.sort((a, b) => b.total - a.total);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mc = (row.m.copy && row.m.copy[state.lang]) || row.m.copy.en;
      const isAct = row.mid === state.museumId;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'compare-row-btn' + (isAct ? ' active' : '');
      btn.addEventListener('click', () => {
        switchMuseum(row.mid).then(() => {
          scrollGlobeIntoView();
        });
      });

      const lbl = document.createElement('span');
      lbl.className = 'compare-row-label';
      const nm = document.createElement('span');
      nm.className = 'compare-row-name';
      nm.textContent = mc.shortName;
      const sub = document.createElement('span');
      sub.className = 'compare-row-sub';
      sub.textContent = state.lang === 'zh'
        ? (mc.hostCity + ' · 本土 ' + fmtNum(row.hostCnt) + ' / 跨国 ' + fmtNum(row.intlCnt))
        : (mc.hostCity + ' · ' + fmtNum(row.hostCnt) + ' host / ' + fmtNum(row.intlCnt) + ' intl');
      lbl.appendChild(nm);
      lbl.appendChild(sub);

      const rail = document.createElement('span');
      rail.className = 'compare-bar-rail';
      const hostPct = Math.round((row.hostCnt / maxTotal) * 1000) / 10;
      const intlPct = Math.round((row.intlCnt / maxTotal) * 1000) / 10;
      const hSeg = document.createElement('span');
      hSeg.className = 'compare-bar-host';
      hSeg.style.width = hostPct + '%';
      const iSeg = document.createElement('span');
      iSeg.className = 'compare-bar-intl';
      iSeg.style.width = intlPct + '%';
      rail.appendChild(hSeg);
      rail.appendChild(iSeg);

      const num = document.createElement('span');
      num.className = 'compare-row-num';
      num.textContent = fmtNum(row.total);

      btn.appendChild(lbl);
      btn.appendChild(rail);
      btn.appendChild(num);
      frag.appendChild(btn);
    }
    elMuseumsCompareBars.appendChild(frag);
  }

  function updateStageHeaderSub() {
    if (state.globeLens === 'homeland') {
      const entry = getHomelandEntry(state.homelandCountryEn);
      const cName = countryName(entry);
      if (state.lang === 'zh') {
        elHeaderSub.textContent = cName + '原属文物 · ' + fmtNum(entry.totalCount) + ' 件 · 流散于 ' + fmtNum(entry.holdings.length) + ' 座世界博物馆';
      } else {
        elHeaderSub.textContent = cName + ' Provenance · ' + fmtNum(entry.totalCount) + ' artifacts across ' + fmtNum(entry.holdings.length) + ' museums';
      }
      return;
    }
    const mc = mCopy();
    const nArt = state.artifacts.length || curMuseum().countriesSpec.reduce((s, r) => s + r[2], 0);
    const nCnt = state.countries.length || curMuseum().countriesSpec.length;
    if (state.lang === 'zh') {
      elHeaderSub.textContent = mc.shortName + ' · ' + fmtNum(nArt) + ' 件文物 · ' + fmtNum(nCnt) + ' 个国家';
    } else {
      elHeaderSub.textContent = mc.shortName + ' · ' + fmtNum(nArt) + ' artifacts · ' + fmtNum(nCnt) + ' countries';
    }
  }

  function updateRegionFilterTabs() {
    const srcList = currentGallerySourceList();
    const q = state.gallerySearchQuery;
    const counts = { all: 0, host: 0, asia: 0, egypt: 0, neareast: 0, med: 0, africa: 0, americas: 0 };
    for (let i = 0; i < srcList.length; i++) {
      if (!galleryItemMatchesSearch(srcList[i], q)) continue;
      counts.all++;
      const r = srcList[i].region;
      if (counts[r] !== undefined) counts[r]++;
    }
    if (state.galleryRegion !== 'all' && !counts[state.galleryRegion]) {
      state.galleryRegion = 'all';
    }

    if (elScopeActiveMuseum && elScopeAllMuseums) {
      const m = curMuseum();
      const mc = mCopy();
      const mCurCnt = Object.values(m.featuredByCountry).reduce((s, arr) => s + arr.length, 0);
      const allCurCnt = getAllMuseumsHighlights().length;
      elScopeActiveMuseum.textContent = mc.shortName + ' (' + fmtNum(mCurCnt) + ')';
      elScopeAllMuseums.textContent = state.lang === 'zh'
        ? ('十大馆全览 (' + fmtNum(allCurCnt) + ')')
        : ('All 10 Museums (' + fmtNum(allCurCnt) + ')');
      elScopeActiveMuseum.classList.toggle('active', !state.galleryAllMuseums);
      elScopeActiveMuseum.setAttribute('aria-pressed', String(!state.galleryAllMuseums));
      elScopeAllMuseums.classList.toggle('active', state.galleryAllMuseums);
      elScopeAllMuseums.setAttribute('aria-pressed', String(state.galleryAllMuseums));

      const elSec3Eye = document.querySelector('[data-i18n="sec3Eyebrow"]');
      const elSec3Title = document.querySelector('[data-i18n="sec3Title"]');
      const elSec3Intro = document.querySelector('[data-i18n="sec3Intro"]');
      if (state.galleryAllMuseums) {
        if (elSec3Eye) {
          elSec3Eye.textContent = state.lang === 'zh'
            ? '03 · 全球十大博物馆联合镇馆图录'
            : '03 · Combined 10-Museum Archival Plates';
        }
        if (elSec3Title) {
          elSec3Title.textContent = state.lang === 'zh'
            ? ('十大世界博物馆全部 ' + fmtNum(allCurCnt) + ' 件镇馆名作')
            : (fmtNum(allCurCnt) + ' Iconic Masterpieces Across All 10 World Museums');
        }
        if (elSec3Intro) {
          elSec3Intro.textContent = state.lang === 'zh'
            ? '跨馆联合检索十大世界博物馆精选高清实拍影像；点击任意“地球仪定位 ↑”将自动切换至所属博物馆并飞往故土坐标。'
            : 'Browse and filter verified photography across all 10 museums together—clicking Locate on Globe ↑ automatically switches to that museum and flies to its homeland pin.';
        }
      } else {
        const nCurCountries = Object.keys(m.featuredByCountry).length;
        if (elSec3Eye) elSec3Eye.textContent = mc.sec3Eyebrow;
        if (elSec3Title) {
          elSec3Title.textContent = state.lang === 'zh'
            ? ('横跨 ' + fmtNum(nCurCountries) + ' 国的 ' + fmtNum(mCurCnt) + ' 件镇馆名作')
            : (fmtNum(mCurCnt) + ' Iconic Masterpieces Across ' + fmtNum(nCurCountries) + ' Countries');
        }
        if (elSec3Intro) {
          elSec3Intro.textContent = state.lang === 'zh'
            ? ('以下每件馆藏名作均采用 ' + mc.name + ' 高清实拍影像，点击可直接前往官方藏品档案页，或点击“地球仪定位 ↑”飞往其故土坐标。')
            : ('Every plate below features verified ' + mc.name + ' photography and links directly to its official museum record—or click Locate on Globe ↑ to fly to its homeland pin.');
        }
      }
    }

    const rLabels = REGION_LABELS[state.lang] || REGION_LABELS.en;
    const tabs = document.querySelectorAll('#region-filters .filter-tab');
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      const r = tab.getAttribute('data-region') || 'all';
      const cnt = counts[r] || 0;
      if (r === 'all') {
        tab.textContent = state.lang === 'zh' ? ('全部 ' + fmtNum(cnt) + ' 件名作') : ('All ' + fmtNum(cnt) + ' Plates');
        tab.style.display = '';
      } else {
        tab.textContent = (rLabels[r] || r) + ' (' + fmtNum(cnt) + ')';
        tab.style.display = cnt > 0 ? '' : 'none';
      }
      const isAct = r === state.galleryRegion;
      tab.classList.toggle('active', isAct);
      tab.setAttribute('aria-selected', String(isAct));
    }
  }

  function applyStaticAndMuseumTranslations() {
    const m = curMuseum();
    const mc = mCopy();
    const nArt = m.countriesSpec.reduce((s, r) => s + r[2], 0);
    const nCnt = m.countriesSpec.length;
    const nCur = Object.values(m.featuredByCountry).reduce((s, arr) => s + arr.length, 0);
    const nCurCountries = Object.keys(m.featuredByCountry).length;
    const nPlates = m.atlasCols * m.atlasRows;

    document.documentElement.lang = t('htmlLang');
    document.title = state.lang === 'zh'
      ? ('文物档案库 · ' + mc.shortName + ' — 十大世界博物馆 3D 馆藏展')
      : ('Artifacts Archive · ' + mc.shortName + ' — 10-Museum 3D Provenance');

    const textNodes = document.querySelectorAll('[data-i18n]');
    for (let i = 0; i < textNodes.length; i++) {
      const key = textNodes[i].getAttribute('data-i18n');
      if (key && I18N[state.lang] && I18N[state.lang][key] !== undefined) {
        textNodes[i].textContent = t(key);
      }
    }

    const phNodes = document.querySelectorAll('[data-i18n-placeholder]');
    for (let i = 0; i < phNodes.length; i++) {
      const key = phNodes[i].getAttribute('data-i18n-placeholder');
      if (key) phNodes[i].setAttribute('placeholder', t(key));
    }

    const titleNodes = document.querySelectorAll('[data-i18n-title]');
    for (let i = 0; i < titleNodes.length; i++) {
      const key = titleNodes[i].getAttribute('data-i18n-title');
      if (key && I18N[state.lang] && I18N[state.lang][key] !== undefined) {
        titleNodes[i].setAttribute('title', t(key));
      }
    }

    // Active states on language pills & museum switcher buttons
    const langBtns = document.querySelectorAll('.lang-btn[data-lang]');
    for (let i = 0; i < langBtns.length; i++) {
      const isAct = langBtns[i].getAttribute('data-lang') === state.lang;
      langBtns[i].classList.toggle('active', isAct);
      langBtns[i].setAttribute('aria-pressed', String(isAct));
    }

    const museumBtns = document.querySelectorAll('[data-museum]');
    for (let i = 0; i < museumBtns.length; i++) {
      const isAct = museumBtns[i].getAttribute('data-museum') === m.id;
      museumBtns[i].classList.toggle('active', isAct);
      museumBtns[i].setAttribute('aria-pressed', String(isAct));
    }

    // Dynamic Museum Copy: Navbar + Hero + Ledger
    const navMst = document.querySelector('[data-i18n="navMasterpieces"]');
    if (navMst) {
      navMst.textContent = state.lang === 'zh' ? ('03 · ' + fmtNum(nCur) + '件镇馆名作') : ('03 · ' + fmtNum(nCur) + ' Masterpieces');
    }
    const navCta = document.querySelector('[data-i18n="navReturnCta"]');
    if (navCta) {
      navCta.textContent = state.lang === 'zh'
        ? ('一键回家 (' + mc.shortHost + ' → ' + fmtNum(nCnt) + '国)')
        : ('Return Home (' + mc.shortHost + ' → ' + fmtNum(nCnt) + ')');
    }

    const elKicker = document.querySelector('[data-i18n="heroKicker"]');
    if (elKicker) elKicker.textContent = mc.kicker;
    const elSub = document.querySelector('[data-i18n="heroSubtitle"]');
    if (elSub) elSub.textContent = mc.subtitle;
    const elLede = document.getElementById('hero-lede');
    if (elLede) elLede.textContent = mc.lede;

    const elHeroRet = document.querySelector('[data-i18n="heroReturnBtn"]');
    if (elHeroRet) {
      elHeroRet.textContent = state.lang === 'zh'
        ? ('一键文物回家（' + mc.shortHost + ' → ' + fmtNum(nCnt) + '个国家）')
        : ('One-Click Return Home (' + mc.shortHost + ' → ' + fmtNum(nCnt) + ' Countries)');
    }
    const elHeroBrowse = document.getElementById('hero-explore-gallery-link');
    if (elHeroBrowse) {
      elHeroBrowse.textContent = state.lang === 'zh'
        ? ('浏览 ' + fmtNum(nCur) + ' 件镇馆名作 ↓')
        : ('Browse ' + fmtNum(nCur) + ' Curated Masterpieces ↓');
    }

    const elLedArt = document.getElementById('ledger-num-artifacts');
    const elLedCnt = document.getElementById('ledger-num-countries');
    const elLedTime = document.getElementById('ledger-num-timeline');
    const elLedMst = document.getElementById('ledger-num-masterpieces');
    if (elLedArt) elLedArt.textContent = fmtNum(nArt);
    if (elLedCnt) elLedCnt.textContent = fmtNum(nCnt);
    if (elLedTime) elLedTime.textContent = m.acqStart + '–' + m.acqEnd;
    if (elLedMst) elLedMst.textContent = fmtNum(nCur);

    // Sidebar dynamic counts
    const elBackAll = document.querySelector('[data-i18n="backAll99"]');
    if (elBackAll) {
      const backTotal = state.globeLens === 'homeland' ? getHomelandCatalog().length : nCnt;
      elBackAll.textContent = state.lang === 'zh' ? ('全部 ' + fmtNum(backTotal) + ' 国') : ('All ' + fmtNum(backTotal));
    }

    const onX20 = (window.location.pathname || '').includes('/www/');
    const stHref = (onX20 ? './artifacts-stories.html' : './stories.html') + (state.lang === 'zh' ? '#lang=zh' : '');
    const caHref = (onX20 ? './artifacts-creation-age.html' : './creation-age.html') + (state.lang === 'zh' ? '#lang=zh' : '');
    const catBase = onX20 ? './artifacts-catalog.html' : './catalog.html';
    const catHref = catBase + (state.lang === 'zh' ? '#lang=zh' : '');
    const elNavSt = document.getElementById('nav-stories-link');
    const elHeroSt = document.getElementById('hero-stories-link');
    const elFootSt = document.getElementById('footer-stories-link');
    const elNavCa = document.getElementById('nav-creation-age-link');
    const elFootCa = document.getElementById('footer-creation-link');
    const elTlCa = document.getElementById('tl-creation-page-link');
    const elNavCat = document.getElementById('nav-catalog-link');
    const elHeroCat = document.getElementById('hero-full-catalog-link');
    const elFootCat = document.getElementById('footer-catalog-link');
    const elGalCat = document.getElementById('gallery-full-catalog-link');
    if (elNavSt) elNavSt.href = stHref;
    if (elHeroSt) elHeroSt.href = stHref;
    if (elFootSt) elFootSt.href = stHref;
    if (elNavCa) elNavCa.href = caHref;
    if (elFootCa) elFootCa.href = caHref;
    if (elTlCa) elTlCa.href = caHref;
    if (elNavCat) elNavCat.href = catHref;
    if (elHeroCat) elHeroCat.href = catHref;
    if (elFootCat) elFootCat.href = catHref;
    if (elGalCat) {
      const gp = [];
      if (state.lang === 'zh') gp.push('lang=zh');
      if (!state.galleryAllMuseums && state.museumId) gp.push('museum=' + encodeURIComponent(state.museumId));
      if (state.gallerySearchQuery) gp.push('q=' + encodeURIComponent(state.gallerySearchQuery));
      elGalCat.href = catBase + (gp.length ? ('#' + gp.join('&')) : '');
    }
    const globeCanvasEl = document.getElementById('globe-canvas');
    if (globeCanvasEl) {
      globeCanvasEl.setAttribute(
        'aria-label',
        state.globeLens === 'homeland'
          ? ('Interactive 3D provenance dispersal globe for ' + state.homelandCountryEn + ' across 10 world museums')
          : ('Interactive 3D globe of ' + fmtNum(nArt) + ' ' + mc.shortName + ' artifacts across ' + fmtNum(nCnt) + ' countries')
      );
    }

    // Section 03 Masterpieces Header
    const elSec3Eye = document.querySelector('[data-i18n="sec3Eyebrow"]');
    const elSec3Title = document.querySelector('[data-i18n="sec3Title"]');
    const elSec3Intro = document.querySelector('[data-i18n="sec3Intro"]');
    if (elSec3Eye) elSec3Eye.textContent = mc.sec3Eyebrow;
    if (elSec3Title) {
      elSec3Title.textContent = state.lang === 'zh'
        ? ('横跨 ' + fmtNum(nCurCountries) + ' 国的 ' + fmtNum(nCur) + ' 件镇馆名作')
        : (fmtNum(nCur) + ' Iconic Masterpieces Across ' + fmtNum(nCurCountries) + ' Countries');
    }
    if (elSec3Intro) {
      elSec3Intro.textContent = state.lang === 'zh'
        ? ('以下每件馆藏名作均采用 ' + mc.name + ' 高清实拍影像，点击可直接前往官方藏品档案页，或点击“地球仪定位 ↑”飞往其故土坐标。')
        : ('Every plate below features verified ' + mc.name + ' photography and links directly to its official museum record—or click Locate on Globe ↑ to fly to its homeland pin.');
    }

    // Section 04 Methodology & Footer
    const c0 = m.countriesSpec[0];
    const c1 = m.countriesSpec[1];
    const elSec4Intro = document.querySelector('[data-i18n="sec4Intro"]');
    const elM1Body = document.querySelector('[data-i18n="m1Body"]');
    const elM2Body = document.querySelector('[data-i18n="m2Body"]');
    const elM3Num = document.querySelector('[data-i18n="m3Num"]');
    const elM3Body = document.querySelector('[data-i18n="m3Body"]');
    if (elSec4Intro) elSec4Intro.textContent = mc.sec4Intro;
    if (elM1Body && c0 && c1) {
      const c0En = c0[0] === 'United States of America' ? 'United States' : c0[0];
      const c1En = c1[0] === 'United States of America' ? 'United States' : c1[0];
      elM1Body.textContent = state.lang === 'zh'
        ? ('传统地图往往把数百件文物堆叠在首都单点上。本项目基于 Natural Earth 110m 矢量国界，在每个国家内部按自适应经纬网格进行多边形内点采样（小岛国辅以黄金角螺旋排布），让 ' + fmtNum(c0[2]) + ' 件' + c0[1] + '文物或 ' + fmtNum(c1[2]) + ' 件' + c1[1] + '文物清晰拼合为国家级视觉矩阵。')
        : ('Naive maps stack hundreds of markers onto a single capital-city pin. Using Natural Earth 110m vector boundaries, each country’s interior is sampled on an adaptive latitude-longitude lattice (with a golden-angle spiral fallback for small islands) so all ' + fmtNum(c0[2]) + ' ' + c0En + ' or ' + fmtNum(c1[2]) + ' ' + c1En + ' works form a legible national mosaic.');
    }
    if (elM2Body) {
      elM2Body.textContent = state.lang === 'zh'
        ? ('每件文物均拥有双重球面单位向量：原属国国土坐标与' + mc.hostFull + '。入藏汇聚动画按 ' + m.acqStart + '–' + m.acqEnd + ' 年时序错峰起飞；点击“一键回家”则让全部 ' + fmtNum(nArt) + ' 张立牌沿三次缓动抛物大圆航线同步飞返 ' + fmtNum(nCnt) + ' 个故乡。')
        : ('Every artifact holds dual spherical unit vectors: its homeland grid coordinate and ' + mc.hostFull + '. Acquisition flights stagger departures between ' + m.acqStart + ' and ' + m.acqEnd + '; clicking Return Home launches all ' + fmtNum(nArt) + ' cards simultaneously along cubic-eased parabolic great-circle arcs back to their ' + fmtNum(nCnt) + ' origins.');
    }
    if (elM3Num) {
      elM3Num.textContent = state.lang === 'zh'
        ? ('方法 03 · ' + fmtNum(nPlates) + ' 幅高清图集与官方直连')
        : ('METHOD 03 · ' + fmtNum(nPlates) + '-PLATE HD ATLAS & DIRECT MUSEUM LINKS');
    }
    if (elM3Body) {
      elM3Body.textContent = state.lang === 'zh'
        ? ('正面半球全部 ' + fmtNum(nArt) + ' 张文物立牌经背面剔除与画家深度排序，从 ' + fmtNum(nPlates) + ' 幅高清 ' + mc.name + ' 精灵图集实时绘制——并逐一配对官方藏品档案页与各国图文检索目录直连。')
        : ('All ' + fmtNum(nArt) + ' front-hemisphere cards are backface-culled, painter-sorted by depth, and blitted from a ' + fmtNum(nPlates) + '-plate high-resolution ' + mc.name + ' sprite atlas—paired with direct links to official object records and illustrated country catalogues.');
    }

    const elFootCol = document.getElementById('footer-col-link');
    const elFootGal = document.getElementById('footer-gal-link');
    const elFootMst = document.querySelector('[data-i18n="footerMasterLink"]');
    if (elFootCol) {
      elFootCol.textContent = mc.footerCol;
      elFootCol.href = m.urls.collectionHome;
    }
    if (elFootGal) {
      elFootGal.textContent = mc.footerGal;
      elFootGal.href = m.urls.galleriesHome;
    }
    if (elFootMst) {
      elFootMst.textContent = state.lang === 'zh' ? (fmtNum(nCur) + '件名作 ↑') : (fmtNum(nCur) + ' Masterpieces ↑');
    }

    // Globe canvas accessible label
    const globeCnv = document.getElementById('globe-canvas');
    if (globeCnv) {
      globeCnv.setAttribute('aria-label', 'Interactive 3D globe of ' + fmtNum(nArt) + ' ' + mc.name + ' artifacts across ' + fmtNum(nCnt) + ' countries');
    }

    updateStageHeaderSub();
    syncLensSwitcherUI();
    renderMuseumDropdownMenus();
    renderHomelandDropdownMenu();
    renderMuseumsCompareBars();
    updateRegionFilterTabs();
    syncTimelineScrubberUI();
  }

  function setLanguage(newLang, skipHash) {
    const cleanLang = SUPPORTED_LANGS.includes(newLang) ? newLang : 'en';
    state.lang = cleanLang;
    applyStaticAndMuseumTranslations();
    rebuildRingEntries();
    updateCollectButtonUI();

    if (state.countries.length > 0) {
      if (state.selectedCountry) {
        selectCountry(state.selectedCountry, true);
      } else {
        selectCountry(null, true);
      }
      renderMasterpiecesGallery();
      renderTopOriginsBars();
      if (state.selectedArtifact && elModal.classList.contains('open')) {
        openArtifactModal(state.selectedArtifact, false, true);
      }
      if (state.lightboxArtifact && elLightbox.classList.contains('open')) {
        openLightbox(state.lightboxArtifact);
      }
    }

    if (!skipHash) {
      updateUrlHash(state.selectedCountry, state.selectedArtifact);
    }
  }

  function switchMuseum(newMuseumId, skipHash) {
    const cleanId = SUPPORTED_MUSEUMS.includes(newMuseumId) ? newMuseumId : 'bm';
    if (cleanId === state.museumId && state.globeLens === 'museum' && state.countries.length > 0) return Promise.resolve();

    state.globeLens = 'museum';
    state.homelandFilterMuseumId = null;
    state.homelandListTabActive = false;
    state.museumId = cleanId;
    state.animatingFlight = false;
    state.isCollectedInHost = false;
    state.timelinePlaying = false;
    state.timelineActive = false;
    state.selectedCountry = null;
    state.selectedArtifact = null;
    state.hoveredArtifact = null;
    state.hoveredMuseumPin = null;
    state.galleryRegion = 'all';
    state.galleryAllMuseums = false;
    closeAllMuseumDropdowns();
    elModal.classList.remove('open');
    closeLightbox();
    elFlightBanner.classList.remove('visible');

    const m = curMuseum();
    state.targetRotLon = m.defaultRotLonDeg * DEG2RAD;
    state.targetRotLat = m.defaultRotLatDeg * DEG2RAD;
    state.targetZoom = 1.0;

    // Immediately switch UI & dataset without blocking on WebP download (eliminates lag & race conditions)
    activeAtlas = atlasCache[cleanId] || null;
    ensureMuseumAtlas(cleanId);
    generateDatasetForActiveMuseum();
    applyStaticAndMuseumTranslations();
    updateCollectButtonUI();
    selectCountry(null, true);
    renderMasterpiecesGallery();
    renderTopOriginsBars();
    if (!skipHash) {
      updateUrlHash(null, null);
    }
    return Promise.resolve();
  }

  function focusHomeland(homelandEn, skipHash) {
    const entry = getHomelandEntry(homelandEn);
    state.globeLens = 'homeland';
    state.homelandCountryEn = entry.en;
    state.homelandFilterMuseumId = null;
    state.homelandListTabActive = false;
    state.animatingFlight = false;
    state.isCollectedInHost = false;
    state.timelinePlaying = false;
    state.timelineActive = false;
    state.selectedArtifact = null;
    state.hoveredArtifact = null;
    state.hoveredMuseumPin = null;
    closeAllMuseumDropdowns();
    elModal.classList.remove('open');
    closeLightbox();
    elFlightBanner.classList.remove('visible');

    state.autoRotate = false;
    document.getElementById('btn-rotate').classList.remove('active');
    state.targetRotLon = -entry.centerLon * DEG2RAD;
    state.targetRotLat = Math.max(-1.05, Math.min(1.05, entry.centerLat * DEG2RAD));
    state.targetZoom = 1.06;

    const neededMuseums = entry.holdings.map(h => h.museumId);
    for (let i = 0; i < neededMuseums.length; i++) {
      loadMuseumAtlas(neededMuseums[i], false);
    }
    generateDatasetForHomeland(entry.en);
    applyStaticAndMuseumTranslations();
    updateCollectButtonUI();
    selectCountry(state.selectedCountry, true);
    renderTopOriginsBars();
    if (!skipHash) {
      updateUrlHash(state.selectedCountry, null);
    }
    return Promise.resolve();
  }

  function setGlobeLens(newLens, targetHomelandEn, skipHash) {
    if (newLens === 'homeland') {
      const candidate = targetHomelandEn ||
        (state.selectedCountry && !state.selectedCountry.isHost ? state.selectedCountry.en : '') ||
        state.homelandCountryEn ||
        'China';
      return focusHomeland(candidate, skipHash);
    }
    if (state.globeLens === 'museum') return Promise.resolve();
    state.globeLens = 'museum';
    state.homelandFilterMuseumId = null;
    state.homelandListTabActive = false;
    state.animatingFlight = false;
    state.isCollectedInHost = false;
    state.timelinePlaying = false;
    state.timelineActive = false;
    state.selectedCountry = null;
    state.selectedArtifact = null;
    state.hoveredArtifact = null;
    state.hoveredMuseumPin = null;
    closeAllMuseumDropdowns();
    elModal.classList.remove('open');
    elFlightBanner.classList.remove('visible');

    const m = curMuseum();
    state.targetRotLon = m.defaultRotLonDeg * DEG2RAD;
    state.targetRotLat = m.defaultRotLatDeg * DEG2RAD;
    state.targetZoom = 1.0;

    activeAtlas = atlasCache[state.museumId] || null;
    ensureMuseumAtlas(state.museumId);
    generateDatasetForActiveMuseum();
    applyStaticAndMuseumTranslations();
    updateCollectButtonUI();
    selectCountry(null, true);
    renderTopOriginsBars();
    if (!skipHash) {
      updateUrlHash(null, null);
    }
    return Promise.resolve();
  }

  function setActiveNavSection(sectionId) {
    const links = document.querySelectorAll('.nav-links a[data-nav-section]');
    for (let i = 0; i < links.length; i++) {
      links[i].classList.toggle('active', links[i].getAttribute('data-nav-section') === sectionId);
    }
  }

  function scrollToSectionById(sectionId) {
    const target = document.getElementById(sectionId);
    if (!target) return;
    setActiveNavSection(sectionId);
    target.scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
  }

  function scrollGlobeIntoView() {
    scrollToSectionById('globe-section');
  }

  function ensureGlobeModalVisible() {
    const rect = elGlobeSection.getBoundingClientRect();
    if (rect.bottom > window.innerHeight + 36 || rect.top < -80) {
      elGlobeSection.scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
    }
  }

  function sanitizeQuery(raw) {
    if (typeof raw !== 'string') return '';
    return raw.replace(/[^\p{L}\p{N}\s\-.,']/gu, '').trim().slice(0, 60).toLowerCase();
  }

  function artifactMatchesQuery(art, q) {
    if (!q) return true;
    return (
      art.country.en.toLowerCase().includes(q) ||
      art.country.zh.includes(q) ||
      art.en.toLowerCase().includes(q) ||
      art.zh.includes(q) ||
      art.material.toLowerCase().includes(q) ||
      (art.materialZh && art.materialZh.includes(q)) ||
      (art.reg && art.reg.toLowerCase().includes(q))
    );
  }

  function countryAliasHit(enName, q) {
    if (enName === 'United Kingdom') return q === 'uk' || 'britain'.includes(q) || 'england'.includes(q);
    if (enName === 'United States of America') return q === 'us' || q === 'usa';
    if (enName === 'Netherlands') return q === 'nl' || 'holland'.includes(q) || 'dutch'.includes(q);
    if (enName === 'Italy' && state.museumId === 'vatican') return 'vatican'.includes(q) || 'rome'.includes(q) || q === '梵蒂冈' || q === '罗马';
    return false;
  }

  function countryMatchesQuery(country, q) {
    const tlActive = state.timelineActive && country.artifacts && country.artifacts.length > 0;
    const cutoffYr = tlActive ? displayedTimelineYear() : Infinity;
    const countryNameHit = Boolean(
      q && (
        country.en.toLowerCase().includes(q) ||
        country.zh.includes(q) ||
        countryAliasHit(country.en, q) ||
        (country.isHost && (q === 'host' || q === '本土'))
      )
    );
    if (!q && !tlActive) return { match: true, count: country.count };
    if (countryNameHit && !tlActive) return { match: true, count: country.count };
    if (!country.artifacts || !country.artifacts.length) {
      return { match: !q || countryNameHit, count: country.count };
    }
    let matchedCount = 0;
    for (let i = 0; i < country.artifacts.length; i++) {
      const art = country.artifacts[i];
      if (tlActive && art.acqYear > cutoffYr) continue;
      if (countryNameHit || artifactMatchesQuery(art, q)) matchedCount++;
    }
    return { match: matchedCount > 0, count: matchedCount };
  }

  function createSvgIcon(pathD, extraClass) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', extraClass ? ('gs-icon ' + extraClass) : 'gs-icon');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', pathD);
    svg.appendChild(path);
    return svg;
  }

  function setButtonWithIcon(btn, pathD, label) {
    const svg = createSvgIcon(pathD, 'gs-icon-left');
    btn.replaceChildren(svg, document.createTextNode(label));
  }

  function drawSpriteToCanvas(targetCanvas, spriteIdx, explicitMuseumId) {
    const mid = explicitMuseumId || state.museumId;
    targetCanvas.dataset.mid = mid;
    targetCanvas.dataset.sprite = String(spriteIdx);
    targetCanvas.dataset.cover = '0';
    const atl = atlasCache[mid] || (!explicitMuseumId ? activeAtlas : null);
    if (!atl || !atl.spriteAtlas) {
      loadMuseumAtlas(mid, mid === state.museumId);
      const c = targetCanvas.getContext('2d');
      c.fillStyle = '#241f1a';
      c.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
      return;
    }
    const c = targetCanvas.getContext('2d');
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    const ts = atl.tileSize;
    const sx = (spriteIdx % atl.cols) * ts;
    const sy = Math.floor(spriteIdx / atl.cols) * ts;
    c.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    c.drawImage(atl.spriteAtlas, sx, sy, ts, ts, 0, 0, targetCanvas.width, targetCanvas.height);
  }

  function drawCoverPlateToCanvas(targetCanvas, spriteIdx, explicitMuseumId) {
    const mid = explicitMuseumId || state.museumId;
    targetCanvas.dataset.mid = mid;
    targetCanvas.dataset.sprite = String(spriteIdx);
    targetCanvas.dataset.cover = '1';
    const atl = atlasCache[mid] || (!explicitMuseumId ? activeAtlas : null);
    if (!atl || !atl.spriteAtlas) {
      loadMuseumAtlas(mid, false);
      const c = targetCanvas.getContext('2d');
      c.fillStyle = '#241f1a';
      c.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
      return;
    }
    const c = targetCanvas.getContext('2d');
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    const ts = atl.tileSize;
    const sx = (spriteIdx % atl.cols) * ts;
    const sy = Math.floor(spriteIdx / atl.cols) * ts;
    const cropH = Math.round(ts * 0.75);
    const cropY = sy + Math.round((ts - cropH) * 0.40);
    c.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    c.drawImage(atl.spriteAtlas, sx, cropY, ts, cropH, 0, 0, targetCanvas.width, targetCanvas.height);
  }

  function buildDeepLinkHash(country, artifact) {
    const parts = [];
    if (state.globeLens === 'homeland') {
      parts.push('lens=homeland');
      parts.push('homeland=' + encodeURIComponent(state.homelandCountryEn));
      if (state.homelandFilterMuseumId) {
        parts.push('mfilter=' + encodeURIComponent(state.homelandFilterMuseumId));
      }
    } else if (state.museumId && state.museumId !== 'bm') {
      parts.push('museum=' + encodeURIComponent(state.museumId));
    }
    if (state.lang && state.lang !== 'en') {
      parts.push('lang=' + encodeURIComponent(state.lang));
    }
    if (state.timelineActive) {
      parts.push('year=' + String(Math.round(state.timelineYear)));
    }
    if (artifact) {
      if (state.globeLens !== 'homeland') {
        parts.push('country=' + encodeURIComponent(artifact.country.en));
      }
      parts.push('id=' + String(artifact.id));
    } else if (country && state.globeLens !== 'homeland') {
      parts.push('country=' + encodeURIComponent(country.en));
    }
    return parts.length ? ('#' + parts.join('&')) : '';
  }

  function updateUrlHash(country, artifact) {
    if (!window.history || !window.history.replaceState) return;
    const hash = buildDeepLinkHash(country, artifact);
    try {
      if (hash) {
        window.history.replaceState(null, '', hash);
      } else {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (_) {
      // Ignore SecurityError inside sandboxed Origin: null frames
    }
  }

  function allCountriesTabText() {
    if (state.globeLens === 'homeland') {
      const nH = getHomelandCatalog().length;
      return state.lang === 'zh' ? ('全部 ' + fmtNum(nH) + ' 原属国') : ('All ' + fmtNum(nH));
    }
    const nCnt = state.countries.length || curMuseum().countriesSpec.length;
    return state.lang === 'zh' ? ('全部 ' + fmtNum(nCnt) + ' 国') : (fmtNum(nCnt) + ' Countries');
  }

  function syncSidebarTabs() {
    const isAll = !state.selectedCountry;
    elTabAllCountries.classList.toggle('active', isAll);
    elTabAllCountries.setAttribute('aria-selected', String(isAll));
    elTabAllCountries.textContent = allCountriesTabText();
    elTabCountryItems.classList.toggle('active', !isAll);
    elTabCountryItems.setAttribute('aria-selected', String(!isAll));
    const focusC = state.selectedCountry || state.lastFocusedCountry || state.countries[0];
    if (focusC) {
      elTabCountryItems.textContent = countryName(focusC);
    }
  }

  function renderCountryList() {
    elCountryList.replaceChildren();
    const q = state.searchQuery;
    const isHomelandMode = state.globeLens === 'homeland';
    const maxCount = state.countries.length ? state.countries[0].count : 330;

    let shownCountries = 0;
    let shownArtifacts = 0;
    const frag = document.createDocumentFragment();

    for (let i = 0; i < state.countries.length; i++) {
      const c = state.countries[i];
      const matchInfo = countryMatchesQuery(c, q);
      if (!matchInfo.match) continue;
      shownCountries++;
      shownArtifacts += matchInfo.count;

      const isActiveHomeland = isHomelandMode && c.en === state.homelandCountryEn;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'country-row' + ((c.isHost || isActiveHomeland) ? ' is-host-row' : '');
      btn.addEventListener('click', () => {
        elSidebar.classList.remove('mobile-open');
        if (isHomelandMode) {
          focusHomeland(c.en);
        } else {
          selectCountry(c);
        }
      });

      const nameSpan = document.createElement('span');
      nameSpan.className = 'country-row-name';
      const labelText = document.createElement('span');
      labelText.className = 'country-row-label-text';
      labelText.textContent = countryName(c);
      nameSpan.appendChild(labelText);
      if (isHomelandMode && c.museumsCount) {
        const badge = document.createElement('span');
        badge.className = 'host-badge';
        badge.textContent = state.lang === 'zh' ? (c.museumsCount + '馆') : (c.museumsCount + 'M');
        nameSpan.appendChild(badge);
      } else if (c.isHost) {
        const badge = document.createElement('span');
        badge.className = 'host-badge';
        badge.textContent = hostBadgeText();
        nameSpan.appendChild(badge);
      }

      const rightWrap = document.createElement('span');
      rightWrap.className = 'country-row-right';

      const barTrack = document.createElement('span');
      barTrack.className = 'country-bar-track';
      const barFill = document.createElement('span');
      barFill.className = 'country-bar-fill';
      barFill.style.width = Math.max(8, Math.round((matchInfo.count / maxCount) * 100)) + '%';
      barTrack.appendChild(barFill);

      const countSpan = document.createElement('span');
      countSpan.className = 'country-row-count';
      countSpan.textContent = fmtNum(matchInfo.count);

      rightWrap.appendChild(barTrack);
      rightWrap.appendChild(countSpan);
      btn.appendChild(nameSpan);
      btn.appendChild(rightWrap);
      frag.appendChild(btn);
    }

    elCountryList.appendChild(frag);
    document.getElementById('stat-artifacts').textContent = fmtNum(shownArtifacts);
    document.getElementById('stat-countries').textContent = fmtNum(shownCountries);
  }

  function renderHomelandBreakdownUI(entry) {
    if (!elHomelandBreakdown) return;
    if (state.globeLens !== 'homeland' || !entry) {
      elHomelandBreakdown.classList.add('is-hidden');
      elHomelandBreakdown.classList.remove('bars-open');
      elHomelandBreakdown.replaceChildren();
      return;
    }

    elHomelandBreakdown.classList.remove('is-hidden');
    elHomelandBreakdown.classList.toggle('bars-open', Boolean(state.homelandBarsExpanded));
    elHomelandBreakdown.replaceChildren();

    const titleRow = document.createElement('div');
    titleRow.className = 'hm-break-title';
    const titleSpan = document.createElement('span');
    titleSpan.textContent = t('hmBreakTitle');
    titleRow.appendChild(titleSpan);

    const actionsWrap = document.createElement('span');
    actionsWrap.className = 'hm-break-actions';

    if (state.homelandFilterMuseumId) {
      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'hm-reset-chip';
      resetBtn.textContent = t('hmShowAllBtn');
      resetBtn.addEventListener('click', () => {
        state.homelandFilterMuseumId = null;
        selectCountry(state.selectedCountry, true);
        updateUrlHash(state.selectedCountry, state.selectedArtifact);
      });
      actionsWrap.appendChild(resetBtn);
    }

    const toggleBarsBtn = document.createElement('button');
    toggleBarsBtn.type = 'button';
    toggleBarsBtn.className = 'hm-toggle-bars-btn';
    toggleBarsBtn.textContent = state.homelandBarsExpanded
      ? (state.lang === 'zh' ? '精简 ▴' : 'Chips ▴')
      : (state.lang === 'zh' ? '条形图 ▾' : 'Bars ▾');
    toggleBarsBtn.addEventListener('click', () => {
      state.homelandBarsExpanded = !state.homelandBarsExpanded;
      renderHomelandBreakdownUI(entry);
    });
    actionsWrap.appendChild(toggleBarsBtn);
    titleRow.appendChild(actionsWrap);
    elHomelandBreakdown.appendChild(titleRow);

    if (!state.homelandBarsExpanded) {
      const strip = document.createElement('div');
      strip.className = 'hm-chip-strip';
      for (let i = 0; i < entry.holdings.length; i++) {
        const h = entry.holdings[i];
        const m = MUSEUMS[h.museumId];
        if (!m) continue;
        const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
        const isAct = state.homelandFilterMuseumId === h.museumId;

        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'hm-mini-chip' + (isAct ? ' active' : '');
        chip.addEventListener('click', () => {
          state.homelandFilterMuseumId = isAct ? null : h.museumId;
          selectCountry(state.selectedCountry, true);
          updateUrlHash(state.selectedCountry, state.selectedArtifact);
        });

        const nm = document.createElement('span');
        nm.textContent = mc.shortName;
        const cnt = document.createElement('span');
        cnt.className = 'hm-mini-cnt';
        cnt.textContent = fmtNum(h.count);
        chip.appendChild(nm);
        chip.appendChild(cnt);
        strip.appendChild(chip);
      }
      elHomelandBreakdown.appendChild(strip);
      return;
    }

    const maxHold = entry.holdings.length ? entry.holdings[0].count : 1;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < entry.holdings.length; i++) {
      const h = entry.holdings[i];
      const m = MUSEUMS[h.museumId];
      if (!m) continue;
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      const isAct = state.homelandFilterMuseumId === h.museumId;

      const rowBtn = document.createElement('button');
      rowBtn.type = 'button';
      rowBtn.className = 'hm-museum-row' + (isAct ? ' active' : '');
      rowBtn.addEventListener('click', () => {
        state.homelandFilterMuseumId = isAct ? null : h.museumId;
        selectCountry(state.selectedCountry, true);
        updateUrlHash(state.selectedCountry, state.selectedArtifact);
      });

      const nm = document.createElement('span');
      nm.className = 'hm-museum-name';
      nm.textContent = mc.shortName + (h.isHost ? (' (' + hostBadgeText() + ')') : '');

      const bar = document.createElement('span');
      bar.className = 'hm-museum-bar';
      const fill = document.createElement('span');
      fill.className = 'hm-museum-fill';
      fill.style.width = Math.max(8, Math.round((h.count / maxHold) * 100)) + '%';
      bar.appendChild(fill);

      const cnt = document.createElement('span');
      cnt.className = 'hm-museum-cnt';
      cnt.textContent = fmtNum(h.count);

      rowBtn.appendChild(nm);
      rowBtn.appendChild(bar);
      rowBtn.appendChild(cnt);
      frag.appendChild(rowBtn);
    }
    elHomelandBreakdown.appendChild(frag);
  }

  function selectCountry(country, skipHash) {
    const isHomelandMode = state.globeLens === 'homeland';
    state.selectedCountry = country;
    state.homelandListTabActive = Boolean(isHomelandMode && !country);
    if (country) {
      state.lastFocusedCountry = country;
    }
    syncLensSwitcherUI();
    syncSidebarTabs();

    if (!country) {
      elSidebarHeading.textContent = isHomelandMode
        ? allCountriesTabText()
        : (mCopy().shortName + ' · ' + allCountriesTabText());
      elCountryDetail.classList.remove('active');
      elCountryList.style.display = 'block';
      elActiveBanner.classList.remove('visible');
      elActiveBanner.textContent = '';
      if (!skipHash) updateUrlHash(null, null);
      renderCountryList();
      return;
    }

    const cName = countryName(country);
    elCountryList.style.display = 'none';
    elCountryDetail.classList.add('active');

    let shownStatTotal = country.count;
    let shownStatRight = 1;

    if (isHomelandMode) {
      const entry = getHomelandEntry(country.en);
      elSidebarHeading.textContent = state.lang === 'zh'
        ? (cName + ' · ' + fmtNum(entry.totalCount) + ' 件 · ' + fmtNum(entry.holdings.length) + ' 馆')
        : (cName + ' · ' + fmtNum(entry.totalCount) + ' items · ' + fmtNum(entry.holdings.length) + ' museums');
      elDetailTitle.textContent = cName;
      elKpiArtifacts.textContent = fmtNum(entry.totalCount);
      if (elKpiLblLeft) elKpiLblLeft.textContent = t('kpiArtifacts');
      elKpiDates.textContent = fmtNum(entry.holdings.length) + ' / 10';
      if (elKpiLblRight) elKpiLblRight.textContent = t('kpiMuseums');
      renderHomelandBreakdownUI(entry);
      if (state.homelandFilterMuseumId) {
        const fHold = entry.holdings.find(h => h.museumId === state.homelandFilterMuseumId);
        shownStatTotal = fHold ? fHold.count : entry.totalCount;
        shownStatRight = 1;
      } else {
        shownStatTotal = entry.totalCount;
        shownStatRight = entry.holdings.length;
      }
      elActiveBanner.textContent = state.lang === 'zh'
        ? (cName + ' → ' + fmtNum(entry.holdings.length) + ' 座世界博物馆')
        : (cName + ' → ' + fmtNum(entry.holdings.length) + ' World Museums');
    } else {
      elSidebarHeading.textContent = state.lang === 'zh'
        ? (cName + ' · ' + fmtNum(country.count) + ' 件')
        : (cName + ' · ' + fmtNum(country.count) + ' items');
      elDetailTitle.textContent = cName + (country.isHost ? (' · ' + hostBadgeText()) : '');
      elKpiArtifacts.textContent = fmtNum(country.count);
      if (elKpiLblLeft) elKpiLblLeft.textContent = t('kpiArtifacts');
      elKpiDates.textContent = formatDateLocalized(country.dateRange, true);
      if (elKpiLblRight) elKpiLblRight.textContent = t('kpiDateRange');
      renderHomelandBreakdownUI(null);
      elActiveBanner.textContent = cName;
    }

    elActiveBanner.classList.add('visible');

    state.autoRotate = false;
    document.getElementById('btn-rotate').classList.remove('active');
    if (!state.isCollectedInHost && !skipHash) {
      state.targetRotLon = -country.centerLon * DEG2RAD;
      state.targetRotLat = Math.max(-1.1, Math.min(1.1, country.centerLat * DEG2RAD));
      state.targetZoom = isHomelandMode
        ? 1.06
        : Math.min(1.55, Math.max(1.08, 1.38 - country.count / 900));
    }

    if (!skipHash) updateUrlHash(country, null);

    elThumbGrid.replaceChildren();
    const q = state.searchQuery;
    const frag = document.createDocumentFragment();
    const limit = 60;
    let shownInCountry = 0;
    const artPool = (isHomelandMode && (!country.artifacts || !country.artifacts.length))
      ? state.artifacts
      : country.artifacts;

    const tlCutoff = state.timelineActive ? displayedTimelineYear() : Infinity;
    for (let i = 0; i < artPool.length && shownInCountry < limit; i++) {
      const art = artPool[i];
      if (state.timelineActive && art.acqYear > tlCutoff) continue;
      if (isHomelandMode && state.homelandFilterMuseumId && art.museumId !== state.homelandFilterMuseumId) continue;
      if (!artifactMatchesQuery(art, q)) continue;
      shownInCountry++;

      const artMid = art.museumId || state.museumId;
      const artM = MUSEUMS[artMid] || curMuseum();
      const artMc = (artM.copy && artM.copy[state.lang]) || artM.copy.en;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'thumb-card' + (state.selectedArtifact === art ? ' selected' : '');
      card.setAttribute('aria-label', (isHomelandMode ? (artMc.shortName + ' · ') : '') + artFullTitle(art));

      const cnv = document.createElement('canvas');
      cnv.width = 360;
      cnv.height = 360;
      if (atlasCache[artMid]) {
        drawSpriteToCanvas(cnv, art.sprite, artMid);
      } else {
        loadMuseumAtlas(artMid, false).then(() => {
          drawSpriteToCanvas(cnv, art.sprite, artMid);
        });
      }

      const cap = document.createElement('span');
      cap.className = 'thumb-caption';
      cap.textContent = (art.isCurated ? '★ ' : '') +
        (isHomelandMode ? (artMc.shortHost + ' · ') : '') +
        artThumbCaption(art);

      card.appendChild(cnv);
      card.appendChild(cap);
      card.addEventListener('click', () => openArtifactModal(art, true));
      frag.appendChild(card);
    }
    elThumbGrid.appendChild(frag);
    document.getElementById('stat-artifacts').textContent = fmtNum(shownStatTotal);
    document.getElementById('stat-countries').textContent = fmtNum(shownStatRight);
  }

  function openArtifactModal(art, flyTo, skipScroll) {
    const artMid = art.museumId || state.museumId;
    const artM = MUSEUMS[artMid] || curMuseum();
    const mc = (artM.copy && artM.copy[state.lang]) || artM.copy.en;
    state.selectedArtifact = art;

    if (atlasCache[artMid]) {
      drawSpriteToCanvas(elModalCanvas, art.sprite, artMid);
    } else {
      loadMuseumAtlas(artMid, false).then(() => {
        if (state.selectedArtifact === art) {
          drawSpriteToCanvas(elModalCanvas, art.sprite, artMid);
        }
      });
    }

    if (elModalMuseumPill) {
      elModalMuseumPill.classList.remove('is-hidden');
      elModalMuseumPill.textContent = mc.shortName;
    }
    elModalCountryPill.textContent = countryName(art.country) + (art.country.isHost ? (' · ' + hostBadgeText()) : '');
    elModalRegPill.textContent = formatRegBadge(art);
    elModalTitle.textContent = artFullTitle(art);
    elModalMeta.textContent = formatDateLocalized(art.date, false) + '  ·  ' + artMaterial(art) + '  ·  ' + artRoom(art) + ' (' + formatAcqPhrase(art.acqYear) + ')';
    elModalDesc.textContent = artDesc(art);

    const objHref = buildArtifactObjUrl(art);
    const countryCatHref = buildCountryCatalogueUrl(art.country, artMid);
    elModalLink.setAttribute('href', objHref);
    elModalLink.textContent = mc.viewObjBtn;
    if (elModalCountryBmLink) {
      elModalCountryBmLink.setAttribute('href', countryCatHref);
      elModalCountryBmLink.textContent = formatCountryCatalogLabel(art.country);
    }
    if (elModalHomelandFlipBtn) {
      if (state.globeLens === 'homeland') {
        elModalHomelandFlipBtn.textContent = state.lang === 'zh'
          ? ('进入' + mc.shortName + ' ⇄')
          : ('Explore ' + mc.shortName + ' ⇄');
      } else {
        elModalHomelandFlipBtn.textContent = state.lang === 'zh'
          ? (countryName(art.country) + '十馆流散 ⇄')
          : (countryName(art.country) + ' Across 10 Museums ⇄');
      }
    }
    elCopyLinkBtn.textContent = mc.copyUrlBtn;
    elModal.classList.add('open');
    updateUrlHash(art.country, art);
    if (!skipScroll) ensureGlobeModalVisible();

    if (flyTo) {
      if (state.isCollectedInHost && state.globeLens === 'homeland') {
        state.targetRotLon = -artM.hostLon * DEG2RAD;
        state.targetRotLat = Math.max(-1.15, Math.min(1.15, artM.hostLat * DEG2RAD));
        state.targetZoom = Math.max(state.targetZoom, 1.25);
      } else if (!state.isCollectedInHost) {
        state.targetRotLon = -art.lon * DEG2RAD;
        state.targetRotLat = Math.max(-1.15, Math.min(1.15, art.lat * DEG2RAD));
        state.targetZoom = Math.max(state.targetZoom, 1.35);
      }
    }
  }

  function stepModalArtifact(delta) {
    if (!state.selectedArtifact) return;
    const cur = state.selectedArtifact;
    let pool = (cur.country && cur.country.artifacts && cur.country.artifacts.length)
      ? cur.country.artifacts
      : state.artifacts;
    if (state.globeLens === 'homeland' && state.homelandFilterMuseumId) {
      pool = pool.filter(a => a.museumId === state.homelandFilterMuseumId);
    }
    if (!pool || !pool.length) return;
    const idx = pool.indexOf(cur);
    const nextIdx = ((idx >= 0 ? idx : 0) + delta + pool.length) % pool.length;
    openArtifactModal(pool[nextIdx], true, true);
  }

  let currentRenderedGalleryList = [];

  function stepLightboxArtifact(delta) {
    if (!state.lightboxArtifact) return;
    const cur = state.lightboxArtifact;
    let pool = currentRenderedGalleryList;
    if (!pool.includes(cur)) {
      pool = (cur.country && cur.country.artifacts && cur.country.artifacts.length)
        ? cur.country.artifacts
        : state.curatedHighlights;
    }
    if (!pool || !pool.length) return;
    const idx = pool.indexOf(cur);
    const nextIdx = ((idx >= 0 ? idx : 0) + delta + pool.length) % pool.length;
    openLightbox(pool[nextIdx]);
  }

  function openLightbox(art) {
    if (!art) return;
    const artMid = art.museumId || state.museumId;
    const m = MUSEUMS[artMid] || curMuseum();
    const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
    state.lightboxArtifact = art;
    loadMuseumAtlas(artMid, false).then(() => {
      if (state.lightboxArtifact === art) {
        drawSpriteToCanvas(elLightboxCanvas, art.sprite, artMid);
      }
    });
    elLightboxImg.classList.remove('loaded');
    elLightboxImg.removeAttribute('src');

    const hdUrl = m.hdPhotoUrls[art.sprite];
    if (hdUrl && !navigator.webdriver && hdUrl.startsWith('https://')) {
      elLightboxImg.onload = () => {
        if (state.lightboxArtifact === art) {
          elLightboxImg.classList.add('loaded');
        }
      };
      elLightboxImg.onerror = () => {
        elLightboxImg.classList.remove('loaded');
      };
      elLightboxImg.alt = artFullTitle(art);
      elLightboxImg.src = hdUrl;
    }

    elLightboxKicker.textContent = mc.shortName + '  ·  ' + countryName(art.country) + '  ·  ' + formatRegBadge(art) + '  ·  ' + formatDateLocalized(art.date, false);
    elLightboxTitle.textContent = artFullTitle(art);
    elLightboxDesc.textContent = artDesc(art) + ' (' + artMaterial(art) + '; ' + artRoom(art) + ', ' + formatAcqPhrase(art.acqYear) + ').';
    const objHref = buildArtifactObjUrl(art);
    const countryCatHref = buildCountryCatalogueUrl(art.country, artMid);
    elLightboxBmLink.setAttribute('href', objHref);
    elLightboxBmLink.textContent = mc.openOfficialBtn;
    if (elLightboxCountryBmLink) {
      elLightboxCountryBmLink.setAttribute('href', countryCatHref);
      elLightboxCountryBmLink.textContent = formatCountryCatalogLabel(art.country);
    }
    elLightboxLocateBtn.textContent = t('lightboxLocateBtn');
    elLightbox.classList.add('open');
  }

  function closeLightbox() {
    state.lightboxArtifact = null;
    elLightbox.classList.remove('open');
  }

  function locateGalleryArtifactOnGlobe(art) {
    const targetMid = art.museumId || state.museumId;
    scrollGlobeIntoView();
    if (state.globeLens === 'homeland' && art.country && art.country.en === state.homelandCountryEn) {
      const matchedArt = state.artifacts.find(a => a.isCurated && a.en === art.en && a.museumId === targetMid) ||
        state.artifacts.find(a => a.museumId === targetMid) ||
        state.artifacts[0];
      state.isCollectedInHost = false;
      state.animatingFlight = false;
      state.timelinePlaying = false;
      state.timelineActive = false;
      syncTimelineScrubberUI();
      updateCollectButtonUI();
      if (state.selectedCountry === null && state.lastFocusedCountry) {
        selectCountry(state.lastFocusedCountry, true);
      }
      if (matchedArt) openArtifactModal(matchedArt, true, true);
      return;
    }
    if (targetMid !== state.museumId || state.globeLens === 'homeland') {
      switchMuseum(targetMid, true).then(() => {
        const matchedC = state.countries.find(c => c.en === art.country.en) || state.countries[0];
        if (!matchedC) return;
        const matchedArt = matchedC.artifacts.find(a => a.isCurated && a.en === art.en) || matchedC.artifacts[0];
        state.isCollectedInHost = false;
        state.animatingFlight = false;
        updateCollectButtonUI();
        selectCountry(matchedC);
        if (matchedArt) openArtifactModal(matchedArt, true, true);
      });
    } else {
      const matchedC = state.countries.find(c => c.en === art.country.en) || art.country;
      const matchedArt = (matchedC && matchedC.artifacts)
        ? (matchedC.artifacts.find(a => a.isCurated && a.en === art.en) || art)
        : art;
      state.isCollectedInHost = false;
      state.animatingFlight = false;
      state.timelinePlaying = false;
      state.timelineActive = false;
      syncTimelineScrubberUI();
      updateCollectButtonUI();
      selectCountry(matchedC);
      openArtifactModal(matchedArt, true, true);
    }
  }

  let galleryPlateObserver = null;
  let galleryPaintQueue = [];
  let galleryPaintScheduled = false;

  function pumpGalleryPaintQueue() {
    galleryPaintScheduled = false;
    let budget = 2;
    while (budget > 0 && galleryPaintQueue.length > 0) {
      const job = galleryPaintQueue.shift();
      if (!job || !job.cnv || !job.cnv.isConnected) continue;
      if (job.cnv.dataset.rendered === '1') continue;
      job.cnv.dataset.rendered = '1';
      job.cnv.width = 320;
      job.cnv.height = 240;
      if (atlasCache[job.artMid]) {
        drawCoverPlateToCanvas(job.cnv, job.spriteIdx, job.artMid);
      } else {
        loadMuseumAtlas(job.artMid, false).then(() => {
          drawCoverPlateToCanvas(job.cnv, job.spriteIdx, job.artMid);
        });
      }
      budget--;
    }
    if (galleryPaintQueue.length > 0) {
      galleryPaintScheduled = true;
      requestAnimationFrame(pumpGalleryPaintQueue);
    }
  }

  function renderGalleryPlateNow(cnv, spriteIdx, artMid) {
    if (cnv.dataset.rendered === '1') return;
    galleryPaintQueue.push({ cnv, spriteIdx, artMid });
    if (!galleryPaintScheduled) {
      galleryPaintScheduled = true;
      requestAnimationFrame(pumpGalleryPaintQueue);
    }
  }

  function renderMasterpiecesGallery() {
    galleryPaintQueue.length = 0;
    if (galleryPlateObserver) {
      galleryPlateObserver.disconnect();
      galleryPlateObserver = null;
    }
    if (typeof IntersectionObserver === 'function') {
      galleryPlateObserver = new IntersectionObserver((entries, obs) => {
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          if (!entry.isIntersecting) continue;
          const target = entry.target;
          obs.unobserve(target);
          renderGalleryPlateNow(
            target,
            Number(target.dataset.sprite || 0),
            target.dataset.mid || state.museumId
          );
        }
      }, { rootMargin: '320px 0px' });
    }
    elMasterpiecesGrid.replaceChildren();
    const frag = document.createDocumentFragment();
    const filter = state.galleryRegion;
    const q = state.gallerySearchQuery;
    const srcList = currentGallerySourceList();
    currentRenderedGalleryList = [];

    for (let i = 0; i < srcList.length; i++) {
      const art = srcList[i];
      if (filter !== 'all' && art.region !== filter) continue;
      if (!galleryItemMatchesSearch(art, q)) continue;
      currentRenderedGalleryList.push(art);

      const artMid = art.museumId || state.museumId;
      const artMuseum = MUSEUMS[artMid] || curMuseum();
      const mc = (artMuseum.copy && artMuseum.copy[state.lang]) || artMuseum.copy.en;
      const objHref = buildArtifactObjUrl(art);
      const card = document.createElement('article');
      card.className = 'exhibit-card';

      const plateWrap = document.createElement('div');
      plateWrap.className = 'exhibit-plate-wrap';
      plateWrap.title = t('plateClickTipPrefix') + artFullTitle(art);
      plateWrap.setAttribute('role', 'button');
      plateWrap.setAttribute('tabindex', '0');
      plateWrap.addEventListener('click', () => openLightbox(art));
      plateWrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(art);
        }
      });

      const cnv = document.createElement('canvas');
      cnv.dataset.sprite = String(art.sprite);
      cnv.dataset.mid = artMid;
      if (!galleryPlateObserver || currentRenderedGalleryList.length <= 12) {
        renderGalleryPlateNow(cnv, art.sprite, artMid);
      } else {
        cnv.width = 16;
        cnv.height = 12;
        galleryPlateObserver.observe(cnv);
      }

      const originTag = document.createElement('span');
      originTag.className = 'exhibit-origin-tag';
      const originLabel = countryName(art.country) + (art.country.isHost ? (' · ' + hostBadgeText()) : '');
      originTag.textContent = state.galleryAllMuseums ? (mc.shortName + ' · ' + originLabel) : originLabel;

      const acqTag = document.createElement('span');
      acqTag.className = 'exhibit-acq-tag';
      acqTag.textContent = formatRegBadge(art);

      plateWrap.appendChild(cnv);
      plateWrap.appendChild(originTag);
      plateWrap.appendChild(acqTag);

      const content = document.createElement('div');
      content.className = 'exhibit-content';

      const topBlock = document.createElement('div');
      const titleLink = document.createElement('a');
      titleLink.className = 'exhibit-title-link';
      titleLink.href = objHref;
      titleLink.target = '_blank';
      titleLink.rel = 'noopener noreferrer';
      titleLink.title = t('bmTitleLinkTip');

      const h3 = document.createElement('h3');
      h3.className = 'exhibit-title-zh';
      h3.textContent = artFullTitle(art);

      const subMat = document.createElement('div');
      subMat.className = 'exhibit-title-en';
      subMat.textContent = artMaterial(art);

      titleLink.appendChild(h3);
      titleLink.appendChild(subMat);

      const meta = document.createElement('div');
      meta.className = 'exhibit-meta';
      meta.textContent = formatDateLocalized(art.date, false) + ' · ' + artRoom(art) + ' · ' + formatCardAcqShort(art.acqYear);

      const desc = document.createElement('p');
      desc.className = 'exhibit-desc';
      desc.textContent = artDesc(art);

      topBlock.appendChild(titleLink);
      topBlock.appendChild(meta);
      topBlock.appendChild(desc);

      const actions = document.createElement('div');
      actions.className = 'exhibit-actions';

      const locateBtn = document.createElement('button');
      locateBtn.type = 'button';
      locateBtn.className = 'locate-globe-btn';
      locateBtn.appendChild(createSvgIcon(GS_PATHS.globe, 'gs-icon-sm'));
      locateBtn.appendChild(document.createTextNode(t('locateOnGlobeCardBtn')));
      locateBtn.addEventListener('click', () => locateGalleryArtifactOnGlobe(art));

      const extLink = document.createElement('a');
      extLink.className = 'bm-ext-link';
      extLink.href = objHref;
      extLink.target = '_blank';
      extLink.rel = 'noopener noreferrer';
      extLink.textContent = mc.cardLinkBtn;

      actions.appendChild(locateBtn);
      actions.appendChild(extLink);

      content.appendChild(topBlock);
      content.appendChild(actions);

      card.appendChild(plateWrap);
      card.appendChild(content);
      frag.appendChild(card);
    }

    elMasterpiecesGrid.appendChild(frag);
  }

  function renderTopOriginsBars() {
    elTopOriginsBars.replaceChildren();
    const frag = document.createDocumentFragment();
    const top12 = state.countries.slice(0, 12);
    const maxCount = top12.length ? top12[0].count : 330;

    for (let i = 0; i < top12.length; i++) {
      const c = top12[i];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'origin-bar-btn' + (c.isHost ? ' is-host-row' : '');
      btn.addEventListener('click', () => {
        scrollGlobeIntoView();
        if (state.globeLens === 'homeland') {
          focusHomeland(c.en);
          return;
        }
        state.isCollectedInHost = false;
        state.animatingFlight = false;
        state.timelinePlaying = false;
        state.timelineActive = false;
        syncTimelineScrubberUI();
        updateCollectButtonUI();
        selectCountry(c);
      });

      const lbl = document.createElement('span');
      lbl.className = 'origin-bar-label';
      const lblText = document.createElement('span');
      lblText.className = 'origin-bar-label-text';
      lblText.textContent = countryName(c);
      lbl.appendChild(lblText);
      if (c.isHost) {
        const badge = document.createElement('span');
        badge.className = 'host-badge';
        badge.textContent = hostBadgeText();
        lbl.appendChild(badge);
      }

      const rail = document.createElement('span');
      rail.className = 'origin-bar-rail';
      const fill = document.createElement('span');
      fill.className = 'origin-bar-value-fill';
      fill.style.width = Math.round((c.count / maxCount) * 100) + '%';
      rail.appendChild(fill);

      const num = document.createElement('span');
      num.className = 'origin-bar-num';
      num.textContent = fmtNum(c.count);

      btn.appendChild(lbl);
      btn.appendChild(rail);
      btn.appendChild(num);
      frag.appendChild(btn);
    }

    elTopOriginsBars.appendChild(frag);
    renderDistanceLeaderboard();
  }

  let cachedGlobalDistStats = null;

  function haversineKmApp(lon1, lat1, lon2, lat2) {
    const p1 = lat1 * DEG2RAD;
    const p2 = lat2 * DEG2RAD;
    const dp = (lat2 - lat1) * DEG2RAD;
    const dl = (lon2 - lon1) * DEG2RAD;
    const a = Math.sin(dp * 0.5) * Math.sin(dp * 0.5) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl * 0.5) * Math.sin(dl * 0.5);
    return 2 * 6371 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  function computeGlobalDistanceStats() {
    if (cachedGlobalDistStats) return cachedGlobalDistStats;
    let totalKm = 0;
    const byMuseum = {};
    const masterList = [];
    for (let mIdx = 0; mIdx < SUPPORTED_MUSEUMS.length; mIdx++) {
      const mid = SUPPORTED_MUSEUMS[mIdx];
      const m = MUSEUMS[mid];
      if (!m) continue;
      let mKm = 0;
      let mOverseas = 0;
      const cCoord = {};
      for (let r = 0; r < m.countriesSpec.length; r++) {
        const [enName, zhName, count, , cLon, cLat] = m.countriesSpec[r];
        cCoord[enName] = { zh: zhName, lon: cLon, lat: cLat };
        if (enName === m.hostCountryEn) continue;
        const dKm = haversineKmApp(cLon, cLat, m.hostLon, m.hostLat);
        mKm += dKm * count;
        mOverseas += count;
      }
      totalKm += mKm;
      byMuseum[mid] = { totalKm: mKm, avgKm: mOverseas ? Math.round(mKm / mOverseas) : 0 };

      const fMap = m.featuredByCountry || {};
      const keys = Object.keys(fMap);
      for (let k = 0; k < keys.length; k++) {
        const cEn = keys[k];
        if (cEn === m.hostCountryEn) continue;
        const cc = cCoord[cEn];
        if (!cc) continue;
        const distKm = Math.round(haversineKmApp(cc.lon, cc.lat, m.hostLon, m.hostLat));
        const list = fMap[cEn] || [];
        for (let j = 0; j < list.length; j++) {
          const f = list[j];
          masterList.push({
            museumId: mid,
            countryEn: cEn,
            countryZh: cc.zh,
            en: f.en,
            zh: f.zh,
            sprite: f.sprite,
            distKm
          });
        }
      }
    }
    masterList.sort((a, b) => b.distKm - a.distKm);
    // Deduplicate identical country+museum cluster for a diverse Top 10 showcase
    const top10 = [];
    const perCluster = {};
    for (let i = 0; i < masterList.length && top10.length < 10; i++) {
      const it = masterList[i];
      const ck = it.museumId + '|' + it.countryEn;
      perCluster[ck] = (perCluster[ck] || 0) + 1;
      if (perCluster[ck] > 2) continue;
      top10.push(it);
    }
    cachedGlobalDistStats = { totalKm, byMuseum, top10 };
    return cachedGlobalDistStats;
  }

  function renderDistanceLeaderboard() {
    const elList = document.getElementById('farthest-masterpieces-list');
    const elGlob = document.getElementById('dist-kpi-global');
    const elAct = document.getElementById('dist-kpi-active');
    const elActLbl = document.getElementById('dist-kpi-active-lbl');
    const elMax = document.getElementById('dist-kpi-max');
    if (!elList) return;

    const stats = computeGlobalDistanceStats();
    if (elGlob) {
      elGlob.textContent = state.lang === 'zh'
        ? ((stats.totalKm / 1e8).toFixed(2) + ' 亿 km')
        : ((stats.totalKm / 1e6).toFixed(1) + 'M km');
    }
    const curStats = stats.byMuseum[state.museumId] || { avgKm: 0 };
    const mc = mCopy();
    if (elAct) elAct.textContent = fmtNum(curStats.avgKm) + ' km';
    if (elActLbl) {
      elActLbl.textContent = state.lang === 'zh'
        ? (mc.shortName + ' · 海外均距')
        : (mc.shortName + ' · Overseas Avg.');
    }
    const maxKm = stats.top10.length ? stats.top10[0].distKm : 13620;
    if (elMax) elMax.textContent = fmtNum(maxKm) + ' km';

    elList.replaceChildren();
    const frag = document.createDocumentFragment();
    for (let i = 0; i < stats.top10.length; i++) {
      const it = stats.top10[i];
      const m = MUSEUMS[it.museumId];
      const mC = (m && m.copy && m.copy[state.lang]) || (m && m.copy && m.copy.en) || { shortName: it.museumId };
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'farthest-row-btn';
      btn.addEventListener('click', () => {
        scrollGlobeIntoView();
        switchMuseum(it.museumId).then(() => {
          const matchedC = state.countries.find(c => c.en === it.countryEn);
          if (matchedC) {
            selectCountry(matchedC);
            const art = matchedC.artifacts.find(a => a.isCurated && a.sprite === it.sprite) || matchedC.artifacts[0];
            if (art) openArtifactModal(art, true, true);
          }
        });
      });

      const rank = document.createElement('span');
      rank.className = 'farthest-rank';
      rank.textContent = String(i + 1);

      const main = document.createElement('span');
      main.className = 'farthest-main';

      const ttl = document.createElement('span');
      ttl.className = 'farthest-title';
      ttl.textContent = state.lang === 'zh' ? it.zh : it.en;

      const rt = document.createElement('span');
      rt.className = 'farthest-route';
      const cLbl = state.lang === 'zh' ? it.countryZh : (it.countryEn === 'United States of America' ? 'United States' : it.countryEn);
      rt.textContent = cLbl + '  →  ' + mC.shortName;

      const bw = document.createElement('span');
      bw.className = 'farthest-bar-wrap';
      const bf = document.createElement('span');
      bf.className = 'farthest-bar-fill';
      bf.style.width = Math.max(12, Math.round((it.distKm / maxKm) * 100)) + '%';
      bw.appendChild(bf);

      main.appendChild(ttl);
      main.appendChild(rt);
      main.appendChild(bw);

      const km = document.createElement('span');
      km.className = 'farthest-km';
      km.textContent = fmtNum(it.distKm) + ' km';

      btn.appendChild(rank);
      btn.appendChild(main);
      btn.appendChild(km);
      frag.appendChild(btn);
    }
    elList.appendChild(frag);
  }

  // 3D Globe Projection & Rendering Engine
  const canvas = document.getElementById('globe-canvas');
  const ctx = canvas.getContext('2d');
  let vpW = 960;
  let vpH = 680;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let visibleCards = [];
  let visibleMuseumPins = [];

  const MUSEUM_PIN_SHORT = {
    en: {
      bm: 'London · BM',
      met: 'New York · Met',
      hermitage: 'St. Petersburg',
      louvre: 'Paris · Louvre',
      berlin: 'Berlin · SMB',
      tnm: 'Tokyo · TNM',
      smithsonian: 'Washington D.C.',
      quaibranly: 'Paris · Quai Branly',
      rijks: 'Amsterdam · Rijks',
      vatican: 'Vatican · Rome'
    },
    zh: {
      bm: '伦敦·大英',
      met: '纽约·大都会',
      hermitage: '圣彼得堡·冬宫',
      louvre: '巴黎·卢浮宫',
      berlin: '柏林·佩加蒙',
      tnm: '东京·东博',
      smithsonian: '华盛顿·史密森尼',
      quaibranly: '巴黎·凯布朗利',
      rijks: '阿姆斯特丹·国博',
      vatican: '梵蒂冈·罗马'
    }
  };

  function museumPinLabel(mid) {
    const tbl = MUSEUM_PIN_SHORT[state.lang] || MUSEUM_PIN_SHORT.en;
    if (tbl[mid]) return tbl[mid];
    const m = MUSEUMS[mid];
    return m ? ((m.copy && m.copy[state.lang]) || m.copy.en).shortName : mid;
  }

  function fillStrokeRoundRect(x, y, w, h, r) {
    const rad = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  let mainBaseCanvas = null;
  let mainBaseCtx = null;
  let mainBaseKey = '';
  let mainScrollPauseUntil = 0;
  let lastFlightBannerText = '';

  function resizeCanvas() {
    const rect = elGlobeSection.getBoundingClientRect();
    vpW = Math.max(320, Math.round(rect.width));
    vpH = Math.max(420, Math.round(rect.height));
    const maxDpr = vpW > 1000 ? 1.15 : 1.35;
    dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    canvas.width = Math.round(vpW * dpr);
    canvas.height = Math.round(vpH * dpr);
    mainBaseKey = '';
    mainLastSig = '';
  }

  function rotateVec(vx, vy, vz, cosLon, sinLon, cosLat, sinLat) {
    const x1 = vx * cosLon + vz * sinLon;
    const z1 = -vx * sinLon + vz * cosLon;
    const y2 = vy * cosLat - z1 * sinLat;
    const z2 = vy * sinLat + z1 * cosLat;
    return [x1, y2, z2];
  }

  function computeArtifactCurrentVec(art) {
    if (!state.animatingFlight) {
      if (state.timelineActive) {
        const yr = state.timelineYear;
        if (art.acqYear > yr) return art.homeVec;
        const waveSpan = timelineWaveSpan();
        const rawT = Math.min(1, Math.max(0, (yr - art.acqYear + 3.0) / waveSpan));
        if (rawT >= 1) return art.hostVec;
        const easeW = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
        const hx = art.homeVec[0], hy = art.homeVec[1], hz = art.homeVec[2];
        const lx = art.hostVec[0], ly = art.hostVec[1], lz = art.hostVec[2];
        const mx = hx + (lx - hx) * easeW;
        const my = hy + (ly - hy) * easeW;
        const mz = hz + (lz - hz) * easeW;
        const len = Math.hypot(mx, my, mz) || 1;
        const lift = 1 + Math.sin(rawT * Math.PI) * art.arcLift;
        return [(mx / len) * lift, (my / len) * lift, (mz / len) * lift];
      }
      return state.isCollectedInHost ? art.hostVec : art.homeVec;
    }
    let localT;
    if (state.flightDirection === 'collect') {
      const start = art.acqNorm * 0.68;
      localT = (state.flightProgress - start) / 0.32;
    } else {
      const start = (1 - art.acqNorm) * 0.42;
      localT = (state.flightProgress - start) / 0.58;
    }
    localT = Math.max(0, Math.min(1, localT));
    const ease = localT < 0.5 ? 4 * localT * localT * localT : 1 - Math.pow(-2 * localT + 2, 3) / 2;
    const tToHost = state.flightDirection === 'collect' ? ease : (1 - ease);

    const hx = art.homeVec[0], hy = art.homeVec[1], hz = art.homeVec[2];
    const lx = art.hostVec[0], ly = art.hostVec[1], lz = art.hostVec[2];
    const mx = hx + (lx - hx) * tToHost;
    const my = hy + (ly - hy) * tToHost;
    const mz = hz + (lz - hz) * tToHost;
    const len = Math.hypot(mx, my, mz) || 1;
    const lift = 1 + Math.sin(localT * Math.PI) * art.arcLift;
    return [(mx / len) * lift, (my / len) * lift, (mz / len) * lift];
  }

  let lastFrameTime = performance.now();
  let mainGlobeInViewport = true;
  let mainRafPending = false;
  let mainLastSig = '';

  function ensureMainRaf() {
    if (!mainRafPending && mainGlobeInViewport && !document.hidden) {
      mainRafPending = true;
      lastFrameTime = performance.now();
      requestAnimationFrame(renderFrame);
    }
  }

  function drawMainGlobeBase(bCtx, cx, cy, baseR, cosLon, sinLon, cosLat, sinLat, fastMotion) {
    if (state.showAurora) {
      const aurGrad = bCtx.createRadialGradient(cx + baseR * 0.16, cy - baseR * 0.04, baseR * 0.88, cx + baseR * 0.1, cy, baseR * 1.13);
      aurGrad.addColorStop(0, 'rgba(235, 215, 175, 0)');
      aurGrad.addColorStop(0.45, 'rgba(124, 198, 178, 0.22)');
      aurGrad.addColorStop(0.68, 'rgba(182, 146, 214, 0.18)');
      aurGrad.addColorStop(0.86, 'rgba(224, 168, 134, 0.15)');
      aurGrad.addColorStop(1, 'rgba(245, 236, 220, 0)');
      bCtx.fillStyle = aurGrad;
      bCtx.beginPath();
      bCtx.arc(cx, cy, baseR * 1.15, 0, Math.PI * 2);
      bCtx.fill();
    }

    // Soft radial drop-shadow (eliminates slow 76px GPU/Skia shadowBlur Gaussian pass!)
    const shGrad = bCtx.createRadialGradient(cx, cy + 12, baseR * 0.88, cx, cy + 12, baseR * 1.11);
    shGrad.addColorStop(0, 'rgba(92, 68, 34, 0.16)');
    shGrad.addColorStop(0.55, 'rgba(92, 68, 34, 0.08)');
    shGrad.addColorStop(1, 'rgba(92, 68, 34, 0)');
    bCtx.fillStyle = shGrad;
    bCtx.beginPath();
    bCtx.arc(cx, cy + 12, baseR * 1.11, 0, Math.PI * 2);
    bCtx.fill();

    const sphereGrad = bCtx.createRadialGradient(cx - baseR * 0.26, cy - baseR * 0.28, baseR * 0.08, cx, cy, baseR);
    sphereGrad.addColorStop(0, '#faf3e4');
    sphereGrad.addColorStop(0.62, '#efe2c7');
    sphereGrad.addColorStop(0.92, '#e2cfa9');
    sphereGrad.addColorStop(1, '#d3bc92');
    bCtx.fillStyle = sphereGrad;
    bCtx.beginPath();
    bCtx.arc(cx, cy, baseR, 0, Math.PI * 2);
    bCtx.fill();

    // Graticule (front hemisphere z > 0.01 is mathematically inside sphere — no slow circular clip()!)
    bCtx.strokeStyle = 'rgba(170, 145, 108, 0.16)';
    bCtx.lineWidth = 0.7;
    for (let lat = -60; lat <= 60; lat += 30) {
      const phi = lat * DEG2RAD;
      const sinP = Math.sin(phi), cosP = Math.cos(phi);
      bCtx.beginPath();
      let started = false;
      for (let lon = -180; lon <= 180; lon += 10) {
        const lam = lon * DEG2RAD;
        const vx = cosP * Math.sin(lam), vy = sinP, vz = cosP * Math.cos(lam);
        const x1 = vx * cosLon + vz * sinLon;
        const z1 = -vx * sinLon + vz * cosLon;
        const z2 = vy * sinLat + z1 * cosLat;
        if (z2 > 0.015) {
          const y2 = vy * cosLat - z1 * sinLat;
          const sx = cx + x1 * baseR;
          const sy = cy - y2 * baseR;
          if (!started) { bCtx.moveTo(sx, sy); started = true; }
          else bCtx.lineTo(sx, sy);
        } else {
          started = false;
        }
      }
      bCtx.stroke();
    }

    bCtx.fillStyle = 'rgba(166, 139, 100, 0.42)';
    const dots = state.landDots3D;
    const dotSize = Math.max(1.1, 1.5 * state.zoom);
    const halfDot = dotSize * 0.5;
    const dotStep = fastMotion ? 3 : 1;
    for (let i = 0; i < dots.length; i += dotStep) {
      const d = dots[i];
      const dx = d[0], dy = d[1], dz = d[2];
      const x1 = dx * cosLon + dz * sinLon;
      const z1 = -dx * sinLon + dz * cosLon;
      const z2 = dy * sinLat + z1 * cosLat;
      if (z2 > 0.03) {
        const y2 = dy * cosLat - z1 * sinLat;
        bCtx.fillRect(cx + x1 * baseR - halfDot, cy - y2 * baseR - halfDot, dotSize, dotSize);
      }
    }

    bCtx.strokeStyle = 'rgba(155, 128, 89, 0.58)';
    bCtx.lineWidth = 0.9;
    const arcs = state.borderArcs3D;
    const minSegPx = fastMotion ? 3.8 : 1.6;
    const chunkMax = 36;
    let chunkCount = 0;
    bCtx.beginPath();
    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      if (fastMotion && arc.length < 4) continue;
      let started = false;
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
          if (!started) { bCtx.moveTo(sx, sy); lx = sx; ly = sy; started = true; }
          else if (Math.abs(sx - lx) + Math.abs(sy - ly) >= minSegPx || j === arc.length - 1) {
            bCtx.lineTo(sx, sy); lx = sx; ly = sy;
          }
        } else {
          started = false;
        }
      }
      if (++chunkCount >= chunkMax) {
        bCtx.stroke();
        bCtx.beginPath();
        chunkCount = 0;
      }
    }
    if (chunkCount > 0) bCtx.stroke();

    bCtx.strokeStyle = 'rgba(165, 138, 98, 0.55)';
    bCtx.lineWidth = 1.1;
    bCtx.beginPath();
    bCtx.arc(cx, cy, baseR, 0, Math.PI * 2);
    bCtx.stroke();
  }

  function renderMainBaseToCache(cx, cy, baseR, cosLon, sinLon, cosLat, sinLat) {
    const cw = canvas.width;
    const ch = canvas.height;
    if (!mainBaseCanvas) {
      mainBaseCanvas = document.createElement('canvas');
      mainBaseCtx = mainBaseCanvas.getContext('2d');
    }
    if (mainBaseCanvas.width !== cw || mainBaseCanvas.height !== ch) {
      mainBaseCanvas.width = cw;
      mainBaseCanvas.height = ch;
    }
    const bCtx = mainBaseCtx;
    bCtx.save();
    bCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bCtx.clearRect(0, 0, vpW, vpH);
    drawMainGlobeBase(bCtx, cx, cy, baseR, cosLon, sinLon, cosLat, sinLat, false);
    bCtx.restore();
  }

  function renderFrame(now) {
    mainRafPending = false;
    if (!mainGlobeInViewport || document.hidden) return;

    const ts = typeof now === 'number' ? now : performance.now();
    // Pause non-drag globe repaints during active page scrolling so scroll hits flat 60 FPS
    if (!state.isDragging && ts < mainScrollPauseUntil) {
      ensureMainRaf();
      return;
    }

    const dt = Math.min(0.12, Math.max(0.001, (ts - lastFrameTime) / 1000));
    lastFrameTime = ts;

    if (state.autoRotate && !state.isDragging) {
      state.targetRotLon -= 0.18 * dt;
    }
    const camAlpha = 1 - Math.exp(-dt * 6.5);
    const dLon = state.targetRotLon - state.rotLon;
    const dLat = state.targetRotLat - state.rotLat;
    const dZoom = state.targetZoom - state.zoom;
    state.rotLon = Math.abs(dLon) < 5e-4 ? state.targetRotLon : (state.rotLon + dLon * camAlpha);
    state.rotLat = Math.abs(dLat) < 5e-4 ? state.targetRotLat : (state.rotLat + dLat * camAlpha);
    state.zoom = Math.abs(dZoom) < 5e-4 ? state.targetZoom : (state.zoom + dZoom * camAlpha);

    if (state.timelinePlaying) {
      const prevYr = Math.round(state.timelineYear);
      const endCur = timelineEndCursor();
      const speed = Math.max(20, (endCur - state.tlMinYear) / 9.2);
      state.timelineYear += dt * speed;
      if (state.timelineYear >= endCur) {
        state.timelineYear = endCur;
        state.timelinePlaying = false;
        syncTimelineScrubberUI();
        refreshSidebarForTimeline();
      } else if (Math.round(state.timelineYear) !== prevYr) {
        syncTimelineScrubberUI();
        if (Math.round(state.timelineYear) % 6 === 0) {
          refreshSidebarForTimeline();
        }
      }
    }

    if (state.animatingFlight) {
      const nArt = state.artifacts.length;
      state.flightProgress += dt / (state.flightDirection === 'collect' ? 4.2 : 3.4);
      let bannerTxt = '';
      if (state.globeLens === 'homeland') {
        const entry = getHomelandEntry(state.homelandCountryEn);
        const cName = countryName(entry);
        const nM = state.homelandPins.length || entry.holdings.length;
        if (state.flightDirection === 'collect') {
          const curYear = Math.min(entry.maxAcqYear, Math.round(entry.minAcqYear + Math.min(1, state.flightProgress / 0.88) * Math.max(1, entry.maxAcqYear - entry.minAcqYear)));
          bannerTxt = state.lang === 'zh'
            ? (cName + '外流时间轴 · ' + curYear + ' 年（流散至全球 ' + fmtNum(nM) + ' 座博物馆）')
            : (cName + ' Dispersal Timeline · ' + curYear + '  (Radiating to ' + fmtNum(nM) + ' World Museums)');
        } else {
          const pct = Math.min(100, Math.round(state.flightProgress * 100));
          bannerTxt = state.lang === 'zh'
            ? (fmtNum(nArt) + ' 件文物正从全球 ' + fmtNum(nM) + ' 座博物馆飞回' + cName + ' · ' + pct + '%')
            : ('Returning ' + fmtNum(nArt) + ' Artifacts from ' + fmtNum(nM) + ' World Museums to ' + cName + ' · ' + pct + '%');
        }
      } else {
        const m = curMuseum();
        const mc = mCopy();
        const nCnt = state.countries.length;
        if (state.flightDirection === 'collect') {
          const curYear = Math.min(m.acqEnd, Math.round(m.acqStart + Math.min(1, state.flightProgress / 0.88) * (m.acqEnd - m.acqStart)));
          bannerTxt = state.lang === 'zh'
            ? (mc.shortName + '入藏时间轴 · ' + curYear + ' 年（汇集至' + mc.shortHost + mc.hostCity + '）')
            : (mc.shortName + ' Acquisition Timeline · ' + curYear + '  (Gathering to ' + mc.hostCity + ', ' + mc.shortHost + ')');
        } else {
          const pct = Math.min(100, Math.round(state.flightProgress * 100));
          bannerTxt = state.lang === 'zh'
            ? (fmtNum(nArt) + ' 件文物正从' + mc.shortHost + mc.hostCity + '飞回 ' + fmtNum(nCnt) + ' 个故乡 · ' + pct + '%')
            : ('Returning ' + fmtNum(nArt) + ' Artifacts from ' + mc.hostCity + ' (' + mc.shortHost + ') to ' + fmtNum(nCnt) + ' Homelands · ' + pct + '%');
        }
      }
      if (bannerTxt !== lastFlightBannerText) {
        lastFlightBannerText = bannerTxt;
        elFlightBanner.textContent = bannerTxt;
      }
      if (state.flightProgress >= 1) {
        state.flightProgress = 1;
        state.animatingFlight = false;
        state.isCollectedInHost = (state.flightDirection === 'collect');
        updateCollectButtonUI();
        setTimeout(() => {
          if (!state.animatingFlight) elFlightBanner.classList.remove('visible');
        }, 1300);
      }
    }

    const sidebarOpen = vpW > 920 && elSidebar && !elSidebar.classList.contains('collapsed');
    const camMoving = (state.autoRotate && !state.isDragging) || state.isDragging ||
      Math.abs(state.targetRotLon - state.rotLon) > 5e-4 ||
      Math.abs(state.targetRotLat - state.rotLat) > 5e-4 ||
      Math.abs(state.targetZoom - state.zoom) > 5e-4;
    const isMoving = camMoving || state.animatingFlight || state.timelinePlaying;

    const sig = [
      state.rotLon.toFixed(5), state.rotLat.toFixed(5), state.zoom.toFixed(4),
      state.displayMode, state.cardScale, state.showLabels, state.showOrigins,
      state.ringMode, state.showAurora, state.highlightCurated,
      state.globeLens, state.museumId, state.homelandCountryEn, state.homelandFilterMuseumId || '',
      state.selectedCountry ? state.selectedCountry.en : '',
      state.hoveredArtifact ? state.hoveredArtifact.id : -1,
      state.selectedArtifact ? state.selectedArtifact.id : -1,
      state.hoveredMuseumPin ? state.hoveredMuseumPin.museumId : '',
      state.searchQuery, state.isCollectedInHost, state.flightProgress.toFixed(4),
      state.timelineActive, state.timelineVisible, state.timelineYear.toFixed(2),
      state.lang, vpW, vpH, sidebarOpen, loadedAtlasCount, isMoving ? 1 : 0
    ].join('|');

    if (!isMoving && sig === mainLastSig) {
      ensureMainRaf();
      return;
    }
    mainLastSig = sig;

    const cx = sidebarOpen ? (vpW * 0.50 + 147) : (vpW * 0.50);
    const cy = state.timelineVisible ? (vpH * 0.44) : (vpH * 0.48);
    const availW = sidebarOpen ? Math.max(320, vpW - 294) : vpW;
    const baseR = Math.min(availW, vpH) * (state.timelineVisible ? 0.33 : 0.355) * state.zoom;

    const cosLon = Math.cos(state.rotLon), sinLon = Math.sin(state.rotLon);
    const cosLat = Math.cos(state.rotLat), sinLat = Math.sin(state.rotLat);
    const ringLabelState = { left: [], right: [] };
    visibleMuseumPins.length = 0;

    const fastMotion = isMoving;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    if (state.ringMode > 0) {
      drawAstrolabeRings(cx, cy, baseR, cosLon, sinLon, cosLat, sinLat, false, ringLabelState);
    }

    if (camMoving) {
      // Draw directly when camera is rotating (avoids wasteful double-draw + full-canvas memcpy!)
      drawMainGlobeBase(ctx, cx, cy, baseR, cosLon, sinLon, cosLat, sinLat, true);
    } else {
      const bKey = state.rotLon.toFixed(4) + '|' + state.rotLat.toFixed(4) + '|' + state.zoom.toFixed(3) + '|' +
        vpW + '|' + vpH + '|' + sidebarOpen + '|' + state.showAurora + '|' + state.timelineVisible + '|' +
        state.borderArcs3D.length;
      if (bKey !== mainBaseKey) {
        renderMainBaseToCache(cx, cy, baseR, cosLon, sinLon, cosLat, sinLat);
        mainBaseKey = bKey;
      }
      if (mainBaseCanvas) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(mainBaseCanvas, 0, 0);
        ctx.restore();
      }
    }

    // Homeland-First Dispersal Arcs: radiate from Homeland center to all holding Museums
    if (state.globeLens === 'homeland' && state.homelandPins.length > 0) {
      const entry = getHomelandEntry(state.homelandCountryEn);
      const originVec = lonLatToVec3(entry.centerLon, entry.centerLat);
      const maxHold = state.homelandPins[0].count || 1;
      for (let p = 0; p < state.homelandPins.length; p++) {
        const pin = state.homelandPins[p];
        const isHi = (state.homelandFilterMuseumId === pin.museumId) || (state.hoveredMuseumPin === pin);
        const isDim = Boolean(state.homelandFilterMuseumId && state.homelandFilterMuseumId !== pin.museumId);
        ctx.strokeStyle = isHi
          ? 'rgba(204, 138, 36, 0.80)'
          : (isDim ? 'rgba(176, 132, 68, 0.12)' : 'rgba(182, 132, 58, 0.42)');
        ctx.lineWidth = isHi ? 2.1 : (0.95 + (pin.count / maxHold) * 1.15);
        ctx.beginPath();
        let started = false;
        for (let s = 0; s <= 22; s++) {
          const u = s / 22;
          const vx = originVec[0] + (pin.vec3[0] - originVec[0]) * u;
          const vy = originVec[1] + (pin.vec3[1] - originVec[1]) * u;
          const vz = originVec[2] + (pin.vec3[2] - originVec[2]) * u;
          const l = Math.hypot(vx, vy, vz) || 1;
          const arcH = 1 + Math.sin(u * Math.PI) * 0.17;
          const rv = rotateVec((vx / l) * arcH, (vy / l) * arcH, (vz / l) * arcH, cosLon, sinLon, cosLat, sinLat);
          if (rv[2] > -0.05) {
            const sx = cx + rv[0] * baseR;
            const sy = cy - rv[1] * baseR;
            if (!started) { ctx.moveTo(sx, sy); started = true; }
            else ctx.lineTo(sx, sy);
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }
    }

    if (state.showOrigins || state.animatingFlight || state.timelineActive) {
      ctx.strokeStyle = (state.animatingFlight || state.timelineActive)
        ? 'rgba(196, 144, 64, 0.24)'
        : 'rgba(176, 132, 68, 0.22)';
      ctx.lineWidth = 0.85;
      const stride = Math.max(18, Math.floor(state.artifacts.length / (fastMotion ? 56 : 140)));
      const segs = fastMotion ? 10 : 14;
      ctx.beginPath();
      for (let i = 0; i < state.artifacts.length; i += stride) {
        const art = state.artifacts[i];
        if (state.globeLens === 'museum' && state.selectedCountry && art.country !== state.selectedCountry) continue;
        if (state.globeLens === 'homeland' && state.homelandFilterMuseumId && art.museumId !== state.homelandFilterMuseumId) continue;
        if (state.timelineActive && !state.showOrigins && !state.animatingFlight) {
          const dYr = state.timelineYear - art.acqYear;
          if (dYr < 0 || dYr > timelineWaveSpan()) continue;
        }
        let started = false;
        const hx = art.hostVec[0], hy = art.hostVec[1], hz = art.hostVec[2];
        const dx = art.homeVec[0] - hx, dy = art.homeVec[1] - hy, dz = art.homeVec[2] - hz;
        for (let s = 0; s <= segs; s++) {
          const u = s / segs;
          const vx = hx + dx * u;
          const vy = hy + dy * u;
          const vz = hz + dz * u;
          const l = Math.hypot(vx, vy, vz) || 1;
          const arcH = (1 + Math.sin(u * Math.PI) * 0.16) / l;
          const px = vx * arcH, py = vy * arcH, pz = vz * arcH;
          const rx = px * cosLon + pz * sinLon;
          const z1 = -px * sinLon + pz * cosLon;
          const rz = py * sinLat + z1 * cosLat;
          if (rz > -0.05) {
            const ry = py * cosLat - z1 * sinLat;
            const sx = cx + rx * baseR;
            const sy = cy - ry * baseR;
            if (!started) { ctx.moveTo(sx, sy); started = true; }
            else ctx.lineTo(sx, sy);
          } else {
            started = false;
          }
        }
      }
      ctx.stroke();
    }

    visibleCards.length = 0;
    const q = state.searchQuery;
    const baseCardPx = Math.max(5.5, Math.min(26, baseR * 0.036 * state.cardScale));
    const isHomelandMode = state.globeLens === 'homeland';
    const tlCutoffYr = state.timelineActive ? displayedTimelineYear() : Infinity;
    const cardStride = (fastMotion && state.artifacts.length > 3200) ? 2 : 1;

    for (let i = 0; i < state.artifacts.length; i++) {
      const art = state.artifacts[i];
      if (cardStride > 1 && !art.isCurated && (i % cardStride !== 0) && (!state.selectedCountry || art.country !== state.selectedCountry)) continue;
      if (state.timelineActive && art.acqYear > tlCutoffYr) continue;
      if (!artifactMatchesQuery(art, q)) continue;
      const pos = computeArtifactCurrentVec(art);
      const px = pos[0], py = pos[1], pz = pos[2];
      const rx = px * cosLon + pz * sinLon;
      const z1 = -px * sinLon + pz * cosLon;
      const rz = py * sinLat + z1 * cosLat;
      if (rz < -0.02) continue;
      const ry = py * cosLat - z1 * sinLat;

      const dimmed = isHomelandMode
        ? Boolean(state.homelandFilterMuseumId && art.museumId !== state.homelandFilterMuseumId)
        : Boolean(state.selectedCountry && art.country !== state.selectedCountry);

      visibleCards.push({
        art: art,
        sx: cx + rx * baseR,
        sy: cy - ry * baseR,
        rx: rx,
        ry: ry,
        rz: rz,
        dimmed: dimmed
      });
    }

    visibleCards.sort((a, b) => a.rz - b.rz);

    const mode = state.displayMode;
    const fallbackCols = activeAtlas ? activeAtlas.cols : 8;
    const fallbackAtlas = activeAtlas ? activeAtlas.globeSpriteAtlas : null;

    if (fastMotion && mode === 'standing' && fallbackAtlas) {
      // Ultra-fast 60 FPS motion path: 4 pigment-bucket batches (zero CSS color parse thrashing!) + curated HD plates on top
      const palette = ['#8f6a3e', '#5d4732', '#b0884a', '#486269'];
      const bins = [[], [], [], []];
      const curatedDraw = [];
      for (let i = 0; i < visibleCards.length; i++) {
        const c = visibleCards[i];
        const art = c.art;
        const isHovered = (state.hoveredArtifact === art) || (state.selectedArtifact === art);
        const perspectiveScale = 0.72 + 0.36 * Math.min(1.2, Math.max(0, c.rz));
        const sz = baseCardPx * perspectiveScale * (isHovered ? 1.48 : 1.0);
        const cardW = sz;
        const cardH = sz * 1.06;
        const drawX = c.sx - cardW * 0.5;
        const drawY = c.sy - cardH;
        c.hitX = c.sx;
        c.hitY = c.sy - cardH * 0.5;
        c.hitR = cardW * 0.6;
        if (art.isCurated || isHovered) {
          curatedDraw.push(c, drawX, drawY, cardW, cardH, isHovered);
        } else if (!c.dimmed) {
          bins[art.sprite & 3].push(drawX, drawY, cardW, cardH);
        }
      }
      ctx.globalAlpha = 0.88;
      for (let b = 0; b < 4; b++) {
        const arr = bins[b];
        if (!arr.length) continue;
        ctx.fillStyle = palette[b];
        for (let k = 0; k < arr.length; k += 4) {
          ctx.fillRect(arr[k], arr[k + 1], arr[k + 2], arr[k + 3]);
        }
      }
      ctx.globalAlpha = 1;
      for (let k = 0; k < curatedDraw.length; k += 6) {
        const c = curatedDraw[k];
        const art = c.art;
        const drawX = curatedDraw[k + 1], drawY = curatedDraw[k + 2];
        const cardW = curatedDraw[k + 3], cardH = curatedDraw[k + 4];
        const isHovered = curatedDraw[k + 5];
        const itemAtl = (art.museumId && atlasCache[art.museumId]) ? atlasCache[art.museumId] : null;
        const aCols = itemAtl ? itemAtl.cols : fallbackCols;
        const gAtlas = itemAtl ? itemAtl.globeSpriteAtlas : fallbackAtlas;
        if (!gAtlas) continue;
        const sxAtlas = (art.sprite % aCols) * GLOBE_MIP_SIZE;
        const syAtlas = Math.floor(art.sprite / aCols) * GLOBE_MIP_SIZE;
        ctx.drawImage(gAtlas, sxAtlas, syAtlas, GLOBE_MIP_SIZE, GLOBE_MIP_SIZE, drawX, drawY, cardW, cardH);
        if (isHovered) {
          ctx.strokeStyle = '#f5d487';
          ctx.lineWidth = 1.8;
          ctx.strokeRect(drawX - 1, drawY - 1, cardW + 2, cardH + 2);
        }
      }
    } else {
      let curAlpha = -1;
      ctx.fillStyle = 'rgba(48, 34, 16, 0.22)';

      for (let i = 0; i < visibleCards.length; i++) {
        const c = visibleCards[i];
        const art = c.art;
        const itemAtl = (art.museumId && atlasCache[art.museumId]) ? atlasCache[art.museumId] : null;
        const aCols = itemAtl ? itemAtl.cols : fallbackCols;
        const gAtlas = itemAtl ? itemAtl.globeSpriteAtlas : fallbackAtlas;

        const isHovered = (state.hoveredArtifact === art) || (state.selectedArtifact === art);
        const perspectiveScale = 0.72 + 0.36 * Math.min(1.2, Math.max(0, c.rz));
        const sz = baseCardPx * perspectiveScale * (isHovered ? 1.48 : 1.0);
        const nextAlpha = c.dimmed ? 0.18 : (c.rz > 0.56 ? 1.0 : (c.rz > 0.28 ? 0.8 : 0.5));
        if (nextAlpha !== curAlpha) {
          ctx.globalAlpha = nextAlpha;
          curAlpha = nextAlpha;
        }

        if (mode === 'particles' || !gAtlas) {
          const pRad = Math.max(1.8, sz * 0.28);
          ctx.fillStyle = isHovered ? '#fff6d6' : (art.sprite % 2 === 0 ? '#c98b32' : '#3a7d8c');
          ctx.beginPath();
          ctx.arc(c.sx, c.sy, pRad, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = 'rgba(48, 34, 16, 0.22)';
          c.hitX = c.sx;
          c.hitY = c.sy;
          c.hitR = Math.max(5, pRad + 3);
          continue;
        }

        const sxAtlas = (art.sprite % aCols) * GLOBE_MIP_SIZE;
        const syAtlas = Math.floor(art.sprite / aCols) * GLOBE_MIP_SIZE;

        if (mode === 'flat' || mode === 'both') {
          const eRot = rotateVec(art.east[0], art.east[1], art.east[2], cosLon, sinLon, cosLat, sinLat);
          const nRot = rotateVec(art.north[0], art.north[1], art.north[2], cosLon, sinLon, cosLat, sinLat);
          const half = sz * 0.48;
          ctx.save();
          ctx.transform(
            eRot[0] * half, -eRot[1] * half,
            -nRot[0] * half, nRot[1] * half,
            c.sx, c.sy
          );
          ctx.drawImage(gAtlas, sxAtlas, syAtlas, GLOBE_MIP_SIZE, GLOBE_MIP_SIZE, -1, -1, 2, 2);
          ctx.restore();
          c.hitX = c.sx;
          c.hitY = c.sy;
          c.hitR = sz * 0.55;
        }

        if (mode === 'standing' || mode === 'both') {
          const cardW = sz;
          const cardH = sz * 1.06;
          const drawX = c.sx - cardW * 0.5;
          const drawY = c.sy - cardH;

          ctx.fillStyle = 'rgba(48, 34, 16, 0.22)';
          ctx.fillRect(drawX + 1, c.sy - 1, Math.max(2, cardW - 2), 2.2);
          ctx.drawImage(gAtlas, sxAtlas, syAtlas, GLOBE_MIP_SIZE, GLOBE_MIP_SIZE, drawX, drawY, cardW, cardH);

          if (isHovered) {
            ctx.strokeStyle = '#f5d487';
            ctx.lineWidth = 1.8;
            ctx.strokeRect(drawX - 1, drawY - 1, cardW + 2, cardH + 2);
          }
          c.hitX = c.sx;
          c.hitY = c.sy - cardH * 0.5;
          c.hitR = cardW * 0.6;
        }
      }
      ctx.globalAlpha = 1;
    }

    // Clickable Museum City Pin Pills on front hemisphere in Homeland-First Mode
    if (isHomelandMode && state.homelandPins.length > 0) {
      ctx.save();
      ctx.font = '600 10.5px "Google Sans Flex", "Noto Sans SC", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';

      const sidebarOpen = vpW > 920 && elSidebar && !elSidebar.classList.contains('collapsed');
      const minPinX = sidebarOpen ? 286 : 12;
      const maxPinY = vpH - (state.timelineVisible ? 168 : 106);
      const occupiedBoxes = [];

      for (let p = 0; p < state.homelandPins.length; p++) {
        const pin = state.homelandPins[p];
        const rv = rotateVec(pin.vec3[0], pin.vec3[1], pin.vec3[2], cosLon, sinLon, cosLat, sinLat);
        if (rv[2] <= 0.05) continue;

        const anchorX = cx + rv[0] * baseR;
        const anchorY = cy - rv[1] * baseR;
        const isHi = (state.homelandFilterMuseumId === pin.museumId) || (state.hoveredMuseumPin === pin);
        const isDim = Boolean(state.homelandFilterMuseumId && state.homelandFilterMuseumId !== pin.museumId);

        const lbl = museumPinLabel(pin.museumId) + ' · ' + fmtNum(pin.count);
        const pillW = Math.ceil(ctx.measureText(lbl).width) + 16;
        const pillH = 19;

        const dirX = anchorX >= cx ? 1 : -1;
        const outR = dirX > 0 ? 10 : (-pillW - 10);
        const oppR = dirX > 0 ? (-pillW - 10) : 10;
        const candOffsets = [
          [outR, -pillH * 0.5],
          [outR, -pillH - 6],
          [outR, 7],
          [oppR, -pillH * 0.5],
          [oppR, -pillH - 6],
          [oppR, 7],
          [-pillW * 0.5, -pillH - 9],
          [-pillW * 0.5, 9],
          [outR, -pillH * 2 - 8],
          [outR, pillH + 10],
          [oppR, -pillH * 2 - 8],
          [oppR, pillH + 10],
          [outR, -pillH * 3 - 10],
          [outR, pillH * 2 + 13],
          [oppR, -pillH * 3 - 10],
          [oppR, pillH * 2 + 13],
          [-pillW * 0.5, -pillH * 2 - 11],
          [-pillW * 0.5, pillH + 14],
          [-pillW * 0.5, -pillH * 3 - 13],
          [-pillW * 0.5, pillH * 2 + 18],
          [dirX > 0 ? 36 : (-pillW - 36), -pillH * 2 - 6],
          [dirX > 0 ? 36 : (-pillW - 36), pillH + 12],
          [dirX < 0 ? 36 : (-pillW - 36), -pillH * 2 - 6],
          [dirX < 0 ? 36 : (-pillW - 36), pillH + 12]
        ];

        let chosenX = 0;
        let chosenY = 0;
        let foundSlot = false;

        for (let cIdx = 0; cIdx < candOffsets.length; cIdx++) {
          const tx = Math.max(minPinX, Math.min(vpW - pillW - 12, anchorX + candOffsets[cIdx][0]));
          const ty = Math.max(60, Math.min(maxPinY - pillH, anchorY + candOffsets[cIdx][1]));
          let hit = false;
          for (let b = 0; b < occupiedBoxes.length; b++) {
            const ob = occupiedBoxes[b];
            if (tx < ob.x + ob.w + 4 && tx + pillW + 4 > ob.x && ty < ob.y + ob.h + 3 && ty + pillH + 3 > ob.y) {
              hit = true;
              break;
            }
          }
          if (!hit) {
            chosenX = tx;
            chosenY = ty;
            foundSlot = true;
            break;
          }
        }

        ctx.globalAlpha = isDim ? 0.42 : 1.0;

        if (foundSlot) {
          occupiedBoxes.push({ x: chosenX, y: chosenY, w: pillW, h: pillH });
          // Leader line from city dot to pill
          const nearX = Math.max(chosenX, Math.min(chosenX + pillW, anchorX));
          const nearY = Math.max(chosenY, Math.min(chosenY + pillH, anchorY));
          ctx.strokeStyle = isHi ? 'rgba(204, 138, 36, 0.92)' : 'rgba(130, 92, 34, 0.62)';
          ctx.lineWidth = isHi ? 1.4 : 1.0;
          ctx.beginPath();
          ctx.moveTo(anchorX, anchorY);
          ctx.lineTo(nearX, nearY);
          ctx.stroke();
        }

        // City beacon dot
        ctx.fillStyle = isHi ? '#f5c45e' : '#b8822f';
        ctx.strokeStyle = '#fff9ec';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(anchorX, anchorY, isHi ? 4.6 : 3.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (foundSlot) {
          // Pill badge
          ctx.fillStyle = isHi ? 'rgba(43, 32, 21, 0.96)' : 'rgba(252, 246, 234, 0.94)';
          ctx.strokeStyle = isHi ? '#e8bd6a' : 'rgba(154, 114, 54, 0.62)';
          ctx.lineWidth = isHi ? 1.4 : 1.0;
          fillStrokeRoundRect(chosenX, chosenY, pillW, pillH, 9.5);

          ctx.fillStyle = isHi ? '#fffaf0' : '#2c2116';
          ctx.fillText(lbl, chosenX + 8, chosenY + pillH * 0.5 + 0.5);
        }

        visibleMuseumPins.push({
          pin: pin,
          x: foundSlot ? chosenX : (anchorX - 5),
          y: foundSlot ? chosenY : (anchorY - 5),
          w: foundSlot ? pillW : 10,
          h: foundSlot ? pillH : 10,
          anchorX: anchorX,
          anchorY: anchorY
        });
      }
      ctx.restore();
    }

    if (state.showLabels) {
      ctx.font = '500 10px "Google Sans Flex", "Noto Sans SC", sans-serif';
      ctx.textBaseline = 'middle';
      const step = Math.max(1, Math.floor(visibleCards.length / 42));
      for (let i = visibleCards.length - 1; i >= 0; i -= step) {
        const c = visibleCards[i];
        if (c.dimmed || c.rz < 0.35) continue;
        const shortLbl = state.lang === 'zh'
          ? c.art.zh.slice(0, 8)
          : (c.art.isCurated ? c.art.en.slice(0, 16) : c.art.tmplEn.slice(0, 16));
        const txt = formatDateLocalized(c.art.date.split('–')[0], true) + ' · ' + shortLbl;
        ctx.fillStyle = 'rgba(62, 46, 26, 0.82)';
        ctx.fillText(txt, c.sx + baseCardPx * 0.65, c.sy - baseCardPx * 0.45);
      }
    }

    if (state.ringMode > 0) {
      drawAstrolabeRings(cx, cy, baseR, cosLon, sinLon, cosLat, sinLat, true, ringLabelState);
    }

    ctx.restore();
    ensureMainRaf();
  }

  function drawAstrolabeRings(cx, cy, baseR, cosLon, sinLon, cosLat, sinLat, frontPass, ringLabelState) {
    const entries = state.ringEntries;
    const planes = state.ringMode === 1
      ? [{ tiltX: 0.38, tiltZ: -0.22 }]
      : state.ringMode === 2
        ? [{ tiltX: 0.42, tiltZ: -0.26 }, { tiltX: -0.48, tiltZ: 0.32 }]
        : [{ tiltX: 0.25, tiltZ: -0.18 }, { tiltX: 1.18, tiltZ: 0.24 }, { tiltX: -0.95, tiltZ: -0.42 }];

    ctx.save();
    ctx.font = '400 8.5px "Google Sans Flex", "Noto Sans SC", sans-serif';
    ctx.textBaseline = 'middle';

    const occupiedLeft = ringLabelState ? ringLabelState.left : [];
    const occupiedRight = ringLabelState ? ringLabelState.right : [];
    const sidebarBlocked = vpW > 920 && elSidebar && !elSidebar.classList.contains('collapsed');
    const bottomSafe = state.timelineVisible ? 168 : 104;

    ctx.strokeStyle = frontPass ? 'rgba(138, 114, 80, 0.34)' : 'rgba(155, 132, 98, 0.20)';
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    const labelDrawList = [];

    for (let p = 0; p < planes.length; p++) {
      const ctX = Math.cos(planes[p].tiltX), stX = Math.sin(planes[p].tiltX);
      const ctZ = Math.cos(planes[p].tiltZ), stZ = Math.sin(planes[p].tiltZ);

      for (let i = 0; i < entries.length; i++) {
        if (p > 0 && i % 2 !== 0) continue;
        const e = entries[i];
        const a = e.angle + p * 0.5;
        const x0 = Math.cos(a), z0 = Math.sin(a);
        const y1 = -z0 * stX;
        const z1 = z0 * ctX;
        const x2 = x0 * ctZ - y1 * stZ;
        const y2 = x0 * stZ + y1 * ctZ;

        const rx = x2 * cosLon + z1 * sinLon;
        const rz1 = -x2 * sinLon + z1 * cosLon;
        const rz = y2 * sinLat + rz1 * cosLat;
        const isFront = rz >= 0;
        if (isFront !== frontPass) continue;
        const ry = y2 * cosLat - rz1 * sinLat;

        const innerR = baseR * (1.035 + p * 0.03);
        const outerR = baseR * (1.035 + p * 0.03 + e.len);
        const xIn = cx + rx * innerR;
        const yIn = cy - ry * innerR;
        const xOut = cx + rx * outerR;
        const yOut = cy - ry * outerR;

        if (!frontPass && Math.hypot(xIn - cx, yIn - cy) < baseR * 0.98 && Math.hypot(xOut - cx, yOut - cy) < baseR * 0.98) {
          continue;
        }

        ctx.moveTo(xIn, yIn);
        ctx.lineTo(xOut, yOut);

        if (i % 6 === 0 && Math.hypot(xOut - cx, yOut - cy) > baseR * 1.03) {
          if (yOut < 96 && Math.abs(xOut - (vpW * 0.5)) < 210) continue;
          if (yOut > vpH - bottomSafe) continue;
          if (sidebarBlocked && xOut < 292) continue;

          const alignRight = xOut >= cx;
          const usedY = alignRight ? occupiedRight : occupiedLeft;
          let collides = false;
          for (let u = 0; u < usedY.length; u++) {
            if (Math.abs(usedY[u] - yOut) < 15) {
              collides = true;
              break;
            }
          }
          if (!collides) {
            usedY.push(yOut);
            labelDrawList.push([e.text, xOut + (alignRight ? 4 : -4), yOut, alignRight]);
          }
        }
      }
    }
    ctx.stroke();
    if (labelDrawList.length) {
      ctx.fillStyle = 'rgba(110, 88, 58, 0.46)';
      for (let i = 0; i < labelDrawList.length; i++) {
        const it = labelDrawList[i];
        ctx.textAlign = it[3] ? 'left' : 'right';
        ctx.fillText(it[0], it[1], it[2]);
      }
    }
    ctx.restore();
  }

  function updateHoverAt(clientX, clientY) {
    const rect = elGlobeSection.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    // Check Museum City Pin Pills first in Homeland-First Mode
    let hitPin = null;
    if (state.globeLens === 'homeland' && visibleMuseumPins.length > 0) {
      for (let i = visibleMuseumPins.length - 1; i >= 0; i--) {
        const mp = visibleMuseumPins[i];
        const inBox = localX >= mp.x && localX <= mp.x + mp.w && localY >= mp.y && localY <= mp.y + mp.h;
        const nearDot = Math.hypot(localX - mp.anchorX, localY - mp.anchorY) <= 7;
        if (inBox || nearDot) {
          hitPin = mp.pin;
          break;
        }
      }
    }
    state.hoveredMuseumPin = hitPin;
    if (hitPin) {
      state.hoveredArtifact = null;
      canvas.style.cursor = 'pointer';
      const m = MUSEUMS[hitPin.museumId] || curMuseum();
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      elTooltip.textContent = state.lang === 'zh'
        ? (mc.name + '（' + mc.hostCity + '）· ' + fmtNum(hitPin.count) + ' 件 — 点击筛选')
        : (mc.name + ' (' + mc.hostCity + ') · ' + fmtNum(hitPin.count) + ' items — click to filter');
      elTooltip.style.display = 'block';
      elTooltip.style.left = Math.min(window.innerWidth - 260, clientX + 14) + 'px';
      elTooltip.style.top = Math.max(12, clientY - 16) + 'px';
      return;
    }

    let best = null;
    let bestDist = Infinity;

    for (let i = visibleCards.length - 1; i >= 0; i--) {
      const c = visibleCards[i];
      if (c.dimmed) continue;
      const d = Math.hypot(localX - c.hitX, localY - c.hitY);
      if (d <= c.hitR && d < bestDist) {
        best = c.art;
        bestDist = d;
        break;
      }
    }

    state.hoveredArtifact = best;
    if (best) {
      canvas.style.cursor = 'pointer';
      const artM = (best.museumId && MUSEUMS[best.museumId]) ? MUSEUMS[best.museumId] : curMuseum();
      const artMc = (artM.copy && artM.copy[state.lang]) || artM.copy.en;
      const prefix = state.globeLens === 'homeland' ? (artMc.shortName + ' · ') : '';
      elTooltip.textContent = prefix + artThumbCaption(best) + ' · ' + formatDateLocalized(best.date, true);
      elTooltip.style.display = 'block';
      elTooltip.style.left = Math.min(window.innerWidth - 240, clientX + 14) + 'px';
      elTooltip.style.top = Math.max(12, clientY - 16) + 'px';
      if (!state.selectedCountry && state.globeLens === 'museum') {
        elActiveBanner.textContent = countryName(best.country);
        elActiveBanner.classList.add('visible');
      }
    } else {
      canvas.style.cursor = state.isDragging ? 'grabbing' : 'grab';
      elTooltip.style.display = 'none';
      if (!state.selectedCountry && state.globeLens === 'museum') {
        elActiveBanner.classList.remove('visible');
      }
    }
  }

  canvas.addEventListener('pointerdown', (e) => {
    state.isDragging = true;
    state.hasDragged = false;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointermove', (e) => {
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
      updateHoverAt(e.clientX, e.clientY);
    }
  });

  canvas.addEventListener('pointerup', (e) => {
    const wasClick = !state.hasDragged;
    state.isDragging = false;
    if (wasClick) {
      updateHoverAt(e.clientX, e.clientY);
      if (state.hoveredMuseumPin) {
        const clickedMid = state.hoveredMuseumPin.museumId;
        state.homelandFilterMuseumId = (state.homelandFilterMuseumId === clickedMid) ? null : clickedMid;
        const targetRow = state.selectedCountry || state.lastFocusedCountry || state.countries[0];
        if (targetRow) selectCountry(targetRow, true);
        updateUrlHash(state.selectedCountry, state.selectedArtifact);
      } else if (state.hoveredArtifact) {
        openArtifactModal(state.hoveredArtifact, false);
      }
    }
  });

  canvas.addEventListener('pointerleave', () => {
    state.hoveredMuseumPin = null;
    state.hoveredArtifact = null;
    elTooltip.style.display = 'none';
  });

  canvas.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) < 40) {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.91 : 1.10;
      state.targetZoom = Math.max(0.68, Math.min(2.65, state.targetZoom * factor));
    }
  }, { passive: false });

  window.addEventListener('resize', resizeCanvas);

  // Global Delegated Click Handler: Language Toggle, 4-Museum Switcher, Section Nav
  document.addEventListener('click', (e) => {
    const langBtn = e.target.closest('.lang-btn[data-lang]');
    if (langBtn) {
      const chosen = langBtn.getAttribute('data-lang');
      if (chosen) setLanguage(chosen);
      return;
    }

    const museumBtn = e.target.closest('[data-museum]');
    if (museumBtn) {
      const chosenM = museumBtn.getAttribute('data-museum');
      if (chosenM) switchMuseum(chosenM);
      return;
    }

    const navEl = e.target.closest('a[data-nav-section]');
    if (!navEl) return;
    const sectionId = navEl.getAttribute('data-nav-section');
    if (sectionId && document.getElementById(sectionId)) {
      e.preventDefault();
      scrollToSectionById(sectionId);
    }
  });

  if ('IntersectionObserver' in window) {
    const sectionIds = ['prologue', 'globe-section', 'masterpieces', 'methodology'];
    const obs = new IntersectionObserver((entries) => {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          setActiveNavSection(entries[i].target.id);
          break;
        }
      }
    }, { rootMargin: '-28% 0px -52% 0px', threshold: 0 });
    for (let i = 0; i < sectionIds.length; i++) {
      const el = document.getElementById(sectionIds[i]);
      if (el) obs.observe(el);
    }
  }

  document.getElementById('ledger-countries-btn').addEventListener('click', () => {
    scrollGlobeIntoView();
    selectCountry(null);
  });

  document.getElementById('ledger-timeline-btn').addEventListener('click', () => {
    scrollGlobeIntoView();
    state.timelineVisible = true;
    state.timelineActive = false;
    state.timelinePlaying = false;
    toggleTimelinePlayback();
  });

  elTabAllCountries.addEventListener('click', () => {
    selectCountry(null);
  });

  elTabCountryItems.addEventListener('click', () => {
    const targetC = state.selectedCountry || state.lastFocusedCountry || state.countries[0];
    if (targetC) selectCountry(targetC);
  });

  if (elLensByMuseum) {
    elLensByMuseum.addEventListener('click', () => {
      setGlobeLens('museum');
    });
  }
  if (elLensByHomeland) {
    elLensByHomeland.addEventListener('click', () => {
      setGlobeLens('homeland');
    });
  }

  function setDisplayMode(mode) {
    state.displayMode = mode;
    document.getElementById('mode-flat').classList.toggle('active', mode === 'flat');
    document.getElementById('mode-standing').classList.toggle('active', mode === 'standing');
    document.getElementById('mode-both').classList.toggle('active', mode === 'both');
    document.getElementById('mode-particles').classList.toggle('active', mode === 'particles');
  }

  document.getElementById('mode-flat').addEventListener('click', () => setDisplayMode('flat'));
  document.getElementById('mode-standing').addEventListener('click', () => setDisplayMode('standing'));
  document.getElementById('mode-both').addEventListener('click', () => setDisplayMode('both'));
  document.getElementById('mode-particles').addEventListener('click', () => setDisplayMode('particles'));

  const sizeSlider = document.getElementById('size-slider');
  const sizeReadout = document.getElementById('size-readout');
  sizeSlider.addEventListener('input', () => {
    const val = Math.max(0.4, Math.min(2.2, parseFloat(sizeSlider.value) || 1.0));
    state.cardScale = val;
    sizeReadout.textContent = val.toFixed(1);
  });

  document.getElementById('btn-rotate').addEventListener('click', (e) => {
    state.autoRotate = !state.autoRotate;
    e.currentTarget.classList.toggle('active', state.autoRotate);
  });

  function collectBtnLabel() {
    if (state.globeLens === 'homeland') {
      const nM = state.homelandPins.length || getHomelandEntry(state.homelandCountryEn).holdings.length;
      return state.lang === 'zh' ? ('流散至 ' + fmtNum(nM) + ' 馆') : ('Disperse to ' + fmtNum(nM) + ' Museums');
    }
    const mc = mCopy();
    return state.lang === 'zh' ? ('汇集' + mc.shortHost) : ('Collect to ' + mc.shortHost);
  }

  function updateCollectButtonUI() {
    const btnHome = document.getElementById('btn-go-home');
    const btnCollect = document.getElementById('btn-collect');
    if (state.globeLens === 'homeland') {
      const entry = getHomelandEntry(state.homelandCountryEn);
      const cName = countryName(entry);
      const nM = state.homelandPins.length || entry.holdings.length;
      btnHome.title = state.lang === 'zh'
        ? ('将全部 ' + fmtNum(entry.totalCount) + ' 件文物从全球 ' + fmtNum(nM) + ' 座博物馆一键飞返' + cName)
        : ('Fly all ' + fmtNum(entry.totalCount) + ' artifacts from ' + fmtNum(nM) + ' world museums back to ' + cName);
      btnCollect.title = state.lang === 'zh'
        ? ('演示' + cName + '文物向全球 ' + fmtNum(nM) + ' 座博物馆流散的航迹')
        : ('Animate dispersal of ' + cName + ' artifacts across ' + fmtNum(nM) + ' world museums');
    } else {
      const mc = mCopy();
      const m = curMuseum();
      btnHome.title = state.lang === 'zh'
        ? ('将全部文物从' + mc.shortHost + mc.hostCity + '一键飞返各原属国')
        : ('Fly all artifacts from ' + mc.hostCity + ' (' + mc.shortHost + ') back to their homelands');
      btnCollect.title = state.lang === 'zh'
        ? ('按 ' + m.acqStart + '–' + m.acqEnd + ' 年入藏时间轴将文物汇集至' + mc.hostCity)
        : ('Gather all artifacts chronologically (' + m.acqStart + '–' + m.acqEnd + ') into ' + mc.hostCity);
    }

    if (state.animatingFlight && state.flightDirection === 'home') {
      setButtonWithIcon(btnHome, GS_PATHS.hourglass, t('btnReturning'));
      setButtonWithIcon(btnCollect, GS_PATHS.play, collectBtnLabel());
    } else if (state.animatingFlight && state.flightDirection === 'collect') {
      setButtonWithIcon(btnHome, GS_PATHS.home, t('btnReturnHome'));
      setButtonWithIcon(btnCollect, GS_PATHS.hourglass, t('btnCollecting'));
    } else {
      setButtonWithIcon(btnHome, GS_PATHS.home, t('btnReturnHome'));
      setButtonWithIcon(btnCollect, GS_PATHS.play, collectBtnLabel());
    }
    btnHome.classList.toggle('action-highlight', state.isCollectedInHost || !state.animatingFlight);
    btnCollect.classList.toggle('active', state.isCollectedInHost);
  }

  function triggerReturnHomeFlight() {
    state.timelinePlaying = false;
    state.timelineActive = false;
    syncTimelineScrubberUI();
    state.selectedArtifact = null;
    elModal.classList.remove('open');

    state.isCollectedInHost = true;
    state.flightDirection = 'home';
    state.flightProgress = 0;
    state.animatingFlight = true;
    elFlightBanner.classList.add('visible');

    if (state.globeLens === 'homeland') {
      const entry = getHomelandEntry(state.homelandCountryEn);
      state.targetRotLon = -entry.centerLon * DEG2RAD;
      state.targetRotLat = Math.max(-1.05, Math.min(1.05, entry.centerLat * DEG2RAD));
      state.targetZoom = 1.04;
    } else {
      if (state.selectedCountry) selectCountry(null);
      const m = curMuseum();
      state.targetRotLon = m.defaultRotLonDeg * DEG2RAD;
      state.targetRotLat = m.defaultRotLatDeg * DEG2RAD;
      state.targetZoom = 0.98;
    }
    updateCollectButtonUI();
  }

  function triggerCollectToHostFlight() {
    state.timelinePlaying = false;
    state.timelineActive = false;
    syncTimelineScrubberUI();
    state.selectedArtifact = null;
    elModal.classList.remove('open');

    state.isCollectedInHost = false;
    state.flightDirection = 'collect';
    state.flightProgress = 0;
    state.animatingFlight = true;
    elFlightBanner.classList.add('visible');

    if (state.globeLens === 'homeland') {
      state.targetRotLon = -18 * DEG2RAD;
      state.targetRotLat = 30 * DEG2RAD;
      state.targetZoom = 0.94;
    } else {
      if (state.selectedCountry) selectCountry(null);
      const m = curMuseum();
      state.targetRotLon = -m.hostLon * DEG2RAD * 0.55 - 12 * DEG2RAD;
      state.targetRotLat = Math.min(36, Math.max(20, m.hostLat * 0.55)) * DEG2RAD;
      state.targetZoom = 1.02;
    }
    updateCollectButtonUI();
  }

  document.getElementById('btn-go-home').addEventListener('click', triggerReturnHomeFlight);
  document.getElementById('btn-collect').addEventListener('click', triggerCollectToHostFlight);

  document.getElementById('nav-return-home-btn').addEventListener('click', () => {
    scrollGlobeIntoView();
    triggerReturnHomeFlight();
  });

  document.getElementById('hero-return-home-btn').addEventListener('click', () => {
    scrollGlobeIntoView();
    triggerReturnHomeFlight();
  });

  if (elBtnTimeline) {
    elBtnTimeline.addEventListener('click', () => {
      state.timelineVisible = !state.timelineVisible;
      if (!state.timelineVisible) state.timelinePlaying = false;
      syncTimelineScrubberUI();
    });
  }
  if (elTlCloseBtn) {
    elTlCloseBtn.addEventListener('click', () => {
      state.timelineVisible = false;
      state.timelinePlaying = false;
      syncTimelineScrubberUI();
    });
  }
  if (elTlPlayBtn) {
    elTlPlayBtn.addEventListener('click', toggleTimelinePlayback);
  }
  if (elTlResetBtn) {
    elTlResetBtn.addEventListener('click', () => {
      resetTimelineFilter();
      updateUrlHash(state.selectedCountry, state.selectedArtifact);
    });
  }
  if (elTlSlider) {
    elTlSlider.addEventListener('input', () => {
      state.timelinePlaying = false;
      const yr = parseFloat(elTlSlider.value) || state.tlMaxYear;
      setTimelineYear(yr, true);
      updateUrlHash(state.selectedCountry, state.selectedArtifact);
    });
  }

  let highlightCursor = -1;
  document.getElementById('btn-random').addEventListener('click', () => {
    if (!state.curatedHighlights.length) return;
    highlightCursor = (highlightCursor + 1) % state.curatedHighlights.length;
    const picked = state.curatedHighlights[highlightCursor];
    state.isCollectedInHost = false;
    state.timelinePlaying = false;
    state.timelineActive = false;
    syncTimelineScrubberUI();
    if (state.globeLens === 'homeland') {
      const focusRow = state.selectedCountry || state.lastFocusedCountry || state.countries[0];
      if (focusRow) selectCountry(focusRow, true);
      openArtifactModal(picked, true);
    } else {
      selectCountry(picked.country);
      openArtifactModal(picked, true);
    }
  });

  document.getElementById('btn-labels').addEventListener('click', (e) => {
    state.showLabels = !state.showLabels;
    e.currentTarget.classList.toggle('active', state.showLabels);
  });

  document.getElementById('btn-origins').addEventListener('click', (e) => {
    state.showOrigins = !state.showOrigins;
    e.currentTarget.classList.toggle('active', state.showOrigins);
  });

  function setRingMode(m) {
    state.ringMode = (state.ringMode === m) ? 0 : m;
    document.getElementById('btn-ring1').classList.toggle('active', state.ringMode === 1);
    document.getElementById('btn-ring2').classList.toggle('active', state.ringMode === 2);
    document.getElementById('btn-ring3').classList.toggle('active', state.ringMode === 3);
  }
  document.getElementById('btn-ring1').addEventListener('click', () => setRingMode(1));
  document.getElementById('btn-ring2').addEventListener('click', () => setRingMode(2));
  document.getElementById('btn-ring3').addEventListener('click', () => setRingMode(3));

  document.getElementById('btn-aurora').addEventListener('click', (e) => {
    state.showAurora = !state.showAurora;
    e.currentTarget.classList.toggle('active', state.showAurora);
  });

  document.getElementById('sidebar-collapse-btn').addEventListener('click', (e) => {
    const collapsed = elSidebar.classList.toggle('collapsed');
    e.currentTarget.textContent = collapsed ? '+' : '−';
    if (collapsed) closeAllMuseumDropdowns();
  });

  function wireDropdownToggle(wrapperEl, triggerEl) {
    if (!wrapperEl || !triggerEl) return;
    triggerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasOpen = wrapperEl.classList.contains('open');
      closeAllMuseumDropdowns();
      if (!wasOpen) {
        wrapperEl.classList.add('open');
        triggerEl.setAttribute('aria-expanded', 'true');
      }
    });
  }

  wireDropdownToggle(elNavMuseumDropdown, elNavMuseumTrigger);
  wireDropdownToggle(elSidebarMuseumDropdown, elSidebarMuseumTrigger);
  wireDropdownToggle(elSidebarHomelandDropdown, elSidebarHomelandTrigger);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.museum-dropdown')) {
      closeAllMuseumDropdowns();
    }
  });

  document.getElementById('mobile-drawer-btn').addEventListener('click', () => {
    elSidebar.classList.toggle('mobile-open');
  });

  document.getElementById('back-to-countries-btn').addEventListener('click', () => {
    selectCountry(null);
  });

  function applySearchFilter() {
    state.searchQuery = sanitizeQuery(elSearchInput.value);
    elSearchClearBtn.classList.toggle('visible', state.searchQuery.length > 0);
    if (state.selectedCountry) {
      selectCountry(state.selectedCountry, true);
    } else {
      renderCountryList();
    }
  }

  elSearchInput.addEventListener('input', applySearchFilter);
  elSearchClearBtn.addEventListener('click', () => {
    elSearchInput.value = '';
    applySearchFilter();
    elSearchInput.focus();
  });

  const elModalPrevBtn = document.getElementById('modal-prev-btn');
  const elModalNextBtn = document.getElementById('modal-next-btn');
  if (elModalPrevBtn) elModalPrevBtn.addEventListener('click', () => stepModalArtifact(-1));
  if (elModalNextBtn) elModalNextBtn.addEventListener('click', () => stepModalArtifact(1));

  document.getElementById('modal-close-btn').addEventListener('click', () => {
    state.selectedArtifact = null;
    elModal.classList.remove('open');
    updateUrlHash(state.selectedCountry, null);
  });

  elModalPreviewBtn.addEventListener('click', () => {
    if (state.selectedArtifact) openLightbox(state.selectedArtifact);
  });

  elModalZoomBtn.addEventListener('click', () => {
    if (state.selectedArtifact) openLightbox(state.selectedArtifact);
  });

  if (elModalHomelandFlipBtn) {
    elModalHomelandFlipBtn.addEventListener('click', () => {
      const art = state.selectedArtifact;
      if (!art) return;
      if (state.globeLens === 'homeland') {
        const targetMid = art.museumId || state.museumId;
        const targetCountryEn = art.country ? art.country.en : '';
        switchMuseum(targetMid, true).then(() => {
          const matchedC = state.countries.find(c => c.en === targetCountryEn);
          if (matchedC) selectCountry(matchedC);
          else updateUrlHash(null, null);
        });
      } else {
        const targetHomeland = art.country ? art.country.en : 'China';
        focusHomeland(targetHomeland);
      }
    });
  }

  elCopyLinkBtn.addEventListener('click', () => {
    if (!state.selectedArtifact) return;
    const objUrl = buildArtifactObjUrl(state.selectedArtifact);
    const artM = (state.selectedArtifact.museumId && MUSEUMS[state.selectedArtifact.museumId])
      ? MUSEUMS[state.selectedArtifact.museumId]
      : curMuseum();
    const mc = (artM.copy && artM.copy[state.lang]) || artM.copy.en;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(objUrl).then(() => {
        elCopyLinkBtn.textContent = mc.copiedUrlBtn;
      }).catch(() => {
        elCopyLinkBtn.textContent = objUrl.replace(/^https?:\/\/(www\.)?/, '');
      });
    } else {
      elCopyLinkBtn.textContent = objUrl.replace(/^https?:\/\/(www\.)?/, '');
    }
  });

  const elLightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const elLightboxNextBtn = document.getElementById('lightbox-next-btn');
  if (elLightboxPrevBtn) elLightboxPrevBtn.addEventListener('click', () => stepLightboxArtifact(-1));
  if (elLightboxNextBtn) elLightboxNextBtn.addEventListener('click', () => stepLightboxArtifact(1));

  document.getElementById('lightbox-close-btn').addEventListener('click', closeLightbox);
  elLightbox.addEventListener('click', (e) => {
    if (e.target === elLightbox) closeLightbox();
  });
  elLightboxLocateBtn.addEventListener('click', () => {
    const art = state.lightboxArtifact;
    closeLightbox();
    if (!art) return;
    locateGalleryArtifactOnGlobe(art);
  });

  document.addEventListener('keydown', (e) => {
    const tag = e.target && e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    if (e.key === 'Escape') {
      closeAllMuseumDropdowns();
      if (elLightbox.classList.contains('open')) {
        closeLightbox();
      } else if (elModal.classList.contains('open')) {
        state.selectedArtifact = null;
        elModal.classList.remove('open');
      }
    } else if (e.key === 'ArrowLeft') {
      if (elLightbox.classList.contains('open')) {
        e.preventDefault();
        stepLightboxArtifact(-1);
      } else if (elModal.classList.contains('open')) {
        e.preventDefault();
        stepModalArtifact(-1);
      }
    } else if (e.key === 'ArrowRight') {
      if (elLightbox.classList.contains('open')) {
        e.preventDefault();
        stepLightboxArtifact(1);
      } else if (elModal.classList.contains('open')) {
        e.preventDefault();
        stepModalArtifact(1);
      }
    }
  });

  if (elScopeActiveMuseum && elScopeAllMuseums) {
    elScopeActiveMuseum.addEventListener('click', () => {
      state.galleryAllMuseums = false;
      updateRegionFilterTabs();
      renderMasterpiecesGallery();
    });
    elScopeAllMuseums.addEventListener('click', () => {
      state.galleryAllMuseums = true;
      updateRegionFilterTabs();
      renderMasterpiecesGallery();
    });
  }

    if (elGallerySearchInput) {
      const applyGalleryFilter = () => {
        state.gallerySearchQuery = sanitizeQuery(elGallerySearchInput.value);
        if (elGallerySearchClear) {
          elGallerySearchClear.classList.toggle('visible', state.gallerySearchQuery.length > 0);
        }
        const elGalCat = document.getElementById('gallery-full-catalog-link');
        if (elGalCat) {
          const onX20 = (window.location.pathname || '').includes('/www/');
          const catBase = onX20 ? './artifacts-catalog.html' : './catalog.html';
          const gp = [];
          if (state.lang === 'zh') gp.push('lang=zh');
          if (!state.galleryAllMuseums && state.museumId) gp.push('museum=' + encodeURIComponent(state.museumId));
          if (state.gallerySearchQuery) gp.push('q=' + encodeURIComponent(state.gallerySearchQuery));
          elGalCat.href = catBase + (gp.length ? ('#' + gp.join('&')) : '');
        }
        updateRegionFilterTabs();
        renderMasterpiecesGallery();
      };
    elGallerySearchInput.addEventListener('input', applyGalleryFilter);
    if (elGallerySearchClear) {
      elGallerySearchClear.addEventListener('click', () => {
        elGallerySearchInput.value = '';
        applyGalleryFilter();
        elGallerySearchInput.focus();
      });
    }
  }

  document.getElementById('region-filters').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-tab');
    if (!btn) return;
    const region = btn.getAttribute('data-region') || 'all';
    state.galleryRegion = region;
    updateRegionFilterTabs();
    renderMasterpiecesGallery();
  });

  async function applyInitialBoot() {
    const rawHash = window.location.hash.replace(/^#/, '');
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(rawHash.includes('=') ? rawHash : '');

    const initialMuseum = hashParams.get('museum') || searchParams.get('museum') || 'bm';
    const initialLang = hashParams.get('lang') || searchParams.get('lang') || 'en';
    const initialLens = hashParams.get('lens') || searchParams.get('lens') || 'museum';
    const initialHomeland = hashParams.get('homeland') || searchParams.get('homeland') || 'China';
    const initialMFilter = hashParams.get('mfilter') || '';
    const initialYear = parseInt(hashParams.get('year') || searchParams.get('year') || '', 10);

    state.museumId = SUPPORTED_MUSEUMS.includes(initialMuseum) ? initialMuseum : 'bm';
    state.lang = SUPPORTED_LANGS.includes(initialLang) ? initialLang : 'en';

    const m = curMuseum();
    state.rotLon = m.defaultRotLonDeg * DEG2RAD;
    state.rotLat = m.defaultRotLatDeg * DEG2RAD;
    state.targetRotLon = state.rotLon;
    state.targetRotLat = state.rotLat;

    resizeCanvas();
    applyStaticAndMuseumTranslations();

    // Load active museum's .webp atlas on-demand (other museums load instantaneously when selected, zero background GC freezes!)
    ensureMuseumAtlas(state.museumId);

    try {
      const { polyMap, borderArcs3D, landDots } = await decodeWorldMap();
      state.polyMap = polyMap;
      state.borderArcs3D = borderArcs3D;
      state.landDots3D = landDots;
    } catch (_) {
      state.polyMap = new Map();
    }

    if (initialLens === 'homeland') {
      const matchH = getHomelandCatalog().find(
        h => h.en.toLowerCase() === initialHomeland.toLowerCase() || h.zh === initialHomeland
      ) || getHomelandCatalog()[0];
      await focusHomeland(matchH.en, true);
      if (SUPPORTED_MUSEUMS.includes(initialMFilter)) {
        state.homelandFilterMuseumId = initialMFilter;
        selectCountry(state.selectedCountry, true);
      }
      renderMasterpiecesGallery();
      scrollGlobeIntoView();
    } else {
      generateDatasetForActiveMuseum();
      applyStaticAndMuseumTranslations();
      updateCollectButtonUI();
      renderCountryList();
      renderMasterpiecesGallery();
      renderTopOriginsBars();

      if (rawHash && rawHash.includes('=')) {
        const countryParam = sanitizeQuery(hashParams.get('country') || '');
        const countryLower = countryParam.toLowerCase();
        const matchedCountry = state.countries.find(c => c.en.toLowerCase() === countryLower || c.zh === countryParam);
        if (matchedCountry) {
          selectCountry(matchedCountry, true);
          scrollGlobeIntoView();
        } else {
          selectCountry(null, true);
        }
      } else {
        selectCountry(null, true);
      }
    }

    if (!Number.isNaN(initialYear) && initialYear >= 1400 && initialYear <= 2030) {
      setTimelineYear(initialYear, true);
    }

    if (rawHash && rawHash.includes('=')) {
      const idParam = parseInt(hashParams.get('id') || '', 10);
      if (!Number.isNaN(idParam) && idParam >= 0 && idParam < state.artifacts.length) {
        const art = state.artifacts[idParam];
        if (state.globeLens !== 'homeland') {
          selectCountry(art.country, true);
        }
        openArtifactModal(art, true);
      }
    }

    if (typeof IntersectionObserver === 'function' && elGlobeSection) {
      const gObs = new IntersectionObserver((entries) => {
        mainGlobeInViewport = Boolean(entries[0] && entries[0].isIntersecting);
        if (mainGlobeInViewport) {
          mainLastSig = '';
          ensureMainRaf();
        }
      }, { threshold: 0.01 });
      gObs.observe(elGlobeSection);
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        mainLastSig = '';
        ensureMainRaf();
      }
    });

    window.addEventListener('scroll', () => {
      mainScrollPauseUntil = performance.now() + 160;
    }, { passive: true });

    ensureMainRaf();
  }

  const elDockEl = document.getElementById('bottom-dock');
  if (elDockEl && elGlobeSection && typeof ResizeObserver === 'function') {
    const syncDockHeight = () => {
      const h = elDockEl.offsetHeight;
      if (h > 0) elGlobeSection.style.setProperty('--dock-h', h + 'px');
    };
    syncDockHeight();
    new ResizeObserver(syncDockHeight).observe(elDockEl);
  }

  window.__ARTIFACTS_STUDIO_BRIDGE__ = {
    page: 'index',
    getLang: () => state.lang,
    getActiveArtifact: () => {
      const a = state.selectedArtifact || state.lightboxArtifact;
      if (!a || !a.isCurated) return null;
      return { museumId: a.museumId || state.museumId, sprite: a.sprite };
    },
    focusMuseum: (mid) => {
      scrollGlobeIntoView();
      switchMuseum(mid);
    },
    focusHomeland: (countryEn) => {
      scrollGlobeIntoView();
      focusHomeland(countryEn);
    },
    focusMasterpiece: (mid, countryEn, sprite) => {
      scrollGlobeIntoView();
      switchMuseum(mid).then(() => {
        const matchedC = state.countries.find(c => c.en === countryEn);
        if (matchedC) {
          selectCountry(matchedC);
          const art = matchedC.artifacts.find(a => a.isCurated && a.sprite === sprite) || matchedC.artifacts[0];
          if (art) openArtifactModal(art, true, true);
        }
      });
    }
  };

  applyInitialBoot();
})();
