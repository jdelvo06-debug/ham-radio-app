#!/usr/bin/env python3
"""
Comprehensive parser for Ham Radio exam questions
"""
import re
import json

def parse_questions_complete(text):
    """Parse all questions from the provided text"""
    questions = []
    
    # Enhanced pattern to handle the question format
    # T0A01 (B) Question text A. Option A B. Option B C. Option C D. Option D Correct Answer: B. Answer text
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
        
        # Clean up options that might have trailing "Correct Answer:" text
        opt_a = re.sub(r'\s+Correct Answer:.*$', '', opt_a).strip()
        opt_b = re.sub(r'\s+Correct Answer:.*$', '', opt_b).strip()
        opt_c = re.sub(r'\s+Correct Answer:.*$', '', opt_c).strip()
        opt_d = re.sub(r'\s+Correct Answer:.*$', '', opt_d).strip()
        
        questions.append({
            'id': q_id,
            'question': question,
            'options': [opt_a, opt_b, opt_c, opt_d],
            'correctAnswer': correct_letter,
            'explanation': generate_smart_explanation(question, opt_a, opt_b, opt_c, opt_d, correct_letter, correct_text)
        })
    
    return questions

def generate_smart_explanation(question, opt_a, opt_b, opt_c, opt_d, correct_letter, correct_text):
    """Generate contextual explanations"""
    q_lower = question.lower()
    options = {'A': opt_a, 'B': opt_b, 'C': opt_c, 'D': opt_d}
    correct_opt = options[correct_letter]
    opt_lower = correct_opt.lower()
    
    # Battery and electrical safety
    if 'battery' in q_lower:
        if 'short' in opt_lower:
            return "Shorting a battery's terminals creates an extremely low-resistance path, allowing dangerously high current flow. This generates intense heat that can cause severe burns, ignite fires, or cause the battery to explode as rapid electrolysis releases flammable hydrogen gas."
        elif 'overheat' in opt_lower or 'gas' in opt_lower:
            return "Rapid charging or discharging causes excessive current flow through the battery, generating heat and accelerating chemical reactions that produce potentially explosive hydrogen and oxygen gases."
    
    # Electrical safety and hazards
    if 'current' in q_lower and 'body' in q_lower:
        return "Electrical current through the body causes multiple types of injury: resistive heating of tissue, disruption of the nervous system's electrical signals (especially dangerous for the heart), and involuntary muscle contractions that can cause falls or prevent releasing a live conductor."
    
    # Wiring and grounding
    if 'wire' in q_lower or 'cable' in q_lower:
        if 'black' in opt_lower and 'hot' in opt_lower:
            return "In standard US electrical wiring, color coding helps identify conductors: black indicates the hot (ungrounded) conductor carrying current, white indicates the neutral (grounded) conductor, and green or bare copper indicates the safety ground."
        elif 'bond' in opt_lower:
            return "Bonding all ground rods together ensures they're at the same electrical potential, preventing dangerous voltage differences. This provides a reliable, low-resistance path for fault currents and lightning to safely reach earth."
    
    # Fuses and circuit protection
    if 'fuse' in q_lower or 'circuit breaker' in q_lower:
        if 'overload' in opt_lower:
            return "Fuses and circuit breakers are overcurrent protection devices designed to interrupt excessive current flow, preventing overheating, fires, and equipment damage. They must be properly sized and installed to function correctly."
        elif 'hot conductor' in opt_lower or 'series' in opt_lower and 'hot' in opt_lower:
            return "Protective devices should be installed only in the ungrounded (hot) conductor. This ensures proper circuit interruption while maintaining the safety function of the grounded neutral and preventing shock hazards."
        elif 'fire' in opt_lower:
            return "Using an oversized fuse defeats overcurrent protection. A fault that should trip a 5A fuse could allow up to 20A to flow, potentially overheating conductors and causing fires before the larger fuse opens."
    
    # Lightning protection
    if 'lightning' in q_lower or 'arrester' in q_lower:
        return "Lightning arresters protect equipment by diverting electrical surges to ground before they can enter the building. They must be installed at the entry point of feed lines on a properly grounded panel to be effective."
    
    # RF safety
    if 'RF' in q_lower and 'exposure' in q_lower:
        return "RF exposure limits protect against potential health effects of radio frequency energy. Limits vary with frequency because the body absorbs RF energy differently at different frequencies. Exposure depends on power level, distance, antenna pattern, and duty cycle."
    if 'radiation' in q_lower:
        if 'non-ionizing' in opt_lower:
            return "Radio signals are non-ionizing radiation, meaning they don't have enough energy to remove electrons from atoms or break chemical bonds. Unlike ionizing radiation (X-rays, gamma rays), RF energy primarily affects tissue through heating."
        elif 'burn' in opt_lower:
            return "Touching an active antenna during transmission can cause RF burns because the antenna radiates RF energy that can be absorbed by nearby conductors (including the human body), causing localized heating."
    
    # Station operation
    if 'repeater' in q_lower:
        if 'offset' in q_lower:
            return "Repeater offset is the frequency difference between the repeater's input (where you transmit) and output (where you receive) frequencies. This separation prevents interference and allows simultaneous transmit and receive operation."
        elif 'CTCSS' in q_lower or 'tone' in q_lower:
            return "CTCSS (Continuous Tone-Coded Squelch System) uses a sub-audible tone transmitted with voice to open the repeater's squelch. This prevents interference from other signals and access to private repeater systems."
    
    # Antennas
    if 'antenna' in q_lower:
        if 'polarization' in q_lower:
            return "Matching polarization between transmitting and receiving antennas maximizes signal transfer. Mismatched polarization (vertical vs horizontal) significantly reduces received signal strength because antennas are most sensitive to signals with matching polarization."
        elif 'gain' in q_lower:
            return "Antenna gain is the increase in signal strength in a specific direction compared to a reference antenna (usually isotropic or dipole). Directional antennas like Yagis achieve gain by focusing radiated energy in desired directions rather than radiating equally in all directions."
        elif 'dipole' in q_lower:
            return "A half-wave dipole radiates most effectively broadside (perpendicular) to the antenna's length. The radiation pattern is roughly donut-shaped with minimum radiation off the ends of the antenna."
    
    # Propagation
    if 'propagation' in q_lower or 'ionosphere' in q_lower:
        return "Radio wave propagation involves multiple mechanisms: line-of-sight for direct paths, ionospheric reflection for long-distance HF communications, tropospheric ducting for extended VHF/UHF range, and diffraction that allows signals to bend around obstacles."
    
    # Modulation
    if 'modulation' in q_lower:
        if 'SSB' in q_lower:
            return "Single Sideband (SSB) is an efficient form of amplitude modulation that transmits only one sideband, using less bandwidth and power than AM. It's preferred for voice communications, especially for weak-signal long-distance work."
        elif 'FM' in q_lower:
            return "Frequency Modulation varies the carrier frequency based on the audio signal amplitude. FM provides good audio quality and noise rejection but uses more bandwidth than SSB. It's commonly used for VHF/UHF voice repeaters."
    
    # Electrical principles
    if 'ohm' in q_lower and 'law' in q_lower:
        return "Ohm's Law (E = I × R) describes the relationship between voltage (E), current (I), and resistance (R) in an electrical circuit. This fundamental relationship allows calculation of any one parameter when the other two are known."
    
    # Return base explanation if no specific match
    return f"{correct_text} This answer correctly addresses the safety principle, technical requirement, or operational procedure relevant to the question."

# Read the full text from user input
if __name__ == '__main__':
    import sys
    
    # For now, read from stdin or use the text provided
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            text = f.read()
    else:
        print("Please provide the text file as argument", file=sys.stderr)
        sys.exit(1)
    
    questions = parse_questions_complete(text)
    
    print(json.dumps(questions, indent=2, ensure_ascii=False))
    print(f"\nParsed {len(questions)} questions", file=sys.stderr)



