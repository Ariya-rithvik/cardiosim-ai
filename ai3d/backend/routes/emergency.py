"""
Emergency AI Route — Google Genie-powered visual guidance for urgent cardiac cases.
When no specialist is available, students get real-time visual assistance.
"""
import os
import base64
import logging
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from schemas import EmergencyRequest, EmergencyResponse

logger = logging.getLogger(__name__)
router = APIRouter()

# ─────────────────────────────────────────────
#  Mock Emergency Guidance (fallback)
# ─────────────────────────────────────────────
EMERGENCY_PROTOCOLS = {
    "immediate_stemi": {
        "protocol": """🚨 STEMI EMERGENCY PROTOCOL — Immediate Action Required

FIRST 60 SECONDS:
1. Call emergency code: "Code STEMI - Potential acute MI"
2. Get crash cart to bedside (defibrillator + emergency drugs)
3. Activate catheter lab immediately
4. Place patient on continuous cardiac monitoring

ACTION ITEMS (Next 5 minutes):
✓ IV access × 2 arms
✓ 12-lead ECG (should take <10 min from first contact)
✓ Aspirin 300mg chewed (give immediately - DO NOT DELAY)
✓ Oxygen if SpO2 < 94% only
✓ Pain control: morphine 2-4mg IV
✓ Blood samples: troponin, CBC, coags, glucose, ABG

DOOR-TO-BALLOON TARGET: < 90 MINUTES IF PCI available
If no cath lab: Thrombolysis within 30 minutes

DO NOT WAIT FOR TEST RESULTS TO TREAT""",
        "visual_steps": [
            "Apply cardiac monitoring pads (correct placement shown)",
            "Establish IV access points",
            "Administer Aspirin 300mg",
            "12-lead ECG positioning",
            "Prepare for transport to cath lab"
        ]
    },
    "immediate_nstemi": {
        "protocol": """🚨 HIGH-RISK NSTEMI PROTOCOL — URGENT Intervention

THIS IS A MEDICAL EMERGENCY — Patient needs invasive coronary angiography

IMMEDIATE ACTIONS (0-10 min):
1. Risk stratify: Check GRACE score (if >140 = very high risk)
2. Attach cardiac monitoring + supplemental O2
3. IV access × 2
4. Aspirin 300mg + P2Y12 inhibitor loading:
   - Ticagrelor 180mg OR
   - Prasugrel 60mg OR
   - Clopidogrel 600mg
5. Anticoagulation: Unfractionated heparin or enoxaparin
6. Beta-blocker (if no contraindication): metoprolol or esmolol
7. Statin: high-intensity (atorvastatin 80mg)

NEXT 1-6 HOURS:
→ Early invasive strategy: coronary angiography within 24h
→ PCI and stent placement likely needed
→ Close monitoring for arrhythmia + cardiac decompensation

DO NOT delay dual antiplatelet therapy""",
        "visual_steps": [
            "Apply monitoring electrodes",
            "Secure IV access bilaterally",
            "Loading dose medication administration sequence",
            "Continuous ST-segment monitoring",
            "Prepare for urgent catheterization"
        ]
    }
}

def build_genie_visual_prompt(req: EmergencyRequest) -> str:
    """Build prompt for Genie visual analysis"""
    return f"""You are Google Genie, an expert medical AI analyzing a cardiac emergency.

Patient Condition:
- Diagnosis: {req.diagnosis}
- Urgency: {req.urgency}
- Affected artery: {req.artery_id}
- Description: {req.affected_region}

Current step: {req.current_step}

Provide IMMEDIATE visual guidance for a student who is ALONE with this patient and no specialist is available.

Include:
1. Exact hand/equipment positioning shown visually
2. What landmarks/anatomical points to identify
3. Step-by-step sequence of actions
4. Real-time warning signs to watch for
5. Critical safety checks

Format as numbered steps with visual descriptions. Be VERY specific about locations and procedures."""


