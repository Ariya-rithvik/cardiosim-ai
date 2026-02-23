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
            const data = await res.json();
            setVideoData(data);
            setCurrentFrame(1);
            loadFrameNarration(1);
        } catch (e) {
            console.error("Video generation error:", e);
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
                            <div className="video-frame-number">Frame {currentFrame} of {maxFrames}</div>
                            <p className="video-frame-title">{procedure} Procedure</p>
                            <p className="video-frame-description">{currentFrameData}</p>
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

                    <button 
                        className="btn-generate"
                        onClick={generateVideo}
                        disabled={loading || !procedure}
                    >
                        {loading ? "Generating..." : "🎬 Generate Video"}
                    </button>

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
