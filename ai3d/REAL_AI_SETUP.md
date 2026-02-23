# CardioSim AI — Setup Guide for Real MedGemma Inference

## Prerequisites
- Kaggle account (free T4 GPU notebooks)
- Hugging Face account (free)
- Google AI Studio account (for Gemini API key, optional)

---

## Option A: Run on Kaggle (Recommended — Free T4 GPU)

1. **Upload the notebook**
   - Go to [kaggle.com](https://kaggle.com) → Notebooks → New Notebook
   - Click **File → Import Notebook** and upload `kaggle_notebook.ipynb`
   - Set **Accelerator → GPU T4 x1** in notebook settings

2. **Enable internet access**
   - In notebook settings → enable **Internet Access** (needed to download model)

3. **Add Hugging Face token as secret**
   - Go to [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
   - Create a token with **read** access
   - In Kaggle → Add-ons → Secrets → Add secret: `HF_TOKEN`

4. **Run the notebook**
   - Click **Run All**
   - Model loads in ~5 minutes
   - Each case analyzes in ~30 seconds
   - Download `medgemma_real_outputs.json` from `/kaggle/working/`

---

## Option B: Run Locally (Requires GPU)

### Hardware requirements
| Component | Minimum | Recommended |
|-----------|---------|-------------|
| GPU | RTX 3060 12GB | RTX 4090 / A100 |
| RAM | 16 GB | 32 GB |
| Disk | 10 GB free | 20 GB |

### Setup

```bash
# 1. Create conda environment
conda create -n cardiosim python=3.10
conda activate cardiosim

# 2. Install PyTorch with CUDA
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121

# 3. Install backend dependencies
cd d:\ai3d\backend
pip install -r requirements.txt
pip install transformers==4.47.1 accelerate==1.2.1 bitsandbytes==0.45.0

# 4. Set up environment
cp .env.example .env
# Edit .env and set:
#   MEDGEMMA_MOCK=false
#   HF_TOKEN=your_token_here
#   GEMINI_API_KEY=your_gemini_key_here (optional)

# 5. Start backend with real MedGemma
uvicorn main:app --reload --port 8000
# First run downloads ~3.5GB model from Hugging Face
```

### Start frontend
```bash
cd d:\ai3d\frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)
→ Header will show **"🟢 Real AI"** badge when MedGemma is live

---

## Verifying Real AI is Active

The CardioSim AI header shows one of:
- 🟢 **Real MedGemma** — real model is running, all inferences use MedGemma 4B-IT
- 🟡 **Demo Mode** — mock responses (instant, no GPU needed)
- 🔴 **Backend Offline** — start the FastAPI backend

You can also check: `curl http://localhost:8000/health`
```json
{
  "status": "ok",
  "mock_mode": false,
  "model_id": "google/medgemma-4b-it",
  "gemini_enabled": true
}
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `MEDGEMMA_MOCK` | `true` | `false` to use real MedGemma |
| `HF_TOKEN` | — | Hugging Face token (required for real mode) |
| `MEDGEMMA_MODEL_ID` | `google/medgemma-4b-it` | Model ID from HF |
| `GEMINI_API_KEY` | — | For AI-generated patient explanations |
