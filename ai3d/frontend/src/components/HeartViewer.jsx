import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { ARTERY_MAP } from "../utils/heartAnnotations";

/* ─── Anatomical Heart Body ───────────────────────────────── */
function HeartBody() {
    return (
        <group>
            {/* Left ventricle — dominant, elongated */}
            <mesh position={[-0.1, -0.12, 0.05]} scale={[1.0, 1.25, 0.92]}>
                <sphereGeometry args={[0.62, 48, 48]} />
                <meshStandardMaterial color="#c0202a" roughness={0.38} metalness={0.12} />
            </mesh>
            {/* Right ventricle — front-right */}
            <mesh position={[0.32, 0.0, 0.06]} scale={[0.78, 1.05, 0.72]}>
                <sphereGeometry args={[0.5, 36, 36]} />
                <meshStandardMaterial color="#b31e2c" roughness={0.42} metalness={0.1} />
            </mesh>
            {/* Left atrium — upper back */}
            <mesh position={[-0.18, 0.62, -0.22]} scale={[0.88, 0.72, 0.78]}>
                <sphereGeometry args={[0.36, 32, 32]} />
                <meshStandardMaterial color="#a01820" roughness={0.48} metalness={0.08} />
            </mesh>
            {/* Right atrium */}
            <mesh position={[0.32, 0.56, -0.18]} scale={[0.8, 0.68, 0.74]}>
                <sphereGeometry args={[0.31, 28, 28]} />
                <meshStandardMaterial color="#991420" roughness={0.5} metalness={0.08} />
            </mesh>
            {/* Interventricular groove (dark crease) */}
            <mesh position={[0.1, 0.0, 0.6]} scale={[0.25, 1.3, 0.18]}>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshStandardMaterial color="#6a0412" roughness={0.7} metalness={0.04} />
            </mesh>
            {/* Apex — tapered tip */}
            <mesh position={[0.0, -0.88, 0.0]} scale={[0.55, 0.65, 0.55]}>
                <sphereGeometry args={[0.3, 24, 24]} />
                <meshStandardMaterial color="#880e18" roughness={0.55} metalness={0.05} />
            </mesh>

            {/* ── Great Vessels ── */}
            {/* Ascending aorta */}
            <mesh position={[-0.06, 1.02, 0.0]} rotation={[0.12, 0, 0.08]}>
                <cylinderGeometry args={[0.14, 0.16, 0.7, 20]} />
                <meshStandardMaterial color="#e8d0d0" roughness={0.32} metalness={0.22} />
            </mesh>
            {/* Aortic arch */}
            <mesh position={[0.2, 1.28, 0]} rotation={[0, 0, 1.0]}>
                <torusGeometry args={[0.26, 0.09, 14, 32, Math.PI * 0.65]} />
                <meshStandardMaterial color="#dcc0c0" roughness={0.32} metalness={0.22} />
            </mesh>
            {/* Descending aorta */}
            <mesh position={[0.42, 1.12, 0.0]} rotation={[0, 0, -0.08]}>
                <cylinderGeometry args={[0.1, 0.13, 0.52, 16]} />
                <meshStandardMaterial color="#d4b8b8" roughness={0.34} metalness={0.2} />
            </mesh>
            {/* Pulmonary trunk */}
            <mesh position={[0.22, 0.88, 0.2]} rotation={[0.4, 0.12, -0.32]}>
                <cylinderGeometry args={[0.11, 0.13, 0.58, 18]} />
                <meshStandardMaterial color="#7fb3d3" roughness={0.38} metalness={0.18} />
            </mesh>
            {/* Superior vena cava */}
            <mesh position={[0.48, 0.88, -0.08]} rotation={[0.08, 0, -0.1]}>
                <cylinderGeometry args={[0.09, 0.1, 0.48, 14]} />
                <meshStandardMaterial color="#8ba8d0" roughness={0.4} metalness={0.14} />
            </mesh>
            {/* Inferior vena cava */}
            <mesh position={[0.42, -0.62, -0.28]} rotation={[-0.5, 0, -0.2]}>
                <cylinderGeometry args={[0.09, 0.11, 0.45, 14]} />
                <meshStandardMaterial color="#8ba8d0" roughness={0.4} metalness={0.14} />
            </mesh>
        </group>
    );
}

