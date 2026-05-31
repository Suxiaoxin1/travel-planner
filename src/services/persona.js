/**
 * 人物画像分析前端服务
 * 支持后端API调用和纯前端计算两种模式
 * 基于问卷回答计算冒险/社交/预算三维画像
 */

// API配置
const API_BASE_URL = '/api'

/**
 * 调用后端API进行分析
 * @param {Object} answers - 问卷回答
 * @returns {Promise<Object>} 分析结果
 */
async function analyzeViaAPI(answers) {
  try {
    const response = await fetch(`${API_BASE_URL}/persona/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers })
    })
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API调用失败，降级到本地计算:', error)
    // 降级到本地计算
    return analyze(answers)
  }
}

/**
 * 获取题目列表（从后端）
 * @returns {Promise<Array>} 题目列表
 */
async function fetchQuestionsFromAPI() {
  try {
    const response = await fetch(`${API_BASE_URL}/persona/questions`)
    if (!response.ok) {
      throw new Error(`获取题目失败: ${response.status}`)
    }
    const result = await response.json()
    return result.success ? result.data : QUESTIONS
  } catch (error) {
    console.error('API获取题目失败，使用本地题目:', error)
    return QUESTIONS
  }
}

// ============================================================
// 100道问卷题目数据
// ============================================================
export const QUESTIONS = [
  { id: 1, category: '出行决策', text: '周末突然多出两天假期，你第一反应是？',
    options: [{ label: 'A', text: '宅家刷剧打游戏', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '去隔壁城市吃顿好的', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '立刻订机票去一个没听过名字的小镇', scores: { adventure: 2, social: 2, budget: 2 } }] },
  { id: 2, category: '生活方式', text: '你更想在哪类民宿醒来？',
    options: [{ label: 'A', text: '市中心干净快捷酒店', scores: { adventure: 0, social: 1, budget: 0 } },
              { label: 'B', text: '山间玻璃屋，窗外是云海', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'C', text: '沙漠里的星空帐篷，没水没电', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 3, category: '消费行为', text: '点外卖时，你的决策核心是？',
    options: [{ label: 'A', text: '凑满减、免配送费', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '评分4.8以上，价格无所谓', scores: { adventure: 1, social: 1, budget: 2 } },
              { label: 'C', text: '没吃过的新奇菜系', scores: { adventure: 2, social: 1, budget: 1 } }] },
  { id: 4, category: '出行决策', text: '你理想的旅行纪念品是？',
    options: [{ label: 'A', text: '冰箱贴或明信片', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '当地手工艺品', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '捡的一块石头或一片叶子', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 5, category: '社交偏好', text: '如果必须和陌生人拼桌吃饭，你会？',
    options: [{ label: 'A', text: '低头快吃，尽快离开', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '礼貌微笑，简单聊天', scores: { adventure: 1, social: 2, budget: 1 } },
              { label: 'C', text: '主动拼单点一桌，边吃边玩酒令', scores: { adventure: 2, social: 2, budget: 2 } }] },
  { id: 6, category: '消费行为', text: '你更愿意花钱在？',
    options: [{ label: 'A', text: '免费景点+自带干粮', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '门票贵的国家公园', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'C', text: '米其林餐厅+直升机观光', scores: { adventure: 1, social: 1, budget: 2 } }] },
  { id: 7, category: '冒险倾向', text: '哪种旅行中的"意外"会让你最兴奋？',
    options: [{ label: 'A', text: '酒店免费升级套房', scores: { adventure: 0, social: 1, budget: 2 } },
              { label: 'B', text: '暴雨后出现的彩虹', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '迷路发现隐蔽瀑布', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 8, category: '社交偏好', text: '你组织朋友聚会时，通常？',
    options: [{ label: 'A', text: '只约最铁的1-2人', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '拉个6-8人的群，投票决定', scores: { adventure: 1, social: 2, budget: 1 } },
              { label: 'C', text: '直接包栋别墅，喊上所有人', scores: { adventure: 1, social: 2, budget: 2 } }] },
  { id: 9, category: '社交偏好', text: '你对"网红打卡点"的态度是？',
    options: [{ label: 'A', text: '坚决不去，人多又假', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'B', text: '路过可以拍张照', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '专门排队两小时也要去', scores: { adventure: 0, social: 2, budget: 1 } }] },
  { id: 10, category: '生活方式', text: '你的行李箱通常是？',
    options: [{ label: 'A', text: '一个20寸登机箱，轻装', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'B', text: '28寸大箱子，塞满各种可能', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'C', text: '两个托运箱，甚至快递行李', scores: { adventure: 0, social: 2, budget: 2 } }] },
  { id: 11, category: '出行决策', text: '如果有一周空闲，你更想去？',
    options: [{ label: 'A', text: '三亚五星级酒店躺平', scores: { adventure: 0, social: 1, budget: 2 } },
              { label: 'B', text: '成都街头吃三天+看熊猫', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '青海无人区骑行', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 12, category: '消费行为', text: '你最喜欢的交通方式是？',
    options: [{ label: 'A', text: '高铁二等座', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '自驾SUV', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'C', text: '商务舱或头等舱', scores: { adventure: 0, social: 1, budget: 2 } }] },
  { id: 13, category: '冒险倾向', text: '你如何看待"露营"？',
    options: [{ label: 'A', text: '受罪，不如住酒店', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '偶尔去设施完善的露营地', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '荒野求生式露营是我的最爱', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 14, category: '消费行为', text: '你选餐厅时，最看重的？',
    options: [{ label: 'A', text: '大众点评必吃榜', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '本地人排队的苍蝇馆子', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'C', text: '主厨桌、私人订制菜单', scores: { adventure: 0, social: 1, budget: 2 } }] },
  { id: 15, category: '社交偏好', text: '你更愿意和谁一起旅行？',
    options: [{ label: 'A', text: '自己一人', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '伴侣或一个死党', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '父母+孩子+亲戚一大家子', scores: { adventure: 0, social: 2, budget: 2 } }] },
  { id: 16, category: '冒险倾向', text: '面对一条"高难度徒步路线"，你的想法是？',
    options: [{ label: 'A', text: '看看别人发的视频就好', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '先练一个月体能再挑战', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '马上出发，到那再说', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 17, category: '出行决策', text: '你记忆中最棒的旅行经历，多半是？',
    options: [{ label: 'A', text: '睡到自然醒，海边发呆', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'B', text: '和当地人聊天学会做菜', scores: { adventure: 1, social: 2, budget: 1 } },
              { label: 'C', text: '经历了一次爆胎、暴雨、但看到了极光', scores: { adventure: 2, social: 1, budget: 0 } }] },
  { id: 18, category: '社交偏好', text: '你旅游住青旅的感受是？',
    options: [{ label: 'A', text: '从未住过，无法接受', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '学生时代住过，挺有意思', scores: { adventure: 1, social: 2, budget: 0 } },
              { label: 'C', text: '现在还会主动选择，喜欢交朋友', scores: { adventure: 2, social: 2, budget: 0 } }] },
  { id: 19, category: '风险态度', text: '你购买旅游保险的意愿？',
    options: [{ label: 'A', text: '从不买，浪费钱', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'B', text: '只买最基本的意外险', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '买最贵的，涵盖一切取消/医疗', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 20, category: '冒险倾向', text: '你喜欢哪种日出场景？',
    options: [{ label: 'A', text: '酒店阳台，穿着浴袍', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'B', text: '山顶观景台，有热咖啡', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '睡袋里探出头，帐篷外就是雪山', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 21, category: '风险态度', text: '如果旅行中丢手机，你会？',
    options: [{ label: 'A', text: '崩溃，立刻结束行程', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '去当地电子市场买个便宜的', scores: { adventure: 1, social: 1, budget: 0 } },
              { label: 'C', text: '正好，彻底享受无网络旅行', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 22, category: '出行决策', text: '你更愿意参加哪种一日游？',
    options: [{ label: 'A', text: '跟团大巴，景点全包', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '包车定制，只有你几个人', scores: { adventure: 1, social: 1, budget: 2 } },
              { label: 'C', text: '自己租摩托，随机乱逛', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 23, category: '消费行为', text: '你心中的"豪华"是？',
    options: [{ label: 'A', text: '五星酒店+米其林', scores: { adventure: 0, social: 0, budget: 2 } },
              { label: 'B', text: '私人飞机+管家', scores: { adventure: 0, social: 1, budget: 2 } },
              { label: 'C', text: '在无人岛有一栋别墅', scores: { adventure: 2, social: 0, budget: 2 } }] },
  { id: 24, category: '出行决策', text: '你对旅行攻略的态度？',
    options: [{ label: 'A', text: '必须精确到每分钟', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '定几个大目标，其他随机', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '完全不看，到了再说', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 25, category: '生活方式', text: '你更容易被哪种短视频吸引？',
    options: [{ label: 'A', text: '奢华酒店Room tour', scores: { adventure: 0, social: 0, budget: 2 } },
              { label: 'B', text: '野外求生/极限运动', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'C', text: '一群人跳伞、聚餐、跳水', scores: { adventure: 1, social: 2, budget: 1 } }] },
  { id: 26, category: '社交偏好', text: '你想体验的"文化"是？',
    options: [{ label: 'A', text: '博物馆、歌剧、历史遗迹', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'B', text: '当地菜市场、集市、手工作坊', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '部落仪式、萨满、原始舞蹈', scores: { adventure: 2, social: 2, budget: 0 } }] },
  { id: 27, category: '冒险倾向', text: '你更喜欢哪种动物互动？',
    options: [{ label: 'A', text: '动物园喂长颈鹿', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '斯里兰卡骑大象', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '加拉帕戈斯与海狮游泳', scores: { adventure: 2, social: 0, budget: 2 } }] },
  { id: 28, category: '消费行为', text: '如果旅行超预算，你会？',
    options: [{ label: 'A', text: '削减购物和餐饮支出', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '用信用卡透支一下', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '根本不在乎，开心就好', scores: { adventure: 0, social: 1, budget: 2 } }] },
  { id: 29, category: '出行决策', text: '你理想的旅行时长是？',
    options: [{ label: 'A', text: '3天以内，久了累', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '7-10天，刚好', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '1个月以上，流浪式', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 30, category: '社交偏好', text: '你对"纪念照"的要求是？',
    options: [{ label: 'A', text: '必须所有人看镜头微笑', scores: { adventure: 0, social: 1, budget: 0 } },
              { label: 'B', text: '抓拍自然瞬间', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '不拍照，只用眼睛记住', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 31, category: '冒险倾向', text: '你去游乐园必玩项目？',
    options: [{ label: 'A', text: '旋转木马', scores: { adventure: 0, social: 1, budget: 0 } },
              { label: 'B', text: '过山车', scores: { adventure: 2, social: 1, budget: 0 } },
              { label: 'C', text: '鬼屋', scores: { adventure: 2, social: 2, budget: 0 } }] },
  { id: 32, category: '生活方式', text: '如果可以选择超能力，你要？',
    options: [{ label: 'A', text: '瞬间移动', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'B', text: '点石成金', scores: { adventure: 0, social: 0, budget: 2 } },
              { label: 'C', text: '读心术', scores: { adventure: 1, social: 2, budget: 0 } }] },
  { id: 33, category: '风险态度', text: '旅途中遇到哪种情况你最不在意？',
    options: [{ label: 'A', text: '排队等候', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '下雨', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '手机没信号', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 34, category: '消费行为', text: '你选飞机座位偏好？',
    options: [{ label: 'A', text: '靠窗，看风景', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'B', text: '过道，方便走动', scores: { adventure: 0, social: 1, budget: 0 } },
              { label: 'C', text: '商务舱任何座位', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 35, category: '消费行为', text: '你理想中的早餐是？',
    options: [{ label: 'A', text: '酒店自助，种类丰富', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '路边摊豆浆油条', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '房间送餐，香槟配班尼迪克蛋', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 36, category: '社交偏好', text: '你更愿意学习哪种技能？',
    options: [{ label: 'A', text: '野外生火搭帐篷', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'B', text: '多国语言快速交流', scores: { adventure: 1, social: 2, budget: 0 } },
              { label: 'C', text: '摄影剪辑', scores: { adventure: 0, social: 1, budget: 1 } }] },
  { id: 37, category: '风险态度', text: '你对"未知恐惧"的态度？',
    options: [{ label: 'A', text: '尽量避开', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '有一定心理准备再尝试', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '享受未知带来的肾上腺素', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 38, category: '冒险倾向', text: '你更爱哪种自然景观？',
    options: [{ label: 'A', text: '热带海滩，椰林树影', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '温带森林，蘑菇小溪', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '极地冰川，暴风雪', scores: { adventure: 2, social: 0, budget: 2 } }] },
  { id: 39, category: '消费行为', text: '你如何对待旅游景点的"宰客"？',
    options: [{ label: 'A', text: '据理力争，甚至报警', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '忍了，下次不来', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '反正有钱，无所谓', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 40, category: '生活方式', text: '你更愿意体验哪种住宿？',
    options: [{ label: 'A', text: '胶囊旅馆', scores: { adventure: 0, social: 1, budget: 0 } },
              { label: 'B', text: '树屋', scores: { adventure: 2, social: 0, budget: 1 } },
              { label: 'C', text: '海底酒店', scores: { adventure: 1, social: 1, budget: 2 } }] },
  { id: 41, category: '生活方式', text: '你出门旅游必带的电子产品？',
    options: [{ label: 'A', text: '手机+充电宝', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '相机+无人机', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '笔记本电脑', scores: { adventure: 0, social: 1, budget: 1 } }] },
  { id: 42, category: '冒险倾向', text: '你喜欢运动型度假吗？',
    options: [{ label: 'A', text: '完全不喜欢', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '偶尔骑车、徒步', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '潜水、滑雪、冲浪每样都要', scores: { adventure: 2, social: 1, budget: 2 } }] },
  { id: 43, category: '消费行为', text: '你更愿意把钱花在？',
    options: [{ label: 'A', text: '交通', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'B', text: '住宿', scores: { adventure: 0, social: 0, budget: 2 } },
              { label: 'C', text: '吃喝', scores: { adventure: 1, social: 1, budget: 1 } }] },
  { id: 44, category: '冒险倾向', text: '你对"小众目的地"的定义是？',
    options: [{ label: 'A', text: '非热门但交通便利', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'B', text: '需要签证且语言不通', scores: { adventure: 2, social: 0, budget: 1 } },
              { label: 'C', text: '地图上找不到，要靠向导', scores: { adventure: 2, social: 0, budget: 2 } }] },
  { id: 45, category: '社交偏好', text: '如果遇到明星在隔壁桌吃饭，你会？',
    options: [{ label: 'A', text: '安静偷拍', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '上前要签名合影', scores: { adventure: 1, social: 2, budget: 0 } },
              { label: 'C', text: '请他一起喝一杯', scores: { adventure: 1, social: 2, budget: 2 } }] },
  { id: 46, category: '消费行为', text: '你更倾向的购物方式是？',
    options: [{ label: 'A', text: '免税店、奥特莱斯', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '当地跳蚤市场', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'C', text: '买手店、设计师品牌', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 47, category: '生活方式', text: '你想象中的"完美一天"包括？',
    options: [{ label: 'A', text: '读书、喝茶、看海', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'B', text: '爬山、野餐、夜晚篝火', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'C', text: '酒吧、夜店、凌晨散步', scores: { adventure: 1, social: 2, budget: 1 } }] },
  { id: 48, category: '社交偏好', text: '你更想和谁分享旅行故事？',
    options: [{ label: 'A', text: '发朋友圈', scores: { adventure: 0, social: 2, budget: 0 } },
              { label: 'B', text: '只跟家人说', scores: { adventure: 0, social: 1, budget: 0 } },
              { label: 'C', text: '写成游记，匿名发表', scores: { adventure: 1, social: 0, budget: 0 } }] },
  { id: 49, category: '消费行为', text: '你对"穷游"的看法是？',
    options: [{ label: 'A', text: '羡慕但做不到', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '年轻时的美好回忆', scores: { adventure: 1, social: 1, budget: 0 } },
              { label: 'C', text: '现在依然热衷', scores: { adventure: 2, social: 2, budget: 0 } }] },
  { id: 50, category: '风险态度', text: '你更怕哪种天气？',
    options: [{ label: 'A', text: '高温', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '暴雨', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '大雪封路', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 51, category: '社交偏好', text: '你愿意为看一场演唱会去另一个城市吗？',
    options: [{ label: 'A', text: '不会，太折腾', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '如果票价便宜可以', scores: { adventure: 1, social: 1, budget: 0 } },
              { label: 'C', text: '会，而且买最前排', scores: { adventure: 1, social: 2, budget: 2 } }] },
  { id: 52, category: '冒险倾向', text: '你旅行中更看重"体验"还是"舒适"？',
    options: [{ label: 'A', text: '舒适优先', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'B', text: '体验优先，舒适次要', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'C', text: '两者都要，不惜代价', scores: { adventure: 1, social: 0, budget: 2 } }] },
  { id: 53, category: '社交偏好', text: '你更喜欢哪种夜生活？',
    options: [{ label: 'A', text: '回酒店睡觉', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '逛夜市、吃小吃', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '酒吧、夜店、听live', scores: { adventure: 2, social: 2, budget: 1 } }] },
  { id: 54, category: '消费行为', text: '你会为了省钱坐红眼航班吗？',
    options: [{ label: 'A', text: '经常', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '偶尔', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '绝不会', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 55, category: '社交偏好', text: '你理想中的旅伴具备？',
    options: [{ label: 'A', text: '会拍照', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '能扛行李', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'C', text: '幽默风趣不抱怨', scores: { adventure: 1, social: 2, budget: 0 } }] },
  { id: 56, category: '风险态度', text: '你对"旅游保险理赔流程复杂"的态度？',
    options: [{ label: 'A', text: '所以不买', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '买最低档求心安', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'C', text: '买最贵的，理赔麻烦就麻烦', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 57, category: '冒险倾向', text: '你更想尝试？',
    options: [{ label: 'A', text: '开飞机体验', scores: { adventure: 2, social: 0, budget: 2 } },
              { label: 'B', text: '沙漠越野', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'C', text: '深海潜水', scores: { adventure: 2, social: 0, budget: 1 } }] },
  { id: 58, category: '生活方式', text: '你旅行中必做的"仪式感"是？',
    options: [{ label: 'A', text: '寄明信片回家', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '在当地纹个小图案', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'C', text: '住一次最贵的酒店', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 59, category: '生活方式', text: '你如何看待"旅行博主"？',
    options: [{ label: 'A', text: '羡慕，希望成为他们', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'B', text: '觉得他们太累', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'C', text: '只看攻略，不关注博主', scores: { adventure: 1, social: 0, budget: 0 } }] },
  { id: 60, category: '消费行为', text: '你更爱哪种水景？',
    options: [{ label: 'A', text: '无边泳池', scores: { adventure: 0, social: 1, budget: 2 } },
              { label: 'B', text: '天然瀑布', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'C', text: '温泉', scores: { adventure: 0, social: 1, budget: 1 } }] },
  { id: 61, category: '冒险倾向', text: '如果只能带三样东西去荒岛，你会选？',
    options: [{ label: 'A', text: '刀、打火石、渔网', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'B', text: '手机、充电宝、卫星电话', scores: { adventure: 1, social: 0, budget: 2 } },
              { label: 'C', text: '书、墨镜、防晒霜', scores: { adventure: 0, social: 0, budget: 1 } }] },
  { id: 62, category: '出行决策', text: '你更倾向于跟团游是因为？',
    options: [{ label: 'A', text: '省心不费脑', scores: { adventure: 0, social: 1, budget: 0 } },
              { label: 'B', text: '便宜', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'C', text: '安全', scores: { adventure: 0, social: 1, budget: 1 } }] },
  { id: 63, category: '消费行为', text: '你心中的"奢华"是体验一次？',
    options: [{ label: 'A', text: '太空旅游', scores: { adventure: 2, social: 0, budget: 2 } },
              { label: 'B', text: '南极邮轮', scores: { adventure: 1, social: 1, budget: 2 } },
              { label: 'C', text: '迪拜帆船酒店', scores: { adventure: 0, social: 1, budget: 2 } }] },
  { id: 64, category: '生活方式', text: '你旅行中会带多少套衣服？',
    options: [{ label: 'A', text: '两套轮换', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '一天一套拍照用', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'C', text: '根据天气和场景搭配', scores: { adventure: 1, social: 1, budget: 1 } }] },
  { id: 65, category: '社交偏好', text: '你更喜欢哪种就餐氛围？',
    options: [{ label: 'A', text: '安静、灯光暗', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'B', text: '热闹、可以大声聊天', scores: { adventure: 1, social: 2, budget: 1 } },
              { label: 'C', text: '户外、野餐垫', scores: { adventure: 2, social: 1, budget: 0 } }] },
  { id: 66, category: '风险态度', text: '你对"旅行中生病"的预案是？',
    options: [{ label: 'A', text: '自带一箱药', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '去当地医院', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '联系国际SOS', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 67, category: '冒险倾向', text: '你更想探索？',
    options: [{ label: 'A', text: '失落的玛雅文明', scores: { adventure: 2, social: 0, budget: 1 } },
              { label: 'B', text: '欧洲古堡', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '现代大都会', scores: { adventure: 0, social: 2, budget: 2 } }] },
  { id: 68, category: '消费行为', text: '你愿意为"网红酒店"花多少钱？',
    options: [{ label: 'A', text: '不超过300元', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '可以接受1000元', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '5000元以上也愿意', scores: { adventure: 0, social: 1, budget: 2 } }] },
  { id: 69, category: '消费行为', text: '你旅游中最大的开销通常是？',
    options: [{ label: 'A', text: '交通', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'B', text: '住宿', scores: { adventure: 0, social: 0, budget: 2 } },
              { label: 'C', text: '餐饮', scores: { adventure: 1, social: 1, budget: 1 } }] },
  { id: 70, category: '冒险倾向', text: '你对"冒险"的定义是？',
    options: [{ label: 'A', text: '吃没吃过的食物', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'B', text: '和陌生人搭讪', scores: { adventure: 0, social: 2, budget: 0 } },
              { label: 'C', text: '跳伞/蹦极', scores: { adventure: 2, social: 0, budget: 2 } }] },
  { id: 71, category: '出行决策', text: '你更偏爱哪种纪念品？',
    options: [{ label: 'A', text: '可食用', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'B', text: '可穿戴', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'C', text: '可讲述故事', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 72, category: '社交偏好', text: '你如何对待旅行中的"艳遇"可能？',
    options: [{ label: 'A', text: '不期待也不拒绝', scores: { adventure: 0, social: 1, budget: 0 } },
              { label: 'B', text: '会主动创造机会', scores: { adventure: 1, social: 2, budget: 0 } },
              { label: 'C', text: '顺其自然，不强求', scores: { adventure: 1, social: 1, budget: 0 } }] },
  { id: 73, category: '社交偏好', text: '你愿意尝试"沙发客"吗？',
    options: [{ label: 'A', text: '不安全，绝不', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '只在信任的圈子', scores: { adventure: 1, social: 1, budget: 0 } },
              { label: 'C', text: '经常这样旅行', scores: { adventure: 2, social: 2, budget: 0 } }] },
  { id: 74, category: '冒险倾向', text: '你更期待哪种日出？',
    options: [{ label: 'A', text: '云海之上', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'B', text: '城市天际线', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'C', text: '冰湖倒影', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 75, category: '出行决策', text: '你选择目的地时，最优先考虑？',
    options: [{ label: 'A', text: '美食', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'B', text: '拍照好看', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'C', text: '有挑战性', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 76, category: '社交偏好', text: '你旅行中会喝醉吗？',
    options: [{ label: 'A', text: '从不', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '微醺', scores: { adventure: 1, social: 1, budget: 1 } },
              { label: 'C', text: '经常，开心最重要', scores: { adventure: 2, social: 2, budget: 1 } }] },
  { id: 77, category: '生活方式', text: '你更爱哪种建筑风格？',
    options: [{ label: 'A', text: '未来主义', scores: { adventure: 2, social: 0, budget: 2 } },
              { label: 'B', text: '古典主义', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'C', text: '乡土民居', scores: { adventure: 1, social: 0, budget: 0 } }] },
  { id: 78, category: '社交偏好', text: '你旅行中会带父母吗？',
    options: [{ label: 'A', text: '会，专门为他们规划', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '不会，太麻烦', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '会，但只去我熟悉的地方', scores: { adventure: 0, social: 1, budget: 0 } }] },
  { id: 79, category: '社交偏好', text: '你更愿意参加？',
    options: [{ label: 'A', text: '马拉松', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'B', text: '美食节', scores: { adventure: 0, social: 2, budget: 1 } },
              { label: 'C', text: '音乐节', scores: { adventure: 1, social: 2, budget: 2 } }] },
  { id: 80, category: '消费行为', text: '你对"旅行中省钱"的态度？',
    options: [{ label: 'A', text: '能省则省', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '该花就花', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '从不考虑省钱', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 81, category: '出行决策', text: '你理想中的旅行是？',
    options: [{ label: 'A', text: '全程有人安排', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '一半计划一半自由', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '完全随机流浪', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 82, category: '风险态度', text: '你更怕哪种动物？',
    options: [{ label: 'A', text: '蛇', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '蜘蛛', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '狼', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 83, category: '消费行为', text: '你更想体验？',
    options: [{ label: 'A', text: '热气球', scores: { adventure: 1, social: 1, budget: 2 } },
              { label: 'B', text: '滑翔伞', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'C', text: '直升机', scores: { adventure: 0, social: 0, budget: 2 } }] },
  { id: 84, category: '冒险倾向', text: '你旅游中会早起看日出吗？',
    options: [{ label: 'A', text: '不会，起不来', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '偶尔', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '每次必看', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 85, category: '消费行为', text: '你对"旅行中购物"的看法？',
    options: [{ label: 'A', text: '从不购物', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '只买特产', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '免税店买到手软', scores: { adventure: 0, social: 1, budget: 2 } }] },
  { id: 86, category: '社交偏好', text: '你更愿意和哪种性格的人旅行？',
    options: [{ label: 'A', text: '和我一样', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'B', text: '互补', scores: { adventure: 1, social: 1, budget: 0 } },
              { label: 'C', text: '随便，人多就好', scores: { adventure: 0, social: 2, budget: 0 } }] },
  { id: 87, category: '风险态度', text: '你如何处理旅行中的"迷路"？',
    options: [{ label: 'A', text: '慌张求助', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '用地图慢慢找', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'C', text: '享受迷路，探索未知', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 88, category: '生活方式', text: '你更喜欢哪种海滩？',
    options: [{ label: 'A', text: '白沙滩、玻璃水', scores: { adventure: 0, social: 1, budget: 1 } },
              { label: 'B', text: '黑沙滩、巨浪', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'C', text: '人山人海、水上项目', scores: { adventure: 0, social: 2, budget: 1 } }] },
  { id: 89, category: '出行决策', text: '你愿意为"淡季出行"请假吗？',
    options: [{ label: 'A', text: '不会，工作第一', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '可以，省钱人少', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '经常这么干', scores: { adventure: 2, social: 0, budget: 1 } }] },
  { id: 90, category: '冒险倾向', text: '你更想尝试？',
    options: [{ label: 'A', text: '火山口徒步', scores: { adventure: 2, social: 0, budget: 1 } },
              { label: 'B', text: '冰川行走', scores: { adventure: 2, social: 0, budget: 2 } },
              { label: 'C', text: '雨林滑索', scores: { adventure: 2, social: 1, budget: 1 } }] },
  { id: 91, category: '风险态度', text: '你对"旅游保险"的最低要求是？',
    options: [{ label: 'A', text: '意外医疗', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '航班延误', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '财物丢失', scores: { adventure: 0, social: 0, budget: 1 } }] },
  { id: 92, category: '生活方式', text: '你更喜欢哪种交通工具上的风景？',
    options: [{ label: 'A', text: '火车窗外', scores: { adventure: 1, social: 0, budget: 0 } },
              { label: 'B', text: '公交巴士', scores: { adventure: 0, social: 1, budget: 0 } },
              { label: 'C', text: '摩托后座', scores: { adventure: 2, social: 1, budget: 0 } }] },
  { id: 93, category: '社交偏好', text: '你如何看待"拼车旅行"？',
    options: [{ label: 'A', text: '不安全，拒绝', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '可以省钱且有趣', scores: { adventure: 1, social: 2, budget: 0 } },
              { label: 'C', text: '经常主动发起', scores: { adventure: 2, social: 2, budget: 0 } }] },
  { id: 94, category: '社交偏好', text: '你更愿意在旅行中？',
    options: [{ label: 'A', text: '认识新朋友', scores: { adventure: 1, social: 2, budget: 0 } },
              { label: 'B', text: '独处思考', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'C', text: '和家人腻在一起', scores: { adventure: 0, social: 1, budget: 1 } }] },
  { id: 95, category: '出行决策', text: '你更爱哪种旅行主题？',
    options: [{ label: 'A', text: '历史文化', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'B', text: '自然探险', scores: { adventure: 2, social: 0, budget: 1 } },
              { label: 'C', text: '城市潮流', scores: { adventure: 0, social: 2, budget: 2 } }] },
  { id: 96, category: '消费行为', text: '你如何选择住宿？',
    options: [{ label: 'A', text: '最低价', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '位置方便', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '风景绝美，价格其次', scores: { adventure: 1, social: 0, budget: 2 } }] },
  { id: 97, category: '风险态度', text: '你更怕哪种情况？',
    options: [{ label: 'A', text: '语言不通', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '没地方吃饭', scores: { adventure: 1, social: 0, budget: 1 } },
              { label: 'C', text: '遇到危险动物', scores: { adventure: 2, social: 0, budget: 0 } }] },
  { id: 98, category: '出行决策', text: '你心中完美的旅行是？',
    options: [{ label: 'A', text: '无忧无虑', scores: { adventure: 0, social: 0, budget: 1 } },
              { label: 'B', text: '充满奇遇', scores: { adventure: 2, social: 1, budget: 1 } },
              { label: 'C', text: '极致享受', scores: { adventure: 0, social: 1, budget: 2 } }] },
  { id: 99, category: '出行决策', text: '你更愿意回忆的旅行是？',
    options: [{ label: 'A', text: '奢华酒店躺', scores: { adventure: 0, social: 0, budget: 2 } },
              { label: 'B', text: '奇遇冒险', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'C', text: '朋友欢聚', scores: { adventure: 1, social: 2, budget: 1 } }] },
  { id: 100, category: '生活方式', text: '你最后会对自己说？',
    options: [{ label: 'A', text: '"下次还要舒服点"', scores: { adventure: 0, social: 0, budget: 0 } },
              { label: 'B', text: '"下次再疯狂一点"', scores: { adventure: 2, social: 0, budget: 0 } },
              { label: 'C', text: '"下次带上更多人"', scores: { adventure: 0, social: 2, budget: 0 } }] },
]

// ============================================================
// 维度配置
// ============================================================

export const DIMENSION_LABELS = {
  adventure: { low: '休闲舒适', mid: '适度探索', high: '极限冒险' },
  social: { low: '独行侠', mid: '小团体', high: '社交达人' },
  budget: { low: '节俭穷游', mid: '中等消费', high: '奢华享受' }
}

export const DIMENSION_DESCRIPTIONS = {
  adventure: {
    low: '你偏爱舒适和安稳，享受慵懒放松的旅行节奏，不喜欢意外和挑战。',
    mid: '你对新鲜事物充满好奇，愿意在安全范围内尝试小冒险，享受适度刺激。',
    high: '你是天生的冒险家，追求极限体验和未知挑战，越刺激越兴奋！'
  },
  social: {
    low: '你享受独处或二人世界，旅行是为了内心沉淀和私密时光。',
    mid: '你喜欢三五好友结伴出行，社交圈不大但关系紧密。',
    high: '你是人群中的焦点，越热闹越开心，大型聚会和团体活动让你活力满满！'
  },
  budget: {
    low: '你是精打细算的旅行者，追求性价比，穷游也能发现美好。',
    mid: '你愿意为品质买单，偶尔小奢一下，但不铺张浪费。',
    high: '你追求顶级体验，愿意为极致享受投入，旅行就该对自己好！'
  }
}

export const TRAVEL_SUGGESTIONS = {
  adventure: {
    low: { destinations: ['三亚', '巴厘岛', '马尔代夫', '京都'], travelStyle: '度假休闲型', tips: '选择度假村或海岛，享受SPA和美食，减少体力活动，让身心彻底放松。' },
    mid: { destinations: ['成都', '清迈', '大理', '布拉格'], travelStyle: '探索体验型', tips: '尝试短途徒步或骑行，逛当地市场和特色街区，保持计划与随性的平衡。' },
    high: { destinations: ['冰岛', '新西兰', '巴塔哥尼亚', '尼泊尔'], travelStyle: '极限挑战型', tips: '规划一次极限运动之旅，跳伞、潜水、攀登，让肾上腺素飙升！' }
  },
  social: {
    low: { destinations: ['京都', '冰岛', '瑞士', '新西兰'], travelStyle: '独行/二人行', tips: '选择安静的目的地，享受独处或与最亲密的人共度时光，避开旅游旺季。' },
    mid: { destinations: ['成都', '厦门', '大理', '丽江'], travelStyle: '好友结伴型', tips: '约上3-5好友，选择有烟火气的城市，一起逛吃逛喝，共享旅途乐趣。' },
    high: { destinations: ['曼谷', '东京', '巴塞罗那', '里约'], travelStyle: '社交派对型', tips: '参加音乐节、美食节等大型活动，选择社交型住宿，结交世界各地的朋友！' }
  },
  budget: {
    low: { destinations: ['越南', '泰国', '柬埔寨', '印度'], travelStyle: '穷游背包型', tips: '住青旅、吃路边摊、搭公共交通，用最少的钱体验最真实的风土人情。' },
    mid: { destinations: ['日本', '韩国', '新加坡', '澳大利亚'], travelStyle: '品质平衡型', tips: '选择性价比高的精品酒店，该花则花，品尝当地特色美食，不亏待自己。' },
    high: { destinations: ['迪拜', '马尔代夫', '瑞士', '法国'], travelStyle: '奢华享受型', tips: '入住顶级酒店，体验米其林餐厅和私人定制行程，享受极致旅行体验！' }
  }
}

// ============================================================
// 核心分析函数
// ============================================================

/**
 * 根据分数判定维度级别
 */
export function classifyDimension(score) {
  if (score <= 33) return 'low'
  if (score <= 66) return 'mid'
  return 'high'
}

/**
 * 计算置信度
 */
export function calcConfidence(answeredCount, total = 100, minRequired = 15) {
  if (answeredCount < minRequired) return 0
  const ratio = answeredCount / total
  return Math.min(1, +(0.5 + 0.5 * (ratio / (ratio + 0.3))).toFixed(2))
}

/**
 * 生成画像标题
 */
function generateProfileTitle(aLevel, sLevel, bLevel) {
  const aNames = { low: '休闲控', mid: '探索者', high: '冒险王' }
  const sNames = { low: '独行侠', mid: '群游客', high: '社交咖' }
  const bNames = { low: '精算师', mid: '品质派', high: '奢华党' }
  return `${aNames[aLevel]}·${sNames[sLevel]}·${bNames[bLevel]}`
}

/**
 * 生成画像描述
 */
function generateProfileDesc(aLevel, sLevel, bLevel) {
  const aDescs = {
    low: '你偏爱舒适安稳，享受慵懒放松的节奏',
    mid: '你充满好奇，愿意在安全范围内尝试新体验',
    high: '你是天生的冒险家，越刺激越兴奋'
  }
  const sDescs = {
    low: '你享受独处或二人世界，旅行是内心沉淀的时光',
    mid: '你喜欢三五好友结伴，社交圈不大但关系紧密',
    high: '你是人群焦点，越热闹越开心'
  }
  const bDescs = {
    low: '你精打细算，穷游也能发现美好',
    mid: '你愿意为品质买单，偶尔小奢但绝不铺张',
    high: '你追求极致体验，旅行就该对自己好'
  }
  return `${aDescs[aLevel]}，${sDescs[sLevel]}，${bDescs[bLevel]}。`
}

/**
 * 合并三个维度的旅行建议
 */
function mergeSuggestions(aLevel, sLevel, bLevel) {
  const aSugg = TRAVEL_SUGGESTIONS.adventure[aLevel]
  const sSugg = TRAVEL_SUGGESTIONS.social[sLevel]
  const bSugg = TRAVEL_SUGGESTIONS.budget[bLevel]

  // 去重合并目的地
  const allDests = [...aSugg.destinations, ...sSugg.destinations, ...bSugg.destinations]
  const destinations = [...new Set(allDests)].slice(0, 6)

  const travelStyle = aSugg.travelStyle
  const tips = `${aSugg.tips} ${sSugg.tips} ${bSugg.tips}`

  return { destinations, travelStyle, tips }
}

/**
 * 核心分析函数：根据问卷回答计算人物画像
 * @param {Object} answers - 问卷回答 { 1: 'A', 2: 'B', ... }
 * @returns {Object} 画像分析结果
 */
export function analyze(answers) {
  if (!answers || Object.keys(answers).length === 0) {
    return { success: false, error: '问卷回答不能为空' }
  }

  const questionMap = {}
  for (const q of QUESTIONS) {
    questionMap[q.id] = q
  }

  let rawAdventure = 0
  let rawSocial = 0
  let rawBudget = 0
  let maxPossibleAdventure = 0
  let maxPossibleSocial = 0
  let maxPossibleBudget = 0
  let answeredCount = 0

  for (const [qId, choice] of Object.entries(answers)) {
    const id = Number(qId)
    const label = String(choice).toUpperCase()
    const q = questionMap[id]
    if (!q) continue

    answeredCount++

    // 查找选项并累加得分
    const opt = q.options.find(o => o.label === label)
    if (opt) {
      rawAdventure += opt.scores.adventure
      rawSocial += opt.scores.social
      rawBudget += opt.scores.budget
    }

    // 计算该题各维度最大可能得分
    maxPossibleAdventure += Math.max(...q.options.map(o => o.scores.adventure))
    maxPossibleSocial += Math.max(...q.options.map(o => o.scores.social))
    maxPossibleBudget += Math.max(...q.options.map(o => o.scores.budget))
  }

  // 归一化到0-100
  const adventureScore = maxPossibleAdventure > 0
    ? Math.min(100, Math.max(0, Math.round(rawAdventure / maxPossibleAdventure * 100 * 10) / 10))
    : 50
  const socialScore = maxPossibleSocial > 0
    ? Math.min(100, Math.max(0, Math.round(rawSocial / maxPossibleSocial * 100 * 10) / 10))
    : 50
  const budgetScore = maxPossibleBudget > 0
    ? Math.min(100, Math.max(0, Math.round(rawBudget / maxPossibleBudget * 100 * 10) / 10))
    : 50

  const adventureLevel = classifyDimension(adventureScore)
  const socialLevel = classifyDimension(socialScore)
  const budgetLevel = classifyDimension(budgetScore)
  const confidence = calcConfidence(answeredCount)

  const { destinations, travelStyle, tips } = mergeSuggestions(adventureLevel, socialLevel, budgetLevel)

  return {
    success: true,
    data: {
      adventureScore,
      socialScore,
      budgetScore,
      adventureLevel,
      socialLevel,
      budgetLevel,
      adventureLabel: DIMENSION_LABELS.adventure[adventureLevel],
      socialLabel: DIMENSION_LABELS.social[socialLevel],
      budgetLabel: DIMENSION_LABELS.budget[budgetLevel],
      confidence,
      answeredCount,
      profileTitle: generateProfileTitle(adventureLevel, socialLevel, budgetLevel),
      profileDesc: generateProfileDesc(adventureLevel, socialLevel, budgetLevel),
      destinations,
      travelStyle,
      tips
    }
  }
}

/**
 * 获取题目分类列表
 */
export function getCategories() {
  const seen = []
  for (const q of QUESTIONS) {
    if (!seen.includes(q.category)) seen.push(q.category)
  }
  return seen
}

/**
 * 校验问卷回答
 */
export function validateAnswers(answers) {
  const errors = []
  const warnings = []
  const count = Object.keys(answers).length

  if (count < 15) {
    warnings.push(`答题数不足15题（当前${count}题），画像置信度将为0`)
  }

  const questionMap = {}
  for (const q of QUESTIONS) questionMap[q.id] = q

  for (const [qId, choice] of Object.entries(answers)) {
    const id = Number(qId)
    if (!questionMap[id]) {
      errors.push(`无效题号: ${qId}`)
      continue
    }
    const allowed = questionMap[id].options.map(o => o.label)
    if (!allowed.includes(String(choice).toUpperCase())) {
      errors.push(`第${qId}题无效选项: ${choice}`)
    }
  }

  return { valid: errors.length === 0, errors, warnings, answerCount: count }
}

/**
 * 智能分析：优先使用API，失败则降级到本地计算
 * @param {Object} answers - 问卷回答
 * @param {boolean} useAPI - 是否尝试使用API
 * @returns {Promise<Object>} 分析结果
 */
export async function smartAnalyze(answers, useAPI = true) {
  if (useAPI) {
    return await analyzeViaAPI(answers)
  } else {
    return analyze(answers)
  }
}

// 所有函数和常量已在上方用 export 声明导出
