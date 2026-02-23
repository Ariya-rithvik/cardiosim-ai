# CardioSim AI — Google Genie Integration Guide

## 🚨 Emergency AI Assistance with Google Genie

When a specialist is not available but an urgent cardiac emergency occurs, **Google Genie** provides real-time visual guidance to medical students to help them take immediate life-saving actions.

---

## ✨ What Google Genie Does

### Capabilities:
✅ **Visual Analysis** — Analyzes patient images/videos to understand the current situation  
✅ **Step-by-Step Guidance** — Provides detailed visual procedures for emergency interventions  
✅ **Real-Time Feedback** — Guides students through complex medical procedures with specific visual cues  
✅ **Landmark Detection** — Identifies anatomical landmarks for precise hand positioning  
✅ **Complication Recognition** — Identifies warning signs and adverse events in real-time  

### When It's Used:
- **Automatic Activation**: When diagnosis urgency is **"Immediate"** (STEMI)
- **Manual Access**: Students can upload images/videos during any emergency scenario
- **Fallback**: If Genie is unavailable, system auto-uses emergency protocols

---

## 🔧 Setup — 3 Steps

### Step 1: Get Google Genie API Credentials

1. Go to **[Google AI Studio](https://aistudio.google.com/apikey)** (free tier)
2. Sign in with Google account
3. Click **"Get API Key"**
4. Copy the key (keep it secret!)

### Step 2: Set Environment Variables

Create `.env` file in `d:\ai3d\backend\`:

```env
# Existing variables
MEDGEMMA_MOCK=false
HF_TOKEN=your_huggingface_token_here
GEMINI_API_KEY=your_gemini_api_key_here

# NEW: Google Genie / Generative AI
GOOGLE_GENAI_API_KEY=your_google_genie_api_key_here
```

Or set directly in terminal:

**Windows PowerShell:**
```powershell
$env:GOOGLE_GENAI_API_KEY = "your-api-key-here"
```

**Linux/Mac:**
```bash
export GOOGLE_GENAI_API_KEY="your-api-key-here"
```

### Step 3: Restart Backend

```bash
cd d:\ai3d\backend
pip install -r requirements.txt  # Updates google-generativeai package
uvicorn main:app --reload --port 8000
```

Verify in health endpoint:
```bash
curl http://localhost:8000/health
```

Should show:
```json
{
  "genie_enabled": true,
  "gemini_enabled": true,
  ...
}
```

---

## 🎯 Using Emergency Panel

### Automatic Mode (Recommended)

1. **Enter Clinical Data or Load Scenario**
   - Input ECG findings showing ST elevation
   - Set troponin > 2.0
   - System detects urgency = "Immediate"

2. **Emergency Panel Auto-Opens**
   - Full-screen red alert interface appears
   - Left panel: Emergency protocol (Genie-generated)
   - Right panel: Visual action checklist
   - Camera feed for real-time analysis

3. **Students Follow Visual Steps**
   - Read protocol carefully
   - Activate camera to capture patient
   - Click "📸 Analyze Scene" — Genie analyzes situation
   - Check off visual steps as performed
   - Progress bar shows completion %

### Manual Image Analysis

Even without auto-activation, upload images anytime:

1. Click **"📷 Start Camera"** to activate real-time feed
2. Click **"📸 Analyze Scene"** to get Genie's immediate feedback
3. Click **"📤 Upload Image"** to analyze patient image from file

Genie analyzes:
- Patient positioning
- Equipment placement  
- Anatomical landmarks visible
- Warning signs
- Next immediate steps needed

---

## 📋 Emergency Protocol Steps (Genie-Enhanced)

When urgency = "Immediate", Genie generates protocol for:

### STEMI (ST-Elevation Myocardial Infarction)
**Time-critical intervention: Door-to-Balloon < 90 minutes**

```
🚨 STEMI EMERGENCY PROTOCOL
├─ FIRST 60 SECONDS: Code activation + monitoring
├─ NEXT 5 MINUTES: IV access, ECG, Aspirin 300mg
├─ MEDICATION PREP: P2Y12 inhibitor + anticoagulation
├─ VISUAL CHECK: Chest compression landmarks (camera)
└─ CATHETER LAB: Activate immediately
```

Genie's visual guidance shows:
- Exact IV insertion sites
- Electrode placement
- Chest compression landmark visualization
- Medicine administration points

### NSTEMI (Non-ST-Elevation)
**Early invasive strategy within 24 hours**

```
🚨 HIGH-RISK NSTEMI
├─ Risk assessment (GRACE score)
├─ Dual antiplatelet loading
├─ Anticoagulation strategy
├─ Symptom management
└─ Preparation for angiography
```

---

## 🎥 Camera-Based Real-Time Analysis

### Feature: Auto-Scene Understanding

1. **Point camera at patient area**
2. **Genie analyzes** (5-10 seconds):
   - Patient positioning
   - Medical equipment visible
   - Anatomical landmarks detected
   - Current procedure stage

3. **Receives guidance**:
   - "Hands positioned too low, move 2cm higher"
   - "CPR depth looks good, continue at this speed"
   - "Defibrillator pads placement correct"
   - ⚠️ "WARNING: Check for possible dissection — ST elevation increasing"

### Example Use Case: CPR Chest Compression

```
Student's Camera Feed → Genie Analyzes
↓
Genie Response:
"👤 Patient position: Supine ✓
 🤲 Compressions: 4cm deep, rate ~115 BPM ✓
 ⚠️ Hand position: Shift 1cm LEFT for sternum center
 ✅ Continue compressions, do NOT stop"
```

---

## 🔗 API Routes

### 1. Emergency Guidance Endpoint

**Request:**
```bash
POST /api/emergency
Content-Type: application/json

{
  "diagnosis": "STEMI",
  "affected_region": "Left Anterior Descending artery (proximal)",
  "artery_id": "LAD",
  "urgency": "Immediate",
  "recommended_intervention": "Primary PCI with stent < 90 min",
  "current_step": "assessment"
}
```

**Response:**
```json
{
  "protocol": "🚨 STEMI EMERGENCY PROTOCOL...",
  "visual_steps": [
    "Apply cardiac monitoring pads",
    "Establish IV access points",
    "Administer Aspirin 300mg",
    ...
  ],
  "ai_provider": "Genie",
  "emergency_activated": true
}
```

### 2. Image Analysis Endpoint

**Request:**
```bash
POST /api/emergency/analyze-image
Content-Type: multipart/form-data

- image: <file>
- diagnosis: STEMI
- urgency: Immediate
```

**Response:**
```json
{
  "guidance": "👤 Patient condition analysis. 🤲 Hand position...",
  "next_step": "Follow Genie recommendations",
  "confidence": 0.85,
  "ai_provider": "Genie"
}
```

---

## 🎓 Teaching Scenarios

### Scenario 1: Alone on Night Shift
**Situation**: Medical student on night shift, patient comes with chest pain, ECG shows ST elevation, no cardiologist on-site.

**What Happens:**
1. Student enters: ST elevation V1-V4, troponin 3.2 ng/mL
2. MedGemma diagnoses: **STEMI + LAD**
3. System urgency = **Immediate** → Emergency Panel opens
4. Genie protocol appears
5. Student can:
   - Call emergency services (shown in protocol)
   - Use camera to guide aspirin administration
   - Follow step-by-step interventions until specialist arrives

### Scenario 2: Rural Clinic Emergency
**Situation**: Patient with high-risk NSTEMI, only nurses available, doctor 1 hour away.

**What Happens:**
1. Clinical parameters entered
2. MedGemma: **NSTEMI + RCA** (Urgent)
3. **Emergency Panel** shows:
   - Medication sequence with visual dosing reference
   - Continuous ST-segment monitoring setup (camera analysis)
   - Transport preparation checklist
   - Real-time alerting for complications

---

## ⚠️ Important Safety Notes

### Emergency Panel is Educational
- ✅ Designed for **medical students** + **clinical training**
- ❌ NOT a replacement for qualified specialist consultation
- ✅ Always call emergency services (911/999/112)
- ✅ Every intervention should be discussed with on-call specialist
- ✅ Document timestamps of each action

### When Using Camera Analysis
- ✅ Point camera clearly at patient/procedure area
- ℹ️ Good lighting improves accuracy
- ℹ️ Genie confidence shown (0.0 - 1.0)
- ⚠️ Manual verification required for actual medical decisions
- ✅ Use as decision support, not replacement for human judgment

### API Key Security
- ⚠️ **Never commit** `.env` file to git
- ⚠️ Don't share API keys in code
- ⚠️ Rotate keys periodically
- ✅ Use environment variables only
- ✅ Request new key if exposed: [Google AI Studio Settings](https://aistudio.google.com/app/apikey)

---

## 🚀 Advanced Features

### Custom Emergency Protocols

Edit `backend/routes/emergency.py` to add institution-specific protocols:

```python
EMERGENCY_PROTOCOLS = {
    "immediate_stemi": {
        "protocol": "Your institution's STEMI protocol...",
        "visual_steps": [
            "Step 1: Your specific procedure",
            "Step 2: Your specific procedure",
            ...
        ]
    }
}
```

### Fallback Mode (No Internet)

If Genie is unavailable:
- System auto-uses `EMERGENCY_PROTOCOLS` (hardcoded)
- Visual step-by-step guidance still available
- No real-time image analysis
- Protocol is institution-ready

---

## 📊 Monitoring & Debugging

### Check Emergency Endpoint Status

```bash
# Verify Genie is connected
curl http://localhost:8000/health | jq '.genie_enabled'
# Output: true

# Test emergency endpoint
curl -X POST http://localhost:8000/api/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "diagnosis": "STEMI",
    "affected_region": "LAD",
    "artery_id": "LAD",
    "urgency": "Immediate",
    "recommended_intervention": "PCI",
    "current_step": "assessment"
  }' | jq '.ai_provider'
