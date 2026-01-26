#!/usr/bin/env python3
"""
Complete parser for Ham Radio Technician exam questions
Processes the full text and generates complete JSON output
"""

import re
import json

def generate_explanation(question, options, correct_answer_letter, correct_answer_text):
    """Generate contextual explanations based on question content"""
    q_lower = question.lower()
    opt_lower = correct_answer_text.lower()
    answer_opt = options[ord(correct_answer_letter) - ord('A')].lower()
    
    # Comprehensive explanation generation based on question topics
    explanations = {
        'battery': {
            'short': "Shorting a battery's terminals creates an extremely low-resistance path, allowing dangerously high current flow. This generates intense heat that can cause severe burns, ignite fires, or cause the battery to explode as rapid electrolysis releases flammable hydrogen gas.",
            'overheat': "Rapid charging or discharging causes excessive current flow, generating heat and accelerating chemical reactions that produce potentially explosive hydrogen and oxygen gases.",
        },
        'current body': "Electrical current through the body causes multiple types of injury: resistive heating of tissue, disruption of the nervous system's electrical signals (especially dangerous for the heart), and involuntary muscle contractions that can cause falls or prevent releasing a live conductor.",
        'wire black': "In standard US electrical wiring, color coding identifies conductors: black indicates the hot (ungrounded) conductor carrying current, white indicates the neutral (grounded) conductor, and green or bare copper indicates the safety ground.",
        'fuse overload': "Fuses and circuit breakers are overcurrent protection devices designed to interrupt excessive current flow, preventing overheating, fires, and equipment damage. They must be properly sized and installed to function correctly.",
        'fuse hot': "Protective devices should be installed only in the ungrounded (hot) conductor. This ensures proper circuit interruption while maintaining the safety function of the grounded neutral and preventing shock hazards.",
        'fuse fire': "Using an oversized fuse defeats overcurrent protection. A fault that should trip a 5A fuse could allow up to 20A to flow, potentially overheating conductors and causing fires before the larger fuse opens.",
        'ground bond': "Bonding all ground rods together ensures they're at the same electrical potential, preventing dangerous voltage differences. This provides a reliable, low-resistance path for fault currents and lightning to safely reach earth.",
        'lightning': "Lightning arresters protect equipment by diverting electrical surges to ground before they can enter the building. They must be installed at the entry point of feed lines on a properly grounded panel to be effective.",
        'voltage measure': "Using test equipment not rated for the voltage being measured can cause insulation breakdown, arcing, equipment failure, and severe electrical shock. Equipment voltage ratings must equal or exceed the maximum voltage encountered.",
        'RF exposure': "RF exposure limits protect against potential health effects of radio frequency energy. Limits vary with frequency because the body absorbs RF energy differently at different frequencies. Exposure depends on power level, distance, antenna pattern, and duty cycle.",
        'radiation non-ionizing': "Radio signals are non-ionizing radiation, meaning they don't have enough energy to remove electrons from atoms or break chemical bonds. Unlike ionizing radiation (X-rays, gamma rays), RF energy primarily affects tissue through heating.",
        'RF burn': "Touching an active antenna during transmission can cause RF burns because the antenna radiates RF energy that can be absorbed by nearby conductors (including the human body), causing localized heating.",
        'repeater offset': "Repeater offset is the frequency difference between the repeater's input (where you transmit) and output (where you receive) frequencies. This separation prevents interference and allows simultaneous transmit and receive operation.",
        'CTCSS': "CTCSS (Continuous Tone-Coded Squelch System) uses a sub-audible tone transmitted with voice to open the repeater's squelch. This prevents interference from other signals and access to private repeater systems.",
        'antenna polarization': "Matching polarization between transmitting and receiving antennas maximizes signal transfer. Mismatched polarization (vertical vs horizontal) significantly reduces received signal strength because antennas are most sensitive to signals with matching polarization.",
        'antenna gain': "Antenna gain is the increase in signal strength in a specific direction compared to a reference antenna (usually isotropic or dipole). Directional antennas like Yagis achieve gain by focusing radiated energy in desired directions rather than radiating equally in all directions.",
        'dipole pattern': "A half-wave dipole radiates most effectively broadside (perpendicular) to the antenna's length. The radiation pattern is roughly donut-shaped with minimum radiation off the ends of the antenna.",
        'propagation': "Radio wave propagation involves multiple mechanisms: line-of-sight for direct paths, ionospheric reflection for long-distance HF communications, tropospheric ducting for extended VHF/UHF range, and diffraction that allows signals to bend around obstacles.",
        'SSB': "Single Sideband (SSB) is an efficient form of amplitude modulation that transmits only one sideband, using less bandwidth and power than AM. It's preferred for voice communications, especially for weak-signal long-distance work.",
        'FM': "Frequency Modulation varies the carrier frequency based on the audio signal amplitude. FM provides good audio quality and noise rejection but uses more bandwidth than SSB. It's commonly used for VHF/UHF voice repeaters.",
        'Ohm law': "Ohm's Law (E = I × R) describes the relationship between voltage (E), current (I), and resistance (R) in an electrical circuit. This fundamental relationship allows calculation of any one parameter when the other two are known.",
    }
    
    # Try to match specific patterns
    if 'battery' in q_lower:
        if 'short' in answer_opt:
            return explanations['battery']['short']
        if 'overheat' in answer_opt or 'gas' in answer_opt:
            return explanations['battery']['overheat']
    if 'current' in q_lower and 'body' in q_lower:
        return explanations['current body']
    if 'wire' in q_lower and 'black' in q_lower:
        return explanations['wire black']
    if 'fuse' in q_lower or 'circuit breaker' in q_lower:
        if 'overload' in answer_opt:
            return explanations['fuse overload']
        if 'hot' in answer_opt:
            return explanations['fuse hot']
        if 'fire' in answer_opt:
            return explanations['fuse fire']
    if 'ground' in q_lower and 'bond' in answer_opt:
        return explanations['ground bond']
    if 'lightning' in q_lower:
        return explanations['lightning']
    if 'voltage' in q_lower and 'measure' in q_lower:
        return explanations['voltage measure']
    if 'RF' in q_lower and 'exposure' in q_lower:
        return explanations['RF exposure']
    if 'radiation' in q_lower and 'non-ionizing' in answer_opt:
        return explanations['radiation non-ionizing']
    if 'RF burn' in q_lower or ('touch' in q_lower and 'antenna' in q_lower):
        return explanations['RF burn']
    if 'repeater' in q_lower and 'offset' in q_lower:
        return explanations['repeater offset']
    if 'CTCSS' in q_lower or ('tone' in q_lower and 'sub' in answer_opt):
        return explanations['CTCSS']
    if 'antenna' in q_lower:
        if 'polarization' in q_lower:
            return explanations['antenna polarization']
        if 'gain' in q_lower:
            return explanations['antenna gain']
        if 'dipole' in q_lower and 'pattern' in q_lower:
            return explanations['dipole pattern']
    if 'propagation' in q_lower or 'ionosphere' in q_lower:
        return explanations['propagation']
    if 'SSB' in q_lower or ('single sideband' in q_lower):
        return explanations['SSB']
    if 'FM' in q_lower and 'frequency modulation' in answer_opt:
        return explanations['FM']
    if 'ohm' in q_lower and 'law' in q_lower:
        return explanations['Ohm law']
    
    # Default: use the correct answer text with context
    return f"{correct_answer_text}. This correctly addresses the safety principle, technical requirement, or operational procedure relevant to the question."

