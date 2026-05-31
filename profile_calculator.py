# -*- coding: utf-8 -*-
"""
人物画像计算核心模块
基于100道问卷题目，计算用户的冒险指数、社交指数、预算指数，
生成人物画像分析结果。

算法说明：
1. 每道题3个选项(A/B/C)，每个选项对三个维度(冒险/社交/预算)分别加0/1/2分
2. 按维度独立计算最大可能得分进行归一化到0-100
3. 根据阈值(低0-33/中34-66/高67-100)判定倾向级别
4. 根据答题数量计算置信度
5. 根据三维组合生成画像标题、描述和旅行建议
"""

from dataclasses import dataclass
from typing import Dict, List, Tuple

# ============================================================
# 题目数据：100道单选题
# 每题格式: {"id": int, "category": str, "text": str, "options": [(label, text, A, S, B), ...]}
# ============================================================

QUESTIONS = [
    {"id": 1, "category": "出行决策", "text": "周末突然多出两天假期，你第一反应是？",
     "options": [("A", "宅家刷剧打游戏", 0, 0, 0), ("B", "去隔壁城市吃顿好的", 1, 1, 1), ("C", "立刻订机票去一个没听过名字的小镇", 2, 2, 2)]},
    {"id": 2, "category": "生活方式", "text": "你更想在哪类民宿醒来？",
     "options": [("A", "市中心干净快捷酒店", 0, 1, 0), ("B", "山间玻璃屋，窗外是云海", 2, 1, 1), ("C", "沙漠里的星空帐篷，没水没电", 2, 0, 0)]},
    {"id": 3, "category": "消费行为", "text": "点外卖时，你的决策核心是？",
     "options": [("A", "凑满减、免配送费", 0, 0, 0), ("B", "评分4.8以上，价格无所谓", 1, 1, 2), ("C", "没吃过的新奇菜系", 2, 1, 1)]},
    {"id": 4, "category": "出行决策", "text": "你理想的旅行纪念品是？",
     "options": [("A", "冰箱贴或明信片", 0, 0, 0), ("B", "当地手工艺品", 1, 1, 1), ("C", "捡的一块石头或一片叶子", 2, 0, 0)]},
    {"id": 5, "category": "社交偏好", "text": "如果必须和陌生人拼桌吃饭，你会？",
     "options": [("A", "低头快吃，尽快离开", 0, 0, 0), ("B", "礼貌微笑，简单聊天", 1, 2, 1), ("C", "主动拼单点一桌，边吃边玩酒令", 2, 2, 2)]},
    {"id": 6, "category": "消费行为", "text": "你更愿意花钱在？",
     "options": [("A", "免费景点+自带干粮", 0, 0, 0), ("B", "门票贵的国家公园", 2, 1, 1), ("C", "米其林餐厅+直升机观光", 1, 1, 2)]},
    {"id": 7, "category": "冒险倾向", "text": "哪种旅行中的“意外”会让你最兴奋？",
     "options": [("A", "酒店免费升级套房", 0, 1, 2), ("B", "暴雨后出现的彩虹", 1, 0, 0), ("C", "迷路发现隐蔽瀑布", 2, 0, 0)]},
    {"id": 8, "category": "社交偏好", "text": "你组织朋友聚会时，通常？",
     "options": [("A", "只约最铁的1-2人", 0, 1, 1), ("B", "拉个6-8人的群，投票决定", 1, 2, 1), ("C", "直接包栋别墅，喊上所有人", 1, 2, 2)]},
    {"id": 9, "category": "社交偏好", "text": "你对“网红打卡点”的态度是？",
     "options": [("A", "坚决不去，人多又假", 2, 0, 0), ("B", "路过可以拍张照", 1, 1, 1), ("C", "专门排队两小时也要去", 0, 2, 1)]},
    {"id": 10, "category": "生活方式", "text": "你的行李箱通常是？",
     "options": [("A", "一个20寸登机箱，轻装", 1, 0, 0), ("B", "28寸大箱子，塞满各种可能", 2, 1, 1), ("C", "两个托运箱，甚至快递行李", 0, 2, 2)]},
    {"id": 11, "category": "出行决策", "text": "如果有一周空闲，你更想去？",
     "options": [("A", "三亚五星级酒店躺平", 0, 1, 2), ("B", "成都街头吃三天+看熊猫", 1, 1, 1), ("C", "青海无人区骑行", 2, 0, 0)]},
    {"id": 12, "category": "消费行为", "text": "你最喜欢的交通方式是？",
     "options": [("A", "高铁二等座", 0, 0, 0), ("B", "自驾SUV", 2, 1, 1), ("C", "商务舱或头等舱", 0, 1, 2)]},
    {"id": 13, "category": "冒险倾向", "text": "你如何看待“露营”？",
     "options": [("A", "受罪，不如住酒店", 0, 0, 0), ("B", "偶尔去设施完善的露营地", 1, 1, 1), ("C", "荒野求生式露营是我的最爱", 2, 0, 0)]},
    {"id": 14, "category": "消费行为", "text": "你选餐厅时，最看重的？",
     "options": [("A", "大众点评必吃榜", 0, 1, 1), ("B", "本地人排队的苍蝇馆子", 2, 0, 0), ("C", "主厨桌、私人订制菜单", 0, 1, 2)]},
    {"id": 15, "category": "社交偏好", "text": "你更愿意和谁一起旅行？",
     "options": [("A", "自己一人", 0, 0, 0), ("B", "伴侣或一个死党", 1, 1, 1), ("C", "父母+孩子+亲戚一大家子", 0, 2, 2)]},
    {"id": 16, "category": "冒险倾向", "text": "面对一条“高难度徒步路线”，你的想法是？",
     "options": [("A", "看看别人发的视频就好", 0, 0, 0), ("B", "先练一个月体能再挑战", 1, 1, 1), ("C", "马上出发，到那再说", 2, 0, 0)]},
    {"id": 17, "category": "出行决策", "text": "你记忆中最棒的旅行经历，多半是？",
     "options": [("A", "睡到自然醒，海边发呆", 0, 0, 1), ("B", "和当地人聊天学会做菜", 1, 2, 1), ("C", "经历了一次爆胎、暴雨、但看到了极光", 2, 1, 0)]},
    {"id": 18, "category": "社交偏好", "text": "你旅游住青旅的感受是？",
     "options": [("A", "从未住过，无法接受", 0, 0, 0), ("B", "学生时代住过，挺有意思", 1, 2, 0), ("C", "现在还会主动选择，喜欢交朋友", 2, 2, 0)]},
    {"id": 19, "category": "风险态度", "text": "你购买旅游保险的意愿？",
     "options": [("A", "从不买，浪费钱", 2, 0, 0), ("B", "只买最基本的意外险", 1, 0, 1), ("C", "买最贵的，涵盖一切取消/医疗", 0, 0, 2)]},
    {"id": 20, "category": "冒险倾向", "text": "你喜欢哪种日出场景？",
     "options": [("A", "酒店阳台，穿着浴袍", 0, 0, 1), ("B", "山顶观景台，有热咖啡", 1, 1, 1), ("C", "睡袋里探出头，帐篷外就是雪山", 2, 0, 0)]},
    {"id": 21, "category": "风险态度", "text": "如果旅行中丢手机，你会？",
     "options": [("A", "崩溃，立刻结束行程", 0, 0, 0), ("B", "去当地电子市场买个便宜的", 1, 1, 0), ("C", "正好，彻底享受无网络旅行", 2, 0, 0)]},
    {"id": 22, "category": "出行决策", "text": "你更愿意参加哪种一日游？",
     "options": [("A", "跟团大巴，景点全包", 0, 1, 1), ("B", "包车定制，只有你几个人", 1, 1, 2), ("C", "自己租摩托，随机乱逛", 2, 0, 0)]},
    {"id": 23, "category": "消费行为", "text": "你心中的“豪华”是？",
     "options": [("A", "五星酒店+米其林", 0, 0, 2), ("B", "私人飞机+管家", 0, 1, 2), ("C", "在无人岛有一栋别墅", 2, 0, 2)]},
    {"id": 24, "category": "出行决策", "text": "你对旅行攻略的态度？",
     "options": [("A", "必须精确到每分钟", 0, 0, 0), ("B", "定几个大目标，其他随机", 1, 0, 1), ("C", "完全不看，到了再说", 2, 0, 0)]},
    {"id": 25, "category": "生活方式", "text": "你更容易被哪种短视频吸引？",
     "options": [("A", "奢华酒店Room tour", 0, 0, 2), ("B", "野外求生/极限运动", 2, 0, 0), ("C", "一群人跳伞、聚餐、跳水", 1, 2, 1)]},
    {"id": 26, "category": "社交偏好", "text": "你想体验的“文化”是？",
     "options": [("A", "博物馆、歌剧、历史遗迹", 0, 0, 1), ("B", "当地菜市场、集市、手工作坊", 1, 1, 1), ("C", "部落仪式、萨满、原始舞蹈", 2, 2, 0)]},
    {"id": 27, "category": "冒险倾向", "text": "你更喜欢哪种动物互动？",
     "options": [("A", "动物园喂长颈鹿", 0, 1, 1), ("B", "斯里兰卡骑大象", 1, 1, 1), ("C", "加拉帕戈斯与海狮游泳", 2, 0, 2)]},
    {"id": 28, "category": "消费行为", "text": "如果旅行超预算，你会？",
     "options": [("A", "削减购物和餐饮支出", 0, 0, 0), ("B", "用信用卡透支一下", 1, 0, 1), ("C", "根本不在乎，开心就好", 0, 1, 2)]},
    {"id": 29, "category": "出行决策", "text": "你理想的旅行时长是？",
     "options": [("A", "3天以内，久了累", 0, 0, 0), ("B", "7-10天，刚好", 1, 1, 1), ("C", "1个月以上，流浪式", 2, 0, 0)]},
    {"id": 30, "category": "社交偏好", "text": "你对“纪念照”的要求是？",
     "options": [("A", "必须所有人看镜头微笑", 0, 1, 0), ("B", "抓拍自然瞬间", 1, 1, 1), ("C", "不拍照，只用眼睛记住", 2, 0, 0)]},
    {"id": 31, "category": "冒险倾向", "text": "你去游乐园必玩项目？",
     "options": [("A", "旋转木马", 0, 1, 0), ("B", "过山车", 2, 1, 0), ("C", "鬼屋", 2, 2, 0)]},
    {"id": 32, "category": "生活方式", "text": "如果可以选择超能力，你要？",
     "options": [("A", "瞬间移动", 2, 0, 0), ("B", "点石成金", 0, 0, 2), ("C", "读心术", 1, 2, 0)]},
    {"id": 33, "category": "风险态度", "text": "旅途中遇到哪种情况你最不在意？",
     "options": [("A", "排队等候", 0, 0, 0), ("B", "下雨", 1, 0, 0), ("C", "手机没信号", 2, 0, 0)]},
    {"id": 34, "category": "消费行为", "text": "你选飞机座位偏好？",
     "options": [("A", "靠窗，看风景", 1, 0, 0), ("B", "过道，方便走动", 0, 1, 0), ("C", "商务舱任何座位", 0, 0, 2)]},
    {"id": 35, "category": "消费行为", "text": "你理想中的早餐是？",
     "options": [("A", "酒店自助，种类丰富", 0, 1, 1), ("B", "路边摊豆浆油条", 1, 0, 0), ("C", "房间送餐，香槟配班尼迪克蛋", 0, 0, 2)]},
    {"id": 36, "category": "社交偏好", "text": "你更愿意学习哪种技能？",
     "options": [("A", "野外生火搭帐篷", 2, 0, 0), ("B", "多国语言快速交流", 1, 2, 0), ("C", "摄影剪辑", 0, 1, 1)]},
    {"id": 37, "category": "风险态度", "text": "你对“未知恐惧”的态度？",
     "options": [("A", "尽量避开", 0, 0, 0), ("B", "有一定心理准备再尝试", 1, 0, 1), ("C", "享受未知带来的肾上腺素", 2, 0, 0)]},
    {"id": 38, "category": "冒险倾向", "text": "你更爱哪种自然景观？",
     "options": [("A", "热带海滩，椰林树影", 0, 1, 1), ("B", "温带森林，蘑菇小溪", 1, 0, 0), ("C", "极地冰川，暴风雪", 2, 0, 2)]},
    {"id": 39, "category": "消费行为", "text": "你如何对待旅游景点的“宰客”？",
     "options": [("A", "据理力争，甚至报警", 0, 0, 0), ("B", "忍了，下次不来", 1, 0, 0), ("C", "反正有钱，无所谓", 0, 0, 2)]},
    {"id": 40, "category": "生活方式", "text": "你更愿意体验哪种住宿？",
     "options": [("A", "胶囊旅馆", 0, 1, 0), ("B", "树屋", 2, 0, 1), ("C", "海底酒店", 1, 1, 2)]},
    {"id": 41, "category": "生活方式", "text": "你出门旅游必带的电子产品？",
     "options": [("A", "手机+充电宝", 0, 0, 0), ("B", "相机+无人机", 1, 1, 1), ("C", "笔记本电脑", 0, 1, 1)]},
    {"id": 42, "category": "冒险倾向", "text": "你喜欢运动型度假吗？",
     "options": [("A", "完全不喜欢", 0, 0, 0), ("B", "偶尔骑车、徒步", 1, 1, 1), ("C", "潜水、滑雪、冲浪每样都要", 2, 1, 2)]},
    {"id": 43, "category": "消费行为", "text": "你更愿意把钱花在？",
     "options": [("A", "交通", 0, 0, 1), ("B", "住宿", 0, 0, 2), ("C", "吃喝", 1, 1, 1)]},
    {"id": 44, "category": "冒险倾向", "text": "你对“小众目的地”的定义是？",
     "options": [("A", "非热门但交通便利", 1, 0, 1), ("B", "需要签证且语言不通", 2, 0, 1), ("C", "地图上找不到，要靠向导", 2, 0, 2)]},
    {"id": 45, "category": "社交偏好", "text": "如果遇到明星在隔壁桌吃饭，你会？",
     "options": [("A", "安静偷拍", 0, 0, 0), ("B", "上前要签名合影", 1, 2, 0), ("C", "请他一起喝一杯", 1, 2, 2)]},
    {"id": 46, "category": "消费行为", "text": "你更倾向的购物方式是？",
     "options": [("A", "免税店、奥特莱斯", 0, 1, 1), ("B", "当地跳蚤市场", 2, 0, 0), ("C", "买手店、设计师品牌", 0, 0, 2)]},
    {"id": 47, "category": "生活方式", "text": "你想象中的“完美一天”包括？",
     "options": [("A", "读书、喝茶、看海", 0, 0, 1), ("B", "爬山、野餐、夜晚篝火", 2, 1, 1), ("C", "酒吧、夜店、凌晨散步", 1, 2, 1)]},
    {"id": 48, "category": "社交偏好", "text": "你更想和谁分享旅行故事？",
     "options": [("A", "发朋友圈", 0, 2, 0), ("B", "只跟家人说", 0, 1, 0), ("C", "写成游记，匿名发表", 1, 0, 0)]},
    {"id": 49, "category": "消费行为", "text": "你对“穷游”的看法是？",
     "options": [("A", "羡慕但做不到", 0, 0, 0), ("B", "年轻时的美好回忆", 1, 1, 0), ("C", "现在依然热衷", 2, 2, 0)]},
    {"id": 50, "category": "风险态度", "text": "你更怕哪种天气？",
     "options": [("A", "高温", 0, 0, 0), ("B", "暴雨", 1, 0, 0), ("C", "大雪封路", 2, 0, 0)]},
    {"id": 51, "category": "社交偏好", "text": "你愿意为看一场演唱会去另一个城市吗？",
     "options": [("A", "不会，太折腾", 0, 0, 0), ("B", "如果票价便宜可以", 1, 1, 0), ("C", "会，而且买最前排", 1, 2, 2)]},
    {"id": 52, "category": "冒险倾向", "text": "你旅行中更看重“体验”还是“舒适”？",
     "options": [("A", "舒适优先", 0, 0, 1), ("B", "体验优先，舒适次要", 2, 0, 0), ("C", "两者都要，不惜代价", 1, 0, 2)]},
    {"id": 53, "category": "社交偏好", "text": "你更喜欢哪种夜生活？",
     "options": [("A", "回酒店睡觉", 0, 0, 0), ("B", "逛夜市、吃小吃", 1, 1, 1), ("C", "酒吧、夜店、听live", 2, 2, 1)]},
    {"id": 54, "category": "消费行为", "text": "你会为了省钱坐红眼航班吗？",
     "options": [("A", "经常", 0, 0, 0), ("B", "偶尔", 1, 0, 1), ("C", "绝不会", 0, 0, 2)]},
    {"id": 55, "category": "社交偏好", "text": "你理想中的旅伴具备？",
     "options": [("A", "会拍照", 0, 1, 1), ("B", "能扛行李", 0, 0, 0), ("C", "幽默风趣不抱怨", 1, 2, 0)]},
    {"id": 56, "category": "风险态度", "text": "你对“旅游保险理赔流程复杂”的态度？",
     "options": [("A", "所以不买", 0, 0, 0), ("B", "买最低档求心安", 0, 0, 1), ("C", "买最贵的，理赔麻烦就麻烦", 0, 0, 2)]},
    {"id": 57, "category": "冒险倾向", "text": "你更想尝试？",
     "options": [("A", "开飞机体验", 2, 0, 2), ("B", "沙漠越野", 2, 1, 1), ("C", "深海潜水", 2, 0, 1)]},
    {"id": 58, "category": "生活方式", "text": "你旅行中必做的“仪式感”是？",
     "options": [("A", "寄明信片回家", 0, 0, 0), ("B", "在当地纹个小图案", 2, 1, 1), ("C", "住一次最贵的酒店", 0, 0, 2)]},
    {"id": 59, "category": "生活方式", "text": "你如何看待“旅行博主”？",
     "options": [("A", "羡慕，希望成为他们", 1, 1, 1), ("B", "觉得他们太累", 0, 0, 0), ("C", "只看攻略，不关注博主", 1, 0, 0)]},
    {"id": 60, "category": "消费行为", "text": "你更爱哪种水景？",
     "options": [("A", "无边泳池", 0, 1, 2), ("B", "天然瀑布", 2, 0, 0), ("C", "温泉", 0, 1, 1)]},
    {"id": 61, "category": "冒险倾向", "text": "如果只能带三样东西去荒岛，你会选？",
     "options": [("A", "刀、打火石、渔网", 2, 0, 0), ("B", "手机、充电宝、卫星电话", 1, 0, 2), ("C", "书、墨镜、防晒霜", 0, 0, 1)]},
    {"id": 62, "category": "出行决策", "text": "你更倾向于跟团游是因为？",
     "options": [("A", "省心不费脑", 0, 1, 0), ("B", "便宜", 0, 0, 0), ("C", "安全", 0, 1, 1)]},
    {"id": 63, "category": "消费行为", "text": "你心中的“奢华”是体验一次？",
     "options": [("A", "太空旅游", 2, 0, 2), ("B", "南极邮轮", 1, 1, 2), ("C", "迪拜帆船酒店", 0, 1, 2)]},
    {"id": 64, "category": "生活方式", "text": "你旅行中会带多少套衣服？",
     "options": [("A", "两套轮换", 0, 0, 0), ("B", "一天一套拍照用", 0, 1, 1), ("C", "根据天气和场景搭配", 1, 1, 1)]},
    {"id": 65, "category": "社交偏好", "text": "你更喜欢哪种就餐氛围？",
     "options": [("A", "安静、灯光暗", 0, 0, 1), ("B", "热闹、可以大声聊天", 1, 2, 1), ("C", "户外、野餐垫", 2, 1, 0)]},
    {"id": 66, "category": "风险态度", "text": "你对“旅行中生病”的预案是？",
     "options": [("A", "自带一箱药", 0, 0, 0), ("B", "去当地医院", 1, 0, 1), ("C", "联系国际SOS", 0, 0, 2)]},
    {"id": 67, "category": "冒险倾向", "text": "你更想探索？",
     "options": [("A", "失落的玛雅文明", 2, 0, 1), ("B", "欧洲古堡", 1, 1, 1), ("C", "现代大都会", 0, 2, 2)]},
    {"id": 68, "category": "消费行为", "text": "你愿意为“网红酒店”花多少钱？",
     "options": [("A", "不超过300元", 0, 0, 0), ("B", "可以接受1000元", 1, 1, 1), ("C", "5000元以上也愿意", 0, 1, 2)]},
    {"id": 69, "category": "消费行为", "text": "你旅游中最大的开销通常是？",
     "options": [("A", "交通", 1, 0, 1), ("B", "住宿", 0, 0, 2), ("C", "餐饮", 1, 1, 1)]},
    {"id": 70, "category": "冒险倾向", "text": "你对“冒险”的定义是？",
     "options": [("A", "吃没吃过的食物", 1, 0, 0), ("B", "和陌生人搭讪", 0, 2, 0), ("C", "跳伞/蹦极", 2, 0, 2)]},
    {"id": 71, "category": "出行决策", "text": "你更偏爱哪种纪念品？",
     "options": [("A", "可食用", 1, 1, 1), ("B", "可穿戴", 0, 0, 1), ("C", "可讲述故事", 2, 0, 0)]},
    {"id": 72, "category": "社交偏好", "text": "你如何对待旅行中的“艳遇”可能？",
     "options": [("A", "不期待也不拒绝", 0, 1, 0), ("B", "会主动创造机会", 1, 2, 0), ("C", "顺其自然，不强求", 1, 1, 0)]},
    {"id": 73, "category": "社交偏好", "text": "你愿意尝试“沙发客”吗？",
     "options": [("A", "不安全，绝不", 0, 0, 0), ("B", "只在信任的圈子", 1, 1, 0), ("C", "经常这样旅行", 2, 2, 0)]},
    {"id": 74, "category": "冒险倾向", "text": "你更期待哪种日出？",
     "options": [("A", "云海之上", 1, 0, 1), ("B", "城市天际线", 0, 1, 1), ("C", "冰湖倒影", 2, 0, 0)]},
    {"id": 75, "category": "出行决策", "text": "你选择目的地时，最优先考虑？",
     "options": [("A", "美食", 1, 1, 1), ("B", "拍照好看", 0, 1, 1), ("C", "有挑战性", 2, 0, 0)]},
    {"id": 76, "category": "社交偏好", "text": "你旅行中会喝醉吗？",
     "options": [("A", "从不", 0, 0, 0), ("B", "微醺", 1, 1, 1), ("C", "经常，开心最重要", 2, 2, 1)]},
    {"id": 77, "category": "生活方式", "text": "你更爱哪种建筑风格？",
     "options": [("A", "未来主义", 2, 0, 2), ("B", "古典主义", 0, 0, 1), ("C", "乡土民居", 1, 0, 0)]},
    {"id": 78, "category": "社交偏好", "text": "你旅行中会带父母吗？",
     "options": [("A", "会，专门为他们规划", 0, 1, 1), ("B", "不会，太麻烦", 1, 0, 0), ("C", "会，但只去我熟悉的地方", 0, 1, 0)]},
    {"id": 79, "category": "社交偏好", "text": "你更愿意参加？",
     "options": [("A", "马拉松", 2, 1, 1), ("B", "美食节", 0, 2, 1), ("C", "音乐节", 1, 2, 2)]},
    {"id": 80, "category": "消费行为", "text": "你对“旅行中省钱”的态度？",
     "options": [("A", "能省则省", 0, 0, 0), ("B", "该花就花", 1, 0, 1), ("C", "从不考虑省钱", 0, 0, 2)]},
    {"id": 81, "category": "出行决策", "text": "你理想中的旅行是？",
     "options": [("A", "全程有人安排", 0, 1, 1), ("B", "一半计划一半自由", 1, 0, 1), ("C", "完全随机流浪", 2, 0, 0)]},
    {"id": 82, "category": "风险态度", "text": "你更怕哪种动物？",
     "options": [("A", "蛇", 0, 0, 0), ("B", "蜘蛛", 1, 0, 0), ("C", "狼", 2, 0, 0)]},
    {"id": 83, "category": "消费行为", "text": "你更想体验？",
     "options": [("A", "热气球", 1, 1, 2), ("B", "滑翔伞", 2, 1, 1), ("C", "直升机", 0, 0, 2)]},
    {"id": 84, "category": "冒险倾向", "text": "你旅游中会早起看日出吗？",
     "options": [("A", "不会，起不来", 0, 0, 0), ("B", "偶尔", 1, 0, 0), ("C", "每次必看", 2, 0, 0)]},
    {"id": 85, "category": "消费行为", "text": "你对“旅行中购物”的看法？",
     "options": [("A", "从不购物", 0, 0, 0), ("B", "只买特产", 1, 0, 1), ("C", "免税店买到手软", 0, 1, 2)]},
    {"id": 86, "category": "社交偏好", "text": "你更愿意和哪种性格的人旅行？",
     "options": [("A", "和我一样", 1, 0, 0), ("B", "互补", 1, 1, 0), ("C", "随便，人多就好", 0, 2, 0)]},
    {"id": 87, "category": "风险态度", "text": "你如何处理旅行中的“迷路”？",
     "options": [("A", "慌张求助", 0, 0, 0), ("B", "用地图慢慢找", 1, 0, 0), ("C", "享受迷路，探索未知", 2, 0, 0)]},
    {"id": 88, "category": "生活方式", "text": "你更喜欢哪种海滩？",
     "options": [("A", "白沙滩、玻璃水", 0, 1, 1), ("B", "黑沙滩、巨浪", 2, 0, 0), ("C", "人山人海、水上项目", 0, 2, 1)]},
    {"id": 89, "category": "出行决策", "text": "你愿意为“淡季出行”请假吗？",
     "options": [("A", "不会，工作第一", 0, 0, 0), ("B", "可以，省钱人少", 1, 0, 1), ("C", "经常这么干", 2, 0, 1)]},
    {"id": 90, "category": "冒险倾向", "text": "你更想尝试？",
     "options": [("A", "火山口徒步", 2, 0, 1), ("B", "冰川行走", 2, 0, 2), ("C", "雨林滑索", 2, 1, 1)]},
    {"id": 91, "category": "风险态度", "text": "你对“旅游保险”的最低要求是？",
     "options": [("A", "意外医疗", 0, 0, 0), ("B", "航班延误", 1, 0, 1), ("C", "财物丢失", 0, 0, 1)]},
    {"id": 92, "category": "生活方式", "text": "你更喜欢哪种交通工具上的风景？",
     "options": [("A", "火车窗外", 1, 0, 0), ("B", "公交巴士", 0, 1, 0), ("C", "摩托后座", 2, 1, 0)]},
    {"id": 93, "category": "社交偏好", "text": "你如何看待“拼车旅行”？",
     "options": [("A", "不安全，拒绝", 0, 0, 0), ("B", "可以省钱且有趣", 1, 2, 0), ("C", "经常主动发起", 2, 2, 0)]},
    {"id": 94, "category": "社交偏好", "text": "你更愿意在旅行中？",
     "options": [("A", "认识新朋友", 1, 2, 0), ("B", "独处思考", 0, 0, 0), ("C", "和家人腻在一起", 0, 1, 1)]},
    {"id": 95, "category": "出行决策", "text": "你更爱哪种旅行主题？",
     "options": [("A", "历史文化", 0, 0, 1), ("B", "自然探险", 2, 0, 1), ("C", "城市潮流", 0, 2, 2)]},
    {"id": 96, "category": "消费行为", "text": "你如何选择住宿？",
     "options": [("A", "最低价", 0, 0, 0), ("B", "位置方便", 1, 0, 1), ("C", "风景绝美，价格其次", 1, 0, 2)]},
    {"id": 97, "category": "风险态度", "text": "你更怕哪种情况？",
     "options": [("A", "语言不通", 0, 0, 0), ("B", "没地方吃饭", 1, 0, 1), ("C", "遇到危险动物", 2, 0, 0)]},
    {"id": 98, "category": "出行决策", "text": "你心中完美的旅行是？",
     "options": [("A", "无忧无虑", 0, 0, 1), ("B", "充满奇遇", 2, 1, 1), ("C", "极致享受", 0, 1, 2)]},
    {"id": 99, "category": "出行决策", "text": "你更愿意回忆的旅行是？",
     "options": [("A", "奢华酒店躺", 0, 0, 2), ("B", "奇遇冒险", 2, 0, 0), ("C", "朋友欢聚", 1, 2, 1)]},
    {"id": 100, "category": "生活方式", "text": "你最后会对自己说？",
     "options": [("A", "下次还要舒服点", 0, 0, 0), ("B", "下次再疯狂一点", 2, 0, 0), ("C", "下次带上更多人", 0, 2, 0)]},
]

