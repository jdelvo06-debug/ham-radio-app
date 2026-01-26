#!/usr/bin/env python3
"""
Final comprehensive parser for Ham Radio Technician exam questions
This script processes the complete text and generates the full JSON file
"""

import re
import json
import sys

# This will contain the user's full text
# For now, we'll read it from stdin or a file

def parse_all_questions(text):
    """Parse all questions from the complete text"""
    questions = []
    
    # Remove group headers and other non-question lines
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        line = line.strip()
        if line and (line.startswith('T') and re.match(r'^T\d+[A-Z]\d+', line)):
            cleaned_lines.append(line)
        elif line and not (line.startswith('Group') or line.startswith('Subelement')):
            # Append to previous line if it's a continuation
            if cleaned_lines:
                cleaned_lines[-1] += ' ' + line
    
    # Now parse each question line
    for line in cleaned_lines:
        # Pattern: T0A01 (B) Question text A. Option A B. Option B C. Option C D. Option D Correct Answer: B. Answer text
        pattern = r'^([T]\d+[A-Z]\d+)\s+\(([A-D])\)\s+(.+?)\s+A\.\s+(.+?)\s+B\.\s+(.+?)\s+C\.\s+(.+?)\s+D\.\s+(.+?)\s+Correct Answer:\s+([A-D])\.\s+(.+)$'
        
        match = re.match(pattern, line)
        if match:
            q_id = match.group(1)
            initial_ans = match.group(2)
            question = match.group(3).strip()
            opt_a = match.group(4).strip()
            opt_b = match.group(5).strip()
            opt_c = match.group(6).strip()
            opt_d = match.group(7).strip()
            correct_letter = match.group(8)
            correct_text = match.group(9).strip()
            
            # Use the explicitly stated correct answer
            questions.append({
                'id': q_id,
                'question': question,
                'options': [opt_a, opt_b, opt_c, opt_d],
                'correctAnswer': correct_letter,
                'explanation': generate_explanation(question, [opt_a, opt_b, opt_c, opt_d], correct_letter, correct_text)
            })
    
    return questions

def generate_explanation(question, options, correct_letter, correct_text):
    """Generate explanation based on question content"""
    # Use a comprehensive explanation generator
    # This will create contextual explanations
    q_lower = question.lower()
    correct_index = ord(correct_letter) - ord('A')
    correct_option = options[correct_index].lower()
    
    # Return enhanced explanation based on context
    base_explanation = correct_text
    
    # Add context-specific enhancements
    if 'battery' in q_lower and 'short' in correct_option:
        return f"{base_explanation} Shorting battery terminals creates extremely high current flow, generating intense heat that can cause burns, fires, or explosions due to rapid gas generation."
    elif 'current' in q_lower and 'body' in q_lower:
        return f"{base_explanation} Electrical current causes multiple injuries: tissue heating, disruption of cellular electrical functions (especially dangerous for the heart), and involuntary muscle contractions."
    elif 'fuse' in q_lower or 'circuit breaker' in q_lower:
        if 'overload' in correct_option:
            return f"{base_explanation} Fuses and circuit breakers interrupt excessive current to prevent overheating, fires, and equipment damage."
        elif 'hot' in correct_option:
            return f"{base_explanation} Protective devices must be installed only in the ungrounded (hot) conductor to ensure proper circuit protection while maintaining safety."
    elif 'ground' in q_lower and 'bond' in correct_option:
        return f"{base_explanation} Bonding ground rods together ensures they're at the same potential, preventing dangerous voltage differences and providing reliable fault current paths."
    elif 'lightning' in q_lower:
        return f"{base_explanation} Lightning arresters divert electrical surges to ground before they enter buildings, protecting equipment from damage."
    elif 'RF' in q_lower and 'exposure' in q_lower:
        return f"{base_explanation} RF exposure limits vary with frequency because the body absorbs RF energy differently at different frequencies, depending on power level, distance, antenna pattern, and duty cycle."
    elif 'antenna' in q_lower:
        if 'polarization' in q_lower:
            return f"{base_explanation} Matching antenna polarization maximizes signal transfer. Mismatched polarization significantly reduces received signal strength."
        elif 'gain' in q_lower:
            return f"{base_explanation} Antenna gain represents increased signal strength in a specific direction compared to a reference antenna, achieved by focusing radiated energy."
    elif 'repeater' in q_lower:
        if 'offset' in q_lower:
            return f"{base_explanation} Repeater offset is the frequency difference between input (transmit) and output (receive) frequencies, preventing interference and enabling simultaneous operation."
        elif 'CTCSS' in q_lower or 'tone' in correct_option:
            return f"{base_explanation} CTCSS uses sub-audible tones to open repeater squelch, preventing interference and enabling private access."
    elif 'propagation' in q_lower:
        return f"{base_explanation} Radio wave propagation involves multiple mechanisms: line-of-sight, ionospheric reflection, tropospheric ducting, and diffraction."
    elif 'SSB' in q_lower or 'single sideband' in q_lower:
        return f"{base_explanation} Single Sideband is an efficient amplitude modulation that transmits only one sideband, using less bandwidth and power than AM."
    elif 'FM' in q_lower and 'frequency modulation' in correct_option:
        return f"{base_explanation} Frequency Modulation varies carrier frequency based on audio amplitude, providing good audio quality and noise rejection but using more bandwidth than SSB."
    elif 'ohm' in q_lower and 'law' in q_lower:
        return f"{base_explanation} Ohm's Law (E = I × R) describes the relationship between voltage, current, and resistance, allowing calculation of any parameter when the others are known."
    
    return base_explanation

if __name__ == '__main__':
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        text = sys.stdin.read()
    
    questions = parse_all_questions(text)
    
    # Output JSON
    print(json.dumps(questions, indent=2, ensure_ascii=False))
    print(f"\nParsed {len(questions)} questions", file=sys.stderr)



