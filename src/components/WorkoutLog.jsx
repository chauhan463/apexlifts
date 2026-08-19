import { useState, useEffect } from "react";
import { getTodayLabel, loadPlan, getTodaysSession, parseExercise } from "../utils/trainingPlan";
import { loadWorkoutLogs, todayISO, findLogForDate, findLastExerciseLog, saveWorkoutLog } from "../utils/workoutLog";
import styles from "./WorkoutLog.module.css";

export default function WorkoutLog({ profile, onBack }) {
  const { form } = profile;
  const unit = form.weightUnit;
  const todayLabel = getTodayLabel();
  const iso = todayISO();
  const dateLabel = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const plan    = loadPlan(form.goal);
  const session = getTodaysSession(plan, todayLabel);

  // Hydrated once, synchronously, from: today's own saved log (if re-opening) →
  // else last time's weights as a starting point → else just the prescribed reps.
  const [exercises, setExercises] = useState(() => {
    if (!session) return [];
    const logs = loadWorkoutLogs();
    const existing = findLogForDate(logs, iso);
    return session.session.exercises.map((exStr) => {
      const parsed = parseExercise(exStr);
      const existingEx = existing?.exercises.find((e) => e.name === parsed.name);
      const lastLog = findLastExerciseLog(logs, parsed.name, iso);
      const setCount = existingEx?.sets.length || parsed.sets;
      const sets = Array.from({ length: setCount }, (_, i) => {
        if (existingEx?.sets[i]) return existingEx.sets[i];
        return { reps: parsed.reps, weight: lastLog?.sets[i]?.weight ?? "" };
      });
      return { name: parsed.name, target: `${parsed.sets}×${parsed.reps}`, lastLog, sets };
    });
  });

  // Auto-save on every change — same pattern the rest of the app uses for session/plan/check-ins.
  useEffect(() => {
    if (!session) return;
    saveWorkoutLog({
      date: iso,
      dateLabel,
      day: todayLabel,
      sessionName: session.session.name,
      goal: form.goal,
      exercises: exercises.map(({ name, sets }) => ({ name, sets })),
      loggedAt: Date.now(),
    });
    // session/iso/dateLabel/todayLabel/form.goal are all stable for the life of this screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises]);

  const updateSet = (exIdx, setIdx, field, value) => {
    setExercises((prev) => prev.map((ex, i) => i !== exIdx ? ex : {
      ...ex,
      sets: ex.sets.map((s, j) => j !== setIdx ? s : { ...s, [field]: value }),
    }));
  };

  const addSet = (exIdx) => {
    setExercises((prev) => prev.map((ex, i) => i !== exIdx ? ex : {
      ...ex,
      sets: [...ex.sets, { reps: ex.sets.at(-1)?.reps ?? "", weight: "" }],
    }));
  };

  const removeSet = (exIdx) => {
    setExercises((prev) => prev.map((ex, i) => (i !== exIdx || ex.sets.length <= 1) ? ex : {
      ...ex,
      sets: ex.sets.slice(0, -1),
    }));
  };

  if (!session) {
    return (
      <div className={styles.wrap}>
        <p className={styles.noSession}>No workout scheduled for today.</p>
        <button className="btn btn-ghost" onClick={onBack}>← Dashboard</button>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.eyebrow}>{todayLabel} · {session.session.name}</div>
        <h1 className={styles.title}>Log today's workout</h1>
      </div>

      {exercises.map((ex, exIdx) => (
        <div className="card" key={ex.name}>
          <div className={styles.exHead}>
            <span className={styles.exName}>{ex.name}</span>
            <span className={styles.exTarget}>Target {ex.target}</span>
          </div>

          {ex.lastLog && (
            <p className={styles.lastTime}>
              Last time ({ex.lastLog.date}): {ex.lastLog.sets.map((s) => `${s.weight || "–"}${unit}×${s.reps || "–"}`).join(", ")}
            </p>
          )}

          <div className={styles.setGrid}>
            <div className={styles.setHeadRow}>
              <span>Set</span><span>Reps</span><span>Weight ({unit})</span>
            </div>
            {ex.sets.map((s, setIdx) => (
              <div className={styles.setRow} key={setIdx}>
                <span className={styles.setNum}>{setIdx + 1}</span>
                <input
                  type="number" inputMode="numeric" min="0"
                  value={s.reps}
                  onChange={(e) => updateSet(exIdx, setIdx, "reps", e.target.value)}
                />
                <input
                  type="number" inputMode="decimal" min="0" step="0.5"
                  value={s.weight}
                  placeholder="–"
                  onChange={(e) => updateSet(exIdx, setIdx, "weight", e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className={styles.setActions}>
            <button className={styles.setBtn} onClick={() => addSet(exIdx)}>+ Add set</button>
            {ex.sets.length > 1 && (
              <button className={styles.setBtn} onClick={() => removeSet(exIdx)}>− Remove set</button>
            )}
          </div>
        </div>
      ))}

      <button className="btn btn-primary" onClick={onBack}>
        Done for today →
      </button>
    </div>
  );
}
