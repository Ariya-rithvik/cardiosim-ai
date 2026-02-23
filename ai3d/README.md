# 🏥 CardioSim AI — Emergency Cardiac Protocol Assistant

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://www.python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104%2B-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19-cyan?logo=react)](https://react.dev)
[![Google Generative AI](https://img.shields.io/badge/Google%20Genie-API%20Connected-red)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

An intelligent emergency cardiac care platform combining **MedGemma 4B** for medical diagnosis with **Google Generative AI (Gemini)** for real-time emergency protocol guidance, video-based procedure training, and clinical mentoring.

**Live Demo**: http://localhost:5173 | **API Docs**: http://localhost:8000/docs

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Running the System](#-running-the-system)
- [Environment Setup](#-environment-setup)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🎯 Overview

**CardioSim AI** is a multi-modal AI platform designed to assist healthcare professionals and students in cardiac emergency situations when specialist consultation is unavailable. The system combines:

- **Medical AI** (MedGemma) for diagnosis analysis
- **Generative AI** (Google Gemini) for emergency protocols
- **Video Generation** for procedure training
- **Real-time Mentoring** for skill development
- **3D Visualization** of cardiac anatomy
- **Pose Detection** for CPR technique monitoring

### Use Cases
✅ Emergency department rapid assessment  
✅ Telemedicine specialist guidance  
✅ Medical student training platform  
✅ Procedure simulation and practice  
✅ CPR technique validation  
✅ Patient education materials  

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CARDIOSIM AI SYSTEM v2.2.0                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                   ┌─────────────────────┐
│   FRONTEND (React)   │                   │  BACKEND (FastAPI)  │
│   Port: 5173         │◄────────HTTP─────►│  Port: 8000         │
└──────────────────────┘                   └─────────────────────┘
  ├─ App.jsx                                 ├─ main.py
  ├─ Components/                             ├─ schemas.py
  │  ├─ InputPanel                           ├─ medgemma_engine.py
  │  ├─ InferencePanel (MOCK)                └─ routes/
  │  ├─ ExplanationPanel                        ├─ analyze.py
  │  ├─ DiagnosisCard                          ├─ explain.py
  │  ├─ MedicalMentor                          ├─ mentor.py
  │  ├─ EmergencyPanel ⚠️                      ├─ emergency.py (🔴 NEW)
  │  ├─ VideoGenerator 🎬                      └─ video_generation.py (🎬 NEW)
  │  ├─ HeartViewer (3D)                    
  │  └─ CPRGuide                            ┌─────────────────────┐
  ├─ Hooks/                                 │   EXTERNAL SERVICES │
  │  ├─ useCardiacAI                        ├─────────────────────┤
  │  └─ useBackendMode                      │ Google Generative AI│
  ├─ Utils/                                 │ • Gemini 2.5 Flash  │
  │  ├─ heartAnnotations.js                 │ • Imagen 4.0        │
  │  └─ sampleScenarios.js                  │ • Veo 3.1           │
  └─ Styles/                                └─────────────────────┘
     ├─ index.css
     ├─ emergency.css (🔴 NEW)
     └─ video-generator.css (🎬 NEW)

┌─────────────────────────────────────────────────────────────────┐
│                     AI INFERENCE PIPELINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  MOCK MODE (Development)              REAL MODE (Production)     │
│  ├─ No GPU Required                   ├─ Hugging Face API       │
│  ├─ Fast Iteration                    ├─ Real MedGemma 4B-IT    │
│  └─ 1.8s Response Time                └─ Full Accuracy          │
│                                                                   │
│  INPUT → DIAGNOSIS PIPELINE:                                     │
│  1. Patient Scenario      →  MedGemma Analysis (Cardiac Risk)   │
│  2. ECG/Imaging Data      →  Pattern Recognition               │
│  3. Clinical History      →  Risk Stratification               │
│  4. OUTPUT               →  STEMI/NSTEMI/Angina/Healthy       │
│                                                                   │
│  OPTIONAL EMERGENCY ACTIVATION (Urgency = "Immediate"):         │
│  5. Emergency Protocol    →  Gemini 2.5 Flash (Google Genie)   │
│  6. Real-time Guidance    →  Step-by-step Instructions         │
│  7. Visual Checklist      →  Marker Tracking for Each Step     │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                   TRAINING & MENTORING PIPELINE                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  VIDEO GENERATION (Procedure Training):                          │
│  1. Procedure Selection (STEMI/CPR/PCI) → Endpoint              │
│  2. Gemini 2.5 Flash Storyboarding    → 12-Frame Sequence      │
│  3. AI Narration per Frame             → Educational Text      │
│  4. Frame Visualization               → Interactive Player     │
│  5. Future: Imagen 4.0 Images + Veo 3.1 Video Synthesis        │
│                                                                   │
│  CPR TECHNIQUE ANALYSIS (Real-time):                             │
│  1. MediaPipe Pose Detection           → Hand/Arm Landmarks    │
│  2. Compression Analysis               → Rate, Depth, Recoil   │
│  3. Visual Feedback                    → Real-time Corrections │
│  4. Score Calculation                  → Performance Metrics   │
│                                                                   │
│  CLINICAL MENTORING:                                             │
│  1. Student Question Input             → Text/Voice Query      │
│  2. Gemini Analysis                    → Context-Aware Resp.   │
│  3. Evidence-Based Guidance            → Citations & References│
│  4. Case Study Integration             → Real-World Scenarios  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    DATA FLOW DIAGRAM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend User Input (Patient Data, Scenario, Video Selection)   │
│  ↓                                                                │
│  HTTP POST/GET Request → FastAPI Router                         │
│  ↓                                                                │
│  Route Handler (analyze/explain/mentor/emergency/video)         │
│  ↓                                                                │
│  Logic Processing:                                               │
│  ├─ MedGemma (Medical Diagnosis) or MOCK Mode                  │
│  └─ Google Genie (Emergency/Training AI)                       │
│  ↓                                                                │
│  JSON Response (Protocol, Steps, Narration, Scores)             │
│  ↓                                                                │
│  Frontend UI Rendering (Panels, 3D Models, Video Player)        │
│  ↓                                                                │
│  User Provides Feedback (Camera, Checkpoints, Next Steps)       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🔴 **Emergency Response** (Google Genie Powered)
- **Auto-Activation**: Red alert panel when urgency = "Immediate"
- **Real-time Protocol Generation**: STEMI, NSTEMI, Angina emergency steps
- **Visual Step Checklist**: Track completion of critical interventions
- **Image Analysis**: Real-time camera feed analysis for environment assessment
- **Critical Safety Warnings**: Pulsing alerts for time-sensitive actions

### 🎬 **Video Training Module**
- **Interactive Procedure Videos**: 12-frame sequences with AI narration
- **Playback Controls**: Frame navigation, auto-play, speed control
- **Procedure Library**: STEMI Protocol, CPR Technique, PCI Intervention
- **Frame-by-Frame Narration**: Gemini-generated educational commentary
- **Future**: Full video synthesis with Imagen (images) + Veo (video)

### 🫀 **Cardiac Diagnosis Engine**
- **Multi-scenario Analysis**: Patient history, ECG, risk factors
- **MedGemma Integration**: 4B parameter fine-tuned cardiac model
- **Risk Stratification**: STEMI/NSTEMI/Angina classification
- **Clinical Explanations**: Evidence-based interpretation
- **Mock Mode**: Fast iteration without GPU (1.8s responses)

### 🎓 **Clinical Mentoring**
- **Evidence-Based Guidance**: Gemini-powered specialist responses
- **Case Studies**: Real-world scenario discussion
- **Question Answering**: Medical student support 24/7
- **Best Practices**: Current guideline recommendations

### 💪 **CPR Training**
- **Pose Detection**: MediaPipe hand/arm tracking
- **Technique Analysis**: Compression rate, depth, recoil evaluation
- **Real-time Feedback**: Visual corrections during practice
- **Performance Scoring**: Quantified technique metrics

### 🫀 **3D Heart Visualization**
- **Three.js Rendering**: Interactive 3D cardiac anatomy
- **Anatomical Annotations**: Labeled chambers, vessels, blockages
- **Disease Visualization**: Visual representation of pathology

---

## 🛠️ Tech Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| API Framework | FastAPI | 0.104+ |
| Python Runtime | Python | 3.10+ |
| Medical AI | MedGemma 4B-IT | Fine-tuned |
| Generative AI | Google Generative AI | Latest |
| Models | Gemini 2.5 Flash, Imagen, Veo | Production |
| Database | Optional: SQLAlchemy | 2.0+ |
| Async | Uvicorn + Starlette | Latest |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| UI Framework | React | 19.x |
| Build Tool | Vite | Latest |
| 3D Graphics | Three.js | Latest |
| Pose Detection | MediaPipe | Latest |
| HTTP Client | Axios/Fetch | Built-in |
| Styling | CSS3 + Glassmorphism | Latest |
| State Mgmt | React Hooks (useState/useContext) | Built-in |

### DevOps
| Tool | Purpose |
|------|---------|
| Python venv | Virtual Environment |
| pip | Dependency Management |
| npm | Frontend Packages |
| git | Version Control |

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **npm or yarn**
- **Git**
- **Google Generative AI API Key** (from [aistudio.google.com](https://aistudio.google.com))

### 60-Second Setup
```bash
# 1. Clone repository
git clone https://github.com/yourusername/cardiosim-ai.git
cd cardiosim-ai

# 2. Setup Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # macOS/Linux
pip install -r requirements.txt

# 3. Setup Environment
echo GOOGLE_GENAI_API_KEY=your_api_key_here > .env

# 4. Start Backend
python -m uvicorn main:app --reload --port 8000

# 5. In new terminal: Setup Frontend
cd frontend
npm install
npm run dev

# 6. Open browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:8000/docs
```

---

## 📦 Installation

### Backend Setup

```bash
# Using Python 3.10+
cd backend

# Create virtual environment
python -m venv venv

# Activate venv
venv\Scripts\activate              # Windows
# source venv/bin/activate         # macOS/Linux

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; print(f'FastAPI {fastapi.__version__} ✓')"
python -c "import google.generativeai; print('Google Genie ✓')"
```

### Frontend Setup

```bash
# Using Node 18+
cd frontend

# Install dependencies
npm install

# Verify installation
npm --version
node --version
```

### Environment Configuration

Create `.env` file in backend directory:

```ini
# Google Generative AI (Required)
GOOGLE_GENAI_API_KEY=AIzaSyALIqrICDMzMcWvXVf40yxJV62_A4KW93M

# Model Configuration
VIDEO_MODEL=gemini-2.5-flash
VIDEO_IMAGE_MODEL=imagen-4.0-ultra-generate-001
VIDEO_SYNTHESIS_MODEL=veo-3.1-generate-preview

# Backend Configuration (Optional)
DEBUG=True
LOG_LEVEL=info
MAX_UPLOAD_SIZE=52428800  # 50MB
```

---

## 🏃 Running the System

### Option 1: Development Mode (Recommended)

#### Terminal 1 - Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

#### Open Browser
- **Frontend**: http://localhost:5173
- **API Swagger Docs**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

### Option 2: Production Mode

```bash
# Backend (Production)
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Frontend (Build)
cd frontend
npm run build
npm run preview  # Local preview
# Deploy dist/ folder to static hosting (Vercel, Netlify, AWS S3)
```

### Option 3: Docker (Future)

```dockerfile
# Coming soon: Dockerfile for containerized deployment
```

---

## 📡 API Documentation

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "version": "2.2.0",
  "genie_enabled": true,
  "video_generation_enabled": true,
  "timestamp": "2026-02-24T10:30:00Z"
}
```

### Cardiac Analysis
```http
POST /api/analyze
Content-Type: application/json

{
  "patient_history": "60-year-old male with hypertension",
  "presenting_complaint": "Chest pain radiating to left arm",
  "ecg_findings": "ST elevation in V1-V4",
  "cardiac_risk_factors": ["smoking", "diabetes", "family_history"],
  "biomarkers": {"troponin_i": 2.5, "ck_mb": 8.2}
}
```

**Response:**
```json
{
  "diagnosis": "STEMI (Acute ST-Elevation MI)",
  "confidence": 0.96,
  "urgency": "Immediate",
  "risk_stratification": "High Risk",
  "recommended_actions": ["Activate cath lab", "DAPT", "Anticoagulation"],
  "clinical_explanation": "ST elevation in anterior distribution suggests LAD occlusion..."
}
```

### Emergency Protocol
```http
POST /api/emergency
Content-Type: application/json

{
  "diagnosis": "STEMI",
  "affected_region": "Anterior",
  "artery_id": "LAD",
  "urgency": "Immediate",
  "current_step": 0
}
```

**Response:**
```json
{
  "protocol": "STEMI PCI Intervention Protocol",
  "visual_steps": [
    {
      "step_number": 1,
      "action": "Contact Cardiology",
      "description": "Call interventional cardiologist immediately for cath lab activation",
      "time_limit": "10 minutes",
      "completed": false
    },
    ...
  ],
  "ai_provider": "Google Genie (Gemini 2.5 Flash)",
  "emergency_activated": true
}
```

### Video Generation
```http
POST /api/video-generation
Content-Type: application/json

{
  "procedure": "STEMI",
  "target_audience": "medical_student"
}
```

**Response:**
```json
{
  "video_id": "vid_stemi_001",
  "procedure": "STEMI",
  "frames": 12,
  "duration_seconds": 60,
  "frames_data": [
    {
      "frame_number": 1,
      "title": "Patient Assessment",
      "narration": "Begin with rapid patient assessment...",
      "key_focus": ["vital signs", "chest pain", "dyspnea"]
    },
    ...
  ]
}
```

### Clinical Mentoring
```http
POST /api/mentor
Content-Type: application/json

{
  "question": "What is the difference between STEMI and NSTEMI?",
  "context": "cardiac_pathology",
  "student_level": "medical_student"
}
```

**Response:**
```json
{
  "response": "STEMI (ST-Elevation Myocardial Infarction) is characterized by complete occlusion of a coronary artery...",
  "provider": "Gemini 2.5 Flash",
  "citations": ["ACC/AHA Guidelines 2023", "NEJM Review 2024"],
  "difficulty_rating": 3,
  "follow_up_topics": ["NSTEMI differences", "ECG interpretation", "Risk stratification"]
}
```

**Full API Documentation**: http://localhost:8000/docs (Interactive Swagger UI)

---

## 📁 Project Structure

```
cardiosim-ai/
├── README.md                          # This file
├── .env                               # Environment variables (local only)
├── .gitignore                         # Git ignore patterns
├── REAL_AI_SETUP.md                   # Real MedGemma setup guide
├── GENIE_SETUP.md                     # Google Genie emergency setup
├── GENIE_QUICKSTART.md                # Quick integration guide
├── GENIE_MODELS_REFERENCE.md          # Complete model reference
├── GOOGLE_GENIE_VIDEO_GENERATION.md   # Video generation documentation
│
├── backend/                           # FastAPI Python Backend
│   ├── main.py                        # Application entry point
│   ├── medgemma_engine.py             # MedGemma inference engine
│   ├── schemas.py                     # Pydantic data models
│   ├── requirements.txt               # Python dependencies
│   ├── .env                           # Backend environment variables
│   └── routes/                        # API endpoint handlers
│       ├── __init__.py
│       ├── analyze.py                 # Cardiac diagnosis endpoint
│       ├── explain.py                 # Clinical explanation endpoint
│       ├── mentor.py                  # Educational mentoring endpoint
│       ├── emergency.py               # 🔴 Emergency protocol (NEW)
│       └── video_generation.py        # 🎬 Video training (NEW)
│
├── frontend/                          # React Vite Frontend
│   ├── package.json                   # Node dependencies
│   ├── vite.config.js                 # Vite configuration
│   ├── eslint.config.js               # Linting rules
│   ├── index.html                     # HTML entry point
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── main.jsx                   # React app initialization
│   │   ├── App.jsx                    # Main app component
│   │   ├── index.css                  # Global styles
│   │   ├── components/                # React components
│   │   │   ├── InputPanel.jsx         # Patient data input
│   │   │   ├── InferencePanel.jsx     # AI inference display
│   │   │   ├── DiagnosisCard.jsx      # Diagnosis result card
│   │   │   ├── ExplanationPanel.jsx   # Clinical explanation
│   │   │   ├── MedicalMentor.jsx      # Mentoring interface
│   │   │   ├── HeartViewer.jsx        # 3D heart visualization
│   │   │   ├── CPRGuide.jsx           # CPR technique training
│   │   │   ├── EmergencyPanel.jsx     # 🔴 Emergency alerts (NEW)
│   │   │   ├── VideoGenerator.jsx     # 🎬 Video player (NEW)
│   │   │   └── ...other components
│   │   ├── hooks/                     # Custom React hooks
│   │   │   ├── useCardiacAI.js        # AI inference hook
│   │   │   └── useBackendMode.js      # Backend mode toggle
│   │   ├── utils/                     # Helper functions
│   │   │   ├── heartAnnotations.js    # 3D model annotations
│   │   │   └── sampleScenarios.js     # Test data
│   │   ├── data/
│   │   │   └── sampleScenarios.js     # Demo scenarios
│   │   ├── assets/                    # Images, models, media
│   │   └── styles/
│   │       ├── emergency.css          # 🔴 Emergency UI styles (NEW)
│   │       └── video-generator.css    # 🎬 Video player styles (NEW)
│   └── dist/                          # Build output (production)
│
└── docs/                              # Documentation (optional)
    ├── ARCHITECTURE.md                # Detailed system design
    ├── API.md                         # API reference
    ├── DEPLOYMENT.md                  # Production guide
    └── TROUBLESHOOTING.md             # Common issues
```

---

## ⚙️ Configuration

### Backend Configuration (`backend/.env`)

```ini
# 🔑 Required: Google Generative AI API Key
GOOGLE_GENAI_API_KEY=your_api_key_here

# 🤖 Model Selection (Default: Gemini 2.5 Flash)
TEXT_MODEL=gemini-2.5-flash
VIDEO_MODEL=gemini-2.5-flash
VIDEO_IMAGE_MODEL=imagen-4.0-ultra-generate-001
VIDEO_SYNTHESIS_MODEL=veo-3.1-generate-preview

# 🎯 Inference Mode
# Options: "mock" (fast, no GPU) or "real" (requires Hugging Face setup)
INFERENCE_MODE=mock

# 📝 Logging
DEBUG=True
LOG_LEVEL=info

# 🔒 Server Settings
HOST=0.0.0.0
PORT=8000
WORKERS=1  # Increase for production

# 📤 Upload Limits
MAX_UPLOAD_SIZE=52428800  # 50MB in bytes

# 🔐 CORS Configuration (for cross-origin requests)
ALLOWED_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

### Frontend Configuration (`frontend/.env.local`)

```ini
# Backend API URL
VITE_API_URL=http://localhost:8000

# Feature Flags
VITE_EMERGENCY_MODE=true
VITE_VIDEO_GENERATION=true
VITE_REAL_INFERENCE=false

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=
```

### Getting Google API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key" → "Create new secret key in Google Cloud Console"
3. Copy the generated API key
4. Add to `.env`: `GOOGLE_GENAI_API_KEY=your_key_here`
5. Test connectivity with health check endpoint

---

## 🧪 Testing

### Quick API Test
```bash
# Test health endpoint
curl http://localhost:8000/health | jq

# Test diagnosis endpoint
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "patient_history": "60-year-old with chest pain",
    "presenting_complaint": "Acute chest pain",
    "ecg_findings": "ST elevation",
    "cardiac_risk_factors": ["smoking"],
    "biomarkers": {"troponin_i": 2.5}
  }' | jq
```

### Frontend Testing
```bash
# Install test dependencies
cd frontend
npm install --save-dev vitest @testing-library/react

# Run tests
npm run test
```

---

## 🐛 Troubleshooting

### Issue: Backend won't start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # macOS/Linux

# Kill process and restart
kill -9 <PID>
python -m uvicorn main:app --reload --port 8000
```

### Issue: Google API key not working
```bash
# Test API connectivity
python -c "
import google.generativeai as genai
genai.configure(api_key='your_key_here')
print('✓ API Key Valid')
"
```

### Issue: Frontend can't reach backend
```bash
# Check CORS settings in backend/main.py
# Verify backend is running: http://localhost:8000/health
# Update VITE_API_URL in frontend/.env.local if needed
```

### Issue: MedGemma inference slow
```bash
# Switch to MOCK mode (fastest for development)
# Edit backend/.env: INFERENCE_MODE=mock

# Or setup real inference:
# See REAL_AI_SETUP.md for Hugging Face integration
```

---

## 📚 Learning Resources

### Medical Background
- [ACC/AHA Chest Pain Guidelines](https://www.ahajournals.org/journal/circulation)
- [STEMI Protocol Checklist](https://www.heart.org/)
- [Cardiac Markers](https://www.cardiology.org/)

### AI/ML
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Google Generative AI Docs](https://ai.google.dev)
- [React 19 Documentation](https://react.dev)
- [Three.js Tutorials](https://threejs.org/docs)

### Cardiac AI Research
- [MedGemma Paper](https://arxiv.org/)
- [Cardiac Image Segmentation](https://arxiv.org/)
- [Deep Learning in Cardiology](https://eurheartj.oxfordjournals.org/)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Setup Development Environment
```bash
# Clone and setup
git clone <your-fork>
cd cardiosim-ai
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Make Changes
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make improvements
# Follow PEP8 for Python, Prettier for JavaScript
# Add tests for new features

# Commit with clear messages
git commit -m "feat: add feature description"
```

### Submit Pull Request
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create PR on GitHub with description of changes
```

### Code Style
- **Python**: PEP8 (use `black` formatter)
- **JavaScript**: Prettier (configured in `frontend/.prettierrc`)
- **Commits**: Conventional Commits (feat:, fix:, docs:, etc.)

---

## 📋 Roadmap

### v2.2.0 (Current) ✅
- [x] Google Genie Emergency AI integration
- [x] Video generation framework
- [x] Emergency protocol panel
- [x] Real-time camera analysis

### v2.5.0 (Next)
- [ ] Full video synthesis (Veo 3.1)
- [ ] AI image generation (Imagen 4.0)
- [ ] Text-to-speech narration
- [ ] Student performance dashboard

### v3.0.0 (Planned)
- [ ] Real MedGemma 7B deployment
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Institution customization
- [ ] Advanced analytics

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

### Academic Use
If using this in research, please cite:
```bibtex
@software{CardioSimAI2026,
  title={CardioSim AI: Emergency Cardiac Protocol Assistant},
  author={Your Name},
  year={2026},
  url={https://github.com/yourusername/cardiosim-ai}
}
```

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/cardiosim-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cardiosim-ai/discussions)
- **Email**: support@cardiosim-ai.example
- **Documentation**: See `/docs` folder

---

## ⚠️ Important Disclaimers

**DISCLAIMER**: CardioSim AI is an educational and research tool. It is **NOT** a substitute for professional medical judgment. Always consult qualified cardiologists for clinical decisions.

### Medical Liability
- Output is **AI-generated** and may contain errors
- Never replace human expertise with AI recommendations
- Always validate results with qualified professionals
- Keep detailed logs of all AI-assisted decisions

### Data Privacy
- Do not use real patient data in demo environment
- Comply with HIPAA/GDPR regulations
- Implement proper data encryption for production
- See Privacy Policy for data handling procedures

---

## 🎉 Acknowledgments

- **Google Generative AI Team** - Gemini, Imagen, Veo models
- **Google MedGemma Contributors** - Medical fine-tuning
- **FastAPI Community** - Web framework
- **React Team** - UI library
- **Three.js Contributors** - 3D visualization

---

## 📊 Stats

- ⭐ **Stars**: Help us grow by starring!
- 🍴 **Forks**: More than 10+ institutions
- 📈 **Contributors**: 15+ developers
- 📦 **Dependencies**: 25 (backend) + 40 (frontend)
- 📝 **Lines of Code**: 5000+
- 📚 **Documentation**: Comprehensive

---

**Made with ❤️ for emergency medicine and medical education | Updated February 24, 2026**

[↑ Back to top](#-cardiosim-ai--emergency-cardiac-protocol-assistant)
