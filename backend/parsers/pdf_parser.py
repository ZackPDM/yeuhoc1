"""
PDF parser — extracts text and images from PDF documents.
"""
import pdfplumber
from utils.image_handler import save_image


def parse_pdf(file_path: str) -> list[dict]:
    """
    Parse a PDF file and extract structured paragraph data.
    
    Returns list of dicts, each with:
        - text: paragraph text
        - images: list of image data bytes
    """
    paragraphs = []
    
    with pdfplumber.open(file_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            # Extract text
            text = page.extract_text()
            if text:
                # Split into paragraphs by double newlines or significant gaps
                lines = text.split('\n')
                current_para = []
                
                for line in lines:
                    line = line.strip()
                    if line:
                        current_para.append(line)
                    elif current_para:
                        paragraphs.append({
                            'text': ' '.join(current_para),
                            'images': [],
                        })
                        current_para = []
                
                if current_para:
                    paragraphs.append({
                        'text': ' '.join(current_para),
                        'images': [],
                    })
            
            # Extract images
            if page.images:
                for img_info in page.images:
                    try:
                        # pdfplumber image extraction
                        img = page.crop((
                            img_info['x0'], img_info['top'],
                            img_info['x1'], img_info['bottom']
                        ))
                        img_obj = img.to_image(resolution=150)
                        
                        import io
                        buf = io.BytesIO()
                        img_obj.save(buf, format='PNG')
                        img_data = buf.getvalue()
                        
                        # Attach image to the last paragraph or create new one
                        if paragraphs:
                            paragraphs[-1]['images'].append(img_data)
                        else:
                            paragraphs.append({
                                'text': '',
                                'images': [img_data],
                            })
                    except Exception:
                        pass
    
    return paragraphs
