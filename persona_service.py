# -*- coding: utf-8 -*-
"""
人物画像分析服务
提供标准化接口，供前端界面调用。
基于100道问卷题目，计算用户的冒险指数、社交指数、预算指数，
生成人物画像分析结果。

前端接入方式：
  from persona_service import PersonaService
  service = PersonaService()
  result = service.analyze(answers)
"""

import json
from dataclasses import asdict
from typing import Dict, Optional, List

from profile_calculator import (
    calculate_profile,
    classify_dimension,
    generate_report,
    ProfileResult,
    QUESTIONS,
    DIMENSION_LABELS,
    DIMENSION_DESCRIPTIONS,
    TRAVEL_SUGGESTIONS,
)


class PersonaService:
    """人物画像分析服务类，封装所有人物画像相关功能"""

    def __init__(self):
        """初始化服务，预加载题目数据"""
        self._questions = QUESTIONS
        self._question_count = len(QUESTIONS)

    def get_questions(self, category: Optional[str] = None) -> List[Dict]:
        """
        获取问卷题目列表

        参数:
            category: 题目分类过滤（可选），如"出行决策"/"消费行为"/"社交偏好"/"冒险倾向"/"生活方式"/"风险态度"

        返回:
            题目列表，每项包含 id, category, text, options
        """
        result = []
        for q in self._questions:
            if category and q["category"] != category:
                continue
            item = {
                "id": q["id"],
                "category": q["category"],
                "text": q["text"],
                "options": [
                    {"label": opt[0], "text": opt[1],
                     "scores": {"adventure": opt[2], "social": opt[3], "budget": opt[4]}}
                    for opt in q["options"]
                ],
            }
            result.append(item)
        return result

    def get_categories(self) -> List[str]:
        """
        获取所有题目分类

        返回:
            分类名称列表
        """
        seen = []
        for q in self._questions:
            if q["category"] not in seen:
                seen.append(q["category"])
        return seen

    def get_question_count(self) -> int:
        """
        获取题目总数

        返回:
            题目总数
        """
        return self._question_count

    def analyze(self, answers: Dict[int, str]) -> Dict:
        """
        核心分析接口：根据用户答题结果计算人物画像

        参数:
            answers: 问卷回答字典，键为题号(1-100)，值为选项标签("A"/"B"/"C")
                     示例: {1: "A", 2: "B", 3: "C", ...}

        返回:
            标准化结果字典，包含:
            - success: 是否成功
            - data: 画像数据（成功时）
              - adventure_score: 冒险指数(0-100)
              - social_score: 社交指数(0-100)
              - budget_score: 预算指数(0-100)
              - adventure_level: 冒险级别(low/mid/high)
              - social_level: 社交级别(low/mid/high)
              - budget_level: 预算级别(low/mid/high)
              - adventure_label: 冒险倾向标签
              - social_label: 社交倾向标签
              - budget_label: 预算倾向标签
              - confidence: 置信度(0-1)
              - answered_count: 已答题数
              - profile_title: 画像标题
              - profile_desc: 画像描述
              - destinations: 推荐目的地
              - travel_style: 旅行风格
              - tips: 旅行建议
            - error: 错误信息（失败时）
        """
        try:
            # 参数校验
            if not answers:
                return {"success": False, "error": "问卷回答不能为空"}

            # 转换键类型为int
            normalized = {}
            for k, v in answers.items():
                normalized[int(k)] = str(v).upper()

            # 计算画像
            result = calculate_profile(normalized)

            # 构建标准化输出
            data = self._result_to_dict(result)
            return {"success": True, "data": data}

        except Exception as e:
            return {"success": False, "error": f"分析失败: {str(e)}"}

    def analyze_batch(self, answers_list: List[Dict[int, str]]) -> List[Dict]:
        """
        批量分析接口：同时处理多个用户的问卷

        参数:
            answers_list: 多个用户的问卷回答列表

        返回:
            标准化结果列表
        """
        return [self.analyze(answers) for answers in answers_list]

    def get_report(self, answers: Dict[int, str]) -> str:
        """
        获取文本格式分析报告

        参数:
            answers: 问卷回答字典

        返回:
            文本格式分析报告
        """
        normalized = {int(k): str(v).upper() for k, v in answers.items()}
        result = calculate_profile(normalized)
        return generate_report(result)

    def validate_answers(self, answers: Dict[int, str]) -> Dict:
        """
        校验问卷回答的合法性

        参数:
            answers: 问卷回答字典

        返回:
            校验结果，包含 valid, errors, warnings
        """
        errors = []
        warnings = []

        # 检查答题数量
        count = len(answers)
        if count < 15:
            warnings.append(f"答题数不足15题（当前{count}题），画像置信度将为0")

        # 检查题号范围
        valid_ids = {q["id"] for q in self._questions}
        for q_id in answers:
            if int(q_id) not in valid_ids:
                errors.append(f"无效题号: {q_id}")

        # 检查选项合法性
        question_map = {q["id"]: q for q in self._questions}
        valid_labels = {"A", "B", "C"}
        for q_id, choice in answers.items():
            q = question_map.get(int(q_id))
            if q:
                allowed = {opt[0] for opt in q["options"]}
                if str(choice).upper() not in allowed:
                    errors.append(f"第{q_id}题无效选项: {choice}，允许: {allowed}")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "answer_count": count,
        }

    def _result_to_dict(self, result: ProfileResult) -> Dict:
        """
        将ProfileResult转换为前端友好的字典格式

        参数:
            result: 画像计算结果

        返回:
            标准化字典
        """
        return {
            "adventure_score": result.adventure_score,
            "social_score": result.social_score,
            "budget_score": result.budget_score,
            "adventure_level": classify_dimension(result.adventure_score),
            "social_level": classify_dimension(result.social_score),
            "budget_level": classify_dimension(result.budget_score),
            "adventure_label": result.adventure_label,
            "social_label": result.social_label,
            "budget_label": result.budget_label,
            "confidence": result.confidence,
            "answered_count": result.answered_count,
            "profile_title": result.profile_title,
            "profile_desc": result.profile_desc,
            "destinations": result.destinations,
            "travel_style": result.travel_style,
            "tips": result.tips,
        }


