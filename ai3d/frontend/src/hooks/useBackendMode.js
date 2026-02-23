import { useState, useEffect } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

/**
 * Polls the backend /health endpoint to detect:
 * - isBackendOnline: FastAPI server is running
 * - isRealAI: MEDGEMMA_MOCK=false and model is loaded
 */
export function useBackendMode() {
    const [status, setStatus] = useState({
        isBackendOnline: false,
        isRealAI: false,
        modelId: null,
        checking: true,
    });

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(2000) });
                if (!res.ok) throw new Error("not ok");
                const data = await res.json();
                setStatus({
                    isBackendOnline: true,
                    isRealAI: data.mock_mode === false,
                    modelId: data.model_id || null,
                    checking: false,
                });
            } catch {
                setStatus({ isBackendOnline: false, isRealAI: false, modelId: null, checking: false });
            }
        };

        check();
        const id = setInterval(check, 10000); // re-check every 10s
        return () => clearInterval(id);
    }, []);

    return { backendUrl: BACKEND_URL, ...status };
}
