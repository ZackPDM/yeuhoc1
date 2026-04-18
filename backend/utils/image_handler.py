"""
Image handler for extracting and managing images from documents.
"""
import os
import uuid
from pathlib import Path
from PIL import Image
import io

EXTRACTED_DIR = Path(__file__).parent.parent / 'extracted_images'
EXTRACTED_DIR.mkdir(exist_ok=True)


def save_image(image_data: bytes, question_id: int, image_index: int = 0, 
               format: str = 'JPEG') -> str:
    """
    Save image data to disk and return the relative URL.
    
    Args:
        image_data: Raw image bytes
        question_id: Associated question ID
        image_index: Index if multiple images per question
        format: Output format (JPEG, PNG)
    
    Returns:
        Relative URL path to the saved image
    """
    EXTRACTED_DIR.mkdir(exist_ok=True)
    
    filename = f'q{question_id}'
    if image_index > 0:
        filename += f'_{image_index}'
    filename += '.jpg'
    
    filepath = EXTRACTED_DIR / filename
    
    try:
        img = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary (for JPEG)
        if img.mode in ('RGBA', 'P', 'LA'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize if too large (max 1200px width)
        max_width = 1200
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)
        
        img.save(str(filepath), 'JPEG', quality=85, optimize=True)
    except Exception as e:
        # If PIL fails, save raw bytes
        with open(filepath, 'wb') as f:
            f.write(image_data)
    
    return f'/api/images/{filename}'


def clear_extracted_images():
    """Remove all previously extracted images."""
    if EXTRACTED_DIR.exists():
        for f in EXTRACTED_DIR.iterdir():
            if f.is_file():
                f.unlink()
