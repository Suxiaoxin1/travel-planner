/**
 * MBTI性格分析前端服务
 * 纯前端实现，与后端 mbti_service.py 算法对齐
 * 基于问卷回答计算 E/I, S/N, T/F, J/P 四维度，生成MBTI类型及旅行偏好画像
 * 支持两种模式：问卷测试 和 直接输入MBTI类型
 */

// ============================================================
// 28道MBTI评估问卷题目
// ============================================================
export const QUESTIONS = [
  // EI维度 (1-7)
  { id: 1, dimension: 'EI', text: '旅行中你更享受哪种状态？',
    options: [{ label: 'A', text: '在热闹的夜市中和摊主攀谈', value: 'E' },
              { label: 'B', text: '在安静的咖啡馆里独自看书', value: 'I' }] },
  { id: 2, dimension: 'EI', text: '到达一个新城市，你的第一件事是？',
    options: [{ label: 'A', text: '约当地朋友出来聚餐', value: 'E' },
              { label: 'B', text: '自己先去街头走走感受氛围', value: 'I' }] },
  { id: 3, dimension: 'EI', text: '旅途中遇到困难时，你倾向于？',
    options: [{ label: 'A', text: '向周围人求助或发社交媒体', value: 'E' },
              { label: 'B', text: '自己冷静思考解决办法', value: 'I' }] },
  { id: 4, dimension: 'EI', text: '你更愿意选择哪种住宿？',
    options: [{ label: 'A', text: '热闹的青旅，公共区域随时有人在聊天', value: 'E' },
              { label: 'B', text: '安静的单间民宿，有自己的私人空间', value: 'I' }] },
  { id: 5, dimension: 'EI', text: '旅行结束后，你更喜欢怎样分享经历？',
    options: [{ label: 'A', text: '发朋友圈、写游记、和朋友聚餐分享', value: 'E' },
              { label: 'B', text: '在内心回味，偶尔和最亲密的人聊聊', value: 'I' }] },
  { id: 6, dimension: 'EI', text: '你更倾向于怎样的旅行社交？',
    options: [{ label: 'A', text: '主动认识新朋友，参加当地聚会', value: 'E' },
              { label: 'B', text: '保持小圈子，和已知的旅伴相处', value: 'I' }] },
  { id: 7, dimension: 'EI', text: '漫长的飞行中你更可能？',
    options: [{ label: 'A', text: '和邻座聊天打发时间', value: 'E' },
              { label: 'B', text: '戴上耳机看电影或闭目养神', value: 'I' }] },

  // SN维度 (8-14)
  { id: 8, dimension: 'SN', text: '你选择目的地时更看重？',
    options: [{ label: 'A', text: '具体信息：美食评分、交通便捷度、住宿条件', value: 'S' },
              { label: 'B', text: '抽象感受：文化底蕴、灵性氛围、传说故事', value: 'N' }] },
  { id: 9, dimension: 'SN', text: '参观古迹时，你更关注？',
    options: [{ label: 'A', text: '建筑细节、历史年代、导览讲解的具体信息', value: 'S' },
              { label: 'B', text: '感受时空穿越的意境、想象古人的生活场景', value: 'N' }] },
  { id: 10, dimension: 'SN', text: '你更容易被哪种推荐打动？',
    options: [{ label: 'A', text: '"这家餐厅评分4.9，排队30分钟，招牌菜是XX"', value: 'S' },
              { label: 'B', text: '"这个地方有一种说不出的魔力，去过的人都懂"', value: 'N' }] },
  { id: 11, dimension: 'SN', text: '旅行中你更重视的体验是？',
    options: [{ label: 'A', text: '可触摸、可品尝、可拍照的具体感官体验', value: 'S' },
              { label: 'B', text: '灵感迸发、心灵震撼、哲学思考的深层体验', value: 'N' }] },
  { id: 12, dimension: 'SN', text: '你对"网红打卡点"的态度？',
    options: [{ label: 'A', text: '既然大家都去，说明确实值得体验', value: 'S' },
              { label: 'B', text: '越热门越不去，我更想找有隐喻意义的地方', value: 'N' }] },
  { id: 13, dimension: 'SN', text: '你更想在旅行中收获什么？',
    options: [{ label: 'A', text: '精美的照片、地道的美食、舒适的体验', value: 'S' },
              { label: 'B', text: '对世界的新理解、对自我的新发现', value: 'N' }] },
  { id: 14, dimension: 'SN', text: '逛当地市场时，你更可能？',
    options: [{ label: 'A', text: '仔细比较价格、品尝样品、和摊主还价', value: 'S' },
              { label: 'B', text: '观察市场的生活气息、想象每件物品背后的故事', value: 'N' }] },

  // TF维度 (15-21)
  { id: 15, dimension: 'TF', text: '选择餐厅时，你的决策方式是？',
    options: [{ label: 'A', text: '对比评分、距离、性价比，选最优解', value: 'T' },
              { label: 'B', text: '看氛围是否浪漫温馨、有没有故事感', value: 'F' }] },
  { id: 16, dimension: 'TF', text: '旅伴想去一个你不感兴趣的地方，你会？',
    options: [{ label: 'A', text: '分析是否值得去，不值得就分开行动', value: 'T' },
              { label: 'B', text: '为了旅伴开心，陪TA一起去', value: 'F' }] },
  { id: 17, dimension: 'TF', text: '旅行预算超支时，你的反应是？',
    options: [{ label: 'A', text: '冷静调整后续计划，削减不必要的开支', value: 'T' },
              { label: 'B', text: '难得出来玩，开心最重要，钱可以再赚', value: 'F' }] },
  { id: 18, dimension: 'TF', text: '你对旅行攻略的态度？',
    options: [{ label: 'A', text: '参考客观数据和评价做最优决策', value: 'T' },
              { label: 'B', text: '参考博主的情感体验和故事分享', value: 'F' }] },
  { id: 19, dimension: 'TF', text: '安排行程时，你更优先考虑？',
    options: [{ label: 'A', text: '时间效率、路线合理性、性价比', value: 'T' },
              { label: 'B', text: '每个人是否开心、氛围是否舒适', value: 'F' }] },
  { id: 20, dimension: 'TF', text: '旅行中出现分歧，你更倾向？',
    options: [{ label: 'A', text: '列举利弊、逻辑说服', value: 'T' },
              { label: 'B', text: '照顾大家的感受、寻找折中方案', value: 'F' }] },
  { id: 21, dimension: 'TF', text: '评价一次旅行好坏的标准是？',
    options: [{ label: 'A', text: '完成了多少计划、性价比如何、效率高不高', value: 'T' },
              { label: 'B', text: '是否有感动的瞬间、是否增进了感情', value: 'F' }] },

  // JP维度 (22-28)
  { id: 22, dimension: 'JP', text: '你对旅行计划的态度？',
    options: [{ label: 'A', text: '必须提前做好详细计划，越细越好', value: 'J' },
              { label: 'B', text: '有个大致方向就行，到了再说', value: 'P' }] },
  { id: 23, dimension: 'JP', text: '旅行中的时间安排？',
    options: [{ label: 'A', text: '按时间表执行，精确到小时', value: 'J' },
              { label: 'B', text: '随缘，觉得好玩就多待会儿', value: 'P' }] },
  { id: 24, dimension: 'JP', text: '行程临时被改变（如景点关门），你的反应？',
    options: [{ label: 'A', text: '有点焦虑，赶紧找备选方案', value: 'J' },
              { label: 'B', text: '无所谓，也许意外带来惊喜', value: 'P' }] },
  { id: 25, dimension: 'JP', text: '你觉得旅行的理想节奏是？',
    options: [{ label: 'A', text: '充实高效，一天能看多少看多少', value: 'J' },
              { label: 'B', text: '留足弹性，想停就停想走就走', value: 'P' }] },
  { id: 26, dimension: 'JP', text: '你出发前的状态？',
    options: [{ label: 'A', text: '酒店、门票、餐厅都预订好了', value: 'J' },
              { label: 'B', text: '只订了机票和第一晚住宿', value: 'P' }] },
  { id: 27, dimension: 'JP', text: '旅行中你更怕什么？',
    options: [{ label: 'A', text: '计划被打乱、行程失控', value: 'J' },
              { label: 'B', text: '被固定安排束缚、没有自由', value: 'P' }] },
  { id: 28, dimension: 'JP', text: '回来后你如何总结旅行？',
    options: [{ label: 'A', text: '复盘行程，记录哪些计划完成了', value: 'J' },
              { label: 'B', text: '回味最有趣的意外和发现', value: 'P' }] },
]