# Output: "Genie"
```

### View Logs

```bash
# Backend logs show Genie requests
tail -f logs/backend.log | grep "Emergency\|Genie"

# Errors
tail -f logs/backend.log | grep "ERROR"
```

### Troubleshooting

| Problem | Solution |
|---------|----------|
| `"genie_enabled": false` in health | Check `GOOGLE_GENAI_API_KEY` env var is set |
| Image analysis returns error | Verify image file is valid JPG/PNG, < 10MB |
| Camera not starting | Check browser camera permissions, use HTTPS in production |
| Slow response | Genie network latency — normal, <5sec expected |
| API key rejected | Regenerate key at [Google AI Studio](https://aistudio.google.com/apikey) |

---

## 📚 References

- **Google AI Studio**: https://aistudio.google.com
- **Google Generative AI API Docs**: https://ai.google.dev/docs
- **Genie Model Card**: https://ai.google.dev/models/genie
- **STEMI Guidelines**: https://www.acc.org/guidelines/topic/acute-coronary-syndromes
- **CardioSim AI Repo**: [Your repo link]

---

## 🎯 Next Steps

1. **Get API Key** from Google AI Studio ✓
2. **Set `.env` file** with `GOOGLE_GENAI_API_KEY` ✓
3. **Restart backend** with `pip install -r requirements.txt` ✓
4. **Test Emergency Panel** with STEMI scenario ✓
5. **Use camera analysis** to guide procedures ✓
6. **Document outcomes** for medical education review ✓

---

**CardioSim AI** — Teaching the next generation to save cardiac patients.  
🚑 When specialists aren't available, AI is ready.
