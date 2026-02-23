import { useState, useCallback } from "react";
import { SAMPLE_SCENARIOS } from "../data/sampleScenarios";

const API_BASE = "http://localhost:8000/api";
const USE_MOCK = true; // set false when backend is running

export function useCardiacAI() {
    const [diagnosis, setDiagnosis] = useState(null);
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(false);
    const [explaining, setExplaining] = useState(false);
    const [error, setError] = useState(null);
    const [activeScenario, setActiveScenario] = useState(null);
    const [inferenceInfo, setInferenceInfo] = useState(null); // { mock, model_id, inference_time_s, ... }

    const analyze = useCallback(async (formData, scenarioMock = null) => {
        setLoading(true);
        setError(null);
        setDiagnosis(null);
        setExplanation("");
        setInferenceInfo(null);
        const t0 = performance.now();
        try {
            if (USE_MOCK && scenarioMock) {
                await new Promise((r) => setTimeout(r, 1800)); // realistic delay
                const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
                setInferenceInfo({
                    mock: true,
                    model_id: null,
                    inference_time_s: parseFloat(elapsed),
                    quantization: null,
                    timestamp: new Date().toISOString(),
                });
                setDiagnosis(scenarioMock);
            } else {
                const res = await fetch(`${API_BASE}/analyze`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error(`Server error: ${res.status}`);
                const data = await res.json();
                // Separate _meta from the diagnosis payload
                const { _meta, ...diagnosisData } = data;
                setInferenceInfo(_meta || null);
                setDiagnosis(diagnosisData);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const explain = useCallback(async (diagnosisData, audience = "patient", mockText = "") => {
        setExplaining(true);
        try {
            if (USE_MOCK && mockText) {
                // Simulate typewriter — chunk delivery
                setExplanation("");
                const words = mockText.split(" ");
                for (let i = 0; i < words.length; i++) {
                    await new Promise((r) => setTimeout(r, 35));
                    setExplanation((prev) => prev + (i === 0 ? "" : " ") + words[i]);
                }
            } else {
                const res = await fetch(`${API_BASE}/explain`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...diagnosisData, audience }),
                });
                const data = await res.json();
                setExplanation(data.explanation);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setExplaining(false);
        }
    }, []);

    const loadScenario = useCallback((scenarioId) => {
        const s = SAMPLE_SCENARIOS.find((sc) => sc.id === scenarioId);
        setActiveScenario(s || null);
        return s;
    }, []);

    const reset = useCallback(() => {
        setDiagnosis(null);
        setExplanation("");
        setError(null);
        setActiveScenario(null);
        setInferenceInfo(null);
    }, []);

    return {
        diagnosis, explanation, loading, explaining, error, activeScenario,
        inferenceInfo,
        analyze, explain, loadScenario, reset,
        scenarios: SAMPLE_SCENARIOS,
    };
}
