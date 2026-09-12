"""本地服务器和测试共用的固定计分规则。"""

DIMENSION_ITEMS = {
    "E": [("E1", False), ("E2", True), ("E3", False), ("E4", True)],
    "A": [("A1", False), ("A2", True), ("A3", False), ("A4", True)],
    "C": [("C1", False), ("C2", False), ("C3", True), ("C4", True)],
    "N": [("N1", False), ("N2", False), ("N3", True), ("N4", True)],
    "O": [("O1", False), ("O2", True), ("O3", True), ("O4", True)],
    "use": [("U1", False), ("U2", False)],
    "trust": [("T1", False), ("T2", True)],
    "risk": [("R1", False), ("R2", True)],
}

ALL_ITEMS = {item_id for items in DIMENSION_ITEMS.values() for item_id, _ in items}


def compute_scores(answers):
    if not isinstance(answers, dict):
        raise ValueError("answers 必须是对象")
    missing = ALL_ITEMS - answers.keys()
    if missing:
        raise ValueError("缺少回答：" + "、".join(sorted(missing)))
    unknown = set(answers) - ALL_ITEMS
    if unknown:
        raise ValueError("包含未知题目：" + "、".join(sorted(unknown)))
    values = {}
    for item_id in ALL_ITEMS:
        value = answers[item_id]
        if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 5:
            raise ValueError(f"回答 {item_id} 必须是 1 到 5 的整数")
        values[item_id] = value
    scores = {}
    for dimension, items in DIMENSION_ITEMS.items():
        keyed = [(6 - values[item_id]) if reverse else values[item_id] for item_id, reverse in items]
        scores[dimension] = sum(keyed) / len(keyed)
    return scores