# ============================================================
# 维度标签
# ============================================================

DIMENSION_LABELS = {
    "adventure": {
        "low": "休闲舒适",
        "mid": "适度探索",
        "high": "极限冒险"
    },
    "social": {
        "low": "独行侠",
        "mid": "小团体",
        "high": "社交达人"
    },
    "budget": {
        "low": "节俭穷游",
        "mid": "中等消费",
        "high": "奢华享受"
    }
}

# ============================================================
# 维度描述
# ============================================================

DIMENSION_DESCRIPTIONS = {
    "adventure": {
        "low": "你偏爱舒适和安稳，享受慵懒放松的旅行节奏，不喜欢意外和挑战。",
        "mid": "你对新鲜事物充满好奇，愿意在安全范围内尝试小冒险，享受适度刺激。",
        "high": "你是天生的冒险家，追求极限体验和未知挑战，越刺激越兴奋！"
    },
    "social": {
        "low": "你享受独处或二人世界，旅行是为了内心沉淀和私密时光。",
        "mid": "你喜欢三五好友结伴出行，社交圈不大但关系紧密。",
        "high": "你是人群中的焦点，越热闹越开心，大型聚会和团体活动让你活力满满！"
    },
    "budget": {
        "low": "你是精打细算的旅行者，追求性价比，穷游也能发现美好。",
        "mid": "你愿意为品质买单，偶尔小奢一下，但不铺张浪费。",
        "high": "你追求顶级体验，愿意为极致享受投入，旅行就该对自己好！"
    }
}

