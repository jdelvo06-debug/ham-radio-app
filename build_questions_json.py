#!/usr/bin/env python3
"""
Script to parse Ham Radio exam questions from raw text and generate JSON
"""

import re
import json
import sys

def extract_question_blocks(text):
    """Extract individual question blocks from the text"""
    # Pattern to match question blocks
    # Format: T0A01 (B) Question text A. Option A B. Option B C. Option C D. Option D Correct Answer: B. Answer text
    pattern = r'(T\d+[A-Z]\d+)\s+\(([A-D])\)\s+(.+?)\s+A\.\s+(.+?)\s+B\.\s+(.+?)\s+C\.\s+(.+?)\s+D\.\s+(.+?)\s+Correct Answer:\s+[A-D]\.\s+(.+?)(?=\nT\d+[A-Z]\d+|$)'
    
    questions = []
    matches = re.finditer(pattern, text, re.DOTALL)
    
    for match in matches:
        q_id = match.group(1)
        answer_letter = match.group(2)
        question = match.group(3).strip()
        option_a = match.group(4).strip()
        option_b = match.group(5).strip()
        option_c = match.group(6).strip()
        option_d = match.group(7).strip()
        correct_answer_text = match.group(8).strip()
        
        questions.append({
            'id': q_id,
            'answer_letter': answer_letter,
            'question': question,
            'options': [option_a, option_b, option_c, option_d],
            'correct_answer_text': correct_answer_text
        })
    
    return questions

def generate_explanation(question, options, correct_answer, correct_answer_text):
    """Generate an explanation for why the answer is correct"""
    # Use the correct answer text as the base for explanation
    explanation = correct_answer_text
    
    # Enhance with context from the question
    q_lower = question.lower()
    opt_lower = correct_answer_text.lower()
    
    # Add context-specific explanations
    if 'battery' in q_lower and 'short' in opt_lower:
        explanation = "Shorting a battery's terminals creates an extremely high current path with minimal resistance. This causes rapid heating that can melt metal, ignite fires, or cause the battery to explode as the electrolyte decomposes and releases flammable gases."
    elif 'fuse' in q_lower or 'circuit breaker' in q_lower:
        if 'overload' in opt_lower:
            explanation = "Fuses and circuit breakers are overcurrent protection devices. When current exceeds their rating, they open the circuit to prevent overheating, fires, and equipment damage. Installing them in the wrong location or using higher-rated fuses defeats this protection."
        elif 'hot' in opt_lower or 'conductor' in opt_lower:
            explanation = "Protective devices should be installed only in the ungrounded (hot) conductor. This ensures that opening the device de-energizes the circuit while maintaining the safety of the grounded neutral conductor."
    elif 'ground' in q_lower:
        if 'bond' in opt_lower:
            explanation = "All ground rods and earth connections must be bonded together to maintain the same electrical potential. This prevents dangerous voltage differences between grounds and ensures fault currents and lightning have a low-resistance path to earth."
        elif 'panel' in opt_lower and 'building' in opt_lower:
            explanation = "Lightning arresters protect equipment by diverting surges to ground before they enter the building. Installation at the entry point on a grounded panel ensures protection for all equipment connected to the feed line."
    elif 'electrical' in q_lower and 'shock' in q_lower:
        explanation = "Multiple safety measures work together: three-wire cords provide proper grounding, common safety grounds prevent potential differences, and mechanical interlocks prevent accidental contact with energized circuits."
    elif 'voltage' in q_lower and 'measure' in q_lower:
        explanation = "Using test equipment not rated for the voltage being measured can cause insulation breakdown, arcing, equipment failure, and severe electrical shock. Equipment voltage ratings must equal or exceed the maximum voltage encountered."
    elif 'RF' in q_lower and 'exposure' in q_lower:
        explanation = "RF exposure limits vary with frequency because the human body absorbs RF energy differently at different frequencies. Factors like power level, distance, antenna pattern, and duty cycle all affect exposure. Multiple methods including calculations, modeling, and measurements can verify compliance."
    elif 'repeater' in q_lower:
        explanation = "Repeaters receive signals on one frequency and retransmit them on another, extending communication range. They use offsets, CTCSS tones, and other features to manage access and prevent interference."
    elif 'antenna' in q_lower:
        if 'polarization' in q_lower:
            explanation = "Matching polarization between transmitting and receiving antennas is critical for maximum signal transfer. Mismatched polarization significantly reduces received signal strength."
        elif 'gain' in q_lower:
            explanation = "Antenna gain represents the increase in signal strength in a specific direction compared to a reference antenna (usually isotropic or dipole). Directional antennas like Yagis provide gain by focusing energy in desired directions."
    elif 'propagation' in q_lower:
        explanation = "Radio waves travel through various paths including direct line-of-sight, ionospheric reflection, tropospheric ducting, and diffraction. Different frequency bands and conditions favor different propagation modes."
    elif 'impedance' in q_lower or 'SWR' in q_lower:
        explanation = "Impedance matching ensures maximum power transfer from transmitter to antenna. SWR (Standing Wave Ratio) measures the quality of this match. High SWR indicates poor matching and can cause excessive losses and equipment damage."
    elif 'modulation' in q_lower:
        if 'SSB' in q_lower:
            explanation = "Single Sideband (SSB) is an amplitude modulation variant that uses less bandwidth than AM by transmitting only one sideband. It's efficient for voice communications and preferred for long-distance weak-signal work."
        elif 'FM' in q_lower:
            explanation = "Frequency Modulation varies the carrier frequency based on the audio signal. FM provides good audio quality and noise rejection but uses more bandwidth than SSB."
    elif 'Ohm' in q_lower or 'current' in q_lower or 'voltage' in q_lower:
        if 'law' in q_lower:
            explanation = "Ohm's Law describes the relationship between voltage (E), current (I), and resistance (R): E = I × R. This fundamental relationship allows calculation of any one parameter when the other two are known."
    
    return explanation

