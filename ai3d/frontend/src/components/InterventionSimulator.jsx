import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { ARTERY_MAP } from "../utils/heartAnnotations";
import MedicalMentor from "./MedicalMentor";

/* ─── Step definitions ────────────────────────────────────── */
const STEPS = [
    {
        id: "blocked",
        icon: "🔴",
        label: "Occlusion Detected",
        desc: "Atherosclerotic plaque causing >90% stenosis. Blood flow severely restricted.",
        color: "#ff4040",
    },
    {
        id: "guide",
        icon: "🔧",
        label: "Guidewire Navigation",
        desc: "0.014\" guidewire advanced through femoral artery to the coronary ostium.",
        color: "#94a3b8",
    },
    {
        id: "balloon",
        icon: "🎈",
        label: "Balloon Pre-dilation",
        desc: "Angioplasty balloon inflated at 12 atm to compress plaque against vessel wall.",
        color: "#fbbf24",
    },
    {
        id: "stent",
        icon: "⚙️",
        label: "Stent Deployment",
        desc: "Drug-eluting stent (DES) expanded to scaffold lumen — paclitaxel coating prevents restenosis.",
        color: "#818cf8",
    },
    {
        id: "flow",
        icon: "✅",
        label: "TIMI-3 Flow Restored",
        desc: "Full anterograde flow — oxygenated blood reaches ischaemic myocardium.",
        color: "#4ade80",
    },
];