# ============================================================
# 旅行建议
# ============================================================

TRAVEL_SUGGESTIONS = {
    "adventure": {
        "low": {
            "destinations": ["三亚", "巴厘岛", "马尔代夫", "京都"],
            "travel_style": "度假休闲型",
            "tips": "选择度假村或海岛，享受SPA和美食，减少体力活动，让身心彻底放松。"
        },
        "mid": {
            "destinations": ["成都", "清迈", "大理", "布拉格"],
            "travel_style": "探索体验型",
            "tips": "尝试短途徒步或骑行，逛当地市场和特色街区，保持计划与随性的平衡。"
        },
        "high": {
            "destinations": ["冰岛", "新西兰", "巴塔哥尼亚", "尼泊尔"],
            "travel_style": "极限挑战型",
            "tips": "规划一次极限运动之旅，跳伞、潜水、攀登，让肾上腺素飙升！"
        }
    },
    "social": {
        "low": {
            "destinations": ["京都", "冰岛", "瑞士", "新西兰"],
            "travel_style": "独行/二人行",
            "tips": "选择安静的目的地，享受独处或与最亲密的人共度时光，避开旅游旺季。"
        },
        "mid": {
            "destinations": ["成都", "厦门", "大理", "丽江"],
            "travel_style": "好友结伴型",
            "tips": "约上3-5好友，选择有烟火气的城市，一起逛吃逛喝，共享旅途乐趣。"
        },
        "high": {
            "destinations": ["曼谷", "东京", "巴塞罗那", "里约"],
            "travel_style": "社交派对型",
            "tips": "参加音乐节、美食节等大型活动，选择社交型住宿，结交世界各地的朋友！"
        }
    },
    "budget": {
        "low": {
            "destinations": ["越南", "泰国", "柬埔寨", "印度"],
            "travel_style": "穷游背包型",
            "tips": "住青旅、吃路边摊、搭公共交通，用最少的钱体验最真实的风土人情。"
        },
        "mid": {
            "destinations": ["日本", "韩国", "新加坡", "澳大利亚"],
            "travel_style": "品质平衡型",
            "tips": "选择性价比高的精品酒店，该花则花，品尝当地特色美食，不亏待自己。"
        },
        "high": {
            "destinations": ["迪拜", "马尔代夫", "瑞士", "法国"],
            "travel_style": "奢华享受型",
            "tips": "入住顶级酒店，体验米其林餐厅和私人定制行程，享受极致旅行体验！"
        }
    }
}


