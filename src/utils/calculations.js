import { GOAL_ADJUSTMENTS } from "../constants";

// ─── Unit conversions ─────────────────────────────────────────────────────────

export const toKg = (value, unit) =>
  unit === "kg" ? +value : +value * 0.453592;

export const toCm = (value, unit) => {
  if (unit === "cm") return +value;
  const str = String(value).trim();
  // "5'10" or "5'10\"" format
  if (str.includes("'")) {
    const [ft, rest] = str.split("'");
    const inch = parseFloat(rest) || 0;
    return +ft * 30.48 + inch * 2.54;
  }
  // Plain feet (from the two-input UI, inches handled separately via "ft'in" string)
  return +str * 30.48;
};

// ─── Core calculations ────────────────────────────────────────────────────────

/**
 * Mifflin-St Jeor BMR (1990)
 * Male:   BMR = 10W + 6.25H − 5A + 5
 * Female: BMR = 10W + 6.25H − 5A − 161
 * Other:  midpoint of male/female equations (base − 78)
 */
export const calcBMR = (weightKg, heightCm, age, gender) => {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "Female") return base - 161;
  if (gender === "Male")   return base + 5;
  return base - 78; // midpoint: (5 + −161) / 2 = −78
};

/**
 * Katch-McArdle BMR (1975) — uses lean body mass, not gender
 * BMR = 370 + 21.6 × LBM (kg)
 * LBM = weight × (1 − bodyFat / 100)
 *
 * More accurate than Mifflin-St Jeor for anyone who knows their body fat %,
 * especially athletes with high muscle mass or higher body fat individuals.
 * (Katch & McArdle, Nutrition, Weight Control and Exercise, 1975)
 */
export const calcBMR_KatchMcArdle = (weightKg, bodyFatPct) => {
  const lbm = weightKg * (1 - bodyFatPct / 100);
  return Math.round(370 + 21.6 * lbm);
};

/**
 * Component-based TDEE — 3 separate inputs for accuracy
 *
 *   TDEE = (BMR × jobMultiplier) + trainingBonus + stepsBonus
 *
 * This separates occupational NEAT, structured exercise, and incidental
 * movement (steps) — which a single multiplier cannot capture.
 */
export const calcTDEE = (bmr, jobMultiplier, trainingBonus, stepsBonus) => {
  return Math.round(bmr * jobMultiplier + trainingBonus + stepsBonus);
};

/**
 * Progressive deficit stepping for "Lose fat"
 * Based on Trexler et al. 2014 — metabolic adaptation to caloric restriction
 *
 * As the cut progresses, the body adapts and the original deficit produces
 * less fat loss. Stepping up the deficit maintains rate of loss while
 * keeping intake above safe minimums.
 *
 * Returns { deficit, label, reason }
 */
export const getProgressiveDeficit = (weeks) => {
  if (weeks === undefined || weeks === null) weeks = 0;
  if (weeks === 0)   return { deficit: -200, label: "Foundation deficit",    reason: "Starting at −200 kcal — gentle enough to preserve muscle while your body hasn't yet adapted." };
  if (weeks <= 4)    return { deficit: -200, label: "Foundation deficit",    reason: "1–4 weeks in — no significant adaptation yet. Stay at −200 kcal and focus on consistency." };
  if (weeks <= 8)    return { deficit: -300, label: "Step 1 — deficit increased", reason: "4–8 weeks in — mild metabolic adaptation detected. Deficit stepped up to −300 kcal to maintain your rate of fat loss." };
  if (weeks <= 12)   return { deficit: -400, label: "Step 2 — deficit increased", reason: "8–12 weeks in — significant adaptation. Deficit stepped to −400 kcal, the maximum recommended before a diet break is required." };
  // 12+ weeks — return -400 but flag that diet break is needed, not more deficit
  return { deficit: -400, label: "Maximum deficit reached", reason: "12+ weeks in — increasing the deficit further risks muscle loss and metabolic damage. A diet break is recommended before continuing." };
};

