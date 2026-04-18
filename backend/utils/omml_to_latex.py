"""
OMML (Office Math Markup Language) to LaTeX converter.
Handles common mathematical constructs from Word documents.
"""
import re
from lxml import etree

# OMML namespace
OMML_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/math'
WP_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

NSMAP = {
    'm': OMML_NS,
    'w': WP_NS,
}


def omml_to_latex(omml_element) -> str:
    """Convert an OMML XML element to LaTeX string."""
    if omml_element is None:
        return ''
    
    tag = _local_tag(omml_element)
    
    converters = {
        'oMath': _convert_omath,
        'oMathPara': _convert_omath_para,
        'r': _convert_run,
        'f': _convert_fraction,
        'rad': _convert_radical,
        'sSup': _convert_superscript,
        'sSub': _convert_subscript,
        'sSubSup': _convert_subsup,
        'nary': _convert_nary,
        'd': _convert_delimiter,
        'm': _convert_matrix,
        'func': _convert_func,
        'acc': _convert_accent,
        'bar': _convert_bar,
        'eqArr': _convert_eq_array,
        'limLow': _convert_lim_low,
        'limUpp': _convert_lim_upp,
    }
    
    converter = converters.get(tag)
    if converter:
        return converter(omml_element)
    
    # Default: process children
    return _process_children(omml_element)


def _local_tag(element) -> str:
    """Get the local tag name without namespace."""
    tag = element.tag
    if '}' in tag:
        return tag.split('}', 1)[1]
    return tag


def _find(element, xpath):
    """Find element with namespace support."""
    return element.find(xpath, NSMAP)


def _findall(element, xpath):
    """Find all elements with namespace support."""
    return element.findall(xpath, NSMAP)


def _process_children(element) -> str:
    """Process all child elements and concatenate results."""
    parts = []
    for child in element:
        parts.append(omml_to_latex(child))
    return ''.join(parts)


def _get_text(element) -> str:
    """Get text content from a run element."""
    text_elem = _find(element, './/m:t')
    if text_elem is not None and text_elem.text:
        return text_elem.text
    # Also check w:t
    text_elem = _find(element, './/w:t')
    if text_elem is not None and text_elem.text:
        return text_elem.text
    return ''


def _convert_omath(element) -> str:
    return _process_children(element)


def _convert_omath_para(element) -> str:
    return _process_children(element)


def _convert_run(element) -> str:
    text = _get_text(element)
    # Map common Unicode math symbols to LaTeX
    symbol_map = {
        '∫': '\\int',
        '∑': '\\sum',
        '∏': '\\prod',
        '√': '\\sqrt',
        '∞': '\\infty',
        '±': '\\pm',
        '×': '\\times',
        '÷': '\\div',
        '≤': '\\leq',
        '≥': '\\geq',
        '≠': '\\neq',
        '≈': '\\approx',
        'α': '\\alpha',
        'β': '\\beta',
        'γ': '\\gamma',
        'δ': '\\delta',
        'ε': '\\varepsilon',
        'θ': '\\theta',
        'λ': '\\lambda',
        'μ': '\\mu',
        'π': '\\pi',
        'σ': '\\sigma',
        'φ': '\\varphi',
        'ω': '\\omega',
        'Δ': '\\Delta',
        'Σ': '\\Sigma',
        'Ω': '\\Omega',
        '→': '\\rightarrow',
        '←': '\\leftarrow',
        '⇒': '\\Rightarrow',
        '∈': '\\in',
        '∉': '\\notin',
        '⊂': '\\subset',
        '∪': '\\cup',
        '∩': '\\cap',
        '∀': '\\forall',
        '∃': '\\exists',
        '∂': '\\partial',
        '∇': '\\nabla',
    }
    
    for symbol, latex in symbol_map.items():
        text = text.replace(symbol, latex)
    
    return text


def _convert_fraction(element) -> str:
    num = _find(element, 'm:num')
    den = _find(element, 'm:den')
    num_latex = _process_children(num) if num is not None else ''
    den_latex = _process_children(den) if den is not None else ''
    return f'\\frac{{{num_latex}}}{{{den_latex}}}'


def _convert_radical(element) -> str:
    deg = _find(element, 'm:deg')
    e = _find(element, 'm:e')
    e_latex = _process_children(e) if e is not None else ''
    
    if deg is not None:
        deg_latex = _process_children(deg).strip()
        if deg_latex and deg_latex != '2':
            return f'\\sqrt[{deg_latex}]{{{e_latex}}}'
    
    return f'\\sqrt{{{e_latex}}}'


def _convert_superscript(element) -> str:
    e = _find(element, 'm:e')
    sup = _find(element, 'm:sup')
    e_latex = _process_children(e) if e is not None else ''
    sup_latex = _process_children(sup) if sup is not None else ''
    return f'{{{e_latex}}}^{{{sup_latex}}}'


def _convert_subscript(element) -> str:
    e = _find(element, 'm:e')
    sub = _find(element, 'm:sub')
    e_latex = _process_children(e) if e is not None else ''
    sub_latex = _process_children(sub) if sub is not None else ''
    return f'{{{e_latex}}}_{{{sub_latex}}}'


def _convert_subsup(element) -> str:
    e = _find(element, 'm:e')
    sub = _find(element, 'm:sub')
    sup = _find(element, 'm:sup')
    e_latex = _process_children(e) if e is not None else ''
    sub_latex = _process_children(sub) if sub is not None else ''
    sup_latex = _process_children(sup) if sup is not None else ''
    return f'{{{e_latex}}}_{{{sub_latex}}}^{{{sup_latex}}}'