# ============================================================
# 数据模型
# ============================================================

@dataclass
class ProfileResult:
    """人物画像分析结果"""
    adventure_score: float       # 冒险指数 (0-100)
    social_score: float          # 社交指数 (0-100)
    budget_score: float          # 预算指数 (0-100)
    adventure_level: str         # 冒险级别: low/mid/high
    social_level: str            # 社交级别: low/mid/high
    budget_level: str            # 预算级别: low/mid/high
    adventure_label: str         # 冒险倾向标签
    social_label: str            # 社交倾向标签
    budget_label: str            # 预算倾向标签
    confidence: float            # 置信度 (0-1)
    answered_count: int          # 已答题数
    profile_title: str           # 画像标题
    profile_desc: str            # 画像描述
    destinations: list           # 推荐目的地
    travel_style: str            # 旅行风格
    tips: str                    # 旅行建议


# ============================================================
# 核心计算函数
# ============================================================

def classify_dimension(score: float) -> str:
    """
    根据分数判定维度级别

    参数:
        score: 维度分数 (0-100)

    返回:
        级别: 'low' / 'mid' / 'high'
    """
    if score <= 33:
        return "low"
    elif score <= 66:
        return "mid"
    else:
        return "high"


def calc_confidence(answered_count: int, total: int = 100, min_required: int = 15) -> float:
    """
    根据答题数量计算结果置信度

    参数:
        answered_count: 已答题数
        total: 总题数
        min_required: 最低要求题数

    返回:
        置信度 (0-1)
    """
    if answered_count < min_required:
        return 0.0
    ratio = answered_count / total
    confidence = min(1.0, 0.5 + 0.5 * (ratio / (ratio + 0.3)))
    return round(confidence, 2)


