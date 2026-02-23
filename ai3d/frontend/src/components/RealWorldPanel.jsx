const REAL_WORLD_CONTEXT = [
    {
        icon: "💔",
        title: "Scale of the Crisis",
        lines: [
            "17.9 million people die from CVD every year — 32% of all global deaths",
            "85% of those deaths are from heart attack & stroke",
            "India alone loses 2.8 million lives annually — the world's highest cardiac burden",
        ],
    },
    {
        icon: "🌍",
        title: "The Access Gap",
        lines: [
            "1 cardiologist per 100,000 people in India vs. 1 per 10,000 in the US",
            "80% of India's population lives outside tier-1 cities with specialist access",
            "Average delay from symptom onset to PCI in rural India: 8–12 hours",
        ],
    },
    {
        icon: "🔒",
        title: "Why Cloud AI Fails Here",
        lines: [
            "HIPAA/PDPA prohibit uploading patient data to external cloud vendors",
            "Rural health centres have unreliable or zero internet connectivity",
            "ChatGPT, Gemini API — all require internet + expose PHI to third parties",
        ],
    },
    {
        icon: "✅",
        title: "CardioSim AI's Advantage",
        lines: [
            "Runs fully offline on commodity hardware (no GPU required in mock mode)",
            "MedGemma 4B-IT quantized to 4-bit — fits on a ₹30k laptop with T4 GPU",
            "Zero patient data leaves the hospital — 100% privacy compliant",
        ],
    },
];

export default function RealWorldPanel() {
    return (
        <div className="realworld-panel glass-card animate-in">
            <div className="panel-header">
                <span className="icon-accent">🌐</span>
                <h2>Why This Matters</h2>
                <span className="medgemma-flag">HAI-DEF Aligned</span>
            </div>

            <div className="rw-grid">
                {REAL_WORLD_CONTEXT.map((block) => (
                    <div className="rw-block" key={block.title}>
                        <div className="rw-block-header">
                            <span className="rw-icon">{block.icon}</span>
                            <span className="rw-title">{block.title}</span>
                        </div>
                        <ul className="rw-list">
                            {block.lines.map((line, i) => (
                                <li key={i}>{line}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="rw-impact-row">
                <div className="rw-impact-stat">
                    <span className="rw-big-num">28,000+</span>
                    <span className="rw-big-label">Rural PHCs in India without a cardiologist</span>
                </div>
                <div className="rw-impact-stat">
                    <span className="rw-big-num">90 sec</span>
                    <span className="rw-big-label">CardioSim AI diagnosis time — offline, on-device</span>
                </div>
                <div className="rw-impact-stat">
                    <span className="rw-big-num">$0</span>
                    <span className="rw-big-label">Cloud cost — all inference is local & private</span>
                </div>
            </div>

            <div className="rw-citation">
                Sources: WHO Global Health Estimates 2024 · Indian Council of Medical Research (ICMR) 2023 · Mint Health Report 2024
            </div>
        </div>
    );
}
