export default function PatientStoryCard({ scenario }) {
    if (!scenario?.realWorld) return null;
    const { patientName, setting, stakes, withTool, sourceNote } = scenario.realWorld;

    return (
        <div className="patient-story-card glass-card animate-in">
            <div className="story-card-header">
                <span className="story-card-icon">🧑‍⚕️</span>
                <div>
                    <p className="story-card-name">{patientName}</p>
                    <p className="story-card-setting">📍 {setting}</p>
                </div>
                <span className="story-source">{sourceNote}</span>
            </div>

            <div className="story-compare">
                <div className="compare-block compare-without">
                    <div className="compare-label">
                        <span className="compare-icon">❌</span>
                        Without CardioSim AI
                    </div>
                    <p>{stakes}</p>
                </div>
                <div className="compare-block compare-with">
                    <div className="compare-label">
                        <span className="compare-icon">✅</span>
                        With CardioSim AI
                    </div>
                    <p>{withTool}</p>
                </div>
            </div>
        </div>
    );
}
