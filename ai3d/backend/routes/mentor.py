from fastapi import APIRouter
from schemas import MentorRequest, MentorResponse
import os

router = APIRouter()

# ── Rich mock guidance per simulation step ──────────────────────
MOCK_GUIDANCE = {
    "blocked": {
        "guidance": (
            "🚨 STEMI EMERGENCY PROTOCOL — Activate immediately!\n\n"
            "STEP 1 — Call for help (even if alone)\n"
            "  • Shout 'Code STEMI' or activate hospital alarm\n"
            "  • Call cardiology on-call: document time of first medical contact (FMC)\n\n"
            "STEP 2 — Immediate actions (first 10 min)\n"
            "  • Give Aspirin 300 mg chewed (if no contraindication)\n"
            "  • IV access both arms, draw bloods: troponin, FBC, U&E, coag, group & save\n"
            "  • 12-lead ECG — look for ST elevation ≥1mm in ≥2 contiguous leads\n"
            "  • Oxygen ONLY if SpO2 < 94%\n\n"
            "STEP 3 — Prep for PCI\n"
            "  • Antiplatelet loading: Ticagrelor 180 mg OR Clopidogrel 600 mg\n"
            "  • Anticoagulation: Heparin 60–70 U/kg IV (max 5000 U)\n"
            "  • Cath lab activation: door-to-balloon TARGET < 90 minutes\n\n"
            "STEP 4 — Continuous monitoring\n"
            "  • Attach defibrillator — risk of VF is highest in first hour\n"
            "  • 15-min repeat ECG if clinical change\n"
            "  • Keep patient flat, calm, pain-free (morphine 2–4 mg IV PRN)"
        ),
        "safety_checks": [
            "Absolute contraindication: previous ICH, active bleeding, aortic dissection — exclude before anticoagulation",
            "Do NOT give oxygen if SpO2 ≥ 94% — hyperoxia worsens myocardial injury",
            "Document TIME precisely: symptom onset, FMC, aspirin, cath lab activation",
            "VF risk is highest in first hour — defibrillator must be at bedside",
        ],
    },
    "guide": {
        "guidance": (
            "🔧 GUIDEWIRE NAVIGATION — Step-by-step\n\n"
            "STEP 1 — Vascular access\n"
            "  • Radial approach preferred (lower bleeding, earlier ambulation)\n"
            "  • Femoral if radial not suitable: compress 2 cm above inguinal ligament\n"
            "  • Insert 6Fr sheath after local anesthetic (lidocaine 2% 5 ml)\n\n"
            "STEP 2 — Coronary engagement\n"
            "  • Advance 6Fr guide catheter (JL4 for LCA, JR4 for RCA) over 0.035\" wire\n"
            "  • Engage ostium gently — watch for pressure damping (dissection risk!)\n"
            "  • Flush with heparinised saline, perform diagnostic angiography\n\n"
            "STEP 3 — Cross the lesion\n"
            "  • Choose 0.014\" workhorse wire (e.g. BMW, Runthrough)\n"
            "  • Shape distal 1–2 mm at 30–45° angle\n"
            "  • Advance under fluoroscopy — wire must pass DISTAL to blockage\n"
            "  • Confirm position in distal true lumen (lateral and AP views)\n\n"
            "STEP 4 — Verify\n"
            "  • Inject contrast gently — confirm wire is not in side branch\n"
            "  • Check no dissection at the lesion"
        ),
        "safety_checks": [
            "Never forcefully advance the guidewire — if resistance felt, reassess position",
            "Pressure damping on guide catheter = ostial dissection risk → disengage immediately",
            "Wire must reach distal vessel before balloon/stent — confirm in TWO views",
            "Give additional heparin if ACT < 250 sec",
        ],
    },
    "balloon": {
        "guidance": (
            "🎈 BALLOON PRE-DILATION (PTCA) — Step-by-step\n\n"
            "STEP 1 — Balloon selection\n"
            "  • Choose balloon 0.5 mm smaller than reference vessel diameter\n"
            "  • For LAD: typically 2.0–2.5 mm × 15 mm\n"
            "  • Prepare balloon: aspirate air, fill with contrast:saline (50:50)\n\n"
            "STEP 2 — Advance balloon\n"
            "  • Track balloon over wire to lesion under fluoroscopy\n"
            "  • Centre markers (radio-opaque) across the stenosis\n"
            "  • Confirm position in ≥2 angiographic views\n\n"
            "STEP 3 — Inflation\n"
            "  • Inflate to 6–8 atm, hold 15–30 seconds\n"
            "  • Watch for vessel engagement ('dog-boning' confirms position)\n"
            "  • Deflate fully — check for waist elimination\n"
            "  • Repeat at 10–12 atm if residual waist\n\n"
            "STEP 4 — Assessment post-dilation\n"
            "  • Inject contrast — assess TIMI flow (target ≥TIMI 2)\n"
            "  • Look for dissection, perforation, or no-reflow\n"
            "  • Proceed to stent sizing based on post-balloon vessel diameter"
        ),
        "safety_checks": [
            "No-reflow phenomenon: give adenosine IC 100–200 mcg or verapamil IC 200 mcg",
            "Coronary perforation (extravasation of contrast): reverse heparin, call surgery",
            "Slow inflate/deflate — rapid deflation can cause dissection",
            "If patient deteriorates during balloon inflation, deflate immediately",
        ],
    },
    "stent": {
        "guidance": (
            "⚙️ DRUG-ELUTING STENT DEPLOYMENT — Step-by-step\n\n"
            "STEP 1 — Stent selection\n"
            "  • Diameter: match to distal reference vessel (IVUS / angio measurement)\n"
            "  • Length: cover lesion + 2–3 mm either side (geographic miss = restenosis)\n"
            "  • DES preferred over BMS (paclitaxel / everolimus eluting)\n\n"
            "STEP 2 — Stent positioning\n"
            "  • Advance stent to target lesion on wire — DO NOT rotate\n"
            "  • Position markers: proximal marker 2–3 mm proximal to lesion\n"
            "  • Confirm in 2 orthogonal views before any inflation\n\n"
            "STEP 3 — Deployment\n"
            "  • Inflate to nominal pressure (typically 12–16 atm) for 15–20 sec\n"
            "  • Fully expand stent — fluoroscopy confirms deployment\n"
            "  • Perform high-pressure post-dilation (NC balloon at 18–20 atm)\n\n"
            "STEP 4 — Final angiogram\n"
            "  • Assess TIMI flow — target TIMI 3\n"
            "  • Look for edge dissection, stent malapposition, side-branch compromise\n"
            "  • Record: stent type, size, deployment pressure, final TIMI"
        ),
        "safety_checks": [
            "Never pull back deployed stent — strut fracture / vessel trauma",
            "Side-branch occlusion: rewire branch immediately, consider kisssing balloon",
            "Stent thrombosis is rare but catastrophic — ensure DAPT is prescribed: aspirin + ticagrelor/clopidogrel",
            "Edge dissection: extend stent coverage if >NIH Type C",
        ],
    },
    "flow": {
        "guidance": (
            "✅ POST-PCI CARE CHECKLIST\n\n"
            "IMMEDIATE (cath lab)\n"
            "  • Confirm TIMI-3 flow on final angiogram\n"
            "  • Remove guidewire — check no wire-induced perforation\n"
            "  • Sheath removal: radial — TR band; femoral — manual compression or closure device\n"
            "  • 12-lead ECG post-PCI: document ST resolution (>50% = successful reperfusion)\n\n"
            "FIRST HOUR (CCU transfer)\n"
            "  • Continuous telemetry — watch for reperfusion arrhythmia (accelerated idioventricular rhythm)\n"
            "  • BP target: systolic 100–130 mmHg\n"
            "  • Urine output >0.5 ml/kg/hr (contrast nephropathy risk)\n"
            "  • Start beta-blocker if HR > 60 and no cardiogenic shock\n\n"
            "MEDICATIONS\n"
            "  • Dual antiplatelet: Aspirin 75mg OD + Ticagrelor 90mg BD (12 months minimum)\n"
            "  • ACE inhibitor (e.g. ramipril) + statin (high intensity, e.g. atorvastatin 80 mg)\n"
            "  • Troponin trend at 6h\n\n"
            "PATIENT DEBRIEF\n"
            "  • Explain procedure outcome in simple terms\n"
            "  • Cardiac rehab referral\n"
            "  • Driving: 1 week after uncomplicated PCI"
        ),
        "safety_checks": [
            "Contrast nephropathy: ensure IV hydration 1 ml/kg/hr for 12h post-procedure",
            "DAPT must NOT be interrupted in first 12 months — stent thrombosis risk",
            "Repeat ECG at 24h — new ST changes require urgent re-evaluation",
            "Ejection fraction estimation at 6 weeks — guide LVAD / ICD implantation decision",
        ],
    },
}


