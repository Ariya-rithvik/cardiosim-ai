import { useState } from "react";
import { useCardiacAI } from "./hooks/useCardiacAI";
import { useBackendMode } from "./hooks/useBackendMode";
import InputPanel from "./components/InputPanel";
import HeartViewer from "./components/HeartViewer";
import DiagnosisCard from "./components/DiagnosisCard";
import InterventionSimulator from "./components/InterventionSimulator";
import ExplanationPanel from "./components/ExplanationPanel";
import InferencePanel from "./components/InferencePanel";
import ImpactBanner from "./components/ImpactBanner";
import RealWorldPanel from "./components/RealWorldPanel";
import PatientStoryCard from "./components/PatientStoryCard";
import CPRGuide from "./components/CPRGuide";
import EmergencyPanel from "./components/EmergencyPanel";
import VideoGenerator from "./components/VideoGenerator";
import { Heart } from "lucide-react";
import "./styles/emergency.css";
import "./styles/video-generator.css";

export default function App() {
  const {
    diagnosis, explanation, loading, explaining, error, activeScenario,
    inferenceInfo,
    analyze, explain, loadScenario, reset,
  } = useCardiacAI();

  const { isBackendOnline, isRealAI, modelId, checking } = useBackendMode();

  const [showSimulator, setShowSimulator] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [activeTab, setActiveTab] = useState("visualizer");
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(true);
  const [showVideoGenerator, setShowVideoGenerator] = useState(false);

  const handleAnalyze = (formData) => {
    setShowSimulator(false);
    const mock = activeScenario?.mockDiagnosis || null;
    analyze(formData, mock);
    setActiveTab("visualizer");
  };

  const handleLoadScenario = (scenario) => {
    reset();
    setShowSimulator(false);
    loadScenario(scenario.id);
  };

  const handleExplain = (audience) => {
    if (!diagnosis) return;
    const mockText =
      audience === "patient"
        ? activeScenario?.mockExplanationPatient
        : activeScenario?.mockExplanationClinician;
    explain(diagnosis, audience, mockText || "");
  };

  return (
    <div className="app-root">
      {/* ── Impact Banner (full-screen intro) ── */}
      {showBanner && (
        <div className="banner-overlay">
          <ImpactBanner onDismiss={() => setShowBanner(false)} />
        </div>
      )}

      {/* ── Emergency Panel (Genie-powered, appears when urgency = "Immediate") ── */}
      {diagnosis?.urgency === "Immediate" && showEmergencyPanel && (
        <EmergencyPanel
          diagnosis={diagnosis}
          visible={true}
          onDismiss={() => setShowEmergencyPanel(false)}
        />
      )}

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-brand">
          <Heart size={26} className="brand-icon" fill="currentColor" />
          <div>
            <h1>CardioSim <span className="brand-ai">AI</span></h1>
            <p className="brand-sub">3D Cardiac Intervention Visualizer</p>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="header-nav">
          <button
            className={`nav-tab ${activeTab === "visualizer" ? "active" : ""}`}
            onClick={() => setActiveTab("visualizer")}
          >
            🫀 Visualizer
          </button>
          <button
            className={`nav-tab ${activeTab === "impact" ? "active" : ""}`}
            onClick={() => setActiveTab("impact")}
          >
            🌍 Why It Matters
          </button>
          <button
            className={`nav-tab ${activeTab === "videos" ? "active" : ""}`}
            onClick={() => setActiveTab("videos")}
          >
            🎬 Videos
          </button>
          <button
            className={`nav-tab nav-tab-emergency ${activeTab === "emergency" ? "active" : ""}`}
            onClick={() => setActiveTab("emergency")}
          >
            🚨 Emergency CPR
          </button>
        </nav>

        <div className="header-badges">
          {/* Backend / AI mode status */}
          {!checking && (
            isRealAI
              ? <span className="badge badge-real-ai" title={`Running: ${modelId}`}>🟢 Real MedGemma</span>
              : isBackendOnline
                ? <span className="badge badge-demo" title="Backend running in mock mode">🟡 Demo Mode</span>
                : <span className="badge badge-offline" title="Start the FastAPI backend">🔴 Backend Offline</span>
          )}
          <span className="badge badge-blue">MedGemma 4B-IT</span>
          <span className="badge badge-purple">Gemini Flash</span>
          <span className="badge badge-green">100% Offline</span>
        </div>
        {error && <div className="error-toast">⚠ {error}</div>}
      </header>

      {/* ── Impact Tab ── */}
      {activeTab === "impact" && (
        <div className="impact-tab-content">
          <RealWorldPanel />
        </div>
      )}

      {/* ── Video Generator Tab ── */}
      {activeTab === "videos" && (
        <div className="video-tab-content">
          <VideoGenerator diagnosis={diagnosis} visible={true} />
        </div>
      )}

      {/* ── Emergency CPR Tab ── */}
      {activeTab === "emergency" && (
        <div className="emergency-tab-content">
          <CPRGuide />
        </div>
      )}

      {/* ── Visualizer Tab ── */}
      {activeTab === "visualizer" && (
        <main className="app-layout">
          {/* Left: input */}
          <aside className="panel-left">
            <InputPanel
              onAnalyze={handleAnalyze}
              onLoadScenario={handleLoadScenario}
              loading={loading}
            />
            {/* Patient story appears under input after scenario load */}
            {activeScenario && (
              <PatientStoryCard scenario={activeScenario} />
            )}
          </aside>

          {/* Center: 3D viewer + stent sim */}
          <section className="panel-center">
            <HeartViewer diagnosis={diagnosis} />
            {showSimulator && (
              <InterventionSimulator
                diagnosis={diagnosis}
                visible={showSimulator}
              />
            )}
          </section>

          {/* Right: diagnosis + explanation */}
          <aside className="panel-right">
            {diagnosis ? (
              <>
                <DiagnosisCard
                  diagnosis={diagnosis}
                  onSimulate={() => setShowSimulator(true)}
                  onExplain={handleExplain}
                />
                <ExplanationPanel
                  explanation={explanation}
                  explaining={explaining}
                  onExplain={handleExplain}
                />
                <InferencePanel
                  diagnosis={diagnosis}
                  inferenceInfo={inferenceInfo}
                />
              </>
            ) : (
              <div className="right-placeholder glass-card">
                <div className="placeholder-icon">🫀</div>
                <h3>Awaiting Analysis</h3>
                <p>
                  Load a demo scenario or enter clinical parameters,
                  then click <strong>Run AI Analysis</strong>.
                </p>
                <div className="placeholder-steps">
                  <div className="step-hint">1 · Enter clinical data or load a scenario</div>
                  <div className="step-hint">2 · Click "Run AI Analysis"</div>
                  <div className="step-hint">3 · Watch the 3D heart respond</div>
                  <div className="step-hint">4 · Simulate the stent intervention</div>
                </div>
                <button
                  className="btn-secondary"
                  style={{ marginTop: "10px" }}
                  onClick={() => setActiveTab("impact")}
                >
                  🌍 See Why This Matters
                </button>
              </div>
            )}
          </aside>
        </main>
      )}

      {/* ── Footer ── */}
      <footer className="app-footer">
        <span>
          ⚠️ <strong>Educational & Research Tool Only</strong> — Not for clinical use.
          Always consult qualified medical professionals.
        </span>
        <span>MedGemma · Three.js · React · FastAPI · HAI-DEF Compliant</span>
      </footer>
    </div>
  );
}
