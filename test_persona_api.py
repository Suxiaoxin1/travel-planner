# -*- coding: utf-8 -*-
"""
人物画像分析API测试脚本
用于测试后端API接口是否正常工作
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_health():
    """测试健康检查接口"""
    print("=" * 60)
    print("测试1: 健康检查接口")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
        
        if response.status_code == 200:
            print("✓ 健康检查通过")
            return True
        else:
            print("✗ 健康检查失败")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ 无法连接到后端服务，请确保 api_server.py 已启动")
        return False
    except Exception as e:
        print(f"✗ 测试失败: {e}")
        return False

def test_get_questions():
    """测试获取题目接口"""
    print("\n" + "=" * 60)
    print("测试2: 获取题目接口")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/persona/questions")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                print(f"✓ 成功获取题目，共 {len(data['data'])} 道")
                # 显示前2题作为示例
                for i, q in enumerate(data['data'][:2]):
                    print(f"  题目{i+1}: {q['text'][:30]}...")
                return True
            else:
                print(f"✗ 响应格式错误: {data}")
                return False
        else:
            print(f"✗ 请求失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ 测试失败: {e}")
        return False

def test_analyze():
    """测试分析接口"""
    print("\n" + "=" * 60)
    print("测试3: 分析接口")
    print("=" * 60)
    
    # 构造测试数据：模拟用户回答了20道题
    test_answers = {
        "1": "A",   # 宅家
        "2": "A",   # 快捷酒店
        "3": "A",   # 凑满减
        "4": "A",   # 冰箱贴
        "5": "A",   # 低头快吃
        "6": "A",   # 免费景点
        "7": "A",   # 酒店升级
        "8": "A",   # 只约1-2人
        "9": "A",   # 坚决不去
        "10": "A",  # 20寸箱子
        "11": "A",  # 三亚躺平
        "12": "A",  # 高铁二等座
        "13": "A",  # 不如住酒店
        "14": "A",  # 大众点评
        "15": "A",  # 自己一人
        "16": "A",  # 看视频就好
        "17": "A",  # 睡到自然醒
        "18": "A",  # 从未住过
        "19": "B",  # 基本意外险
        "20": "A",  # 酒店阳台
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/persona/analyze",
            json={"answers": test_answers},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success') and data.get('data'):
                result = data['data']
                print(f"✓ 分析成功")
                print(f"  答题数: {result.get('answeredCount', 'N/A')}")
                print(f"  冒险指数: {result.get('adventureScore', 'N/A')}")
                print(f"  社交指数: {result.get('socialScore', 'N/A')}")
                print(f"  预算指数: {result.get('budgetScore', 'N/A')}")
                print(f"  画像标题: {result.get('profileTitle', 'N/A')}")
                print(f"  置信度: {result.get('confidence', 'N/A')}")
                return True
            else:
                print(f"✗ 分析失败: {data.get('error', '未知错误')}")
                return False
        else:
            print(f"✗ 请求失败: {response.status_code}")
            print(f"  响应: {response.text}")
            return False
    except Exception as e:
        print(f"✗ 测试失败: {e}")
        return False

def test_validate():
    """测试校验接口"""
    print("\n" + "=" * 60)
    print("测试4: 校验接口")
    print("=" * 60)
    
    # 测试无效数据
    invalid_answers = {
        "1": "D",   # 无效选项
        "999": "A",  # 无效题号
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/persona/validate",
            json={"answers": invalid_answers},
            headers={"Content-Type": "application/json"}
        )
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"校验结果: {json.dumps(data, ensure_ascii=False, indent=2)}")
            
            if not data.get('valid'):
                print("✓ 校验接口正常工作（正确识别无效数据）")
                return True
            else:
                print("✗ 校验接口未识别无效数据")
                return False
        else:
            print(f"✗ 请求失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ 测试失败: {e}")
        return False

def main():
    """主测试函数"""
    print("\n" + "=" * 60)
    print("人物画像分析API - 自动化测试")
    print("=" * 60)
    print("\n提示: 请确保后端服务已启动 (python api_server.py)")
    print("服务地址: <ADDRESS_REDACTED>
    print("")
    
    # 等待用户确认
    input("按Enter键开始测试...")
    
    results = []
    
    # 执行测试
    results.append(("健康检查", test_health()))
    
    if results[0][1]:  # 只有健康检查通过才继续
        results.append(("获取题目", test_get_questions()))
        results.append(("分析接口", test_analyze()))
        results.append(("校验接口", test_validate()))
    else:
        print("\n✗ 后端服务未启动，跳过后续测试")
        print("  请先启动后端服务: python api_server.py")
    
    # 输出测试报告
    print("\n" + "=" * 60)
    print("测试报告")
    print("=" * 60)
    
    passed = 0
    total = len(results)
    
    for name, result in results:
        status = "✓ 通过" if result else "✗ 失败"
        print(f"{name}: {status}")
        if result:
            passed += 1
    
    print("\n" + "-" * 60)
    print(f"总计: {passed}/{total} 测试通过")
    print("=" * 60)
    
    if passed == total:
        print("\n🎉 所有测试通过！API服务运行正常。")
        return 0
    else:
        print(f"\n⚠️  有 {total - passed} 个测试失败，请检查服务。")
        return 1

if __name__ == "__main__":
    exit(main())