def build_gemini_prompt(req: MentorRequest) -> str:
    step_names = {
        "blocked": "initial assessment of STEMI occlusion",
        "guide": "guidewire navigation across the coronary lesion",
        "balloon": "balloon pre-dilation (PTCA)",
        "stent": "drug-eluting stent deployment",
        "flow": "post-PCI care and flow restoration",
    }
    step_name = step_names.get(req.current_step, req.current_step)

    base = (
        f"You are an expert interventional cardiologist mentoring a junior medical student "
        f"who is alone at a hospital with a patient in cardiac emergency.\n\n"
        f"Patient: {req.diagnosis} with {req.artery_id} occlusion ({req.affected_region}). "
        f"Urgency: {req.urgency}. Planned intervention: {req.recommended_intervention}.\n\n"
        f"Current simulation step: {step_name}.\n\n"
    )

    if req.question:
        prompt = (
            base + f"The student asks: '{req.question}'\n\n"
            "Provide a clear, practical 3-4 sentence answer. Include one safety warning. "
            "Use simple language the student can act on immediately. Format as plain text."
        )
    else:
        prompt = (
            base + "Provide step-by-step instructions for this step. "
            "Format as numbered steps. Include what to watch for, what to avoid, and one emergency fallback. "
            "Keep it under 200 words. Plain text, no markdown headers."
        )
    return prompt


@router.post("/mentor", response_model=MentorResponse)
async def mentor(req: MentorRequest):
    use_gemini = os.getenv("GEMINI_API_KEY", "") != ""
    mock = MOCK_GUIDANCE.get(req.current_step, MOCK_GUIDANCE["blocked"])

    if use_gemini:
        try:
            import google.generativeai as genai
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(build_gemini_prompt(req))
            guidance = response.text.strip()
            # If there's a question, use Gemini for guidance but keep mock safety checks
            return MentorResponse(
                guidance=guidance,
                safety_checks=mock["safety_checks"],
                ask_ai=True,
            )
        except Exception as e:
            print(f"[Gemini Mentor] Error: {e}. Using mock.")

    return MentorResponse(
        guidance=mock["guidance"],
        safety_checks=mock["safety_checks"],
        ask_ai=False,
    )
