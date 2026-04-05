# Apex.Lifts

A science-backed nutrition and training calculator built for people who want real numbers, not generic advice.

No account. No email. Runs entirely in the browser — your data never leaves your device.

---

## What it does

**1. Goal-first flow**
Asks what you're training for before collecting your stats — so every number you enter has a purpose.

**2. Precise calorie & macro calculation**
Uses the Mifflin-St Jeor equation (or Katch-McArdle if you know your body fat %) with separate multipliers for job activity, training frequency, and daily steps. Most apps bundle these together — this one doesn't.

**3. AI coaching insight**
Powered by Gemini. After calculating your numbers, an AI coach reads your full profile (goal, job, lifestyle, stats) and writes a personalised 3–4 sentence message — not a template.

**4. Macro food guide**
Translates your gram targets into real food amounts. Supports vegetarian and non-vegetarian modes.

**5. Training split builder**
Pick your available days, get a weekly plan built around your goal (fat loss, muscle, recomp, performance).

**6. Diet gap analyser**
Enter what you're currently eating — get a specific, honest assessment of what needs to change.

**7. 7-day check-in & TDEE recalibration**
After a week, enter your new weight. The app back-calculates your real TDEE from actual results and adjusts your calorie target automatically. Tracks check-in history in localStorage.

**8. Session persistence**
Leave mid-way and come back — your progress is saved locally.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 (Vite) |
| Styling | CSS Modules |
| Fonts | Syne (headings/display) + DM Sans (body) |
| AI | Google Gemini API (2.0 Flash with fallback chain) |
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

# 3. Add your Gemini API key
cp .env.example .env
# then edit .env and paste your key from https://aistudio.google.com

# 4. Run
npm run dev
```

The app works without an API key — the AI coaching features will be unavailable but all calculations run locally.

---

## Environment variables

```
VITE_GEMINI_API_KEY=your_key_here
```

Get a free key at [aistudio.google.com](https://aistudio.google.com). Never commit this file — `.env` is gitignored.

---

## Project structure

```
src/
├── components/
│   ├── steps/
│   │   ├── Step3Goal.jsx        # Step 1 — goal selection
│   │   ├── Step1Body.jsx        # Step 2 — body stats
│   │   └── Step2Lifestyle.jsx   # Step 3 — lifestyle & submit
│   └── results/
│       ├── Results.jsx          # Tabbed results shell
│       ├── MacroFoodGuide.jsx   # Food translator (veg/non-veg)
│       ├── TrainingPlan.jsx     # Weekly split builder
│       ├── DietReview.jsx       # Diet gap analyser
│       ├── DeficitBanner.jsx    # Progressive deficit alerts
│       ├── DeficitStep.jsx      # Step-ladder visualiser
│       ├── CheckIn.jsx          # 7-day recalibration tool
│       └── ShareCard.jsx        # Social card generator
├── utils/
│   ├── calculations.js          # BMR, TDEE, macros, recalibration
│   └── api.js                   # Gemini API + prompt builders
├── constants/
│   └── index.js                 # Goals, jobs, training options
└── styles/
    └── global.css               # Design tokens, shared components
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

---

## License

MIT
