# -*- coding: utf-8 -*-
"""
行程导入 API 服务
提供 REST API 接口，用于解析 AI 生成的行程规划并保存到前端
"""

import json
import re
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ============================================================
# 行程解析功能
# ============================================================

def parse_trip_plan(plan_content: str, title: str = "AI生成行程") -> dict:
    """
    解析 AI 生成的行程规划文本，提取结构化数据。
    支持多种常见格式：
    - ### Day 1 / ## Day 1 / **Day 1** 等标题格式
    - 日期范围提取
    - 目的地提取
    - 预算提取
    """
    result = {
        "name": title,
        "destination": "",
        "startDate": "",
        "endDate": "",
        "budget": {"total": 0, "spent": 0},
        "days": [],
        "status": "planned"
    }
    
    # 1. 提取目的地
    dest_patterns = [
        r"目的地[：:]\s*([^\n]+)",
        r"去\s*([^\n]{2,10}?)\s*(旅行|旅游|游玩|玩)",
        r"([\u4e00-\u9fa5]{2,10})\s*(行程|旅行|旅游|攻略)",
    ]
    for pattern in dest_patterns:
        match = re.search(pattern, plan_content)
        if match:
            result["destination"] = match.group(1).strip()
            break
    
    # 如果没找到，尝试从内容提取常见目的地
    if not result["destination"]:
        common_dests = ["北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "南京", 
                        "重庆", "武汉", "厦门", "昆明", "大理", "丽江", "三亚", "青岛",
                        "大连", "哈尔滨", "拉萨", "呼和浩特", "乌鲁木齐", 
                        "东京", "大阪", "京都", "首尔", "釜山", 
                        "巴黎", "伦敦", "纽约", "洛杉矶", "悉尼", "墨尔本", 
                        "曼谷", "新加坡", "吉隆坡"]
        for dest in common_dests:
            if dest in plan_content[:500]:
                result["destination"] = dest
                break
   
    # 2. 提取预算
    budget_patterns = [
        r"预算[：:]\s*([0-9]+)",
        r"总预算[：:]\s*([0-9]+)",
        r"约\s*([0-9]+)\s*元",
        r"¥\s*([0-9]+)",
        r"(\d+)\s*(千|万)?元?",
    ]
    for pattern in budget_patterns:
        match = re.search(pattern, plan_content)
        if match:
            budget_str = match.group(1)
            multiplier = 1
            if len(match.groups()) > 1 and match.group(2):
                if '千' in match.group(2):
                    multiplier = 1000
                elif '万' in match.group(2):
                    multiplier = 10000
            try:
                result["budget"]["total"] = int(float(budget_str) * multiplier)
                break
            except:
                pass
   
    # 3. 提取天数和每日行程
    lines = plan_content.split('\n')
    current_day = None
    current_title = ""
    activities = []
   
    for line in lines:
        line = line.strip()
        if not line:
            continue
       
        # 检测新的一天
        day_match = re.match(r"(?:Day|天|第)\s*(\d+)", line, re.IGNORECASE)
        if day_match:
            # 保存前一天
            if current_day is not None:
                result["days"].append({
                    "day": current_day,
                    "title": current_title,
                    "date": "",
                    "activities": activities
                })
           
            current_day = int(day_match.group(1))
            # 提取标题
            title_match = re.match(r"(?:Day|天|第)\s*\d+\s*[：:]\s*(.+)", line, re.IGNORECASE)
            if title_match:
                current_title = title_match.group(1).strip()
            else:
                # 尝试从行中提取标题
                parts = line.split(' ', 1)
                current_title = parts[1].strip() if len(parts) > 1 else f"第 {current_day} 天"
            activities = []
        elif current_day is not None:
            # 收集活动
            time_match = re.match(r"(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})?\s*(.+)", line)
            if time_match:
                activities.append({
                    "time": time_match.group(1),
                    "name": time_match.group(3).strip(),
                    "type": "sightseeing",
                    "note": ""
                })
            elif line.startswith(('-', '*', '•')):
                # 列表项
                activity_name = line.lstrip('-*• ').strip()
                if activity_name:
                    activities.append({
                        "time": "",
                        "name": activity_name,
                        "type": "sightseeing",
                        "note": ""
                    })
   
    # 保存最后一天
    if current_day is not None:
        result["days"].append({
            "day": current_day,
            "title": current_title,
            "date": "",
            "activities": activities
        })
   
    # 4. 估算日期范围
    if result["days"]:
        num_days = len(result["days"])
        start = datetime.now()
        end = start + timedelta(days=num_days - 1)
        result["startDate"] = start.strftime("%Y-%m-%d")
        result["endDate"] = end.strftime("%Y-%m-%d")
       
        # 为每天添加日期
        for i, day_data in enumerate(result["days"]):
            if isinstance(day_data, dict) and not day_data.get("date"):
                day_date = start + timedelta(days=i)
                day_data["date"] = day_date.strftime("%Y-%m-%d")
   
    return result


# ============================================================
# API 路由
# ============================================================

@app.route('/api/trip/import', methods=['POST'])
def trip_import():
    """
    将 AI 生成的行程规划导入个人行程
    请求体：
    {
        "conversation_id": "xxx",
        "message_id": "xxx",
        "plan_content": "AI生成的行程文本",
        "title": "行程标题",
        "user_id": "用户ID"
    }
    返回：
    {
        "success": true/false,
        "message": "提示信息",
        "data": {解析后的行程数据}
    }
    """
    try:
        data = request.get_json()
       
        if not data:
            return jsonify({"success": False, "message": "请求数据为空"}), 400
       
        plan_content = data.get("plan_content", "")
        title = data.get("title", "AI生成行程")
        user_id = data.get("user_id", "demo")
       
        if not plan_content:
            return jsonify({"success": False, "message": "行程内容为空"}), 400
       
        # 解析行程
        parsed_trip = parse_trip_plan(plan_content, title)
        parsed_trip["id"] = f"trip_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        parsed_trip["userId"] = user_id
        parsed_trip["createdAt"] = datetime.now().isoformat()
        parsed_trip["updatedAt"] = datetime.now().isoformat()
        parsed_trip["aiPlanContent"] = plan_content  # 保留AI原始方案内容
       
        # 返回解析后的数据（前端会保存到 localStorage）
        return jsonify({
            "success": True,
            "message": "行程解析成功",
            "data": parsed_trip
        })
       
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"导入失败: {str(e)}"
        }), 500


@app.route('/api/trip/parse', methods=['POST'])
def trip_parse():
    """
    仅解析行程内容，不保存（用于预览）
    """
    try:
        data = request.get_json()
        plan_content = data.get("plan_content", "")
        title = data.get("title", "AI生成行程")
       
        if not plan_content:
            return jsonify({"success": False, "message": "行程内容为空"}), 400
       
        parsed_trip = parse_trip_plan(plan_content, title)
       
        return jsonify({
            "success": True,
            "message": "行程解析成功",
            "data": parsed_trip
        })
       
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"解析失败: {str(e)}"
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        "status": "ok",
        "service": "trip-import",
        "timestamp": datetime.now().isoformat()
    })


# ============================================================
# 主程序
# ============================================================

if __name__ == '__main__':
    print("=" * 60)
    print("行程导入 API 服务")
    print("=" * 60)
    print("服务启动中...")
    print("监听地址: http://localhost:5001")
    print("API 端点:")
    print("  POST /api/trip/import - 导入行程")
    print("  POST /api/trip/parse  - 解析行程（预览）")
    print("  GET  /api/health     - 健康检查")
    print("=" * 60)
   
    app.run(host='0.0.0.0', port=5001, debug=True)
