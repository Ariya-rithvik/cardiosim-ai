# 🚀 Google Genie Quick Start — 5 Minutes to Emergency AI

## Step 1: Get API Key (2 min)

1. Visit: **https://aistudio.google.com/apikey**
2. Sign in with Google
3. Click **"Get API Key"**
4. **Copy** the key

## Step 2: Configure Backend (1 min)

```bash
cd d:\ai3d\backend

# Option A: Create .env file (recommended)
echo GOOGLE_GENAI_API_KEY=paste_your_key_here > .env

# Option B: Windows PowerShell
$env:GOOGLE_GENAI_API_KEY = "paste_your_key_here"

# Option C: PowerShell (add to profile)
setx GOOGLE_GENAI_API_KEY "paste_your_key_here"
```

## Step 3: Install & Restart (1 min)

```bash
cd d:\ai3d\backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Step 4: Test It Works (1 min)

```bash
# Check health
curl http://localhost:8000/health

# Should see: "genie_enabled": true
```

## Step 5: Try Emergency Panel (Done!)

Frontend: `http://localhost:5173`

**Trigger Emergency Mode:**
- Load any STEMI scenario, OR
- Enter manually:
  - ECG: "ST elevation V1-V4"
  - Troponin: 3.2 ng/mL
  - Age: 58
- Click "Run AI Analysis"
- 🚨 Emergency Panel opens automatically!

---

## What You Get

✅ **Auto Emergency Mode** — Activates when diagnosis urgency = "Immediate"  
✅ **Visual Protocols** — Step-by-step guidance from Genie  
✅ **Camera Analysis** — Point camera at patient, Genie analyzes  
✅ **Image Upload** — Upload any patient image for real-time feedback  
✅ **Step Tracking** — Check off actions as you complete them  
✅ **Fallback Safety** — Works offline with emergency protocols  

---

## Common Issues

| Issue | Fix |
|-------|-----|
| "genie_enabled": false | Check API key is set in .env or env var |
| Camera not working | Check browser permissions, use HTTPS in production |
| Slow response (10+ sec) | Normal for Genie, <5sec expected |
| 404 /api/emergency | Backend not restarted after code changes |
| API key rejected | Create new key at https://aistudio.google.com/apikey |

---

## Next: Full Documentation

See `GOOGLE_GENIE_SETUP.md` for:
- Complete setup guide
- All API endpoints
- Teaching scenarios
- Safety guidelines
- Troubleshooting

---

**Ready?** Get that API key and activate emergency AI! 🚑
