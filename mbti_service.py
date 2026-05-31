# -*- coding: utf-8 -*-
"""
MBTI性格分析服务
提供标准化接口，供前端界面调用。
基于MBTI四维度评估问卷（28题），计算用户的MBTI类型，
生成旅行偏好画像。

前端接入方式：
  from mbti_service import MBTIService
  service = MBTIService()
  result = service.analyze_by_type("INTJ")
  result = service.analyze_by_responses({1:"A", 2:"B", ...})
"""

import json
from dataclasses import asdict
from typing import Dict, Optional, List

from mbti_travel_core import (
    validate_mbti_type,
    parse_mbti_type,
    analyze_from_mbti_type,
    analyze_from_responses,
    profile_to_dict,
    profile_to_json,
    generate_travel_preference_report,
    TravelPreferenceProfile,
)
from mbti_travel_config import (
    VALID_MBTI_TYPES,
    MBTI_ASSESSMENT_QUESTIONS,
)


class MBTIService:
    """MBTI性格分析服务类，封装所有MBTI旅行偏好分析功能"""

    def __init__(self):
        """初始化服务，预加载题目和类型数据"""
        self._questions = MBTI_ASSESSMENT_QUESTIONS
        self._valid_types = VALID_MBTI_TYPES

    def get_questions(self, dimension: Optional[str] = None) -> List[Dict]:
        """
        获取MBTI评估问卷题目

        参数:
            dimension: 维度过滤（可选），"EI"/"SN"/"TF"/"JP"

        返回:
            题目列表，每项包含 id, dimension, text, options
        """
        result = []
        for q in self._questions:
            if dimension and q["dimension"] != dimension:
                continue
            item = {
                "id": q["id"],
                "dimension": q["dimension"],
                "text": q["text"],
                "options": [
                    {"label": opt[0], "text": opt[1], "dimension_value": opt[2]}
                    for opt in q["options"]
                ],
            }
            result.append(item)
        return result

    def get_dimensions(self) -> List[Dict]:
        """
        获取MBTI四个维度的信息

        返回:
            维度信息列表
        """
        return [
            {"code": "EI", "name": "外向-内向", "options": ["E", "I"],
             "description": "决定旅行中的社交需求和能量来源"},
            {"code": "SN", "name": "感觉-直觉", "options": ["S", "N"],
             "description": "决定旅行中的体验关注点"},
            {"code": "TF", "name": "思维-情感", "options": ["T", "F"],
             "description": "决定旅行中的决策因素"},
            {"code": "JP", "name": "判断-感知", "options": ["J", "P"],
             "description": "决定旅行中的规划风格"},
        ]

    def get_valid_types(self) -> List[str]:
        """
        获取所有合法的MBTI类型

        返回:
            16种MBTI类型列表
        """
        return list(self._valid_types)

    def validate_type(self, mbti_type: str) -> Dict:
        """
        校验MBTI类型字符串的合法性

        参数:
            mbti_type: MBTI类型字符串

        返回:
            校验结果，包含 valid, normalized, error
        """
        try:
            normalized = validate_mbti_type(mbti_type)
            return {"valid": True, "normalized": normalized, "error": None}
        except ValueError as e:
            return {"valid": False, "normalized": None, "error": str(e)}

    def analyze_by_type(self, mbti_type: str) -> Dict:
        """
        根据MBTI类型直接生成旅行偏好画像

        参数:
            mbti_type: MBTI四字母类型（如"INTJ"），大小写不敏感

        返回:
            标准化结果字典，包含:
            - success: 是否成功
            - data: 画像数据（成功时）
              - mbti_type: MBTI类型
              - mbti_type_name: 类型中文名
              - mbti_confidence: 置信度
              - dimension_scores: 四维度得分
              - pace: 旅行节奏
              - destination_types: 目的地类型偏好
              - accommodation: 住宿偏好
              - activities: 活动偏好
              - planning_style: 规划风格
              - social: 社交偏好
              - decision_factors: 决策因素
              - aversion: 排斥项
              - travel_style: 旅行风格
              - tips: 旅行建议
              - core_vector: 核心推荐向量
              - interest_vector: 兴趣推荐向量
              - structure_vector: 结构推荐向量
            - error: 错误信息（失败时）
        """
        try:
            validated = validate_mbti_type(mbti_type)
            profile = analyze_from_mbti_type(validated)
            data = self._profile_to_dict(profile)
            return {"success": True, "data": data}
        except ValueError as e:
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": f"分析失败: {str(e)}"}

    def analyze_by_responses(self, responses: Dict[int, str]) -> Dict:
        """
        根据MBTI问卷回答生成旅行偏好画像

        参数:
            responses: 问卷回答字典，键为题号(1-28)，值为"A"或"B"
                     示例: {1: "A", 2: "B", 3: "A", ...}

        返回:
            标准化结果字典（同analyze_by_type）
        """
        try:
            if not responses:
                return {"success": False, "error": "问卷回答不能为空"}

            # 转换键类型为int，值为大写
            normalized = {}
            for k, v in responses.items():
                normalized[int(k)] = str(v).upper()

            profile = analyze_from_responses(normalized)
            data = self._profile_to_dict(profile)
            return {"success": True, "data": data}
        except Exception as e:
            return {"success": False, "error": f"分析失败: {str(e)}"}

    def get_report(self, mbti_type: str = "", responses: Optional[Dict[int, str]] = None) -> str:
        """
        获取文本格式的旅行偏好分析报告

        参数:
            mbti_type: MBTI类型（与responses二选一）
            responses: 问卷回答（与mbti_type二选一）

        返回:
            文本格式分析报告
        """
        if mbti_type:
            validated = validate_mbti_type(mbti_type)
            profile = analyze_from_mbti_type(validated)
        elif responses:
            normalized = {int(k): str(v).upper() for k, v in responses.items()}
            profile = analyze_from_responses(normalized)
        else:
            return "错误：请提供mbti_type或responses参数"
        return generate_travel_preference_report(profile)

    def get_all_types_summary(self) -> List[Dict]:
        """
        获取所有16种MBTI类型的摘要信息

        返回:
            类型摘要列表
        """
        summaries = []
        for mbti_type in self._valid_types:
            profile = analyze_from_mbti_type(mbti_type)
            summaries.append({
                "mbti_type": profile.mbti_type,
                "mbti_type_name": profile.mbti_type_name,
                "pace": profile.pace,
                "social": profile.social,
                "planning_style": profile.planning_style,
                "travel_style": profile.travel_style,
            })
        return summaries

    def validate_responses(self, responses: Dict[int, str]) -> Dict:
        """
        校验MBTI问卷回答的合法性

        参数:
            responses: 问卷回答字典

        返回:
            校验结果，包含 valid, errors, warnings, dimension_coverage
        """
        errors = []
        warnings = []

        # 检查题号范围
        valid_ids = {q["id"] for q in self._questions}
        for q_id in responses:
            if int(q_id) not in valid_ids:
                errors.append(f"无效题号: {q_id}")

        # 检查选项合法性
        for q_id, choice in responses.items():
            if str(choice).upper() not in ("A", "B"):
                errors.append(f"第{q_id}题无效选项: {choice}，仅允许A或B")

        # 检查各维度覆盖情况
        dimension_questions = {}
        for q in self._questions:
            dim = q["dimension"]
            if dim not in dimension_questions:
                dimension_questions[dim] = []
            dimension_questions[dim].append(q["id"])

        dimension_coverage = {}
        for dim, q_ids in dimension_questions.items():
            answered = sum(1 for qid in q_ids if int(qid) in {int(k) for k in responses})
            total = len(q_ids)
            dimension_coverage[dim] = {"answered": answered, "total": total}
            if answered < total:
                warnings.append(f"{dim}维度未答完: {answered}/{total}")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "dimension_coverage": dimension_coverage,
            "answer_count": len(responses),
        }

    def _profile_to_dict(self, profile: TravelPreferenceProfile) -> Dict:
        """
        将TravelPreferenceProfile转换为前端友好的字典格式

        参数:
            profile: MBTI旅行偏好画像

        返回:
            标准化字典
        """
        data = profile_to_dict(profile)
        # 确保关键字段存在且格式正确
        data["mbti_type"] = profile.mbti_type
        data["mbti_type_name"] = profile.mbti_type_name
        data["mbti_confidence"] = profile.mbti_confidence
        return data


