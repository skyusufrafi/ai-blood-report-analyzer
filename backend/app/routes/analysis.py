from fastapi import APIRouter

from app.services.analysis_service import analyze_report


router = APIRouter(
    prefix="/analysis",
    tags=["Analysis"],
)


@router.get("/{report_id}")
async def get_analysis(report_id: str):

    result = analyze_report(report_id)

    return {
        "success": True,
        "report_id": report_id,
        "data": result,
    }