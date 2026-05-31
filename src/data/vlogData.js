/**
 * 旅游景点及视频数据模块
 * 数据来源：中国旅游景点及视频总表.txt（88个景点）
 * 分类：热门景点、小众秘境、国外景点，按地区细分
 */

// 分类定义
export const categories = [
  { key: 'all', label: '全部', icon: '🌍' },
  { key: 'popular', label: '热门景点', icon: '🔥' },
  { key: 'hidden', label: '小众秘境', icon: '🔮' },
  { key: 'overseas', label: '国外景点', icon: '✈️' },
  // 按地区
  { key: 'region-beijing', label: '北京', icon: '🏯' },
  { key: 'region-zhejiang', label: '浙江', icon: '🌊' },
  { key: 'region-sichuan', label: '四川', icon: '🐼' },
  { key: 'region-yunnan', label: '云南', icon: '🌸' },
  { key: 'region-qinghai', label: '青海', icon: '💎' },
  { key: 'region-xinjiang', label: '新疆', icon: '🏜️' },
  { key: 'region-gansu', label: '甘肃', icon: '🐪' },
  { key: 'region-guizhou', label: '贵州', icon: '⛰️' },
  { key: 'region-guangxi', label: '广西', icon: '🐉' },
  { key: 'region-fujian', label: '福建', icon: '🏝️' },
  { key: 'region-anhui', label: '安徽', icon: '🏯' },
  { key: 'region-hubei', label: '湖北', icon: '🏔️' },
  { key: 'region-shandong', label: '山东', icon: '🌅' },
  { key: 'region-shaanxi', label: '陕西', icon: '🏛️' },
  { key: 'region-xizang', label: '西藏', icon: '🙏' },
  { key: 'region-hunan', label: '湖南', icon: '🌫️' },
  { key: 'region-jiangxi', label: '江西', icon: '🛤️' },
  { key: 'region-chongqing', label: '重庆', icon: '🌃' },
  { key: 'region-jiangsu', label: '江苏', icon: '🛶' },
  { key: 'region-shanxi', label: '山西', icon: '🏚️' },
  { key: 'region-hainan', label: '海南', icon: '🌴' },
  { key: 'region-neimenggu', label: '内蒙古', icon: '🐎' },
  { key: 'region-heilongjiang', label: '黑龙江', icon: '🌲' }
]