/* ─── Artery Cross-Section Scene ─────────────────────────── */
function ArteryScene({ step }) {
    const plaqueRef = useRef();
    const balloonRef = useRef();
    const stentRefs = useRef([]);
    const particleRefs = useRef([]);
    const guidewireRef = useRef();

    const PARTICLE_COUNT = 12;

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();

        // Plaque: shrinks on balloon/stent/flow
        if (plaqueRef.current) {
            const targetScale =
                step === "flow" ? 0.05 :
                    step === "stent" ? 0.08 :
                        step === "balloon" ? 0.5 :
                            step === "guide" ? 0.9 : 1.0;
            const current = plaqueRef.current.scale.x;
            const next = current + (targetScale - current) * 0.08;
            plaqueRef.current.scale.setScalar(next);
            plaqueRef.current.material.emissiveIntensity =
                step === "blocked" ? 0.4 + Math.sin(t * 6) * 0.3
                    : step === "flow" ? 0.0 : 0.1;
        }

        // Balloon: inflates then deflates
        if (balloonRef.current) {
            const targetX = step === "balloon" ? 0.22 : step === "stent" || step === "flow" ? 0 : 0;
            const targetY = step === "balloon" ? 0.65 : 0;
            balloonRef.current.scale.x += (targetX - balloonRef.current.scale.x) * 0.1;
            balloonRef.current.scale.y += (targetY - balloonRef.current.scale.y) * 0.1;
            balloonRef.current.scale.z += (targetX - balloonRef.current.scale.z) * 0.1;
            balloonRef.current.material.opacity =
                step === "balloon" ? 0.55 + Math.sin(t * 3) * 0.1 : 0;
        }

        // Stent rings: expand radially
        stentRefs.current.forEach((ref) => {
            if (!ref) return;
            const targetR =
                step === "stent" || step === "flow" ? 1.0 : 0.35;
            const cur = ref.scale.x;
            const nxt = cur + (targetR - cur) * 0.09;
            ref.scale.set(nxt, 1, nxt);
        });

        // Guidewire
        if (guidewireRef.current) {
            guidewireRef.current.visible = step === "guide" || step === "balloon" || step === "stent";
        }

        // Blood flow particles — only in flow step
        particleRefs.current.forEach((ref, i) => {
            if (!ref) return;
            if (step !== "flow") {
                ref.visible = false;
                return;
            }
            ref.visible = true;
            const phase = ((t * 0.9 + (i / PARTICLE_COUNT) * 2.4) % 2.4) - 1.2;
            ref.position.y = phase;
            const pctRadius = (i % 3) * 0.032;
            const angle = i * 2.39996; // golden angle
            ref.position.x = Math.cos(angle) * pctRadius;
            ref.position.z = Math.sin(angle) * pctRadius;
            ref.material.opacity = 0.85;
        });
    });

    const arteryColor =
        step === "flow" ? "#5ac8fa" :
            step === "stent" || step === "balloon" ? "#e8b0b0" : "#cc8080";

    const STENT_Y = [-0.42, -0.25, -0.08, 0.09, 0.26, 0.43];

    return (
        <group>
            {/* Outer artery wall (transparent) */}
            <mesh>
                <cylinderGeometry args={[0.38, 0.38, 2.8, 36, 1, true]} />
                <meshStandardMaterial
                    color={arteryColor}
                    side={THREE.BackSide}
                    transparent
                    opacity={0.28}
                    roughness={0.6}
                />
            </mesh>
            {/* Inner lumen wall */}
            <mesh>
                <cylinderGeometry args={[0.36, 0.36, 2.8, 36, 1, true]} />
                <meshStandardMaterial
                    color={arteryColor}
                    side={THREE.BackSide}
                    transparent
                    opacity={0.18}
                    roughness={0.5}
                />
            </mesh>
            {/* Artery end caps */}
            {[-1.4, 1.4].map((y, i) => (
                <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.0, 0.38, 36]} />
                    <meshStandardMaterial color={arteryColor} transparent opacity={0.35} side={THREE.DoubleSide} />
                </mesh>
            ))}

            {/* Plaque (atherosclerotic buildup) */}
            <mesh ref={plaqueRef}>
                <group>
                    <mesh position={[0.14, 0.05, 0]}>
                        <sphereGeometry args={[0.21, 18, 14]} />
                        <meshStandardMaterial
                            color="#8b5a2b"
                            emissive="#cc2200"
                            emissiveIntensity={0.4}
                            roughness={0.92}
                        />
                    </mesh>
                    <mesh position={[-0.08, 0.0, 0.14]}>
                        <sphereGeometry args={[0.14, 14, 10]} />
                        <meshStandardMaterial color="#7a4e22" roughness={0.95} />
                    </mesh>
                    <mesh position={[0.06, -0.06, -0.12]}>
                        <sphereGeometry args={[0.11, 12, 10]} />
                        <meshStandardMaterial color="#6b4020" roughness={0.9} />
                    </mesh>
                </group>
            </mesh>

            {/* Guidewire */}
            <mesh ref={guidewireRef} position={[0.02, 0, 0.02]}>
                <cylinderGeometry args={[0.016, 0.016, 3.0, 8]} />
                <meshStandardMaterial color="#d0d0d8" metalness={0.96} roughness={0.08} />
            </mesh>

            {/* Balloon catheter */}
            <mesh ref={balloonRef} scale={[0, 0, 0]}>
                <cylinderGeometry args={[1.0, 1.0, 1.0, 24]} />
                <meshStandardMaterial
                    color="#fde68a"
                    emissive="#f59e0b"
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0}
                    roughness={0.5}
                />
            </mesh>

            {/* Stent rings */}
            {STENT_Y.map((y, i) => (
                <mesh
                    key={i}
                    ref={(el) => (stentRefs.current[i] = el)}
                    position={[0, y, 0]}
                    scale={[0.35, 1, 0.35]}
                >
                    <torusGeometry args={[0.3, 0.022, 8, 28]} />
                    <meshStandardMaterial
                        color="#a5b4fc"
                        emissive="#6366f1"
                        emissiveIntensity={step === "stent" || step === "flow" ? 0.9 : 0.0}
                        metalness={0.88}
                        roughness={0.18}
                    />
                </mesh>
            ))}
            {/* Stent struts (connecting rings) */}
            {step !== "blocked" && step !== "guide" &&
                STENT_Y.slice(0, -1).map((y, i) => (
                    <mesh key={`s${i}`} position={[0.28, (y + STENT_Y[i + 1]) / 2, 0]}>
                        <cylinderGeometry args={[0.012, 0.012, STENT_Y[i + 1] - y, 6]} />
                        <meshStandardMaterial color="#818cf8" metalness={0.9} roughness={0.15} />
                    </mesh>
                ))
            }

            {/* Blood flow particles */}
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                <mesh key={`p${i}`} ref={(el) => (particleRefs.current[i] = el)} visible={false}>
                    <sphereGeometry args={[0.026, 8, 8]} />
                    <meshStandardMaterial
                        color="#f87171"
                        emissive="#ea0030"
                        emissiveIntensity={1.8}
                        transparent
                        opacity={0.85}
                    />
                </mesh>
            ))}

            {/* Flow glow fill */}
            {step === "flow" && (
                <mesh>
                    <cylinderGeometry args={[0.29, 0.29, 2.6, 24, 1, true]} />
                    <meshStandardMaterial
                        color="#3b82f6"
                        emissive="#2563eb"
                        emissiveIntensity={0.8}
                        transparent
                        opacity={0.12}
                        side={THREE.BackSide}
                    />
                </mesh>
            )}

            {/* Step label at top */}
            <Text
                position={[0, 1.72, 0]}
                fontSize={0.13}
                color={STEPS.find((s) => s.id === step)?.color || "#e2e8f0"}
                anchorX="center"
                outlineWidth={0.008}
                outlineColor="#000814"
            >
                {STEPS.find((s) => s.id === step)?.label || ""}
            </Text>
        </group>
    );
}

