# Apex.Lifts

A science-backed nutrition and training tool built for people who want real numbers, not generic advice.

No account. No email. Runs entirely in the browser — your data never leaves your device (see [Storage](#storage) below for exactly what that means).

---

## What it does

**1. Goal-first flow**
Asks what you're training for before collecting your stats — so every number you enter has a purpose.

**2. Precise calorie & macro calculation**
Uses the Mifflin-St Jeor equation (or Katch-McArdle if you know your body fat %) with separate multipliers for job activity, training frequency, and daily steps. Most apps bundle these together — this one doesn't.

**3. A dashboard, not just a one-off result**
Finish the wizard once and every time you reopen the app you land on a dashboard — today's workout, today's calorie/protein target, and your recent progress — instead of redoing the calculator.

**4. Research-backed training splits**
Pick your available days and get a weekly split chosen to hit each muscle group ≥2×/week wherever the day count allows (Upper/Lower, Full Body, Push/Pull/Legs — frequency drives hypertrophy more than volume alone, per Schoenfeld et al. 2016), not a generic body-part split.

**5. Workout logging**
Log actual sets, reps, and weight for today's session. Auto-saves as you go, shows what you lifted last time per exercise, and pre-fills weight from your last session so progressive overload doesn't mean retyping everything.

**6. Macro food guide**
Translates your gram targets into real food amounts. Supports vegetarian and non-vegetarian modes.

**7. Diet gap analyser**
Enter what you're currently eating — get a specific, honest assessment of what needs to change.

**8. 7-day check-in & TDEE recalibration**
After a week, enter your new weight. The app back-calculates your real TDEE from actual results and adjusts your calorie target automatically.

**9. Session persistence**
Leave mid-way and come back — your progress is saved locally.

---

## Storage

Everything is client-side only, in `localStorage`. There's no backend, no account, no sync:

| Key | What it holds |
|---|---|
| `apexlifts_profile` | Your last completed blueprint (form answers + calculated results) — this is what lets you land on the dashboard instead of redoing the wizard |
| `apexlifts_plan` | Your built weekly training split |
| `apexlifts_logs` | Logged workouts — sets/reps/weight per exercise, most recent 30 |
| `apexlifts_checkins` | 7-day check-in history (weight + recalibrated TDEE), most recent 12 |
| `apexlifts_session` | In-progress wizard answers, so you can resume if you leave mid-way |

Practical implications: clearing browser data (or private/incognito mode) wipes all of it, there's no cross-device access, and there's no backup if the device is lost. If you need real persistence — sync, backup, multiple devices — that requires an actual backend, which this intentionally doesn't have.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 (Vite) |
| Styling | CSS Modules |
| Fonts | Syne (headings/display) + DM Sans (body) |
| Storage | localStorage only — no backend, no database |
| Deployment | Vercel |

---

## Local development

```bash
# 1. Clone
git clone https://github.com/chauhan463/apexlifts.git
cd apexlifts

# 2. Install
npm install

# 3. Run
npm run dev
```

---

## Project structure

```
src/
├── components/
│   ├── Dashboard.jsx             # Returning-user home — today's workout, target, recent progress
│   ├── WorkoutLog.jsx            # Sets/reps/weight logger for today's session
│   ├── Intro.jsx                 # First-time landing screen
│   ├── steps/
│   │   ├── Step3Goal.jsx         # Step 1 — goal selection
│   │   ├── Step1Body.jsx         # Step 2 — body stats
│   │   └── Step2Lifestyle.jsx    # Step 3 — lifestyle & submit
│   └── results/
│       ├── Results.jsx           # Tabbed results shell
│       ├── MacroFoodGuide.jsx    # Food translator (veg/non-veg)
│       ├── TrainingPlan.jsx      # Weekly split builder
│       ├── DietReview.jsx        # Diet gap analyser
│       ├── DeficitBanner.jsx     # Progressive deficit alerts
│       ├── DeficitStep.jsx       # Step-ladder visualiser
│       ├── CheckIn.jsx           # 7-day recalibration tool
│       └── ShareCard.jsx         # Social card generator
├── utils/
│   ├── calculations.js           # BMR, TDEE, macros, recalibration
│   ├── trainingPlan.js           # Split patterns, today's-session lookup, exercise parsing
│   └── workoutLog.js             # Workout log persistence + "last time" lookups
├── constants/
│   └── index.js                  # Goals, jobs, training options, storage keys
└── styles/
    └── global.css                # Design tokens, shared components
```

---

## Calculation methodology

**BMR** — Mifflin-St Jeor (1990) by default:
- Male: `10W + 6.25H − 5A + 5`
- Female: `10W + 6.25H − 5A − 161`

If body fat % is provided, switches to **Katch-McArdle (1975)**:
- `370 + 21.6 × LBM`

**TDEE** — BMR is multiplied by a job activity factor, then training and step bonuses are added as flat kcal:
- `TDEE = BMR × jobMultiplier + trainingBonus + stepsBonus`

**Calorie target** — Goal adjustment applied on top of TDEE:
- Lose fat: −200 kcal
- Build muscle: +300 kcal
- Recomposition: −100 kcal
- Maintain: ±0
- Performance: +150 kcal

**Macros** — Protein is set at 2.0g/kg bodyweight, fats at 25% of target calories, remainder to carbs.

**TDEE recalibration** — After 7 days:
```
realSurplus  = (actualWeightChange × 7700) / 7
realTDEE     = targetCals − realSurplus
newTarget    = realTDEE + originalOffset
```

**Training split selection** — chosen by day count to maximise per-muscle frequency, not just fill days:

| Days | Split | Why |
|---|---|---|
| 1 | Full Body | Only one session/week — nothing to rotate |
| 2 | Upper / Lower | Max frequency achievable at 2 days |
| 3 | Full Body ×3 | Every-other-day full body — 3×/week per muscle, beats a 1×/week Push/Pull/Legs split |
| 4 | Upper/Lower/Upper/Lower | 2×/week per muscle |
| 5 | Push/Pull/Legs/Upper/Lower | Every muscle ~2×/week |
| 6 | Push/Pull/Legs ×2 | Every muscle 2×/week |
| 7 | Push/Pull/Legs ×2 + Full Body | 2×/week baseline plus a top-up day |

---

## License

MIT
