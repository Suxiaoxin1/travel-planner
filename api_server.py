# -*- coding: utf-8 -*-
"""
旅行规划 AI 对话后端服务
提供 REST API 接口，前端通过此服务与 Ollama 本地模型交互。

接口列表：
  GET  /api/ollama/status          检查 Ollama 服务状态
  POST /api/chat                   发送对话消息（流式 SSE 响应）
  POST /api/chat/non-stream        发送对话消息（非流式响应）
  GET  /api/models                 获取可用模型列表
  POST /api/trip/import            将旅行规划导入行程（预留接口，暂未实现）

启动方式：
  python api_server.py
  默认监听 http://localhost:5000
"""

import json
import re
import sys
import io
import os
from typing import Dict, Optional, List

from flask import Flask, request, Response, jsonify, stream_with_context
from flask_cors import CORS

# Windows 控制台 UTF-8 编码
if sys.platform == "win32":
    os.system("chcp 65001 >nul 2>&1")
    if sys.stdout and hasattr(sys.stdout, 'buffer'):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# ============================================================
# Ollama 客户端
# ============================================================
import requests as http_requests

OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "deepseek-r1:7b")


def check_ollama_status() -> Dict:
    """检查 Ollama 服务连接状态"""
    try:
        resp = http_requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if resp.status_code != 200:
            return {"connected": False, "error": f"HTTP {resp.status_code}"}
        data = resp.json()
        models = [m["name"] for m in data.get("models", [])]
        model_available = any(DEFAULT_MODEL in m for m in models)
        return {
            "connected": True,
            "model_available": model_available,
            "available_models": models,
            "current_model": DEFAULT_MODEL,
        }
    except http_requests.exceptions.ConnectionError:
        return {"connected": False, "error": "无法连接 Ollama 服务，请确认已启动 ollama serve"}
    except Exception as e:
        return {"connected": False, "error": str(e)}


def ollama_chat_stream(messages: List[Dict], model: Optional[str] = None):
    """调用 Ollama Chat API（流式），逐 token 返回"""
    use_model = model or DEFAULT_MODEL

    payload = {
        "model": use_model,
        "messages": messages,
        "stream": True,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 4096,
        },
    }

    try:
        resp = http_requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
            stream=True,
            timeout=300,
        )

        if resp.status_code != 200:
            error_msg = f"Ollama 返回 HTTP {resp.status_code}"
            yield f"data: {json.dumps({'error': error_msg}, ensure_ascii=False)}\n\n"
            return

        full_content = ""
        for line in resp.iter_lines():
            if line:
                try:
                    chunk = json.loads(line)
                except json.JSONDecodeError:
                    continue

                token = chunk.get("message", {}).get("content", "")
                done = chunk.get("done", False)

                if token:
                    full_content += token
                    yield f"data: {json.dumps({'token': token}, ensure_ascii=False)}\n\n"

                if done:
                    cleaned = clean_thinking_tags(full_content)
                    yield f"data: {json.dumps({'done': True, 'full_content': cleaned}, ensure_ascii=False)}\n\n"

    except http_requests.exceptions.ConnectionError:
        yield f"data: {json.dumps({'error': '无法连接 Ollama 服务'}, ensure_ascii=False)}\n\n"
    except http_requests.exceptions.Timeout:
        yield f"data: {json.dumps({'error': 'Ollama 生成超时'}, ensure_ascii=False)}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"


