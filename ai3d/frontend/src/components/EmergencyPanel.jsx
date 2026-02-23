import { useState, useRef } from "react";
import { AlertTriangle, Camera, Clock, CheckCircle } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/**
 * EmergencyPanel — Google Genie-powered visual guidance for urgent cardiac emergencies.
 * Activated automatically when urgency === "Immediate"
 *
 * Props:
 *   diagnosis      — DiagnosisOutput object
 *   visible        — boolean
 *   onDismiss      — callback when user closes panel
 */
export default function EmergencyPanel({ diagnosis, visible, onDismiss }) {
    const [protocol, setProtocol] = useState("");
    const [visualSteps, setVisualSteps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiProvider, setAiProvider] = useState("");
    const [cameraActive, setCameraActive] = useState(false);
    const [imageAnalysis, setImageAnalysis] = useState(null);
    const [analyzingImage, setAnalyzingImage] = useState(false);
    const [completedSteps, setCompletedSteps] = useState([]);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    if (!visible || !diagnosis) return null;

    // Load emergency protocol when panel opens
    if (!protocol && diagnosis) {
        loadEmergencyProtocol();
    }

    async function loadEmergencyProtocol() {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/emergency`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    diagnosis: diagnosis.diagnosis,
                    affected_region: diagnosis.affected_region,
                    artery_id: diagnosis.artery_id,
                    urgency: diagnosis.urgency,
                    recommended_intervention: diagnosis.recommended_intervention,
                    current_step: "assessment",
                }),
            });
            const data = await res.json();
            setProtocol(data.protocol);
            setVisualSteps(data.visual_steps || []);
            setAiProvider(data.ai_provider);
        } catch (e) {
            setProtocol(
                "🚨 CRITICAL: Specialist cannot be reached. Call emergency services: 911/999/112. " +
                "Begin CPR immediately if patient becomes unresponsive."
            );
        } finally {
            setLoading(false);
        }
    }

    async function captureAndAnalyzeImage() {
        if (!cameraActive || !videoRef.current) return;
        setAnalyzingImage(true);
        try {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(async (blob) => {
                    await analyzeImage(blob);
                });
            }
        } catch (e) {
            console.error("Image capture error:", e);
        } finally {
            setAnalyzingImage(false);
        }
    }

    async function analyzeImage(imageBlob) {
        try {
            const formData = new FormData();
            formData.append("image", imageBlob, "emergency.jpg");
            formData.append("diagnosis", diagnosis.diagnosis);
            formData.append("urgency", diagnosis.urgency);

            const res = await fetch(`${BACKEND_URL}/api/emergency/analyze-image`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            setImageAnalysis(data.guidance);
        } catch (e) {
            setImageAnalysis("⚠️ Image analysis failed. Continue with emergency protocol.");
        }
    }

    async function handleImageUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAnalyzingImage(true);
        await analyzeImage(file);
        setAnalyzingImage(false);
    }

    const toggleStep = (index) => {
        setCompletedSteps((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const toggleCamera = async () => {
        if (!cameraActive) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment", width: 640, height: 480 },
                    audio: false,
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                    setCameraActive(true);
                }
            } catch (e) {
                alert("Camera access denied.");
            }
        } else {
            // Stop camera
            const stream = videoRef.current?.srcObject;
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
            }
            setCameraActive(false);
        }
    };

    return (
        <div className="emergency-panel emergency-full-screen">
            {/* Header */}
            <div className="emergency-header">
                <div className="emergency-header-content">
                    <AlertTriangle size={32} className="emergency-icon-alert" />
                    <div>
                        <h1 className="emergency-title">🚨 EMERGENCY MODE ACTIVATED</h1>
                        <p className="emergency-subtitle">
                            {diagnosis.urgency} · Google Genie Visual Guidance
                        </p>
                    </div>
                    <button
                        className="emergency-close-btn"
                        onClick={onDismiss}
                        title="Close emergency panel"
                    >
                        ✕
                    </button>
                </div>
                <div className="emergency-banner-bar">
                    <span className="emergency-badge">
                        {diagnosis.diagnosis} ({diagnosis.artery_id})
                    </span>
                    <span className="emergency-provider-badge">{aiProvider}</span>
                </div>
            </div>

            <div className="emergency-body">
                {/* Split layout: Protocol + Visual Steps */}
                <div className="emergency-main-grid">
                    {/* Left: Protocol */}
                    <div className="emergency-protocol-section">
                        <h2 className="emergency-section-title">📋 Emergency Protocol</h2>
                        {loading ? (
                            <div className="emergency-loading">
                                <div className="emergency-spinner" />
                                <p>Loading emergency guidance...</p>
                            </div>
                        ) : (
                            <pre className="emergency-protocol-text">{protocol}</pre>
                        )}
                    </div>

                    {/* Right: Visual Steps + Camera */}
                    <div className="emergency-visual-section">
                        <h2 className="emergency-section-title">👀 Visual Action Checklist</h2>

                        {/* Camera Feed */}
                        <div className="emergency-camera-container">
                            <video
                                ref={videoRef}
                                className={`emergency-video ${cameraActive ? "active" : ""}`}
                                style={{ display: cameraActive ? "block" : "none" }}
                            />
                            <canvas
                                ref={canvasRef}
                                className="emergency-canvas"
                                style={{ display: "none" }}
                                width={640}
                                height={480}
                            />
                            {!cameraActive && (
                                <div className="emergency-camera-placeholder">
                                    <Camera size={48} />
                                    <p>Camera not active</p>
                                </div>
                            )}
                        </div>

                        {/* Camera Controls */}
                        <div className="emergency-camera-controls">
                            <button
                                className={`emergency-btn emergency-btn-camera ${cameraActive ? "active" : ""}`}
                                onClick={toggleCamera}
                            >
                                {cameraActive ? "🎥 Stop Camera" : "📷 Start Camera"}
                            </button>
                            <button
                                className="emergency-btn emergency-btn-capture"
                                onClick={captureAndAnalyzeImage}
                                disabled={!cameraActive || analyzingImage}
                            >
                                {analyzingImage ? "Analyzing..." : "📸 Analyze Scene"}
                            </button>
                            <button
                                className="emergency-btn emergency-btn-upload"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                📤 Upload Image
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: "none" }}
                            />
                        </div>

                        {/* Image Analysis Result */}
                        {imageAnalysis && (
                            <div className="emergency-image-analysis">
                                <h3 className="emergency-analysis-title">🤖 Genie Analysis</h3>
                                <p className="emergency-analysis-text">{imageAnalysis}</p>
                            </div>
                        )}

                        {/* Visual Steps Checklist */}
                        <div className="emergency-steps-list">
                            {visualSteps.map((step, idx) => (
                                <div
                                    key={idx}
                                    className={`emergency-step-item ${completedSteps.includes(idx) ? "completed" : ""}`}
                                    onClick={() => toggleStep(idx)}
                                >
                                    <button className="emergency-step-checkbox">
                                        {completedSteps.includes(idx) ? (
                                            <CheckCircle size={20} className="step-check-icon" />
                                        ) : (
                                            <div className="step-check-empty" />
                                        )}
                                    </button>
                                    <div className="emergency-step-content">
                                        <p className="emergency-step-text">{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Progress indicator */}
                        {visualSteps.length > 0 && (
                            <div className="emergency-progress">
                                <div className="emergency-progress-bar">
                                    <div
                                        className="emergency-progress-fill"
                                        style={{
                                            width: `${(completedSteps.length / visualSteps.length) * 100}%`,
                                        }}
                                    />
                                </div>
                                <p className="emergency-progress-text">
                                    {completedSteps.length} of {visualSteps.length} steps completed
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom: Critical Safety Warnings */}
                <div className="emergency-footer">
                    <div className="emergency-warning-box">
                        <AlertTriangle size={20} className="emergency-warning-icon" />
                        <div>
                            <h3 className="emergency-warning-title">⚠️ Critical Safety Reminders</h3>
                            <ul className="emergency-safety-list">
                                <li>✓ Time is critical in cardiac emergencies — every second counts</li>
                                <li>✓ If patient becomes unresponsive or stops breathing, BEGIN CPR IMMEDIATELY</li>
                                <li>✓ Call emergency services (911/999/112) if not already done</li>
                                <li>✓ Specialist consultation: Keep trying to reach on-call cardiology</li>
                                <li>✓ Document all times: First contact, medication administration, procedures</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