/**
 * Progressive surplus stepping for "Build muscle"
 * Based on Helms et al. ISSN 2014, Barakat et al. SCJ 2020
 *
 * Starting too high means excess calories go to fat before MPS ramps up.
 * Step up as the body's anabolic response is confirmed week by week.
 */
export const getProgressiveSurplus = (weeks) => {
  if (weeks === undefined || weeks === null) weeks = 0;
  if (weeks === 0)  return { surplus: +150, label: "Foundation surplus",  reason: "Starting at +150 kcal — lets your body upregulate muscle protein synthesis before increasing fuel. Minimises early fat gain." };
  if (weeks <= 4)   return { surplus: +200, label: "Building surplus",    reason: "1–4 weeks in — anabolic machinery is activating. Stepped to +200 kcal to fuel the muscle protein synthesis now ramping up." };
  if (weeks <= 8)   return { surplus: +300, label: "Peak surplus",        reason: "4–8 weeks in — prime hypertrophy window. Your body is primed to use this fuel efficiently. Stepped to +300 kcal for maximum muscle growth." };
  if (weeks <= 12)  return { surplus: +300, label: "Sustain surplus",     reason: "8–12 weeks in — maintain at +300 kcal. Increasing further now mostly adds fat. Focus on progressive overload in training." };
  return             { surplus: +300, label: "Mini cut recommended",      reason: "12+ weeks of bulking — surplus efficiency drops significantly. A 3–4 week mini cut at −200 kcal will restore insulin sensitivity and set up a more productive next bulk." };
};

export const calcTargetCals = (tdee, goal, weeks) => {
  if (goal === "Lose fat")     { const { deficit } = getProgressiveDeficit(weeks); return Math.round(tdee + deficit); }
  if (goal === "Build muscle") { const { surplus } = getProgressiveSurplus(weeks); return Math.round(tdee + surplus); }
  return Math.round(tdee + (GOAL_ADJUSTMENTS[goal] || 0));
};

/**
 * Goal-aware macros — research backed
 *
 * Protein (per kg bodyweight):
 *   Lose fat     → 2.4g  Higher during deficit to protect muscle mass
 *                         (Helms et al. JISSN 2014; Barakat et al. SCJ 2020)
 *   Recomposition→ 2.4g  Max protein drives simultaneous fat loss + MPS
 *                         (Barakat et al. SCJ 2020)
 *   Build muscle → 2.0g  Upper end of 1.6–2.2g range proven sufficient in surplus
 *                         (Morton et al. BJSM 2018; Stokes et al. 2018)
 *   Performance  → 2.2g  Supports high training volume and recovery
 *                         (Phillips & Van Loon, JISSN 2011)
 *   Maintain     → 1.8g  Adequate to preserve lean mass at maintenance
 *                         (Morton et al. BJSM 2018)
 *
 * Fat: 25% of target calories, floored at 40g for hormonal health
 *      (ISSN position stand 2017; dietary fat < 15–20% impairs testosterone)
 *
 * Carbs: remainder after protein + fat, floored at 0
 */
export const calcMacros = (targetCals, weightKg, goal = "") => {
  const proteinPerKg =
    goal === "Lose fat"         ? 2.4 :
    goal === "Recomposition"    ? 2.4 :
    goal === "Build muscle"     ? 2.0 :
    goal === "Improve performance" ? 2.2 :
    goal === "Maintain weight"  ? 1.8 :
    2.2;

  const proteinG    = Math.round(weightKg * proteinPerKg);
  const fatFromPct  = Math.round((targetCals * 0.25) / 9);
  const fatG        = Math.max(40, fatFromPct);
  const carbG       = Math.max(0, Math.round((targetCals - proteinG * 4 - fatG * 9) / 4));
  return { proteinG, fatG, carbG };
};

/**
 * Run all calculations from raw form values.
 * Throws if any required input is invalid — App.jsx catches and shows error.
 */
