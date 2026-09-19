import re


def extract_patient_details(text: str) -> dict:
    """
    Extract basic patient information from OCR/PDF text.
    """

    details = {
        "name": "Not detected",
        "age": "Not detected",
        "gender": "Not detected",
        "date": "Not detected",
    }

    # Normalize text
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text).strip()

    # --------------------------------------------------
    # PATIENT NAME
    # --------------------------------------------------

    name_patterns = [
        # Patient Name: Aarav Sharma
        r"(?:patient\s*name)\s*[:\-]?\s*"
        r"([A-Za-z][A-Za-z .'-]{1,50}?)"
        r"\s+(?=age|gender|sex|report|date|sample|$)",

        # Patient Name Aarav Sharma
        r"(?:patient\s*name)\s+"
        r"([A-Za-z][A-Za-z .'-]{1,50}?)"
        r"\s+(?=age|gender|sex|report|date|sample|$)",
    ]

    for pattern in name_patterns:

        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            name = match.group(1).strip()

            # Clean trailing punctuation
            name = re.sub(r"[:\-]+$", "", name).strip()

            if len(name) >= 2:
                details["name"] = name
                break

    # --------------------------------------------------
    # AGE
    # --------------------------------------------------

    age_match = re.search(
        r"(?:age)\s*[:\-]?\s*(\d{1,3})"
        r"\s*(?:years?|yrs?)?",
        text,
        re.IGNORECASE,
    )

    if age_match:
        details["age"] = f"{age_match.group(1)} years"

    # --------------------------------------------------
    # GENDER
    # --------------------------------------------------

    gender_match = re.search(
        r"(?:gender|sex)\s*[:\-]?\s*"
        r"(male|female|m|f)\b",
        text,
        re.IGNORECASE,
    )

    if gender_match:

        gender = gender_match.group(1).lower()

        if gender in ["m", "male"]:
            details["gender"] = "Male"
        else:
            details["gender"] = "Female"

    # --------------------------------------------------
    # REPORT DATE
    # --------------------------------------------------

    date_match = re.search(
        r"(?:report\s*date|sample\s*date|date)"
        r"\s*[:\-]?\s*"
        r"(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
        text,
        re.IGNORECASE,
    )

    if date_match:
        details["date"] = date_match.group(1)

    return details