// ============================================================
// 维度配置
// ============================================================
export const DIMENSIONS = [
  { code: 'EI', name: '外向(E) - 内向(I)', leftOption: 'E', rightOption: 'I', leftLabel: '外向', rightLabel: '内向',
    description: '决定旅行中的社交需求和能量来源' },
  { code: 'SN', name: '实感(S) - 直觉(N)', leftOption: 'S', rightOption: 'N', leftLabel: '实感', rightLabel: '直觉',
    description: '决定旅行中的体验关注点' },
  { code: 'TF', name: '思维(T) - 情感(F)', leftOption: 'T', rightOption: 'F', leftLabel: '思维', rightLabel: '情感',
    description: '决定旅行中的决策因素' },
  { code: 'JP', name: '判断(J) - 感知(P)', leftOption: 'J', rightOption: 'P', leftLabel: '判断', rightLabel: '感知',
    description: '决定旅行中的规划风格' },
]

export const VALID_MBTI_TYPES = [
  'ISTJ','ISFJ','INFJ','INTJ',
  'ISTP','ISFP','INFP','INTP',
  'ESTP','ESFP','ENFP','ENTP',
  'ESTJ','ESFJ','ENFJ','ENTJ',
]

// ============================================================
// 16种MBTI旅行偏好画像
// ============================================================
export const MBTI_PROFILES = {
  ISTJ: {
    mbti_type: 'ISTJ', mbti_type_name: '检查官',
    pace: '精确规划型', social: '独立独行型', planning_style: '时刻表驱动',
    destination_types: ['历史古迹', '知名景点', '文化名城'],
    accommodation: ['连锁商务酒店', '高评分品牌酒店', '标准化住宿'],
    activities: ['博物馆参观', '古迹考察', '城市漫步', '文化讲座'],
    decision_factors: ['时间效率', '性价比', '可预期性'],
    aversion: ['即兴安排', '无预约场所', '混乱环境'],
    travel_style: '严谨实用打卡型 — 提前规划每个时段，追求确定性和效率',
    tips: '建议提前预订热门景点门票和餐厅，准备备选方案应对突发状况。选择标准化住宿确保可预期体验。',
    core_vector: [2, 1, 2], interest_vector: { '历史文化': 5, '建筑': 4, '美食': 3 },
    structure_vector: { time_elasticity: 1, social_ratio: 1, sense_focus: '视觉/味觉' },
  },
  ISFJ: {
    mbti_type: 'ISFJ', mbti_type_name: '守护者',
    pace: '半日规划型', social: '温和陪伴型', planning_style: '贴心安排',
    destination_types: ['安静小镇', '温泉度假', '田园乡村'],
    accommodation: ['温馨民宿', '家庭旅馆', '禅意客栈'],
    activities: ['手作工坊', '温泉疗愈', '生态步道', '烹饪课程'],
    decision_factors: ['舒适感', '安全性', '氛围温暖'],
    aversion: ['高压力环境', '冒险活动', '冷漠服务'],
    travel_style: '贴心陪伴治愈型 — 为同行者考虑周到，追求温暖舒适的旅行体验',
    tips: '选择安静治愈的目的地，提前准备小药品和零食，多安排温泉和手作等慢节奏活动。',
    core_vector: [1, 2, 2], interest_vector: { '手作': 5, '温泉': 4, '美食': 4 },
    structure_vector: { time_elasticity: 2, social_ratio: 2, sense_focus: '触觉/味觉' },
  },
  INFJ: {
    mbti_type: 'INFJ', mbti_type_name: '提倡者',
    pace: '半日规划型', social: '温和陪伴型', planning_style: '灵性规划',
    destination_types: ['灵性场所', '古寺名山', '徒步秘境'],
    accommodation: ['禅意客栈', '山林隐居', '星空民宿'],
    activities: ['禅修冥想', '日出观景', '文化深度游', '哲学对话'],
    decision_factors: ['内在意义', '精神共鸣', '氛围深度'],
    aversion: ['浮躁景点', '表面打卡', '嘈杂环境'],
    travel_style: '灵性治愈探索型 — 追求深层意义和精神共鸣，在旅行中寻找内心的答案',
    tips: '安排灵性场所参访，预留独处冥想时间，选择有故事的目的地，避免赶场式旅游。',
    core_vector: [2, 1, 1], interest_vector: { '灵性': 5, '文化': 5, '哲学': 4 },
    structure_vector: { time_elasticity: 2, social_ratio: 1, sense_focus: '听觉/视觉' },
  },
  INTJ: {
    mbti_type: 'INTJ', mbti_type_name: '建筑师',
    pace: '精确规划型', social: '独立独行型', planning_style: '战略规划',
    destination_types: ['深度研究地', '冷门遗址', '天文台'],
    accommodation: ['设计感酒店', '带书房住宿', '安静高端'],
    activities: ['天文观测', '古建筑研究', '博物馆深度', '产业考察'],
    decision_factors: ['知识密度', '独处空间', '效率最优'],
    aversion: ['群体活动', '热门景点', '无意义社交'],
    travel_style: '独自深度考察型 — 用战略眼光规划旅行，追求知识密度和独处思考空间',
    tips: '选择人少可控的目的地，安排独立探索时间，住带书房的酒店，可进行商务与旅行结合。',
    core_vector: [2, 1, 2], interest_vector: { '科学': 5, '建筑': 5, '历史': 4 },
    structure_vector: { time_elasticity: 1, social_ratio: 1, sense_focus: '视觉' },
  },
  ISTP: {
    mbti_type: 'ISTP', mbti_type_name: '鉴赏家',
    pace: '即兴驱动型', social: '独立独行型', planning_style: '随性操作',
    destination_types: ['户外探险地', '攀岩场', '水域'],
    accommodation: ['露营', '简单住宿', '方便出发的落脚点'],
    activities: ['攀岩', '潜水', '越野', '骑行', '野外求生'],
    decision_factors: ['实操性', '身体挑战', '工具体验'],
    aversion: ['理论讲解', '被动观光', '过度规划'],
    travel_style: '实操冒险独行型 — 用双手和身体探索世界，追求真实可操作的体验',
    tips: '安排户外极限活动，准备运动装备，保持行程弹性可随时调整，独自行动效率更高。',
    core_vector: [3, 1, 1], interest_vector: { '极限运动': 5, '户外': 5, '机械': 3 },
    structure_vector: { time_elasticity: 3, social_ratio: 1, sense_focus: '触觉' },
  },
  ISFP: {
    mbti_type: 'ISFP', mbti_type_name: '探险家',
    pace: '愿望清单型', social: '温和陪伴型', planning_style: '美学随性',
    destination_types: ['艺术区', '稻田花海', '自然风光'],
    accommodation: ['文艺民宿', '带画室住宿', '花园庭院'],
    activities: ['写生', '摄影', '逛艺术展', '深夜小酒馆', '音乐体验'],
    decision_factors: ['美学价值', '创作空间', '感官享受'],
    aversion: ['标准化连锁', '粗暴审美', '过度商业化'],
    travel_style: '美学创作漫游型 — 追求美的体验，在旅行中寻找创作灵感和感官享受',
    tips: '选择有美学价值的目的地，带画具或相机，安排充足创作时间，住有艺术氛围的民宿。',
    core_vector: [2, 1, 1], interest_vector: { '艺术': 5, '自然': 4, '音乐': 4 },
    structure_vector: { time_elasticity: 3, social_ratio: 2, sense_focus: '视觉/听觉' },
  },
  INFP: {
    mbti_type: 'INFP', mbti_type_name: '调停者',
    pace: '愿望清单型', social: '温和陪伴型', planning_style: '诗意漫游',
    destination_types: ['浪漫秘境', '无人小路', '文学小镇'],
    accommodation: ['有故事的民宿', '湖边小屋', '书屋住宿'],
    activities: ['写旅行日记', '观日出日落', '逛书店', '与当地人深度对话'],
    decision_factors: ['内心共鸣', '诗意氛围', '真实性'],
    aversion: ['嘈杂景点', '被迫社交', '走马观花'],
    travel_style: '浪漫诗意漫游型 — 在旅行中寻找灵魂的共鸣，用诗意感受世界的美好',
    tips: '选择有诗意和故事的目的地，预留独处写作时间，与当地人深度交流，慢节奏感受。',
    core_vector: [1, 1, 1], interest_vector: { '文学': 5, '浪漫': 5, '灵性': 4 },
    structure_vector: { time_elasticity: 3, social_ratio: 1, sense_focus: '听觉/触觉' },
  },
  INTP: {
    mbti_type: 'INTP', mbti_type_name: '逻辑学家',
    pace: '即兴驱动型', social: '独立独行型', planning_style: '探索驱动',
    destination_types: ['天文台', '博物馆', '古建筑群'],
    accommodation: ['带高速网络的酒店', '安静空间', '近学术区'],
    activities: ['博物馆深度研究', '天文观测', '与当地人讨论文化', '探索理论'],
    decision_factors: ['知识密度', '思考空间', '信息量'],
    aversion: ['重复体验', '肤浅活动', '强制社交'],
    travel_style: '知识探索独行型 — 用好奇心驱动旅行，追求信息密度和思考的深度',
    tips: '选择知识密度高的目的地，住有工作空间的酒店，保持行程弹性以深入探索感兴趣的领域。',
    core_vector: [2, 1, 1], interest_vector: { '科学': 5, '文化': 4, '历史': 4 },
    structure_vector: { time_elasticity: 3, social_ratio: 1, sense_focus: '视觉' },
  },
  ESTP: {
    mbti_type: 'ESTP', mbti_type_name: '企业家',
    pace: '即兴驱动型', social: '社交猎手型', planning_style: '即兴行动',
    destination_types: ['刺激活动地', '快艇码头', '越野路线'],
    accommodation: ['社交型青旅', '市中心活力区', '网红民宿'],
    activities: ['快艇', '越野车', '深夜烧烤', '冲浪', '即兴组队'],
    decision_factors: ['刺激感', '即时反馈', '速度感'],
    aversion: ['枯燥等待', '过多规划', '被动安排'],
    travel_style: '刺激社交行动型 — 追求即时的感官刺激和社交快感，说走就走',
    tips: '安排高刺激户外活动，住社交氛围好的住宿，随时准备即兴出发，组队玩更嗨。',
    core_vector: [3, 3, 2], interest_vector: { '极限运动': 5, '社交': 5, '美食': 3 },
    structure_vector: { time_elasticity: 3, social_ratio: 3, sense_focus: '触觉/视觉' },
  },
  ESFP: {
    mbti_type: 'ESFP', mbti_type_name: '表演者',
    pace: '即兴驱动型', social: '社交猎手型', planning_style: '享乐随性',
    destination_types: ['夜市', '度假海岛', '潮流城市'],
    accommodation: ['网红民宿', '带泳池酒店', '市中心热闹区'],
    activities: ['逛街拍照', '酒吧', '旅拍', '夜市', '派对'],
    decision_factors: ['享乐', '拍照好看', '热闹氛围'],
    aversion: ['无聊安静', '没有夜生活', '不时尚的地方'],
    travel_style: '热闹享乐派对型 — 追求即时的快乐和精彩的体验，让旅行成为一场派对',
    tips: '选择热闹有夜生活的目的地，住网红民宿拍照，安排丰富的社交活动，享受每一刻。',
    core_vector: [1, 3, 2], interest_vector: { '社交': 5, '美食': 4, '时尚': 4 },
    structure_vector: { time_elasticity: 3, social_ratio: 3, sense_focus: '视觉/味觉' },
  },
  ENFP: {
    mbti_type: 'ENFP', mbti_type_name: '竞选者',
    pace: '愿望清单型', social: '社交猎手型', planning_style: '灵感驱动',
    destination_types: ['未知小众地', '当地推荐', '有故事的农场'],
    accommodation: ['特色民宿', '当地人家里', '惊喜住宿'],
    activities: ['即兴探索', '当地人推荐', '故事收集', '随机路线', '创意活动'],
    decision_factors: ['新奇感', '故事性', '人脉扩展'],
    aversion: ['重复无聊', '死板计划', '没有惊喜'],
    travel_style: '即兴社交探险型 — 用热情和好奇心驱动旅行，在未知中发现精彩故事',
    tips: '跟随灵感和直觉，多和当地人聊天获取隐藏推荐，住有特色的民宿，保持行程弹性。',
    core_vector: [2, 3, 1], interest_vector: { '人文': 5, '探险': 4, '故事': 5 },
    structure_vector: { time_elasticity: 3, social_ratio: 3, sense_focus: '听觉/视觉' },
  },
  ENTP: {
    mbti_type: 'ENTP', mbti_type_name: '辩论家',
    pace: '即兴驱动型', social: '辩论交流型', planning_style: '思辨驱动',
    destination_types: ['废墟', '创意市集', '非主流场所'],
    accommodation: ['设计酒店', '有话题的住宿', '市中心'],
    activities: ['文化讨论', '探索非主流', '与当地人辩论', '创意市集', '独立书店'],
    decision_factors: ['新奇度', '可辩论性', '观点碰撞'],
    aversion: ['陈词滥调', '人云亦云', '无思考的打卡'],
    travel_style: '思辨探索辩论型 — 在旅行中寻找不同观点的碰撞，探索非主流文化',
    tips: '选择非主流目的地，多与当地人深入讨论，逛创意市集和独立书店，保持开放心态。',
    core_vector: [2, 2, 1], interest_vector: { '思辨': 5, '文化': 5, '创新': 4 },
    structure_vector: { time_elasticity: 3, social_ratio: 2, sense_focus: '听觉' },
  },
  ESTJ: {
    mbti_type: 'ESTJ', mbti_type_name: '总经理',
    pace: '精确规划型', social: '组织者型', planning_style: '团队高效',
    destination_types: ['知名景区', '环海路线', '经典打卡'],
    accommodation: ['品牌连锁', '高评分酒店', '标准化设施'],
    activities: ['一日环游', '景区打卡', '团队组织活动', '经典线路'],
    decision_factors: ['效率', '可量化成果', '团队秩序'],
    aversion: ['浪费时间', '计划外变数', '低效安排'],
    travel_style: '高效团体打卡型 — 以领导力组织高效旅行，确保每个计划都完美执行',
    tips: '提前规划详细时刻表，预订所有门票和餐厅，组织团队分工，准备Plan B应对突发。',
    core_vector: [2, 2, 2], interest_vector: { '经典': 4, '效率': 5, '团队': 4 },
    structure_vector: { time_elasticity: 1, social_ratio: 2, sense_focus: '视觉/味觉' },
  },
  ESFJ: {
    mbti_type: 'ESFJ', mbti_type_name: '执政官',
    pace: '半日规划型', social: '组织者型', planning_style: '温馨组织',
    destination_types: ['亲子乐园', '工坊体验', '团建胜地'],
    accommodation: ['家庭民宿', '大客厅住宿', '适合聚会的空间'],
    activities: ['扎染工坊', '集体聚餐', '团队游戏', '拍集体照', '手作体验'],
    decision_factors: ['团体和谐', '共享体验', '照顾他人'],
    aversion: ['冲突', '有人不开心', '冷漠氛围'],
    travel_style: '温馨团体组织型 — 用关怀和组织力让每个人都开心，创造共同的美好回忆',
    tips: '安排适合所有人的活动，准备零食药品等必需品，住公共空间大的民宿，随时照顾队友。',
    core_vector: [1, 3, 2], interest_vector: { '手作': 4, '美食': 4, '社交': 5 },
    structure_vector: { time_elasticity: 2, social_ratio: 3, sense_focus: '味觉/触觉' },
  },
  ENFJ: {
    mbti_type: 'ENFJ', mbti_type_name: '主人公',
    pace: '半日规划型', social: '组织者型', planning_style: '成长引导',
    destination_types: ['成长体验地', '文化名山', '读书会圣地'],
    accommodation: ['家庭民宿', '大客厅住宿', '文化型住宿'],
    activities: ['登山挑战', '读书分享', '故事会', '志愿服务', '文化学习'],
    decision_factors: ['成长意义', '共同进步', '情感联结'],
    aversion: ['无意义消磨', '自私行为', '负能量'],
    travel_style: '成长引导激励型 — 在旅行中引导他人成长，创造有意义的人生体验',
    tips: '安排有挑战性和成长意义的活动，组织分享和讨论环节，鼓励每个人突破舒适区。',
    core_vector: [2, 3, 1], interest_vector: { '成长': 5, '文化': 4, '社交': 4 },
    structure_vector: { time_elasticity: 2, social_ratio: 3, sense_focus: '听觉/视觉' },
  },
  ENTJ: {
    mbti_type: 'ENTJ', mbti_type_name: '指挥官',
    pace: '精确规划型', social: '组织者型', planning_style: '战略扩张',
    destination_types: ['商务中心', '产业考察地', '高端目的地'],
    accommodation: ['高端度假村', '带办公区酒店', '品质住宿'],
    activities: ['产业调研', '商务约见', '高端体验', '战略规划', '人脉拓展'],
    decision_factors: ['战略价值', '人脉拓展', '效率最大化'],
    aversion: ['低端体验', '浪费时间', '无目的安排'],
    travel_style: '战略商务拓展型 — 以战略眼光规划旅行，兼顾效率、人脉和高端体验',
    tips: '将商务和旅行结合，提前安排商务会面，住有办公设施的酒店，高效利用每一分钟。',
    core_vector: [2, 2, 3], interest_vector: { '商务': 5, '战略': 5, '品质': 4 },
    structure_vector: { time_elasticity: 1, social_ratio: 2, sense_focus: '视觉' },
  },
}

