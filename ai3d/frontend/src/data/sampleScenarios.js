export const SAMPLE_SCENARIOS = [
    {
        id: "stemi_lad",
        label: "🚨 STEMI — Anterior (LAD)",
        description: "52-year-old male, crushing chest pain 2 hours",

        // Real-world context for judges
        realWorld: {
            patientName: "Rajesh Kumar, 52",
            setting: "Rural PHC, Rajasthan — 80 km from nearest cardiologist",
            stakes: "Without CardioSim AI: PHC doctor has no specialist to call, no imaging, patchy internet. Likely delays referral. Rajesh's LAD blocks completely. Without timely PCI, 35% of anterior wall myocardium is lost permanently.",
            withTool: "With CardioSim AI: diagnosis in 90 seconds, offline, zero data upload. Doctor activates ambulance with confirmed STEMI + target hospital pre-alerted. Door-to-balloon time cut by an estimated 45 minutes.",
            sourceNote: "Clinical scenario adapted from ICMR Rural Cardiac Care Report 2023.",
        },

        input: {
            chest_pain_duration: 120,
            ecg_findings: "ST elevation V1-V4, LBBB pattern",
            troponin_level: 4.8,
            age: 52,
            risk_factors: ["hypertension", "smoking", "hypercholesterolaemia"],
            symptoms: "Crushing central chest pain radiating to left arm, diaphoresis, nausea",
        },
        mockDiagnosis: {
            diagnosis: "STEMI (ST-Elevation Myocardial Infarction)",
            affected_region: "Left Anterior Descending artery (proximal segment)",
            artery_id: "LAD",
            urgency: "Immediate",
            recommended_intervention: "Primary PCI with drug-eluting stent placement within 90 minutes",
            reasoning: "Acute chest pain >60 min + ST elevation in V1-V4 + markedly elevated troponin (4.8 ng/mL) strongly indicate proximal LAD occlusion — the 'widow maker'. Immediate cath-lab activation required per AHA/ACC STEMI guidelines.",
            confidence: 0.97,
        },
        mockExplanationPatient:
            "Your heart has a blocked artery called the LAD — one of the most important blood vessels supplying your heart muscle. This blockage starved part of your heart of oxygen, causing your chest pain. Doctors will perform a quick procedure called a stent, where a tiny metal mesh tube is gently placed inside the blocked artery to push it open and restore blood flow. Most people feel much better within hours of this procedure.",
        mockExplanationClinician:
            "Diagnosis: STEMI with proximal LAD occlusion (proximal to first diagonal). TIMI-3 flow absent. Recommend emergent coronary angiography + primary PCI. Initiate dual antiplatelet therapy (aspirin 300mg + ticagrelor 180mg loading dose), anticoagulation with UFH, and oxygen if sats <94%. Target door-to-balloon <90 min. Consider GP IIb/IIIa inhibitor if large thrombus burden.",
    },
    {
        id: "nstemi_rca",
        label: "⚠️ NSTEMI — Inferior (RCA)",
        description: "67-year-old female, atypical chest tightness",

        realWorld: {
            patientName: "Meena Devi, 67",
            setting: "District hospital, Bihar — no on-call cardiologist after 6 PM",
            stakes: "Without CardioSim AI: atypical presentation in elderly diabetic woman — often misattributed to GERD or anxiety. Missed NSTEMI. Silent RCA occlusion progresses overnight.",
            withTool: "With CardioSim AI: AI flags elevated troponin + inferior ST changes. Urgency classified. On-call physician initiates DAPT and calls duty cardiologist with structured referral note.",
            sourceNote: "Atypical MI presentations in women: Lichtman et al., JAMA Internal Medicine 2018.",
        },

        input: {
            chest_pain_duration: 45,
            ecg_findings: "ST depression II, III, aVF with dynamic T-wave changes",
            troponin_level: 1.2,
            age: 67,
            risk_factors: ["diabetes", "obesity"],
            symptoms: "Atypical chest tightness, dyspnoea on exertion, mild diaphoresis",
        },
        mockDiagnosis: {
            diagnosis: "NSTEMI (Non-ST-Elevation Myocardial Infarction)",
            affected_region: "Right Coronary Artery (mid segment)",
            artery_id: "RCA",
            urgency: "Urgent",
            recommended_intervention: "Early invasive strategy: coronary angiography within 24h; likely PCI vs CABG discussion",
            reasoning: "Elevated troponin (1.2 ng/mL) with ST depression in inferior leads (II, III, aVF) and dynamic T-wave changes indicate partial RCA occlusion causing myocardial injury without full-thickness infarction. High-risk GRACE score warrants early invasive management.",
            confidence: 0.91,
        },
        mockExplanationPatient:
            "One of the blood vessels on the right side of your heart is partially blocked. Unlike a full heart attack, blood is still getting through, but not enough — which is why you felt tightness in your chest. Doctors will look inside the artery with a special camera and most likely place a small metal tube called a stent to open it fully. This is a planned procedure done within the next day while you are closely monitored.",
        mockExplanationClinician:
            "NSTEMI with culprit RCA territory (inferior ST changes). GRACE score likely intermediary-to-high. Initiate DAPT (aspirin + ticagrelor), anticoagulation (fondaparinux or enoxaparin), and beta-blocker if haemodynamically stable. Plan coronary angiography within 24h. Posterior MI involvement (R-sided leads) should be excluded. Echo for wall motion abnormality assessment.",
    },
    {
        id: "angina_lcx",
        label: "✓ Unstable Angina — Lateral (LCX)",
        description: "44-year-old male, exertional chest pain at rest",

        realWorld: {
            patientName: "Arun Sharma, 44",
            setting: "Urban community clinic, Tamil Nadu — GP without cardiology training",
            stakes: "Without CardioSim AI: young male with 'atypical' chest pain sent home with antacids. LCX ischaemia missed. Returns 48 hours later in full STEMI.",
            withTool: "With CardioSim AI: LCX territory ischaemia flagged as Urgent. GP initiates aspirin + nitrates, orders serial troponins, and arranges next-day cardiology review — preventing escalation.",
            sourceNote: "Missed ACS in younger adults: Pope et al., NEJM 2000; updated NICE ACS Guidelines 2023.",
        },

        input: {
            chest_pain_duration: 20,
            ecg_findings: "Transient T-wave inversion V4-V6, lateral leads",
            troponin_level: 0.1,
            age: 44,
            risk_factors: ["family_history", "stress"],
            symptoms: "Squeezing chest pain at rest, partially relieved by GTN spray",
        },
        mockDiagnosis: {
            diagnosis: "Unstable Angina",
            affected_region: "Left Circumflex artery (distal branch)",
            artery_id: "LCX",
            urgency: "Urgent",
            recommended_intervention: "Medical stabilisation; elective coronary angiography within 72h",
            reasoning: "Rest angina with transient lateral T-wave changes but normal troponin (0.1 ng/mL) is consistent with demand ischaemia in the LCX territory without myocardial necrosis. Risk-stratify with GRACE/TIMI score. GTN-responsive symptoms suggest vasospasm component.",
            confidence: 0.87,
        },
        mockExplanationPatient:
            "Your heart is not getting enough blood in certain moments, especially the left side. This is called 'unstable angina' — it's a warning signal before a full blockage occurs. Your arteries have partial narrowing but haven't blocked completely yet. Doctors will give you medications to prevent it from worsening and will schedule a procedure to look inside your heart arteries and fix any narrowing found.",
        mockExplanationClinician:
            "Unstable angina, LCX territory. ACS without troponin rise — likely demand ischaemia or vasospasm. Initiate aspirin, nitrates, and beta-blocker. Consider calcium channel blocker if vasospastic component suspected. Coronary angiography within 72h (elective invasive pathway). Low threshold for reclassification to NSTEMI pending serial troponins at 3h and 6h.",
    },
];