/* ─── Live Stats Panel ────────────────────────────────────── */
function LiveStats({ step, diagn }) {
    const stats = {
        blocked: { timi: "0", ef: "32%", bp: "90/60", hr: "110" },
        guide: { timi: "0", ef: "34%", bp: "92/62", hr: "108" },
        balloon: { timi: "1", ef: "38%", bp: "96/65", hr: "102" },
        stent: { timi: "2", ef: "44%", bp: "104/70", hr: "94" },
        flow: { timi: "3", ef: "55%", bp: "118/76", hr: "78" },
    }[step] || { timi: "—", ef: "—", bp: "—", hr: "—" };

    const timiColors = { "0": "#ef4444", "1": "#f97316", "2": "#eab308", "3": "#22c55e" };
    const timiColor = timiColors[stats.timi] || "#94a3b8";

    return (
        <div className="sim-stats-grid">
            <div className="sim-stat">
                <span className="sim-stat-label">TIMI Flow</span>
                <span className="sim-stat-val" style={{ color: timiColor }}>
                    {stats.timi}
                </span>
            </div>
            <div className="sim-stat">
                <span className="sim-stat-label">EF (est)</span>
                <span className="sim-stat-val">{stats.ef}</span>
            </div>
            <div className="sim-stat">
                <span className="sim-stat-label">BP</span>
                <span className="sim-stat-val">{stats.bp}</span>
            </div>
            <div className="sim-stat">
                <span className="sim-stat-label">HR</span>
                <span className="sim-stat-val">{stats.hr} bpm</span>
            </div>
        </div>
    );
}

/* ─── Main InterventionSimulator ──────────────────────────── */
export default function InterventionSimulator({ diagnosis, visible }) {
    const [stepIdx, setStepIdx] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [showMentor, setShowMentor] = useState(false);
    const artery = diagnosis ? ARTERY_MAP[diagnosis.artery_id] : null;
    const currentStep = STEPS[stepIdx];

    const startSimulation = () => {
        setStepIdx(0);
        setPlaying(true);
    };

    useEffect(() => {
        if (!playing) return;
        if (stepIdx >= STEPS.length - 1) {
            setPlaying(false);
            return;
        }
        const t = setTimeout(() => setStepIdx((i) => i + 1), 2800);
        return () => clearTimeout(t);
    }, [playing, stepIdx]);

    if (!visible || !diagnosis) return null;

    return (
        <div className="intervention-panel glass-card animate-in">
            {/* Header */}
            <div className="panel-header">
                <span className="icon-accent">🔬</span>
                <h2>Intervention Simulation</h2>
                {artery && (
                    <span className="artery-tag" style={{ color: artery.color }}>
                        ● {artery.shortLabel}
                    </span>
                )}
                <button
                    className={`mentor-toggle-pill ${showMentor ? "active" : ""}`}
                    onClick={() => setShowMentor((v) => !v)}
                    title="Toggle AI Medical Mentor"
                >
                    🧑‍⚕️ {showMentor ? "Hide AI Guide" : "AI Guide"}
                </button>
            </div>

            {/* 3D Canvas */}
            <div className="stent-canvas">
                <Canvas
                    camera={{ position: [0.8, 0.2, 2.6], fov: 38 }}
                    style={{ background: "transparent" }}
                    gl={{ alpha: true, antialias: true }}
                >
                    <ambientLight intensity={0.45} />
                    <pointLight position={[2, 3, 2.5]} intensity={2.2} color="#ffffff" />
                    <pointLight position={[-2, -2, -1]} intensity={1.0} color="#4060ff" />
                    <pointLight position={[0, 0, -3]} intensity={0.5} color="#ff8080" />

                    <ArteryScene step={currentStep.id} />

                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        autoRotate
                        autoRotateSpeed={currentStep.id === "flow" ? 4 : 1.5}
                    />
                    <EffectComposer>
                        <Bloom
                            luminanceThreshold={0.2}
                            luminanceSmoothing={0.6}
                            intensity={currentStep.id === "flow" ? 2.0 : 1.0}
                        />
                    </EffectComposer>
                </Canvas>
            </div>

            {/* Live Stats */}
            <LiveStats step={currentStep.id} diagn={diagnosis} />

            {/* Step Timeline */}
            <div className="step-timeline">
                {STEPS.map((s, i) => (
                    <div
                        key={s.id}
                        className={`step-dot ${i < stepIdx ? "done" : ""} ${i === stepIdx ? "active" : ""}`}
                        onClick={() => { setStepIdx(i); setPlaying(false); }}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="dot-circle" style={i === stepIdx ? { background: s.color } : {}}>
                            {i < stepIdx ? "✓" : i + 1}
                        </div>
                        <span>{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Current Step Description */}
            <div className="step-desc">
                <span style={{ marginRight: 6 }}>{currentStep.icon}</span>
                {currentStep.desc}
            </div>

            {/* Completion message */}
            {currentStep.id === "flow" && !playing && (
                <div className="flow-restored">
                    ✅ TIMI-3 flow restored — Myocardium reperfused. Door-to-balloon time: 48 min.
                </div>
            )}

            {/* Controls */}
            <div className="sim-actions">
                <button
                    className="btn-primary"
                    onClick={playing ? () => setPlaying(false) : startSimulation}
                >
                    {playing ? "⏸ Pause" : stepIdx === 0 && !playing ? "▶ Start PCI Simulation" : "↺ Restart"}
                </button>
                {!playing && stepIdx > 0 && stepIdx < STEPS.length - 1 && (
                    <button
                        className="btn-secondary"
                        onClick={() => { setStepIdx((i) => i + 1); }}
                    >
                        Next Step →
                    </button>
                )}
            </div>
        </div>
    );
}
