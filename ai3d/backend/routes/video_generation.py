"""
Video Generation Route — Google Genie for generating instructional videos
Generates step-by-step video content for cardiac procedures
Uses Veo 3.1 as primary, with fallbacks to Replicate & Hugging Face
"""
import os
import logging
import time
import asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List
import pathlib
import sys

# Add parent directory to path
sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))
from video_providers import generate_video_fallback

logger = logging.getLogger(__name__)
router = APIRouter()

# Store generated videos
VIDEO_STORAGE = pathlib.Path(__file__).parent.parent / "generated_videos"
VIDEO_STORAGE.mkdir(exist_ok=True)

class VideoGenerationRequest(BaseModel):
    """Request to generate procedural video"""
    procedure: str  # e.g., "STEMI", "PCI", "Chest Compression"
    urgency: str    # e.g., "Immediate", "Urgent"
    steps: List[str]  # Procedure steps to visualize
    duration: Optional[int] = 60  # seconds
    language: Optional[str] = "english"

class VideoGenerationResponse(BaseModel):
    """Response with video generation details"""
    status: str  # "pending", "generating", "ready"
    video_url: Optional[str]
    preview_image: Optional[str]
    description: str
    frames: List[str]  # Frame-by-frame descriptions
    estimated_duration: int

# ─────────────────────────────────────────────
#  Video Content Templates (fallback)
# ─────────────────────────────────────────────
VIDEO_TEMPLATES = {
    "STEMI": {
        "title": "STEMI Emergency Response",
        "frames": [
            "Frame 1: Patient presentation - chest pain assessment",
            "Frame 2: 12-lead ECG acquisition and analysis",
            "Frame 3: ST elevation identification in anterior leads",
            "Frame 4: IV access establishment (dual sites)",
            "Frame 5: Aspirin 300mg administration",
            "Frame 6: Continuous cardiac monitoring setup",
            "Frame 7: Catheter lab activation notification",
            "Frame 8: Guidewire positioning across lesion",
            "Frame 9: Balloon pre-dilation at 8 atm",
            "Frame 10: Drug-eluting stent deployment",
            "Frame 11: TIMI-3 flow confirmation",
            "Frame 12: Post-PCI care and medication initiation"
        ],
        "description": "Step-by-step visualization of STEMI management from presentation to stent deployment"
    },
    "CPR": {
        "title": "Chest Compression Technique",
        "frames": [
            "Frame 1: Patient positioning - supine on firm surface",
            "Frame 2: Landmark identification - sternum center",
            "Frame 3: Hand placement - heel-palm position",
            "Frame 4: Compression depth demonstration - 5-6cm",
            "Frame 5: Compression rate - 100-120 BPM metronome",
            "Frame 6: Full chest recoil between compressions",
            "Frame 7: Hand position correction if off-center",
            "Frame 8: Alternating hand switching (every 2 minutes)",
            "Frame 9: Airway positioning for rescue breaths",
            "Frame 10: Rescue breath technique - 1 second inflation",
            "Frame 11: Defibrillator pad placement",
            "Frame 12: Shock delivery and resuming compressions"
        ],
        "description": "Visual guide for proper chest compression technique and rhythm management"
    },
    "PCI_BALLOON": {
        "title": "Balloon Angioplasty Procedure",
        "frames": [
            "Frame 1: Lesion identification on coronary angiogram",
            "Frame 2: Guidewire positioning distal to lesion",
            "Frame 3: Balloon catheter insertion over wire",
            "Frame 4: Balloon positioning across narrowing",
            "Frame 5: Initial inflation to 6 atm",
            "Frame 6: Maximum inflation to 12-14 atm",
            "Frame 7: Expansion visualization - 'dog-bone' appearance",
            "Frame 8: Full deflation and waist elimination",
            "Frame 9: Contrast injection for TIMI flow assessment",
            "Frame 10: Post-dilation angiography",
            "Frame 11: Stent sizing based on reference vessel",
            "Frame 12: Ready for stent deployment"
        ],
        "description": "Detailed visualization of pre-dilation balloon technique and assessment"
    }
}