def _generate_profile_title(a_level: str, s_level: str, b_level: str) -> str:
    """生成画像组合标题"""
    a_names = {"low": "休闲控", "mid": "探索者", "high": "冒险王"}
    s_names = {"low": "独行侠", "mid": "群游客", "high": "社交咖"}
    b_names = {"low": "精算师", "mid": "品质派", "high": "奢华党"}
    return f"{a_names[a_level]}·{s_names[s_level]}·{b_names[b_level]}"


def _generate_profile_desc(a_level: str, s_level: str, b_level: str) -> str:
    """生成画像描述"""
    # 根据三维组合生成描述
    desc_parts = []

    # 冒险描述
    a_descs = {
        "low": "你偏爱舒适安稳，享受慵懒放松的节奏",
        "mid": "你充满好奇，愿意在安全范围内尝试新体验",
        "high": "你是天生的冒险家，越刺激越兴奋"
    }
    desc_parts.append(a_descs[a_level])

    # 社交描述
    s_descs = {
        "low": "你享受独处或二人世界，旅行是内心沉淀的时光",
        "mid": "你喜欢三五好友结伴，社交圈不大但关系紧密",
        "high": "你是人群焦点，越热闹越开心"
    }
    desc_parts.append(s_descs[s_level])

    # 预算描述
    b_descs = {
        "low": "你精打细算，穷游也能发现美好",
        "mid": "你愿意为品质买单，偶尔小奢但绝不铺张",
        "high": "你追求极致体验，旅行就该对自己好"
    }
    desc_parts.append(b_descs[b_level])

    return "，".join(desc_parts) + "。"


