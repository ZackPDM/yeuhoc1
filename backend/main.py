"""
FastAPI server for Azota Clone — document parsing backend.
"""
import os
import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from parsers.docx_parser import parse_docx
from parsers.pdf_parser import parse_pdf
from parsers.question_extractor import extract_questions_from_paragraphs
from utils.image_handler import save_image, clear_extracted_images, EXTRACTED_DIR

app = FastAPI(
    title="Azota Clone API",
    description="Backend API cho ứng dụng tạo đề thi trắc nghiệm",
    version="1.0.0",
)

# CORS - allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
UPLOAD_DIR = Path(__file__).parent / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)
EXTRACTED_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    return {
        "message": "Azota Clone API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a DOCX or PDF file and extract questions.
    Returns structured question data with LaTeX and image URLs.
    """
    # Validate file type
    filename = file.filename or 'unknown'
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    
    if ext not in ('docx', 'pdf'):
        raise HTTPException(
            status_code=400,
            detail=f"Định dạng file không hỗ trợ: .{ext}. Chỉ chấp nhận .docx và .pdf"
        )
    
    # Save uploaded file
    file_path = UPLOAD_DIR / filename
    try:
        with open(file_path, 'wb') as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi lưu file: {str(e)}")
    
    # Clear previous extracted images
    clear_extracted_images()
    
    # Parse document
    try:
        if ext == 'docx':
            paragraphs = parse_docx(str(file_path))
        else:
            paragraphs = parse_pdf(str(file_path))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi phân tích file: {str(e)}"
        )
    
    # Extract questions
    try:
        extracted = extract_questions_from_paragraphs(paragraphs)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi trích xuất câu hỏi: {str(e)}"
        )
    
    # Process images and build response
    questions = []
    for q in extracted:
        image_url = None
        
        # Save images associated with this question
        if q.image_refs:
            for idx, img_data in enumerate(q.image_refs):
                if isinstance(img_data, bytes):
                    url = save_image(img_data, q.id, idx)
                    if image_url is None:
                        image_url = url
        
        questions.append({
            "id": q.id,
            "content": q.content,
            "options": q.options if q.options else [
                "A. (không có đáp án)",
                "B. (không có đáp án)",
                "C. (không có đáp án)",
                "D. (không có đáp án)",
            ],
            "answer": q.answer or "A",
            "image_url": image_url,
        })
    
    # Cleanup uploaded file
    try:
        os.unlink(file_path)
    except Exception:
        pass
    
    if not questions:
        raise HTTPException(
            status_code=400,
            detail="Không tìm thấy câu hỏi trong file. Hãy đảm bảo file sử dụng format: Câu 1: ..."
        )
    
    return {"questions": questions}


@app.get("/api/images/{filename}")
async def get_image(filename: str):
    """Serve extracted images."""
    file_path = EXTRACTED_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Ảnh không tồn tại")
    return FileResponse(str(file_path), media_type="image/jpeg")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