def build_genie_image_analysis_prompt(diagnosis: str, urgency: str) -> str:
    """Build prompt to analyze patient images/videos during emergency"""
    return f"""You are Google Genie analyzing a medical emergency situation.

Patient Information:
- Preliminary diagnosis: {diagnosis}
- Urgency level: {urgency}

Analyzing the provided image/video of the patient or procedure area:

1. IDENTIFY the current situation:
   - Patient positioning
   - Medical equipment visible
   - Signs of distress or complications

2. PROVIDE IMMEDIATE GUIDANCE:
   - What should be done next based on what you see
   - Specific positioning or technique adjustments
   - Warning signs visible that need attention
   
3. SAFETY CHECKS:
   - What could go wrong based on current positioning
   - Corrections needed immediately

Keep response brief, actionable, and VISUAL (reference what you see)."""


@router.post("/emergency", response_model=EmergencyResponse)
async def emergency_guidance(req: EmergencyRequest):
    """
    Emergency AI route for urgent cardiac cases.
    When no specialist available, Genie provides visual step-by-step guidance.
    """
    use_genie = os.getenv("GOOGLE_GENAI_API_KEY", "") != ""
    
    # Fallback to protocols
    protocol_key = f"{req.urgency.lower()}_{req.diagnosis.lower().replace(' ', '_').replace('-', '_')}"
    mock_response = EMERGENCY_PROTOCOLS.get(
        protocol_key,
        EMERGENCY_PROTOCOLS.get("immediate_stemi")  # default to STEMI if not found
    )

    if use_genie:
        try:
            import google.generativeai as genai
            genai.configure(api_key=os.getenv("GOOGLE_GENAI_API_KEY"))
            model = genai.GenerativeModel("gemini-2.0-flash")
            
            prompt = build_genie_visual_prompt(req)
            response = model.generate_content(prompt)
            protocol = response.text.strip()
            
            return EmergencyResponse(
                protocol=protocol,
                visual_steps=mock_response["visual_steps"],
                ai_provider="Genie",
                emergency_activated=True,
            )
        except Exception as e:
            logger.warning(f"[Emergency] Genie error: {e}. Using fallback protocol.")

    return EmergencyResponse(
        protocol=mock_response["protocol"],
        visual_steps=mock_response["visual_steps"],
        ai_provider="Protocol Engine",
        emergency_activated=True,
    )


@router.post("/emergency/analyze-image")
async def analyze_emergency_image(
    diagnosis: str,
    urgency: str,
    image: UploadFile = File(...),
):
    """
    Analyze patient image/video during emergency.
    Genie analyzes visual situation and provides real-time guidance.
    """
    use_genie = os.getenv("GOOGLE_GENAI_API_KEY", "") != ""
    
    if not use_genie:
        return JSONResponse({
            "guidance": "⚠️ Image analysis offline. Follow emergency protocol and call specialist immediately.",
            "next_step": "Contact cardiology on-call",
            "confidence": 0.0,
        })

    try:
        # Read image bytes
        image_data = await image.read()
        image_base64 = base64.standard_b64encode(image_data).decode("utf-8")
        
        # Determine MIME type
        mime_type = image.content_type or "image/jpeg"
        
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_GENAI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.0-flash")
        
        prompt = build_genie_image_analysis_prompt(diagnosis, urgency)
        
        # Send image to Genie
        response = model.generate_content([
            {
                "mime_type": mime_type,
                "data": image_base64,
            },
            prompt,
        ])
        
        guidance = response.text.strip()
        
        return JSONResponse({
            "guidance": guidance,
            "next_step": "Follow Genie's recommendations immediately",
            "confidence": 0.85,
            "ai_provider": "Genie",
        })
        
    except Exception as e:
        logger.error(f"[Emergency Image Analysis] Error: {e}")
        return JSONResponse({
            "guidance": f"⚠️ Image analysis error: {str(e)}. Continue with emergency protocol.",
            "next_step": "Contact cardiology immediately",
            "confidence": 0.0,
        }, status_code=500)