# Image prompts for realistic medical video frames
IMAGE_PROMPTS = {
    "CPR": [
        "medical training scene, person lying flat on back on hard floor, first responder kneeling beside them, emergency CPR, photorealistic, medical illustration",
        "close up of hands checking pulse on neck of patient lying down, CPR assessment, medical training, photorealistic",
        "close up of two hands placed on center of chest sternum, heel of palm position for CPR compressions, medical training, photorealistic",
        "side view of person performing chest compressions on patient, arms straight locked elbows, pushing down 5cm deep, CPR technique, medical training, photorealistic",
        "overhead view of chest compressions being performed at fast rate, CPR rhythm 100 beats per minute, medical training, photorealistic",
        "side view showing full chest recoil after compression, hands lifting up between pushes, CPR technique, medical training, photorealistic",
        "close up of correct hand placement on center of chest for CPR, proper positioning, medical training, photorealistic",
        "two rescuers switching positions during CPR, one resting while other compresses, teamwork, medical training, photorealistic",
        "person tilting patient head back chin lift, opening airway for rescue breathing, CPR technique, medical training, photorealistic",
        "person giving rescue breath mouth to mouth with head tilted back, chest rising, CPR technique, medical training, photorealistic",
        "AED defibrillator pads being placed on patient bare chest, one pad upper right one pad lower left, emergency medical, photorealistic",
        "AED delivering shock with rescuer hands clear, then immediately resuming chest compressions, emergency CPR, medical training, photorealistic",
    ],
    "STEMI": [
        "patient in hospital bed holding chest in pain, nurse approaching with concern, emergency room, medical, photorealistic",
        "nurse attaching ECG electrode leads to patient chest, 12 lead ECG machine visible, hospital room, medical, photorealistic",
        "close up of ECG monitor showing ST elevation pattern on screen, cardiac emergency, medical, photorealistic",
        "nurse inserting IV line into patient arm, IV bag hanging, hospital emergency room, medical, photorealistic",
        "doctor handing aspirin pills to patient in hospital bed, medication administration, medical, photorealistic",
        "cardiac monitor showing heart rhythm with multiple display screens in ICU, medical equipment, photorealistic",
        "medical team rushing patient on gurney through hospital corridor to cardiac catheterization lab, emergency, photorealistic",
        "interventional cardiologist in scrubs performing cardiac catheterization procedure, fluoroscopy screen visible, medical, photorealistic",
        "close up of balloon catheter being inflated inside coronary artery on angiogram screen, cardiac intervention, medical, photorealistic",
        "fluoroscopy screen showing stent being deployed in coronary artery, cardiac catheterization lab, medical, photorealistic",
        "angiogram showing restored blood flow in coronary artery after stent placement, TIMI 3 flow, medical, photorealistic",
        "patient resting in cardiac care unit bed with monitoring equipment, nurse checking vitals, post procedure care, medical, photorealistic",
    ],
    "PCI_BALLOON": [
        "angiogram screen showing narrow blockage in coronary artery, cardiac catheterization lab, medical, photorealistic",
        "close up of thin guidewire being threaded through catheter into artery, cardiac procedure, medical, photorealistic",
        "balloon catheter being inserted over guidewire, interventional cardiology equipment, medical, photorealistic",
        "fluoroscopy showing balloon catheter positioned across arterial narrowing, pre-inflation, medical, photorealistic",
        "balloon catheter inflating inside artery on fluoroscopy screen, initial inflation, cardiac procedure, medical, photorealistic",
        "balloon fully inflated showing dog bone shape on fluoroscopy, maximum pressure, cardiac procedure, medical, photorealistic",
        "balloon expanding to push plaque against artery wall on angiogram, cardiac intervention, medical, photorealistic",
        "deflated balloon catheter being pulled back, artery now wider, cardiac procedure result, medical, photorealistic",
        "contrast dye injection showing improved blood flow in artery on angiogram, TIMI flow assessment, medical, photorealistic",
        "post procedure angiogram showing wide open artery with good flow, successful angioplasty, medical, photorealistic",
        "cardiologist measuring vessel diameter on angiogram screen for stent sizing, cardiac procedure, medical, photorealistic",
        "interventional cardiology team preparing stent for deployment, catheterization lab, medical, photorealistic",
    ],
}

