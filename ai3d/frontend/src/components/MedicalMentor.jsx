import { useState, useEffect, useRef } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/**
 * MedicalMentor — AI-powered step-by-step operational guide for medical students.
 * Powered by Gemini Flash via the /api/mentor backend endpoint.
 *
 * Props:
 *   diagnosis      — DiagnosisOutput object
 *   currentStep    — string: "blocked" | "guide" | "balloon" | "stent" | "flow"
 *   visible        — boolean
 */
export default function MedicalMentor({ diagnosis, currentStep, visible }) {
    const [guidance, setGuidance] = useState("");
    const [safetyChecks, setSafetyChecks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [askLoading, setAskLoading] = useState(false);
    const [aiUsed, setAiUsed] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const chatEndRef = useRef(null);

    // Auto-load guidance when step changes
    useEffect(() => {
        if (!visible || !diagnosis || !currentStep) return;
        loadGuidance(currentStep, "");
        setChatHistory([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStep, visible, diagnosis]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    async function loadGuidance(step, q) {
        const setter = q ? setAskLoading : setLoading;
        setter(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/mentor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    diagnosis: diagnosis.diagnosis,
                    affected_region: diagnosis.affected_region,
                    artery_id: diagnosis.artery_id,
                    urgency: diagnosis.urgency,
                    recommended_intervention: diagnosis.recommended_intervention,
                    current_step: step,
                    question: q,
                }),
            });
            if (!res.ok) throw new Error("Backend error");
            const data = await res.json();
            if (q) {
                setChatHistory((h) => [
                    ...h,
                    { role: "student", text: q },
                    { role: "ai", text: data.guidance },
                ]);
            } else {
                setGuidance(data.guidance);
                setSafetyChecks(data.safety_checks || []);
                setAiUsed(data.ask_ai);
            }
        } catch {
            const fallback = "⚠️ AI guide offline. Follow hospital STEMI protocol. Call cardiology immediately.";
            if (q) {
                setChatHistory((h) => [
                    ...h,
                    { role: "student", text: q },
                    { role: "ai", text: fallback },
                ]);
            } else {
                setGuidance(fallback);
            }
        } finally {
            setter(false);
        }
    }

    const handleAsk = (e) => {
        e.preventDefault();
        if (!question.trim() || askLoading) return;
        const q = question.trim();
        setQuestion("");
        loadGuidance(currentStep, q);
    };

    const quickQuestions = [
        "What drugs should I give right now?",
        "What are the signs of complications?",
        "How do I know this step was successful?",
        "What if the patient deteriorates?",
    ];

    if (!visible || !diagnosis) return null;

    return (
        <div className={`mentor-panel glass-card animate-in ${expanded ? "mentor-expanded" : "mentor-collapsed"}`}>
            {/* Header */}
            <div className="mentor-header" onClick={() => setExpanded((v) => !v)}>
                <div className="mentor-title-row">
                    <span className="mentor-icon">🧑‍⚕️</span>
                    <div>
                        <p className="mentor-title">AI Medical Mentor</p>
                        <p className="mentor-subtitle">
                            {aiUsed ? "Powered by Gemini Flash" : "Clinical Protocol Engine"}
                        </p>
                    </div>
                    <span className={`mentor-badge ${aiUsed ? "mentor-badge-ai" : "mentor-badge-mock"}`}>
                        {aiUsed ? "GEMINI" : "PROTOCOL"}
                    </span>
                    <button className="mentor-toggle-btn">{expanded ? "▲" : "▼"}</button>
                </div>
            </div>

            {expanded && (
                <>
                    {/* Guidance text */}
                    <div className="mentor-guidance-box">
                        {loading ? (
                            <div className="mentor-loading">
                                <div className="mentor-spinner" />
                                <span>AI is generating guidance…</span>
                            </div>
                        ) : (
                            <pre className="mentor-guidance-text">{guidance}</pre>
                        )}
                    </div>

                    {/* Safety checks */}
                    {safetyChecks.length > 0 && (
                        <div className="mentor-safety">
                            <p className="mentor-safety-title">⚠️ Critical Safety Checks</p>
                            <ul className="mentor-safety-list">
                                {safetyChecks.map((s, i) => (
                                    <li key={i} className="mentor-safety-item">
                                        <span className="mentor-safety-dot" />
                                        {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Quick questions */}
                    <div className="mentor-quick-questions">
                        <p className="mentor-quick-label">Quick ask:</p>
                        <div className="mentor-quick-chips">
                            {quickQuestions.map((q) => (
                                <button
                                    key={q}
                                    className="mentor-chip"
                                    onClick={() => {
                                        setQuestion(q);
                                        loadGuidance(currentStep, q);
                                    }}
                                    disabled={askLoading}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Chat history */}
                    {chatHistory.length > 0 && (
                        <div className="mentor-chat">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`mentor-msg mentor-msg-${msg.role}`}>
                                    <span className="mentor-msg-icon">
                                        {msg.role === "student" ? "🎓" : "🤖"}
                                    </span>
                                    <p className="mentor-msg-text">{msg.text}</p>
                                </div>
                            ))}
                            {askLoading && (
                                <div className="mentor-msg mentor-msg-ai">
                                    <span className="mentor-msg-icon">🤖</span>
                                    <div className="mentor-typing">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                    )}

                    {/* Question input */}
                    <form className="mentor-ask-form" onSubmit={handleAsk}>
                        <input
                            className="mentor-ask-input"
                            type="text"
                            placeholder="Ask the AI mentor anything about this step…"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            disabled={askLoading}
                        />
                        <button
                            type="submit"
                            className="mentor-ask-btn"
                            disabled={askLoading || !question.trim()}
                        >
                            {askLoading ? "…" : "Ask"}
                        </button>
                    </form>

                    <p className="mentor-disclaimer">
                        🔬 Educational simulation only — always defer to qualified clinicians.
                    </p>
                </>
            )}
        </div>
    );
}
