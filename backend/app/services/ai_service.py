import os
import time
import json

from dotenv import load_dotenv
from google import genai


# =========================================================
# GEMINI CONFIGURATION
# =========================================================

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

client = None

if API_KEY:
    client = genai.Client(api_key=API_KEY)

GEMINI_MODEL = "gemini-3.8-flash"


# =========================================================
# GEMINI REQUEST HELPER
# =========================================================

def generate_with_retry(prompt: str, max_retries: int = 2):
    """
    Generate a Gemini response.

    Only a small number of retries are used so that
    temporary API failures do not make the dashboard
    excessively slow.
    """

    if not client:
        return None

    for attempt in range(max_retries):

        try:

            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )

            if response and response.text:
                return response.text.strip()

        except Exception as e:

            print(
                f"Gemini attempt "
                f"{attempt + 1}/{max_retries} failed:"
            )
            print(e)

            if attempt < max_retries - 1:
                time.sleep(1)

    return None


# =========================================================
# PARAMETER EXPLANATIONS — SINGLE GEMINI REQUEST
# =========================================================

def generate_parameter_explanations(parameters: list) -> dict:
    """
    Generate explanations for ALL blood parameters
    using one Gemini request.

    Returns:

    {
        "Hemoglobin": "...",
        "WBC Count": "...",
        ...
    }
    """

    if not parameters:
        return {}

    if not client:
        return {
            parameter.get("name", "Unknown"): (
                f"{parameter.get('name', 'This parameter')} "
                f"is reported as "
                f"{str(parameter.get('status', 'unknown')).lower()} "
                "relative to the configured reference range. "
                "This result should be interpreted together with "
                "other laboratory findings and clinical context."
            )
            for parameter in parameters
        }

    parameter_data = []

    for parameter in parameters:

        parameter_data.append(
            {
                "name": parameter.get("name"),
                "value": parameter.get("value"),
                "unit": parameter.get("unit"),
                "reference_range": parameter.get(
                    "reference_range"
                ),
                "status": parameter.get("status"),
            }
        )

    prompt = f"""
You are BloodAI, an educational laboratory-report assistant.

Generate a short educational explanation for EACH blood
parameter below.

Parameters:

{json.dumps(parameter_data, indent=2)}

Requirements:

- Explain what each parameter generally represents.
- Explain what its reported status means relative to the
  provided reference range.
- Keep each explanation to 1-2 short sentences.
- Use simple language.
- Do not diagnose diseases.
- Do not claim that an abnormal result proves a disease.
- Do not recommend medication or treatment.
- Do not invent symptoms, medical history, age, gender,
  or other missing information.
- Base the explanation only on the provided values and
  reference ranges.

IMPORTANT:
Return ONLY valid JSON.

Use exactly this format:

{{
    "Parameter Name": "Short explanation",
    "Another Parameter": "Short explanation"
}}

Do not add markdown.
Do not add ```json.
Do not add any text before or after the JSON.
"""

    response_text = generate_with_retry(
        prompt,
        max_retries=2
    )

    if response_text:

        try:

            # Remove accidental markdown fences
            cleaned = response_text.strip()

            if cleaned.startswith("```"):
                cleaned = cleaned.replace(
                    "```json",
                    ""
                ).replace(
                    "```",
                    ""
                ).strip()

            explanations = json.loads(cleaned)

            if isinstance(explanations, dict):
                return explanations

        except Exception as e:

            print(
                "Gemini explanation JSON parsing error:",
                e
            )

    # -----------------------------------------------------
    # FALLBACK
    # -----------------------------------------------------

    fallback = {}

    for parameter in parameters:

        name = parameter.get(
            "name",
            "Unknown parameter"
        )

        status = parameter.get(
            "status",
            "Unknown"
        )

        fallback[name] = (
            f"{name} is reported as "
            f"{str(status).lower()} relative to the "
            "configured reference range. "
            "This result should be interpreted together "
            "with other laboratory findings and "
            "clinical context."
        )

    return fallback


# =========================================================
# SINGLE PARAMETER EXPLANATION
# =========================================================
# Kept for compatibility with existing code.
# New analysis flow should use generate_parameter_explanations()
# =========================================================

def generate_parameter_explanation(parameter: dict) -> str:

    explanations = generate_parameter_explanations(
        [parameter]
    )

    name = parameter.get(
        "name",
        "Unknown parameter"
    )

    return explanations.get(
        name,
        (
            f"{name} is reported as "
            f"{str(parameter.get('status', 'unknown')).lower()} "
            "relative to the configured reference range. "
            "This result should be interpreted together with "
            "other laboratory findings and clinical context."
        )
    )


# =========================================================
# OVERALL AI REPORT SUMMARY
# =========================================================

def generate_ai_report_summary(parameters: list) -> str:

    if not parameters:
        return (
            "No supported blood parameters were detected "
            "from the uploaded report."
        )

    if not client:
        return (
            "AI service is not configured. "
            "The detected parameters have been evaluated "
            "using the configured reference ranges."
        )

    parameter_text = []

    for parameter in parameters:

        parameter_text.append(
            f"""
Parameter: {parameter.get("name")}
Value: {parameter.get("value")} {parameter.get("unit")}
Reference Range: {parameter.get("reference_range")}
Status: {parameter.get("status")}
"""
        )

    report_data = "\n".join(parameter_text)

    prompt = f"""
You are BloodAI, an educational blood-report analysis assistant.

Analyze the following structured laboratory results:

{report_data}

Create a concise overall report summary.

Requirements:

- Start with a neutral overview.
- Mention parameters within the configured range.
- Mention parameters marked Low or High.
- Explain findings in simple language.
- Do not diagnose any disease.
- Do not claim abnormal values prove a medical condition.
- Do not invent symptoms, medications, age, gender,
  or medical history.
- Do not recommend specific medicines or treatments.
- Encourage consultation with a qualified healthcare
  professional when results are outside the reference range.
- Mention that reference ranges can vary between laboratories.
- Keep the response around 100-150 words.
- Use short paragraphs or bullet points.
"""

    response_text = generate_with_retry(
        prompt,
        max_retries=2
    )

    if response_text:
        return response_text

    return (
        "The report contains laboratory values that were "
        "compared with the configured reference ranges. "
        "Some values may require attention based on their "
        "reported status. Please discuss abnormal findings "
        "with a qualified healthcare professional."
    )