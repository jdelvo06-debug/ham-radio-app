#!/usr/bin/env python3
"""
Script to add all remaining questions to the JSON file
This will parse the remaining questions from the user's text and append them
"""
import json
import re

# Read existing JSON
with open('ham_radio_questions.json', 'r') as f:
    existing_data = json.load(f)

existing_ids = {q['id'] for q in existing_data}
print(f"Existing questions: {len(existing_data)}")
print(f"Existing IDs: {sorted(existing_ids)[:5]}...")

# This script needs the remaining question text to parse
# For now, I'll continue manually adding them in the next step



