import os
import uuid

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.ocr_service import extract_text


router = APIRouter(
    prefix="/upload",
    tags=["Upload"],
)


UPLOAD_DIR = "uploads"

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/")
async def upload_report(
    file: UploadFile = File(...)
):

    # ---------------------------------------------
    # 1. Check filename
    # ---------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )


    # ---------------------------------------------
    # 2. Check file extension
    # ---------------------------------------------

    original_name = file.filename

    extension = os.path.splitext(
        original_name
    )[1].lower()


    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, JPEG and PNG files are allowed."
        )


    # ---------------------------------------------
    # 3. Read uploaded file
    # ---------------------------------------------

    contents = await file.read()


    # ---------------------------------------------
    # 4. Check file size
    # ---------------------------------------------

    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 10 MB."
        )


    # ---------------------------------------------
    # 5. Generate unique report ID
    # ---------------------------------------------

    report_id = str(uuid.uuid4())


    # ---------------------------------------------
    # 6. Create uploads folder
    # ---------------------------------------------

    os.makedirs(
        UPLOAD_DIR,
        exist_ok=True
    )


    # ---------------------------------------------
    # 7. Save uploaded file
    # ---------------------------------------------

    saved_filename = (
        f"{report_id}{extension}"
    )

    saved_path = os.path.join(
        UPLOAD_DIR,
        saved_filename
    )


    with open(saved_path, "wb") as buffer:
        buffer.write(contents)


    # ---------------------------------------------
    # 8. Run OCR
    # ---------------------------------------------

    try:

        extracted_text = extract_text(
            saved_path
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"OCR failed: {str(e)}"
        )


    # ---------------------------------------------
    # 9. Return response
    # ---------------------------------------------

    return {
        "success": True,
        "message": "Report uploaded and OCR completed.",

        "report_id": report_id,

        "filename": original_name,

        "file_type": extension,

        "file_size": len(contents),

        "ocr": {
            "text": extracted_text,
            "characters": len(extracted_text),
        },
    }