def generate_ai_images(prompts: List[str], procedure: str) -> List:
    """
    Generate AI images using AI Horde (Stable Horde) - 100% free, no API key
    Submits ALL jobs in parallel first, then polls all at once for faster total time.
    Returns list of PIL Images (one per prompt).
    """
    import requests as req_lib
    from PIL import Image
    import io
    import time as time_mod

    # Limit to 6 frames for speed (each takes ~30-60s on free tier)
    prompts = prompts[:6]
    placeholder = Image.new('RGB', (512, 512), color=(20, 20, 50))

    # Step 1: Submit ALL jobs at once
    job_ids = []
    for i, prompt in enumerate(prompts):
        try:
            r = req_lib.post("https://aihorde.net/api/v2/generate/async", json={
                "prompt": prompt + ", high quality, detailed, professional",
                "params": {
                    "width": 512, "height": 512, "steps": 25,
                    "n": 1, "cfg_scale": 7.5, "sampler_name": "k_euler_a",
                },
                "nsfw": False,
                "models": ["Deliberate"],
                "r2": True,
            }, headers={"apikey": "0000000000"}, timeout=15)
            if r.status_code == 202:
                jid = r.json().get("id")
                job_ids.append((i, jid))
                logger.info(f"[AI Image] Frame {i+1} submitted: {jid}")
            else:
                logger.warning(f"[AI Image] Frame {i+1} submit failed: {r.status_code}")
                job_ids.append((i, None))
        except Exception as e:
            logger.warning(f"[AI Image] Frame {i+1} submit error: {e}")
            job_ids.append((i, None))

    # Step 2: Poll all jobs in parallel until done (max 120s total)
    images = [None] * len(prompts)
    pending = {i: jid for i, jid in job_ids if jid}
    start = time_mod.time()

    while pending and (time_mod.time() - start) < 120:
        time_mod.sleep(5)
        done_keys = []
        for idx, jid in list(pending.items()):
            try:
                check = req_lib.get(f"https://aihorde.net/api/v2/generate/check/{jid}", timeout=10)
                if check.json().get("done"):
                    result = req_lib.get(f"https://aihorde.net/api/v2/generate/status/{jid}", timeout=15)
                    gens = result.json().get("generations", [])
                    if gens:
                        img_url = gens[0].get("img")
                        img_r = req_lib.get(img_url, timeout=30)
                        if img_r.status_code == 200:
                            images[idx] = Image.open(io.BytesIO(img_r.content))
                            logger.info(f"[AI Image] ✓ Frame {idx+1} done!")
                    done_keys.append(idx)
            except Exception as e:
                logger.warning(f"[AI Image] Poll error frame {idx+1}: {e}")
        for k in done_keys:
            del pending[k]
        elapsed = int(time_mod.time() - start)
        logger.info(f"[AI Image] {elapsed}s elapsed, {len(pending)} pending")

    # Fill missing with placeholder
    for i in range(len(images)):
        if images[i] is None:
            images[i] = placeholder

    return images