export const calculateAll = (form) => {
  const wKg = toKg(form.weightVal, form.weightUnit);
  const hCm = toCm(form.heightVal, form.heightUnit);
  const age = parseInt(form.age);

  if (!wKg || wKg <= 0)   throw new Error("Invalid weight");
  if (!hCm || hCm <= 0)   throw new Error("Invalid height");
  if (!age || age < 13 || age > 99) throw new Error("Invalid age");
  if (!form.jobMultiplier) throw new Error("Select a job type");

  const bodyFatPct = parseFloat(form.bodyFat);
  const useKatchMcArdle = bodyFatPct > 0 && bodyFatPct < 60;

  const bmr = useKatchMcArdle
    ? calcBMR_KatchMcArdle(wKg, bodyFatPct)
    : calcBMR(wKg, hCm, age, form.gender);
  const bmrFormula = useKatchMcArdle ? "Katch-McArdle" : "Mifflin-St Jeor";
  const tdee       = calcTDEE(bmr, form.jobMultiplier, form.trainingBonus, form.stepsBonus);
  const targetCals = calcTargetCals(tdee, form.goal, form.cutDuration);
  const macros     = calcMacros(targetCals, wKg, form.goal);

  const deficitStep =
    form.goal === "Lose fat"     ? getProgressiveDeficit(form.cutDuration) :
    form.goal === "Build muscle" ? getProgressiveSurplus(form.cutDuration) :
    null;

  return { wKg, hCm, age, tdee, targetCals, deficitStep, bmrFormula, ...macros };
};

// ─── Progressive deficit / metabolic adaptation analysis ─────────────────────
// Based on: Leibel et al. 1995, Trexler et al. 2014 (metabolic adaptation)

export const analyseDeficitHistory = (form, results) => {
  if (form.goal !== "Lose fat") return null;

  const weeks       = form.cutDuration ?? 0;
  const weightLost  = parseFloat(form.weightLost) || 0;

  // Minimum intake floors (below these = muscle loss risk regardless)
  const floorKcal = form.gender === "Female" ? 1400 : 1600;

  // Adapted TDEE estimate — body downregulates ~10-15% after extended cuts
  const adaptedTDEE = weeks >= 8
    ? Math.round(results.tdee * (1 - (weeks >= 12 ? 0.12 : 0.08)))
    : results.tdee;

  // Rate of loss check (if weight lost data provided)
  const weeklyLossKg = weeks > 0 && weightLost > 0 ? weightLost / weeks : null;

  const alerts  = []; // 🚨 red — needs action
  const warns   = []; // ⚠️  amber — watch out
  const goods   = []; // ✅ green — on track
  let dietBreak = null;
  let reverse   = null;

  // ── Floor check ──
  if (results.targetCals < floorKcal) {
    alerts.push(`Your target of ${results.targetCals} kcal is below the safe minimum of ${floorKcal} kcal. Eating this low risks muscle loss, hormonal disruption, and metabolic damage. Increase calories and extend the cut timeline instead.`);
  }

  // ── Duration-based advice ──
  if (weeks === 0) {
    goods.push("You're just starting — no adaptation to worry about yet. Stick to your target consistently for 2–3 weeks before drawing conclusions.");
  } else if (weeks <= 4) {
    goods.push("1–4 weeks in — too early for significant metabolic adaptation. Focus on consistency and hitting your protein target every day.");
  } else if (weeks <= 8) {
    warns.push(`~6 weeks in — mild metabolic adaptation may have started (~5% TDEE reduction, estimated ${adaptedTDEE} kcal actual maintenance). If weight loss has stalled for 2+ weeks, take a 1-week diet break at ${results.tdee} kcal before continuing.`);
    dietBreak = {
      reason: "Mild adaptation detected",
      cals: results.tdee,
      duration: "1 week",
      after: `Return to ${results.targetCals} kcal after the break`,
    };
  } else if (weeks <= 12) {
    alerts.push(`~10 weeks in — significant metabolic adaptation likely (~8% TDEE reduction). Your actual maintenance is now closer to ${adaptedTDEE} kcal, not ${results.tdee}. A 1–2 week diet break at ${adaptedTDEE} kcal is strongly recommended before your next cut phase.`);
    dietBreak = {
      reason: "Significant adaptation — diet break recommended",
      cals: adaptedTDEE,
      duration: "1–2 weeks",
      after: `Resume cut at ${Math.round(adaptedTDEE - 200)} kcal after the break`,
    };
  } else {
    alerts.push(`12+ weeks in — this is a long cut. Metabolic adaptation is now significant (~12% reduction, estimated maintenance ${adaptedTDEE} kcal). Continuing in a deficit risks muscle loss, hormonal suppression, and rebound weight gain. A reverse diet back to ${adaptedTDEE} kcal is recommended before cutting again.`);
    reverse = {
      currentMaintenance: adaptedTDEE,
      weeklyIncrease: 100,
      targetMaintenance: results.tdee,
      weeksToReverse: Math.ceil((results.tdee - adaptedTDEE) / 100),
    };
  }

  // ── Rate of loss check ──
  if (weeklyLossKg !== null) {
    if (weeklyLossKg > 1.0) {
      alerts.push(`You're losing ${weeklyLossKg.toFixed(1)}kg/week — this is too fast. Above 0.7–1kg/week, a significant portion of weight lost is muscle, not fat. Increase calories by 150–200 kcal to slow the rate.`);
    } else if (weeklyLossKg > 0.7) {
      warns.push(`Losing ${weeklyLossKg.toFixed(1)}kg/week — slightly aggressive but manageable. Keep protein very high (${results.proteinG}g+) to protect muscle.`);
    } else if (weeklyLossKg < 0.1 && weeks >= 3) {
      warns.push(`Only ${(weeklyLossKg * 1000).toFixed(0)}g/week lost — barely moving. Double-check your calorie tracking accuracy. Even small errors (sauces, oils, drinks) add up to 200–400 kcal/day.`);
    } else {
      goods.push(`Losing ${weeklyLossKg.toFixed(2)}kg/week — ideal rate for fat loss while preserving muscle.`);
    }
  }

  return { alerts, warns, goods, dietBreak, reverse };
};

