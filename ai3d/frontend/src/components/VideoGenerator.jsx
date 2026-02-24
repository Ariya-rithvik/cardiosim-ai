import { useState, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Camera, Volume2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/**
 * VideoGenerator — Google Genie-powered instructional videos
 * Generates realistic visual procedures for cardiac interventions
 * 
 * Props:
 *   diagnosis      — DiagnosisOutput object
 *   visible        — boolean
 */
export default function VideoGenerator({ diagnosis, visible }) {
    const [procedure, setProcedure] = useState("STEMI");
    const [videoData, setVideoData] = useState(null);
    const [currentFrame, setCurrentFrame] = useState(1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generationStatus, setGenerationStatus] = useState("");
    const [narration, setNarration] = useState("");
    const [templates, setTemplates] = useState([]);
    const videoRef = useRef(null);

    if (!visible) return null;

    // Load available templates on mount
    if (templates.length === 0) {
        loadTemplates();
    }

    async function loadTemplates() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/video-generation/templates`);
            const data = await res.json();
            setTemplates(data.available_procedures || ["STEMI", "CPR", "PCI_BALLOON"]);
        } catch (e) {
            console.error("Failed to load templates:", e);
            setTemplates(["STEMI", "CPR", "PCI_BALLOON"]);
        }
    }

    async function generateVideo() {
        if (!procedure) return;
        setLoading(true);
        setGenerationStatus("🎨 Generating frame images with AI...");
        
        try {
            const res = await fetch(`${BACKEND_URL}/api/video-generation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    procedure,
                    urgency: diagnosis?.urgency || "Urgent",
                    steps: [
                        "Patient assessment",
                        "Monitoring setup",
                        "Intervention preparation",
                        "Procedure execution",
                        "Post-procedure care"
                    ],
                    duration: 60,
                    language: "english"
                }),
            });
            
            if (!res.ok) {
                throw new Error(`Generation failed: ${res.status}`);
            }
            
            const data = await res.json();
            setGenerationStatus(`✓ Video generation complete (${data.status})`);
            setVideoData(data);
            setCurrentFrame(1);
            setTimeout(() => loadFrameNarration(1), 500);
            
            // Clear status message after 3 seconds
            setTimeout(() => setGenerationStatus(""), 3000);
        } catch (e) {
            console.error("Video generation error:", e);
            setGenerationStatus(`✗ Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function generateVideoHuggingFaceSimple() {
        if (!procedure) return;
        setLoading(true);
        setGenerationStatus("🎨 Generating AI images for each step... (takes 2-5 min, using free AI)");
        
        // Progress simulation
        const progressMsgs = [
            "🖼️ Submitting image jobs to AI Horde (free GPUs)...",
            "⏳ AI generating frame images... (queued on community GPUs)",
            "🎬 Still generating... AI is drawing realistic medical scenes...",
            "📸 Almost there... compositing frames into video...",
        ];
        let msgIdx = 0;
        const progressInterval = setInterval(() => {
            msgIdx = Math.min(msgIdx + 1, progressMsgs.length - 1);
            setGenerationStatus(progressMsgs[msgIdx]);
        }, 30000);
        
        try {
            const res = await fetch(`${BACKEND_URL}/api/video-generation/huggingface-simple`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    procedure,
                    urgency: diagnosis?.urgency || "Urgent",
                    steps: ["AI video generation"],
                    duration: 30,
                    language: "english"
                }),
            });
            
            clearInterval(progressInterval);
            
            if (!res.ok) {
                throw new Error(`Generation failed: ${res.status}`);
            }
            
            const data = await res.json();
            setGenerationStatus(data.video_url ? "✓ AI Video Ready! 🎬" : "✓ Generated (text frames)");
            setVideoData(data);
            setCurrentFrame(1);
            setTimeout(() => loadFrameNarration(1), 500);
            
            setTimeout(() => setGenerationStatus(""), 5000);
        } catch (e) {
            clearInterval(progressInterval);
            console.error("AI video error:", e);
            setGenerationStatus(`✗ Error: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }

    async function loadFrameNarration(frameNum) {
        if (!procedure) return;
        try {
            const res = await fetch(`${BACKEND_URL}/api/video-generation/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `procedure=${procedure}&frame_number=${frameNum}&urgency=${diagnosis?.urgency || "Urgent"}`
            });
            const data = await res.json();
            setNarration(data.narration || data.description || "");
        } catch (e) {
            console.error("Frame loading error:", e);
            setNarration("Narration unavailable");
        }
    }

    function handleFrameChange(newFrame) {
        setCurrentFrame(newFrame);
        loadFrameNarration(newFrame);
    }

    function handlePlayPause() {
        if (!isPlaying) {
            setIsPlaying(true);
            // Auto-play through frames
            const interval = setInterval(() => {
                setCurrentFrame((prev) => {
                    if (prev >= (videoData?.frames?.length || 12)) {
                        setIsPlaying(false);
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 5000); // 5 seconds per frame
        } else {
            setIsPlaying(false);
        }
    }

    const maxFrames = videoData?.frames?.length || 12;
    const currentFrameData = videoData?.frames?.[currentFrame - 1] || `Frame ${currentFrame}`;

    return (
        <div className="video-generator-panel">
            <div className="video-container">
                {/* Main Video Display */}
                <div className="video-display">
                    <div className="video-canvas">
                        <div className="video-placeholder">
                            {videoData ? (
                                <>
                                    {/* Show actual video player if video_url exists */}
                                    {videoData.video_url ? (
                                        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                                            <video 
                                                controls 
                                                autoPlay 
                                                loop
                                                style={{ width: "100%", maxHeight: "500px", borderRadius: "12px", border: "1px solid #334155" }}
                                                src={`${BACKEND_URL}${videoData.video_url}`}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                                <span className="ai-status-badge" style={{ margin: 0 }}>
                                                    <span style={{ marginRight: "8px" }}>🎬</span>
                                                    <span>Video Ready</span>
                                                </span>
                                                <a 
                                                    href={`${BACKEND_URL}${videoData.video_url}`} 
                                                    download 
                                                    style={{ color: "#4ade80", textDecoration: "underline", fontSize: "14px" }}
                                                >
                                                    ⬇ Download MP4
                                                </a>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="video-frame-number">Frame {currentFrame} of {maxFrames}</div>
                                            <p className="video-frame-title">{procedure} Procedure</p>
                                            <p className="video-frame-description">{currentFrameData}</p>
                                        </>
                                    )}
                                    
                                    {/* AI Enhancement Status */}
                                    {!videoData.video_url && (
                                        <div className="ai-status-badge">
                                            <span style={{ marginRight: "8px" }}>✨</span>
                                            <span>AI-Generated Content</span>
                                            <span style={{ marginLeft: "8px", fontSize: "0.9em" }}>({videoData.status})</span>
                                        </div>
                                    )}
                                    
                                    {/* Frame narration display */}
                                    {narration && (
                                        <div className="narration-box">
                                            <div className="narration-label">
                                                <Volume2 size={16} style={{ marginRight: "8px" }} />
                                                AI Narration:
                                            </div>
                                            <p className="narration-text">{narration}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="video-frame-number">Frame {currentFrame} of {maxFrames}</div>
                                    <p className="video-frame-title">{procedure} Procedure</p>
                                    <p className="video-frame-description">{currentFrameData}</p>
                                    {loading && (
                                        <div style={{ marginTop: "16px", textAlign: "center" }}>
                                            <p style={{ color: "#4ade80", fontWeight: "600", marginBottom: "8px" }}>{generationStatus || "🎬 Generating video..."}</p>
                                            <div style={{ marginTop: "12px", display: "flex", gap: "4px", justifyContent: "center" }}>
                                                <span style={{ animation: "pulse 0.6s infinite" }}>●</span>
                                                <span style={{ animation: "pulse 0.6s infinite 0.2s" }}>●</span>
                                                <span style={{ animation: "pulse 0.6s infinite 0.4s" }}>●</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="video-controls">
                        <button 
                            className="video-btn"
                            onClick={() => handleFrameChange(Math.max(1, currentFrame - 1))}
                            disabled={currentFrame === 1}
                        >
                            <SkipBack size={20} />
                        </button>

                        <button 
                            className="video-btn video-btn-play"
                            onClick={handlePlayPause}
                        >
                            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </button>

                        <button 
                            className="video-btn"
                            onClick={() => handleFrameChange(Math.min(maxFrames, currentFrame + 1))}
                            disabled={currentFrame === maxFrames}
                        >
                            <SkipForward size={20} />
                        </button>

                        <div className="video-progress">
                            <input
                                type="range"
                                min="1"
                                max={maxFrames}
                                value={currentFrame}
                                onChange={(e) => handleFrameChange(parseInt(e.target.value))}
                                className="video-slider"
                            />
                            <span className="video-time">{currentFrame} / {maxFrames}</span>
                        </div>
                    </div>

                    {/* Narration */}
                    <div className="video-narration">
                        <div className="narration-header">
                            <Volume2 size={18} />
                            <span>AI Narration</span>
                        </div>
                        <p className="narration-text">{narration || "Loading narration..."}</p>
                    </div>
                </div>

                {/* Sidebar: Procedure Selection */}
                <div className="video-sidebar">
                    <h3 className="sidebar-title">📹 Video Procedures</h3>

                    <div className="procedure-selector">
                        {templates.map((proc) => (
                            <button
                                key={proc}
                                className={`procedure-btn ${procedure === proc ? "active" : ""}`}
                                onClick={() => setProcedure(proc)}
                            >
                                {proc}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                        <button 
                            className="btn-generate"
                            onClick={generateVideo}
                            disabled={loading || !procedure}
                        >
                            {loading ? "Generating..." : "🎬 Generate Video"}
                        </button>
                        <button 
                            className="btn-generate"
                            onClick={generateVideoHuggingFaceSimple}
                            disabled={loading || !procedure}
                            style={{ backgroundColor: "#8b5cf6", borderColor: "#8b5cf6" }}
                        >
                            {loading ? "Generating..." : "🎨 AI Video"}
                        </button>
                    </div>

                    {videoData && (
                        <div className="video-info">
                            <h4>Video Details</h4>
                            <p><strong>Title:</strong> {videoData.description}</p>
                            <p><strong>Total Frames:</strong> {maxFrames}</p>
                            <p><strong>Duration:</strong> {videoData.estimated_duration}s</p>
                            <p><strong>Provider:</strong> Google Genie</p>
                        </div>
                    )}

                    {/* Frame List */}
                    <div className="frame-list">
                        <h4>📋 Frames</h4>
                        <div className="frames-scroll">
                            {videoData?.frames?.map((frame, idx) => (
                                <div
                                    key={idx}
                                    className={`frame-item ${currentFrame === idx + 1 ? "active" : ""}`}
                                    onClick={() => handleFrameChange(idx + 1)}
                                >
                                    <span className="frame-num">{idx + 1}</span>
                                    <span className="frame-label">
                                        {frame.substring(0, 30)}...
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
