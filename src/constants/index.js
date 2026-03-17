export const GOALS = [
  { label: "Lose fat",            icon: "🔥", desc: "Science-backed deficit · preserve muscle" },
  { label: "Build muscle",        icon: "💪", desc: "Progressive overload + strategic surplus" },
  { label: "Recomposition",       icon: "⚖️", desc: "Lose fat & gain muscle simultaneously" },
  { label: "Maintain weight",     icon: "🎯", desc: "Optimise performance at current weight" },
  { label: "Improve performance", icon: "⚡", desc: "Fuel your training & athletic output" },
];

export const JOBS = [
  { label: "Office / Remote",           multiplier: 1.2  },
  { label: "Teacher / Service",         multiplier: 1.35 },
  { label: "Manual / Physical labour",  multiplier: 1.5  },
  { label: "Healthcare",                multiplier: 1.35 },
  { label: "Student",                   multiplier: 1.2  },
  { label: "Other",                     multiplier: 1.2  },
];

export const TRAINING_FREQ = [
  { label: "None",           bonus: 0   },
  { label: "1–2× / week",   bonus: 100 },
  { label: "3–4× / week",   bonus: 200 },
  { label: "5–6× / week",   bonus: 300 },
  { label: "Daily / 2×day", bonus: 400 },
];

export const STEPS = [
  { label: "< 5,000",          hint: "mostly sedentary",      bonus: 0   },
  { label: "5,000–7,500",      hint: "≈ 30–45 min walk",      bonus: 100 },
  { label: "7,500–10,000",     hint: "≈ 60 min walk",         bonus: 150 },
  { label: "10,000–12,500",    hint: "≈ 75–90 min walk",      bonus: 200 },
  { label: "12,500+",          hint: "very active / on feet", bonus: 300 },
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const GOAL_ADJUSTMENTS = {
  "Lose fat":            -200,
  "Build muscle":        +300,
  "Recomposition":       -100,
  "Maintain weight":       0,
  "Improve performance": +150,
};