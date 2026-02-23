export const ARTERY_MAP = {
  LAD: {
    label: "Left Anterior Descending Artery",
    shortLabel: "LAD",
    description: "Supplies the front and left side of the heart. Known as the 'widow maker' artery.",
    meshName: "LAD",
    color: "#ff2d55",
    glowColor: "#ff0040",
    interventionId: "stent_lad",
    position: [0, 0.2, 0.3],
  },
  RCA: {
    label: "Right Coronary Artery",
    shortLabel: "RCA",
    description: "Supplies the right ventricle and inferior wall of the left ventricle.",
    meshName: "RCA",
    color: "#ff6b35",
    glowColor: "#ff4500",
    interventionId: "stent_rca",
    position: [0.3, 0, 0],
  },
  LCX: {
    label: "Left Circumflex Artery",
    shortLabel: "LCX",
    description: "Wraps around the left side of the heart, supplying the lateral and posterior walls.",
    meshName: "LCX",
    color: "#bf5af2",
    glowColor: "#9900ff",
    interventionId: "stent_lcx",
    position: [-0.3, 0, 0],
  },
};

export const URGENCY_CONFIG = {
  Immediate: { color: "#ff2d55", bg: "rgba(255,45,85,0.15)", label: "🚨 Immediate", badge: "CRITICAL" },
  Urgent:    { color: "#ff9f0a", bg: "rgba(255,159,10,0.15)", label: "⚠️ Urgent",    badge: "URGENT" },
  Elective:  { color: "#30d158", bg: "rgba(48,209,88,0.15)",  label: "✓ Elective",  badge: "STABLE" },
};
