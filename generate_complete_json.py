#!/usr/bin/env python3
"""Generate the bundled Technician pool from the corrected official NCVEC DOCX."""

from __future__ import annotations

import argparse
import json
import re
import zipfile
from collections import Counter
from pathlib import Path
from typing import Iterable
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parent
DEFAULT_SOURCE = ROOT / "content" / "2026-2030-technician-pool-feb-19-2026.docx"
DEFAULT_OUTPUT = ROOT / "my-study-app" / "app" / "ham_radio_questions.json"
DEFAULT_LESSONS = ROOT / "my-study-app" / "app" / "lessons.json"

QUESTION_HEADER = re.compile(r"^(T\d[A-Z]\d{2})\s+\(([A-D])\)")
OPTION_LINE = re.compile(r"^([A-D])\.\s+(.*)$", re.DOTALL)
FIGURE_REFERENCE = re.compile(r"\bfigure\s+(T-[123])\b", re.IGNORECASE)
FIGURE_PATHS = {
    "T-1": "/figures/technician-t1.jpg",
    "T-2": "/figures/technician-t2.jpg",
    "T-3": "/figures/technician-t3.jpg",
}


def extract_docx_paragraphs(path: Path) -> list[str]:
    """Return visible DOCX paragraphs in document order using the standard library."""
    with zipfile.ZipFile(path) as archive:
        document = ElementTree.fromstring(archive.read("word/document.xml"))

    word_namespace = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
    paragraphs: list[str] = []
    for paragraph in document.iter(f"{word_namespace}p"):
        text = "".join(
            node.text or "" for node in paragraph.iter(f"{word_namespace}t")
        ).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def _normalize_lines(text_or_lines: str | Iterable[str]) -> list[str]:
    if isinstance(text_or_lines, str):
        lines = text_or_lines.splitlines()
    else:
        lines = list(text_or_lines)
    return [line.strip() for line in lines if line.strip()]


def generate_explanation(
    question: str,
    options: list[str],
    correct_answer_letter: str,
) -> str:
    """Generate a concise fallback explanation when no authored explanation exists."""
    correct_answer = options[ord(correct_answer_letter) - ord("A")]
    question_lower = question.lower()
    answer_lower = correct_answer.lower()

    if "battery" in question_lower and "short" in answer_lower:
        return (
            "Shorting battery terminals creates extremely high current, which can "
            "cause burns, fire, or an explosion."
        )
    if "repeater" in question_lower and "offset" in question_lower:
        return (
            "Repeater offset is the difference between the repeater input and output "
            "frequencies."
        )
    if "antenna" in question_lower and "polarization" in question_lower:
        return (
            "Matching transmit and receive antenna polarization maximizes signal transfer."
        )
    if "ohm" in question_lower and "law" in question_lower:
        return "Ohm's Law is E = I × R, relating voltage, current, and resistance."
    if "rf" in question_lower and "exposure" in question_lower:
        return (
            "RF exposure depends on frequency, power, distance, antenna pattern, and duty cycle."
        )
    return f"{correct_answer}."


def parse_questions(
    text_or_lines: str | Iterable[str],
    explanations: dict[str, str] | None = None,
) -> list[dict[str, object]]:
    """Parse official NCVEC paragraph text into the app's question schema."""
    lines = _normalize_lines(text_or_lines)
    authored_explanations = explanations or {}
    questions: list[dict[str, object]] = []

    index = 0
    while index < len(lines):
        header = QUESTION_HEADER.match(lines[index])
        if not header:
            index += 1
            continue

        question_id, correct_answer = header.groups()
        if index + 5 >= len(lines):
            raise ValueError(f"Incomplete question block for {question_id}")

        question_text = lines[index + 1]
        options: list[str] = []
        for option_index, expected_letter in enumerate("ABCD", start=2):
            option_match = OPTION_LINE.match(lines[index + option_index])
            if not option_match or option_match.group(1) != expected_letter:
                raise ValueError(
                    f"Expected option {expected_letter} for {question_id}; "
                    f"found {lines[index + option_index]!r}"
                )
            options.append(option_match.group(2).strip())

        entry: dict[str, object] = {
            "id": question_id,
            "question": question_text,
            "options": options,
            "correctAnswer": correct_answer,
            "explanation": authored_explanations.get(question_id)
            or generate_explanation(question_text, options, correct_answer),
        }
        figure_match = FIGURE_REFERENCE.search(question_text)
        if figure_match:
            entry["figure"] = FIGURE_PATHS[figure_match.group(1).upper()]
        questions.append(entry)
        index += 6

    duplicate_ids = [
        question_id
        for question_id, count in Counter(question["id"] for question in questions).items()
        if count != 1
    ]
    if duplicate_ids:
        raise ValueError(f"Duplicate question IDs: {', '.join(sorted(duplicate_ids))}")
    return questions


def existing_explanations(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    questions = json.loads(path.read_text(encoding="utf-8"))
    return {
        question["id"]: question["explanation"]
        for question in questions
        if question.get("explanation")
    }


def derive_lesson_counts(questions: list[dict[str, object]]) -> dict[str, int]:
    return dict(sorted(Counter(str(question["id"])[:2] for question in questions).items()))


def update_lessons(lessons_path: Path, counts: dict[str, int]) -> dict[str, object]:
    lessons_data = json.loads(lessons_path.read_text(encoding="utf-8"))
    lesson_ids = {lesson["id"] for lesson in lessons_data["lessons"]}
    if lesson_ids != set(counts):
        raise ValueError("Lesson IDs do not match the question-pool subelements")
    for lesson in lessons_data["lessons"]:
        lesson["questionCount"] = counts[lesson["id"]]
    return lessons_data


def serialized_json(value: object) -> str:
    return json.dumps(value, indent=2, ensure_ascii=False) + "\n"


def build_content(source: Path, output: Path, lessons: Path) -> tuple[list[dict[str, object]], dict[str, object]]:
    paragraphs = extract_docx_paragraphs(source)
    questions = parse_questions(paragraphs, existing_explanations(output))
    if len(questions) != 409:
        raise ValueError(f"Expected 409 official questions, parsed {len(questions)}")
    lessons_data = update_lessons(lessons, derive_lesson_counts(questions))
    return questions, lessons_data


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--lessons", type=Path, default=DEFAULT_LESSONS)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify generated content matches checked-in output without writing files.",
    )
    args = parser.parse_args()

    questions, lessons_data = build_content(args.source, args.output, args.lessons)
    question_json = serialized_json(questions)
    lesson_json = serialized_json(lessons_data)

    if args.check:
        mismatches = []
        if args.output.read_text(encoding="utf-8") != question_json:
            mismatches.append(str(args.output))
        if args.lessons.read_text(encoding="utf-8") != lesson_json:
            mismatches.append(str(args.lessons))
        if mismatches:
            print("Generated content differs: " + ", ".join(mismatches))
            return 1
        print("Content pipeline check passed: 409 questions, 35 groups, 10 lesson counts")
        return 0

    args.output.write_text(question_json, encoding="utf-8")
    args.lessons.write_text(lesson_json, encoding="utf-8")
    print(f"Generated {len(questions)} questions from {args.source}")
    print("Lesson counts: " + ", ".join(f"{key}={value}" for key, value in derive_lesson_counts(questions).items()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