// ─── Build muscle phase analysis ─────────────────────────────────────────────
// Helms et al. ISSN 2014, Barakat et al. SCJ 2020, Schoenfeld 2010

export const analyseBulkHistory = (form, results) => {
  if (form.goal !== "Build muscle") return null;

  const weeks       = form.cutDuration ?? 0;
  const weightGained = parseFloat(form.weightLost) || 0; // reusing same field
  const weeklyGainKg = weeks > 0 && weightGained > 0 ? weightGained / weeks : null;

  const alerts = [], warns = [], goods = [];
  let protocol = null;

  // ── Duration advice ──
  if (weeks === 0) {
    goods.push("You're just starting your bulk — the first 8–12 weeks typically produce the best muscle-to-fat gain ratio. Stay consistent with training and hit your protein every day.");
  } else if (weeks <= 4) {
    goods.push("1–4 weeks in — early days. Your nervous system is still adapting. Strength gains now are neurological, not purely muscle. Keep pushing progressive overload.");
  } else if (weeks <= 8) {
    goods.push("4–8 weeks in — prime hypertrophy window. This is where the real muscle growth happens. Stay in your surplus and don't get distracted by small scale fluctuations.");
  } else if (weeks <= 12) {
    warns.push(`~10 weeks of bulking — you've likely made solid progress. Consider a 1–2 week maintenance phase at ${results.tdee} kcal to reset insulin sensitivity, reduce fat accumulation rate, and consolidate gains before the next bulk block.`);
    protocol = {
      type: "maintenance_break",
      title: "📋 Recommended: Maintenance Phase",
      rows: [
        { label: "Eat at",    value: `${results.tdee} kcal / day` },
        { label: "Duration",  value: "1–2 weeks" },
        { label: "Training",  value: "Maintain intensity — don't deload" },
        { label: "After",     value: `Resume bulk at ${results.targetCals} kcal` },
      ],
      note: "Brief maintenance phases during a bulk reset hunger hormones (leptin/ghrelin), improve insulin sensitivity, and result in better lean mass to fat ratios in the next bulk block. (Barakat et al. 2020)",
    };
  } else {
    alerts.push(`12+ weeks of continuous bulking — beyond this point, fat gain significantly outpaces muscle gain for most people. A 3–4 week mini cut at ${Math.round(results.tdee - 200)} kcal will strip excess fat, restore insulin sensitivity, and set you up for a more productive next bulk.`);
    protocol = {
      type: "mini_cut",
      title: "✂️ Recommended: Mini Cut",
      rows: [
        { label: "Eat at",        value: `${Math.round(results.tdee - 200)} kcal / day` },
        { label: "Duration",      value: "3–4 weeks" },
        { label: "Protein",       value: `Keep at ${results.proteinG}g — critical during a cut` },
        { label: "Training",      value: "Maintain all lifts — this is not a diet, it's a reset" },
        { label: "After",         value: `Resume bulk at ${results.targetCals} kcal` },
      ],
      note: "A mini cut after a long bulk preserves most muscle, reduces body fat percentage, and improves anabolic sensitivity — making the next bulk cleaner and more efficient. (Helms et al. 2014)",
    };
  }

  // ── Rate of gain check ──
  if (weeklyGainKg !== null) {
    if (weeklyGainKg > 0.7) {
      warns.push(`Gaining ${weeklyGainKg.toFixed(2)}kg/week — this is too fast for lean bulking. Above 0.5kg/week, most of the gain is fat. Reduce to ${Math.round(results.targetCals - 100)} kcal to slow the rate.`);
    } else if (weeklyGainKg > 0.5) {
      warns.push(`Gaining ${weeklyGainKg.toFixed(2)}kg/week — slightly aggressive. Aim for 0.25–0.5kg/week to maximise muscle-to-fat ratio. Try ${Math.round(results.targetCals - 80)} kcal.`);
    } else if (weeklyGainKg < 0.1 && weeks >= 3) {
      warns.push(`Only ${(weeklyGainKg * 1000).toFixed(0)}g/week — barely moving. Either your calorie tracking has gaps or your surplus is too small. Make sure you're actually hitting ${results.targetCals} kcal consistently.`);
    } else if (weeklyGainKg >= 0.1) {
      goods.push(`Gaining ${weeklyGainKg.toFixed(2)}kg/week — ideal lean bulk rate. At this pace you're maximising muscle gain while minimising fat accumulation.`);
    }
  }

  return { alerts, warns, goods, protocol };
};