def _merge_suggestions(a_level: str, s_level: str, b_level: str) -> Tuple[list, str, str]:
    """合并三个维度的旅行建议"""
    # 收集各维度建议
    a_sugg = TRAVEL_SUGGESTIONS["adventure"][a_level]
    s_sugg = TRAVEL_SUGGESTIONS["social"][s_level]
    b_sugg = TRAVEL_SUGGESTIONS["budget"][b_level]

    # 合并目的地（去重，取交集优先）
    all_dests = a_sugg["destinations"] + s_sugg["destinations"] + b_sugg["destinations"]
    seen = set()
    unique_dests = []
    for d in all_dests:
        if d not in seen:
            seen.add(d)
            unique_dests.append(d)

    # 取前6个推荐
    destinations = unique_dests[:6]

    # 旅行风格：以冒险维度为主
    travel_style = a_sugg["travel_style"]

    # 合并建议
    tips_parts = [a_sugg["tips"], s_sugg["tips"], b_sugg["tips"]]
    tips = " ".join(tips_parts)

    return destinations, travel_style, tips


def calculate_profile(answers: Dict[int, str]) -> ProfileResult:
    """
    核心计算函数：根据问卷回答计算人物画像

    参数:
        answers: 问卷回答字典，键为题号(1-100)，值为选项标签("A"/"B"/"C")

    返回:
        ProfileResult 实例
    """
    # 构建题目索引
    question_map = {q["id"]: q for q in QUESTIONS}

    # 累加各维度得分
    raw_adventure = 0
    raw_social = 0
    raw_budget = 0

    # 最大可能得分（按维度独立计算）
    max_possible_adventure = 0
    max_possible_social = 0
    max_possible_budget = 0

    answered_ids = []

    for q_id, choice in answers.items():
        q_id = int(q_id)
        choice = str(choice).upper()
        q = question_map.get(q_id)
        if not q:
            continue

        answered_ids.append(q_id)

        # 查找选项
        for opt in q["options"]:
            if opt[0] == choice:
                raw_adventure += opt[2]
                raw_social += opt[3]
                raw_budget += opt[4]
                break

        # 计算该题各维度最大可能得分
        max_a = max(opt[2] for opt in q["options"])
        max_s = max(opt[3] for opt in q["options"])
        max_b = max(opt[4] for opt in q["options"])
        max_possible_adventure += max_a
        max_possible_social += max_s
        max_possible_budget += max_b

    answered_count = len(answered_ids)

    # 归一化到0-100（避免除零）
    adventure_score = (raw_adventure / max_possible_adventure * 100) if max_possible_adventure > 0 else 50
    social_score = (raw_social / max_possible_social * 100) if max_possible_social > 0 else 50
    budget_score = (raw_budget / max_possible_budget * 100) if max_possible_budget > 0 else 50

    # 限制在0-100范围
    adventure_score = min(100, max(0, round(adventure_score, 1)))
    social_score = min(100, max(0, round(social_score, 1)))
    budget_score = min(100, max(0, round(budget_score, 1)))

    # 判定级别
    adventure_level = classify_dimension(adventure_score)
    social_level = classify_dimension(social_score)
    budget_level = classify_dimension(budget_score)

    # 置信度
    confidence = calc_confidence(answered_count)

    # 标签
    adventure_label = DIMENSION_LABELS["adventure"][adventure_level]
    social_label = DIMENSION_LABELS["social"][social_level]
    budget_label = DIMENSION_LABELS["budget"][budget_level]

    # 画像标题与描述
    profile_title = _generate_profile_title(adventure_level, social_level, budget_level)
    profile_desc = _generate_profile_desc(adventure_level, social_level, budget_level)

    # 旅行建议
    destinations, travel_style, tips = _merge_suggestions(adventure_level, social_level, budget_level)

    return ProfileResult(
        adventure_score=adventure_score,
        social_score=social_score,
        budget_score=budget_score,
        adventure_level=adventure_level,
        social_level=social_level,
        budget_level=budget_level,
        adventure_label=adventure_label,
        social_label=social_label,
        budget_label=budget_label,
        confidence=confidence,
        answered_count=answered_count,
        profile_title=profile_title,
        profile_desc=profile_desc,
        destinations=destinations,
        travel_style=travel_style,
        tips=tips,
    )


def generate_report(result: ProfileResult) -> str:
    """
    生成文本格式的分析报告

    参数:
        result: 画像计算结果

    返回:
        文本格式报告
    """
    lines = [
        "=" * 50,
        "         人物画像分析报告",
        "=" * 50,
        "",
        f"  画像类型: {result.profile_title}",
        f"  置信度: {result.confidence}（基于{result.answered_count}道题目）",
        "",
        "--- 维度分析 ---",
        f"  冒险指数: {result.adventure_score:.1f} ({result.adventure_label})",
        f"  社交指数: {result.social_score:.1f} ({result.social_label})",
        f"  预算指数: {result.budget_score:.1f} ({result.budget_label})",
        "",
        "--- 画像描述 ---",
        f"  {result.profile_desc}",
        "",
        "--- 旅行建议 ---",
        f"  旅行风格: {result.travel_style}",
        f"  推荐目的地: {', '.join(result.destinations)}",
        f"  建议: {result.tips}",
        "",
        "=" * 50,
    ]
    return "\n".join(lines)
