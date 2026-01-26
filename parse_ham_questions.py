import re
import json

# The raw text from the user's query
raw_text = """Group T0A - Power circuits and hazards: hazardous voltages, fuses and circuit breakers, grounding, electrical code compliance; Lightning protection; Battery safety
T0A01 (B) Which of the following is a safety hazard of a 12-volt storage battery? A. Touching both terminals with the hands can cause electrical shock B. Shorting the terminals can cause burns, fire, or an explosion C. RF emissions from a nearby transmitter can cause the electrolyte to emit poison gas D. All these choices are correct Correct Answer: B. Shorting the terminals can cause burns, fire, or an explosion
..."""

def parse_questions(text):
    """Parse the ham radio exam questions from raw text"""
    questions = []
    
    # Split by question patterns - look for question IDs like T0A01, T0A02, etc.
    # Pattern: ID (Answer) Question? A. Option B. Option C. Option D. Option Correct Answer: Letter. Answer text
    
    # Split text into lines and process
    lines = text.split('\n')
    
    current_question = None
    current_id = None
    current_answer = None
    buffer = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check if line starts with a question ID pattern (e.g., T0A01, T1B03)
        question_match = re.match(r'^([T]\d+[A-Z]\d+)\s+\(([A-D])\)\s+(.+?)\s+A\.\s+(.+?)\s+B\.\s+(.+?)\s+C\.\s+(.+?)\s+D\.\s+(.+?)\s+Correct Answer:\s+([A-D])\.\s+(.+)$', line)
        
        if question_match:
            # Save previous question if exists
            if current_id:
                questions.append({
                    "id": current_id,
                    "question": current_question,
                    "options": current_options,
                    "correctAnswer": current_answer,
                    "explanation": generate_explanation(current_question, current_options, current_answer)
                })
            
            # Start new question
            current_id = question_match.group(1)
            current_answer = question_match.group(2)
            current_question = question_match.group(3).strip()
            current_options = [
                question_match.group(4).strip(),
                question_match.group(5).strip(),
                question_match.group(6).strip(),
                question_match.group(7).strip()
            ]
            
            # Verify correct answer matches
            correct_answer_letter = question_match.group(8)
            if correct_answer_letter != current_answer:
                current_answer = correct_answer_letter  # Use the explicitly stated answer
    
    # Add last question
    if current_id:
        questions.append({
            "id": current_id,
            "question": current_question,
            "options": current_options,
            "correctAnswer": current_answer,
            "explanation": generate_explanation(current_question, current_options, current_answer)
        })
    
    return questions

def generate_explanation(question, options, correct_answer):
    """Generate a brief explanation based on the question and answer"""
    answer_index = ord(correct_answer) - ord('A')
    correct_option = options[answer_index]
    
    # Simple explanation based on question content
    if "battery" in question.lower() or "hazard" in question.lower():
        if "short" in correct_option.lower():
            return "Shorting battery terminals creates extremely high current flow, generating intense heat that can cause burns, fires, or explosions due to rapid gas generation."
    elif "fuse" in question.lower() or "circuit breaker" in question.lower():
        if "overload" in correct_option.lower() or "fire" in correct_option.lower():
            return "Fuses and circuit breakers are safety devices that interrupt excessive current flow to prevent overheating, fires, and equipment damage."
    elif "ground" in question.lower():
        if "bond" in correct_option.lower() or "connect" in correct_option.lower():
            return "Proper grounding and bonding ensure electrical safety by providing low-resistance paths for fault currents and preventing dangerous voltage differences."
    
    # Generic explanation
    return f"The correct answer is '{correct_option}' because it accurately describes the safety principle, technical requirement, or operational procedure relevant to this question."

if __name__ == "__main__":
    # Read the raw text (you'll need to paste the full text here)
    # For now, we'll process it from the user's input
    print("This script needs the full raw text to parse.")



