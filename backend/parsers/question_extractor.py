"""
Regex-based question and answer extractor.
Supports Vietnamese exam format (Câu 1:, Câu 2., etc.)
"""
import re
from dataclasses import dataclass, field


@dataclass
class ExtractedQuestion:
    id: int
    content: str
    options: list[str] = field(default_factory=list)
    answer: str = ''
    image_refs: list[str] = field(default_factory=list)


def extract_questions(text: str) -> list[ExtractedQuestion]:
    """
    Extract questions, options, and answers from text using regex patterns.
    
    Supports formats:
    - Câu 1: / Câu 1. / Question 1:
    - A. / A: / A) for options
    - Đáp án: A / Answer: A
    """
    questions = []
    
    # Split text into lines for processing
    lines = text.split('\n')
    
    # Patterns
    question_pattern = re.compile(
        r'^(?:Câu|Question|Q)\s*(\d+)\s*[.:)\]]\s*(.*)',
        re.IGNORECASE
    )
    option_pattern = re.compile(
        r'^([A-D])\s*[.:)]\s*(.*)',
        re.IGNORECASE
    )
    answer_pattern = re.compile(
        r'(?:Đáp án|Answer|ĐA)\s*[.:)]\s*([A-D])',
        re.IGNORECASE
    )
    
    current_question: ExtractedQuestion | None = None
    current_content_lines: list[str] = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Check for new question
        q_match = question_pattern.match(line)
        if q_match:
            # Save previous question
            if current_question:
                if current_content_lines:
                    current_question.content += ' ' + ' '.join(current_content_lines)
                questions.append(current_question)
            
            q_id = int(q_match.group(1))
            q_content = q_match.group(2).strip()
            current_question = ExtractedQuestion(id=q_id, content=q_content)
            current_content_lines = []
            continue
        
        # Check for option
        opt_match = option_pattern.match(line)
        if opt_match and current_question is not None:
            label = opt_match.group(1).upper()
            text = opt_match.group(2).strip()
            current_question.options.append(f'{label}. {text}')
            # Flush content lines
            if current_content_lines:
                current_question.content += ' ' + ' '.join(current_content_lines)
                current_content_lines = []
            continue
        
        # Check for answer
        ans_match = answer_pattern.search(line)
        if ans_match and current_question is not None:
            current_question.answer = ans_match.group(1).upper()
            continue
        
        # Otherwise, it's continuation of question content
        if current_question is not None and len(current_question.options) == 0:
            current_content_lines.append(line)
    
    # Save last question
    if current_question:
        if current_content_lines:
            current_question.content += ' ' + ' '.join(current_content_lines)
        questions.append(current_question)
    
    # Try to extract answers from inline format: "Đáp án: 1-A, 2-B, ..."
    _extract_answer_key(text, questions)
    
    return questions


def _extract_answer_key(text: str, questions: list[ExtractedQuestion]):
    """Try to find answer key section and assign answers."""
    # Pattern: "1-A" or "1.A" or "Câu 1: A"
    key_pattern = re.compile(r'(\d+)\s*[-.:]\s*([A-D])', re.IGNORECASE)
    
    # Look for answer key section
    key_section = re.search(
        r'(?:Đáp án|Answer Key|ĐÁP ÁN)[:\s]*\n?((?:.*\n?)*)',
        text,
        re.IGNORECASE
    )
    
    if key_section:
        key_text = key_section.group(1)
        matches = key_pattern.findall(key_text)
        
        answer_map = {int(m[0]): m[1].upper() for m in matches}
        
        for q in questions:
            if not q.answer and q.id in answer_map:
                q.answer = answer_map[q.id]


def extract_questions_from_paragraphs(paragraphs: list[dict]) -> list[ExtractedQuestion]:
    """
    Extract questions from a list of paragraph dicts with 'text' and optional 'latex' and 'images'.
    This is used by the docx parser which provides structured paragraph data.
    """
    # Combine all paragraphs into text, preserving LaTeX markers
    full_text = '\n'.join(p.get('text', '') for p in paragraphs)
    
    questions = extract_questions(full_text)
    
    # Map images to questions based on position
    image_paragraphs = [(i, p) for i, p in enumerate(paragraphs) if p.get('images')]
    
    for img_idx, (para_idx, para) in enumerate(image_paragraphs):
        # Find which question this image belongs to by position
        para_text_before = '\n'.join(p.get('text', '') for p in paragraphs[:para_idx + 1])
        
        # Count how many questions appear before this paragraph
        q_pattern = re.compile(r'(?:Câu|Question|Q)\s*(\d+)\s*[.:)\]]', re.IGNORECASE)
        q_matches = list(q_pattern.finditer(para_text_before))
        
        if q_matches:
            last_q_id = int(q_matches[-1].group(1))
            # Find the question and add image reference
            for q in questions:
                if q.id == last_q_id:
                    q.image_refs.extend(para.get('images', []))
                    break
    
    return questions