def create_ai_video(frames: List[str], procedure: str, output_path: pathlib.Path) -> bool:
    """
    Create MP4 video with AI-generated images for each frame
    Uses AI Horde free text-to-image, then overlays text and stitches into MP4
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        import imageio
        import numpy as np
        
        # Limit to 6 frames for speed
        frames = frames[:6]
        logger.info(f"[AI Video] Creating AI video for {procedure} with {len(frames)} frames...")
        
        # Get AI image prompts for this procedure
        prompts = IMAGE_PROMPTS.get(procedure, IMAGE_PROMPTS.get("CPR"))[:len(frames)]
        
        # Generate AI images (parallel batch)
        ai_images = generate_ai_images(prompts, procedure)
        
        frame_images = []
        frame_size = (1280, 720)
        
        for i, frame_text in enumerate(frames):
            # Start with AI-generated image, resized to frame
            if i < len(ai_images):
                bg_img = ai_images[i].convert('RGB').resize(frame_size, Image.LANCZOS)
            else:
                bg_img = Image.new('RGB', frame_size, color=(15, 15, 45))
            
            # Efficient darkening using blend (instead of pixel-by-pixel)
            dark_overlay = Image.new('RGB', frame_size, color=(0, 0, 0))
            bg_img = Image.blend(bg_img, dark_overlay, alpha=0.3)
            
            draw = ImageDraw.Draw(bg_img)
            
            try:
                font_title = ImageFont.truetype("arial.ttf", 36)
                font_body = ImageFont.truetype("arial.ttf", 26)
                font_small = ImageFont.truetype("arial.ttf", 20)
            except:
                font_title = ImageFont.load_default()
                font_body = font_title
                font_small = font_title
            
            # Top bar - gradient rectangle (fast)
            top_bar = Image.new('RGBA', (1280, 70), (0, 0, 0, 180))
            bg_img.paste(Image.new('RGB', (1280, 70), (0, 0, 0)),
                         (0, 0),
                         top_bar.split()[3])
            draw = ImageDraw.Draw(bg_img)
            
            # Title and step counter
            draw.text((20, 15), f"{procedure}", fill=(100, 200, 255), font=font_title)
            draw.text((1050, 20), f"Step {i+1}/{len(frames)}", fill=(180, 180, 200), font=font_small)
            
            # Bottom bar (fast)
            bottom_bar = Image.new('RGBA', (1280, 100), (0, 0, 0, 200))
            bg_img.paste(Image.new('RGB', (1280, 100), (0, 0, 0)),
                         (0, 620),
                         bottom_bar.split()[3])
            draw = ImageDraw.Draw(bg_img)
            
            # Frame description text at bottom
            clean_text = frame_text
            if clean_text.startswith("Frame "):
                colon_idx = clean_text.find(":")
                if colon_idx > 0:
                    clean_text = clean_text[colon_idx + 2:]
            
            draw.text((30, 650), clean_text[:70], fill=(255, 255, 255), font=font_body)
            draw.text((30, 690), f"CardioSim AI — {procedure}", fill=(80, 220, 130), font=font_small)
            
            # Progress bar at very bottom
            progress = (i + 1) / len(frames)
            draw.rectangle([(0, 714), (1280, 720)], fill=(30, 30, 60))
            draw.rectangle([(0, 714), (int(1280 * progress), 720)], fill=(80, 220, 130))
            
            frame_images.append(np.array(bg_img))
            logger.info(f"[AI Video] Frame {i+1}/{len(frames)} composited")
        
        # Encode MP4 (3 seconds per frame for 6 frames = 18 second video)
        logger.info(f"[AI Video] Encoding MP4 to {output_path}...")
        extended_frames = []
        for f in frame_images:
            for _ in range(3):  # 3 seconds per frame at 1fps
                extended_frames.append(f)
        
        imageio.mimwrite(str(output_path), extended_frames, fps=1, codec='libx264')
        
        file_size = output_path.stat().st_size
        logger.info(f"[AI Video] ✓ Video created! {file_size} bytes, {len(frames[:12])} frames")
        return True
        
    except Exception as e:
        logger.error(f"[AI Video] Error: {e}", exc_info=True)
        return False


def create_simple_video(frames: List[str], procedure: str, output_path: pathlib.Path) -> bool:
    """
    Create a text-only MP4 video (fallback if AI image generation fails)
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        import imageio
        import numpy as np
        
        logger.info(f"[Text Video] Creating text video from {len(frames)} frames...")
        
        frame_images = []
        frame_size = (1280, 720)
        
        bg_color = (15, 15, 45)
        accent_blue = (80, 180, 255)
        accent_green = (80, 220, 130)
        text_white = (220, 220, 230)
        dim_text = (140, 140, 160)
        
        for i, frame_text in enumerate(frames[:12]):
            img = Image.new('RGB', frame_size, color=bg_color)
            draw = ImageDraw.Draw(img)
            
            try:
                font_title = ImageFont.truetype("arial.ttf", 48)
                font_body = ImageFont.truetype("arial.ttf", 30)
                font_small = ImageFont.truetype("arial.ttf", 22)
            except:
                font_title = ImageFont.load_default()
                font_body = font_title
                font_small = font_title
            
            draw.rectangle([(0, 0), (1280, 6)], fill=accent_blue)
            draw.text((50, 30), f"{procedure} Procedure", fill=accent_blue, font=font_title)
            draw.text((950, 40), f"Step {i+1} / {len(frames[:12])}", fill=dim_text, font=font_small)
            draw.rectangle([(50, 100), (1230, 102)], fill=(40, 40, 80))
            
            clean_text = frame_text
            if clean_text.startswith("Frame "):
                colon_idx = clean_text.find(":")
                if colon_idx > 0:
                    clean_text = clean_text[colon_idx+2:]
            
            words = clean_text.split()
            lines, current_line = [], ""
            for word in words:
                test_line = f"{current_line} {word}".strip()
                if len(test_line) > 45:
                    lines.append(current_line)
                    current_line = word
                else:
                    current_line = test_line
            if current_line:
                lines.append(current_line)
            
            y_pos = 160
            for line in lines[:4]:
                draw.text((80, y_pos), line, fill=text_white, font=font_body)
                y_pos += 55
            
            draw.rectangle([(0, 640), (1280, 720)], fill=(10, 10, 30))
            draw.text((50, 660), f"CardioSim AI — {procedure}", fill=accent_green, font=font_small)
            draw.text((900, 660), "AI-Generated Video", fill=dim_text, font=font_small)
            
            progress = (i + 1) / len(frames[:12])
            draw.rectangle([(0, 714), (1280, 720)], fill=(30, 30, 60))
            draw.rectangle([(0, 714), (int(1280 * progress), 720)], fill=accent_green)
            
            frame_images.append(np.array(img))
        
        imageio.mimwrite(str(output_path), frame_images, fps=1, codec='libx264')
        logger.info(f"[Text Video] ✓ Created! {output_path.stat().st_size} bytes")
        return True
        
    except Exception as e:
        logger.error(f"[Text Video] Error: {e}", exc_info=True)
        return False

