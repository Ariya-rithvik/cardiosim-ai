import { useState, useEffect } from "react";

const STATS = [
    { value: "17.9M", label: "annual cardiovascular deaths worldwide", icon: "💔" },
    { value: "80%", label: "of cardiac deaths occur in low/middle income countries", icon: "🌍" },
    { value: "28,000+", label: "rural PHCs in India with no cardiologist on staff", icon: "🏥" },
    { value: "4 hrs", label: "average travel time to nearest cardiac centre in rural India", icon: "🚗" },
    { value: "90 min", label: "door-to-balloon target — every minute costs heart muscle", icon: "⏱️" },
    { value: "€0", label: "cost to deploy CardioSim AI — runs on any laptop, offline", icon: "🔒" },
];

const PATIENT_STORY = {
    name: "Rajesh, 52",
    location: "Rural Primary Health Centre, Rajasthan, India",
    story:
        "Rajesh walks into the only clinic within 80km with crushing chest pain. The GP — trained in general medicine — has no cardiologist to call, no advanced imaging, and patchy internet. With CardioSim AI running locally on a ₹30,000 laptop, she enters his ECG findings and troponin result. In 90 seconds: structured STEMI diagnosis, the exact blocked artery highlighted on a 3D heart, and a stent procedure explained to Rajesh in plain Hindi. She calls the ambulance with a confirmed diagnosis and a referral note. Rajesh reaches the cath lab in time.",
};

export default function ImpactBanner({ onDismiss }) {
    const [statIdx, setStatIdx] = useState(0);
    const [visible, setVisible] = useState(true);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setAnimating(true);
            setTimeout(() => {
                setStatIdx((i) => (i + 1) % STATS.length);
                setAnimating(false);
            }, 300);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const stat = STATS[statIdx];

    return (
        <div className={`impact-banner ${visible ? "open" : "closed"}`}>
            <div className="impact-inner">
                {/* Left: scrolling stat */}
                <div className="impact-stat-block">
                    <div className={`stat-content ${animating ? "stat-exit" : "stat-enter"}`}>
                        <span className="stat-icon">{stat.icon}</span>
                        <span className="stat-value">{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="impact-vdivider" />

                {/* Center: patient story */}
                <div className="impact-story">
                    <div className="story-header">
                        <span className="story-badge">REAL-WORLD SCENARIO</span>
                        <span className="story-name">🧑‍🌾 {PATIENT_STORY.name} · {PATIENT_STORY.location}</span>
                    </div>
                    <p className="story-text">{PATIENT_STORY.story}</p>
                </div>

                {/* Right: CTA */}
                <div className="impact-cta">
                    <p className="cta-label">The problem CardioSim AI solves</p>
                    <div className="impact-pills">
                        <span className="pill pill-red">No cardiologist access</span>
                        <span className="pill pill-amber">No advanced imaging</span>
                        <span className="pill pill-blue">Strict data privacy</span>
                        <span className="pill pill-green">Offline deployment</span>
                    </div>
                    <button className="dismiss-btn" onClick={() => { setVisible(false); onDismiss?.(); }}>
                        Launch Visualizer →
                    </button>
                </div>
            </div>
        </div>
    );
}
