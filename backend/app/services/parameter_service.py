import re


REFERENCE_RANGES = {
    "Hemoglobin": {
        "min": 13.0,
        "max": 17.0,
        "unit": "g/dL",
    },
    "WBC Count": {
        "min": 4000,
        "max": 11000,
        "unit": "/µL",
    },
    "RBC Count": {
        "min": 4.5,
        "max": 5.5,
        "unit": "million/µL",
    },
    "Platelet Count": {
        "min": 150000,
        "max": 450000,
        "unit": "/µL",
    },
    "MCV": {
        "min": 80,
        "max": 100,
        "unit": "fL",
    },
    "MCH": {
        "min": 27,
        "max": 33,
        "unit": "pg",
    },
    "MCHC": {
        "min": 32,
        "max": 36,
        "unit": "g/dL",
    },
}


def normalize_ocr_text(text: str) -> str:
    """
    Normalize common OCR variations while preserving
    line structure for reliable parameter extraction.
    """

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    # Normalize different micro symbols
    text = text.replace("µ", "u")
    text = text.replace("μ", "u")

    # Remove excessive spaces but keep new lines
    lines = []

    for line in text.split("\n"):
        line = re.sub(r"[ \t]+", " ", line)
        line = line.strip()

        if line:
            lines.append(line)

    return "\n".join(lines)


def get_status(
    value: float,
    minimum: float,
    maximum: float
) -> str:

    if value < minimum:
        return "Low"

    if value > maximum:
        return "High"

    return "Normal"


def create_parameter(
    parameter_name: str,
    value: float
) -> dict:

    reference = REFERENCE_RANGES[parameter_name]

    status = get_status(
        value,
        reference["min"],
        reference["max"],
    )

    return {
        "name": parameter_name,
        "value": value,
        "unit": reference["unit"],
        "reference_range": (
            f"{reference['min']} - {reference['max']}"
        ),
        "status": status,
    }


def extract_value_from_line(
    line: str,
    parameter_name: str
):
    """
    Extract the numeric result from one OCR line.
    """

    patterns = {

        "Hemoglobin": [
            r"^\s*(?:hemoglobin|haemoglobin|hb)"
            r"\s*[:\-]?\s*"
            r"(\d+(?:\.\d+)?)\b"
        ],

        "WBC Count": [
            r"^\s*(?:wbc\s*count|wbc|"
            r"white\s+blood\s+cell(?:s)?|"
            r"total\s+leukocyte\s+count|tlc)"
            r"\s*[:\-]?\s*"
            r"(\d+(?:\.\d+)?)\b"
        ],

        "RBC Count": [
            r"^\s*(?:rbc\s*count|rbc|"
            r"red\s+blood\s+cell(?:s)?|"
            r"erythrocyte\s+count)"
            r"\s*[:\-]?\s*"
            r"(\d+(?:\.\d+)?)\b"
        ],

        "Platelet Count": [
            r"^\s*(?:platelet\s*count|platelets?|"
            r"plt)"
            r"\s*[:\-]?\s*"
            r"(\d+(?:\.\d+)?)\b"
        ],

        # MCHC MUST come before MCH
        "MCHC": [
            r"^\s*mchc\b"
            r"\s*[:\-]?\s*"
            r"(\d+(?:\.\d+)?)\b"
        ],

        "MCH": [
            r"^\s*mch\b"
            r"\s*[:\-]?\s*"
            r"(\d+(?:\.\d+)?)\b"
        ],

        "MCV": [
            r"^\s*mcv\b"
            r"\s*[:\-]?\s*"
            r"(\d+(?:\.\d+)?)\b"
        ],
    }

    pattern_list = patterns.get(parameter_name, [])

    for pattern in pattern_list:

        match = re.search(
            pattern,
            line,
            re.IGNORECASE
        )

        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None

    return None


def extract_parameters(text: str) -> list:
    """
    Extract supported blood parameters from OCR text.

    Uses line-based matching so that table formatting
    from laboratory reports is preserved as much as possible.
    """

    text = normalize_ocr_text(text)

    parameters = []

    # Keep this order explicit.
    # MCHC is before MCH to avoid ambiguity.
    parameter_names = [
        "Hemoglobin",
        "WBC Count",
        "RBC Count",
        "Platelet Count",
        "MCV",
        "MCHC",
        "MCH",
    ]

    lines = text.split("\n")

    for parameter_name in parameter_names:

        value = None

        # First: look through individual OCR lines
        for line in lines:

            extracted_value = extract_value_from_line(
                line,
                parameter_name
            )

            if extracted_value is not None:
                value = extracted_value
                break

        # If not found on a separate line,
        # try the complete normalized text.
        if value is None:

            compact_text = " ".join(lines)

            aliases = {
                "Hemoglobin": r"(?:hemoglobin|haemoglobin|hb)",
                "WBC Count": r"(?:wbc\s*count|wbc|tlc)",
                "RBC Count": r"(?:rbc\s*count|rbc)",
                "Platelet Count": r"(?:platelet\s*count|platelets?|plt)",
                "MCV": r"\bmcv\b",
                "MCHC": r"\bmchc\b",
                "MCH": r"\bmch\b",
            }

            alias = aliases[parameter_name]

            fallback_pattern = (
                rf"{alias}"
                r"\s*[:\-]?\s*"
                r"(\d+(?:\.\d+)?)\b"
            )

            match = re.search(
                fallback_pattern,
                compact_text,
                re.IGNORECASE
            )

            if match:
                try:
                    value = float(match.group(1))
                except ValueError:
                    value = None

        if value is not None:

            parameters.append(
                create_parameter(
                    parameter_name,
                    value
                )
            )

    return parameters


def generate_summary(parameters: list) -> dict:

    normal = 0
    low = 0
    high = 0

    for parameter in parameters:

        status = parameter.get("status")

        if status == "Normal":
            normal += 1

        elif status == "Low":
            low += 1

        elif status == "High":
            high += 1

    return {
        "total": len(parameters),
        "normal": normal,
        "low": low,
        "high": high,
    }