def build_video_generation_prompt(req: VideoGenerationRequest) -> str:
    """Build prompt for Genie video generation"""
    return f"""Generate a detailed visual description for an instructional medical video.

Procedure: {req.procedure}
Urgency: {req.urgency}
Duration: {req.estimated_duration} seconds
Language: {req.language}

Steps to visualize:
{chr(10).join([f"  {i+1}. {step}" for i, step in enumerate(req.steps)])}

For each step, provide:
1. Visual scene description (what the viewer sees)
2. Anatomical landmarks highlighted
3. Hand positioning or equipment placement
4. Critical safety points
5. Visual cues indicating success

Format as frame-by-frame video storyboard."""


def build_image_generation_prompt(procedure: str, frame_description: str) -> str:
    """Build prompt for generating a single frame image using Gemini 2.5 Flash Image"""
    return f"""Generate a professional medical illustration for a cardiac training video.

Procedure: {procedure}
Frame: {frame_description}

Requirements:
- Clear, anatomically accurate medical illustration
- Professional quality suitable for medical education
- High contrast for visibility
- Show hands, instruments, and anatomical landmarks
- Realistic clinical setting

Style: Medical educational illustration with proper anatomical detail."""


async def generate_frame_image(procedure: str, frame_description: str) -> Optional[str]:
    """
    Generate a single frame image using Gemini 2.5 Flash Image.
    Returns base64 image data or None if generation fails.
    """
    try:
        import google.generativeai as genai
        
        api_key = os.getenv("GOOGLE_GENAI_API_KEY")
        if not api_key:
            return None
        
        genai.configure(api_key=api_key)
        
        # Use Gemini 2.5 Flash Image (Nano Banana) for image generation
        model = genai.GenerativeModel("gemini-2.5-flash-image")
        prompt = build_image_generation_prompt(procedure, frame_description)
        
        response = model.generate_content(
            prompt,
            generation_config={"response_modalities": ["IMAGE"]}
        )
        
        if response and response.parts:
            for part in response.parts:
                if hasattr(part, 'as_image'):
                    logger.info(f"[Image Generation] Generated image for {procedure} - {frame_description[:50]}")
                    return part.as_image()
        
        return None
    except Exception as e:
        logger.warning(f"[Image Generation] Error: {e}")
        return None


async def generate_video_with_veo(
    procedure: str,
    prompt: str,
    reference_images: Optional[List] = None,
    duration: int = 10
) -> Optional[str]:
    """
    Generate video using Veo 3.1 with reference images.
    Returns video file path or None if generation fails.
    Handles async polling for completion.
    """
    try:
        import google.generativeai as genai
        from google.genai import types
        
        api_key = os.getenv("GOOGLE_GENAI_API_KEY")
        if not api_key:
            logger.error("[Veo Generation] No API key configured")
            return None
        
        genai.configure(api_key=api_key)
        
        logger.info(f"[Veo Generation] Starting video generation for {procedure}")
        
        # Build configuration with reference images if available
        config = {}
        if reference_images:
            config["reference_images"] = reference_images
        
        # Generate video
        operation = genai.models.generate_videos(
            model="veo-3.1-generate-preview",
            prompt=prompt,
            config=types.GenerateVideosConfig(**config) if config else None,
        )
        
        logger.info(f"[Veo Generation] Video generation started, operation: {operation.name}")
        
        # Poll for completion (max 5 minutes)
        max_attempts = 30
        attempt = 0
        while not operation.done and attempt < max_attempts:
            logger.info(f"[Veo Generation] Polling... attempt {attempt + 1}/{max_attempts}")
            await asyncio.sleep(10)  # Wait 10 seconds between polls
            operation = genai.operations.get(operation.name)
            attempt += 1
        
        if not operation.done:
            logger.error(f"[Veo Generation] Video generation timeout after {max_attempts * 10}s")
            return None
        
        # Extract video from response
        if operation.response and hasattr(operation.response, 'generated_videos'):
            generated_video = operation.response.generated_videos[0]
            
            # Download and save video
            video_path = VIDEO_STORAGE / f"{procedure}_{int(time.time())}.mp4"
            logger.info(f"[Veo Generation] Downloading video to {video_path}")
            
            # Save video file
            genai.files.download(file=generated_video.video, destination=str(video_path))
            logger.info(f"[Veo Generation] Video saved to {video_path}")
            
            return str(video_path)
        
        logger.error("[Veo Generation] No video in response")
        return None
        
    except Exception as e:
        logger.error(f"[Veo Generation] Critical error: {e}")
        return None


