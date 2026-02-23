import os, time
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from schemas import ClinicalInput
import medgemma_engine as engine

router = APIRouter()

@router.post("/analyze")
async def analyze(data: ClinicalInput):
    t0 = time.perf_counter()
    result = engine.infer(data)
    elapsed = round(time.perf_counter() - t0, 3)

    is_mock = os.getenv("MEDGEMMA_MOCK", "true").lower() == "true"
    model_id = None if is_mock else os.getenv("MEDGEMMA_MODEL_ID", "google/medgemma-4b-it")

    payload = result.model_dump()
    payload["_meta"] = {
        "mock": is_mock,
        "model_id": model_id,
        "inference_time_s": elapsed,
        "quantization": None if is_mock else "4-bit NF4",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    return JSONResponse(content=payload)