// 景点数据
export const vlogList = [
  // ===== 北京 =====
  {
    id: 1,
    name: '故宫博物院',
    tag: 'popular',
    region: 'beijing',
    regionLabel: '北京',
    description: '明清两朝皇家宫殿，现存最完整的木质古建群，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/The_Forbidden_City_-_View_from_Coal_Hill.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1Rh411R7xy', title: '紫禁城600年 一见如故' },
      { url: 'https://www.bilibili.com/video/BV1hs41197A2', title: '我在故宫修文物' }
    ]
  },
  {
    id: 2,
    name: '万里长城',
    tag: 'popular',
    region: 'beijing',
    regionLabel: '北京',
    description: '中华民族精神象征，跨越千年的建筑奇迹，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1br5K6zERQ', title: '4K航拍 万里长城今犹在' },
      { url: 'https://www.bilibili.com/video/BV114411R7Nj', title: '长城：中国的故事 纪录片12集' }
    ]
  },

  // ===== 浙江 =====
  {
    id: 3,
    name: '杭州西湖',
    tag: 'popular',
    region: 'zhejiang',
    regionLabel: '浙江',
    description: '一湖碧水半城诗，春赏桃柳/夏观荷/秋闻桂/冬寻梅，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/17/West_Lake%2C_Hangzhou_2025.jpg',
    videos: [
      { url: 'https://www.bilibili.com/bangumi/play/ss33585', title: '中国通史 纪录片100集' }
    ]
  },
  {
    id: 4,
    name: '乌镇',
    tag: 'popular',
    region: 'zhejiang',
    regionLabel: '浙江',
    description: '中国最后的枕水人家，千年水乡古镇，世界互联网大会永久会址',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/1_wuzhen_aerial_2023.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=乌镇水乡风景', title: '乌镇水乡风景' }
    ]
  },
  {
    id: 5,
    name: '松阳古村群',
    tag: 'hidden',
    region: 'zhejiang',
    regionLabel: '浙江',
    description: '被《国家地理》评为"最后的江南秘境"，杨家堂村金色夯土房如"深山布达拉宫"',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/%E7%8B%AC%E5%B1%B1%E9%B8%9F%E7%9E%B0%E6%9D%BE%E9%98%B3%E5%8E%BF%E5%9F%8E_-_panoramio.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1iw5v6fEg6', title: '江南最后的秘境有多美' },
      { url: 'https://www.bilibili.com/video/BV1PkzLB7EcW', title: '最后的江南秘境在浙江深山里' }
    ]
  },

  // ===== 四川 =====
  {
    id: 6,
    name: '九寨沟',
    tag: 'popular',
    region: 'sichuan',
    regionLabel: '四川',
    description: '人间瑶池、童话世界，翠海、叠瀑、彩林、雪峰、藏情五绝，世界自然遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/28/1_jiuzhaigou_valley_wu_hua_hai_2011b.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1ku2nYnEEU', title: '通了高铁的九寨沟' },
      { url: 'https://www.bilibili.com/video/BV1VKRPBTE3t', title: '九寨沟旅行攻略 保姆级路线' }
    ]
  },
  {
    id: 7,
    name: '稻城亚丁',
    tag: 'popular',
    region: 'sichuan',
    regionLabel: '四川',
    description: '蓝色星球上最后一片净土，三座神山守护的人间仙境',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Yading_National_Park_Milk_Lake.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=稻城亚丁风景介绍', title: '稻城亚丁风景介绍' }
    ]
  },
  {
    id: 8,
    name: '格聂神山',
    tag: 'hidden',
    region: 'sichuan',
    regionLabel: '四川',
    description: '川西最后的天堂之眼，"格聂之眼"如地球瞳孔凝视苍穹，冷古寺千年古佛',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Mount_Genyen_2014.09.16_10-27-17.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=格聂神山+航拍', title: '格聂神山 航拍' }
    ]
  },
  {
    id: 9,
    name: '党岭',
    tag: 'hidden',
    region: 'sichuan',
    regionLabel: '四川',
    description: '横断山深处的隐秘秘境，比稻城亚丁更清净，雪山、原始森林、温泉、高山海子',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Danba%2C_Garze%2C_Sichuan%2C_China_-_panoramio_%2810%29.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=党岭+川西+纪录片', title: '党岭 川西 纪录片' }
    ]
  },
  {
    id: 10,
    name: '措卡湖',
    tag: 'hidden',
    region: 'sichuan',
    regionLabel: '四川',
    description: '川西小众蓝宝石，湖水澄澈如镜，藏式古寺与红杉倒映其间，游客稀少',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/%E7%94%98%E7%99%BD%E8%B7%AF%E6%B2%BF%E9%80%94%E9%A3%8E%E5%85%891_-_panoramio.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=措卡湖+川西秘境', title: '措卡湖 川西秘境' }
    ]
  },

  // ===== 云南 =====
  {
    id: 11,
    name: '丽江古城',
    tag: 'popular',
    region: 'yunnan',
    regionLabel: '云南',
    description: '纳西族文化瑰宝，高原水乡，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/1_lijiang_old_town_2012a.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=丽江古城风景介绍', title: '丽江古城风景介绍' }
    ]
  },
  {
    id: 12,
    name: '大理苍山洱海',
    tag: 'popular',
    region: 'yunnan',
    regionLabel: '云南',
    description: '风花雪月之地，白族文化圣地，苍山雪洱海月',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/68/%E6%B4%B1%E6%B5%B7%E4%B8%8B%E5%92%8C%E6%B9%BE%E6%B9%BF%E5%9C%B0%E5%85%AC%E5%9B%AD_2025-07-24_01.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=大理苍山洱海风景', title: '大理苍山洱海风景' }
    ]
  },
  {
    id: 13,
    name: '南极洛',
    tag: 'hidden',
    region: 'yunnan',
    regionLabel: '云南',
    description: '上帝遗落的彩池，12个高山湖泊随光影变幻色彩，零商业化高山秘境',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/%E7%BB%B4%E8%A5%BF%E5%8E%BF%E5%85%B4%E7%BB%B4%E5%A4%A7%E9%81%93_-_2025-05-12.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=南极洛+航拍', title: '南极洛 航拍' }
    ]
  },
  {
    id: 14,
    name: '景迈山',
    tag: 'hidden',
    region: 'yunnan',
    regionLabel: '云南',
    description: '世界首个茶文化主题世界文化遗产，千年古茶林与布朗族古寨',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/28/%E6%99%AE%E6%B4%B1%E5%B8%82_3.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=景迈山+茶文化+纪录片', title: '景迈山 茶文化 纪录片' }
    ]
  },
  {
    id: 15,
    name: '丙中洛',
    tag: 'hidden',
    region: 'yunnan',
    regionLabel: '云南',
    description: '人神共居之地，怒江大峡谷深处的世外桃源，雾里村、秋那桶藏于云雾间',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/%E8%B4%A1%E5%B1%B1%E5%8E%BF%E5%9F%8E%E5%A4%A9%E9%99%85%E7%BA%BF_-_%E8%88%AA%E6%8B%8D_-_2024-06-02_19.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=丙中洛+人神共居', title: '丙中洛 人神共居' }
    ]
  },
  {
    id: 16,
    name: '念湖',
    tag: 'hidden',
    region: 'yunnan',
    regionLabel: '云南',
    description: '氤氲如画的美丽仙境，优雅黑颈鹤栖息地，云雾弥漫如书画里的山水写意',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/%E4%BC%9A%E6%B3%BD%E5%8E%BF%E4%BD%8D%E7%BD%AE%E5%9B%BE.svg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=念湖+黑颈鹤+风景', title: '念湖 黑颈鹤 风景' }
    ]
  },

  // ===== 青海 =====
  {
    id: 17,
    name: '茶卡盐湖',
    tag: 'popular',
    region: 'qinghai',
    regionLabel: '青海',
    description: '天空之镜，中国最美盐湖，倒映天地的梦幻仙境',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Chaqia_Salt_Lake.JPG',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=茶卡盐湖风景介绍', title: '茶卡盐湖风景介绍' }
    ]
  },
  {
    id: 18,
    name: '青海湖',
    tag: 'popular',
    region: 'qinghai',
    regionLabel: '青海',
    description: '中国最大内陆咸水湖，高原蓝宝石，油菜花海与碧波相映',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Qinghai_lake.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=青海湖风景介绍', title: '青海湖风景介绍' }
    ]
  },
  {
    id: 19,
    name: '艾肯泉/恶魔之眼',
    tag: 'hidden',
    region: 'qinghai',
    regionLabel: '青海',
    description: '昆仑之眼，汩汩喷涌千年的地热喷泉，航拍如大地瞳孔',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Aiken_Spring_202107-1.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=艾肯泉+航拍+恶魔之眼', title: '艾肯泉 航拍 恶魔之眼' }
    ]
  },
  {
    id: 20,
    name: '茫崖翡翠湖',
    tag: 'hidden',
    region: 'qinghai',
    regionLabel: '青海',
    description: '柴达木盆地深处的绿色盐湖，比茶卡人少景更绝',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/71/%E8%8C%AB%E5%B4%96_%E5%86%B7%E6%B9%96%E9%95%87%E5%85%A5%E5%8F%A3.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=茫崖翡翠湖+航拍', title: '茫崖翡翠湖 航拍' }
    ]
  },
  {
    id: 21,
    name: '东台吉乃尔湖',
    tag: 'hidden',
    region: 'qinghai',
    regionLabel: '青海',
    description: '柴达木盆地的"马尔代夫"，湖蓝色湖水+白色盐梗+金色沙滩',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Alluvial_fan_in_Tsinghai.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=东台吉乃尔湖+风景', title: '东台吉乃尔湖 风景' }
    ]
  },
  {
    id: 22,
    name: '黑独山',
    tag: 'hidden',
    region: 'qinghai',
    regionLabel: '青海',
    description: '火星登陆实景地，水墨画般的黑色山丘群延绵20公里',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Location_of_Haixi_Prefecture_within_Qinghai_%28China%29.png',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=黑独山+火星+冷湖', title: '黑独山 火星 冷湖' }
    ]
  },
  {
    id: 23,
    name: '年保玉则',
    tag: 'hidden',
    region: 'qinghai',
    regionLabel: '青海',
    description: '天神的后花园，雪山簇拥360个高山海子，夏季野花铺满草原溪流蜿蜒',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/2007%E5%B9%B4%E4%B9%85%E6%B2%BB%E5%8E%BF%E5%9F%8E2.JPG',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=年保玉则+航拍+纪录片', title: '年保玉则 航拍 纪录片' }
    ]
  },

  // ===== 新疆 =====
  {
    id: 24,
    name: '琼库什台',
    tag: 'hidden',
    region: 'xinjiang',
    regionLabel: '新疆',
    description: '伊犁最原生态的立体草原童话，哈萨克族木屋村落，比那拉提更纯粹的游牧秘境',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Kalajun_Grassland.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=琼库什台+纪录片', title: '琼库什台 纪录片' }
    ]
  },
  {
    id: 25,
    name: '夏尔西里',
    tag: 'hidden',
    region: 'xinjiang',
    regionLabel: '新疆',
    description: '中哈边境绿色迷宫，曾为军事禁区，中国最后原始森林之一，每日限流需边防证',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Flowers_arround_Lake_Sailimu%2C_aka_Sayram_-_Flickr_-_George_Lu.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=夏尔西里+秘境', title: '夏尔西里 秘境' }
    ]
  },
  {
    id: 26,
    name: '江布拉克',
    tag: 'hidden',
    region: 'xinjiang',
    regionLabel: '新疆',
    description: '天山脚下麦浪狂想曲，7月万亩七彩麦浪奇观，9月金色麦茬与雪山同框',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/%E4%B8%AD%E5%9B%BD%E6%96%B0%E7%96%86%E6%98%8C%E5%90%89%E5%9B%9E%E6%97%8F%E8%87%AA%E6%B2%BB%E5%B7%9E%E5%A5%87%E5%8F%B0%E5%8E%BF_China_Xinjiang_Qitai%2C_China_Xinjiang_Uru_-_panoramio_%281%29.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=江布拉克+麦浪+航拍', title: '江布拉克 麦浪 航拍' }
    ]
  },
  {
    id: 27,
    name: '大海道',
    tag: 'hidden',
    region: 'xinjiang',
    regionLabel: '新疆',
    description: '丝绸之路上最富传奇色彩的一段，千万年风化形成的罕见雅丹地貌',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Downtown_Hami_City_night.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=大海道+雅丹+穿越', title: '大海道 雅丹 穿越' }
    ]
  },

  // ===== 甘肃 =====
  {
    id: 28,
    name: '敦煌莫高窟',
    tag: 'popular',
    region: 'gansu',
    regionLabel: '甘肃',
    description: '丝路明珠，千年佛教艺术宝库，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Dunhuang_Mogao_Ku_2013.12.31_12-30-18.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1qx411T76g', title: '新丝绸之路 纪录片' },
      { url: 'https://www.bilibili.com/video/av5031538', title: '敦煌 纪录片' }
    ]
  },
  {
    id: 29,
    name: '扎尕那',
    tag: 'hidden',
    region: 'gansu',
    regionLabel: '甘肃',
    description: '四座石山环抱藏族村落的天然石城，被洛克誉为"亚当夏娃诞生地"',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/%E7%9B%8A%E5%93%87%E7%A7%8B%E8%89%B2_-_panoramio.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=扎尕那+4K航拍', title: '扎尕那 4K航拍' }
    ]
  },

  // ===== 贵州 =====
  {
    id: 30,
    name: '梵净山',
    tag: 'popular',
    region: 'guizhou',
    regionLabel: '贵州',
    description: '天下众名岳之宗，东方第一仙山，世界自然遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/%E6%A2%B5%E6%B7%A8%E5%B1%B1%E7%B4%85%E9%9B%B2%E9%87%91%E9%A0%82%EF%BC%88%E6%96%B0%E9%87%91%E9%A0%82%EF%BC%89.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=梵净山风景介绍', title: '梵净山风景介绍' }
    ]
  },
  {
    id: 31,
    name: '黄果树瀑布',
    tag: 'popular',
    region: 'guizhou',
    regionLabel: '贵州',
    description: '亚洲最大瀑布之一，飞流直下三千尺的壮美奇观',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/30/HuangguoshuFall.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=黄果树瀑布风景', title: '黄果树瀑布风景' }
    ]
  },
  {
    id: 32,
    name: '赫章韭菜坪',
    tag: 'hidden',
    region: 'guizhou',
    regionLabel: '贵州',
    description: '亚洲最大野生韭菜花海，7-8月万亩紫色花海媲美普罗旺斯',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Jiucaiping.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=韭菜坪+花海+航拍', title: '韭菜坪 花海 航拍' }
    ]
  },
  {
    id: 33,
    name: '罗甸大小井',
    tag: 'hidden',
    region: 'guizhou',
    regionLabel: '贵州',
    description: '贵州私藏的蓝眼泪秘境，翡翠色暗河水系与30余个天坑相连',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/ChinaQiannanLuodian.png',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=罗甸大小井+蓝眼泪', title: '罗甸大小井 蓝眼泪' }
    ]
  },

  // ===== 广西 =====
  {
    id: 34,
    name: '桂林漓江',
    tag: 'popular',
    region: 'guangxi',
    regionLabel: '广西',
    description: '山水甲天下，百里水墨画廊，20元人民币取景地',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/21/%E6%BC%93%E6%B1%9F%E5%B1%B1%E6%B0%B4.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=桂林漓江风景介绍', title: '桂林漓江风景介绍' }
    ]
  },
  {
    id: 35,
    name: '凤山三门海',
    tag: 'hidden',
    region: 'guangxi',
    regionLabel: '广西',
    description: '世界唯一可乘船游览的水上天坑，七座天窗呈北斗七星排布',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Peak_cluster_depression.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=凤山三门海+风景', title: '凤山三门海 风景' }
    ]
  },
  {
    id: 36,
    name: '崇左明仕田园',
    tag: 'hidden',
    region: 'guangxi',
    regionLabel: '广西',
    description: '中越边境的水墨仙境，游客密度仅为桂林1/15',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Office_building_of_the_Chongzuo_government.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=明仕田园+竹筏漂流', title: '明仕田园 竹筏漂流' }
    ]
  },

  // ===== 福建 =====
  {
    id: 37,
    name: '鼓浪屿',
    tag: 'popular',
    region: 'fujian',
    regionLabel: '福建',
    description: '海上花园，钢琴之岛，万国建筑博览，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/%E9%BC%93%E6%B5%AA%E5%B1%BF_-_panoramio.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=鼓浪屿风景介绍', title: '鼓浪屿风景介绍' }
    ]
  },
  {
    id: 38,
    name: '霞浦滩涂',
    tag: 'hidden',
    region: 'fujian',
    regionLabel: '福建',
    description: '中国最美滩涂摄影圣地，潮汐光影魔术师，随手拍都是壁纸',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/%E9%9C%9E%E6%B5%A6%E5%8E%BF%E5%BD%B1%E9%9B%86.png',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=霞浦滩涂+4K+摄影', title: '霞浦滩涂 4K 摄影' }
    ]
  },
  {
    id: 39,
    name: '四礵列岛',
    tag: 'hidden',
    region: 'fujian',
    regionLabel: '福建',
    description: '现实版塞尔达传说，东礵岛绿色草甸直入海中如世界尽头',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/99/%E5%90%8E%E6%B8%AF%E3%81%8B%E3%82%89%E5%9B%9B%E3%82%BD%E3%82%A6%E5%88%97%E5%B3%B6%E3%81%B8%E5%90%91%E3%81%8B%E3%81%86%E5%AE%9A%E6%9C%9F%E8%88%B9.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=四礵列岛+航拍+秘境', title: '四礵列岛 航拍 秘境' }
    ]
  },

  // ===== 安徽 =====
  {
    id: 40,
    name: '黄山',
    tag: 'popular',
    region: 'anhui',
    regionLabel: '安徽',
    description: '天下第一奇山，五绝奇松、怪石、云海、温泉、冬雪，世界文化与自然双遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Huangshan_pic_4.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV13WGb6YEes', title: '黄山沉浸式导览' },
      { url: 'https://www.bilibili.com/video/BV1d3L46CEf7', title: '黄山大环线一镜到底徒步' }
    ]
  },
  {
    id: 41,
    name: '宏村',
    tag: 'popular',
    region: 'anhui',
    regionLabel: '安徽',
    description: '活着的明清博物馆，水墨画般的徽派古村落，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Yixian_Hongcun_2016.09.09_18-17-55.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=宏村徽派建筑风景', title: '宏村徽派建筑风景' }
    ]
  },
  {
    id: 42,
    name: '阳产土楼',
    tag: 'hidden',
    region: 'anhui',
    regionLabel: '安徽',
    description: '皖南最后的土楼王国，金黄土楼群依山而建，秋季晒秋场景如油画',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/%E9%98%B3%E4%BA%A7%E5%9C%9F%E6%A5%BC_07.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=阳产土楼+晒秋', title: '阳产土楼 晒秋' }
    ]
  },

  // ===== 湖北 =====
  {
    id: 43,
    name: '武当山',
    tag: 'popular',
    region: 'hubei',
    regionLabel: '湖北',
    description: '道教圣地，太极发源地，云雾缭绕的仙山胜境，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Wudang_Mountain_%2854131425234%29.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=武当山风景介绍', title: '武当山风景介绍' }
    ]
  },
  {
    id: 44,
    name: '恩施大峡谷',
    tag: 'popular',
    region: 'hubei',
    regionLabel: '湖北',
    description: '地球最美丽的伤痕，喀斯特地貌奇观，百里绝壁千丈瀑布',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Enshi_Canyon_109.21564E_30.45224N.png',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=恩施大峡谷风景', title: '恩施大峡谷风景' }
    ]
  },
  {
    id: 45,
    name: '鹿院坪',
    tag: 'hidden',
    region: 'hubei',
    regionLabel: '湖北',
    description: '国内唯一需徒步进入的村落，深陷天坑之中四周绝壁环绕',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Lichuan_Railway_Station.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=鹿院坪+天坑古村', title: '鹿院坪 天坑古村' }
    ]
  },

  // ===== 山东 =====
  {
    id: 46,
    name: '泰山',
    tag: 'popular',
    region: 'shandong',
    regionLabel: '山东',
    description: '五岳之首，登泰山而小天下，世界文化与自然双遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/71/50304-Taishan_%2849055660366%29.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=泰山日出风景', title: '泰山日出风景' }
    ]
  },
  {
    id: 47,
    name: '烟台长岛',
    tag: 'hidden',
    region: 'shandong',
    regionLabel: '山东',
    description: '黄海深处最干净安静的小众海岛，亿年海蚀崖+细腻球石海滩',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Penglai.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=烟台长岛+风景介绍', title: '烟台长岛 风景介绍' }
    ]
  },

  // ===== 陕西 =====
  {
    id: 48,
    name: '秦始皇兵马俑',
    tag: 'popular',
    region: 'shaanxi',
    regionLabel: '陕西',
    description: '世界第八大奇迹，沉默的地下军团诉说大秦辉煌，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/88/51714-Terracota-Army.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1kh411A77d', title: 'Hello中国 兵马俑' }
    ]
  },
  {
    id: 49,
    name: '西安大唐不夜城',
    tag: 'popular',
    region: 'shaanxi',
    regionLabel: '陕西',
    description: '盛唐文化体验地，灯火辉煌的穿越之旅',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/%E9%9B%81%E5%A1%94_%E5%A4%A7%E5%94%90%E4%B8%8D%E5%A4%9C%E5%9F%8E%E5%92%8C%E5%A4%A7%E9%9B%81%E5%A1%94.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=西安大唐不夜城夜景', title: '西安大唐不夜城夜景' }
    ]
  },

  // ===== 西藏 =====
  {
    id: 50,
    name: '布达拉宫',
    tag: 'popular',
    region: 'xizang',
    regionLabel: '西藏',
    description: '世界屋脊的明珠，藏传佛教圣地，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Potala_Palace_HQ.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/av8668069', title: '第三极 纪录片' }
    ]
  },

  // ===== 湖南 =====
  {
    id: 51,
    name: '张家界国家森林公园',
    tag: 'popular',
    region: 'hunan',
    regionLabel: '湖南',
    description: '阿凡达取景地，三千奇峰拔地而起，世界自然遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/77/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1koKizrEB4', title: '哪个5A景区称得上6A景区' }
    ]
  },

  // ===== 江西 =====
  {
    id: 52,
    name: '三清山',
    tag: 'popular',
    region: 'jiangxi',
    regionLabel: '江西',
    description: '西太平洋边缘最美丽的花岗岩，世界自然遗产，道教名山',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Sanqingshan1522.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=三清山风景介绍', title: '三清山风景介绍' }
    ]
  },

  // ===== 重庆 =====
  {
    id: 53,
    name: '洪崖洞',
    tag: 'popular',
    region: 'chongqing',
    regionLabel: '重庆',
    description: '8D魔幻山城地标，千与千寻现实版，吊脚楼群夜景绝美',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/64/202308_Hongya_Cave_at_night_from_Qiansimen_Bridge.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=重庆洪崖洞夜景', title: '重庆洪崖洞夜景' }
    ]
  },

  // ===== 江苏 =====
  {
    id: 54,
    name: '周庄',
    tag: 'popular',
    region: 'jiangsu',
    regionLabel: '江苏',
    description: '天下第一水乡，小桥流水人家，保存完好的明清古建筑群',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Zhouzhuang1.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=周庄古镇风景', title: '周庄古镇风景' }
    ]
  },

  // ===== 山西 =====
  {
    id: 55,
    name: '平遥古城',
    tag: 'popular',
    region: 'shanxi',
    regionLabel: '山西',
    description: '中国保存最完整的古城之一，晋商文化发源地，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Pingyao_40.JPG',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=平遥古城风景介绍', title: '平遥古城风景介绍' }
    ]
  },

  // ===== 海南 =====
  {
    id: 56,
    name: '三亚亚龙湾',
    tag: 'popular',
    region: 'hainan',
    regionLabel: '海南',
    description: '东方夏威夷，中国最美热带海滨，碧海银沙椰风海韵',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/%E4%BA%9A%E9%BE%99%E6%B9%BE.JPG',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=三亚亚龙湾风景', title: '三亚亚龙湾风景' }
    ]
  },

  // ===== 内蒙古 =====
  {
    id: 57,
    name: '阿尔山',
    tag: 'hidden',
    region: 'neimenggu',
    regionLabel: '内蒙古',
    description: '火山熔岩上的童话世界，9月全国最早金秋油画季，冬季不冻河奇观',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/%E9%98%BF%E5%B0%94%E5%B1%B1%E5%B8%82_%289535929873%29.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=阿尔山+纪录片+4K', title: '阿尔山 纪录片 4K' }
    ]
  },

  // ===== 黑龙江 =====
  {
    id: 58,
    name: '伊春小兴安岭',
    tag: 'hidden',
    region: 'heilongjiang',
    regionLabel: '黑龙江',
    description: '野生东北虎的森林秘境，汤旺河亚洲最大花岗岩石林群',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Sight_of_the_city_from_the_top_of_Xing%27an_Tower%2C_Yichun%2C_Heilongjiang%2C_China.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=伊春+小兴安岭+森林', title: '伊春 小兴安岭 森林' }
    ]
  },

  // ===========================
  // 国外景点（29个）
  // ===========================

  // ===== 日本 =====
  {
    id: 59,
    name: '富士山',
    tag: 'overseas',
    region: 'japan',
    regionLabel: '日本',
    description: '日本最高峰，圆锥形山体终年积雪，与樱花并称日本三大标志',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1LW411J7BV', title: '鸟瞰日本·富士山篇' }
    ]
  },
  {
    id: 60,
    name: '京都',
    tag: 'overseas',
    region: 'japan',
    regionLabel: '日本',
    description: '日本千年古都，拥有2000余座寺庙与神社，金阁寺、伏见稻荷大社千本鸟居',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Kiyomizu.jpg',
    videos: [
      { url: 'https://www.bilibili.com/bangumi/media/md28220406', title: '鸟瞰日本·自然人文社会' }
    ]
  },

  // ===== 柬埔寨 =====
  {
    id: 61,
    name: '吴哥窟',
    tag: 'overseas',
    region: 'cambodia',
    regionLabel: '柬埔寨',
    description: '世界最大宗教建筑群，高棉帝国鼎盛时期的杰作，世界文化遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Buddhist_monks_in_front_of_the_Angkor_Wat.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1ji4y157Bv', title: '探秘吴哥窟·失落文明' }
    ]
  },

  // ===== 印度 =====
  {
    id: 62,
    name: '泰姬陵',
    tag: 'overseas',
    region: 'india',
    regionLabel: '印度',
    description: '被誉为"永恒面颊上的一滴泪"，世界新七大奇迹之一',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Taj-Mahal.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1LW411J7BV', title: '乔安娜·林莉的印度之旅' }
    ]
  },

  // ===== 马尔代夫 =====
  {
    id: 63,
    name: '马尔代夫',
    tag: 'overseas',
    region: 'maldives',
    regionLabel: '马尔代夫',
    description: '印度洋上的珍珠项链，碧蓝泻湖、白沙滩、水上别墅构成人间天堂',
    image: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/The_palace_at_thiladhunmathi_utheemu.jpg/800px-The_palace_at_thiladhunmathi_utheemu.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1Le411Z7Nf', title: '马尔代夫·浮潜航拍' }
    ]
  },

  // ===== 斯里兰卡 =====
  {
    id: 64,
    name: '锡吉里耶狮子岩',
    tag: 'overseas',
    region: 'srilanka',
    regionLabel: '斯里兰卡',
    description: '建在200米高巨岩上的空中宫殿，被誉为世界第八大奇迹',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Sigiriya_%28141688197%29.jpeg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=斯里兰卡狮子岩旅游', title: '斯里兰卡狮子岩旅游' }
    ]
  },

  // ===== 格鲁吉亚 =====
  {
    id: 65,
    name: '梅斯蒂亚',
    tag: 'overseas',
    region: 'georgia',
    regionLabel: '格鲁吉亚',
    description: '高加索山脉的明珠，中世纪碉楼与雪山冰川相映成趣',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Gold_of_Svaneti.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=格鲁吉亚梅斯蒂亚旅游', title: '格鲁吉亚梅斯蒂亚旅游' }
    ]
  },

  // ===== 法国 =====
  {
    id: 66,
    name: '巴黎埃菲尔铁塔',
    tag: 'overseas',
    region: 'france',
    regionLabel: '法国',
    description: '工业时代浪漫的代名词，高324米，曾保持世界最高建筑纪录40年',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1qb9qBiEXN', title: '7分钟带你走遍巴黎所有顶级地标' }
    ]
  },
  {
    id: 67,
    name: '卢浮宫',
    tag: 'overseas',
    region: 'france',
    regionLabel: '法国',
    description: '世界四大博物馆之首，蒙娜丽莎、断臂维纳斯、胜利女神像为镇馆三宝',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Louvre_Museum_Wikimedia_Commons.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1zK4y1Y7Vv', title: '卢浮宫的珍宝·BBC纪录片' }
    ]
  },

  // ===== 瑞士 =====
  {
    id: 68,
    name: '少女峰',
    tag: 'overseas',
    region: 'switzerland',
    regionLabel: '瑞士',
    description: '阿尔卑斯山"皇后"，百年齿轨列车直达欧洲最高火车站，世界自然遗产',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Jungfrau03.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=瑞士少女峰航拍纪录片', title: '瑞士少女峰航拍纪录片' }
    ]
  },

  // ===== 冰岛 =====
  {
    id: 69,
    name: '北极光与黄金圈',
    tag: 'overseas',
    region: 'iceland',
    regionLabel: '冰岛',
    description: '冰岛是观测极光的最佳目的地之一，黄金圈涵盖间歇泉、黄金瀑布和辛格维利尔国家公园',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Strokkur.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1i594BKELZ', title: '冰岛·走到世界尽头·极光爆发' }
    ]
  },

  // ===== 意大利 =====
  {
    id: 70,
    name: '罗马斗兽场',
    tag: 'overseas',
    region: 'italy',
    regionLabel: '意大利',
    description: '古罗马帝国最宏伟的建筑，可容纳5万观众，世界新七大奇迹之一',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Colosseo_2020.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=罗马斗兽场纪录片', title: '罗马斗兽场纪录片' }
    ]
  },

  // ===== 希腊 =====
  {
    id: 71,
    name: '雅典卫城',
    tag: 'overseas',
    region: 'greece',
    regionLabel: '希腊',
    description: '西方文明的摇篮，帕特农神庙屹立山巅已有2500年',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1EARMBREWw', title: '希腊·雅典卫城日落与千年古迹' }
    ]
  },

  // ===== 英国 =====
  {
    id: 72,
    name: '伦敦塔桥与大本钟',
    tag: 'overseas',
    region: 'uk',
    regionLabel: '英国',
    description: '泰晤士河上最著名的维多利亚式开合桥，大本钟钟声已敲响160余年',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Tower_Bridge_at_Dawn.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=伦敦塔桥大本钟纪录片', title: '伦敦塔桥大本钟纪录片' }
    ]
  },

  // ===== 挪威 =====
  {
    id: 73,
    name: '挪威峡湾',
    tag: 'overseas',
    region: 'norway',
    regionLabel: '挪威',
    description: '被国家地理评为世界最佳旅游目的地，冰川雕刻的U型谷',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Sognefjord%2C_Norway.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=挪威峡湾纪录片航拍', title: '挪威峡湾纪录片航拍' }
    ]
  },

  // ===== 斯洛文尼亚 =====
  {
    id: 74,
    name: '布莱德湖',
    tag: 'overseas',
    region: 'slovenia',
    regionLabel: '斯洛文尼亚',
    description: '阿尔卑斯山脚下的童话湖，湖心小岛教堂与悬崖城堡倒映碧水中',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Lake_Bled_from_the_Mountain.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=斯洛文尼亚布莱德湖旅游', title: '斯洛文尼亚布莱德湖旅游' }
    ]
  },

  // ===== 捷克 =====
  {
    id: 75,
    name: '布拉格',
    tag: 'overseas',
    region: 'czech',
    regionLabel: '捷克',
    description: '千塔之城，查理大桥巴洛克雕塑、老城广场天文钟、布拉格城堡',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Prague_%286365119737%29.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1iDZQBpEeG', title: '布拉格二日游攻略' }
    ]
  },

  // ===== 埃及 =====
  {
    id: 76,
    name: '吉萨金字塔',
    tag: 'overseas',
    region: 'egypt',
    regionLabel: '埃及',
    description: '人类最古老的建筑奇迹，胡夫金字塔由230万块巨石堆砌，4600年来屹立沙漠中',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1zK4y1Y7Vv', title: '不朽的埃及·BBC纪录片' }
    ]
  },

  // ===== 南非 =====
  {
    id: 77,
    name: '纳马夸兰',
    tag: 'overseas',
    region: 'southafrica',
    regionLabel: '南非',
    description: '世界多肉植物之都，每年7-8月荒漠化为万亩花田，"箭袋树"森林如阿凡达',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Doorn_River_Waterfall%2C_Northern_Cape.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=南非纳马夸兰花海', title: '南非纳马夸兰花海' }
    ]
  },

  // ===== 坦桑尼亚 =====
  {
    id: 78,
    name: '塞伦盖蒂大草原',
    tag: 'overseas',
    region: 'tanzania',
    regionLabel: '坦桑尼亚',
    description: '非洲最著名的野生动物保护区，每年百万角马大迁徙是地球最壮观的自然奇观',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Tanzania-_Serengeti_National_Park-_elefante.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=塞伦盖蒂大迁徙纪录片', title: '塞伦盖蒂大迁徙纪录片' }
    ]
  },

  // ===== 美国 =====
  {
    id: 79,
    name: '大峡谷',
    tag: 'overseas',
    region: 'usa',
    regionLabel: '美国',
    description: '科罗拉多河历经600万年切割而成的地质奇观，红褐色岩层记录20亿年地球历史',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Canyon_River_Tree_%28165872763%29.jpeg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=美国大峡谷纪录片航拍', title: '美国大峡谷纪录片航拍' }
    ]
  },
  {
    id: 80,
    name: '黄石国家公园',
    tag: 'overseas',
    region: 'usa',
    regionLabel: '美国',
    description: '世界第一个国家公园，老忠实间歇泉约90分钟喷发一次，大棱镜温泉色彩斑斓',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Grand_Canyon_of_yellowstone.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=黄石国家公园纪录片', title: '黄石国家公园纪录片' }
    ]
  },

  // ===== 墨西哥 =====
  {
    id: 81,
    name: '奇琴伊察',
    tag: 'overseas',
    region: 'mexico',
    regionLabel: '墨西哥',
    description: '玛雅文明最辉煌的城市遗址，库库尔坎金字塔春分秋分时出现"羽蛇降临"光影奇观',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Chichen_Itza_3.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=奇琴伊察玛雅金字塔纪录片', title: '奇琴伊察玛雅金字塔纪录片' }
    ]
  },

  // ===== 秘鲁 =====
  {
    id: 82,
    name: '马丘比丘',
    tag: 'overseas',
    region: 'peru',
    regionLabel: '秘鲁',
    description: '印加帝国失落的天空之城，海拔2430米的安第斯山脊上，世界新七大奇迹之一',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/62/80_-_Machu_Picchu_-_Juin_2009_-_edit.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=马丘比丘+纪录片+航拍', title: '马丘比丘 纪录片 航拍' }
    ]
  },

  // ===== 巴西 =====
  {
    id: 83,
    name: '伊瓜苏瀑布',
    tag: 'overseas',
    region: 'brazil',
    regionLabel: '巴西',
    description: '世界最宽的瀑布群，由275道瀑布组成，魔鬼咽喉段水雾升腾百米',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Iguazu_Cataratas2.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=伊瓜苏瀑布纪录片航拍', title: '伊瓜苏瀑布纪录片航拍' }
    ]
  },

  // ===== 哥伦比亚 =====
  {
    id: 84,
    name: '咖啡三角区',
    tag: 'overseas',
    region: 'colombia',
    regionLabel: '哥伦比亚',
    description: '世界顶级咖啡产地，联合国世界遗产的咖啡文化景观，殖民风格小镇点缀翠绿山坡',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Bogota%27s_best_coffee._IMG_5865._png.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=哥伦比亚咖啡三角区旅游', title: '哥伦比亚咖啡三角区旅游' }
    ]
  },

  // ===== 新西兰 =====
  {
    id: 85,
    name: '米尔福德峡湾',
    tag: 'overseas',
    region: 'newzealand',
    regionLabel: '新西兰',
    description: '被称为"世界第八大奇迹"，峡湾两侧千米峭壁上瀑布飞流直下',
    image: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Milford_Sound_%28New_Zealand%29.JPG',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1TwQuBeESD', title: '新西兰北岛纪行' }
    ]
  },

  // ===== 澳大利亚 =====
  {
    id: 86,
    name: '大堡礁',
    tag: 'overseas',
    region: 'australia',
    regionLabel: '澳大利亚',
    description: '世界最大的珊瑚礁群，绵延2300公里，从太空都能看到',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/ISS-45_StoryOfWater%2C_Great_Barrier_Reef%2C_Australia.jpg',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=大堡礁纪录片BBC', title: '大堡礁纪录片BBC' }
    ]
  },

  // ===== 约旦 =====
  {
    id: 87,
    name: '佩特拉古城',
    tag: 'overseas',
    region: 'jordan',
    regionLabel: '约旦',
    description: '纳巴泰人在红色砂岩中雕刻的玫瑰之城，卡兹尼神殿高40米',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Al_Deir_Petra.JPG',
    videos: [
      { url: 'https://search.bilibili.com/all?keyword=约旦佩特拉古城纪录片', title: '约旦佩特拉古城纪录片' }
    ]
  },

  // ===== 阿曼 =====
  {
    id: 88,
    name: '马斯喀特',
    tag: 'overseas',
    region: 'oman',
    regionLabel: '阿曼',
    description: '阿拉伯世界的隐秘瑰宝，瓦迪沙布峡谷碧水如翡翠，安全且友好',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Al_Alam_Palace.jpg',
    videos: [
      { url: 'https://www.bilibili.com/video/BV1LZDkB3Eqn', title: '阿曼·马斯喀特篇' }
    ]
  }
]

/**
 * 根据分类筛选景点
 * @param {string} key - 分类key
 * @returns {Array}
 */
export function getVlogsByCategory(key) {
  if (key === 'all') return vlogList
  if (key.startsWith('region-')) {
    const region = key.replace('region-', '')
    return vlogList.filter(v => v.region === region)
  }
  return vlogList.filter(v => v.tag === key)
}

/**
 * 获取主视频链接（第一个视频）
 * @param {Object} item - 景点数据
 * @returns {string}
 */
export function getPrimaryVideoUrl(item) {
  if (!item.videos || item.videos.length === 0) return ''
  return item.videos[0].url
}

/**
 * 获取分类统计
 * @returns {Object}
 */
export function getCategoryCounts() {
  const counts = { all: vlogList.length }
  for (const v of vlogList) {
    counts[v.tag] = (counts[v.tag] || 0) + 1
    const regionKey = `region-${v.region}`
    counts[regionKey] = (counts[regionKey] || 0) + 1
  }
  return counts
}
