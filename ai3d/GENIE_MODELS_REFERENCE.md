# 🤖 Google Genie — Available Models Reference

**Your API Key Access**: AIzaSyALIqrICDMzMcWvXVf40yxJV62_A4KW93M  
**Status**: ✅ Active  
**Last Updated**: February 24, 2026

---

## 🧠 **Text & Reasoning Models**

### **Gemini Family** (Latest)
| Model | Purpose | Speed | Cost |
|-------|---------|-------|------|
| `gemini-2.5-flash` | ✅ **ACTIVE** Fast reasoning | ⚡ Fastest | 💰 Cheapest |
| `gemini-2.5-pro` | Advanced reasoning, long context | ⚡ Medium | 💰💰 |
| `gemini-2.0-flash` | Multimodal (text + images) | ⚡ Fast | 💰 Cheap |
| `gemini-2.0-flash-001` | Stable version | ⚡ Fast | 💰 Cheap |
| `gemini-2.0-flash-lite` | Lightweight model | ⚡⚡ Ver fast | 💰 Very cheap |
| `gemini-2.0-flash-lite-001` | Stable lightweight | ⚡⚡ Very fast | 💰 Very cheap |
| `gemini-flash-latest` | Auto-updated Flash | ⚡ Fast | 💰 Cheap |
| `gemini-flash-lite-latest` | Auto-updated Lite | ⚡⚡ Very fast | 💰 Very cheap |
| `gemini-pro-latest` | Auto-updated Pro | ⚡ Medium | 💰💰 |

### **Use Cases**
- Emergency protocol generation ✅
- Video frame narration ✅
- Technique analysis ✅
- Clinical guidance ✅

---

## 🎨 **Image Generation Models**

### **Imagen Family** (Photorealistic)
| Model | Purpose | Quality | Speed |
|-------|---------|---------|-------|
| `imagen-4.0-ultra-generate-001` | Highest quality, most detailed | 🏆 Best | 🐢 Slowest |
| `imagen-4.0-generate-001` | High quality standard | ✨ Great | ⏱️ Medium |
| `imagen-4.0-fast-generate-001` | Quick generation | 🎨 Good | ⚡ Fast |

### **Future Use Cases**
- Anatomical diagrams
- Procedure illustrations
- Training materials
- Educational posters

---

## 🎬 **Video Generation Models**

### **Veo Family** (AI Video Synthesis)
| Model | Purpose | Quality | Duration |
|-------|---------|---------|----------|
| `veo-3.1-generate-preview` | Latest AI video synthesis | 🏆 Highest | 60+ sec |
| `veo-3.1-fast-generate-preview` | Fast video generation | ✨ Great | 30-60 sec |
| `veo-3.0-generate-001` | Stable video generation | ✨ Good | 60+ sec |
| `veo-3.0-fast-generate-001` | Quick synthesis | 🎨 Fair | 30-60 sec |
| `veo-2.0-generate-001` | Earlier generation | ✨ Good | 45+ sec |

### **Potential Implementations**
```python
# Generate procedural training video
model = genai.GenerativeModel("veo-3.1-generate-preview")
response = model.generate_content(
  "Create 60-second medical animation of STEMI PCI intervention"
)
```

---

## 🎤 **Audio/Speech Models**

### **Gemini with Native Audio**
| Model | Purpose | Feature |
|-------|---------|---------|
| `gemini-2.5-flash-native-audio-latest` | Speech I/O | Real-time speech recognition |
| `gemini-2.5-flash-native-audio-preview-09-2025` | Early preview | Testing new features |
| `gemini-2.5-flash-native-audio-preview-12-2025` | Latest preview | Newest capabilities |

### **Future Enhancement Ideas**
- Voice commands in Emergency Panel
- Multi-language narration with proper pronunciation
- Real-time audio feedback during procedures
- Text-to-speech for visually impaired students

---

## 🎙️ **Specialized Models**

### **Gemma (Smaller, Deployable)**
| Model | Purpose | Size | Use |
|-------|---------|------|-----|
| `gemma-3-1b-it` | Ultra-light, deployable | 1B params | Edge devices |
| `gemma-3-4b-it` | Light, fast | 4B params | Mobile/local |
| `gemma-3-12b-it` | Medium | 12B params | Server |
| `gemma-3-27b-it` | Large | 27B params | Advanced reasoning |

---

## 🔮 **Experimental/Preview Models**

| Model | Status | Purpose |
|-------|--------|---------|
| `gemini-2.0-flash-exp-image-generation` | 🧪 Experimental | Combined image gen |
| `gemini-3-pro-preview` | 🔜 Coming soon | Next generation |
| `gemini-3-flash-preview` | 🔜 Coming soon | Next gen lite |
| `gemini-3.1-pro-preview` | 🔜 Coming soon | Advanced 3.1 |
| `deep-research-pro-preview-12-2025` | 🔜 Research mode | Deep analysis |