def ollama_chat(messages: List[Dict], model: Optional[str] = None) -> Dict:
    """调用 Ollama Chat API（非流式）"""
    use_model = model or DEFAULT_MODEL

    payload = {
        "model": use_model,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "top_p": 0.9,
            "num_predict": 4096,
        },
    }

    try:
        resp = http_requests.post(
            f"{OLLAMA_BASE_URL}/api/chat",
            json=payload,
            timeout=300,
        )
        if resp.status_code != 200:
            return {"success": False, "error": f"Ollama 返回 HTTP {resp.status_code}"}

        result = resp.json()
        content = result.get("message", {}).get("content", "")
        cleaned = clean_thinking_tags(content)

        return {
            "success": True,
            "data": {
                "content": cleaned,
                "model": result.get("model", use_model),
                "total_duration_ns": result.get("total_duration", 0),
                "eval_count": result.get("eval_count", 0),
            },
        }
    except http_requests.exceptions.ConnectionError:
        return {"success": False, "error": "无法连接 Ollama 服务"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def clean_thinking_tags(text: str) -> str:
    """清理 deepseek-r1 模型的 <think...</think 思考标签"""
    cleaned = re.sub(r"<think\s*.*?</think\s*>", "", text, flags=re.DOTALL)
    return cleaned.strip()


# ============================================================
# 系统提示词
# ============================================================
SYSTEM_PROMPT = """你是一位专业的旅行规划顾问 AI，你的名字叫"旅行小助手"。

你擅长：
- 根据用户的偏好、预算、时间等需求，提供个性化的旅行建议
- 规划详细的行程安排（包括交通、住宿、餐饮、景点推荐）
- 结合用户的 MBTI 性格和旅行画像，给出最适合的旅行方案
- 回答关于目的地、签证、天气、文化等各种旅行相关问题

你的风格：
- 热情友好，像一位旅行达人朋友
- 回答结构清晰，善于使用列表和分段
- 注重实用性和可行性
- 会主动追问关键信息（如预算、出行时间、同行人数等）以给出更好的建议

当用户提到自己的旅行风格偏好时，你会参考以下维度：
- 节奏偏好：精确规划型 / 半日规划型 / 愿望清单型 / 即兴驱动型
- 社交偏好：独立独行型 / 温和陪伴型 / 社交猎手型 / 组织者型
- 规划风格：战略规划 / 贴心安排 / 灵感驱动 / 即兴行动 等
- 预算倾向：精打细算 / 中等消费 / 品质消费 / 奢华体验

请始终用中文回答。"""


def build_profile_prompt(persona_data: Optional[Dict], mbti_data: Optional[Dict]) -> str:
    """
    根据用户的人物画像和 MBTI 数据，构建个性化系统提示词附加段。
    如果用户选择使用画像，则在基础系统提示词后追加个性化信息。
    """
    if not persona_data and not mbti_data:
        return ""

    parts = ["\n\n## 当前用户的个性化信息（请务必结合这些信息生成旅行规划）\n"]

    if mbti_data:
        mbti_type = mbti_data.get("mbtiType", "")
        mbti_name = mbti_data.get("mbtiTypeName", "")
        if mbti_type:
            parts.append(f"### MBTI 性格类型：{mbti_type}（{mbti_name}）\n")

        dimensions = mbti_data.get("dimensions", {})
        if dimensions:
            parts.append("**维度分析：**\n")
            for dim_key, dim_val in dimensions.items():
                dominant = dim_val.get("dominant", "")
                left_pct = dim_val.get("leftPercent", 0)
                right_pct = dim_val.get("rightPercent", 0)
                dim_names = {"EI": ("外向E", "内向I"), "SN": ("感觉S", "直觉N"),
                             "TF": ("思维T", "情感F"), "JP": ("判断J", "知觉P")}
                l_name, r_name = dim_names.get(dim_key, ("", ""))
                parts.append(f"- {dim_key}: {l_name} {left_pct}% / {r_name} {right_pct}%（偏好：{dominant}）\n")

        travel_fields = [
            ("pace", "节奏偏好"), ("social", "社交偏好"), ("planningStyle", "规划风格"),
            ("travelStyle", "旅行风格"), ("destinationTypes", "偏好目的地类型"),
            ("activities", "偏好活动"), ("accommodation", "偏好住宿"),
            ("decisionFactors", "决策因素"), ("aversion", "反感事项"),
            ("tips", "旅行建议"),
        ]
        for field, label in travel_fields:
            val = mbti_data.get(field)
            if val:
                if isinstance(val, list):
                    parts.append(f"- {label}：{', '.join(val)}\n")
                else:
                    parts.append(f"- {label}：{val}\n")

    if persona_data:
        profile_title = persona_data.get("profileTitle", "")
        profile_desc = persona_data.get("profileDesc", "")
        if profile_title:
            parts.append(f"\n### 人物画像：{profile_title}\n")
        if profile_desc:
            parts.append(f"{profile_desc}\n")

        persona_fields = [
            ("adventureLabel", "冒险倾向"), ("socialLabel", "社交倾向"),
            ("budgetLabel", "消费倾向"), ("travelStyle", "旅行风格"),
            ("destinations", "推荐目的地"), ("tips", "旅行建议"),
        ]
        for field, label in persona_fields:
            val = persona_data.get(field)
            if val:
                if isinstance(val, list):
                    parts.append(f"- {label}：{', '.join(val)}\n")
                else:
                    parts.append(f"- {label}：{val}\n")

    parts.append("\n**重要**：请紧密围绕以上用户的性格特征和偏好来推荐目的地、活动、住宿和行程节奏，让规划真正贴合用户个性。\n")

    return "".join(parts)


# ============================================================
# Flask 应用
# ============================================================
app = Flask(__name__)
CORS(app, origins=["http://localhost:*", "http://127.0.0.1:*"])


@app.route("/api/ollama/status", methods=["GET"])
def ollama_status():
    """检查 Ollama 服务状态"""
    status = check_ollama_status()
    return jsonify(status)


@app.route("/api/models", methods=["GET"])
def list_models():
    """获取可用模型列表"""
    try:
        resp = http_requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            models = [m["name"] for m in data.get("models", [])]
            return jsonify({"success": True, "models": models})
        return jsonify({"success": False, "error": f"HTTP {resp.status_code}"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


@app.route("/api/chat", methods=["POST"])
def chat_stream():
    """
    流式对话接口（SSE）

    请求体:
    {
        "messages": [{"role": "user", "content": "..."}],
        "model": "deepseek-r1:7b",          // 可选
        "use_profile": true,                 // 可选，是否使用用户画像
        "profile_data": {                    // 可选，用户画像数据
            "persona": { ... },
            "mbti": { ... }
        }
    }
    """
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    model = data.get("model")
    use_profile = data.get("use_profile", False)
    profile_data = data.get("profile_data", {})

    if not messages:
        return jsonify({"error": "messages 不能为空"}), 400

    # 构建系统提示词
    system_content = SYSTEM_PROMPT
    if use_profile and profile_data:
        profile_prompt = build_profile_prompt(
            profile_data.get("persona"),
            profile_data.get("mbti")
        )
        system_content += profile_prompt

    has_system = any(m.get("role") == "system" for m in messages)
    if not has_system:
        messages = [{"role": "system", "content": system_content}] + messages

    def generate():
        for chunk in ollama_chat_stream(messages, model):
            yield chunk
        yield "data: [DONE]\n\n"

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.route("/api/chat/non-stream", methods=["POST"])
def chat_non_stream():
    """非流式对话接口"""
    data = request.get_json(silent=True) or {}
    messages = data.get("messages", [])
    model = data.get("model")
    use_profile = data.get("use_profile", False)
    profile_data = data.get("profile_data", {})

    if not messages:
        return jsonify({"error": "messages 不能为空"}), 400

    system_content = SYSTEM_PROMPT
    if use_profile and profile_data:
        profile_prompt = build_profile_prompt(
            profile_data.get("persona"),
            profile_data.get("mbti")
        )
        system_content += profile_prompt

    has_system = any(m.get("role") == "system" for m in messages)
    if not has_system:
        messages = [{"role": "system", "content": system_content}] + messages

    result = ollama_chat(messages, model)
    if result["success"]:
        return jsonify(result)
    return jsonify(result), 500


@app.route("/api/trip/import", methods=["POST"])
def trip_import():
    """
    将 AI 旅行规划导入个人行程（预留接口，暂未实现）

    请求体:
    {
        "conversation_id": "chat_xxx",
        "message_id": "msg_xxx",
        "plan_content": "...",
        "title": "云南5日游",
        "user_id": "user_xxx"
    }
    """
    data = request.get_json(silent=True) or {}
    return jsonify({
        "success": False,
        "message": "行程导入功能尚未实现，该接口为预留接口",
        "trip_id": None,
    }), 501


# ============================================================
# 用户数据持久化接口
# ============================================================

import os
import time

# 用户数据存储目录
USER_DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "user_data")

def ensure_user_data_dir():
    """确保用户数据目录存在"""
    os.makedirs(USER_DATA_DIR, exist_ok=True)

def get_user_data_path(user_id: str) -> str:
    """获取用户数据文件路径"""
    # 安全校验：防止路径遍历
    safe_id = re.sub(r'[^\w\-.]', '_', user_id)
    return os.path.join(USER_DATA_DIR, f"{safe_id}.json")

def load_user_data(user_id: str) -> Optional[Dict]:
    """从文件加载用户数据"""
    path = get_user_data_path(user_id)
    if not os.path.exists(path):
        return None
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError) as e:
        print(f"加载用户数据失败 {user_id}: {e}")
        return None

def save_user_data(user_id: str, data: Dict) -> bool:
    """保存用户数据到文件"""
    ensure_user_data_dir()
    path = get_user_data_path(user_id)
    try:
        # 原子写入：先写临时文件再重命名
        tmp_path = path + ".tmp"
        with open(tmp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        # Windows 下 rename 可能失败，先删除旧文件
        if os.path.exists(path):
            os.replace(tmp_path, path)
        else:
            os.rename(tmp_path, path)
        return True
    except IOError as e:
        print(f"保存用户数据失败 {user_id}: {e}")
        return False


@app.route("/api/user-data/<user_id>", methods=["GET"])
def get_user_data(user_id):
    """
    获取用户全量持久化数据

    返回格式:
    {
        "success": true,
        "data": {
            "userId": "demo",
            "modules": {
                "trip": { "data": [...], "timestamp": "2026-05-29T..." },
                "chat": { "data": [...], "timestamp": "2026-05-29T..." },
                "persona": { "data": {...}, "timestamp": "2026-05-29T..." },
                "mbti": { "data": {...}, "timestamp": "2026-05-29T..." }
            },
            "syncTime": "2026-05-29T..."
        }
    }
    """
    data = load_user_data(user_id)
    if data is None:
        return jsonify({"success": True, "data": None})
    return jsonify({"success": True, "data": data})


@app.route("/api/user-data/<user_id>", methods=["PUT"])
def put_user_data(user_id):
    """
    更新用户持久化数据（全量覆盖或增量合并）

    请求体:
    {
        "modules": {
            "trip": { "data": [...], "timestamp": "..." },
            "chat": { "data": [...], "timestamp": "..." }
        },
        "merge": false   // 可选，默认 false（全量覆盖）
    }

    当 merge=true 时，对每个模块执行基于时间戳的合并：
    - 如果远端不存在该模块数据，直接写入
    - 如果远端存在，比较时间戳，保留较新的版本
    """
    body = request.get_json(silent=True) or {}
    incoming_modules = body.get("modules", {})
    is_merge = body.get("merge", False)

    # 加载已有数据
    existing = load_user_data(user_id) or {
        "userId": user_id,
        "modules": {},
        "syncTime": None,
    }

    if not isinstance(existing.get("modules"), dict):
        existing["modules"] = {}

    now = new_date_iso()

    if is_merge:
        # 增量合并：逐模块比较时间戳
        for mod_name, mod_entry in incoming_modules.items():
            incoming_ts = mod_entry.get("timestamp", "")
            existing_entry = existing["modules"].get(mod_name)

            if not existing_entry:
                # 远端无此模块，直接写入
                existing["modules"][mod_name] = mod_entry
            else:
                # 比较时间戳，新的胜出
                existing_ts = existing_entry.get("timestamp", "")
                if incoming_ts >= existing_ts:
                    existing["modules"][mod_name] = mod_entry
                # else: 保留远端的
    else:
        # 全量覆盖（仍保留未被覆盖的模块）
        for mod_name, mod_entry in incoming_modules.items():
            existing["modules"][mod_name] = mod_entry

    existing["syncTime"] = now

    if save_user_data(user_id, existing):
        return jsonify({"success": True, "syncTime": now})
    return jsonify({"success": False, "error": "保存失败"}), 500


@app.route("/api/user-data/<user_id>", methods=["POST"])
def sync_user_data(user_id):
    """
    同步用户数据（用于 sendBeacon 等场景，功能与 PUT 相同）
    """
    return put_user_data(user_id)


@app.route("/api/user-data/<user_id>", methods=["DELETE"])
def delete_user_data(user_id):
    """删除用户全量数据（用于账号注销等场景）"""
    path = get_user_data_path(user_id)
    if os.path.exists(path):
        try:
            os.remove(path)
        except IOError as e:
            return jsonify({"success": False, "error": str(e)}), 500
    return jsonify({"success": True})


def new_date_iso():
    """返回当前时间的 ISO 格式字符串"""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


# ============================================================
# 入口
# ============================================================
if __name__ == "__main__":
    print("=" * 50)
    print("  旅行规划 AI 对话后端服务")
    print(f"  Ollama 地址: {OLLAMA_BASE_URL}")
    print(f"  默认模型: {DEFAULT_MODEL}")
    print("=" * 50)

    status = check_ollama_status()
    if status.get("connected"):
        print(f"  Ollama 状态: 已连接 ✓")
        print(f"  模型可用: {'是 ✓' if status.get('model_available') else '否 ✗'}")
        if status.get("available_models"):
            print(f"  可用模型: {', '.join(status['available_models'])}")
    else:
        print(f"  Ollama 状态: 未连接 ✗ ({status.get('error')})")

    print(f"\n  服务启动: http://localhost:5000")
    print("=" * 50)

    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)