// ─── Recomposition phase analysis ────────────────────────────────────────────
// Barakat et al. "Body Recomposition" SCJ 2020

export const analyseRecompHistory = (form, results) => {
  if (form.goal !== "Recomposition") return null;

  const weeks  = form.cutDuration ?? 0;
  const alerts = [], warns = [], goods = [];
  let protocol = null;

  if (weeks === 0) {
    goods.push("Starting a recomp — this is the ideal time. Recomposition works best for beginners, people returning after a break, or those at higher body fat percentages. Your body is primed for simultaneous fat loss and muscle gain.");
    goods.push("Key principle: protein and training intensity matter more than calories here. Hit your protein target every single day and focus on progressive overload.");
  } else if (weeks <= 8) {
    goods.push("1–8 weeks in — recomp takes patience. The scale may not move, but body composition is changing. Measure progress with photos and how your clothes fit, not just weight.");
    warns.push("Recomposition works best when protein is consistently at target. Even a few low-protein days per week can stall your progress significantly.");
  } else if (weeks <= 16) {
    warns.push(`~${weeks} weeks of recomping — progress typically slows after 8–12 weeks as the body adapts. If you feel like you've stalled, it may be time to transition to a dedicated phase for better results.`);
    protocol = {
      type: "phase_split",
      title: "🔄 Consider: Dedicated Phase Split",
      rows: [
        { label: "Option A — Cut first", value: `${Math.round(results.tdee - 200)} kcal for 8 weeks` },
        { label: "Option B — Bulk first", value: `${results.targetCals + 300} kcal for 8–12 weeks` },
        { label: "Who suits Option A", value: "Body fat feels high, want to see definition first" },
        { label: "Who suits Option B", value: "Feel lean already, want to build more size" },
      ],
      note: "For intermediate and advanced lifters, dedicated bulk/cut phases produce significantly better results than extended recomposition. Recomp is most effective in the first 3–6 months. (Barakat et al. 2020)",
    };
  } else {
    alerts.push(`16+ weeks of recomposition — for most intermediate lifters, recomp effectiveness diminishes significantly beyond this point. Your body has largely exhausted the beginner adaptation window. Splitting into dedicated bulk and cut phases will now produce dramatically better results.`);
    protocol = {
      type: "phase_split",
      title: "🔄 Recommended: Move to Dedicated Phases",
      rows: [
        { label: "Recommended next step", value: "Assess current body fat first" },
        { label: "If > 18% BF (men) / > 28% (women)", value: `Cut: ${Math.round(results.tdee - 200)} kcal for 8–12 weeks` },
        { label: "If < 18% BF (men) / < 28% (women)", value: `Bulk: ${results.targetCals + 300} kcal for 12–16 weeks` },
        { label: "Protein", value: `Keep at ${results.proteinG}g throughout` },
      ],
      note: "Simultaneous muscle gain and fat loss requires a significant hormonal advantage that diminishes with training age. Dedicated phases allow you to optimise hormonal environment for each specific goal. (Barakat et al. 2020)",
    };
  }

  return { alerts, warns, goods, protocol };
};

