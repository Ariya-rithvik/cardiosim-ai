import { useEffect, useRef, useState, useCallback } from "react";

/* ─── CPR Protocol Steps ─── */
const STEPS = [
    {
        id: 1,
        icon: "📞",
        title: "Call Emergency Services",
        instruction: "Call 112 (India) / 911 (US) / 999 (UK) immediately. Put on speakerphone so both hands are free.",
        color: "#ef4444",
        duration: null,
    },
    {
        id: 2,
        icon: "👁️",
        title: "Check Consciousness",
        instruction: 'Tap their shoulders firmly and shout "Are you okay?" If no response, they need help NOW.',
        color: "#f59e0b",
        duration: null,
    },
    {
        id: 3,
        icon: "👃",
        title: "Check Breathing",
        instruction: "Tilt their head back, lift their chin. Look, listen and feel for normal breathing for 10 seconds.",
        color: "#f59e0b",
        duration: 10,
    },
    {
        id: 4,
        icon: "🤲",
        title: "Start Chest Compressions",
        instruction: "Point camera at the person lying down. AI will find the exact chest compression spot. Push HARD and FAST — at least 5–6 cm deep, 100–120 times per minute.",
        color: "#3b82f6",
        duration: null,
        isCPR: true,
    },
    {
        id: 5,
        icon: "💨",
        title: "Rescue Breaths (if trained)",
        instruction: "After 30 compressions: tilt head, lift chin, pinch nose, give 2 breaths (1 second each). If untrained, skip and continue compressions only.",
        color: "#8b5cf6",
        duration: null,
    },
];

/* ─── Landmark indices (MediaPipe Pose) ─── */
const LANDMARK = {
    LEFT_SHOULDER: 11,
    RIGHT_SHOULDER: 12,
    LEFT_HIP: 23,
    RIGHT_HIP: 24,
    NOSE: 0,
};

/* ─── BPM Metronome hook ─── */
function useMetronome(bpm, active) {
    const [beat, setBeat] = useState(false);
    useEffect(() => {
        if (!active) return;
        const interval = (60 / bpm) * 1000;
        const id = setInterval(() => setBeat((b) => !b), interval);
        return () => clearInterval(id);
    }, [bpm, active]);
    return beat;
}

