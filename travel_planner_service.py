# -*- coding: utf-8 -*-
"""
大模型旅行规划服务
提供标准化接口，供前端界面调用。
将人物画像分析结果与MBTI性格分析结果进行融合，
生成统一旅行画像，并通过Ollama本地大模型（deepseek-r1:7b）生成个性化旅行规划。

前端接入方式：
  from travel_planner_service import TravelPlannerService
  service = TravelPlannerService()
  result = service.generate_travel_plan(profile_answers, mbti_type="INTJ")
  travel_plan = result["data"]["travel_plan"]
"""

import json
import time
from dataclasses import asdict
from typing import Dict, Optional, List

import requests

from profile_calculator import (
    calculate_profile,
    classify_dimension,
    ProfileResult,
    QUESTIONS,
)
from mbti_travel_core import (
    validate_mbti_type,
    analyze_from_mbti_type,
    analyze_from_responses,
    profile_to_dict,
    TravelPreferenceProfile,
)
from mbti_travel_config import VALID_MBTI_TYPES
from travel_integration import (
    integrate_profiles,
    build_llm_prompt,
    analyze_user,
    unified_to_dict,
    unified_to_json,
    generate_unified_report,
    UnifiedTravelProfile,
    ConflictItem,
    CONFLICT_WEIGHTS,
)


# ============================================================
# Ollama配置
# ============================================================

# Ollama服务地址
OLLAMA_BASE_URL = "http://localhost:11434"

# 默认使用的模型
DEFAULT_MODEL = "deepseek-r1:7b"

# 生成参数默认值
DEFAULT_GENERATE_OPTIONS = {
    "temperature": 0.7,       # 创造性适中
    "top_p": 0.9,             # 核采样概率
    "num_predict": 4096,      # 最大生成token数
    "num_ctx": 8192,          # 上下文窗口大小
}


class OllamaClient:
    """Ollama本地大模型客户端，封装API调用"""

    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = DEFAULT_MODEL):
        """
        初始化Ollama客户端

        参数:
            base_url: Ollama服务地址
            model: 使用的模型名称
        """
        self.base_url = base_url.rstrip("/")
        self.model = model

    def check_connection(self) -> Dict:
        """
        检查Ollama服务连接状态

        返回:
            连接状态字典，包含 connected, model_available, available_models
        """
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if resp.status_code != 200:
                return {"connected": False, "error": f"HTTP {resp.status_code}"}

            data = resp.json()
            models = [m["name"] for m in data.get("models", [])]
            model_available = any(self.model in m for m in models)

            return {
                "connected": True,
                "model_available": model_available,
                "available_models": models,
                "current_model": self.model,
            }
        except requests.exceptions.ConnectionError:
            return {"connected": False, "error": "无法连接Ollama服务，请确认已启动ollama serve"}
        except Exception as e:
            return {"connected": False, "error": str(e)}

    def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        options: Optional[Dict] = None,
        stream: bool = False,
    ) -> Dict:
        """
        调用Ollama生成接口（非流式）

        参数:
            prompt: 输入Prompt
            model: 模型名称（可选，默认使用初始化时的模型）
            options: 生成参数（可选）
            stream: 是否流式输出

        返回:
            标准化结果字典，包含:
            - success: 是否成功
            - data: 生成结果（成功时）
              - response: 模型生成的文本
              - model: 使用的模型
              - total_duration: 总耗时（纳秒）
              - eval_count: 生成的token数
              - eval_duration: 生成耗时（纳秒）
            - error: 错误信息（失败时）
        """
        use_model = model or self.model
        use_options = {**DEFAULT_GENERATE_OPTIONS, **(options or {})}

        payload = {
            "model": use_model,
            "prompt": prompt,
            "stream": stream,
            "options": use_options,
        }

        try:
            # 设置较长的超时，大模型生成需要时间
            timeout = 300
            resp = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=timeout,
            )

            if resp.status_code != 200:
                return {"success": False, "error": f"Ollama返回HTTP {resp.status_code}: {resp.text[:200]}"}

            # 非流式模式下，Ollama返回最终JSON
            result = resp.json()
            return {
                "success": True,
                "data": {
                    "response": result.get("response", ""),
                    "model": result.get("model", use_model),
                    "total_duration": result.get("total_duration", 0),
                    "eval_count": result.get("eval_count", 0),
                    "eval_duration": result.get("eval_duration", 0),
                },
            }

        except requests.exceptions.ConnectionError:
            return {"success": False, "error": "无法连接Ollama服务，请确认已启动ollama serve"}
        except requests.exceptions.Timeout:
            return {"success": False, "error": f"Ollama生成超时（{timeout}秒），模型思考时间过长"}
        except json.JSONDecodeError:
            return {"success": False, "error": "Ollama返回数据解析失败"}
        except Exception as e:
            return {"success": False, "error": f"Ollama调用失败: {str(e)}"}

    def generate_stream(
        self,
        prompt: str,
        model: Optional[str] = None,
        options: Optional[Dict] = None,
    ):
        """
        调用Ollama生成接口（流式），逐token返回

        参数:
            prompt: 输入Prompt
            model: 模型名称
            options: 生成参数

        返回:
            生成器，每次yield一个token片段字典
        """
        use_model = model or self.model
        use_options = {**DEFAULT_GENERATE_OPTIONS, **(options or {})}

        payload = {
            "model": use_model,
            "prompt": prompt,
            "stream": True,
            "options": use_options,
        }

        try:
            resp = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                stream=True,
                timeout=300,
            )

            for line in resp.iter_lines():
                if line:
                    chunk = json.loads(line)
                    yield {
                        "token": chunk.get("response", ""),
                        "done": chunk.get("done", False),
                        "model": chunk.get("model", use_model),
                    }

        except requests.exceptions.ConnectionError:
            yield {"token": "", "done": True, "error": "无法连接Ollama服务"}
        except Exception as e:
            yield {"token": "", "done": True, "error": str(e)}

    def list_models(self) -> List[str]:
        """
        获取Ollama可用模型列表

        返回:
            模型名称列表
        """
        try:
            resp = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                return [m["name"] for m in data.get("models", [])]
        except Exception:
            pass
        return []


