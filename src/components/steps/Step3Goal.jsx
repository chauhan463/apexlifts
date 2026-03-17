import { GOALS } from "../../constants";
import styles from "./Steps.module.css";

const DURATIONS = {
  "Lose fat": [
    { label: "Just starting",  weeks: 0  },
    { label: "1–4 weeks",      weeks: 2  },
    { label: "4–8 weeks",      weeks: 6  },
    { label: "8–12 weeks",     weeks: 10 },
    { label: "12+ weeks",      weeks: 14 },
  ],
  "Build muscle": [
    { label: "Just starting",  weeks: 0  },
    { label: "1–4 weeks",      weeks: 2  },
    { label: "4–8 weeks",      weeks: 6  },
    { label: "8–12 weeks",     weeks: 10 },
    { label: "12+ weeks",      weeks: 14 },
  ],
  "Recomposition": [
    { label: "Just starting",  weeks: 0  },
    { label: "1–8 weeks",      weeks: 4  },
    { label: "8–16 weeks",     weeks: 12 },
    { label: "16+ weeks",      weeks: 18 },
  ],
  "Maintain weight": [
    { label: "Just starting",     weeks: 0  },
    { label: "1–4 weeks",         weeks: 2  },
    { label: "1–3 months",        weeks: 8  },
    { label: "3–6 months",        weeks: 18 },
    { label: "6+ months",         weeks: 28 },
  ],
  "Improve performance": [
    { label: "Just starting",  weeks: 0  },
    { label: "1–4 weeks",      weeks: 2  },
    { label: "4–8 weeks",      weeks: 6  },
    { label: "8–12 weeks",     weeks: 10 },
    { label: "12+ weeks",      weeks: 14 },
  ],
};

const WEIGHT_LABEL = {
  "Lose fat":            { label: "Weight lost so far (kg)", hint: "e.g. 3" },
  "Build muscle":        { label: "Weight gained so far (kg)", hint: "e.g. 2" },
  "Recomposition":       null,
  "Maintain weight":     null,
  "Improve performance": null,
};

const PHASE_QUESTIONS = {
  "Lose fat":            "⏱ How long have you been cutting?",
  "Build muscle":        "⏱ How long have you been bulking?",
  "Recomposition":       "⏱ How long have you been recomping?",
  "Maintain weight":     "⏱ How long have you been in maintenance?",
  "Improve performance": "⏱ How long have you been in this performance phase?",
};

export default function Step3Goal({ form, onChange, onSubmit, onBack, loading, error }) {
  const durations  = form.goal ? DURATIONS[form.goal] : null;
  const weightMeta = form.goal ? WEIGHT_LABEL[form.goal] : null;
  const canProceed = form.goal && form.cutDuration !== undefined;

  return (
    <>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Step 3 of 3 — Your Goal</div>
        <h2 className={styles.title}>What are you training for?</h2>
        <p className={styles.sub}>
          This shapes your calorie target. Be honest — it changes the numbers significantly.
        </p>
      </div>

      <div className="card">
        {/* Goal selection */}
        <div className={styles.goalList}>
          {GOALS.map((g) => (
            <div
              key={g.label}
              className={`${styles.goalCard}${form.goal === g.label ? ` ${styles.goalActive}` : ""}`}
              onClick={() => {
                onChange("goal", g.label);
                onChange("cutDuration", undefined);
                onChange("weightLost", "");
              }}
            >
              <span className={styles.goalIcon}>{g.icon}</span>
              <div>
                <div className={styles.goalName}>{g.label}</div>
                <div className={styles.goalDesc}>{g.desc}</div>
              </div>
              <div className={styles.goalRadio} />
            </div>
          ))}
        </div>

        {/* Duration question — shown for all goals once selected */}
        {form.goal && durations && (
          <div className={styles.deficitSection}>
            <div className={styles.deficitLabel}>
              {PHASE_QUESTIONS[form.goal]}
            </div>
            <p className={styles.deficitSub}>
              Helps us give you phase-specific recommendations based on sports science research.
            </p>
            <div className="pills">
              {durations.map((d) => (
                <div
                  key={d.label}
                  className={`pill${form.cutDuration === d.weeks ? " active" : ""}`}
                  onClick={() => onChange("cutDuration", d.weeks)}
                >
                  {d.label}
                </div>
              ))}
            </div>

            {/* Weight change input — only for lose fat / build muscle */}
            {weightMeta && form.cutDuration > 0 && (
              <div className="field" style={{ marginTop: 14 }}>
                <label>
                  {weightMeta.label} <span>optional — improves accuracy</span>
                </label>
                <input
                  type="number"
                  placeholder={weightMeta.hint}
                  min={0} max={50} step={0.5}
                  value={form.weightLost || ""}
                  onChange={(e) => onChange("weightLost", e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        <button
          className="btn btn-primary"
          disabled={!canProceed || loading}
          onClick={onSubmit}
        >
          {loading ? "Calculating…" : "Calculate my numbers →"}
        </button>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>
    </>
  );
}