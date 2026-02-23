from fastapi import APIRouter
from schemas import ExplainRequest, ExplainResponse
import os

router = APIRouter()

MOCK_PATIENT = (
    "Your heart had a blockage in one of its main blood vessels called the "
    "{artery}. This stopped blood reaching part of your heart muscle, which is "
    "what caused your chest pain. To fix this, doctors will use a tiny procedure "
    "called a stent — a small metal mesh tube — to open the blocked vessel and "
    "restore blood flow. Most patients recover well and are back to daily activities "
    "within a few weeks. "
)

MOCK_CLINICIAN = (
    "Diagnosis: {diagnosis}. Primary culprit vessel: {artery}. "
    "Management: {intervention}. Rationale: {reasoning} "
    "Recommend immediate cardiology consult and cath-lab activation as per AHA/ACC STEMI guidelines."
)

@router.post("/explain", response_model=ExplainResponse)
async def explain(req: ExplainRequest):
    use_mock = os.getenv("GEMINI_MOCK", "true").lower() == "true"

    if not use_mock:
        try:
            import google.generativeai as genai
            genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
            model = genai.GenerativeModel("gemini-1.5-flash")
            audience_note = (
                "for a patient with no medical background" if req.audience == "patient"
                else "for a junior doctor"
            )
            prompt = (
                f"Explain the following cardiac diagnosis {audience_note} in 3-4 sentences:\n"
                f"Diagnosis: {req.diagnosis}\n"
                f"Affected region: {req.affected_region}\n"
                f"Intervention: {req.recommended_intervention}\n"
                f"Clinical reasoning: {req.reasoning}"
            )
            response = model.generate_content(prompt)
            return ExplainResponse(explanation=response.text)
        except Exception as e:
            print(f"[Gemini] Error: {e}. Using mock explanation.")

    # mock
    if req.audience == "patient":
        text = MOCK_PATIENT.format(artery=req.affected_region)
    else:
        text = MOCK_CLINICIAN.format(
            diagnosis=req.diagnosis,
            artery=req.affected_region,
            intervention=req.recommended_intervention,
            reasoning=req.reasoning,
        )
    return ExplainResponse(explanation=text)
