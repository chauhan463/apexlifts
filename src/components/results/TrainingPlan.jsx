import { useState } from "react";
import { DAYS, PLAN_STORAGE_KEY } from "../../constants";
import { loadPlan } from "../../utils/trainingPlan";
import styles from "./TrainingPlan.module.css";

// Static training templates by goal
const TEMPLATES = {
  "Lose fat": {
    push:  { name: "Push — Chest & Shoulders", exercises: ["Bench Press 4×8", "Overhead Press 3×10", "Incline Dumbbell Press 3×10", "Lateral Raises 3×15", "Tricep Pushdown 3×12"] },
    pull:  { name: "Pull — Back & Biceps",     exercises: ["Barbell Row 4×8", "Lat Pulldown 3×10", "Seated Cable Row 3×12", "Face Pulls 3×15", "Barbell Curl 3×10"] },
    legs:  { name: "Legs — Squat Focus",       exercises: ["Squat 4×8", "Romanian Deadlift 3×10", "Leg Press 3×12", "Walking Lunges 3×12", "Calf Raises 4×15"] },
    upper: { name: "Upper Body",               exercises: ["Bench Press 3×8", "Barbell Row 3×8", "Overhead Press 3×10", "Lat Pulldown 3×10", "Dumbbell Curl 3×12"] },
    lower: { name: "Lower Body",               exercises: ["Squat 4×8", "Romanian Deadlift 3×10", "Leg Curl 3×12", "Step-Ups 3×10", "Calf Raises 4×15"] },
    full:  { name: "Full Body",                exercises: ["Squat 3×8", "Bench Press 3×8", "Barbell Row 3×8", "Overhead Press 3×10", "Romanian Deadlift 3×10"] },
  },
  "Build muscle": {
    push:  { name: "Push — Chest & Shoulders", exercises: ["Bench Press 4×6", "Incline Press 4×8", "Overhead Press 3×8", "Cable Fly 3×12", "Skull Crushers 3×10"] },
    pull:  { name: "Pull — Back & Biceps",     exercises: ["Weighted Pull-Ups 4×6", "Barbell Row 4×8", "Chest-Supported Row 3×10", "Hammer Curl 3×10", "Rear Delt Fly 3×15"] },
    legs:  { name: "Legs — Hypertrophy",       exercises: ["Squat 4×8", "Hack Squat 3×10", "Romanian Deadlift 4×8", "Leg Extension 3×15", "Leg Curl 3×12"] },
    upper: { name: "Upper Hypertrophy",        exercises: ["Bench Press 4×8", "Weighted Pull-Ups 4×6", "Overhead Press 3×10", "Cable Row 3×12", "Incline Curl 3×10"] },
    lower: { name: "Lower Hypertrophy",        exercises: ["Squat 4×8", "Romanian Deadlift 4×8", "Leg Press 4×12", "Leg Curl 3×12", "Calf Raises 5×15"] },
    full:  { name: "Full Body Hypertrophy",    exercises: ["Squat 3×8", "Bench Press 3×8", "Weighted Pull-Ups 3×6", "Overhead Press 3×10", "Romanian Deadlift 3×10"] },
  },
};

/**
 * Day-count → split pattern.
 *
 * Chosen to hit each muscle group ≥2×/week wherever the day count allows —
 * training frequency is a bigger hypertrophy driver than session volume once
 * weekly sets are held constant (Schoenfeld, Ogborn & Krieger, Sports Med 2016).
 * A 3-day Push/Pull/Legs split (each muscle trained once/week) is a common
 * beginner default but is the *lowest*-frequency option at that day count —
 * Upper/Lower or Full Body both roughly double effective frequency for the
 * same weekly volume, so those are preferred here.
 */
const SEQUENCES = {
  1: ["full"],                                                  // Full Body — only one session/week, nothing to rotate
  2: ["upper", "lower"],                                        // U/L — max frequency achievable at 2 days (1×/muscle)
  3: ["full", "full", "full"],                                  // Full Body every other day — 3×/week per muscle
  4: ["upper", "lower", "upper", "lower"],                      // U/L/U/L — 2×/week per muscle
  5: ["push", "pull", "legs", "upper", "lower"],                // PPL + U/L — chest/back/shoulders/legs all 2×/week
  6: ["push", "pull", "legs", "push", "pull", "legs"],          // PPL ×2 — every muscle 2×/week
  7: ["push", "pull", "legs", "push", "pull", "legs", "full"],  // PPL ×2 + a Full Body top-up day
};

const SEQUENCE_LABELS = {
  1: "Full Body",
  2: "Upper / Lower",
  3: "Full Body — every other day",
  4: "Upper / Lower / Upper / Lower",
  5: "Push / Pull / Legs / Upper / Lower",
  6: "Push / Pull / Legs ×2",
  7: "Push / Pull / Legs ×2 + Full Body",
};

// Assign workout types to selected days
const buildPlan = (selectedDays, goal) => {
  const template = TEMPLATES[goal] || TEMPLATES["Build muscle"];
  const n = selectedDays.length;
  const seq = SEQUENCES[n] || SEQUENCES[3];
  return selectedDays.map((day, i) => ({
    day,
    session: template[seq[i]] || template.full,
  }));
};

export default function TrainingPlan({ form, results }) {
  const [selectedDays, setSelectedDays] = useState(() => loadPlan(form.goal)?.selectedDays || []);
  const [plan, setPlan]                 = useState(() => loadPlan(form.goal)?.sessions || null);

  const toggleDay = (d) =>
    setSelectedDays((ds) =>
      ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]
    );

  const generate = () => {
    if (!selectedDays.length) return;
    // Sort days in Mon→Sun order
    const ordered = DAYS.filter(d => selectedDays.includes(d));
    const sessions = buildPlan(ordered, form.goal);
    setPlan(sessions);
    try {
      localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify({
        goal: form.goal, selectedDays: ordered, sessions, builtAt: Date.now(),
      }));
    } catch { /* storage unavailable */ }
  };

  return (
    <div>
      <div className="section-label">Training split</div>
      <p className={styles.desc}>
        Select your available days and get a personalised weekly plan built around your goal.
      </p>

      <div className={styles.dayGrid}>
        {DAYS.map((d) => (
          <div
            key={d}
            className={`${styles.dayBtn}${selectedDays.includes(d) ? ` ${styles.dayOn}` : ""}`}
            onClick={() => toggleDay(d)}
          >
            {d}
            <span className={styles.dayCheck}>
              {selectedDays.includes(d) ? "✓" : "+"}
            </span>
          </div>
        ))}
      </div>

      {selectedDays.length > 0 && (
        <p className={styles.patternHint}>{SEQUENCE_LABELS[selectedDays.length]}</p>
      )}

      <button
        className="btn btn-primary btn-sm"
        disabled={!selectedDays.length}
        onClick={generate}
      >
        {`Build ${selectedDays.length ? selectedDays.length + "-day" : ""} split →`}
      </button>

      {plan && (
        <div className={styles.planOut}>
          <div className={styles.planLabel}>{SEQUENCE_LABELS[plan.length] || ""}</div>
          {plan.map(({ day, session }) => (
            <div className={styles.planDay} key={day}>
              <div className={styles.planDayName}>{day} — <span>{session.name}</span></div>
              <ul className={styles.planExList}>
                {session.exercises.map((ex) => (
                  <li key={ex}>{ex}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}