// ─── Maintenance phase analysis ──────────────────────────────────────────────
// Hall et al. Lancet 2011, long-term weight maintenance research

export const analyseMaintenanceHistory = (form, results) => {
  if (form.goal !== "Maintain weight") return null;

  const weeks  = form.cutDuration ?? 0;
  const alerts = [], warns = [], goods = [];
  let protocol = null;

  if (weeks === 0) {
    goods.push("Starting maintenance — take 2–3 weeks to establish your true maintenance baseline. Your calculated TDEE is an estimate; track weight daily and adjust by ±100 kcal if you're consistently losing or gaining.");
  } else if (weeks <= 4) {
    goods.push("1–4 weeks in maintenance — use this phase to establish your real calorie baseline. If weight is drifting, adjust your intake by 100 kcal in the appropriate direction.");
  } else if (weeks <= 12) {
    goods.push("Good maintenance consistency. Important: weight maintenance doesn't automatically mean body composition maintenance. Without progressive overload, muscle mass slowly decreases even at the same bodyweight.");
    warns.push("Ensure your training includes progressive overload to maintain muscle. Maintenance calories + no resistance training = gradual muscle loss and fat gain over time, even if the scale doesn't move.");
  } else if (weeks <= 26) {
    warns.push(`~${Math.round(weeks/4)} months of maintenance — body composition can drift significantly at this timescale even with stable weight. This is sometimes called 'weight creep' — the scale stays the same but muscle decreases and fat increases. Consider a deliberate phase.`);
    protocol = {
      type: "deliberate_phase",
      title: "📋 Consider: A Deliberate Phase",
      rows: [
        { label: "If you feel 'soft'", value: `Mini cut: ${Math.round(results.tdee - 200)} kcal for 6–8 weeks` },
        { label: "If you feel 'skinny'", value: `Mini bulk: ${Math.round(results.tdee + 250)} kcal for 8–12 weeks` },
        { label: "Protein throughout", value: `${results.proteinG}g / day minimum` },
        { label: "After the phase", value: "Return to maintenance with improved composition" },
      ],
      note: "Long-term maintenance without deliberate phases leads to gradual body recomposition in the wrong direction. Periodic mini phases preserve and improve body composition while keeping weight stable long-term. (Hall et al. Lancet 2011)",
    };
  } else {
    alerts.push(`6+ months of continuous maintenance — at this timescale, without deliberate stimulus, body composition almost certainly drift. Most people in long-term maintenance see a gradual decline in muscle mass and increase in body fat even with stable weight. A deliberate phase change is recommended.`);
    protocol = {
      type: "deliberate_phase",
      title: "📋 Recommended: Deliberate Phase Change",
      rows: [
        { label: "Assess first", value: "How do you look and feel vs 6 months ago?" },
        { label: "More muscle needed", value: `Bulk: ${Math.round(results.tdee + 250)} kcal for 12 weeks` },
        { label: "Less fat wanted", value: `Cut: ${Math.round(results.tdee - 200)} kcal for 8–10 weeks` },
        { label: "Return to maintenance", value: `${results.tdee} kcal with better composition` },
      ],
      note: "Research consistently shows that periodic dietary phases produce better long-term body composition than flat maintenance, even when average calorie intake is identical. (Hall et al. 2011)",
    };
  }

  return { alerts, warns, goods, protocol };
};