def parse_questions(text):
    """Parse all questions from the text"""
    questions = []
    
    # Pattern to match question lines
    # Format: T0A01 (B) Question text A. Option A B. Option B C. Option C D. Option D Correct Answer: B. Answer text
    pattern = r'([T]\d+[A-Z]\d+)\s+\(([A-D])\)\s+(.+?)\s+A\.\s+(.+?)\s+B\.\s+(.+?)\s+C\.\s+(.+?)\s+D\.\s+(.+?)\s+Correct Answer:\s+([A-D])\.\s+(.+?)(?=\n[T]\d+[A-Z]\d+|\nGroup|\nSubelement|$)'
    
    matches = re.finditer(pattern, text, re.DOTALL | re.MULTILINE)
    
    for match in matches:
        q_id = match.group(1)
        initial_answer = match.group(2)
        question = match.group(3).strip()
        opt_a = match.group(4).strip()
        opt_b = match.group(5).strip()
        opt_c = match.group(6).strip()
        opt_d = match.group(7).strip()
        correct_letter = match.group(8)
        correct_text = match.group(9).strip()
        
        # Clean up any trailing text in options
        opt_a = re.sub(r'\s+Correct Answer:.*$', '', opt_a).strip()
        opt_b = re.sub(r'\s+Correct Answer:.*$', '', opt_b).strip()
        opt_c = re.sub(r'\s+Correct Answer:.*$', '', opt_c).strip()
        opt_d = re.sub(r'\s+Correct Answer:.*$', '', opt_d).strip()
        
        options = [opt_a, opt_b, opt_c, opt_d]
        explanation = generate_explanation(question, options, correct_letter, correct_text)
        
        questions.append({
            'id': q_id,
            'question': question,
            'options': options,
            'correctAnswer': correct_letter,
            'explanation': explanation
        })
    
    return questions

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        # Read from stdin
        text = sys.stdin.read()
    
    questions = parse_questions(text)
    
    print(json.dumps(questions, indent=2, ensure_ascii=False))
    print(f"\nTotal questions parsed: {len(questions)}", file=sys.stderr)