class TravelPlannerService:
    """旅行规划服务类，封装画像融合与LLM旅行规划生成功能"""

    def __init__(
        self,
        ollama_base_url: str = OLLAMA_BASE_URL,
        model: str = DEFAULT_MODEL,
    ):
        """
        初始化服务

        参数:
            ollama_base_url: Ollama服务地址
            model: 使用的Ollama模型名称
        """
        self._conflict_weights = CONFLICT_WEIGHTS
        self._ollama = OllamaClient(base_url=ollama_base_url, model=model)

    @property
    def ollama(self) -> OllamaClient:
        """获取Ollama客户端实例（用于直接调用高级功能）"""
        return self._ollama

    def check_ollama(self) -> Dict:
        """
        检查Ollama服务状态

        返回:
            连接状态字典
        """
        return self._ollama.check_connection()

    def generate_travel_plan(
        self,
        profile_answers: Dict[int, str],
        mbti_type: str = "",
        mbti_responses: Optional[Dict[int, str]] = None,
        user_id: str = "",
        model: Optional[str] = None,
        options: Optional[Dict] = None,
    ) -> Dict:
        """
        核心接口：融合画像 + 调用Ollama生成完整旅行规划

        参数:
            profile_answers: 人物画像问卷回答，键为题号(1-100)，值为"A"/"B"/"C"
            mbti_type: MBTI类型字符串（与mbti_responses二选一）
            mbti_responses: MBTI问卷回答，键为题号(1-28)，值为"A"/"B"（与mbti_type二选一）
            user_id: 用户标识（可选）
            model: 指定Ollama模型（可选，默认deepseek-r1:7b）
            options: Ollama生成参数（可选）

        返回:
            标准化结果字典，包含:
            - success: 是否成功
            - data: 规划数据（成功时）
              - user_id: 用户标识
              - created_at: 创建时间
              - overall_confidence: 综合置信度
              - mbti_type: MBTI类型
              - mbti_type_name: MBTI类型中文名
              - adventure_level: 冒险等级(1-3)
              - social_style: 社交风格
              - budget_level: 预算等级(1-3)
              - pace: 旅行节奏
              - planning_style: 规划风格
              - destination_types: 目的地类型
              - accommodation: 住宿偏好
              - activities: 活动偏好
              - decision_factors: 决策因素
              - aversion: 排斥项
              - travel_style: 旅行风格
              - tips: 旅行建议
              - conflicts: 冲突记录列表
              - core_vector: 核心推荐向量
              - interest_vector: 兴趣推荐向量
              - structure_vector: 结构推荐向量
              - llm_prompt: 大模型输入Prompt
              - travel_plan: 大模型生成的旅行规划文本
              - model_info: 模型调用信息
            - error: 错误信息（失败时）
        """
        try:
            # 第一步：融合画像，生成Prompt
            plan_result = self.plan(profile_answers, mbti_type, mbti_responses, user_id)
            if not plan_result["success"]:
                return plan_result

            llm_prompt = plan_result["data"]["llm_prompt"]

            # 第二步：调用Ollama生成旅行规划
            ollama_result = self._ollama.generate(llm_prompt, model=model, options=options)
            if not ollama_result["success"]:
                # Ollama调用失败，仍返回画像数据，但标注生成失败
                plan_result["data"]["travel_plan"] = ""
                plan_result["data"]["model_info"] = {"error": ollama_result["error"]}
                plan_result["data"]["generate_success"] = False
                plan_result["data"]["generate_error"] = ollama_result["error"]
                return plan_result

            # 第三步：合并结果
            ollama_data = ollama_result["data"]
            travel_plan_raw = ollama_data["response"]

            # 清理deepseek-r1的思考过程（<think...</think标签内容）
            travel_plan = self._clean_thinking_tags(travel_plan_raw)

            plan_result["data"]["travel_plan"] = travel_plan
            plan_result["data"]["travel_plan_raw"] = travel_plan_raw
            plan_result["data"]["model_info"] = {
                "model": ollama_data["model"],
                "total_duration_ns": ollama_data["total_duration"],
                "eval_count": ollama_data["eval_count"],
                "eval_duration_ns": ollama_data["eval_duration"],
                "total_duration_s": round(ollama_data["total_duration"] / 1e9, 2) if ollama_data["total_duration"] else 0,
                "eval_duration_s": round(ollama_data["eval_duration"] / 1e9, 2) if ollama_data["eval_duration"] else 0,
                "tokens_per_second": round(
                    ollama_data["eval_count"] / (ollama_data["eval_duration"] / 1e9), 1
                ) if ollama_data["eval_duration"] and ollama_data["eval_count"] else 0,
            }
            plan_result["data"]["generate_success"] = True

            return plan_result

        except Exception as e:
            return {"success": False, "error": f"生成旅行规划失败: {str(e)}"}

    def generate_travel_plan_stream(
        self,
        profile_answers: Dict[int, str],
        mbti_type: str = "",
        mbti_responses: Optional[Dict[int, str]] = None,
        user_id: str = "",
        model: Optional[str] = None,
        options: Optional[Dict] = None,
    ):
        """
        流式生成旅行规划（逐token返回，适用于前端实时展示）

        参数:
            同generate_travel_plan

        返回:
            生成器，每次yield一个字典:
            - {"type": "profile", "data": {...}} 画像融合完成
            - {"type": "token", "content": "..."} 生成的一个token
            - {"type": "done", "data": {...}} 生成完成
            - {"type": "error", "error": "..."} 错误
        """
        try:
            # 第一步：融合画像
            plan_result = self.plan(profile_answers, mbti_type, mbti_responses, user_id)
            if not plan_result["success"]:
                yield {"type": "error", "error": plan_result["error"]}
                return

            # 先返回画像数据
            yield {"type": "profile", "data": plan_result["data"]}

            # 第二步：流式调用Ollama
            llm_prompt = plan_result["data"]["llm_prompt"]
            full_response = ""

            for chunk in self._ollama.generate_stream(llm_prompt, model=model, options=options):
                if "error" in chunk:
                    yield {"type": "error", "error": chunk["error"]}
                    return

                token = chunk.get("token", "")
                full_response += token

                yield {"type": "token", "content": token}

                if chunk.get("done"):
                    # 清理思考标签
                    cleaned = self._clean_thinking_tags(full_response)
                    yield {
                        "type": "done",
                        "data": {
                            "travel_plan": cleaned,
                            "travel_plan_raw": full_response,
                            "model": chunk.get("model", ""),
                        },
                    }

        except Exception as e:
            yield {"type": "error", "error": str(e)}

    def plan(
        self,
        profile_answers: Dict[int, str],
        mbti_type: str = "",
        mbti_responses: Optional[Dict[int, str]] = None,
        user_id: str = "",
    ) -> Dict:
        """
        融合画像并生成LLM Prompt（不调用大模型，仅准备输入数据）

        参数:
            profile_answers: 人物画像问卷回答
            mbti_type: MBTI类型字符串（与mbti_responses二选一）
            mbti_responses: MBTI问卷回答（与mbti_type二选一）
            user_id: 用户标识

        返回:
            标准化结果字典（含llm_prompt但不含travel_plan）
        """
        try:
            if not profile_answers:
                return {"success": False, "error": "人物画像问卷回答不能为空"}

            if not mbti_type and not mbti_responses:
                return {"success": False, "error": "请提供mbti_type或mbti_responses参数"}

            normalized_profile = {int(k): str(v).upper() for k, v in profile_answers.items()}
            profile_result = calculate_profile(normalized_profile)
            mbti_profile = self._get_mbti_profile(mbti_type, mbti_responses)
            unified = integrate_profiles(profile_result, mbti_profile, user_id)
            data = self._unified_to_dict(unified)
            return {"success": True, "data": data}

        except ValueError as e:
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": f"规划失败: {str(e)}"}

    def plan_from_results(
        self,
        profile_result: ProfileResult,
        mbti_profile: TravelPreferenceProfile,
        user_id: str = "",
    ) -> Dict:
        """
        从已有的画像结果直接融合

        参数:
            profile_result: 人物画像计算结果
            mbti_profile: MBTI旅行偏好画像
            user_id: 用户标识

        返回:
            标准化结果字典
        """
        try:
            unified = integrate_profiles(profile_result, mbti_profile, user_id)
            data = self._unified_to_dict(unified)
            return {"success": True, "data": data}
        except Exception as e:
            return {"success": False, "error": f"融合失败: {str(e)}"}

    def get_llm_prompt(
        self,
        profile_answers: Dict[int, str],
        mbti_type: str = "",
        mbti_responses: Optional[Dict[int, str]] = None,
    ) -> Dict:
        """
        仅获取LLM Prompt

        参数:
            profile_answers: 人物画像问卷回答
            mbti_type: MBTI类型
            mbti_responses: MBTI问卷回答

        返回:
            包含llm_prompt的结果字典
        """
        result = self.plan(profile_answers, mbti_type, mbti_responses)
        if result["success"]:
            return {
                "success": True,
                "data": {
                    "llm_prompt": result["data"]["llm_prompt"],
                    "mbti_type": result["data"]["mbti_type"],
                    "overall_confidence": result["data"]["overall_confidence"],
                },
            }
        return result

    def get_report(
        self,
        profile_answers: Dict[int, str],
        mbti_type: str = "",
        mbti_responses: Optional[Dict[int, str]] = None,
        user_id: str = "",
    ) -> str:
        """
        获取文本格式的融合分析报告

        参数:
            profile_answers: 人物画像问卷回答
            mbti_type: MBTI类型
            mbti_responses: MBTI问卷回答
            user_id: 用户标识

        返回:
            文本格式分析报告
        """
        normalized_profile = {int(k): str(v).upper() for k, v in profile_answers.items()}
        profile_result = calculate_profile(normalized_profile)
        mbti_profile = self._get_mbti_profile(mbti_type, mbti_responses)
        unified = integrate_profiles(profile_result, mbti_profile, user_id)
        return generate_unified_report(unified)

    def get_conflict_weights(self) -> Dict:
        """
        获取当前冲突消解权重配置

        返回:
            各维度的权重配置
        """
        return dict(self._conflict_weights)

    def get_profile_summary(
        self,
        profile_answers: Dict[int, str],
        mbti_type: str = "",
        mbti_responses: Optional[Dict[int, str]] = None,
    ) -> Dict:
        """
        获取画像摘要（仅核心维度，适用于前端预览）

        参数:
            profile_answers: 人物画像问卷回答
            mbti_type: MBTI类型
            mbti_responses: MBTI问卷回答

        返回:
            摘要结果字典
        """
        result = self.plan(profile_answers, mbti_type, mbti_responses)
        if not result["success"]:
            return result

        data = result["data"]
        return {
            "success": True,
            "data": {
                "mbti_type": data["mbti_type"],
                "mbti_type_name": data["mbti_type_name"],
                "profile_title": data.get("profile_title", ""),
                "adventure_level": data["adventure_level"],
                "social_style": data["social_style"],
                "budget_level": data["budget_level"],
                "pace": data["pace"],
                "planning_style": data["planning_style"],
                "destination_types": data["destination_types"],
                "accommodation": data["accommodation"],
                "activities": data["activities"],
                "conflict_count": len(data["conflicts"]),
                "overall_confidence": data["overall_confidence"],
                "travel_style": data["travel_style"],
            },
        }

    def _clean_thinking_tags(self, text: str) -> str:
        """
        清理deepseek-r1模型的思考过程标签

        deepseek-r1会在输出中包含<think...</think标签，
        其中是模型的推理过程，需要去除后只保留最终回答

        参数:
            text: 原始模型输出

        返回:
            清理后的文本
        """
        import re
        # 移除<think...</think标签及其内容（支持多行）
        cleaned = re.sub(r"<think\s*.*?</think\s*>", "", text, flags=re.DOTALL)
        # 清理开头和结尾的空白
        cleaned = cleaned.strip()
        return cleaned

    def _get_mbti_profile(
        self,
        mbti_type: str = "",
        mbti_responses: Optional[Dict[int, str]] = None,
    ) -> TravelPreferenceProfile:
        """
        获取MBTI旅行偏好画像（内部方法）

        参数:
            mbti_type: MBTI类型
            mbti_responses: MBTI问卷回答

        返回:
            TravelPreferenceProfile
        """
        if mbti_type:
            validated = validate_mbti_type(mbti_type)
            return analyze_from_mbti_type(validated)
        elif mbti_responses:
            normalized = {int(k): str(v).upper() for k, v in mbti_responses.items()}
            return analyze_from_responses(normalized)
        else:
            raise ValueError("请提供mbti_type或mbti_responses参数")

    def _unified_to_dict(self, unified: UnifiedTravelProfile) -> Dict:
        """
        将UnifiedTravelProfile转换为前端友好的字典格式

        参数:
            unified: 统一旅行画像

        返回:
            标准化字典
        """
        data = unified_to_dict(unified)
        # 确保冲突记录格式清晰
        if "conflicts" in data:
            formatted_conflicts = []
            for c in data["conflicts"]:
                formatted_conflicts.append({
                    "dimension": c.get("dimension", ""),
                    "profile_value": c.get("profile_value", ""),
                    "mbti_value": c.get("mbti_value", ""),
                    "resolution": c.get("resolution", ""),
                    "final_value": c.get("final_value", ""),
                    "reason": c.get("reason", ""),
                })
            data["conflicts"] = formatted_conflicts
        return data


