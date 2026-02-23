import { useState } from "react";

/**
 * InferencePanel — Upgrade 3: Real Inference Panel
 *
 * Shows model metadata, timing, raw diagnosis payload and
 * a JSON inspector so judges can see exactly what MedGemma returned.
 *
 * Props:
 *   diagnosis      — the DiagnosisOutput object (already stripped of _meta)
 *   inferenceInfo  — { mock, model_id, inference_time_s, quantization, timestamp }
 */
export default function InferencePanel({ diagnosis, inferenceInfo }) {
    const [showRaw, setShowRaw] = useState(false);

    if (!diagnosis || !inferenceInfo) return null;

    const isMock = inferenceInfo.mock !== false;

    return (
        <div className={`inference-panel glass-card animate-in ${isMock ? "infer-mock" : "infer-real"}`}>
            {/* ── Header ── */}
            <div className="infer-header">
                <div className="infer-title-row">
                    <span className="infer-icon">{isMock ? "🧪" : "🤖"}</span>
                    <div>
                        <p className="infer-title">
                            {isMock ? "Demo Inference" : "Real MedGemma Inference"}
                        </p>
                        <p className="infer-subtitle">
                            {isMock
                                ? "Running pre-computed mock response (no GPU required)"
                                : `${inferenceInfo.model_id} · ${inferenceInfo.quantization}`}
                        </p>
                    </div>
                    <span className={`infer-badge ${isMock ? "infer-badge-mock" : "infer-badge-real"}`}>
                        {isMock ? "MOCK" : "LIVE AI"}
                    </span>
                </div>
            </div>

            {/* ── Metrics ── */}
            <div className="infer-metrics">
                <div className="infer-metric">
                    <span className="infer-metric-label">⏱ Inference Time</span>
                    <span className="infer-metric-value">{inferenceInfo.inference_time_s}s</span>
                </div>
                <div className="infer-metric">
                    <span className="infer-metric-label">🎯 Confidence</span>
                    <span className="infer-metric-value">{(diagnosis.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="infer-metric">
                    <span className="infer-metric-label">🫀 Artery</span>
                    <span className="infer-metric-value artery-highlight">{diagnosis.artery_id}</span>
                </div>
                <div className="infer-metric">
                    <span className="infer-metric-label">🚨 Urgency</span>
                    <span className={`infer-metric-value urgency-${diagnosis.urgency?.toLowerCase()}`}>
                        {diagnosis.urgency}
                    </span>
                </div>
            </div>

            {/* ── Confidence bar ── */}
            <div className="infer-conf-bar-wrap">
                <div className="infer-conf-label">
                    <span>Model Confidence</span>
                    <span>{(diagnosis.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="infer-conf-bar">
                    <div
                        className="infer-conf-fill"
                        style={{
                            width: `${diagnosis.confidence * 100}%`,
                            background: diagnosis.confidence > 0.9
                                ? "linear-gradient(90deg,#4ade80,#16a34a)"
                                : diagnosis.confidence > 0.75
                                    ? "linear-gradient(90deg,#fbbf24,#d97706)"
                                    : "linear-gradient(90deg,#f87171,#b91c1c)",
                        }}
                    />
                </div>
            </div>

            {/* ── Upgrade prompt when in mock mode ── */}
            {isMock && (
                <div className="infer-upgrade-hint">
                    <span>🔓</span>
                    <div>
                        <p className="infer-upgrade-title">Switch to Real MedGemma</p>
                        <p className="infer-upgrade-text">
                            Set <code>MEDGEMMA_MOCK=false</code> in backend <code>.env</code> and run the Kaggle notebook
                            to see live inference from <strong>google/medgemma-4b-it</strong>.
                        </p>
                    </div>
                </div>
            )}

            {/* ── JSON Inspector Toggle ── */}
            <button className="infer-raw-toggle" onClick={() => setShowRaw((v) => !v)}>
                {showRaw ? "▲ Hide" : "▼ Show"} Raw Model Output (JSON)
            </button>

            {showRaw && (
                <div className="infer-json-block">
                    <div className="infer-json-toolbar">
                        <span className="infer-json-label">DiagnosisOutput — raw JSON</span>
                        <button
                            className="infer-copy-btn"
                            onClick={() => navigator.clipboard.writeText(JSON.stringify(diagnosis, null, 2))}
                        >
                            📋 Copy
                        </button>
                    </div>
                    <pre className="infer-json">{JSON.stringify(diagnosis, null, 2)}</pre>

                    {/* Inference metadata */}
                    <div className="infer-json-toolbar" style={{ marginTop: 8 }}>
                        <span className="infer-json-label">_meta — inference metadata</span>
                    </div>
                    <pre className="infer-json infer-json-meta">
                        {JSON.stringify(inferenceInfo, null, 2)}
                    </pre>
                </div>
            )}

            {/* ── Timestamp ── */}
            <p className="infer-timestamp">
                Analyzed at {new Date(inferenceInfo.timestamp).toLocaleTimeString()} ·{" "}
                {isMock ? "demo mode" : "live model"}
            </p>
        </div>
    );
}