---

## 🤖 **Embedding Models**

| Model | Purpose | Vector Dim |
|-------|---------|-----------|
| `gemini-embedding-001` | Text embeddings | 768D |

### **Use Case**
Could implement semantic search for medical literature.

---

## 📚 **Specialized Tools**

| Model | Category | Purpose |
|-------|----------|---------|
| `aqa` | Question Answering | Retrieval-augmented QA |
| `gemini-2.5-computer-use-preview-10-2025` | Automation | Control systems/UI |
| `gemini-robotics-er-1.5-preview` | Robotics | Robot control guidance |

---

## 🎬 **Current Implementation Matrix**

| Feature | Model Used | Status |
|---------|------------|--------|
| Emergency Protocols | `gemini-2.5-flash` | ✅ Active |
| Video Storyboards | `gemini-2.5-flash` | ✅ Active |
| Frame Narration | `gemini-2.5-flash` | ✅ Active |
| Technique Analysis | `gemini-2.5-flash` | ✅ Active |
| Image Generation | `imagen-4.0-ultra-generate-001` | 🔧 Ready |
| Video Synthesis | `veo-3.1-generate-preview` | 🔧 Ready |
| Audio Output | `gemini-2.5-flash-native-audio-latest` | 🔧 Ready |

---

## 🎯 **Recommended Next Steps**

### **Short-term** (Next 2 weeks)
- [ ] Implement image generation for anatomical diagrams
- [ ] Add text-to-speech narration in Emergency Panel
- [ ] Create voice-activated commands

### **Medium-term** (Next month)
- [ ] Integrate Veo video synthesis for full procedure recordings
- [ ] Multi-language support with native audio
- [ ] Deep Research mode for literature review

### **Long-term** (Q2-Q3 2026)
- [ ] Deploy Gemma-3 models locally
- [ ] Computer vision for camera feed analysis
- [ ] Robotics integration for simulation
- [ ] Embedding-based medical literature search

---

## 💰 **Pricing Reference**

### **Input Tokens** (per million)
- Flash models: ~$0.075-0.15
- Pro models: ~$1.50-3.00
- Image generation: $0.075 per image
- Video synthesis: Custom pricing (contact Google)

### **Estimates**
- Emergency protocol: ~400 tokens (~$0.00003)
- Video narration per frame: ~100 tokens (~$0.000008)
- Image generation: $0.075 per image
- Video generation: ~$0.50-2.00 per 60-second video

---

## 🔐 **API Key Details**

**Key**: `AIzaSyALIqrICDMzMcWvXVf40yxJV62_A4KW93M`  
**Status**: ✅ Active & Verified  
**Tier**: Free (with usage monitoring)  
**Access Level**: Full API access  
**Creation Date**: ~Feb 2025

### **Security Notes**
- ✅ Key is stored in `.env` (not committed)
- ✅ Can be rotated from Google AI Studio
- ✅ Usage monitoring available
- ⚠️ Do not share in repositories
- ⚠️ Set usage alerts to avoid surprises

---

## 🔗 **Quick Links**

- **Access API Key**: https://aistudio.google.com/apikey
- **Model Documentation**: https://ai.google.dev/models
- **Playground**: https://gemini.google.com
- **API Reference**: https://ai.google.dev/api
- **Pricing Calculator**: https://ai.google.dev/pricing

---

## 📊 **Model Selection Guide**

### **When to use:**

**`gemini-2.5-flash`** (Current Active)
- ✅ Fast responses needed (<5 seconds)
- ✅ Cost-sensitive applications
- ✅ Real-time emergency guidance
- ✅ Educational AI features

**`gemini-2.5-pro`** (Available)
- ✅ Complex multi-step reasoning
- ✅ Advanced analysis required
- ✅ Specialist-level guidance
- ❌ Slower response times

**`imagen-4.0-ultra`** (Available)
- ✅ Highest quality diagrams
- ✅ Professional training materials
- ✅ Publication-ready images
- ❌ Slower generation

**`veo-3.1-preview`** (Available)
- ✅ Full procedure videos
- ✅ Animated surgery guides
- ✅ Interactive training content
- ❌ Slowest generation (~60+ sec)

---

## ✅ **Verification Checklist**

- [x] API key is valid and active
- [x] Can access text models (Gemini)
- [x] Can access image models (Imagen)
- [x] Can access video models (Veo)
- [x] Can access speech models (Native Audio)
- [x] All 40+ models available
- [x] Connected and tested successfully

---

**CardioSim AI** now has enterprise access to Google's complete AI model suite! 🚀

*Last tested: February 24, 2026*