# ============================================================
# 模块级便捷函数（无需实例化即可调用）
# ============================================================

_default_service = PersonaService()


def analyze(answers: Dict[int, str]) -> Dict:
    """
    便捷函数：分析人物画像

    参数:
        answers: 问卷回答字典

    返回:
        标准化结果字典
    """
    return _default_service.analyze(answers)


def get_questions(category: Optional[str] = None) -> List[Dict]:
    """
    便捷函数：获取问卷题目

    参数:
        category: 题目分类过滤（可选）

    返回:
        题目列表
    """
    return _default_service.get_questions(category)


def get_report(answers: Dict[int, str]) -> str:
    """
    便捷函数：获取文本格式分析报告

    参数:
        answers: 问卷回答字典

    返回:
        文本格式报告
    """
    return _default_service.get_report(answers)


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

    service = PersonaService()

    print("=" * 56)
    print("     人物画像分析服务 - 接口演示")
    print("=" * 56)

    # 演示1：获取题目信息
    print("\n--- 演示1：获取题目信息 ---")
    categories = service.get_categories()
    print(f"  题目分类: {categories}")
    print(f"  题目总数: {service.get_question_count()}")
    sample = service.get_questions()[:2]
    for q in sample:
        print(f"  第{q['id']}题 [{q['category']}]: {q['text']}")
        for opt in q["options"]:
            print(f"    {opt['label']}. {opt['text']}")

    # 演示2：构造mock数据并分析
    print("\n--- 演示2：分析人物画像（高冒险+低社交+低预算）---")
    # 构造极端回答：每题选A（冒险0,社交0,预算0 → 低冒险+低社交+低预算）
    mock_answers = {q["id"]: "A" for q in QUESTIONS}
    result = service.analyze(mock_answers)
    if result["success"]:
        data = result["data"]
        print(f"  冒险指数: {data['adventure_score']:.1f} ({data['adventure_level']})")
        print(f"  社交指数: {data['social_score']:.1f} ({data['social_level']})")
        print(f"  预算指数: {data['budget_score']:.1f} ({data['budget_level']})")
        print(f"  画像标题: {data['profile_title']}")
        print(f"  置信度: {data['confidence']}")

    # 演示3：校验回答
    print("\n--- 演示3：校验问卷回答 ---")
    validation = service.validate_answers({1: "A", 2: "B", 999: "X"})
    print(f"  合法: {validation['valid']}")
    print(f"  错误: {validation['errors']}")
    print(f"  警告: {validation['warnings']}")

    # 演示4：JSON输出
    print("\n--- 演示4：JSON格式输出 ---")
    json_output = json.dumps(result, ensure_ascii=False, indent=2)
    print(f"  {json_output[:300]}...")

    print("\n" + "=" * 56)
    print("  前端接入示例:")
    print("  from persona_service import PersonaService")
    print("  service = PersonaService()")
    print("  result = service.analyze({1:'A', 2:'B', 3:'C', ...})")
    print("=" * 56)