# ============================================================
# 模块级便捷函数（无需实例化即可调用）
# ============================================================

_default_service = MBTIService()


def analyze_by_type(mbti_type: str) -> Dict:
    """
    便捷函数：根据MBTI类型分析旅行偏好

    参数:
        mbti_type: MBTI类型字符串

    返回:
        标准化结果字典
    """
    return _default_service.analyze_by_type(mbti_type)


def analyze_by_responses(responses: Dict[int, str]) -> Dict:
    """
    便捷函数：根据问卷回答分析旅行偏好

    参数:
        responses: 问卷回答字典

    返回:
        标准化结果字典
    """
    return _default_service.analyze_by_responses(responses)


def get_questions(dimension: Optional[str] = None) -> List[Dict]:
    """
    便捷函数：获取MBTI评估问卷题目

    参数:
        dimension: 维度过滤（可选）

    返回:
        题目列表
    """
    return _default_service.get_questions(dimension)


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

    service = MBTIService()

    print("=" * 56)
    print("     MBTI性格分析服务 - 接口演示")
    print("=" * 56)

    # 演示1：获取题目信息
    print("\n--- 演示1：获取题目信息 ---")
    dimensions = service.get_dimensions()
    for d in dimensions:
        print(f"  {d['code']}: {d['name']} - {d['description']}")
    sample = service.get_questions()[:2]
    for q in sample:
        print(f"  第{q['id']}题 [{q['dimension']}]: {q['text']}")
        for opt in q["options"]:
            print(f"    {opt['label']}. {opt['text']}")

    # 演示2：根据MBTI类型分析
    print("\n--- 演示2：根据MBTI类型分析（INTJ）---")
    result = service.analyze_by_type("INTJ")
    if result["success"]:
        data = result["data"]
        print(f"  类型: {data['mbti_type']} ({data['mbti_type_name']})")
        print(f"  节奏: {data['pace']}")
        print(f"  社交: {data['social']}")
        print(f"  规划: {data['planning_style']}")
        print(f"  目的地: {', '.join(data['destination_types'])}")
        print(f"  住宿: {', '.join(data['accommodation'])}")
        print(f"  活动: {', '.join(data['activities'])}")
        print(f"  风格: {data['travel_style']}")

    # 演示3：根据问卷回答分析
    print("\n--- 演示3：根据问卷回答分析（构造E+I+S+N+T+F+J+P混合回答）---")
    # 构造一个INTJ倾向的回答：EI选I, SN选N, TF选T, JP选J
    mock_responses = {}
    for q in MBTI_ASSESSMENT_QUESTIONS:
        dim = q["dimension"]
        # INTJ: I(选B), N(选B), T(选A), J(选A)
        if dim == "EI":
            mock_responses[q["id"]] = "B"  # I
        elif dim == "SN":
            mock_responses[q["id"]] = "B"  # N
        elif dim == "TF":
            mock_responses[q["id"]] = "A"  # T
        elif dim == "JP":
            mock_responses[q["id"]] = "A"  # J
    result2 = service.analyze_by_responses(mock_responses)
    if result2["success"]:
        data2 = result2["data"]
        print(f"  推断类型: {data2['mbti_type']} ({data2['mbti_type_name']})")
        print(f"  置信度: {data2['mbti_confidence']}")

    # 演示4：类型校验
    print("\n--- 演示4：类型校验 ---")
    v1 = service.validate_type("intj")
    v2 = service.validate_type("XYZ")
    print(f"  'intj' → 合法: {v1['valid']}, 标准化: {v1['normalized']}")
    print(f"  'XYZ' → 合法: {v2['valid']}, 错误: {v2['error']}")

    # 演示5：所有类型摘要
    print("\n--- 演示5：16种MBTI类型摘要 ---")
    summaries = service.get_all_types_summary()
    for s in summaries:
        print(f"  {s['mbti_type']} {s['mbti_type_name']}: {s['social']} | {s['pace']} | {s['planning_style']}")

    print("\n" + "=" * 56)
    print("  前端接入示例:")
    print("  from mbti_service import MBTIService")
    print("  service = MBTIService()")
    print("  result = service.analyze_by_type('INTJ')")
    print("  result = service.analyze_by_responses({1:'A', 2:'B', ...})")
    print("=" * 56)