/* ─── Curved Coronary Artery using TubeGeometry ───────────── */
function CoronaryArtery({ arteryId, highlighted }) {
    const meshRef = useRef();

    // Bezier control points on the heart surface for each artery
    const pointSets = {
        LAD: [
            new THREE.Vector3(-0.1, 0.45, 0.58),
            new THREE.Vector3(-0.18, 0.28, 0.64),
            new THREE.Vector3(-0.26, 0.08, 0.62),
            new THREE.Vector3(-0.3, -0.18, 0.58),
            new THREE.Vector3(-0.28, -0.42, 0.5),
            new THREE.Vector3(-0.2, -0.64, 0.4),
            new THREE.Vector3(-0.08, -0.78, 0.28),
        ],
        RCA: [
            new THREE.Vector3(0.18, 0.45, 0.42),
            new THREE.Vector3(0.42, 0.3, 0.35),
            new THREE.Vector3(0.56, 0.05, 0.18),
            new THREE.Vector3(0.55, -0.22, -0.02),
            new THREE.Vector3(0.42, -0.5, -0.15),
            new THREE.Vector3(0.22, -0.68, -0.08),
            new THREE.Vector3(0.05, -0.78, 0.05),
        ],
        LCX: [
            new THREE.Vector3(-0.1, 0.45, 0.48),
            new THREE.Vector3(-0.32, 0.32, 0.32),
            new THREE.Vector3(-0.52, 0.1, 0.08),
            new THREE.Vector3(-0.54, -0.14, -0.12),
            new THREE.Vector3(-0.44, -0.38, -0.22),
            new THREE.Vector3(-0.28, -0.55, -0.18),
        ],
    };

    const cfg = ARTERY_MAP[arteryId];

    const { tubeGeo, points } = useMemo(() => {
        const pts = pointSets[arteryId];
        if (!pts) return { tubeGeo: null, points: [] };
        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 40, highlighted ? 0.048 : 0.036, 12, false);
        return { tubeGeo, points: curve.getPoints(60) };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arteryId, highlighted]);

    useFrame(({ clock }) => {
        if (meshRef.current && highlighted) {
            const t = clock.getElapsedTime();
            meshRef.current.material.emissiveIntensity = 0.65 + Math.sin(t * 4.5) * 0.45;
        }
    });

    if (!tubeGeo || !cfg) return null;

    return (
        <group>
            <mesh ref={meshRef} geometry={tubeGeo}>
                <meshStandardMaterial
                    color={highlighted ? cfg.color : "#cc8080"}
                    emissive={highlighted ? cfg.glowColor : "#000"}
                    emissiveIntensity={highlighted ? 0.8 : 0}
                    roughness={0.28}
                    metalness={0.14}
                />
            </mesh>
            {highlighted && (
                <Text
                    position={[
                        points[30].x + 0.22,
                        points[30].y + 0.08,
                        points[30].z + 0.28,
                    ]}
                    fontSize={0.1}
                    color={cfg.color}
                    anchorX="left"
                    outlineWidth={0.007}
                    outlineColor="#000"
                >
                    {cfg.shortLabel}
                </Text>
            )}
        </group>
    );
}

/* ─── Blockage Clot ─────────────────────────────────────────  */
function Blockage({ arteryId }) {
    const ref = useRef();
    const ringRef = useRef();

    // Middle of each artery path (approx)
    const pos = {
        LAD: [-0.28, -0.1, 0.6],
        RCA: [0.55, -0.08, 0.08],
        LCX: [-0.52, 0.0, 0.02],
    }[arteryId] || [0, 0, 0];

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime();
            ref.current.material.emissiveIntensity = 1.0 + Math.sin(t * 5) * 0.6;
        }
        if (ringRef.current) {
            const t = clock.getElapsedTime();
            const s = 1 + Math.sin(t * 3) * 0.18;
            ringRef.current.scale.setScalar(s);
            ringRef.current.material.opacity = 0.5 + Math.sin(t * 3) * 0.3;
        }
    });

    return (
        <group position={pos}>
            {/* Clot core */}
            <mesh ref={ref}>
                <sphereGeometry args={[0.075, 16, 16]} />
                <meshStandardMaterial
                    color="#1a0000"
                    emissive="#aa0010"
                    emissiveIntensity={1.2}
                    roughness={0.9}
                />
            </mesh>
            {/* Warning ring */}
            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.15, 0.012, 8, 32]} />
                <meshStandardMaterial
                    color="#ff2020"
                    emissive="#ff0000"
                    emissiveIntensity={2.0}
                    transparent
                    opacity={0.7}
                />
            </mesh>
        </group>
    );
}