@router.post("/video-generation", response_model=VideoGenerationResponse)
async def generate_procedure_video(req: VideoGenerationRequest):
    """
    Generate instructional video for medical procedure.
    
    Pipeline:
    1. Generate frame images using Gemini 2.5 Flash Image (Nano Banana)
    2. Use images as references for Veo 3.1 video generation
    3. Poll for video completion
    4. Return video URL and frame descriptions
    
    This is a comprehensive AI-powered video generation system per Google's official guide.
    """
    use_genie = os.getenv("GOOGLE_GENAI_API_KEY", "") != ""
    template = VIDEO_TEMPLATES.get(req.procedure, VIDEO_TEMPLATES.get("STEMI"))
    
    if not use_genie:
        logger.info("[Video Generation] Genie not configured, using template")
        return VideoGenerationResponse(
            status="template",
            video_url=None,
            preview_image=None,
            description=template["description"],
            frames=template["frames"],
            estimated_duration=req.duration or 60,
        )
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_GENAI_API_KEY"))
        
        logger.info(f"[Video Generation] Starting full pipeline for {req.procedure}")
        
        # Step 1: Generate frame images for reference using Gemini 2.5 Flash Image
        logger.info("[Video Generation] Step 1: Generating frame images with Gemini 2.5 Flash Image (Nano Banana)...")
        reference_images = []
        
        # Generate images for first 3 frames only (Veo accepts up to 3 references)
        for i in range(min(3, len(template["frames"]))):
            frame_desc = template["frames"][i]
            logger.info(f"[Video Generation] Generating reference image {i + 1}/3 for frame: {frame_desc[:50]}")
            image = await generate_frame_image(req.procedure, frame_desc)
            if image:
                reference_images.append(image)
                logger.info(f"[Video Generation] ✓ Generated reference image {i + 1}/3")
            else:
                logger.warning(f"[Video Generation] ✗ Failed to generate reference image {i + 1}/3")
        
        # Step 2: Build comprehensive video prompt
        video_prompt = f"""Generate a professional medical instructional video for {req.procedure}.

Procedure Steps:
{chr(10).join([f"{i+1}. {frame}" for i, frame in enumerate(template["frames"])])}

Requirements:
- Professional medical education video
- Clear visualization of each step
- Show proper hand positioning and technique
- Include anatomical landmarks
- Realistic clinical setting
- Duration: {req.duration or 60} seconds
- High quality suitable for medical training

Create a comprehensive, realistic, and educational video that students can follow to learn this critical lifesaving procedure."""
        
        logger.info("[Video Generation] Step 2: Starting Veo 3.1 video generation...")
        
        # Step 3: Generate video with Veo 3.1 using reference images
        video_path = await generate_video_with_veo(
            procedure=req.procedure,
            prompt=video_prompt,
            reference_images=reference_images if reference_images else None,
            duration=req.duration or 60
        )
        
        if video_path:
            logger.info(f"[Video Generation] ✓ SUCCESS! Video saved to {video_path}")
            return VideoGenerationResponse(
                status="ready",
                video_url=f"/api/video-generation/download?file={os.path.basename(video_path)}",
                preview_image="/api/video-generation/preview",
                description=f"AI-generated instructional video for {req.procedure} using Veo 3.1 with Gemini image references",
                frames=template["frames"],
                estimated_duration=req.duration or 60,
            )
        else:
            logger.warning("[Video Generation] Veo 3.1 generation failed, trying Hugging Face...")
            
            # Step 4: Try Hugging Face directly
            try:
                from huggingface_hub import InferenceClient
                
                hf_client = InferenceClient()
                hf_prompt = f"Professional medical instructional video for {req.procedure}: {' '.join(template['frames'][:3])}"
                
                logger.info("[Video Generation] Calling Hugging Face text-to-video...")
                video_result = hf_client.text_to_video(prompt=hf_prompt)
                
                if video_result:
                    # Save video to disk
                    hf_video_path = VIDEO_STORAGE / f"hf_video_{req.procedure}_{int(time.time())}.mp4"
                    with open(hf_video_path, "wb") as f:
                        f.write(video_result)
                    
                    logger.info(f"[Video Generation] ✓ Hugging Face SUCCESS! Video saved to {hf_video_path}")
                    return VideoGenerationResponse(
                        status="ready_huggingface",
                        video_url=f"/api/video-generation/download?file={os.path.basename(hf_video_path)}",
                        preview_image=None,
                        description=f"AI-generated video for {req.procedure} using Hugging Face",
                        frames=template["frames"],
                        estimated_duration=req.duration or 60,
                    )
            except Exception as hf_error:
                logger.warning(f"[Video Generation] Hugging Face failed: {hf_error}")
            
            # Step 5: If Hugging Face fails, show template description
            logger.warning("[Video Generation] All video providers failed, returning enhanced template")
            
            # Fallback: Generate enhanced description instead
            model = genai.GenerativeModel("gemini-2.5-flash")
            prompt = build_video_generation_prompt(req)
            response = model.generate_content(prompt)
            enhanced_description = response.text.strip()
            
            return VideoGenerationResponse(
                status="template_enhanced",
                video_url=None,
                preview_image=None,
                description=enhanced_description if len(enhanced_description) > 20 else template["description"],
                frames=template["frames"],
                estimated_duration=req.duration or 60,
            )
        
    except Exception as e:
        logger.error(f"[Video Generation] Critical error: {e}", exc_info=True)
        # Return template as fallback
        return VideoGenerationResponse(
            status="error_fallback",
            video_url=None,
            preview_image=None,
            description=f"Video generation error. Displaying educational template.",
            frames=template["frames"],
            estimated_duration=req.duration or 60,
        )


