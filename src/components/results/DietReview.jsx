import { useState } from "react";
import styles from "./DietReview.module.css";

const analyseCalories = (currentCals, targetCals, tdee, goal) => {
  const vsTarget = currentCals - targetCals;
  const vsTDEE   = currentCals - tdee;

  switch (goal) {
    case "Lose fat": {
      const deficit = tdee - currentCals;
      if (Math.abs(vsTarget) <= 100)
        return "✅ Calories right on target — ideal deficit for fat loss while protecting muscle.";
      if (currentCals > tdee)
        return `❌ You're ${Math.abs(vsTDEE)} kcal above maintenance — you won't lose fat here. Drop below ${tdee} kcal to start.`;
      if (deficit <= 400)
        return `⚠️ You're in a ${deficit} kcal deficit — deeper than the recommended 200, but manageable. Keep protein high to spare muscle.`;
      return `🚨 A ${deficit} kcal deficit is too aggressive — your body will burn muscle. Eat at least ${tdee - 400} kcal and prioritise protein.`;
    }
    case "Build muscle": {
      if (Math.abs(vsTarget) <= 100)
        return "✅ Calories on point for a lean bulk — ideal for muscle gain with minimal fat.";
      if (currentCals < tdee)
        return `❌ You're ${Math.abs(vsTDEE)} kcal below maintenance — you cannot build muscle in a deficit. You need at least ${targetCals} kcal.`;
      if (vsTarget < -100)
        return `⚠️ Above maintenance but ${Math.abs(vsTarget)} kcal short of your bulk target — you're leaving gains on the table. Add a meal to hit ${targetCals} kcal.`;
      return `⚠️ You're ${vsTarget} kcal over your bulk target — excess surplus goes to fat, not muscle. Trim back to around ${targetCals} kcal.`;
    }
    case "Recomposition": {
      const deficit = tdee - currentCals;
      if (Math.abs(vsTarget) <= 100)
        return "✅ Near-maintenance intake — perfect for recomposition. High protein will do the heavy lifting.";
      if (deficit > 200)
        return `⚠️ You're ${deficit} kcal below maintenance — too deep for recomp. Eat around ${targetCals} kcal for optimal recomposition.`;
      if (currentCals > tdee + 200)
        return `⚠️ You're ${currentCals - tdee} kcal above maintenance — this shifts you into a bulk. Drop closer to ${targetCals} kcal for recomp.`;
      return "✅ Close enough to maintenance — recomp is in play. Nail your protein every single day.";
    }
    case "Maintain weight": {
      if (Math.abs(vsTarget) <= 150)
        return "✅ Calories bang on maintenance — you're doing this right.";
      if (vsTarget > 150)
        return `⚠️ You're ${vsTarget} kcal above maintenance — slow weight gain over time. Trim back to around ${targetCals} kcal.`;
      return `⚠️ You're ${Math.abs(vsTarget)} kcal below maintenance — unintentional deficit, slow weight loss. Eat around ${targetCals} kcal.`;
    }
    case "Improve performance": {
      if (Math.abs(vsTarget) <= 100)
        return "✅ Well fuelled for performance — energy and recovery should be solid.";
      if (currentCals < tdee)
        return `❌ You're ${Math.abs(vsTDEE)} kcal below maintenance — underfuelling kills performance and recovery. Hit at least ${targetCals} kcal.`;
      if (vsTarget < -100)
        return `⚠️ Above maintenance but ${Math.abs(vsTarget)} kcal short of your performance target. Add a pre/post-workout meal to reach ${targetCals} kcal.`;
      return `⚠️ ${vsTarget} kcal over your performance target — excess gets stored as fat. Aim for ${targetCals} kcal.`;
    }
    default:
      return Math.abs(vsTarget) <= 100
        ? "✅ Calories are on target."
        : `You're ${Math.abs(vsTarget)} kcal ${vsTarget > 0 ? "over" : "under"} your target.`;
  }
};

