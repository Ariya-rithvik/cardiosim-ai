from pydantic import BaseModel
from typing import List, Optional

class ClinicalInput(BaseModel):
    chest_pain_duration: int          # minutes
    ecg_findings: str                 # e.g. "ST elevation V1-V4"
    troponin_level: float             # ng/mL
    age: int
    risk_factors: List[str] = []      # e.g. ["hypertension", "diabetes"]
    symptoms: Optional[str] = ""

class DiagnosisOutput(BaseModel):
    diagnosis: str
    affected_region: str
    artery_id: str                    # "LAD" | "RCA" | "LCX"
    urgency: str                      # "Immediate" | "Urgent" | "Elective"
    recommended_intervention: str
    reasoning: str
    confidence: Optional[float] = 0.92

class ExplainRequest(BaseModel):
    diagnosis: str
    affected_region: str
    recommended_intervention: str
    reasoning: str
    audience: str = "patient"         # "patient" | "clinician"

class ExplainResponse(BaseModel):
    explanation: str

class MentorRequest(BaseModel):
    diagnosis: str
    affected_region: str
    artery_id: str
    urgency: str
    recommended_intervention: str
    current_step: str        # blocked | guide | balloon | stent | flow
    question: Optional[str] = ""   # student's follow-up question

class MentorResponse(BaseModel):
    guidance: str            # main step-by-step instructions
    safety_checks: list      # critical safety points
    ask_ai: bool = True      # whether Gemini was used

class EmergencyRequest(BaseModel):
    """Emergency AI assistance when specialist unavailable"""
    diagnosis: str
    affected_region: str
    artery_id: str
    urgency: str
    recommended_intervention: str
    current_step: Optional[str] = "assessment"   # assessment | preparation | procedure | monitoring

class EmergencyResponse(BaseModel):
    """Visual step-by-step emergency guidance from Genie"""
    protocol: str            # detailed emergency protocol with visual descriptions
    visual_steps: List[str]  # visual action items (what student should see/do)
    ai_provider: str         # "Genie" or "Protocol Engine"
    emergency_activated: bool = True
