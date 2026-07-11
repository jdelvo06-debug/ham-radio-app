#!/usr/bin/env python3
"""Integrity checks for the bundled 2026-2030 Technician question pool."""

import json
import re
import unittest
import zipfile
from collections import Counter
from pathlib import Path
from xml.etree import ElementTree

import generate_complete_json


ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "my-study-app" / "app"
OFFICIAL_POOL = ROOT / "content" / "2026-2030-technician-pool-feb-19-2026.docx"
QUESTION_JSON = APP / "ham_radio_questions.json"
LESSONS_JSON = APP / "lessons.json"

ERRATA = {
    "T1C01": "For which classes of amateur radio licenses does the FCC currently issue new licenses?",
    "T5A05": "A difference in which of the following causes electron flow?",
    "T7A09": "What is the function of the switch which selects either SSB or CW-FM on some VHF power amplifiers?",
    "T0A10": "What hazard exists when rapidly charging or discharging an unprotected battery?",
}

FULL_D_OPTIONS = {
    "T1E11": "An amateur operator designated by the licensee of a station to be responsible for transmissions and FCC rules compliance at that station",
    "T1F08": "Temporary authorization for an unlicensed person to transmit on the amateur bands for technical experiments",
    "T2C06": "A training program that certifies amateur operators for membership in the Radio Amateur Civil Emergency Service",
    "T7B11": "Turning the squelch control fully clockwise to prevent the transmitted signal from triggering the squelch circuit",
}

FIGURE_QUESTIONS = {
    "T6A09": "/figures/technician-t2.jpg",
    "T6C02": "/figures/technician-t1.jpg",
    "T6C03": "/figures/technician-t1.jpg",
    "T6C04": "/figures/technician-t1.jpg",
    "T6C05": "/figures/technician-t1.jpg",
    "T6C06": "/figures/technician-t2.jpg",
    "T6C07": "/figures/technician-t2.jpg",
    "T6C08": "/figures/technician-t2.jpg",
    "T6C09": "/figures/technician-t2.jpg",
    "T6C10": "/figures/technician-t3.jpg",
    "T6C11": "/figures/technician-t3.jpg",
    "T6D10": "/figures/technician-t1.jpg",
}

ALTERNATE_PARSERS = {
    "build_questions_json.py",
    "complete_remaining_questions.py",
    "final_parser.py",
    "parse_all_questions.py",
    "parse_ham_questions.py",
    "parse_questions.py",
    "raw_questions.txt",
}


def docx_paragraphs(path: Path) -> list[str]:
    with zipfile.ZipFile(path) as archive:
        root = ElementTree.fromstring(archive.read("word/document.xml"))
    namespace = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    paragraphs = []
    for paragraph in root.iter(f"{namespace}p"):
        text = "".join(node.text or "" for node in paragraph.iter(f"{namespace}t"))
        if text.strip():
            paragraphs.append(text.strip())
    return paragraphs


class ContentPipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.questions = json.loads(QUESTION_JSON.read_text())
        cls.by_id = {question["id"]: question for question in cls.questions}
        cls.paragraphs = docx_paragraphs(OFFICIAL_POOL)

    def test_all_409_ids_and_answer_keys_match_official_pool(self) -> None:
        header = re.compile(r"^(T\d[A-Z]\d{2})\s+\(([A-D])\)")
        official = dict(match.groups() for line in self.paragraphs if (match := header.match(line)))
        bundled = {question["id"]: question["correctAnswer"] for question in self.questions}
        self.assertEqual(409, len(official))
        self.assertEqual(official, bundled)

    def test_generator_parses_the_complete_official_pool(self) -> None:
        start = self.paragraphs.index("T1A01 (C) [97.1]")
        parsed = generate_complete_json.parse_questions("\n".join(self.paragraphs[start : start + 7]))
        self.assertEqual(1, len(parsed))

    def test_errata_wording_matches_corrected_pool(self) -> None:
        for question_id, wording in ERRATA.items():
            self.assertEqual(wording, self.by_id[question_id]["question"])

    def test_truncated_d_options_are_complete(self) -> None:
        for question_id, option in FULL_D_OPTIONS.items():
            self.assertEqual(option, self.by_id[question_id]["options"][3])

    def test_every_official_figure_reference_has_metadata(self) -> None:
        actual = {
            question["id"]: question["figure"]
            for question in self.questions
            if "figure" in question
        }
        self.assertEqual(FIGURE_QUESTIONS, actual)

    def test_lesson_counts_are_derived_from_pool(self) -> None:
        expected = Counter(question["id"][:2] for question in self.questions)
        lessons = json.loads(LESSONS_JSON.read_text())["lessons"]
        actual = {lesson["id"]: lesson["questionCount"] for lesson in lessons}
        self.assertEqual(dict(sorted(expected.items())), actual)

    def test_generate_complete_json_is_the_only_parser(self) -> None:
        remaining = sorted(path for path in ALTERNATE_PARSERS if (ROOT / path).exists())
        self.assertEqual([], remaining)


if __name__ == "__main__":
    unittest.main(verbosity=2)