# ============================================================
# 模块级便捷函数（无需实例化即可调用）
# ============================================================

_default_service = TravelPlannerService()


def generate_travel_plan(
    profile_answers: Dict[int, str],
    mbti_type: str = "",
    mbti_responses: Optional[Dict[int, str]] = None,
    user_id: str = "",
    model: Optional[str] = None,
    options: Optional[Dict] = None,
) -> Dict:
    """
    便捷函数：融合画像并调用Ollama生成旅行规划

    参数:
        profile_answers: 人物画像问卷回答
        mbti_type: MBTI类型
        mbti_responses: MBTI问卷回答
        user_id: 用户标识
        model: Ollama模型名称
        options: 生成参数

    返回:
        标准化结果字典
    """
    return _default_service.generate_travel_plan(
        profile_answers, mbti_type, mbti_responses, user_id, model, options
    )


def plan(
    profile_answers: Dict[int, str],
    mbti_type: str = "",
    mbti_responses: Optional[Dict[int, str]] = None,
    user_id: str = "",
) -> Dict:
    """
    便捷函数：融合画像并生成LLM Prompt（不调用大模型）

    参数:
        profile_answers: 人物画像问卷回答
        mbti_type: MBTI类型
        mbti_responses: MBTI问卷回答
        user_id: 用户标识

    返回:
        标准化结果字典
    """
    return _default_service.plan(profile_answers, mbti_type, mbti_responses, user_id)


