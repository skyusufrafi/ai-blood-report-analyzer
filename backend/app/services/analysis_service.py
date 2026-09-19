import os

from app.services.patient_service import extract_patient_details
from app.services.ocr_service import extract_text
from app.services.parameter_service import (
    extract_parameters,
    generate_summary,
)

from app.services.ai_service import (
    generate_parameter_explanation,
    generate_ai_report_summary,
)


def find_uploaded_file(report_id: str):
    uploads_dir = "uploads"

    if not os.path.exists(uploads_dir):
        return None

    for filename in os.listdir(uploads_dir):
        if filename.startswith(report_id):
            return os.path.join(uploads_dir, filename)

    return None


def analyze_report(report_id: str):

    file_path = find_uploaded_file(report_id)

    if not file_path:
        return {
            "error": "Report file not found."
        }

    # OCR
    extracted_text = extract_text(file_path)

    # Patient details
    patient = extract_patient_details(
        extracted_text
    )

    # Blood parameters
    parameters = extract_parameters(
        extracted_text
    )

    # AI explanation for each parameter
    for parameter in parameters:

        parameter["explanation"] = (
            generate_parameter_explanation(
                parameter
            )
        )

    # Summary counts
    summary = generate_summary(
        parameters
    )

    # Overall AI summary
    ai_summary = generate_ai_report_summary(
        parameters
    )

    return {
        "patient": patient,
        "summary": summary,
        "parameters": parameters,
        "ocr_text": extracted_text,
        "ai_summary": ai_summary,
    }