// ============================================================
// 维度描述
// ============================================================
export const DIMENSION_DESCRIPTIONS = {
  EI: {
    E: { name: '外向型(E)', desc: '你从社交互动中获取能量，喜欢热闹的环境和团体活动。旅行中你渴望认识新朋友，参与当地聚会，每晚都需要社交来充电。', color: '#f59e0b' },
    I: { name: '内向型(I)', desc: '你从独处中获取能量，需要安静的私人空间来恢复精力。旅行中你偏好小团体或独行，享受深度体验和内心沉淀。', color: '#6366f1' },
  },
  SN: {
    S: { name: '实感型(S)', desc: '你关注具体的、可感知的细节，追求实实在在的感官体验。旅行中你重视美食、舒适度、拍照点等具体信息，相信亲身体验。', color: '#10b981' },
    N: { name: '直觉型(N)', desc: '你关注抽象的意义和可能性，追求深层的灵感和联想。旅行中你被文化隐喻、传说故事、未来感所吸引，愿意为独特意义多付50%预算。', color: '#8b5cf6' },
  },
  TF: {
    T: { name: '思维型(T)', desc: '你基于逻辑和客观分析做决策，注重效率、性价比和理性判断。旅行中你优先考虑时间效率、路线合理性和预算控制。', color: '#3b82f6' },
    F: { name: '情感型(F)', desc: '你基于价值观和情感做决策，注重氛围、关系和他人感受。旅行中你优先考虑是否开心、氛围是否舒适、是否增进了感情。', color: '#ec4899' },
  },
  JP: {
    J: { name: '判断型(J)', desc: '你喜欢提前规划、确定性和可预见的行程。你会花3倍时间做攻略，生成精确到30分钟的时刻表，行程变更率比P型低42%。', color: '#f97316' },
    P: { name: '感知型(P)', desc: '你享受弹性和即兴，喜欢留白和不确定性。你的行程只有优先级清单，不绑定时间，1-3小时弹性随时可调，意外反而让你兴奋。', color: '#14b8a6' },
  },
}

