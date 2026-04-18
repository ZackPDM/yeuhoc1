"""
DOCX parser — extracts text, OMML (math), and images from Word documents.
"""
import os
import re
import zipfile
from pathlib import Path
from lxml import etree
from docx import Document
from docx.opc.constants import RELATIONSHIP_TYPE as RT

from utils.omml_to_latex import omml_to_latex, OMML_NS
from utils.image_handler import save_image

WP_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
DRAWING_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main'
R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
WP_DRAWING_NS = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
PIC_NS = 'http://schemas.openxmlformats.org/drawingml/2006/picture'


def parse_docx(file_path: str) -> list[dict]:
    """
    Parse a DOCX file and extract structured paragraph data.
    
    Returns list of dicts, each with:
        - text: paragraph text with LaTeX markers
        - images: list of image data bytes
    """
    doc = Document(file_path)
    paragraphs = []
    
    # Get the XML tree for OMML processing
    docx_zip = zipfile.ZipFile(file_path)
    document_xml = etree.parse(docx_zip.open('word/document.xml'))
    root = document_xml.getroot()
    
    # Find all body paragraphs in XML
    body = root.find(f'.//{{{WP_NS}}}body')
    if body is None:
        return []
    
    xml_paragraphs = body.findall(f'{{{WP_NS}}}p')
    
    # Build relationship map for images
    rels = {}
    try:
        rels_xml = etree.parse(docx_zip.open('word/_rels/document.xml.rels'))
        for rel in rels_xml.getroot():
            rel_id = rel.get('Id', '')
            target = rel.get('Target', '')
            rels[rel_id] = target
    except Exception:
        pass
    
    for xml_para in xml_paragraphs:
        para_data = {'text': '', 'images': []}
        text_parts = []
        
        for child in xml_para.iter():
            tag = child.tag.split('}')[-1] if '}' in child.tag else child.tag
            
            # Regular text
            if tag == 't' and child.text:
                ns = child.tag.split('}')[0].strip('{') if '}' in child.tag else ''
                if ns == WP_NS:
                    text_parts.append(child.text)
            
            # OMML math
            if tag == 'oMath':
                latex = omml_to_latex(child)
                if latex.strip():
                    text_parts.append(f' ${latex.strip()}$ ')
            
            # Inline images (blip)
            if tag == 'blip':
                embed = child.get(f'{{{R_NS}}}embed', '')
                if embed and embed in rels:
                    img_target = rels[embed]
                    img_path = f'word/{img_target}' if not img_target.startswith('/') else img_target.lstrip('/')
                    try:
                        img_data = docx_zip.read(img_path)
                        para_data['images'].append(img_data)
                    except Exception:
                        pass
        
        para_data['text'] = ''.join(text_parts).strip()
        
        if para_data['text'] or para_data['images']:
            paragraphs.append(para_data)
    
    docx_zip.close()
    return paragraphs
