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
    MUSEUMS
  } = DATA;

  const DEG2RAD = Math.PI / 180;
  const EARTH_RADIUS_KM = 6371;
  const GLOBE_MIP_SIZE = 96;

  const MUSEUM_CITIES = {
    bm: ['London, UK', '英国·伦敦'],
    met: ['New York, US', '美国·纽约'],
    hermitage: ['St. Petersburg, Russia', '俄罗斯·圣彼得堡'],
    louvre: ['Paris, France', '法国·巴黎'],
    berlin: ['Berlin, Germany', '德国·柏林'],
    tnm: ['Tokyo, Japan', '日本·东京'],
    smithsonian: ['Washington, D.C., US', '美国·华盛顿'],
    quaibranly: ['Paris, France', '法国·巴黎'],
    rijks: ['Amsterdam, Netherlands', '荷兰·阿姆斯特丹'],
    vatican: ['Vatican City / Rome', '梵蒂冈·罗马']
  };

  const MUSEUM_PIN_SHORT = {
    bm: ['London · BM', '伦敦·大英'],
    met: ['New York · Met', '纽约·大都会'],
    hermitage: ['St. Petersburg · Hermitage', '圣彼得堡·冬宫'],
    louvre: ['Paris · Louvre', '巴黎·卢浮宫'],
    berlin: ['Berlin · SMB', '柏林·佩加蒙'],
    tnm: ['Tokyo · TNM', '东京·东博'],
    smithsonian: ['D.C. · Smithsonian', '华盛顿·弗利尔'],
    quaibranly: ['Paris · Quai Branly', '巴黎·凯布朗利'],
    rijks: ['Amsterdam · Rijks', '阿姆斯特丹·国博'],
    vatican: ['Vatican · Rome', '梵蒂冈·罗马']
  };

  // 5 Curated Cross-Museum Scrollytelling Journeys (30 Verified Masterworks)
  const STORIES = [
    {
      id: 'silkroad',
      num: 'STORY 01',
      tabTitleEn: 'Oases of the Silk Road',
      tabTitleZh: '丝路遗珍与石窟流散',
      headingEn: 'Oases of the Silk Road: From Dunhuang & Turfan to Five World Capitals',
      headingZh: '丝路遗珍：从敦煌、吐鲁番到黑水城的百年流散',
      thesisEn: 'Between 1899 and the 1920s, desert expeditions led by Aurel Stein, Albert Grünwedel, Pyotr Kozlov, and early art dealers carried cave murals, votive silk banners, and rock-cut Buddhist sculptures out of Silk Road oases and northern Chinese sanctuaries into museums across London, Berlin, St. Petersburg, New York, and Tokyo.',
      thesisZh: '19世纪末至20世纪初，斯坦因、格伦威德尔、科兹洛夫等西域探险队及古董商先后深入敦煌莫高窟、吐鲁番柏孜克里克、额济纳黑水城及晋豫石窟，使沉睡千年的丝路绢画、石窟壁画与唐宋造像远渡重洋，散落伦敦、柏林、圣彼得堡、纽约与东京五大名城。',
      stops: [
        {
          museumId: 'bm', countryEn: 'China', sprite: 3,
          siteEn: 'Mogao Cave 17, Dunhuang', siteZh: '甘肃敦煌·莫高窟藏经洞',
          siteLon: 94.809, siteLat: 40.042,
          storyEn: 'Sealed inside Dunhuang’s "Library Cave" (Cave 17) around AD 1000 and opened by Taoist Wang Yuanlu in 1900, this Tang silk banner of Ksitigarbha and the Ten Kings of Hell was acquired by Aurel Stein in 1907—one of hundreds of Cave 17 paintings now divided among London, Paris, New Delhi, and Beijing.',
          storyZh: '绘于晚唐五代，封存于莫高窟第17窟（藏经洞）近千年。1907年斯坦因自王道士处购得大批经卷绢画，此幅设色绚丽的《地藏菩萨十王图》遂自河西走廊万里西行入藏伦敦大英博物馆。'
        },
        {
          museumId: 'berlin', countryEn: 'China', sprite: 16,
          siteEn: 'Bezeklik Caves, Turfan', siteZh: '新疆吐鲁番·柏孜克里克石窟',
          siteLon: 89.535, siteLat: 42.956,
          storyEn: 'Carved into the scarlet cliffs of the Flaming Mountains in the Turfan oasis, the Uighur royal temple murals of Bezeklik depicted Silk Road merchants, monks, and past Buddhas. Detached by German Turfan expeditions before 1914, surviving panels were installed in Berlin’s Museum of Asian Art.',
          storyZh: '原位于火焰山木头沟悬崖上的高昌回鹘王室寺院柏孜克里克石窟。20世纪初德国吐鲁番探险队将巨幅《誓愿图》壁画切割运往柏林，见证了粟特商旅与回鹘供养人在丝路北道的交汇。'
        },
        {
          museumId: 'hermitage', countryEn: 'China', sprite: 0,
          siteEn: 'Khara-Khoto, Inner Mongolia', siteZh: '内蒙古额济纳·黑水城遗址',
          siteLon: 101.145, siteLat: 41.764,
          storyEn: 'Beneath the sands of the Gobi, Russian explorer Pyotr Kozlov unearthed a sealed stupa outside the Tangut fortress of Khara-Khoto in 1908–1909, preserving an entire library and silk pantheon of the vanished Western Xia empire (1038–1227), now housed in St. Petersburg’s State Hermitage.',
          storyZh: '1909年俄国探险家科兹洛夫在巴丹吉林沙漠边缘发掘西夏黑水城佛塔，出土数千卷西夏文文献与唐卡绢画。此幅《毗沙门天王曼荼罗》设色如新，成为冬宫艾尔米塔什博物馆丝路馆藏的核心瑰宝。'
        },
        {
          museumId: 'bm', countryEn: 'Afghanistan', sprite: 14,
          siteEn: 'Bimaran Stupa, Jalalabad', siteZh: '阿富汗贾拉拉巴德·比马兰佛塔',
          siteLon: 70.352, siteLat: 34.448,
          storyEn: 'Excavated inside a steatite reliquary in eastern Afghanistan in 1834 alongside Indo-Scythian coins, this chased gold casket set with Badakhshan rubies stands at the exact Kushan crossroads where Hellenistic arches met one of history’s earliest human images of the Buddha.',
          storyZh: '1834年出土于阿富汗东部古犍陀罗比马兰2号佛塔石函内，锤揲纯金并镶嵌巴达赫尚红宝石，以古希腊式拱龛围绕早期佛陀立像，浓缩了欧亚十字路口的希腊—印度—丝路艺术融合。'
        },
        {
          museumId: 'met', countryEn: 'China', sprite: 1,
          siteEn: 'Guangsheng Lower Monastery, Shanxi', siteZh: '山西洪洞·广胜下寺',
          siteLon: 111.682, siteLat: 36.298,
          storyEn: 'Spanning over fifteen meters across, this monumental Yuan-dynasty Paradise of Bhaishajyaguru (c. 1319) once adorned the main hall of Guangsheng Lower Monastery in Shanxi. Sold during temple repairs in the late 1920s, it anchors the Arthur M. Sackler Hall at The Met in New York.',
          storyZh: '原绘于山西洪洞广胜下寺佛殿东壁（约1319年），高逾7.5米、宽逾15米，气势恢宏。20世纪20年代末壁画流散海外，后入藏纽约大都会艺术博物馆赛克勒展厅，是海外尺幅最巨的中国寺观壁画之一。'
        },
        {
          museumId: 'tnm', countryEn: 'China', sprite: 6,
          siteEn: 'Tianlongshan Grottoes, Taiyuan', siteZh: '山西太原·天龙山石窟',
          siteLon: 112.441, siteLat: 37.712,
          storyEn: 'Carved during the golden height of High Tang sculpture in the hills southwest of Taiyuan, Tianlongshan’s graceful sandstone bodhisattvas suffered widespread chiseling in the 1920s; this serene torso entered the Tokyo National Museum’s Toyokan Asian Gallery in 1935.',
          storyZh: '雕凿于盛唐时期的太原天龙山石窟，衣纹流畅贴体，兼具印度笈多遗风与大唐雍容气度。20世纪20年代天龙山造像惨遭大规模凿盗流散，此尊菩萨砂岩像于1935年入藏东京国立博物馆东洋馆。'
        }
      ]
    },
    {
      id: 'benin',
      num: 'STORY 02',
      tabTitleEn: 'Benin & West African Courts',
      tabTitleZh: '贝宁与西非王庭圣器',
      headingEn: 'West African Royal Courts: Twin Ivories & Bronzes Across Four Capitals',
      headingZh: '西非王庭圣器：孪生象牙面具与贝宁青铜的四城流散',
      thesisEn: 'Long before European contact, royal guilds in Ile-Ife and Benin City mastered naturalistic lost-wax casting and court ivory carving that rivaled Renaissance Florence. After colonial expeditions against Abomey (1892) and Benin City (1897), thousands of palace altars, plaques, and twin masks were scattered across London, New York, Berlin, and Paris.',
      thesisZh: '早在欧洲航海者抵达之前，尼日利亚伊费与贝宁城邦的王室铸工行会便已掌握炉火纯青的失蜡青铜铸造与宫廷牙雕技艺。1892年阿波美战事与1897年英军“贝宁远征”后，数千件王宫铜板、先王头像与成对的王太后象牙面具流散至伦敦、纽约、柏林与巴黎。',
      stops: [
        {
          museumId: 'bm', countryEn: 'Nigeria', sprite: 47,
          siteEn: 'Wunmonije Compound, Ile-Ife', siteZh: '尼日利亚·伊费圣城王宫遗址',
          siteLon: 4.560, siteLat: 7.482,
          storyEn: 'Unearthed at Ile-Ife—spiritual cradle of the Yoruba world—in 1938, this 14th-century striated copper-alloy royal head astonished European art historians with its serene lifelike proportions, overturning colonial prejudices about sub-Saharan classical sculpture.',
          storyZh: '1938年出土于约鲁巴文明圣城伊费（约14世纪），以失蜡法精铸的等身王冠头像神态静穆写实，彻底推翻了西方学界对非洲古典雕塑的偏见，现藏大英博物馆塞恩斯伯里非洲展厅。'
        },
        {
          museumId: 'quaibranly', countryEn: 'Nigeria', sprite: 4,
          siteEn: 'Ile-Ife Sacred Groves, Nigeria', siteZh: '尼日利亚·伊费祭祀圣林',
          siteLon: 4.552, siteLat: 7.491,
          storyEn: 'Alongside copper-alloy heads, Ife sculptors modeled refined terracotta royal portraits between the 12th and 15th centuries. Preserved today at Paris’s Musée du Quai Branly, this commemorative head reveals the unbroken lineage linking Ife artistry to neighboring Edo (Benin).',
          storyZh: '与青铜头像并传于世的伊费王室赤陶纪念肖像（12–15世纪），现藏巴黎凯布朗利博物馆。相传正是伊费铸师将失蜡铸铜秘技传授给邻邦贝宁王国，开启了西非宫廷艺术的黄金时代。'
        },
        {
          museumId: 'bm', countryEn: 'Nigeria', sprite: 45,
          siteEn: 'Royal Palace, Benin City (Edo)', siteZh: '尼日利亚·贝宁城王宫',
          siteLon: 5.622, siteLat: 6.335,
          storyEn: 'Carved around 1520 for Oba Esigie to honor his mother Queen Idia—whose counsel and mystical power secured victory in war—this ivory hip-pendant mask crowned with Portuguese mudfish motifs was seized from the Oba’s bedchamber in February 1897 and brought to London.',
          storyZh: '约1520年贝宁国王埃西吉埃为纪念助其平定战乱的生母伊迪亚王太后而命宫廷牙雕行会精雕。冠顶饰象征海洋贸易的葡人头像与泥鱼，1897年自贝宁王宫寝殿被劫往英国，现藏大英博物馆。'
        },
        {
          museumId: 'met', countryEn: 'Nigeria', sprite: 29,
          siteEn: 'Royal Palace, Benin City (Edo)', siteZh: '尼日利亚·贝宁城王宫（同源孪生）',
          siteLon: 5.622, siteLat: 6.335,
          storyEn: 'Carved by the exact same 16th-century Benin ivory workshop as the British Museum mask—originally worn together at royal ancestral ceremonies—this twin Queen Mother Idia mask crossed the Atlantic to New York’s Metropolitan Museum in 1978, 8,500 km from Edo.',
          storyZh: '与上一站大英博物馆藏品出自16世纪同一贝宁王室牙雕大师之手的“孪生姐妹作”，原在宫廷祭祖大典中成对佩挂，1897年离散后几经辗转于1978年入藏纽约大都会博物馆——点击下方“同源合璧”即可令两件面具重聚故土。'
        },
        {
          museumId: 'berlin', countryEn: 'Nigeria', sprite: 18,
          siteEn: 'Royal Palace Pillars, Benin City', siteZh: '尼日利亚·贝宁王宫廊柱与祭坛',
          siteLon: 5.625, siteLat: 6.338,
          storyEn: 'Hundreds of cast-brass relief plaques once sheathed the wooden pillars of the Benin palace as a visual chronicle of court ritual and diplomacy. Auctioned in London to fund the 1897 military expedition, the second-largest ensemble entered Berlin’s Ethnologisches Museum—now part of landmark German–Nigerian ownership transfers.',
          storyZh: '昔日镶嵌于贝宁王宫木柱上的失蜡黄铜浮雕板，犹如一部立体的宫廷礼制编年史。1897年英方在伦敦拍卖战利品以抵军费，柏林民族学博物馆购入仅次于伦敦的第二大馆藏群，近年更成为德尼文物返还协议的焦点。'
        },
        {
          museumId: 'quaibranly', countryEn: 'Benin', sprite: 0,
          siteEn: 'Royal Palaces of Abomey', siteZh: '贝宁共和国·阿波美王宫',
          siteLon: 1.991, siteLat: 7.185,
          storyEn: 'West of Edo in the Kingdom of Dahomey, King Ghezo’s monumental two-meter wooden throne—carved from a single iroko trunk and resting on four defeated enemy skulls—was taken by General Dodds in 1892 and displayed in Paris; in 2021 France returned 26 sister Abomey treasures to Cotonou.',
          storyZh: '阿波美王国（达荷美）盖佐国王整木雕凿的双层高王座，1892年法军攻占阿波美后运抵巴黎入藏特罗卡德罗（今凯布朗利博物馆）。2021年法国已将同批26件阿波美王室重器正式归还贝宁共和国。'
        }
      ]
    },
    {
      id: 'scripts',
      num: 'STORY 03',
      tabTitleEn: 'Deciphering Ancient Scripts',
      tabTitleZh: '破译五千年古文字密码',
      headingEn: 'Deciphering Human Memory: Six Inscribed Monuments Across 3,000 Years',
      headingZh: '破译人类记忆：横跨三千年的六大古文字丰碑',
      thesisEn: 'How did humanity recover voices silent for millennia? Follow six inscribed masterworks—from Sumerian cuneiform and Babylonian law in Mesopotamia to Western Zhou bronze inscriptions in China, the trilingual Rosetta Stone in Egypt, and Classic Maya lintels in Chiapas—that unlocked whole civilizations.',
      thesisZh: '人类如何读懂失落数千年的远古文明？沿着六件铭刻文字的不朽重器——从两河流域苏美尔与古巴比伦楔形文字、中国西周长篇青铜金文，到破译古埃及圣书体的罗塞塔石碑与美洲玛雅纪年石刻门楣——见证世界文字破译史的壮阔航迹。',
      stops: [
        {
          museumId: 'vatican', countryEn: 'Iraq', sprite: 10,
          siteEn: 'Girsu (Tello), Southern Iraq', siteZh: '伊拉克南部·吉尔苏古城（拉格什）',
          siteLon: 46.191, siteLat: 31.563,
          storyEn: 'Carved in gleaming dark diorite around 2130 BC, ruler Gudea of Lagash folds his hands in perpetual prayer while crisp Sumerian cuneiform columns across his robe record temple dedications in humanity’s oldest written language—now preserved in the Vatican Gregorian Museum.',
          storyZh: '约公元前2130年雕凿于坚硬闪长岩之上，拉格什统治者古地亚双手合十祈祷，衣袍表面镌刻工整的苏美尔语楔形文字神庙献词——这是人类最早成熟文字系统的典范，现藏梵蒂冈博物馆。'
        },
        {
          museumId: 'louvre', countryEn: 'Iraq', sprite: 0,
          siteEn: 'Babylon & Susa', siteZh: '古巴比伦与埃兰苏萨',
          siteLon: 44.421, siteLat: 32.542,
          storyEn: 'Already an ancient war trophy in antiquity—carried from Babylon to Iranian Susa in the 12th century BC—King Hammurabi’s 2.25-meter basalt stele (c. 1750 BC) preserves 282 Akkadian legal judgments beneath Shamash, god of justice, excavated by Jacques de Morgan in 1901–1902 for the Louvre.',
          storyZh: '高2.25米的《汉谟拉比法典》玄武岩石碑（约前1750年），早在公元前12世纪便作为战利品被埃兰人自巴比伦劫往苏萨，1901年法国考古队发掘后运抵巴黎卢浮宫，碑身楔形文字完整铭刻282条古巴比伦法典条文。'
        },
        {
          museumId: 'smithsonian', countryEn: 'China', sprite: 1,
          siteEn: 'Luoyang (Chengzhou), Henan', siteZh: '河南洛阳·西周成周王畿',
          siteLon: 112.454, siteLat: 34.683,
          storyEn: 'Unearthed near Luoyang in 1929 and acquired by Washington’s Freer Gallery in 1930, the house-shaped bronze Ling Fangyi (c. 1000 BC) carries a 187-character cast inscription inside its lid and base documenting royal court ceremonies of the Duke of Zhou’s son at Chengzhou.',
          storyZh: '1929年出土于河南洛阳马坡，1930年入藏华盛顿史密森尼弗利尔美术馆。器盖与器底同铸187字西周早期金文，详载周公之子明保在成周举行册命祭礼的史实，被誉为海外西周青铜铭文重器之冠。'
        },
        {
          museumId: 'bm', countryEn: 'Iraq', sprite: 26,
          siteEn: 'Library of Ashurbanipal, Nineveh', siteZh: '伊拉克摩苏尔·尼尼微亚述王家图书馆',
          siteLon: 43.152, siteLat: 36.359,
          storyEn: 'When self-taught London banknote engraver George Smith translated this baked clay tablet from Nineveh in December 1872, he reportedly jumped up and ran around the British Museum study room: Tablet XI of the Epic of Gilgamesh held a Mesopotamian Great Flood narrative centuries older than Genesis.',
          storyZh: '出土于尼尼微亚述巴尼拔王家图书馆遗址。1872年大英博物馆学者乔治·史密斯破译出泥板上的《吉尔伽美什史诗》第十一块“大洪水传说”，轰动全球学术界，证实两河文学母题比《旧约》早逾千年。'
        },
        {
          museumId: 'bm', countryEn: 'Egypt', sprite: 17,
          siteEn: 'Rashid (Rosetta), Nile Delta', siteZh: '埃及尼罗河口·罗塞塔（拉希德）',
          siteLon: 30.417, siteLat: 31.404,
          storyEn: 'Inscribed in 196 BC for young Pharaoh Ptolemy V in three scripts—sacred hieroglyphs, everyday Demotic, and administrative Greek—the granodiorite stele uncovered by French soldiers in 1799 and ceded to Britain in 1801 enabled Jean-François Champollion’s 1822 breakthrough.',
          storyZh: '公元前196年以圣书体、世俗体与古希腊文三体同刻托勒密五世诏书。1799年法军在尼罗河口拉希德筑垒时发现，1801年转归英国，1822年商博良凭此石碑一举破译失传千余年的古埃及象形文字。'
        },
        {
          museumId: 'bm', countryEn: 'Mexico', sprite: 54,
          siteEn: 'Yaxchilan, Chiapas Rainforest', siteZh: '墨西哥恰帕斯雨林·亚斯奇兰玛雅古城',
          siteLon: -90.968, siteLat: 16.900,
          storyEn: 'Cut from the doorway of Structure 23 deep in the Usumacinta jungle by Alfred Maudslay in 1882, Lintel 24 pairs razor-sharp Maya court relief with precise Long Count hieroglyphic dates—28 October AD 709—that anchored the decipherment of dynastic Maya history.',
          storyZh: '原嵌于乌苏马辛塔河畔玛雅古城亚斯奇兰23号神庙门楣，1882年由莫兹利切割运抵伦敦。浮雕上方精刻玛雅长纪历象形文字（精确对应公元709年10月28日），成为破译玛雅王朝纪年史的关键坐标。'
        }
      ]
    },
    {
      id: 'monuments',
      num: 'STORY 04',
      tabTitleEn: 'Divided Monuments',
      tabTitleZh: '同殿异乡：分裂的古迹',
      headingEn: 'Divided Monuments: Single Temples & Gates Split Across Continents',
      headingZh: '同殿异乡：同一座神庙与城门如何分居世界名馆',
      thesisEn: 'Walk into London, Paris, Berlin, or New York and you step inside fragments of the very same ancient buildings: Phidias’s Parthenon on the Athens Acropolis and Nebuchadnezzar II’s glazed Ishtar Processional Way in Babylon now live divided across oceans. Press "Reunite Home" to fly sister reliefs back to one foundation.',
      thesisZh: '走进伦敦、巴黎、柏林与纽约的展厅，你看到的往往是同一座古代建筑被拆解后的不同局部：雅典卫城的帕特农神庙雕塑分藏英法，古巴比伦伊什塔尔城门与游行大道的琉璃瑞兽隔大西洋相望。点击“同源合璧”，观看异馆姊妹残件重归同一座地基。',
      stops: [
        {
          museumId: 'bm', countryEn: 'Greece', sprite: 34,
          siteEn: 'The Parthenon, Athens Acropolis', siteZh: '希腊雅典·卫城帕特农神庙（东山墙）',
          siteLon: 23.726, siteLat: 37.971,
          storyEn: 'Breathing with exhaustion as the moon-chariot sinks beneath the horizon at Athena’s birth, this Pentelic marble horse head from the Parthenon’s East Pediment (438–432 BC) was removed by Lord Elgin’s agents between 1801 and 1805 and purchased for the British Museum in 1816.',
          storyZh: '雕凿于公元前438–前432年帕特农神庙东山墙一角，表现月神塞勒涅战马破晓沉入海平线时的喘息神态。1801–1805年间由额尔金伯爵自雅典卫城拆运赴英，1816年入藏大英博物馆杜维恩展厅。'
        },
        {
          museumId: 'louvre', countryEn: 'Greece', sprite: 26,
          siteEn: 'The Parthenon, Athens Acropolis', siteZh: '希腊雅典·卫城帕特农神庙（东侧内壁带）',
          siteLon: 23.726, siteLat: 37.971,
          storyEn: 'Carved for the exact same East Frieze of the Parthenon, the "Plaque of the Ergastines" depicts Athenian maidens bearing the sacred peplos robe for Athena. Acquired in Athens by French ambassador Choiseul-Gouffier in 1788, it entered the Louvre in 1798—1,000 km south of its London counterparts.',
          storyZh: '与大英博物馆帕特农石雕原属同一座神庙东侧内殿浮雕带，刻画雅典少女在泛雅典娜节呈献圣袍的庄严队列。1788年由法国驻奥斯曼大使舒瓦瑟尔-古菲耶自卫城运走，1798年入藏巴黎卢浮宫。'
        },
        {
          museumId: 'berlin', countryEn: 'Iraq', sprite: 3,
          siteEn: 'Ishtar Gate, Ancient Babylon', siteZh: '伊拉克希拉·古巴比伦城伊什塔尔门',
          siteLon: 44.421, siteLat: 32.543,
          storyEn: 'Excavated at Babylon between 1899 and 1914 by Robert Koldewey in ratusan crates of cobalt-blue, turquoise, and gold-glazed bricks, King Nebuchadnezzar II’s monumental Ishtar Gate (c. 575 BC) was reassembled full-scale inside Berlin’s Pergamon Museum in 1930.',
          storyZh: '尼布甲尼撒二世于公元前575年营建的古巴比伦北城门，满铺钴蓝琉璃砖并浮雕神龙穆什胡什与公牛。1899–1914年德国考古学家科尔德威发掘出数万块碎砖运往柏林，1930年在佩加蒙博物馆原大复原。'
        },
        {
          museumId: 'met', countryEn: 'Iraq', sprite: 16,
          siteEn: 'Processional Way, Ancient Babylon', siteZh: '伊拉克希拉·古巴比伦游行大道（同源琉璃砖）',
          siteLon: 44.422, siteLat: 32.544,
          storyEn: 'Once marching along the exact Processional Way leading directly through Berlin’s Ishtar Gate, 120 roaring glazed-brick lions sacred to Ishtar guarded Babylon’s New Year festival; Berlin ceded two panels to The Met in 1931 so New York and Berlin now share one ceremonial street.',
          storyZh: '原镶嵌于紧连伊什塔尔城门的古巴比伦迎神游行大道两侧（共120头象征伊什塔尔女神的咆哮雄狮）。1931年纽约大都会博物馆自柏林购得其中两幅完整琉璃砖狮板，使同一条巴比伦御道分跨欧亚美三洲。'
        },
        {
          museumId: 'berlin', countryEn: 'Turkey', sprite: 5,
          siteEn: 'Acropolis of Pergamon (Bergama)', siteZh: '土耳其贝尔加马·帕加马卫城祭坛',
          siteLon: 27.184, siteLat: 39.132,
          storyEn: 'Overlooking the Aegean coast of Anatolia, the Hellenistic Great Altar of Pergamon (c. 170 BC) wrapped an entire monumental staircase in writhing marble gods and giants; excavated by Carl Humann under Ottoman firman permits in 1878–1886, it gave Berlin’s Pergamon Museum its very name.',
          storyZh: '矗立于小亚细亚帕加马卫城之巅（约前170年），长达113米的高浮雕基座刻画众神与巨人搏斗的磅礴戏剧张力。1878–1886年德国工程师卡尔·胡曼发掘并运抵柏林，佩加蒙博物馆正因这座祭坛而得名。'
        },
        {
          museumId: 'met', countryEn: 'Egypt', sprite: 9,
          siteEn: 'Dendur, Lower Nubia (Nile)', siteZh: '埃及下努比亚·尼罗河畔丹铎原址',
          siteLon: 32.942, siteLat: 23.688,
          storyEn: 'Built around 15 BC under Roman Emperor Augustus for Isis and two deified Nubian brothers, the sandstone Temple of Dendur faced submersion beneath Lake Nasser during the Aswan High Dam campaign; Egypt gifted it to the United States in 1965 in recognition of UNESCO Nubian salvage aid.',
          storyZh: '建于公元前15年奥古斯都时期，原矗立于下努比亚尼罗河西岸。20世纪60年代阿斯旺高坝兴建时面临永沉水底之危，埃及政府为感谢国际抢救努比亚古迹行动，于1965年将整座神庙赠予美国并重建于大都会博物馆。'
        }
      ]
    },
    {
      id: 'oceans',
      num: 'STORY 05',
      tabTitleEn: 'Across Three Oceans',
      tabTitleZh: '跨越重洋：瓷路与远航',
      headingEn: 'Across Three Oceans: Maritime Porcelain, Hokusai’s Wave & Rapa Nui',
      headingZh: '跨越重洋：海上瓷路、浮世巨浪与复活节岛最远归途',
      thesisEn: 'Follow ocean currents from Jingdezhen kilns and Nagasaki’s Deshima island to Amsterdam’s canals, Whistler’s gilded London-to-Washington Peacock Room, royal Lombok regalia, and Easter Island’s basalt ancestor Hoa Hakananai’a—13,620 kilometers across the Pacific and Atlantic from home.',
      thesisZh: '顺着季风与洋流，从景德镇御窑与长崎出岛扬帆，穿过马六甲与好望角抵达阿姆斯特丹运河，再看葛饰北斋木版巨浪与惠斯勒孔雀厅如何重塑欧美审美，直至凝视距故乡复活节岛达 13,620 公里的摩艾石像。',
      stops: [
        {
          museumId: 'rijks', countryEn: 'China', sprite: 6,
          siteEn: 'Jingdezhen Imperial & Export Kilns', siteZh: '江西景德镇·明万历外销瓷窑场',
          siteLon: 117.200, siteLat: 29.294,
          storyEn: 'Fired in Jingdezhen around 1600 in luminous cobalt blue and white, paneled export chargers got their European name "Kraak" from Portuguese carrack treasure ships captured at sea by the Dutch East India Company—igniting Dutch Delftware mania and Golden Age still-life painting.',
          storyZh: '约1600年烧造于江西景德镇，因荷兰东印度公司截获满载青花瓷的葡萄牙“克拉克（Carrack）”大帆船而轰动阿姆斯特丹并得名“克拉克瓷”，直接催生了荷兰代尔夫特蓝陶与黄金时代静物画风潮。'
        },
        {
          museumId: 'rijks', countryEn: 'Japan', sprite: 10,
          siteEn: 'Deshima Island, Nagasaki Harbor', siteZh: '日本长崎港·出岛贸易馆',
          siteLon: 129.873, siteLat: 32.743,
          storyEn: 'During Tokugawa Japan’s two centuries of maritime seclusion, tiny fan-shaped Deshima in Nagasaki Bay was Europe’s sole window onto Japanese craft; Kyoto master lacquerers coated this camphorwood coffer in sprinkled gold maki-e landscapes for royal European cabinets, now in Amsterdam’s Rijksmuseum.',
          storyZh: '江户锁国时代，长崎湾人工扇形小岛“出岛”是日本连通欧洲的唯一贸易窗口。京都莳绘名匠以金银粉层层晕染山水楼阁制成此黑漆饰箱，经海路运抵荷兰王室珍奇屋，现藏阿姆斯特丹国立博物馆。'
        },
        {
          museumId: 'bm', countryEn: 'Japan', sprite: 7,
          siteEn: 'Edo (Tokyo), Japan', siteZh: '日本江户（东京）·北斋画坊',
          siteLon: 139.767, siteLat: 35.681,
          storyEn: 'Printed around 1831 using imported Prussian blue synthetic pigment—itself a child of Eurasian trade—Hokusai’s Great Wave off Kanagawa exists today in sister early impressions across our archive in the British Museum, New York’s Met, and Amsterdam’s Rijksmuseum.',
          storyZh: '约1831年刊印于江户，葛饰北斋巧妙运用当时由荷兰商船输入的欧洲合成颜料“普鲁士蓝”印出惊涛骇浪。本档案库同时收录了大英博物馆、纽约大都会与阿姆斯特丹国立博物馆三馆珍藏的早印名品。'
        },
        {
          museumId: 'smithsonian', countryEn: 'United States of America', sprite: 20,
          siteEn: 'London → Detroit → Washington, D.C.', siteZh: '伦敦 → 底特律 → 华盛顿弗利尔馆',
          siteLon: -77.027, siteLat: 38.888,
          storyEn: 'Originally painted in London in 1876–1877 by American expatriate James McNeill Whistler to showcase shipowner Frederick Leyland’s Kangxi blue-and-white porcelain, the entire gilded Peacock Room was purchased by Charles Lang Freer in 1904, shipped to Detroit, and permanently installed on the National Mall.',
          storyZh: '1876–1877年旅英美国画家惠斯勒专为英国船王利兰陈列中国康熙青花瓷而彩绘整座《孔雀厅》。1904年弗利尔将其整体购下跨大西洋运回底特律，后永久复原于华盛顿史密森尼亚洲艺术博物馆。'
        },
        {
          museumId: 'rijks', countryEn: 'Indonesia', sprite: 2,
          siteEn: 'Cakranegara Palace, Lombok', siteZh: '印度尼西亚龙目岛·恰克拉内加拉王宫',
          siteLon: 116.124, siteLat: -8.583,
          storyEn: 'Seized from the royal treasury of Cakranegara during the 1894 Dutch military intervention on Lombok, this gold-and-diamond ceremonial kris stood in the Rijksmuseum for over a century; while landmark sister Lombok jewels were restituted to Indonesia in 2023, surviving pieces anchor transparent provenance displays in Amsterdam.',
          storyZh: '1894年荷军攻占印尼龙目岛恰克拉内加拉王宫时劫走大批黄金珠宝（史称“龙目岛宝藏”）。2023年荷兰政府已将同批核心龙目岛王室珍宝正式归还印尼，见证了当代跨国博物馆溯源与返还的新篇章。'
        },
        {
          museumId: 'bm', countryEn: 'Chile', sprite: 56,
          siteEn: 'Orongo Ceremonial Village, Rapa Nui', siteZh: '智利复活节岛（拉帕努伊）·奥龙戈祭祀村',
          siteLon: -109.442, siteLat: -27.188,
          storyEn: 'Carved from fine grey-black flow-lava basalt around AD 1000–1200 with sacred birdman petroglyphs on his back, Hoa Hakananai’a ("lost or stolen friend") was removed from Orongo by the crew of HMS Topaze in November 1868 and sailed 13,620 km around Cape Horn to London—the farthest journey in the entire archive.',
          storyZh: '雕凿于公元1000–1200年复活节岛火山玄武岩之上，背部刻有神圣“鸟人”祭仪浮雕，拉帕努伊语名意为“失落或被盗的朋友”。1868年由英国军舰“托帕兹号”自奥龙戈石屋运走，绕合恩角航行逾 13,620 公里抵达伦敦——是全库距故乡最遥远的国宝。'
        }
      ]
    }
  ];

  const I18N = {
    en: {
      brandPrimary: 'Artifacts Archive',
      navProvenance: '← 3D Globe',
      navStoriesCurrent: 'Curator Stories ✦',
      navCreationAge: 'Creation Age',
      navCatalog: 'Full Catalog (45k)',
      stEyebrow: 'GUIDED PROVENANCE & REUNION TOURS · 5 CURATORIAL JOURNEYS · 30 MASTERWORKS',
      stPageTitle: 'Curator Stories Across Time & Oceans',
      stPageSub: 'Choose a guided exhibition below, then scroll through its six chapters—or press Auto-Play Tour—as the 3D globe flies from archaeological homelands to holding museums and virtually reunites divided masterworks.',
      kpiStops: 'Masterwork Stops',
      kpiMuseums: 'World Museums',
      kpiTotalDist: 'Cumulative Distance',
      autoPlayBtn: 'Auto-Play Tour',
      pausePlayBtn: 'Pause Tour',
      audioListenBtn: '🔊 Audio Guide',
      audioStopBtn: '⏹ Stop Audio',
      dockAudioBtn: '🔊 Listen',
      dockAudioStopBtn: '⏹ Mute',
      reuniteBtn: '🏠 Fly All 6 Home',
      disperseBtn: '⇄ Show in Museums',
      prevStopBtn: '‹ Prev',
      nextStopBtn: 'Next ›',
      dockReuniteBtn: '🏠 Reunite Home',
      dockDisperseBtn: '⇄ Museum Pins',
      dockArcsBtn: 'All 6 Routes',
      openMainGlobeBtn: 'Open on Main 3D Globe ↗',
      stFooterNote: 'Curator Stories — 5 Guided Scrollytelling Journeys Across 10 World Museums.',
      footerBrand: 'Artifacts Archive',
      footerTopLink: 'Back to Top ↑',
      zoomBtn: '🔍 HD Zoom',
      focusStopBtn: '◎ Focus on Globe',
      officialBtn: 'Museum Record ↗',
      fromHomeSuffix: ' km from origin'
    },
    zh: {
      brandPrimary: '文物档案库',
      navProvenance: '← 3D 地球仪',
      navStoriesCurrent: '策展故事线 ✦',
      navCreationAge: '文明纪年',
      navCatalog: '全部名录 (4.5万)',
      stEyebrow: '沉浸式文物溯源与合璧导览 · 五大策展专题 · 30 件跨馆国宝',
      stPageTitle: '跨越山海的国宝流散与合璧故事线',
      stPageSub: '任选下方一条策展故事线，向下滚动阅读六大章节（或点击“自动巡礼”）：右侧 3D 地球仪将随章节自动飞越考古原址与现藏博物馆，并支持一键将分藏各国的同源国宝“飞回原址合璧”。',
      kpiStops: '精选国宝站点',
      kpiMuseums: '涉及世界名馆',
      kpiTotalDist: '累计流散球面航程',
      autoPlayBtn: '自动巡礼导览',
      pausePlayBtn: '暂停自动巡礼',
      audioListenBtn: '🔊 语音导览',
      audioStopBtn: '⏹ 停止朗读',
      dockAudioBtn: '🔊 听解说',
      dockAudioStopBtn: '⏹ 停止',
      reuniteBtn: '🏠 六宝一键回乡合璧',
      disperseBtn: '⇄ 显示现藏博物馆分布',
      prevStopBtn: '‹ 上一站',
      nextStopBtn: '下一站 ›',
      dockReuniteBtn: '🏠 同源合璧',
      dockDisperseBtn: '⇄ 现藏各馆',
      dockArcsBtn: '显示全线航迹',
      openMainGlobeBtn: '在主 3D 地球仪打开 ↗',
      stFooterNote: '策展故事线 — 全球十大世界博物馆五大跨馆溯源与合璧导览。',
      footerBrand: '文物档案库',
      footerTopLink: '返回顶部 ↑',
      zoomBtn: '🔍 超高清原图',
      focusStopBtn: '◎ 地球仪聚焦',
      officialBtn: '馆方档案 ↗',
      fromHomeSuffix: ' 公里（距原址）'
    }
  };

  const state = {
    lang: 'en',
    storyIndex: 0,
    stopIndex: 0,
    autoPlaying: false,
    autoTimer: 0,
    audioPlaying: false,
    speechGen: 0,
    reunitedHome: false,
    flightPos: 0, // 0 = at holding museum, 1 = reunited at archaeological origin!
    flightFrom: 0,
    flightStartMs: 0,
    targetFlightPos: 0,
    showAllArcs: true,
    polyMap: new Map(),
    borderArcs3D: [],
    landDots3D: [],
    rotLon: -40 * DEG2RAD,
    rotLat: 28 * DEG2RAD,
    zoom: 1.08,
    targetRotLon: -40 * DEG2RAD,
    targetRotLat: 28 * DEG2RAD,
    targetZoom: 1.08,
    isDragging: false,
    hasDragged: false,
    dragStartX: 0,
    dragStartY: 0,
    hoveredStopIdx: -1,
    lightboxStopIdx: -1,
    pulsePhase: 0,
    suppressObserverUntil: 0
  };

  const atlasCache = {};
  const visibleHitTargets = [];

  function t(key) {
    const dict = I18N[state.lang] || I18N.en;
    return dict[key] !== undefined ? dict[key] : (I18N.en[key] || key);
  }

  function fmtNum(n) {
    return Math.round(n || 0).toLocaleString(state.lang === 'zh' ? 'zh-CN' : 'en-US');
  }

  function lonLatToVec3(lon, lat) {
    const phi = lat * DEG2RAD;
    const lam = lon * DEG2RAD;
    const cosPhi = Math.cos(phi);
    return [cosPhi * Math.sin(lam), Math.sin(phi), cosPhi * Math.cos(lam)];
  }

  function rotateVec(vx, vy, vz, cosLon, sinLon, cosLat, sinLat) {
    const x1 = vx * cosLon + vz * sinLon;
    const z1 = -vx * sinLon + vz * cosLon;
    const y2 = vy * cosLat - z1 * sinLat;
    const z2 = vy * sinLat + z1 * cosLat;
    return [x1, y2, z2];
  }

  function haversineKm(lon1, lat1, lon2, lat2) {
    const p1 = lat1 * DEG2RAD;
    const p2 = lat2 * DEG2RAD;
    const dp = (lat2 - lat1) * DEG2RAD;
    const dl = (lon2 - lon1) * DEG2RAD;
    const a = Math.sin(dp * 0.5) * Math.sin(dp * 0.5) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl * 0.5) * Math.sin(dl * 0.5);
    return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  }

  function slerpVec3(a, b, u) {
    let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    dot = Math.max(-1, Math.min(1, dot));
    const omega = Math.acos(dot);
    if (omega < 1e-4) {
      return [
        a[0] + (b[0] - a[0]) * u,
        a[1] + (b[1] - a[1]) * u,
        a[2] + (b[2] - a[2]) * u
      ];
    }
    const sinOm = Math.sin(omega);
    const wA = Math.sin((1 - u) * omega) / sinOm;
    const wB = Math.sin(u * omega) / sinOm;
    return [a[0] * wA + b[0] * wB, a[1] * wA + b[1] * wB, a[2] * wA + b[2] * wB];
  }

  function vec3ToLonLat(v) {
    const len = Math.hypot(v[0], v[1], v[2]) || 1;
    const nx = v[0] / len, ny = v[1] / len, nz = v[2] / len;
    const lat = Math.asin(Math.max(-1, Math.min(1, ny))) / DEG2RAD;
    const lon = Math.atan2(nx, nz) / DEG2RAD;
    return [lon, lat];
  }

  function isStandaloneBundle() {
    const p = window.location.pathname || '';
    return p.includes('artifacts-stories') || p.includes('standalone-stories') || p.includes('/www/');
  }

  function pageHref(kind) {
    const x20 = isStandaloneBundle();
    if (kind === 'prov') return x20 ? './artifacts-archive.html' : './index.html';
    if (kind === 'age') return x20 ? './artifacts-creation-age.html' : './creation-age.html';
    if (kind === 'cat') return x20 ? './artifacts-catalog.html' : './catalog.html';
    return './stories.html';
  }

  function buildArtifactObjUrl(stop) {
    const m = MUSEUMS[stop.museumId] || MUSEUMS.bm;
    const allowed = m.urls.allowedOriginPrefix;
    const raw = stop.art.objUrl || stop.art.bmUrl || '';
    if (raw && raw.startsWith(allowed)) return raw;
    const spUrl = m.spriteObjectUrls && m.spriteObjectUrls[stop.sprite];
    if (typeof spUrl === 'string' && spUrl.startsWith(allowed)) return spUrl;
    const place = BM_PLACE_NAMES[stop.countryEn] || stop.countryEn;
    const cand = m.urls.searchPrefix + encodeURIComponent(place) + m.urls.searchSuffix;
    return cand.startsWith(allowed) ? cand : m.urls.collectionHome;
  }

  function buildMainGlobeLink(stop) {
    const parts = [];
    if (stop.museumId !== 'bm') parts.push('museum=' + encodeURIComponent(stop.museumId));
    if (state.lang === 'zh') parts.push('lang=zh');
    parts.push('country=' + encodeURIComponent(stop.countryEn));
    if (typeof stop.museumLocalId === 'number') parts.push('id=' + String(stop.museumLocalId));
    return pageHref('prov') + '#' + parts.join('&');
  }

  // Hydrate all 5 stories against exact records in MUSEUMS
  function hydrateStories() {
    for (let s = 0; s < STORIES.length; s++) {
      const story = STORIES[s];
      const musSet = new Set();
      let totalKm = 0;

      for (let i = 0; i < story.stops.length; i++) {
        const st = story.stops[i];
        const m = MUSEUMS[st.museumId];
        musSet.add(st.museumId);

        // Compute exact museumLocalId matching app.js countriesSpec order
        let localOffset = 0;
        let matchedArt = null;
        for (let r = 0; r < m.countriesSpec.length; r++) {
          const cEn = m.countriesSpec[r][0];
          const cCnt = m.countriesSpec[r][2];
          if (cEn === st.countryEn) {
            const fList = (m.featuredByCountry && m.featuredByCountry[cEn]) || [];
            const fIdx = fList.findIndex(f => f.sprite === st.sprite);
            if (fIdx >= 0) {
              matchedArt = fList[fIdx];
              st.museumLocalId = localOffset + fIdx;
            }
            break;
          }
          localOffset += cCnt;
        }

        if (!matchedArt) {
          const fList = (m.featuredByCountry && m.featuredByCountry[st.countryEn]) || [];
          matchedArt = fList[0] || { en: st.siteEn, zh: st.siteZh, date: '', acq: m.acqStart, mat: '', matZh: '', reg: '' };
        }
        st.art = matchedArt;
        st.hostLon = m.hostLon;
        st.hostLat = m.hostLat;
        st.originVec = lonLatToVec3(st.siteLon, st.siteLat);
        // Tiny deterministic angular offset when 2 stops share one museum so pins don't stack identically
        const jLon = m.hostLon + ((i % 3) - 1) * 0.45;
        const jLat = m.hostLat + (((i >> 1) % 3) - 1) * 0.35;
        st.museumVec = lonLatToVec3(jLon, jLat);
        st.distKm = Math.round(haversineKm(st.siteLon, st.siteLat, m.hostLon, m.hostLat));
        totalKm += st.distKm;

        const rawReg = matchedArt.reg || '';
        st.fullReg = rawReg
          ? ((rawReg.startsWith(m.regPrefix + ' ') || rawReg.startsWith(m.regPrefix + '.')) ? rawReg : (m.regPrefix + ' ' + rawReg))
          : m.regPrefix;
      }

      story.museumCount = musSet.size;
      story.totalKm = totalKm;
    }
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
    if (atlasCache[m.id] && atlasCache[m.id].loaded) return Promise.resolve(atlasCache[m.id]);
    if (atlasCache[m.id] && atlasCache[m.id].promise) return atlasCache[m.id].promise;

    const gCanvas = document.createElement('canvas');
    gCanvas.width = m.atlasCols * GLOBE_MIP_SIZE;
    gCanvas.height = m.atlasRows * GLOBE_MIP_SIZE;
    const gCtx = gCanvas.getContext('2d');
    gCtx.fillStyle = '#231e19';
    gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);

    const entry = {
      id: m.id,
      cols: m.atlasCols,
      rows: m.atlasRows,
      tileSize: m.tileSize,
      spriteAtlas: null,
      globeSpriteAtlas: gCanvas,
      loaded: false,
      promise: null
    };

    entry.promise = new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        entry.spriteAtlas = img;
        gCtx.imageSmoothingEnabled = true;
        gCtx.imageSmoothingQuality = 'high';
        gCtx.drawImage(img, 0, 0, gCanvas.width, gCanvas.height);
        entry.loaded = true;
        repaintVisiblePlates(m.id);
        resolve(entry);
      };
      img.onerror = () => {
        entry.loaded = true;
        resolve(entry);
      };
      img.src = m.atlasUri;
    });

    atlasCache[m.id] = entry;
    return entry.promise;
  }

  function drawPlateOnCanvas(cnv, museumId, spriteIdx) {
    if (!cnv) return;
    cnv.dataset.museumId = museumId;
    cnv.dataset.sprite = String(spriteIdx);
    const entry = atlasCache[museumId];
    if (!entry || !entry.loaded || !entry.spriteAtlas) {
      loadMuseumAtlas(museumId);
      const ctx = cnv.getContext('2d');
      ctx.fillStyle = '#241f19';
      ctx.fillRect(0, 0, cnv.width, cnv.height);
      return;
    }
    const ctx = cnv.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const ts = entry.tileSize;
    const sx = (spriteIdx % entry.cols) * ts;
    const sy = Math.floor(spriteIdx / entry.cols) * ts;
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.drawImage(entry.spriteAtlas, sx, sy, ts, ts, 0, 0, cnv.width, cnv.height);
  }

  function repaintVisiblePlates(museumId) {
    const list = document.querySelectorAll('canvas[data-museum-id="' + museumId + '"]');
    for (let i = 0; i < list.length; i++) {
      drawPlateOnCanvas(list[i], museumId, parseInt(list[i].dataset.sprite || '0', 10));
    }
  }

  // DOM Elements
  const elStoryTabs = document.getElementById('st-story-tabs');
  const elStoryKicker = document.getElementById('st-story-kicker');
  const elStoryHeading = document.getElementById('st-story-heading');
  const elStoryThesis = document.getElementById('st-story-thesis');
  const elKpiStops = document.getElementById('st-kpi-stops');
  const elKpiMuseums = document.getElementById('st-kpi-museums');
  const elKpiDistance = document.getElementById('st-kpi-distance');
  const elPrologueAutoplay = document.getElementById('st-prologue-autoplay');
  const elProloguePlayIcon = document.getElementById('st-prologue-play-icon');
  const elProloguePlayLbl = document.getElementById('st-prologue-play-lbl');
  const elPrologueAudio = document.getElementById('st-prologue-audio');
  const elPrologueAudioLbl = document.getElementById('st-prologue-audio-lbl');
  const elPrologueReunite = document.getElementById('st-prologue-reunite');
  const elPrologueReuniteLbl = document.getElementById('st-prologue-reunite-lbl');
  const elChaptersList = document.getElementById('st-chapters-list');

  const elGlobeStage = document.getElementById('st-globe-stage');
  const elGlobeCanvas = document.getElementById('st-globe-canvas');
  const gCtx = elGlobeCanvas.getContext('2d');
  const elHudStep = document.getElementById('st-hud-step');
  const elHudTitle = document.getElementById('st-hud-title');
  const elHudRoute = document.getElementById('st-hud-route');
  const elStepDots = document.getElementById('st-step-dots');
  const elBtnPrev = document.getElementById('st-btn-prev');
  const elBtnPlay = document.getElementById('st-btn-play');
  const elDockPlayLbl = document.getElementById('st-dock-play-lbl');
  const elBtnAudio = document.getElementById('st-btn-audio');
  const elBtnReunite = document.getElementById('st-btn-reunite');
  const elBtnArcs = document.getElementById('st-btn-arcs');
  const elBtnNext = document.getElementById('st-btn-next');
  const elTooltip = document.getElementById('st-tooltip');

  // Lightbox DOM
  const elLightbox = document.getElementById('st-lightbox');
  const elLbClose = document.getElementById('st-lb-close');
  const elLbPrev = document.getElementById('st-lb-prev');
  const elLbNext = document.getElementById('st-lb-next');
  const elLbCanvas = document.getElementById('st-lb-canvas');
  const elLbImg = document.getElementById('st-lb-img');
  const elLbKicker = document.getElementById('st-lb-kicker');
  const elLbTitle = document.getElementById('st-lb-title');
  const elLbDesc = document.getElementById('st-lb-desc');
  const elLbObjLink = document.getElementById('st-lb-obj-link');
  const elLbGlobeLink = document.getElementById('st-lb-globe-link');

  let chapterObserver = null;
  let vpW = 640, vpH = 600, dpr = 1;

  function curStory() {
    return STORIES[state.storyIndex] || STORIES[0];
  }

  function curStop() {
    const st = curStory();
    return st.stops[state.stopIndex] || st.stops[0];
  }

  function resizeGlobe() {
    const r = elGlobeStage.getBoundingClientRect();
    vpW = Math.max(260, r.width);
    vpH = Math.max(260, r.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    elGlobeCanvas.width = Math.round(vpW * dpr);
    elGlobeCanvas.height = Math.round(vpH * dpr);
  }

  function focusCameraOnStop(stop) {
    if (!stop) return;
    if (state.reunitedHome) {
      state.targetRotLon = -stop.siteLon * DEG2RAD;
      state.targetRotLat = Math.max(-1.18, Math.min(1.18, stop.siteLat * DEG2RAD));
      state.targetZoom = 1.24;
      return;
    }
    // Aim midway along the great-circle arc (weighted 62% toward archaeological homeland)
    const midVec = slerpVec3(stop.museumVec, stop.originVec, 0.58);
    const [mLon, mLat] = vec3ToLonLat(midVec);
    state.targetRotLon = -mLon * DEG2RAD;
    state.targetRotLat = Math.max(-1.15, Math.min(1.15, mLat * DEG2RAD));
    state.targetZoom = stop.distKm > 8500 ? 0.96 : (stop.distKm > 4500 ? 1.06 : 1.18);
  }

  const SPEECH_SUPPORTED = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance === 'function';

  function stopAudioGuide(keepFlag) {
    state.speechGen++;
    if (!keepFlag) state.audioPlaying = false;
    if (SPEECH_SUPPORTED) {
      try { window.speechSynthesis.cancel(); } catch (_) {}
    }
    syncPlayAndReuniteButtons();
  }

  function speakCurrentStop() {
    if (!SPEECH_SUPPORTED || !state.audioPlaying) return;
    const myGen = ++state.speechGen;
    try { window.speechSynthesis.cancel(); } catch (_) {}
    const story = curStory();
    const stop = curStop();
    const m = MUSEUMS[stop.museumId] || MUSEUMS.bm;
    const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
    const text = state.lang === 'zh'
      ? ('第' + (state.stopIndex + 1) + '站，' + stop.art.zh + '。原属' + stop.siteZh + '，现藏于' + mc.shortName + '，距原址' + fmtNum(stop.distKm) + '公里。' + stop.storyZh)
      : ('Stop ' + (state.stopIndex + 1) + ': ' + stop.art.en + '. Originating from ' + stop.siteEn + ', held today at ' + mc.shortName + ', ' + fmtNum(stop.distKm) + ' kilometers from home. ' + stop.storyEn);
    const utt = new window.SpeechSynthesisUtterance(text);
    utt.lang = state.lang === 'zh' ? 'zh-CN' : 'en-US';
    utt.rate = state.lang === 'zh' ? 1.02 : 0.98;
    try {
      const voices = window.speechSynthesis.getVoices() || [];
      const prefix = state.lang === 'zh' ? 'zh' : 'en';
      const match = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
      if (match) utt.voice = match;
    } catch (_) {}
    utt.onend = () => {
      if (myGen !== state.speechGen || !state.audioPlaying) return;
      if (state.stopIndex < story.stops.length - 1) {
        selectStop(state.stopIndex + 1, true);
        speakCurrentStop();
      } else {
        stopAudioGuide(false);
      }
    };
    utt.onerror = () => {
      if (myGen === state.speechGen) stopAudioGuide(false);
    };
    try {
      window.speechSynthesis.speak(utt);
    } catch (_) {
      stopAudioGuide(false);
    }
  }

  function toggleAudioGuide() {
    if (!SPEECH_SUPPORTED) return;
    if (state.audioPlaying) {
      stopAudioGuide(false);
    } else {
      state.autoPlaying = false;
      state.audioPlaying = true;
      syncPlayAndReuniteButtons();
      speakCurrentStop();
    }
  }

  function syncPlayAndReuniteButtons() {
    elProloguePlayIcon.textContent = state.autoPlaying ? '⏸' : '▶';
    elProloguePlayLbl.textContent = state.autoPlaying ? t('pausePlayBtn') : t('autoPlayBtn');
    elDockPlayLbl.textContent = (state.autoPlaying ? '⏸ ' : '▶ ') + (state.autoPlaying ? t('pausePlayBtn') : t('autoPlayBtn'));

    if (elPrologueAudio && elPrologueAudioLbl) {
      elPrologueAudio.classList.toggle('is-hidden', !SPEECH_SUPPORTED);
      elPrologueAudioLbl.textContent = state.audioPlaying ? t('audioStopBtn') : t('audioListenBtn');
    }
    if (elBtnAudio) {
      elBtnAudio.classList.toggle('is-hidden', !SPEECH_SUPPORTED);
      elBtnAudio.textContent = state.audioPlaying ? t('dockAudioStopBtn') : t('dockAudioBtn');
      elBtnAudio.classList.toggle('active', state.audioPlaying);
    }

    elPrologueReuniteLbl.textContent = state.reunitedHome ? t('disperseBtn') : t('reuniteBtn');
    elBtnReunite.textContent = state.reunitedHome ? t('dockDisperseBtn') : t('dockReuniteBtn');
    elBtnReunite.classList.toggle('active', state.reunitedHome);
    elBtnArcs.classList.toggle('active', state.showAllArcs);
  }

  function updateHudAndActiveCard() {
    const story = curStory();
    const stop = curStop();
    const mCity = (MUSEUM_CITIES[stop.museumId] || ['London, UK', '英国·伦敦'])[state.lang === 'zh' ? 1 : 0];
    const m = MUSEUMS[stop.museumId];
    const mc = (m.copy && m.copy[state.lang]) || m.copy.en;

    elHudStep.textContent = (state.lang === 'zh' ? '第 ' : 'STOP ') +
      String(state.stopIndex + 1).padStart(2, '0') + ' / ' + String(story.stops.length).padStart(2, '0') +
      (state.lang === 'zh' ? ' 站' : '');
    elHudTitle.textContent = state.lang === 'zh' ? stop.art.zh : stop.art.en;
    if (state.reunitedHome) {
      elHudRoute.textContent = state.lang === 'zh'
        ? ('🏠 已飞返原址合璧：' + stop.siteZh + '  ←  ' + mc.shortName + '（' + fmtNum(stop.distKm) + ' km）')
        : ('🏠 Reunited at Origin: ' + stop.siteEn + '  ←  ' + mc.shortName + ' (' + fmtNum(stop.distKm) + ' km)');
    } else {
      elHudRoute.textContent = (state.lang === 'zh' ? stop.siteZh : stop.siteEn) + '  →  ' +
        mc.shortName + ' (' + mCity + ')  ·  ' + fmtNum(stop.distKm) + ' km';
    }

    const cards = elChaptersList.querySelectorAll('.st-chapter-card');
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.toggle('active', i === state.stopIndex);
    }
    const dots = elStepDots.querySelectorAll('.st-dot-btn');
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle('active', i === state.stopIndex);
    }

    syncUrlHash();
  }

  function selectStop(idx, scrollCardIntoView) {
    const story = curStory();
    const clamped = ((idx % story.stops.length) + story.stops.length) % story.stops.length;
    state.stopIndex = clamped;
    updateHudAndActiveCard();
    focusCameraOnStop(story.stops[clamped]);

    if (scrollCardIntoView) {
      state.suppressObserverUntil = performance.now() + 900;
      const cards = elChaptersList.querySelectorAll('.st-chapter-card');
      if (cards[clamped]) {
        cards[clamped].scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'center' });
      }
    }
  }

  function selectStory(sIdx, initialStopIdx, scrollToScrolly) {
    state.storyIndex = Math.max(0, Math.min(STORIES.length - 1, sIdx));
    state.stopIndex = Math.max(0, Math.min(curStory().stops.length - 1, initialStopIdx || 0));
    state.reunitedHome = false;
    state.flightPos = 0;
    state.flightFrom = 0;
    state.flightStartMs = 0;
    state.targetFlightPos = 0;
    state.autoTimer = 0;

    // Preload atlases for all museums in this story
    const st = curStory();
    for (let i = 0; i < st.stops.length; i++) {
      loadMuseumAtlas(st.stops[i].museumId);
    }

    renderStoryTabs();
    renderStoryPrologueAndChapters();
    syncPlayAndReuniteButtons();
    updateHudAndActiveCard();
    focusCameraOnStop(curStop());

    if (scrollToScrolly) {
      state.suppressObserverUntil = performance.now() + 900;
      document.getElementById('st-scrolly-section').scrollIntoView({ behavior: navigator.webdriver ? 'instant' : 'smooth', block: 'start' });
    }
  }

  function renderStoryTabs() {
    elStoryTabs.replaceChildren();
    const frag = document.createDocumentFragment();
    for (let i = 0; i < STORIES.length; i++) {
      const st = STORIES[i];
      const isAct = i === state.storyIndex;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'st-story-tab' + (isAct ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(isAct));

      const num = document.createElement('span');
      num.className = 'st-tab-num';
      num.textContent = st.num;

      const ttl = document.createElement('span');
      ttl.className = 'st-tab-title';
      ttl.textContent = state.lang === 'zh' ? st.tabTitleZh : st.tabTitleEn;

      const meta = document.createElement('span');
      meta.className = 'st-tab-meta';
      meta.textContent = state.lang === 'zh'
        ? ('6 件国宝 · ' + st.museumCount + ' 馆 · ' + fmtNum(st.totalKm) + ' km')
        : ('6 stops · ' + st.museumCount + ' museums · ' + fmtNum(st.totalKm) + ' km');

      btn.appendChild(num);
      btn.appendChild(ttl);
      btn.appendChild(meta);
      btn.addEventListener('click', () => {
        state.autoPlaying = false;
        stopAudioGuide(false);
        selectStory(i, 0, true);
      });
      frag.appendChild(btn);
    }
    elStoryTabs.appendChild(frag);
  }

  function renderStoryPrologueAndChapters() {
    const story = curStory();
    elStoryKicker.textContent = story.num + ' · ' + (state.lang === 'zh' ? '跨馆文物溯源故事线' : 'CURATED CROSS-MUSEUM JOURNEY');
    elStoryHeading.textContent = state.lang === 'zh' ? story.headingZh : story.headingEn;
    elStoryThesis.textContent = state.lang === 'zh' ? story.thesisZh : story.thesisEn;
    elKpiStops.textContent = fmtNum(story.stops.length);
    elKpiMuseums.textContent = fmtNum(story.museumCount);
    elKpiDistance.textContent = fmtNum(story.totalKm) + ' km';

    if (chapterObserver) {
      chapterObserver.disconnect();
    }

    elChaptersList.replaceChildren();
    elStepDots.replaceChildren();

    const frag = document.createDocumentFragment();
    const dotsFrag = document.createDocumentFragment();

    for (let i = 0; i < story.stops.length; i++) {
      const stop = story.stops[i];
      const m = MUSEUMS[stop.museumId];
      const mc = (m.copy && m.copy[state.lang]) || m.copy.en;
      const cityStr = (MUSEUM_CITIES[stop.museumId] || ['London, UK', '英国·伦敦'])[state.lang === 'zh' ? 1 : 0];

      // Step Dot
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'st-dot-btn' + (i === state.stopIndex ? ' active' : '');
      dot.textContent = String(i + 1);
      dot.setAttribute('aria-label', state.lang === 'zh' ? ('第 ' + (i + 1) + ' 站') : ('Stop ' + (i + 1)));
      dot.addEventListener('click', () => {
        state.autoPlaying = false;
        syncPlayAndReuniteButtons();
        selectStop(i, true);
      });
      dotsFrag.appendChild(dot);

      // Chapter Card
      const card = document.createElement('article');
      card.className = 'st-chapter-card' + (i === state.stopIndex ? ' active' : '');
      card.dataset.stopIdx = String(i);
      card.addEventListener('click', (ev) => {
        if (ev.target.closest('button') || ev.target.closest('a')) return;
        state.autoPlaying = false;
        syncPlayAndReuniteButtons();
        selectStop(i, false);
      });

      const topRow = document.createElement('div');
      topRow.className = 'st-chap-top';
      const stepPill = document.createElement('span');
      stepPill.className = 'st-chap-step-pill';
      const dateStr = state.lang === 'zh'
        ? String(stop.art.date || '').replace(/(\d+)\s*BC/gi, '公元前$1年').replace(/\bAD\s*(\d+)/gi, '公元$1年')
        : String(stop.art.date || '');
      stepPill.textContent = state.lang === 'zh'
        ? ('第 0' + (i + 1) + ' 站 · ' + dateStr + ' · ' + stop.art.acq + '年入藏')
        : ('STOP 0' + (i + 1) + ' · ' + dateStr + ' · Acq. ' + stop.art.acq);
      const distPill = document.createElement('span');
      distPill.className = 'st-chap-dist-pill';
      distPill.textContent = stop.distKm > 20
        ? (fmtNum(stop.distKm) + t('fromHomeSuffix'))
        : (state.lang === 'zh' ? '本馆所在国珍藏' : 'Domestic Host Treasure');
      topRow.appendChild(stepPill);
      topRow.appendChild(distPill);

      const mediaRow = document.createElement('div');
      mediaRow.className = 'st-chap-media-row';

      const plateBtn = document.createElement('button');
      plateBtn.type = 'button';
      plateBtn.className = 'st-chap-plate-btn';
      plateBtn.setAttribute('aria-label', stop.art.en);
      const cvs = document.createElement('canvas');
      cvs.width = 296;
      cvs.height = 296;
      drawPlateOnCanvas(cvs, stop.museumId, stop.sprite);
      plateBtn.appendChild(cvs);
      plateBtn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        openLightbox(i);
      });

      const metaCol = document.createElement('div');
      const h3 = document.createElement('h3');
      h3.className = 'st-chap-title';
      h3.textContent = state.lang === 'zh' ? stop.art.zh : stop.art.en;

      const sub = document.createElement('div');
      sub.className = 'st-chap-subtitle';
      sub.textContent = state.lang === 'zh' ? stop.art.en : stop.art.zh;

      const routeBox = document.createElement('div');
      routeBox.className = 'st-chap-route-box';
      routeBox.textContent = (state.lang === 'zh'
        ? ('考古原址：' + stop.siteZh + '  →  现藏：' + mc.shortName + '（' + cityStr + '） · 馆藏号 ' + stop.fullReg)
        : ('Origin: ' + stop.siteEn + '  →  Held at: ' + mc.shortName + ' (' + cityStr + ') · Inv. ' + stop.fullReg));

      metaCol.appendChild(h3);
      metaCol.appendChild(sub);
      metaCol.appendChild(routeBox);

      mediaRow.appendChild(plateBtn);
      mediaRow.appendChild(metaCol);

      const narr = document.createElement('p');
      narr.className = 'st-chap-narrative';
      narr.textContent = state.lang === 'zh' ? stop.storyZh : stop.storyEn;

      const acts = document.createElement('div');
      acts.className = 'st-chap-actions';

      const focusBtn = document.createElement('button');
      focusBtn.type = 'button';
      focusBtn.className = 'st-act-pill';
      focusBtn.textContent = t('focusStopBtn');
      focusBtn.addEventListener('click', () => {
        state.autoPlaying = false;
        syncPlayAndReuniteButtons();
        selectStop(i, false);
      });

      const zoomBtn = document.createElement('button');
      zoomBtn.type = 'button';
      zoomBtn.className = 'st-act-pill';
      zoomBtn.textContent = t('zoomBtn');
      zoomBtn.addEventListener('click', () => openLightbox(i));

      const mainGlobeLink = document.createElement('a');
      mainGlobeLink.className = 'st-act-pill';
      mainGlobeLink.href = buildMainGlobeLink(stop);
      mainGlobeLink.textContent = t('openMainGlobeBtn');

      const extLink = document.createElement('a');
      extLink.className = 'st-act-pill';
      extLink.href = buildArtifactObjUrl(stop);
      extLink.target = '_blank';
      extLink.rel = 'noopener noreferrer';
      extLink.textContent = t('officialBtn');

      acts.appendChild(focusBtn);
      acts.appendChild(zoomBtn);
      acts.appendChild(mainGlobeLink);
      acts.appendChild(extLink);

      card.appendChild(topRow);
      card.appendChild(mediaRow);
      card.appendChild(narr);
      card.appendChild(acts);
      frag.appendChild(card);
    }

    elChaptersList.appendChild(frag);
    elStepDots.appendChild(dotsFrag);

    if (typeof IntersectionObserver === 'function') {
      chapterObserver = new IntersectionObserver((entries) => {
        if (performance.now() < state.suppressObserverUntil || state.autoPlaying) return;
        let bestIdx = -1;
        let bestRatio = 0;
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting && entries[i].intersectionRatio > bestRatio) {
            bestRatio = entries[i].intersectionRatio;
            bestIdx = parseInt(entries[i].target.dataset.stopIdx || '-1', 10);
          }
        }
        if (bestIdx >= 0 && bestIdx !== state.stopIndex) {
          selectStop(bestIdx, false);
        }
      }, { rootMargin: '-28% 0px -38% 0px', threshold: [0.25, 0.55, 0.8] });

      const cards = elChaptersList.querySelectorAll('.st-chapter-card');
      for (let i = 0; i < cards.length; i++) chapterObserver.observe(cards[i]);
    }
  }

  function openLightbox(stopIdx) {
    const story = curStory();
    const clamped = ((stopIdx % story.stops.length) + story.stops.length) % story.stops.length;
    state.lightboxStopIdx = clamped;
    const stop = story.stops[clamped];
    const m = MUSEUMS[stop.museumId] || MUSEUMS.bm;
    const mc = (m.copy && m.copy[state.lang]) || m.copy.en;

    drawPlateOnCanvas(elLbCanvas, stop.museumId, stop.sprite);
    elLbImg.onload = null;
    elLbImg.onerror = null;
    elLbImg.classList.remove('loaded');
    elLbImg.removeAttribute('src');
    const hdUrl = m.hdPhotoUrls && m.hdPhotoUrls[stop.sprite];
    if (hdUrl && !navigator.webdriver && hdUrl.startsWith('https://')) {
      elLbImg.onload = () => {
        if (state.lightboxStopIdx === clamped) elLbImg.classList.add('loaded');
      };
      elLbImg.onerror = () => elLbImg.classList.remove('loaded');
      elLbImg.src = hdUrl;
    }

    elLbKicker.textContent = stop.fullReg + ' · ' + (state.lang === 'zh' ? stop.siteZh : stop.siteEn) +
      ' → ' + mc.shortName + ' · ' + fmtNum(stop.distKm) + ' km';
    elLbTitle.textContent = state.lang === 'zh' ? stop.art.zh : stop.art.en;
    elLbDesc.textContent = state.lang === 'zh' ? stop.storyZh : stop.storyEn;
    elLbObjLink.href = buildArtifactObjUrl(stop);
    elLbObjLink.textContent = mc.openOfficialBtn;
    elLbGlobeLink.href = buildMainGlobeLink(stop);
    elLightbox.classList.add('open');
  }

  // 60 FPS 3D Story Globe Renderer (pauses automatically when scrolled off-screen or tab hidden)
  let lastFrameTs = performance.now();
  let globeInViewport = true;
  let rafPending = false;
  function ensureStoryRaf() {
    if (!rafPending && globeInViewport && !document.hidden) {
      rafPending = true;
      lastFrameTs = performance.now();
      requestAnimationFrame(renderGlobeFrame);
    }
  }
  function renderGlobeFrame(now) {
    rafPending = false;
    if (!globeInViewport || document.hidden) return;
    const rawElapsed = Math.max(0.001, (now - lastFrameTs) / 1000);
    const dt = Math.min(0.05, rawElapsed);
    const camDt = Math.min(0.42, rawElapsed);
    lastFrameTs = now;
    state.pulsePhase = (state.pulsePhase + dt * 0.42) % 1;

    if (state.autoPlaying) {
      state.autoTimer += rawElapsed;
      if (state.autoTimer >= 5.2) {
        state.autoTimer = 0;
        selectStop(state.stopIndex + 1, true);
      }
    }

    const lerp = 1 - Math.pow(0.0008, camDt);
    state.rotLon += (state.targetRotLon - state.rotLon) * lerp;
    state.rotLat += (state.targetRotLat - state.rotLat) * lerp;
    state.zoom += (state.targetZoom - state.zoom) * lerp;

    state.targetFlightPos = state.reunitedHome ? 1 : 0;
    if (state.flightStartMs > 0) {
      const prog = Math.min(1, Math.max(0, (now - state.flightStartMs) / 1250));
      state.flightPos = state.flightFrom + (state.targetFlightPos - state.flightFrom) * prog;
      if (prog >= 1) state.flightStartMs = 0;
    } else {
      state.flightPos = state.targetFlightPos;
    }

    gCtx.save();
    gCtx.scale(dpr, dpr);
    gCtx.clearRect(0, 0, vpW, vpH);

    const cx = vpW * 0.50;
    const cy = vpH * 0.52;
    const baseR = Math.min(vpW, vpH) * 0.37 * state.zoom;
    const cosLon = Math.cos(state.rotLon), sinLon = Math.sin(state.rotLon);
    const cosLat = Math.cos(state.rotLat), sinLat = Math.sin(state.rotLat);

    // Subtle sunlit vellum aurora
    const aur = gCtx.createRadialGradient(cx + baseR * 0.12, cy - baseR * 0.04, baseR * 0.88, cx + baseR * 0.06, cy, baseR * 1.15);
    aur.addColorStop(0, 'rgba(235, 215, 175, 0)');
    aur.addColorStop(0.48, 'rgba(212, 168, 92, 0.22)');
    aur.addColorStop(0.76, 'rgba(124, 188, 172, 0.15)');
    aur.addColorStop(1, 'rgba(245, 236, 220, 0)');
    gCtx.fillStyle = aur;
    gCtx.beginPath();
    gCtx.arc(cx, cy, baseR * 1.15, 0, Math.PI * 2);
    gCtx.fill();

    // Globe sphere
    gCtx.save();
    gCtx.shadowColor = 'rgba(92, 68, 34, 0.17)';
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

    // Clipped land dots & borders
    gCtx.save();
    gCtx.beginPath();
    gCtx.arc(cx, cy, baseR, 0, Math.PI * 2);
    gCtx.clip();

    gCtx.fillStyle = 'rgba(166, 139, 100, 0.38)';
    const dotSz = Math.max(1.1, 1.4 * state.zoom);
    for (let i = 0; i < state.landDots3D.length; i++) {
      const d = state.landDots3D[i];
      const r = rotateVec(d[0], d[1], d[2], cosLon, sinLon, cosLat, sinLat);
      if (r[2] > 0.03) {
        gCtx.fillRect(cx + r[0] * baseR - dotSz * 0.5, cy - r[1] * baseR - dotSz * 0.5, dotSz, dotSz);
      }
    }

    gCtx.strokeStyle = 'rgba(155, 128, 89, 0.54)';
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

    const story = curStory();
    visibleHitTargets.length = 0;

    // 1. Great-circle provenance arcs for the story
    for (let i = 0; i < story.stops.length; i++) {
      const isAct = i === state.stopIndex;
      if (!state.showAllArcs && !isAct) continue;
      const st = story.stops[i];
      if (st.distKm < 25) continue;

      gCtx.save();
      gCtx.beginPath();
      const segs = 44;
      let pen = false;
      for (let k = 0; k <= segs; k++) {
        const u = k / segs;
        const p3 = slerpVec3(st.originVec, st.museumVec, u);
        const lift = 1 + Math.sin(u * Math.PI) * (isAct ? 0.16 : 0.10);
        const r = rotateVec(p3[0] * lift, p3[1] * lift, p3[2] * lift, cosLon, sinLon, cosLat, sinLat);
        if (r[2] > -0.08) {
          const sx = cx + r[0] * baseR;
          const sy = cy - r[1] * baseR;
          if (!pen) { gCtx.moveTo(sx, sy); pen = true; }
          else gCtx.lineTo(sx, sy);
        } else {
          pen = false;
        }
      }
      gCtx.strokeStyle = isAct ? 'rgba(196, 128, 30, 0.92)' : 'rgba(148, 108, 52, 0.36)';
      gCtx.lineWidth = isAct ? 2.4 : 1.25;
      if (!isAct) gCtx.setLineDash([4, 4]);
      gCtx.stroke();
      gCtx.restore();

      // Animated pulse bead along active arc
      if (isAct) {
        const uPulse = state.reunitedHome ? (1 - state.pulsePhase) : state.pulsePhase;
        const b3 = slerpVec3(st.originVec, st.museumVec, uPulse);
        const bLift = 1 + Math.sin(uPulse * Math.PI) * 0.16;
        const br = rotateVec(b3[0] * bLift, b3[1] * bLift, b3[2] * bLift, cosLon, sinLon, cosLat, sinLat);
        if (br[2] > -0.05) {
          const bx = cx + br[0] * baseR;
          const by = cy - br[1] * baseR;
          gCtx.fillStyle = '#ffdf88';
          gCtx.beginPath();
          gCtx.arc(bx, by, 4.5, 0, Math.PI * 2);
          gCtx.fill();
          gCtx.strokeStyle = '#8b5715';
          gCtx.lineWidth = 1.4;
          gCtx.stroke();
        }
      }
    }

    // 2. Archaeological Origin Beacons
    for (let i = 0; i < story.stops.length; i++) {
      const st = story.stops[i];
      const isAct = i === state.stopIndex;
      const r = rotateVec(st.originVec[0], st.originVec[1], st.originVec[2], cosLon, sinLon, cosLat, sinLat);
      if (r[2] < 0.02) continue;
      const sx = cx + r[0] * baseR;
      const sy = cy - r[1] * baseR;
      gCtx.fillStyle = isAct ? '#e29b27' : 'rgba(182, 128, 44, 0.72)';
      gCtx.beginPath();
      gCtx.arc(sx, sy, isAct ? 5.5 : 3.8, 0, Math.PI * 2);
      gCtx.fill();
      gCtx.strokeStyle = '#fff9ec';
      gCtx.lineWidth = 1.4;
      gCtx.stroke();
    }

    // 3. Standing HD Artifact Plate Cards (flying smoothly between museumVec and originVec!)
    const cardsToDraw = [];
    const easeT = state.flightPos < 0.5
      ? (2 * state.flightPos * state.flightPos)
      : (1 - Math.pow(-2 * state.flightPos + 2, 2) / 2);

    for (let i = 0; i < story.stops.length; i++) {
      const st = story.stops[i];
      const p3 = slerpVec3(st.museumVec, st.originVec, easeT);
      const lift = 1 + Math.sin(easeT * Math.PI) * 0.18;
      const r = rotateVec(p3[0] * lift, p3[1] * lift, p3[2] * lift, cosLon, sinLon, cosLat, sinLat);
      if (r[2] < -0.02) continue;
      // Fan co-located masterworks into a legible crown arc when reunited at their homeland
      const fanFactor = Math.max(0, (easeT - 0.35) / 0.65);
      const fanAngle = -Math.PI * 0.5 + (i - 2.5) * 0.44;
      const fanRadius = (i === state.stopIndex ? 0 : 44) * fanFactor;
      const spreadX = Math.cos(fanAngle) * fanRadius;
      const spreadY = Math.sin(fanAngle) * fanRadius * 0.62;
      cardsToDraw.push({
        idx: i,
        stop: st,
        sx: cx + r[0] * baseR + spreadX,
        sy: cy - r[1] * baseR + spreadY,
        rz: r[2]
      });
    }

    cardsToDraw.sort((a, b) => (a.idx === state.stopIndex ? 1 : (b.idx === state.stopIndex ? -1 : (a.rz - b.rz))));

    for (let i = 0; i < cardsToDraw.length; i++) {
      const c = cardsToDraw[i];
      const isAct = c.idx === state.stopIndex;
      const isHov = c.idx === state.hoveredStopIdx;
      const sz = (isAct ? 54 : 38) * (isHov ? 1.12 : 1.0);
      const dx = c.sx - sz * 0.5;
      const dy = c.sy - sz - 4;

      gCtx.fillStyle = 'rgba(38, 26, 12, 0.26)';
      gCtx.beginPath();
      gCtx.ellipse(c.sx, c.sy, sz * 0.36, sz * 0.12, 0, 0, Math.PI * 2);
      gCtx.fill();

      const atl = atlasCache[c.stop.museumId];
      if (atl && atl.loaded) {
        const sxA = (c.stop.sprite % atl.cols) * GLOBE_MIP_SIZE;
        const syA = Math.floor(c.stop.sprite / atl.cols) * GLOBE_MIP_SIZE;
        gCtx.drawImage(atl.globeSpriteAtlas, sxA, syA, GLOBE_MIP_SIZE, GLOBE_MIP_SIZE, dx, dy, sz, sz);
      } else {
        gCtx.fillStyle = '#2d2319';
        gCtx.fillRect(dx, dy, sz, sz);
      }

      gCtx.strokeStyle = isAct ? '#ffdc7d' : '#fff6e4';
      gCtx.lineWidth = isAct ? 2.6 : 1.4;
      gCtx.strokeRect(dx, dy, sz, sz);

      // Step number badge on corner of plate
      gCtx.fillStyle = isAct ? '#b67d24' : '#2d2115';
      gCtx.beginPath();
      gCtx.arc(dx + 8, dy + 8, 8.5, 0, Math.PI * 2);
      gCtx.fill();
      gCtx.fillStyle = '#fffaf0';
      gCtx.font = '700 10px "Google Sans Code", monospace';
      gCtx.textAlign = 'center';
      gCtx.textBaseline = 'middle';
      gCtx.fillText(String(c.idx + 1), dx + 8, dy + 8.5);

      visibleHitTargets.push({ idx: c.idx, x: c.sx, y: dy + sz * 0.5, r: sz * 0.62 });
    }

    // 4. Active Origin & Holding Museum Labels (collision-avoided)
    const actStop = curStop();
    const placedPills = [];
    const drawLabelPill = (vec, text, darkTheme) => {
      const r = rotateVec(vec[0], vec[1], vec[2], cosLon, sinLon, cosLat, sinLat);
      if (r[2] < 0.03) return;
      const anchorX = cx + r[0] * baseR;
      const anchorY = cy - r[1] * baseR;
      gCtx.font = '600 11px "Google Sans Flex", "Noto Sans SC", sans-serif';
      const tw = gCtx.measureText(text).width;
      const pw = tw + 16;
      const ph = 21;
      let px = Math.max(10, Math.min(vpW - pw - 44, anchorX - pw * 0.5));
      let py = anchorY + 10;
      for (let pass = 0; pass < 4; pass++) {
        let hit = false;
        for (let k = 0; k < placedPills.length; k++) {
          const o = placedPills[k];
          if (px < o.x + o.w + 4 && px + pw + 4 > o.x && py < o.y + o.h + 4 && py + ph + 4 > o.y) {
            py = o.y + o.h + 5;
            hit = true;
          }
        }
        if (!hit) break;
      }
      placedPills.push({ x: px, y: py, w: pw, h: ph });
      gCtx.fillStyle = darkTheme ? 'rgba(38, 27, 16, 0.90)' : 'rgba(252, 246, 233, 0.94)';
      gCtx.strokeStyle = darkTheme ? 'rgba(226, 178, 96, 0.72)' : 'rgba(168, 126, 58, 0.65)';
      gCtx.lineWidth = 1.1;
      gCtx.beginPath();
      gCtx.roundRect(px, py, pw, ph, 999);
      gCtx.fill();
      gCtx.stroke();
      gCtx.fillStyle = darkTheme ? '#fff8ea' : '#3a2915';
      gCtx.textAlign = 'left';
      gCtx.textBaseline = 'middle';
      gCtx.fillText(text, px + 8, py + ph * 0.52);
    };

    if (actStop) {
      drawLabelPill(actStop.originVec, '★ ' + (state.lang === 'zh' ? actStop.siteZh : actStop.siteEn), false);
      if (!state.reunitedHome) {
        const mPin = (MUSEUM_PIN_SHORT[actStop.museumId] || ['Museum', '博物馆'])[state.lang === 'zh' ? 1 : 0];
        drawLabelPill(actStop.museumVec, mPin, true);
      }
    }

    gCtx.restore();
    if (globeInViewport && !document.hidden) {
      rafPending = true;
      requestAnimationFrame(renderGlobeFrame);
    } else {
      rafPending = false;
    }
  }

  function applyTranslations() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
    document.title = state.lang === 'zh'
      ? '策展故事线 · 文物档案库 — 十大世界博物馆跨馆溯源与合璧导览'
      : 'Curator Stories · Artifacts Archive — Guided 3D Provenance & Reunion Tours';

    const nodes = document.querySelectorAll('[data-i18n]');
    for (let i = 0; i < nodes.length; i++) {
      const k = nodes[i].getAttribute('data-i18n');
      if (k) nodes[i].textContent = t(k);
    }

    const langBtns = document.querySelectorAll('.lang-btn[data-lang]');
    for (let i = 0; i < langBtns.length; i++) {
      const act = langBtns[i].getAttribute('data-lang') === state.lang;
      langBtns[i].classList.toggle('active', act);
      langBtns[i].setAttribute('aria-pressed', String(act));
    }

    const lHash = state.lang === 'zh' ? '#lang=zh' : '';
    elBtnPrev.setAttribute('aria-label', state.lang === 'zh' ? '上一站国宝' : 'Previous story stop');
    elBtnNext.setAttribute('aria-label', state.lang === 'zh' ? '下一站国宝' : 'Next story stop');
    document.getElementById('st-brand-back-link').href = pageHref('prov') + lHash;
    document.getElementById('st-nav-prov-link').href = pageHref('prov') + lHash;
    document.getElementById('st-footer-prov-link').href = pageHref('prov') + lHash;
    document.getElementById('st-nav-age-link').href = pageHref('age') + lHash;
    document.getElementById('st-footer-age-link').href = pageHref('age') + lHash;
    document.getElementById('st-nav-cat-link').href = pageHref('cat') + lHash;
    document.getElementById('st-footer-cat-link').href = pageHref('cat') + lHash;
  }

  function syncUrlHash() {
    if (!window.history || !window.history.replaceState) return;
    const parts = [];
    if (state.lang === 'zh') parts.push('lang=zh');
    parts.push('story=' + encodeURIComponent(curStory().id));
    if (state.stopIndex > 0) parts.push('stop=' + String(state.stopIndex + 1));
    try {
      window.history.replaceState(null, '', window.location.pathname + window.location.search + '#' + parts.join('&'));
    } catch (_) {
      // Ignore sandboxed replaceState errors
    }
  }

  function parseInitialHash() {
    const raw = (window.location.hash || '').replace(/^#/, '');
    const params = new URLSearchParams(raw);
    if (params.get('lang') === 'zh') state.lang = 'zh';
    const sid = params.get('story');
    if (sid) {
      const idx = STORIES.findIndex(s => s.id === sid);
      if (idx >= 0) state.storyIndex = idx;
    }
    const stp = parseInt(params.get('stop') || '1', 10);
    if (stp >= 1 && stp <= 6) state.stopIndex = stp - 1;
  }

  function toggleReunite() {
    state.reunitedHome = !state.reunitedHome;
    state.flightFrom = state.flightPos;
    state.flightStartMs = performance.now();
    syncPlayAndReuniteButtons();
    updateHudAndActiveCard();
    focusCameraOnStop(curStop());
  }

  function toggleAutoPlay() {
    if (state.audioPlaying) stopAudioGuide(false);
    state.autoPlaying = !state.autoPlaying;
    state.autoTimer = 0;
    syncPlayAndReuniteButtons();
  }

  function wireEvents() {
    elPrologueAutoplay.addEventListener('click', toggleAutoPlay);
    elBtnPlay.addEventListener('click', toggleAutoPlay);
    if (elPrologueAudio) elPrologueAudio.addEventListener('click', toggleAudioGuide);
    if (elBtnAudio) elBtnAudio.addEventListener('click', toggleAudioGuide);
    elPrologueReunite.addEventListener('click', toggleReunite);
    elBtnReunite.addEventListener('click', toggleReunite);
    window.addEventListener('beforeunload', () => stopAudioGuide(false));

    elBtnPrev.addEventListener('click', () => {
      state.autoPlaying = false;
      syncPlayAndReuniteButtons();
      selectStop(state.stopIndex - 1, true);
      if (state.audioPlaying) speakCurrentStop();
    });
    elBtnNext.addEventListener('click', () => {
      state.autoPlaying = false;
      syncPlayAndReuniteButtons();
      selectStop(state.stopIndex + 1, true);
      if (state.audioPlaying) speakCurrentStop();
    });
    elBtnArcs.addEventListener('click', () => {
      state.showAllArcs = !state.showAllArcs;
      syncPlayAndReuniteButtons();
    });

    const langBtns = document.querySelectorAll('.lang-btn[data-lang]');
    for (let i = 0; i < langBtns.length; i++) {
      langBtns[i].addEventListener('click', () => {
        const nl = langBtns[i].getAttribute('data-lang') === 'zh' ? 'zh' : 'en';
        if (nl === state.lang) return;
        state.lang = nl;
        applyTranslations();
        renderStoryTabs();
        renderStoryPrologueAndChapters();
        syncPlayAndReuniteButtons();
        updateHudAndActiveCard();
        if (state.audioPlaying) speakCurrentStop();
        if (elLightbox.classList.contains('open') && state.lightboxStopIdx >= 0) {
          openLightbox(state.lightboxStopIdx);
        }
      });
    }

    // Globe pointer interaction
    elGlobeCanvas.addEventListener('pointerdown', (e) => {
      state.isDragging = true;
      state.hasDragged = false;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      elGlobeCanvas.setPointerCapture(e.pointerId);
    });

    elGlobeCanvas.addEventListener('pointermove', (e) => {
      const rect = elGlobeCanvas.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      if (state.isDragging) {
        const dx = e.clientX - state.dragStartX;
        const dy = e.clientY - state.dragStartY;
        if (Math.hypot(dx, dy) > 3) state.hasDragged = true;
        state.dragStartX = e.clientX;
        state.dragStartY = e.clientY;
        const sens = 0.0052 / Math.sqrt(state.zoom);
        state.targetRotLon += dx * sens;
        state.targetRotLat = Math.max(-1.28, Math.min(1.28, state.targetRotLat + dy * sens));
        elTooltip.style.display = 'none';
      } else {
        let hit = -1;
        for (let i = visibleHitTargets.length - 1; i >= 0; i--) {
          const t = visibleHitTargets[i];
          if (Math.hypot(lx - t.x, ly - t.y) <= t.r) {
            hit = t.idx;
            break;
          }
        }
        state.hoveredStopIdx = hit;
        if (hit >= 0) {
          const st = curStory().stops[hit];
          elTooltip.textContent = '0' + (hit + 1) + ' · ' + (state.lang === 'zh' ? st.art.zh : st.art.en);
          elTooltip.style.left = (e.clientX + 12) + 'px';
          elTooltip.style.top = (e.clientY + 12) + 'px';
          elTooltip.style.display = 'block';
          elGlobeCanvas.style.cursor = 'pointer';
        } else {
          elTooltip.style.display = 'none';
          elGlobeCanvas.style.cursor = 'grab';
        }
      }
    });

    elGlobeCanvas.addEventListener('pointerup', () => {
      const clicked = !state.hasDragged;
      state.isDragging = false;
      if (clicked && state.hoveredStopIdx >= 0) {
        state.autoPlaying = false;
        syncPlayAndReuniteButtons();
        selectStop(state.hoveredStopIdx, true);
      }
    });

    elGlobeCanvas.addEventListener('pointerleave', () => {
      state.hoveredStopIdx = -1;
      elTooltip.style.display = 'none';
    });

    elGlobeCanvas.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey || Math.abs(e.deltaY) < 42) {
        e.preventDefault();
        state.targetZoom = Math.max(0.75, Math.min(2.4, state.targetZoom * (e.deltaY > 0 ? 0.91 : 1.10)));
      }
    }, { passive: false });

    // Lightbox controls
    elLbClose.addEventListener('click', () => elLightbox.classList.remove('open'));
    elLbPrev.addEventListener('click', () => openLightbox(state.lightboxStopIdx - 1));
    elLbNext.addEventListener('click', () => openLightbox(state.lightboxStopIdx + 1));
    elLightbox.addEventListener('click', (e) => {
      if (e.target === elLightbox) elLightbox.classList.remove('open');
    });

    document.addEventListener('keydown', (e) => {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (elLightbox.classList.contains('open')) {
        if (e.key === 'Escape') elLightbox.classList.remove('open');
        else if (e.key === 'ArrowLeft') { e.preventDefault(); openLightbox(state.lightboxStopIdx - 1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); openLightbox(state.lightboxStopIdx + 1); }
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        state.autoPlaying = false;
        syncPlayAndReuniteButtons();
        selectStop(state.stopIndex - 1, true);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        state.autoPlaying = false;
        syncPlayAndReuniteButtons();
        selectStop(state.stopIndex + 1, true);
      }
    });

    window.addEventListener('resize', resizeGlobe);
  }

  async function boot() {
    hydrateStories();
    parseInitialHash();
    applyTranslations();
    resizeGlobe();
    wireEvents();
    selectStory(state.storyIndex, state.stopIndex, false);

    try {
      const { polyMap, borderArcs3D, landDots } = await decodeWorldMap();
      state.polyMap = polyMap;
      state.borderArcs3D = borderArcs3D;
      state.landDots3D = landDots;
    } catch (_) {
      state.polyMap = new Map();
    }

    if (typeof IntersectionObserver === 'function') {
      const stageObs = new IntersectionObserver((entries) => {
        globeInViewport = Boolean(entries[0] && entries[0].isIntersecting);
        if (globeInViewport) ensureStoryRaf();
      }, { threshold: 0.01 });
      stageObs.observe(elGlobeStage);
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) ensureStoryRaf();
    });

    ensureStoryRaf();

    // Quietly prefetch remaining museum atlases during idle time
    let pfIdx = 0;
    const allMids = Object.keys(MUSEUMS);
    const prefetchNext = () => {
      if (pfIdx >= allMids.length) return;
      loadMuseumAtlas(allMids[pfIdx++]);
      setTimeout(() => {
        if (typeof window.requestIdleCallback === 'function') {
          window.requestIdleCallback(prefetchNext, { timeout: 1500 });
        } else {
          prefetchNext();
        }
      }, 260);
    };
    setTimeout(prefetchNext, 600);
  }

  boot();
})();