def parse_questions_from_text(text):
    """Main function to parse questions from text"""
    questions = []
    
    # Split text into individual question lines
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line or line.startswith('Group') or line.startswith('Subelement'):
            continue
        
        # Match question pattern: T0A01 (B) Question? A. OptA B. OptB C. OptC D. OptD Correct Answer: B. Answer
        # This is a simplified pattern - actual parsing may need adjustment
        pattern = r'^([T]\d+[A-Z]\d+)\s+\(([A-D])\)\s+(.+?)\s+A\.\s+(.+?)\s+B\.\s+(.+?)\s+C\.\s+(.+?)\s+D\.\s+(.+?)\s+Correct Answer:\s+([A-D])\.\s+(.+)$'
        
        match = re.match(pattern, line)
        if match:
            q_id = match.group(1)
            answer_letter = match.group(2)
            question = match.group(3).strip()
            opt_a = match.group(4).strip()
            opt_b = match.group(5).strip()
            opt_c = match.group(6).strip()
            opt_d = match.group(7).strip()
            correct_letter = match.group(8)
            correct_text = match.group(9).strip()
            
            # Use the explicitly stated correct answer
            final_answer = correct_letter
            
            explanation = generate_explanation(question, [opt_a, opt_b, opt_c, opt_d], final_answer, correct_text)
            
            questions.append({
                'id': q_id,
                'question': question,
                'options': [opt_a, opt_b, opt_c, opt_d],
                'correctAnswer': final_answer,
                'explanation': explanation
            })
    
    return questions

if __name__ == '__main__':
    # Read text from stdin or file
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            text = f.read()
    else:
        print("Usage: python3 build_questions_json.py <input_file>")
        sys.exit(1)
    
    questions = parse_questions_from_text(text)
    
    print(json.dumps(questions, indent=2))
    print(f"\nTotal questions parsed: {len(questions)}", file=sys.stderr)