/* ─── Animated Blood Particles along blocked artery ─────────── */
function BloodParticles({ arteryId, active }) {
    const groupRef = useRef();
    const particleRefs = useRef([]);

    const pointSets = {
        LAD: [
            new THREE.Vector3(-0.1, 0.45, 0.58),
            new THREE.Vector3(-0.22, 0.1, 0.62),
            new THREE.Vector3(-0.3, -0.3, 0.54),
            new THREE.Vector3(-0.18, -0.68, 0.36),
        ],
        RCA: [
            new THREE.Vector3(0.18, 0.45, 0.42),
            new THREE.Vector3(0.55, 0.08, 0.18),
            new THREE.Vector3(0.42, -0.46, -0.12),
            new THREE.Vector3(0.05, -0.78, 0.05),
        ],
        LCX: [
            new THREE.Vector3(-0.1, 0.45, 0.48),
            new THREE.Vector3(-0.52, 0.12, 0.08),
            new THREE.Vector3(-0.44, -0.38, -0.22),
            new THREE.Vector3(-0.28, -0.55, -0.18),
        ],
    };

    const curve = useMemo(() => {
        const pts = pointSets[arteryId];
        if (!pts) return null;
        return new THREE.CatmullRomCurve3(pts);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [arteryId]);

    const PARTICLE_COUNT = 8;

    useFrame(({ clock }) => {
        if (!curve) return;
        const t = clock.getElapsedTime();
        particleRefs.current.forEach((ref, i) => {
            if (!ref) return;
            // Each particle at different phase, stops at ~0.45 (blockage)
            const phase = ((t * 0.25 + i / PARTICLE_COUNT) % 0.45);
            const pt = curve.getPoint(phase);
            ref.position.copy(pt);
            const opacity = phase > 0.38 ? (0.45 - phase) / 0.07 : 1;
            ref.material.opacity = opacity * 0.85;
        });
    });

    if (!curve || !active) return null;

    return (
        <group ref={groupRef}>
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
                <mesh
                    key={i}
                    ref={(el) => (particleRefs.current[i] = el)}
                >
                    <sphereGeometry args={[0.022, 8, 8]} />
                    <meshStandardMaterial
                        color="#ff4060"
                        emissive="#ff0020"
                        emissiveIntensity={1.5}
                        transparent
                        opacity={0.85}
                    />
                </mesh>
            ))}
        </group>
    );
}

/* ─── Medical Scan Ring ─────────────────────────────────────── */
function ScanRing() {
    const ref = useRef();
    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.position.y = -1.0 + ((clock.getElapsedTime() * 0.35) % 2.2);
            ref.current.material.opacity = 0.15 + Math.sin(clock.getElapsedTime() * 2) * 0.05;
        }
    });
    return (
        <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.1, 0.008, 6, 64]} />
            <meshStandardMaterial
                color="#00ccff"
                emissive="#00aaff"
                emissiveIntensity={2.0}
                transparent
                opacity={0.15}
            />
        </mesh>
    );
}

/* ─── Pulsing Heart Group ────────────────────────────────────  */
function PulsingHeart({ diagnosis }) {
    const groupRef = useRef();

    useFrame(({ clock }) => {
        if (groupRef.current) {
            const t = clock.getElapsedTime();
            // Realistic double-beat (systole + diastole)
            const beat =
                1 +
                Math.max(0, Math.sin(t * 1.9)) * 0.032 +
                Math.max(0, Math.sin(t * 3.8 + 0.4)) * 0.012;
            groupRef.current.scale.setScalar(beat);
        }
    });

    const arteries = ["LAD", "RCA", "LCX"];

    return (
        <group ref={groupRef}>
            <HeartBody />
            {arteries.map((id) => (
                <CoronaryArtery
                    key={id}
                    arteryId={id}
                    highlighted={diagnosis?.artery_id === id}
                />
            ))}
            {diagnosis && (
                <>
                    <Blockage arteryId={diagnosis.artery_id} />
                    <BloodParticles arteryId={diagnosis.artery_id} active />
                </>
            )}
        </group>
    );
}

/* ─── Main HeartViewer ───────────────────────────────────────  */
export default function HeartViewer({ diagnosis }) {
    const artery = diagnosis ? ARTERY_MAP[diagnosis.artery_id] : null;

    return (
        <div className="heart-viewer">
            <div className="viewer-label">
                <span>3D Cardiac Model</span>
                {artery && (
                    <span className="artery-tag" style={{ color: artery.color }}>
                        ● {artery.shortLabel} Occluded
                    </span>
                )}
            </div>

            <Canvas
                camera={{ position: [0.2, 0.4, 3.2], fov: 42 }}
                style={{ background: "transparent" }}
                gl={{ alpha: true, antialias: true }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.35} />
                <pointLight position={[3, 5, 3]} intensity={2.2} color="#fff5e0" />
                <pointLight position={[-3, -1, 2]} intensity={0.7} color="#3366ff" />
                <pointLight position={[0, -4, 1]} intensity={0.6} color="#ff3050" />
                <pointLight position={[0, 2, -3]} intensity={0.4} color="#ffffff" />

                <PulsingHeart diagnosis={diagnosis} />
                <ScanRing />

                <OrbitControls
                    enableZoom
                    enablePan={false}
                    minDistance={2}
                    maxDistance={5.5}
                    autoRotate={!diagnosis}
                    autoRotateSpeed={1.0}
                />

                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.25}
                        luminanceSmoothing={0.7}
                        intensity={diagnosis ? 1.6 : 0.4}
                    />
                </EffectComposer>
            </Canvas>

            {!diagnosis && (
                <div className="viewer-hint">
                    🫀 Drag to rotate • Scroll to zoom
                </div>
            )}
            {diagnosis && (
                <div className="viewer-hint" style={{ color: "#ff6060" }}>
                    ⚠️ {diagnosis.artery_id} occlusion detected — particles show blocked flow
                </div>
            )}
        </div>
    );
}
