# Blueprint: Add New Subelement

## When to Use
When FCC releases updated question pool with new or modified subelements.

## Prerequisites
- New FCC question pool text file
- Python 3 installed

## Steps

### 1. Update Raw Questions
```bash
# Save new FCC data to raw_questions.txt
# Format should match existing file structure
```

### 2. Run Parser
```bash
cd /Users/jeremydelvaux/projects/ham-radio-app
python generate_complete_json.py > my-study-app/app/ham_radio_questions.json
```

### 3. Verify Output
Check the JSON has expected structure:
```bash
# Count questions
cat my-study-app/app/ham_radio_questions.json | python -c "import json,sys; print(len(json.load(sys.stdin)))"

# Check for new subelement
cat my-study-app/app/ham_radio_questions.json | python -c "import json,sys; d=json.load(sys.stdin); print(set(q['id'][:2] for q in d))"
```

### 4. Test the App
```bash
cd my-study-app
npm run dev
```
- Verify new subelement appears in dropdown
- Test a few questions from new subelement
- Check Study and Exam modes work

### 5. Update Documentation
If subelement topics changed, update:
- `CLAUDE.md` subelement list
- `.claude/rules/question-data.md` table

## Verification Checklist
- [ ] JSON is valid
- [ ] Question count is correct (411 for current pool)
- [ ] All questions have 4 options
- [ ] All correctAnswer values are A/B/C/D
- [ ] No duplicate IDs
- [ ] App loads without errors
- [ ] Filter dropdown shows all subelements