def _convert_nary(element) -> str:
    """Convert n-ary operators (integrals, sums, products)."""
    nary_pr = _find(element, 'm:naryPr')
    sub = _find(element, 'm:sub')
    sup = _find(element, 'm:sup')
    e = _find(element, 'm:e')
    
    # Determine the operator
    op = '\\int'
    if nary_pr is not None:
        chr_elem = _find(nary_pr, 'm:chr')
        if chr_elem is not None:
            val = chr_elem.get(f'{{{OMML_NS}}}val', '')
            op_map = {
                '∫': '\\int', '∬': '\\iint', '∭': '\\iiint',
                '∑': '\\sum', '∏': '\\prod',
                '∮': '\\oint',
            }
            op = op_map.get(val, '\\int')
    
    sub_latex = _process_children(sub) if sub is not None else ''
    sup_latex = _process_children(sup) if sup is not None else ''
    e_latex = _process_children(e) if e is not None else ''
    
    result = op
    if sub_latex:
        result += f'_{{{sub_latex}}}'
    if sup_latex:
        result += f'^{{{sup_latex}}}'
    result += f' {e_latex}'
    
    return result


def _convert_delimiter(element) -> str:
    """Convert delimiters (parentheses, brackets, etc)."""
    dpr = _find(element, 'm:dPr')
    beg_chr = '('
    end_chr = ')'
    
    if dpr is not None:
        beg = _find(dpr, 'm:begChr')
        end = _find(dpr, 'm:endChr')
        if beg is not None:
            beg_chr = beg.get(f'{{{OMML_NS}}}val', '(')
        if end is not None:
            end_chr = end.get(f'{{{OMML_NS}}}val', ')')
    
    parts = []
    for e in _findall(element, 'm:e'):
        parts.append(_process_children(e))
    
    content = ', '.join(parts) if len(parts) > 1 else (parts[0] if parts else '')
    
    # Map to LaTeX delimiters
    delim_map = {
        '(': '(', ')': ')',
        '[': '[', ']': ']',
        '{': '\\{', '}': '\\}',
        '|': '|', '‖': '\\|',
        '⌈': '\\lceil', '⌉': '\\rceil',
        '⌊': '\\lfloor', '⌋': '\\rfloor',
    }
    
    left = delim_map.get(beg_chr, beg_chr)
    right = delim_map.get(end_chr, end_chr)
    
    return f'\\left{left} {content} \\right{right}'


def _convert_matrix(element) -> str:
    """Convert matrix."""
    rows = _findall(element, 'm:mr')
    row_strs = []
    for row in rows:
        cells = _findall(row, 'm:e')
        cell_strs = [_process_children(cell) for cell in cells]
        row_strs.append(' & '.join(cell_strs))
    
    content = ' \\\\ '.join(row_strs)
    return f'\\begin{{pmatrix}} {content} \\end{{pmatrix}}'


def _convert_func(element) -> str:
    """Convert function (sin, cos, lim, etc)."""
    fname = _find(element, 'm:fName')
    e = _find(element, 'm:e')
    
    fname_latex = _process_children(fname) if fname is not None else ''
    e_latex = _process_children(e) if e is not None else ''
    
    # Check for known function names
    known_funcs = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc',
                   'log', 'ln', 'exp', 'lim', 'max', 'min',
                   'det', 'dim', 'ker', 'deg']
    
    for func in known_funcs:
        if func in fname_latex.lower():
            return f'\\{func} {e_latex}'
    
    return f'{fname_latex} {e_latex}'


def _convert_accent(element) -> str:
    """Convert accents (hat, bar, dot, etc)."""
    e = _find(element, 'm:e')
    e_latex = _process_children(e) if e is not None else ''
    
    acc_pr = _find(element, 'm:accPr')
    if acc_pr is not None:
        chr_elem = _find(acc_pr, 'm:chr')
        if chr_elem is not None:
            val = chr_elem.get(f'{{{OMML_NS}}}val', '')
            accent_map = {
                '̂': '\\hat', '̃': '\\tilde',
                '̄': '\\bar', '⃗': '\\vec',
                '̇': '\\dot', '̈': '\\ddot',
            }
            accent = accent_map.get(val, '\\hat')
            return f'{accent}{{{e_latex}}}'
    
    return f'\\hat{{{e_latex}}}'


def _convert_bar(element) -> str:
    e = _find(element, 'm:e')
    e_latex = _process_children(e) if e is not None else ''
    return f'\\overline{{{e_latex}}}'


def _convert_eq_array(element) -> str:
    rows = _findall(element, 'm:e')
    row_strs = [_process_children(row) for row in rows]
    content = ' \\\\ '.join(row_strs)
    return f'\\begin{{aligned}} {content} \\end{{aligned}}'


def _convert_lim_low(element) -> str:
    e = _find(element, 'm:e')
    lim = _find(element, 'm:lim')
    e_latex = _process_children(e) if e is not None else ''
    lim_latex = _process_children(lim) if lim is not None else ''
    return f'{e_latex}_{{{lim_latex}}}'


def _convert_lim_upp(element) -> str:
    e = _find(element, 'm:e')
    lim = _find(element, 'm:lim')
    e_latex = _process_children(e) if e is not None else ''
    lim_latex = _process_children(lim) if lim is not None else ''
    return f'{e_latex}^{{{lim_latex}}}'


def extract_omml_from_paragraph(paragraph_xml) -> list[str]:
    """
    Extract OMML elements from a paragraph XML and convert to LaTeX.
    Returns list of LaTeX strings found in the paragraph.
    """
    latex_parts = []
    
    omath_elements = paragraph_xml.findall(f'.//{{{OMML_NS}}}oMath')
    for omath in omath_elements:
        latex = omml_to_latex(omath)
        if latex.strip():
            latex_parts.append(latex.strip())
    
    return latex_parts