// ============================================================
// 核心分析函数
// ============================================================

/**
 * 校验MBTI类型字符串合法性
 */
export function validateMbtiType(type) {
  if (!type || typeof type !== 'string') return { valid: false, error: '请输入MBTI类型' }
  const normalized = type.toUpperCase().trim()
  if (!VALID_MBTI_TYPES.includes(normalized)) {
    return { valid: false, error: `"${normalized}" 不是合法的MBTI类型，请从16种标准类型中选择` }
  }
  return { valid: true, normalized }
}

/**
 * 根据问卷回答计算MBTI类型及旅行偏好
 * @param {Object} responses - 问卷回答 { 1: 'A', 2: 'B', ... }
 * @returns {Object} 分析结果
 */
export function analyzeByResponses(responses) {
  if (!responses || Object.keys(responses).length === 0) {
    return { success: false, error: '问卷回答不能为空' }
  }

  // 统计各维度得分
  const dimScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
  const dimTotal = { EI: 0, SN: 0, TF: 0, JP: 0 }

  const questionMap = {}
  for (const q of QUESTIONS) questionMap[q.id] = q

  for (const [qId, choice] of Object.entries(responses)) {
    const id = Number(qId)
    const q = questionMap[id]
    if (!q) continue
    const label = String(choice).toUpperCase()
    const opt = q.options.find(o => o.label === label)
    if (opt) {
      dimScores[opt.value]++
      dimTotal[q.dimension]++
    }
  }

  // 计算各维度倾向和置信度
  const dimensions = {}
  const dimPairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']]
  const dimCodes = ['EI', 'SN', 'TF', 'JP']

  for (let i = 0; i < dimPairs.length; i++) {
    const [left, right] = dimPairs[i]
    const code = dimCodes[i]
    const total = dimTotal[code]
    const leftScore = dimScores[left]
    const rightScore = dimScores[right]

    if (total === 0) {
      dimensions[code] = { dominant: left, leftPercent: 50, rightPercent: 50, confidence: 0 }
    } else {
      const leftPercent = Math.round((leftScore / total) * 100)
      const rightPercent = 100 - leftPercent
      const dominant = leftPercent >= rightPercent ? left : right
      const confidence = Math.abs(leftPercent - rightPercent) / 100
      dimensions[code] = { dominant, leftPercent, rightPercent, confidence, leftScore, rightScore, total }
    }
  }

  // 确定MBTI类型
  const mbtiType = dimensions.EI.dominant + dimensions.SN.dominant + dimensions.TF.dominant + dimensions.JP.dominant

  // 计算整体置信度
  const answerCount = Object.keys(responses).length
  const coverageConfidence = Math.min(1, answerCount / 28)
  const dimConfidenceAvg = dimCodes.reduce((sum, c) => sum + (dimensions[c].confidence || 0), 0) / 4
  const mbtiConfidence = Math.round((coverageConfidence * 0.4 + dimConfidenceAvg * 0.6) * 100) / 100

  // 获取画像数据
  const profile = MBTI_PROFILES[mbtiType]
  if (!profile) {
    return { success: false, error: `未找到 ${mbtiType} 类型的画像数据` }
  }

  return {
    success: true,
    data: {
      mbtiType,
      mbtiTypeName: profile.mbti_type_name,
      mbtiConfidence,
      answerCount,
      dimensions,
      ...buildProfileData(profile),
    }
  }
}

