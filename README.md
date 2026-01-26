# Ham Radio Exam Questions Parser

This project contains scripts to parse Ham Radio Technician exam questions from raw text format into structured JSON.

## Files

- `ham_radio_questions.json` - The output JSON file with all parsed questions
- `final_parser.py` - Main parser script to process all questions
- `generate_complete_json.py` - Alternative parser with enhanced explanations

## Usage

To process the raw text file:

```bash
python3 final_parser.py raw_questions.txt > ham_radio_questions.json
```

Or pipe the text:

```bash
cat raw_questions.txt | python3 final_parser.py > ham_radio_questions.json
```

## JSON Format

Each question object contains:
- `id`: Question identifier (e.g., "T0A01")
- `question`: The question text
- `options`: Array of 4 answer options (A, B, C, D)
- `correctAnswer`: The correct answer letter (A, B, C, or D)
- `explanation`: Explanation of why the answer is correct



