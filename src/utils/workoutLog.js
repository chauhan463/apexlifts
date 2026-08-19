import { WORKOUT_LOG_STORAGE_KEY } from "../constants";

// Cap history — bounded storage, still ~a month of daily training.
const MAX_LOGS = 30;

// Local calendar date, not UTC — toISOString() can roll to the next day
// near midnight depending on timezone, which would break "today" lookups.
export function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function loadWorkoutLogs() {
  try { return JSON.parse(localStorage.getItem(WORKOUT_LOG_STORAGE_KEY)) || []; }
  catch { return []; }
}

export function findLogForDate(logs, iso) {
  return logs.find((l) => l.date === iso) || null;
}

// Most recent PRIOR log (strictly before `beforeIso`) that contains this exercise —
// the real "previous performance" signal, drawn only from what the user actually logged.
export function findLastExerciseLog(logs, exerciseName, beforeIso) {
  for (const log of logs) { // logs are stored newest-first
    if (log.date >= beforeIso) continue;
    const ex = log.exercises.find((e) => e.name === exerciseName);
    if (ex) return { date: log.dateLabel, sets: ex.sets };
  }
  return null;
}

// Upsert by date — re-logging the same day overwrites rather than duplicating.
export function saveWorkoutLog(entry) {
  try {
    const logs = loadWorkoutLogs().filter((l) => l.date !== entry.date);
    logs.unshift(entry);
    localStorage.setItem(WORKOUT_LOG_STORAGE_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  } catch { /* storage unavailable */ }
}
