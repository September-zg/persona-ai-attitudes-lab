import unittest

from scoring import DIMENSION_ITEMS, compute_scores


class ScoringTests(unittest.TestCase):
    def keyed_three_answers(self):
        return {
            item_id: (6 - 3 if reverse else 3)
            for items in DIMENSION_ITEMS.values()
            for item_id, reverse in items
        }

    def test_all_three_scores_to_three(self):
        scores = compute_scores(self.keyed_three_answers())
        self.assertEqual(set(scores), {"E", "A", "C", "N", "O", "use", "trust", "risk"})
        self.assertTrue(all(value == 3.0 for value in scores.values()))

    def test_reverse_key_changes_dimension_mean(self):
        answers = self.keyed_three_answers()
        answers["E2"] = 1
        self.assertEqual(compute_scores(answers)["E"], 3.5)

    def test_legal_scale_boundaries_are_accepted(self):
        answers = self.keyed_three_answers()
        answers["E1"] = 1
        answers["E3"] = 5
        scores = compute_scores(answers)
        self.assertEqual(scores["E"], 3.0)

    def test_minimum_and_maximum_dimension_scores(self):
        minimum = {
            item_id: (5 if reverse else 1)
            for items in DIMENSION_ITEMS.values()
            for item_id, reverse in items
        }
        maximum = {
            item_id: (1 if reverse else 5)
            for items in DIMENSION_ITEMS.values()
            for item_id, reverse in items
        }
        self.assertTrue(all(value == 1.0 for value in compute_scores(minimum).values()))
        self.assertTrue(all(value == 5.0 for value in compute_scores(maximum).values()))

    def test_invalid_or_missing_answers_are_rejected(self):
        answers = self.keyed_three_answers()
        del answers["E1"]
        with self.assertRaises(ValueError):
            compute_scores(answers)
        answers = self.keyed_three_answers()
        answers["E1"] = 6
        with self.assertRaises(ValueError):
            compute_scores(answers)


if __name__ == "__main__":
    unittest.main()
