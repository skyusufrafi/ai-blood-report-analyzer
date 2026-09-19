import os
import pytesseract

from PIL import Image
import fitz


# --------------------------------------------------
# Tesseract configuration
# --------------------------------------------------

TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


# --------------------------------------------------
# IMAGE OCR
# --------------------------------------------------

def extract_text_from_image(file_path: str) -> str:

    try:
        image = Image.open(file_path)

        text = pytesseract.image_to_string(
            image
        )

        return text.strip()

    except Exception as e:
        raise RuntimeError(
            f"Image OCR failed: {str(e)}"
        )


# --------------------------------------------------
# PDF OCR
# --------------------------------------------------

def extract_text_from_pdf(file_path: str) -> str:

    extracted_text = []

    try:
        document = fitz.open(file_path)

        for page_number in range(len(document)):

            page = document[page_number]

            # Try extracting normal PDF text first
            text = page.get_text()

            if text.strip():

                extracted_text.append(text)

            else:

                # Scanned PDF → convert page to image
                pix = page.get_pixmap(
                    matrix=fitz.Matrix(2, 2)
                )

                image = Image.frombytes(
                    "RGB",
                    [pix.width, pix.height],
                    pix.samples
                )

                ocr_text = pytesseract.image_to_string(
                    image
                )

                extracted_text.append(
                    ocr_text
                )

        document.close()

        return "\n".join(
            extracted_text
        ).strip()

    except Exception as e:

        raise RuntimeError(
            f"PDF OCR failed: {str(e)}"
        )


# --------------------------------------------------
# MAIN OCR FUNCTION
# --------------------------------------------------

def extract_text(file_path: str) -> str:

    extension = os.path.splitext(
        file_path
    )[1].lower()


    if extension in [
        ".jpg",
        ".jpeg",
        ".png",
    ]:

        return extract_text_from_image(
            file_path
        )


    elif extension == ".pdf":

        return extract_text_from_pdf(
            file_path
        )


    else:

        raise ValueError(
            "Unsupported file format."
        )