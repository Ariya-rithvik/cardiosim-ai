import { useState } from "react";
import { SAMPLE_SCENARIOS } from "../data/sampleScenarios";
import { Activity, User, Zap, AlertCircle } from "lucide-react";

const RISK_FACTORS = [
    { id: "hypertension", label: "Hypertension" },
    { id: "diabetes", label: "Diabetes" },
    { id: "smoking", label: "Smoking" },
    { id: "hypercholesterolaemia", label: "High Cholesterol" },
    { id: "obesity", label: "Obesity" },
    { id: "family_history", label: "Family History" },
    { id: "stress", label: "Stress" },
];

const ECG_OPTIONS = [
    "ST elevation V1-V4",
    "ST elevation II, III, aVF",
    "ST depression II, III, aVF",
    "Transient T-wave inversion V4-V6",
    "LBBB pattern",
    "Normal sinus rhythm",
];

export default function InputPanel({ onAnalyze, onLoadScenario, loading }) {
    const [form, setForm] = useState({
        chest_pain_duration: 60,
        ecg_findings: ECG_OPTIONS[0],
        troponin_level: 1.0,
        age: 55,
        risk_factors: [],
        symptoms: "",
    });
    const [activeDemo, setActiveDemo] = useState(null);

    const toggleRisk = (id) => {
        setForm((f) => ({
            ...f,
            risk_factors: f.risk_factors.includes(id)
                ? f.risk_factors.filter((r) => r !== id)
                : [...f.risk_factors, id],
        }));
    };

    const handleScenario = (s) => {
        setActiveDemo(s.id);
        setForm(s.input);
        onLoadScenario(s);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAnalyze(form);
    };

    return (
        <div className="input-panel glass-card">
            <div className="panel-header">
                <Activity size={18} className="icon-accent" />
                <h2>Clinical Input</h2>
            </div>

            {/* Demo scenario buttons */}
            <div className="scenario-group">
                <p className="section-label">Load Demo Scenario</p>
                <div className="scenario-buttons">
                    {SAMPLE_SCENARIOS.map((s) => (
                        <button
                            key={s.id}
                            className={`scenario-btn ${activeDemo === s.id ? "active" : ""}`}
                            onClick={() => handleScenario(s)}
                            type="button"
                        >
                            <span className="scenario-label">{s.label}</span>
                            <span className="scenario-desc">{s.description}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="divider" />

            <form onSubmit={handleSubmit} className="clinical-form">
                {/* Age */}
                <div className="form-group">
                    <label>
                        <User size={13} /> Patient Age
                    </label>
                    <div className="slider-row">
                        <input
                            type="range" min={18} max={95} value={form.age}
                            onChange={(e) => setForm((f) => ({ ...f, age: +e.target.value }))}
                        />
                        <span className="slider-val">{form.age} yrs</span>
                    </div>
                </div>

                {/* Chest pain duration */}
                <div className="form-group">
                    <label>
                        <Zap size={13} /> Chest Pain Duration
                    </label>
                    <div className="slider-row">
                        <input
                            type="range" min={1} max={360} value={form.chest_pain_duration}
                            onChange={(e) => setForm((f) => ({ ...f, chest_pain_duration: +e.target.value }))}
                        />
                        <span className="slider-val">{form.chest_pain_duration} min</span>
                    </div>
                </div>

                {/* Troponin */}
                <div className="form-group">
                    <label>
                        <AlertCircle size={13} /> Troponin Level (ng/mL)
                    </label>
                    <div className="slider-row">
                        <input
                            type="range" min={0} max={10} step={0.1} value={form.troponin_level}
                            onChange={(e) => setForm((f) => ({ ...f, troponin_level: +e.target.value }))}
                        />
                        <span className={`slider-val ${form.troponin_level > 0.4 ? "val-danger" : "val-ok"}`}>
                            {form.troponin_level.toFixed(1)}
                        </span>
                    </div>
                </div>

                {/* ECG */}
                <div className="form-group">
                    <label>ECG Findings</label>
                    <select
                        value={form.ecg_findings}
                        onChange={(e) => setForm((f) => ({ ...f, ecg_findings: e.target.value }))}
                    >
                        {ECG_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                    </select>
                </div>

                {/* Symptoms */}
                <div className="form-group">
                    <label>Symptoms Description</label>
                    <textarea
                        rows={2}
                        placeholder="e.g. Crushing central chest pain, diaphoresis…"
                        value={form.symptoms}
                        onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))}
                    />
                </div>

                {/* Risk Factors */}
                <div className="form-group">
                    <label>Risk Factors</label>
                    <div className="risk-grid">
                        {RISK_FACTORS.map((r) => (
                            <label key={r.id} className={`risk-chip ${form.risk_factors.includes(r.id) ? "selected" : ""}`}>
                                <input type="checkbox" checked={form.risk_factors.includes(r.id)} onChange={() => toggleRisk(r.id)} hidden />
                                {r.label}
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" className={`analyze-btn ${loading ? "loading" : ""}`} disabled={loading}>
                    {loading ? (
                        <><span className="spinner" /> Analysing with MedGemma…</>
                    ) : (
                        "⚡ Run AI Analysis"
                    )}
                </button>
            </form>
        </div>
    );
}