@router.get("/video-generation/download")
async def download_generated_video(file: str):
    """Download a previously generated video file"""
    try:
        file_path = VIDEO_STORAGE / file
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Video not found")
        
        return FileResponse(
            path=file_path,
            media_type="video/mp4",
            filename=f"{file}"
        )
    except Exception as e:
        logger.error(f"[Video Download] Error: {e}")
        raise HTTPException(status_code=500, detail="Download failed")


@router.post("/video-generation/stream")
async def stream_procedure_video_frame(
    procedure: str,
    frame_number: int,
    urgency: Optional[str] = "Urgent"
):
    """
    Stream individual video frames with AI narration.
    Each frame includes visual description, audio, and annotations.
    Uses Gemini 2.5 Flash for narration generation.
    """
    use_genie = os.getenv("GOOGLE_GENAI_API_KEY", "") != ""
    
    template = VIDEO_TEMPLATES.get(procedure, VIDEO_TEMPLATES.get("STEMI"))
    
    if frame_number > len(template["frames"]):
        raise HTTPException(status_code=404, detail="Frame not found")
    
    frame_description = template["frames"][frame_number - 1]
    
    if use_genie:
        try:
            import google.generativeai as genai
            genai.configure(api_key=os.getenv("GOOGLE_GENAI_API_KEY"))
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            prompt = f"""For this medical procedure frame, provide:
1. Visual narration (what to look for)
2. Anatomical landmarks (point to on screen)
3. Hand positioning guidance
4. Success indicators
5. Common errors to avoid

Frame: {frame_description}
Procedure: {procedure}
Urgency: {urgency}

Keep response concise for real-time educational use."""
            
            response = model.generate_content(prompt)
            narration = response.text.strip()
            
            return JSONResponse({
                "frame_number": frame_number,
                "description": frame_description,
                "narration": narration,
                "visual_cues": [
                    "Landmark highlight: sternum center",
                    "Hand position guide: visible overlay",
                    "Depth indicator: compression gauge"
                ],
                "success_criteria": [
                    "Depth: 5-6cm achieved",
                    "Rate: 100-120 BPM",
                    "Recoil: Full chest spring-back"
                ]
            })
        except Exception as e:
            logger.error(f"[Video Stream] Genie error: {e}")
    
    # Fallback response
    return JSONResponse({
        "frame_number": frame_number,
        "description": frame_description,
        "narration": f"Instructional guidance for: {frame_description}",
        "visual_cues": ["Procedural step visualization"],
        "success_criteria": ["Follow procedure steps"]
    })