def get_llm_prompt(
    profile_answers: Dict[int, str],
    mbti_type: str = "",
    mbti_responses: Optional[Dict[int, str]] = None,
) -> Dict:
    """
    便捷函数：仅获取LLM Prompt

    参数:
        profile_answers: 人物画像问卷回答
        mbti_type: MBTI类型
        mbti_responses: MBTI问卷回答

    返回:
        包含llm_prompt的结果字典
    """
    return _default_service.get_llm_prompt(profile_answers, mbti_type, mbti_responses)


def check_ollama() -> Dict:
    """
    便捷函数：检查Ollama服务状态

    返回:
        连接状态字典
    """
    return _default_service.check_ollama()


# ============================================================
# 直接运行时的演示
# ============================================================

if __name__ == "__main__":
    import sys
    import io
    import os

    # Windows控制台UTF-8编码
    if sys.platform == "win32":
        os.system("chcp 65001 >nul 2>&1")
        if sys.stdout and hasattr(sys.stdout, 'buffer'):
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    service = TravelPlannerService()

    print("=" * 60)
    print("     大模型旅行规划服务 - 接口演示")
    print("     模型: deepseek-r1:7b (Ollama本地)")
    print("=" * 60)

    # 演示1：检查Ollama连接
    print("\n--- 演示1：检查Ollama服务状态 ---")
    status = service.check_ollama()
    print(f"  连接状态: {'已连接' if status.get('connected') else '未连接'}")
    if status.get("connected"):
        print(f"  当前模型: {status.get('current_model')}")
        print(f"  模型可用: {'是' if status.get('model_available') else '否'}")
        print(f"  可用模型: {', '.join(status.get('available_models', []))}")
    else:
        print(f"  错误: {status.get('error')}")

    # 演示2：生成完整旅行规划
    print("\n--- 演示2：生成完整旅行规划（低冒险+低社交+低预算 × ENTJ）---")
    mock_profile = {q["id"]: "A" for q in QUESTIONS}
    print("  正在融合画像并调用deepseek-r1:7b生成规划...")
    print("  （首次调用可能需要加载模型，请耐心等待）\n")

    result = service.generate_travel_plan(mock_profile, mbti_type="ENTJ", user_id="demo_user_1")
    if result["success"]:
        data = result["data"]
        print(f"  用户ID: {data['user_id']}")
        print(f"  MBTI: {data['mbti_type']} ({data['mbti_type_name']})")
        print(f"  冒险={data['adventure_level']} 社交={data['social_style']} 预算={data['budget_level']}")
        print(f"  节奏={data['pace']} 规划={data['planning_style']}")
        print(f"  生成成功: {'是' if data.get('generate_success') else '否'}")

        if data.get("model_info"):
            mi = data["model_info"]
            print(f"  模型: {mi.get('model', 'N/A')}")
            print(f"  生成耗时: {mi.get('total_duration_s', 0)}秒")
            print(f"  Token数: {mi.get('eval_count', 0)}")
            print(f"  速度: {mi.get('tokens_per_second', 0)} tokens/s")

        if data.get("travel_plan"):
            print(f"\n  --- 旅行规划内容（前500字）---")
            print(f"  {data['travel_plan'][:500]}...")
        elif data.get("generate_error"):
            print(f"  生成失败: {data['generate_error']}")
    else:
        print(f"  失败: {result['error']}")

    # 演示3：仅获取Prompt（不调用大模型）
    print("\n--- 演示3：仅获取LLM Prompt（不调用大模型）---")
    prompt_result = service.get_llm_prompt(mock_profile, mbti_type="ENTJ")
    if prompt_result["success"]:
        print(f"  MBTI: {prompt_result['data']['mbti_type']}")
        print(f"  Prompt长度: {len(prompt_result['data']['llm_prompt'])}字符")

    # 演示4：画像摘要
    print("\n--- 演示4：画像摘要预览 ---")
    summary = service.get_profile_summary(mock_profile, mbti_type="ENTJ")
    if summary["success"]:
        s = summary["data"]
        print(f"  {s['mbti_type']} {s['mbti_type_name']}")
        print(f"  冒险={s['adventure_level']} 社交={s['social_style']} 预算={s['budget_level']}")
        print(f"  冲突数={s['conflict_count']} 置信度={s['overall_confidence']}")

    # 演示5：冲突消解权重
    print("\n--- 演示5：冲突消解权重配置 ---")
    weights = service.get_conflict_weights()
    for dim, w in weights.items():
        print(f"  {dim}: 人物画像={w['profile']:.1f} MBTI={w['mbti']:.1f}")

    print("\n" + "=" * 60)
    print("  前端接入示例:")
    print("  from travel_planner_service import TravelPlannerService")
    print("  service = TravelPlannerService()")
    print("  result = service.generate_travel_plan(answers, mbti_type='INTJ')")
    print("  travel_plan = result['data']['travel_plan']")
    print("=" * 60)