// ─── Performance phase analysis ──────────────────────────────────────────────
// Issurin 2010 (periodization), Zourdos et al. 2021

export const analysePerformanceHistory = (form, results) => {
  if (form.goal !== "Improve performance") return null;

  const weeks  = form.cutDuration ?? 0;
  const alerts = [], warns = [], goods = [];
  let protocol = null;

  if (weeks === 0) {
    goods.push("Starting a performance phase — establish your baseline metrics in week 1. Record your key lifts, times, or benchmarks now. You can't measure improvement without a starting point.");
    goods.push("Performance nutrition is about fuelling adaptation. Hit your calorie target consistently — undereating even one day before a hard session measurably reduces output and recovery.");
  } else if (weeks <= 4) {
    goods.push("1–4 weeks in — this is the neurological adaptation phase. Strength and skill improvements now are largely your nervous system becoming more efficient, not muscle growth yet. Keep pushing.");
  } else if (weeks <= 8) {
    goods.push("4–8 weeks in — you're in the peak adaptation window. This is where training produces the greatest return. Don't break the programme, don't skip sessions.");
    warns.push("Sleep and recovery are as important as training at this stage. Underfuelling or undersleeping now will blunt the adaptations you've been building for weeks.");
  } else if (weeks <= 12) {
    warns.push(`~10 weeks in — approaching the end of an effective performance block. Accumulated fatigue is building and your nervous system needs a reset. A deload week is now strongly recommended.`);
    protocol = {
      type: "deload",
      title: "🔄 Recommended: Deload Week",
      rows: [
        { label: "Training volume", value: "Reduce to 40–60% of normal sets" },
        { label: "Intensity",       value: "Keep weights the same, reduce reps" },
        { label: "Calories",        value: `Maintain at ${results.targetCals} kcal — don't cut food` },
        { label: "Duration",        value: "1 week" },
        { label: "After deload",    value: "Start new performance block refreshed" },
      ],
      note: "Deload weeks allow accumulated fatigue to dissipate while fitness adaptations are retained — you'll often hit personal bests the week after a deload. (Zourdos et al. 2021)",
    };
  } else {
    alerts.push(`12+ weeks in a single performance block — beyond this point, continued progress on the same programme becomes increasingly unlikely. Accumulated fatigue, overuse risk, and adaptation plateaus all peak around the 12-week mark.`);
    protocol = {
      type: "phase_transition",
      title: "🔁 Recommended: Phase Transition",
      rows: [
        { label: "Step 1",  value: "1-week deload at 40% training volume" },
        { label: "Step 2",  value: "Assess: strength deficit or size deficit?" },
        { label: "If strength", value: `Hypertrophy block: ${Math.round(results.tdee + 200)} kcal, 8–12 rep focus, 8 weeks` },
        { label: "If size",     value: "Strength block: same calories, 3–6 rep focus, 6 weeks" },
        { label: "Return",      value: "New performance block from improved baseline" },
      ],
      note: "Periodization — cycling between different training phases — consistently outperforms single-focus training for long-term performance. Each phase builds the foundation for the next. (Issurin 2010)",
    };
  }

  return { alerts, warns, goods, protocol };
};

// ─── Master router — returns analysis for any goal ───────────────────────────
export const analyseGoalHistory = (form, results) => {
  if (form.cutDuration === undefined) return null;
  switch (form.goal) {
    case "Lose fat":            return analyseDeficitHistory(form, results);
    case "Build muscle":        return analyseBulkHistory(form, results);
    case "Recomposition":       return analyseRecompHistory(form, results);
    case "Maintain weight":     return analyseMaintenanceHistory(form, results);
    case "Improve performance": return analysePerformanceHistory(form, results);
    default: return null;
  }
};