const analyseProtein = (currentProtein, targetProtein, goal) => {
  if (!currentProtein)
    return "📊 Track your protein to complete the picture — it's the single most important macro for your goal.";
  const diff     = currentProtein - targetProtein;
  const servings = Math.ceil(Math.abs(diff) / 25);
  if (diff >= -10)
    return "✅ Protein is on point — keep this consistent every day, it's the one macro you can't skip.";
  const fixes = {
    "Lose fat":            `Add ${servings} serving${servings > 1 ? "s" : ""} of chicken, cottage cheese, or Greek yoghurt — protein is your muscle's only defence in a deficit.`,
    "Build muscle":        `Add ${servings} serving${servings > 1 ? "s" : ""} of lean meat, eggs, or a protein shake — you can't build without the raw material.`,
    "Recomposition":       `Add ${servings} serving${servings > 1 ? "s" : ""} of high-protein food — recomp lives or dies on protein intake.`,
    "Maintain weight":     `Add ${servings} serving${servings > 1 ? "s" : ""} of lean protein — even at maintenance, protein preserves your muscle mass.`,
    "Improve performance": `Add ${servings} serving${servings > 1 ? "s" : ""} of lean protein — recovery and adaptation demand adequate amino acids.`,
  };
  return `⚠️ You're ${Math.abs(diff)}g short on protein. ${fixes[goal] || `Add ${servings} more serving${servings > 1 ? "s" : ""} of protein-rich food.`}`;
};

const priorityAction = (calLine, proteinLine) => {
  const calOk     = calLine.startsWith("✅");
  const proteinOk = proteinLine.startsWith("✅") || proteinLine.startsWith("📊");
  if (!calOk && !proteinOk)
    return "🎯 Fix protein first — it's harder to recover lost muscle than to adjust calories. Sort protein, then fine-tune intake.";
  if (!proteinOk)
    return "🎯 Calories are dialled in. Hit your protein target consistently and you're fully optimised.";
  if (!calOk)
    return "🎯 Protein is solid. Dial in your calories and you're completely on track.";
  return "🎯 You're fully dialled in. Results come from weeks of consistency — keep showing up.";
};

export default function DietReview({ form, results }) {
  const [currentCals,    setCurrentCals]    = useState("");
  const [currentProtein, setCurrentProtein] = useState("");
  const [review,         setReview]         = useState(null);

  const handleAnalyse = () => {
    if (!currentCals) return;
    const calLine     = analyseCalories(+currentCals, results.targetCals, results.tdee, form.goal);
    const proteinLine = analyseProtein(currentProtein ? +currentProtein : null, results.proteinG, form.goal);
    const priority    = priorityAction(calLine, proteinLine);
    setReview([calLine, proteinLine, priority]);
  };

  return (
    <div>
      <div className="section-label">Diet check-in</div>
      <p className={styles.desc}>
        Tell us what you're eating now — we'll compare it to your targets and tell you exactly what to fix.
      </p>
      <div className={styles.inner}>
        <div className="row-2">
          <div className="field">
            <label>Current calories / day</label>
            <input
              type="number"
              placeholder={String(results.targetCals)}
              value={currentCals}
              onChange={(e) => setCurrentCals(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Current protein (g) <span>optional</span></label>
            <input
              type="number"
              placeholder={String(results.proteinG)}
              value={currentProtein}
              onChange={(e) => setCurrentProtein(e.target.value)}
            />
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          disabled={!currentCals}
          onClick={handleAnalyse}
        >
          Analyse my diet →
        </button>
        {review && (
          <div className={styles.reviewOut}>
            {review.map((line, i) => (
              <div
                key={i}
                className={`${styles.reviewLine} ${
                  line.startsWith("✅") ? styles.good :
                  line.startsWith("⚠️") ? styles.warn :
                  line.startsWith("🚨") ? styles.bad  :
                  line.startsWith("❌") ? styles.bad  :
                  line.startsWith("🎯") ? styles.tip  : ""
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}