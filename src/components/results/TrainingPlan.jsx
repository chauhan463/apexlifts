import { useState } from "react";
import { DAYS } from "../../constants";
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

// Assign workout types to selected days
const buildPlan = (selectedDays, goal) => {
  const template = TEMPLATES[goal] || TEMPLATES["Build muscle"];
  const n = selectedDays.length;
  const sequences = {
    1: ["full"],
    2: ["upper", "lower"],
    3: ["push", "pull", "legs"],
    4: ["push", "pull", "legs", "upper"],
    5: ["push", "pull", "legs", "upper", "lower"],
    6: ["push", "pull", "legs", "push", "pull", "legs"],
    7: ["push", "pull", "legs", "upper", "lower", "full", "push"],
  };
  const seq = sequences[n] || sequences[3];
  return selectedDays.map((day, i) => ({
    day,
    session: template[seq[i]] || template.full,
  }));
};

export default function TrainingPlan({ form, results }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [plan, setPlan]                 = useState(null);

  const toggleDay = (d) =>
    setSelectedDays((ds) =>
      ds.includes(d) ? ds.filter((x) => x !== d) : [...ds, d]
    );

  const generate = () => {
    if (!selectedDays.length) return;
    // Sort days in Mon→Sun order
    const ordered = DAYS.filter(d => selectedDays.includes(d));
    setPlan(buildPlan(ordered, form.goal));
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

      <button
        className="btn btn-primary btn-sm"
        disabled={!selectedDays.length}
        onClick={generate}
      >
        {`Build ${selectedDays.length ? selectedDays.length + "-day" : ""} split →`}
      </button>

      {plan && (
        <div className={styles.planOut}>
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