/**
 * 根据MBTI类型直接生成旅行偏好画像
 * @param {string} mbtiType - MBTI四字母类型
 * @returns {Object} 分析结果
 */
export function analyzeByType(mbtiType) {
  const validation = validateMbtiType(mbtiType)
  if (!validation.valid) {
    return { success: false, error: validation.error }
  }

  const normalized = validation.normalized
  const profile = MBTI_PROFILES[normalized]
  if (!profile) {
    return { success: false, error: `未找到 ${normalized} 类型的画像数据` }
  }

  // 直接输入类型时，维度按典型特征设置
  const dimPairs = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']]
  const dimCodes = ['EI', 'SN', 'TF', 'JP']
  const dimensions = {}
  for (let i = 0; i < 4; i++) {
    const letter = normalized[i]
    const [left, right] = dimPairs[i]
    const isLeft = letter === left
    dimensions[dimCodes[i]] = {
      dominant: letter,
      leftPercent: isLeft ? 70 : 30,
      rightPercent: isLeft ? 30 : 70,
      confidence: 0.4,
    }
  }

  return {
    success: true,
    data: {
      mbtiType: normalized,
      mbtiTypeName: profile.mbti_type_name,
      mbtiConfidence: 0.65,
      answerCount: 0,
      inputMode: 'direct',
      dimensions,
      ...buildProfileData(profile),
    }
  }
}

/**
 * 构建画像展示数据
 */
function buildProfileData(profile) {
  return {
    pace: profile.pace,
    social: profile.social,
    planningStyle: profile.planning_style,
    destinationTypes: profile.destination_types,
    accommodation: profile.accommodation,
    activities: profile.activities,
    decisionFactors: profile.decision_factors,
    aversion: profile.aversion,
    travelStyle: profile.travel_style,
    tips: profile.tips,
  }
}

/**
 * 获取维度列表（用于分类筛选）
 */
export function getDimensionList() {
  return ['全部', '外向-内向', '实感-直觉', '思维-情感', '判断-感知']
}

/**
 * 根据维度筛选题目
 */
export function getQuestionsByDimension(dimension) {
  const dimMap = {
    '外向-内向': 'EI',
    '实感-直觉': 'SN',
    '思维-情感': 'TF',
    '判断-感知': 'JP',
  }
  const dimCode = dimMap[dimension]
  if (!dimCode) return QUESTIONS
  return QUESTIONS.filter(q => q.dimension === dimCode)
}