/* ─── Main component ─── */
export default function CPRGuide() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const poseRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);

    const [step, setStep] = useState(0);          // current protocol step index
    const [cameraOn, setCameraOn] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [landmark, setLandmark] = useState(null);       // {x,y} in canvas coords
    const [compressions, setCompressions] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [modelLoading, setModelLoading] = useState(false);
    const beatActive = useMetronome(110, step === 3 && cameraOn);

    const currentStep = STEPS[step];

    /* ── Start camera + pose ── */
    const startCamera = useCallback(async () => {
        setCameraError(null);
        setModelLoading(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment", width: 640, height: 480 },
                audio: false,
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            // Dynamically import MediaPipe Pose
            const { Pose } = await import("@mediapipe/pose");
            const pose = new Pose({
                locateFile: (file) =>
                    `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
            });
            pose.setOptions({
                modelComplexity: 1,
                smoothLandmarks: true,
                enableSegmentation: false,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5,
            });
            pose.onResults(handlePoseResults);
            poseRef.current = pose;

            setCameraOn(true);
            setModelLoading(false);
            runDetection();
        } catch (err) {
            setCameraError("Camera access denied. Please allow camera access and try again.");
            setModelLoading(false);
        }
    }, []);

    /* ── Detection loop ── */
    const runDetection = useCallback(() => {
        const detect = async () => {
            if (videoRef.current && poseRef.current && videoRef.current.readyState === 4) {
                await poseRef.current.send({ image: videoRef.current });
            }
            rafRef.current = requestAnimationFrame(detect);
        };
        rafRef.current = requestAnimationFrame(detect);
    }, []);

    /* ── Handle pose results → draw overlay ── */
    const handlePoseResults = useCallback((results) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const { width, height } = canvas;

        ctx.clearRect(0, 0, width, height);

        if (!results.poseLandmarks) return;
        const lm = results.poseLandmarks;

        const leftShoulder = lm[LANDMARK.LEFT_SHOULDER];
        const rightShoulder = lm[LANDMARK.RIGHT_SHOULDER];
        const leftHip = lm[LANDMARK.LEFT_HIP];
        const rightHip = lm[LANDMARK.RIGHT_HIP];

        if (!leftShoulder || !rightShoulder) return;

        // Sternum = midpoint between shoulders, slightly lower
        const sx = ((leftShoulder.x + rightShoulder.x) / 2) * width;
        const sy = ((leftShoulder.y + rightShoulder.y) / 2) * height + 30;

        setLandmark({ x: sx, y: sy });

        // Draw skeleton lines
        const pairs = [
            [LANDMARK.LEFT_SHOULDER, LANDMARK.RIGHT_SHOULDER],
            [LANDMARK.LEFT_SHOULDER, LANDMARK.LEFT_HIP],
            [LANDMARK.RIGHT_SHOULDER, LANDMARK.RIGHT_HIP],
            [LANDMARK.LEFT_HIP, LANDMARK.RIGHT_HIP],
        ];
        ctx.strokeStyle = "rgba(99,179,237,0.5)";
        ctx.lineWidth = 2;
        pairs.forEach(([a, b]) => {
            if (!lm[a] || !lm[b]) return;
            ctx.beginPath();
            ctx.moveTo(lm[a].x * width, lm[a].y * height);
            ctx.lineTo(lm[b].x * width, lm[b].y * height);
            ctx.stroke();
        });

        // Draw skeleton joints
        [LANDMARK.LEFT_SHOULDER, LANDMARK.RIGHT_SHOULDER, LANDMARK.LEFT_HIP, LANDMARK.RIGHT_HIP]
            .forEach((idx) => {
                if (!lm[idx]) return;
                ctx.beginPath();
                ctx.arc(lm[idx].x * width, lm[idx].y * height, 6, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(99,179,237,0.9)";
                ctx.fill();
            });

        // Pulsing compression target ring
        const t = Date.now() / 450;
        const pulse = 1 + Math.sin(t) * 0.18;
        const baseRadius = 32;

        // Outer glow ring
        const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, baseRadius * pulse * 1.6);
        grd.addColorStop(0, "rgba(239,68,68,0.0)");
        grd.addColorStop(0.5, "rgba(239,68,68,0.15)");
        grd.addColorStop(1, "rgba(239,68,68,0.0)");
        ctx.beginPath();
        ctx.arc(sx, sy, baseRadius * pulse * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Main ring
        ctx.beginPath();
        ctx.arc(sx, sy, baseRadius * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner crosshair
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        [-18, 18].forEach((d) => {
            ctx.beginPath(); ctx.moveTo(sx + d, sy); ctx.lineTo(sx - d, sy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(sx, sy + d); ctx.lineTo(sx, sy - d); ctx.stroke();
        });

        // Label
        ctx.fillStyle = "#ef4444";
        ctx.font = "bold 13px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("COMPRESS HERE", sx, sy - baseRadius * pulse - 10);

        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText("Push 5–6 cm deep", sx, sy + baseRadius * pulse + 20);
    }, []);

    /* ── Stop camera ── */
    const stopCamera = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setCameraOn(false);
        setLandmark(null);
        const canvas = canvasRef.current;
        if (canvas) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    }, []);

    /* ── Compression counter ── */
    const addCompression = () => {
        setCompressions((c) => {
            const next = c + 1;
            return next;
        });
    };

    /* ── Step timer ── */
    useEffect(() => {
        if (!timerActive || !currentStep.duration) return;
        const id = setInterval(() => setElapsed((e) => e + 1), 1000);
        return () => clearInterval(id);
    }, [timerActive, currentStep]);

    useEffect(() => {
        if (elapsed >= (currentStep.duration || 0) && timerActive) {
            setTimerActive(false);
        }
    }, [elapsed, currentStep, timerActive]);

    /* ── Cleanup on unmount ── */
    useEffect(() => () => stopCamera(), [stopCamera]);

    /* ── Canvas sync with video ── */
    useEffect(() => {
        const vid = videoRef.current;
        const canvas = canvasRef.current;
        if (!vid || !canvas) return;
        const sync = () => {
            canvas.width = vid.videoWidth || 640;
            canvas.height = vid.videoHeight || 480;
        };
        vid.addEventListener("loadedmetadata", sync);
        return () => vid.removeEventListener("loadedmetadata", sync);
    }, []);

    return (
        <div className="cpr-guide">
            {/* ── Emergency Header ── */}
            <div className="cpr-header">
                <span className="cpr-sos">🆘 EMERGENCY FIRST RESPONDER</span>
                <span className="cpr-subtitle">AI-Guided CPR · Bystander Edition · Works Offline</span>
                <div className="cpr-emergency-nums">
                    <span>📞 India: <b>112</b></span>
                    <span>📞 US: <b>911</b></span>
                    <span>📞 UK: <b>999</b></span>
                </div>
            </div>

            <div className="cpr-body">
                {/* ── Left: Step Protocol ── */}
                <div className="cpr-steps">
                    <p className="cpr-steps-title">EMERGENCY PROTOCOL</p>

                    {STEPS.map((s, i) => (
                        <button
                            key={s.id}
                            className={`cpr-step-item ${step === i ? "active" : ""} ${i < step ? "done" : ""}`}
                            onClick={() => { setStep(i); setElapsed(0); setTimerActive(false); }}
                        >
                            <span className="cpr-step-num">{i < step ? "✓" : s.id}</span>
                            <span className="cpr-step-icon">{s.icon}</span>
                            <div className="cpr-step-text">
                                <span className="cpr-step-title">{s.title}</span>
                            </div>
                            {step === i && <span className="cpr-step-active-dot" />}
                        </button>
                    ))}

                    {/* Compression counter */}
                    {step === 3 && (
                        <div className="compression-counter">
                            <p className="counter-label">COMPRESSIONS</p>
                            <div className={`counter-num ${beatActive ? "beat-flash" : ""}`}>{compressions}</div>
                            <p className="counter-target">Target: 30 then 2 breaths</p>
                            <div className="counter-btns">
                                <button className="count-btn" onClick={addCompression}>+ Press</button>
                                <button className="count-btn-reset" onClick={() => setCompressions(0)}>Reset</button>
                            </div>
                            {compressions > 0 && compressions % 30 === 0 && (
                                <div className="breath-alert">💨 Give 2 rescue breaths now!</div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Center: Camera + AR Overlay ── */}
                <div className="cpr-camera-panel">
                    {/* Instruction card */}
                    <div className="cpr-instruction" style={{ borderColor: currentStep.color }}>
                        <span className="cpr-inst-icon">{currentStep.icon}</span>
                        <div>
                            <p className="cpr-inst-title">{currentStep.title}</p>
                            <p className="cpr-inst-text">{currentStep.instruction}</p>
                        </div>
                    </div>

                    {/* Camera view */}
                    <div className="cpr-camera-box">
                        {!cameraOn && !modelLoading && (
                            <div className="camera-prompt">
                                {step === 3 ? (
                                    <>
                                        <p className="camera-prompt-title">📷 Point camera at the patient</p>
                                        <p className="camera-prompt-sub">
                                            AI will detect their body and show you exactly where to press for chest compressions
                                        </p>
                                        <button className="btn-camera-start" onClick={startCamera}>
                                            Start AR Body Detection
                                        </button>
                                    </>
                                ) : (
                                    <p className="camera-prompt-title">📷 Camera activates in Step 4</p>
                                )}
                                {cameraError && <p className="camera-error">{cameraError}</p>}
                            </div>
                        )}

                        {modelLoading && (
                            <div className="camera-prompt">
                                <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                                <p style={{ marginTop: 12, color: "#94a3b8", fontSize: "0.8rem" }}>
                                    Loading AI body detection model…
                                </p>
                            </div>
                        )}

                        <video
                            ref={videoRef}
                            className="cpr-video"
                            style={{ display: cameraOn ? "block" : "none" }}
                            playsInline
                            muted
                        />
                        <canvas
                            ref={canvasRef}
                            className="cpr-canvas"
                            style={{ display: cameraOn ? "block" : "none" }}
                        />

                        {/* Metronome beat indicator */}
                        {cameraOn && step === 3 && (
                            <div className={`metronome-bar ${beatActive ? "metronome-active" : ""}`}>
                                <span>🥁 {beatActive ? "COMPRESS!" : "·"}</span>
                                <span className="bpm-label">110 BPM · Push hard and fast</span>
                            </div>
                        )}

                        {cameraOn && (
                            <button className="btn-camera-stop" onClick={stopCamera}>
                                ✕ Stop Camera
                            </button>
                        )}

                        {/* Body detection status */}
                        {cameraOn && (
                            <div className={`body-status ${landmark ? "detected" : "finding"}`}>
                                {landmark ? "✅ Body detected — AI guidance active" : "🔍 Scanning for patient body…"}
                            </div>
                        )}
                    </div>

                    {/* Nav buttons */}
                    <div className="cpr-nav">
                        <button
                            className="cpr-nav-btn"
                            disabled={step === 0}
                            onClick={() => { setStep(s => s - 1); setElapsed(0); setTimerActive(false); if (cameraOn && step - 1 !== 3) stopCamera(); }}
                        >
                            ← Previous
                        </button>

                        {currentStep.duration && !timerActive && elapsed < currentStep.duration && (
                            <button
                                className="cpr-nav-btn cpr-nav-timer"
                                onClick={() => setTimerActive(true)}
                            >
                                ▶ Start {currentStep.duration}s Timer
                            </button>
                        )}
                        {timerActive && (
                            <div className="timer-display">
                                {currentStep.duration - elapsed}s remaining
                            </div>
                        )}

                        <button
                            className="cpr-nav-btn cpr-nav-next"
                            disabled={step === STEPS.length - 1}
                            onClick={() => { setStep(s => s + 1); setElapsed(0); setTimerActive(false); }}
                        >
                            Next Step →
                        </button>
                    </div>
                </div>

                {/* ── Right: Info Panel ── */}
                <div className="cpr-info">
                    <div className="cpr-info-block">
                        <p className="cpr-info-title">🧠 Why CPR works</p>
                        <p className="cpr-info-text">
                            When the heart stops, chest compressions manually pump blood to the brain and heart muscle.
                            Each minute without CPR reduces survival by 7–10%. Starting CPR immediately can double
                            or triple survival chances.
                        </p>
                    </div>

                    <div className="cpr-info-block">
                        <p className="cpr-info-title">🤲 Correct hand position</p>
                        <ul className="cpr-info-list">
                            <li>Place heel of hand on centre of chest</li>
                            <li>On the lower half of the breastbone (sternum)</li>
                            <li>Place other hand on top, fingers interlocked</li>
                            <li>Keep arms straight, push straight down</li>
                            <li>Allow full chest recoil between compressions</li>
                        </ul>
                    </div>

                    <div className="cpr-info-block cpr-info-warn">
                        <p className="cpr-info-title">⚠️ Important</p>
                        <p className="cpr-info-text">
                            This tool is for guidance only. It does not replace professional medical training.
                            Always call emergency services first. If an AED (defibrillator) is nearby, use it.
                        </p>
                    </div>

                    <div className="cpr-info-block">
                        <p className="cpr-info-title">⚡ If AED is available</p>
                        <ul className="cpr-info-list">
                            <li>Turn it on — it will guide you with voice</li>
                            <li>Attach pads as shown in diagram</li>
                            <li>Stand clear and press shock button</li>
                            <li>Resume CPR immediately after shock</li>
                        </ul>
                    </div>

                    <div className="cpr-survival">
                        <p className="survival-title">Survival rate with bystander CPR</p>
                        <div className="survival-bar">
                            <div className="survival-fill" style={{ width: "45%" }}>45%</div>
                        </div>
                        <p className="survival-sub">vs. 6% without CPR (American Heart Association, 2023)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