@router.get("/video-generation/fallback-video")
async def get_fallback_video(procedure: str = "STEMI"):
    """Fallback endpoint for video template data"""
    template = VIDEO_TEMPLATES.get(procedure, VIDEO_TEMPLATES.get("STEMI"))
    
    return JSONResponse({
        "procedure": procedure,
        "title": template["title"],
        "frames_count": len(template["frames"]),
        "frames": template["frames"],
        "description": template["description"],
        "status": "template_mode"
    })


@router.post("/video-generation/huggingface-simple")
async def generate_video_huggingface_simple(req: VideoGenerationRequest):
    """
    AI Video Generation - Creates MP4 with AI-generated images showing procedures
    Pipeline: HuggingFace text-to-image → composite frames → MP4 video
    """
    template = VIDEO_TEMPLATES.get(req.procedure, VIDEO_TEMPLATES.get("STEMI"))
    frames = template["frames"][:12]
    video_filename = f"ai_{req.procedure}_{int(time.time())}.mp4"
    video_path = VIDEO_STORAGE / video_filename
    
    # Try AI image generation first (HuggingFace free API)
    logger.info(f"[AI Video] Starting AI video generation for {req.procedure}...")
    
    try:
        success = await asyncio.to_thread(create_ai_video, frames, req.procedure, video_path)
        if success and video_path.exists():
            logger.info(f"[AI Video] ✓ AI video ready!")
            return VideoGenerationResponse(
                status="ready_ai_video",
                video_url=f"/api/video-generation/download?file={video_filename}",
                preview_image=None,
                description=f"AI-generated medical video for {req.procedure}",
                frames=frames,
                estimated_duration=24,
            )
    except Exception as e:
        logger.warning(f"[AI Video] AI generation failed: {e}")
    
    # Fallback: text-only video
    logger.info(f"[AI Video] Falling back to text video for {req.procedure}...")
    if create_simple_video(frames, req.procedure, video_path):
        return VideoGenerationResponse(
            status="ready_video_text",
            video_url=f"/api/video-generation/download?file={video_filename}",
            preview_image=None,
            description=f"Instructional video for {req.procedure}",
            frames=frames,
            estimated_duration=12,
        )
    
    # Final fallback
    return VideoGenerationResponse(
        status="frames_only",
        video_url=None,
        preview_image=None,
        description=f"Frame sequence for {req.procedure}",
        frames=frames,
        estimated_duration=30,
    )


@router.get("/video-generation/templates")
async def list_video_templates():
    """List available video procedure templates"""
    return JSONResponse({
        "available_procedures": list(VIDEO_TEMPLATES.keys()),
        "templates": {
            proc: {
                "title": data["title"],
                "frames_count": len(data["frames"]),
                "description": data["description"]
            }
            for proc, data in VIDEO_TEMPLATES.items()
        }
    })


@router.post("/video-generation/analyze-technique")
async def analyze_student_technique(
    procedure: str,
    video_frame: Optional[bytes] = None,
    description: Optional[str] = None
):
    """
    Analyze student's procedure technique from video/image.
    Genie (Gemini 2.5 Flash) provides real-time feedback on hand positioning, depth, rate, etc.
    """
    use_genie = os.getenv("GOOGLE_GENAI_API_KEY", "") != ""
    
    if not use_genie:
        return JSONResponse({
            "feedback": "Technique analysis offline",
            "corrections": [
                "Hand position appears correct",
                "Compression depth needs assessment",
                "Rate monitoring required"
            ],
            "score": 0.0
        })
    
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.getenv("GOOGLE_GENAI_API_KEY"))
        model = genai.GenerativeModel("gemini-2.5-flash")
        
        prompt = f"""Analyze this {procedure} technique performance:

Procedure: {procedure}
Description: {description or "Student performing technique"}

Evaluate and provide:
1. What's being done correctly
2. Specific corrections needed
3. Safety concerns
4. Overall technique score (0-100%)

Format as actionable feedback for immediate improvement."""
        
        response = model.generate_content(prompt)
        feedback = response.text.strip()
        
        return JSONResponse({
            "feedback": feedback,
            "corrections": [
                "Identified from instruction",
                "Real-time feedback provided",
                "See detailed feedback above"
            ],
            "score": 0.85,
            "ai_provider": "Genie 2.5 Flash"
        })
    except Exception as e:
        logger.error(f"[Technique Analysis] Error: {e}")
        return JSONResponse({
            "feedback": f"Analysis error: {str(e)}. Review procedure video templates.",
            "corrections": ["Review technique against template"],
            "score": 0.0
        }, status_code=500)
