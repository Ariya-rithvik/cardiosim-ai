import os
import re
import json
import logging
from functools import lru_cache

from schemas import ClinicalInput, DiagnosisOutput

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
#  Mock responses (offline / demo mode)
# ─────────────────────────────────────────────
MOCK_RESPONSES = {
    "stemi": DiagnosisOutput(
        diagnosis="STEMI (ST-Elevation Myocardial Infarction)",
        affected_region="Left Anterior Descending artery (proximal segment)",
        artery_id="LAD",
        urgency="Immediate",
        recommended_intervention="Primary PCI with drug-eluting stent placement within 90 minutes",
        reasoning=(
            "Acute chest pain >60 min + ST elevation in V1-V4 + markedly elevated troponin (>3 ng/mL) "
            "strongly indicate proximal LAD occlusion — the 'widow maker'. Immediate cath-lab activation "
            "required per AHA/ACC STEMI guidelines."
        ),
        confidence=0.97,
    ),
    "nstemi": DiagnosisOutput(
        diagnosis="NSTEMI (Non-ST-Elevation Myocardial Infarction)",
        affected_region="Right Coronary Artery (mid segment)",
        artery_id="RCA",
        urgency="Urgent",
        recommended_intervention="Early invasive strategy: coronary angiography within 24h; PCI vs CABG discussion",
        reasoning=(
            "Elevated troponin with ST depression in inferior leads and dynamic T-wave changes indicate "
            "partial RCA occlusion causing myocardial injury without full-thickness infarction. "
            "High-risk GRACE score warrants early invasive management."
        ),
        confidence=0.91,
    ),
    "angina": DiagnosisOutput(
        diagnosis="Unstable Angina",
        affected_region="Left Circumflex artery (distal branch)",
        artery_id="LCX",
        urgency="Urgent",
        recommended_intervention="Medical stabilisation; elective coronary angiography within 72h",
        reasoning=(
            "Rest angina with transient lateral T-wave changes but normal troponin is consistent with "
            "demand ischaemia in the LCX territory without myocardial necrosis. "
            "GTN-responsive symptoms suggest vasospasm component."
        ),
        confidence=0.87,
    ),
}

SYSTEM_PROMPT = """You are MedGemma, a specialized medical AI assistant trained on clinical literature.
You assist clinicians with cardiac triage and clinical decision support.

TASK: Analyze the clinical presentation and produce a structured JSON diagnostic output.

You MUST respond ONLY with a valid JSON object — no markdown, no extra text.
Schema:
{
  "diagnosis": "primary diagnosis string",
  "affected_region": "full anatomical description",
  "artery_id": "LAD | RCA | LCX  (exactly one of these three)",
  "urgency": "Immediate | Urgent | Routine  (exactly one)",
  "recommended_intervention": "specific clinical recommendation",
  "reasoning": "2-3 sentence clinical reasoning",
  "confidence": 0.0-1.0 float
}

DISCLAIMER: Educational and research use only. Not for clinical decisions."""


def _classify_mock(data: ClinicalInput) -> str:
    """Heuristic classifier for mock mode — mirrors the real model's expected output."""
    has_st_elevation = "ST elevation" in (data.ecg_findings or "")
    high_troponin    = (data.troponin_level or 0) > 1.0
    if has_st_elevation and high_troponin:
        return "stemi"
    if high_troponin:
        return "nstemi"
    return "angina"


@lru_cache(maxsize=1)
def _load_model():
    """
    Load MedGemma 4B-IT with 4-bit quantization.
    Cached — only loads once per process.
    Requires: transformers, accelerate, bitsandbytes, torch (GPU).
    """
    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

        model_id = os.getenv("MEDGEMMA_MODEL_ID", "google/medgemma-4b-it")
        hf_token  = os.getenv("HF_TOKEN", None)

        logger.info(f"Loading {model_id}...")

        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_use_double_quant=True,
        )

        tokenizer = AutoTokenizer.from_pretrained(model_id, token=hf_token)
        model = AutoModelForCausalLM.from_pretrained(
            model_id,
            quantization_config=bnb_config,
            device_map="auto",
            torch_dtype=torch.bfloat16,
            token=hf_token,
            trust_remote_code=True,
        )
        model.eval()

        vram_gb = torch.cuda.memory_allocated() / 1e9 if torch.cuda.is_available() else 0
        logger.info(f"MedGemma loaded. VRAM used: {vram_gb:.1f} GB")
        return tokenizer, model

    except ImportError as e:
        logger.warning(f"Cannot load MedGemma — missing dependency: {e}. Falling back to mock.")
        return None
    except Exception as e:
        logger.error(f"Failed to load MedGemma: {e}. Falling back to mock.")
        return None


def _run_real_inference(data: ClinicalInput, tokenizer, model) -> DiagnosisOutput:
    """Run actual MedGemma inference."""
    import torch

    user_content = (
        f"Clinical Presentation for Cardiac Triage:\n"
        f"- Patient age: {data.age} years\n"
        f"- Symptoms: {data.symptoms}\n"
        f"- Chest pain duration: {data.chest_pain_duration} minutes\n"
        f"- ECG findings: {data.ecg_findings}\n"
        f"- Troponin level: {data.troponin_level} ng/mL (normal < 0.04)\n"
        f"- Risk factors: {', '.join(data.risk_factors or [])}\n\n"
        f"Provide your diagnostic assessment as JSON:"
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_content},
    ]

    input_ids = tokenizer.apply_chat_template(
        messages, return_tensors="pt", add_generation_prompt=True
    ).to(model.device)

    with torch.no_grad():
        output_ids = model.generate(
            input_ids,
            max_new_tokens=512,
            do_sample=False,
            temperature=1.0,
            pad_token_id=tokenizer.eos_token_id,
        )

    new_tokens = output_ids[0][input_ids.shape[-1]:]
    raw = tokenizer.decode(new_tokens, skip_special_tokens=True).strip()
    logger.debug(f"MedGemma raw output: {raw}")

    match = re.search(r'\{[\s\S]*\}', raw)
    if not match:
        raise ValueError("No JSON in MedGemma response")

    obj = json.loads(match.group())
    obj['artery_id'] = obj.get('artery_id', 'LAD').upper().strip()
    if obj['artery_id'] not in ['LAD', 'RCA', 'LCX']:
        obj['artery_id'] = 'LAD'
    obj['confidence'] = float(obj.get('confidence', 0.9))
    obj['_model'] = 'medgemma-4b-it-real'

    return DiagnosisOutput(**{k: v for k, v in obj.items() if k != '_model'})


def infer(data: ClinicalInput) -> DiagnosisOutput:
    """
    Main entry point.
    - MEDGEMMA_MOCK=true  (default): instant mock response for demos
    - MEDGEMMA_MOCK=false           : real MedGemma 4B-IT inference (requires GPU)
    """
    use_mock = os.getenv("MEDGEMMA_MOCK", "true").lower() == "true"

    if not use_mock:
        loaded = _load_model()
        if loaded:
            tokenizer, model = loaded
            try:
                result = _run_real_inference(data, tokenizer, model)
                logger.info(
                    f"Real MedGemma inference: {result.diagnosis} "
                    f"[{result.artery_id}, {result.urgency}] conf={result.confidence:.2f}"
                )
                return result
            except Exception as e:
                logger.error(f"Real inference failed: {e}. Falling back to mock.")

    # Mock path
    key = _classify_mock(data)
    logger.info(f"Mock inference: key={key}")
    return MOCK_RESPONSES[key]
