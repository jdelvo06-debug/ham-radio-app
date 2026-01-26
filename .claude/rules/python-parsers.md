# Python Parser Rules

## Parser Files
| File | Purpose |
|------|---------|
| `generate_complete_json.py` | Primary parser with explanation generation |
| `build_questions_json.py` | Alternative parser approach |
| `parse_all_questions.py` | Batch processing |
| `parse_ham_questions.py` | Core parsing logic |
| `parse_questions.py` | Simple parser |
| `final_parser.py` | Refined parsing |
| `complete_remaining_questions.py` | Fill gaps in question set |

## Source Data
- `raw_questions.txt` - FCC question pool in plain text format

## Output Format
All parsers produce JSON with this structure:
```json
[
  {
    "id": "T0A01",
    "question": "Which of the following is a safety hazard...",
    "options": [
      "Option A text",
      "Option B text",
      "Option C text",
      "Option D text"
    ],
    "correctAnswer": "B",
    "explanation": "Explanation of why B is correct..."
  }
]
```

## ID Format Rules
- Format: `T` + subelement (0-9) + section (A-Z) + number (01-99)
- Examples: `T0A01`, `T1B05`, `T9C12`
- Regex: `/^T\d[A-Z]\d{2}$/`

## Answer Format
- `correctAnswer` is a single uppercase letter: "A", "B", "C", or "D"
- Maps to `options` array: A=0, B=1, C=2, D=3

## Explanation Generation
`generate_complete_json.py` uses keyword matching to generate contextual explanations:
```python
explanations = {
    'battery': {...},
    'current body': "...",
    'fuse overload': "...",
    # ... etc
}
```

If no keyword match, falls back to generic explanation.

## Running Parsers
```bash
# From project root
python generate_complete_json.py > my-study-app/app/ham_radio_questions.json

# Or
python build_questions_json.py
```

## Updating Question Pool
1. Get new FCC question pool (released every 4 years)
2. Save to `raw_questions.txt`
3. Run parser
4. Verify output has 411 questions
5. Copy to `my-study-app/app/ham_radio_questions.json`

## Common Issues

### Regex Quirks
FCC format isn't perfectly consistent. Watch for:
- Inconsistent spacing around answer letters
- Questions without all 4 options
- Unicode characters (curly quotes)

### Missing Explanations
If a question gets generic explanation, add specific keyword match to parser's `explanations` dict.
