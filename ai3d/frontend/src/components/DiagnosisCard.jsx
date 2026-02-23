import { URGENCY_CONFIG, ARTERY_MAP } from "../utils/heartAnnotations";
import { ShieldCheck, Stethoscope, Brain, Clock } from "lucide-react";

export default function DiagnosisCard({ diagnosis, onSimulate, onExplain }) {
    if (!diagnosis) return null;
    const urg = URGENCY_CONFIG[diagnosis.urgency] || URGENCY_CONFIG.Urgent;
    const artery = ARTERY_MAP[diagnosis.artery_id];

    return (
        <div className="diagnosis-card glass-card animate-in">
            <div className="panel-header">
                <Brain size={18} className="icon-accent" />
                <h2>AI Diagnosis</h2>
                <span className="confidence-badge">
                    {Math.round((diagnosis.confidence || 0.92) * 100)}% confidence
                </span>
            </div>

            {/* Urgency banner */}
            <div className="urgency-banner" style={{ background: urg.bg, borderColor: urg.color }}>
                <span className="urgency-label" style={{ color: urg.color }}>{urg.label}</span>
                <span className="urgency-badge" style={{ background: urg.color }}>{urg.badge}</span>
            </div>

            {/* Diagnosis */}
            <div className="diag-section">
                <Stethoscope size={14} className="field-icon" />
                <div>
                    <p className="field-label">Diagnosis</p>
                    <p className="field-value diagnosis-name">{diagnosis.diagnosis}</p>
                </div>
            </div>

            {/* Affected artery */}
            <div className="diag-section">
                <div className="artery-dot" style={{ background: artery?.color || "#ff2d55" }} />
                <div>
                    <p className="field-label">Affected Region</p>
                    <p className="field-value" style={{ color: artery?.color }}>{diagnosis.affected_region}</p>
                    {artery && <p className="field-sub">{artery.description}</p>}
                </div>
            </div>

            {/* Intervention */}
            <div className="diag-section">
                <ShieldCheck size={14} className="field-icon" />
                <div>
                    <p className="field-label">Recommended Intervention</p>
                    <p className="field-value">{diagnosis.recommended_intervention}</p>
                </div>
            </div>

            {/* Reasoning */}
            <div className="reasoning-box">
                <p className="field-label">Clinical Reasoning</p>
                <p className="reasoning-text">{diagnosis.reasoning}</p>
            </div>

            {/* Action buttons */}
            <div className="card-actions">
                <button className="btn-primary" onClick={onSimulate}>
                    🔬 Simulate Intervention
                </button>
                <button className="btn-secondary" onClick={() => onExplain("patient")}>
                    👤 Explain to Patient
                </button>
                <button className="btn-secondary" onClick={() => onExplain("clinician")}>
                    🩺 Clinician View
                </button>
            </div>

            <div className="disclaimer">
                ⚠️ Educational tool only. Not a substitute for clinical judgment.
            </div>
        </div>
    );
}
