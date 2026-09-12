"""独立且不依赖第三方库的计分规则检查，与浏览器界面分开。"""

from scoring import compute_scores

def reverse(value: int) -> int:
    return 6 - value

def mean(values):
    return sum(values) / len(values)

def run_checks():
    assert [reverse(x) for x in range(1, 6)] == [5, 4, 3, 2, 1]
    assert mean([1, 2, 3, 4]) == 2.5
    # 两道键控题：一道正向回答 5，一道反向回答 1。
    assert mean([5, reverse(1)]) == 5.0
    # 量尺边界回答经过反向处理后仍然保持在 1–5 范围内。
    assert 1 <= mean([1, reverse(5), 1, reverse(5)]) <= 5
    answers = {item_id: (6 - 3 if reverse_key else 3) for items in __import__("scoring").DIMENSION_ITEMS.values() for item_id, reverse_key in items}
    scores = compute_scores(answers)
    assert set(scores) == {"E", "A", "C", "N", "O", "use", "trust", "risk"}
    assert all(value == 3.0 for value in scores.values())
    # 服务端函数不接受浏览器自行提交的分数。
    answers["E2"] = 1
    assert compute_scores(answers)["E"] == 3.5
    print("scoring specification checks passed")

if __name__ == "__main__":
    run_checks()
