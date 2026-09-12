import json
import unittest
from pathlib import Path

from scoring import DIMENSION_ITEMS, compute_scores


def keyed_answers(value=3):
    return {
        item_id: (6 - value if reverse else value)
        for items in DIMENSION_ITEMS.values()
        for item_id, reverse in items
    }


class ScoringScenarioTests(unittest.TestCase):
    def test_scoring_configuration_has_28_unique_items(self):
        configured = [item_id for items in DIMENSION_ITEMS.values() for item_id, _ in items]
        self.assertEqual(len(configured), 26)
        self.assertEqual(len(set(configured)), 26)
        self.assertEqual(set(configured), {f"{prefix}{n}" for prefix in "EACNO" for n in range(1, 5)} | {"U1", "U2", "T1", "T2", "R1", "R2"})

    def test_each_item_boundary_respects_its_reverse_key(self):
        """逐题改变到边界，确认每一个反向键都真正生效。"""
        for dimension, items in DIMENSION_ITEMS.items():
            for item_id, reverse in items:
                answers = keyed_answers()
                answers[item_id] = 1
                keyed_value = 5 if reverse else 1
                expected = (3 * (len(items) - 1) + keyed_value) / len(items)
                self.assertEqual(compute_scores(answers)[dimension], expected, item_id)

    def test_dimensions_are_aggregated_independently(self):
        answers = keyed_answers()
        for item_id, reverse in DIMENSION_ITEMS["C"]:
            answers[item_id] = 1 if reverse else 5
        scores = compute_scores(answers)
        self.assertEqual(scores["C"], 5.0)
        self.assertEqual(scores["E"], 3.0)

    def test_mixed_dimension_values(self):
        answers = keyed_answers()
        for item_id, reverse in DIMENSION_ITEMS["E"]:
            answers[item_id] = 2 if reverse else 4
        for item_id, reverse in DIMENSION_ITEMS["risk"]:
            answers[item_id] = 5 if reverse else 1
        scores = compute_scores(answers)
        self.assertEqual(scores["E"], 4.0)
        self.assertEqual(scores["risk"], 1.0)
        self.assertEqual(scores["A"], 3.0)

    def test_boolean_and_decimal_answers_are_rejected(self):
        answers = keyed_answers()
        answers["E1"] = True
        with self.assertRaises(ValueError):
            compute_scores(answers)
        answers = keyed_answers()
        answers["E1"] = 3.5
        with self.assertRaises(ValueError):
            compute_scores(answers)

    def test_non_object_answer_containers_are_rejected(self):
        for invalid in (None, [], "回答", 3):
            with self.assertRaises(ValueError):
                compute_scores(invalid)

    def test_unknown_item_ids_are_rejected(self):
        answers = keyed_answers()
        answers["E99"] = 3
        with self.assertRaises(ValueError):
            compute_scores(answers)

    def test_answer_mapping_order_does_not_change_scores(self):
        answers = keyed_answers()
        expected = compute_scores(answers)
        reversed_answers = dict(reversed(list(answers.items())))
        self.assertEqual(compute_scores(reversed_answers), expected)

    def test_fractional_dimension_mean_is_not_rounded_early(self):
        answers = keyed_answers()
        answers["E1"] = 1
        self.assertEqual(compute_scores(answers)["E"], 2.5)

    def test_repeated_calls_do_not_mutate_answers(self):
        answers = keyed_answers()
        original = answers.copy()
        first = compute_scores(answers)
        second = compute_scores(answers)
        self.assertEqual(first, second)
        self.assertEqual(answers, original)

    def test_synthetic_fixture_contains_all_five_uniform_levels(self):
        fixture = json.loads(Path("data/synthetic_responses_10.json").read_text())
        values = sorted({row["scores"]["E"] for row in fixture})
        self.assertEqual(values, [1.0, 2.0, 3.0, 4.0, 5.0])
        self.assertEqual(len(fixture), 10)


if __name__ == "__main__":
    unittest.main()
