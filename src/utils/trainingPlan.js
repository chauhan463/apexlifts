import { DAYS, PLAN_STORAGE_KEY } from "../constants";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getTodayLabel(date = new Date()) {
  return WEEKDAY_LABELS[date.getDay()];
}

// A saved plan only counts if it was built for the goal currently in play —
// otherwise a stale "Build muscle" split could show up under a "Lose fat" profile.
export function loadPlan(goal) {
  try {
    const raw = JSON.parse(localStorage.getItem(PLAN_STORAGE_KEY));
    if (raw && raw.goal === goal && Array.isArray(raw.sessions)) return raw;
  } catch { /* storage unavailable */ }
  return null;
}

// Returns { day, session } for today, or null if today isn't a training day (or no plan exists).
export function getTodaysSession(plan, todayLabel = getTodayLabel()) {
  if (!plan?.selectedDays?.includes(todayLabel)) return null;
  return plan.sessions.find((s) => s.day === todayLabel) || null;
}

// Walks forward from today to find the next scheduled training day.
export function findNextSession(plan, todayLabel = getTodayLabel()) {
  if (!plan?.sessions?.length) return null;
  const todayIdx = DAYS.indexOf(todayLabel);
  for (let i = 1; i <= 7; i++) {
    const label = DAYS[(todayIdx + i) % 7];
    const found = plan.sessions.find((s) => s.day === label);
    if (found) return found;
  }
  return null;
}

// "Bench Press 4×8" -> { name: "Bench Press", sets: 4, reps: 8 }
export function parseExercise(str) {
  const match = str.match(/^(.+?)\s+(\d+)×(\d+)$/);
  if (!match) return { name: str, sets: 3, reps: 10 }; // fallback if a template entry ever breaks the pattern
  return { name: match[1], sets: Number(match[2]), reps: Number(match[3]) };
}
