import TrainingPlan    from "./TrainingPlan";
import DietReview      from "./DietReview";
import DeficitBanner   from "./DeficitBanner";
import DeficitStep     from "./DeficitStep";
import ShareCard       from "./ShareCard";
import MacroFoodGuide  from "./MacroFoodGuide";
import CheckIn         from "./CheckIn";
import styles          from "./Results.module.css";
import { analyseGoalHistory } from "../../utils/calculations";

const SURPLUS_GOALS = ["Build muscle", "Improve performance"];

export default function Results({ form, results, onRestart, onApplyRecalibration }) {
  const { tdee, targetCals, proteinG, carbG, fatG } = results;

  const deficitSurplus =
    form.goal === "Lose fat"
      ? `-${tdee - targetCals}`
      : SURPLUS_GOALS.includes(form.goal)
      ? `+${targetCals - tdee}`
      : "±0";

  const deficitAnalysis = analyseGoalHistory(form, results);

  return (
    <div className={styles.wrap}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <h2 className={styles.heading}>
          {form.name ? <>{form.name}'s <span>Blueprint.</span></> : <>Your <span>Blueprint.</span></>}
        </h2>
        <div className={styles.tag}>
          {form.goal} · {form.job || ""}
        </div>
      </div>

      {/* ── Progressive deficit analysis ── */}
      {deficitAnalysis && <DeficitBanner analysis={deficitAnalysis} />}

      {/* ── Stats ── */}
      <div className="section-label">Your numbers</div>
      <div className={styles.statsGrid}>
        {[
          { n: targetCals,     u: "kcal / day", l: "Target calories"    },
          { n: tdee,           u: "kcal / day", l: "Maintenance (TDEE)" },
          { n: proteinG,       u: "g / day",    l: "Protein target"     },
          { n: deficitSurplus, u: "kcal / day", l: "Deficit / Surplus"  },
        ].map((s, i) => (
          <div className={styles.statTile} key={i}>
            <div className={styles.statNum}>{s.n}</div>
            <div className={styles.statUnit}>{s.u}</div>
            <div className={styles.statLabel}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Deficit step ladder — only for Lose fat ── */}
      {results.deficitStep && (
        <DeficitStep deficitStep={results.deficitStep} tdee={tdee} goal={form.goal} />
      )}

      {/* ── Macros ── */}
      <div className="section-label" style={{ marginTop: 16 }}>Macro breakdown</div>
      <div className={styles.macrosGrid}>
        {[
          { cls: "p", g: proteinG, nm: "Protein",       kcal: proteinG * 4 },
          { cls: "c", g: carbG,    nm: "Carbohydrates", kcal: carbG * 4    },
          { cls: "f", g: fatG,     nm: "Fats",          kcal: fatG * 9     },
        ].map((m) => (
          <div className={`${styles.macroTile} ${styles[m.cls]}`} key={m.cls}>
            <div className={styles.macroG}>{m.g}g</div>
            <div className={styles.macroNm}>{m.nm}</div>
            <div className={styles.macroKc}>{m.kcal} kcal</div>
          </div>
        ))}
      </div>

      <hr className="divider" />

      {/* ── Food translator ── */}
      <MacroFoodGuide proteinG={proteinG} carbG={carbG} fatG={fatG} />

      <hr className="divider" />

      {/* ── Share card ── */}
      <ShareCard form={form} results={results} />

      <hr className="divider" />

      {/* ── Training plan ── */}
      <TrainingPlan form={form} results={results} />

      <hr className="divider" />

      {/* ── Diet review ── */}
      <DietReview form={form} results={results} />

      <hr className="divider" />

      {/* ── 7-day check-in ── */}
      <CheckIn form={form} results={results} onApplyRecalibration={onApplyRecalibration} />

      <hr className="divider" />

      <button className="btn btn-ghost" style={{ marginTop: 0 }} onClick={onRestart}>
        ← Start over
      </button>
    </div>
  );
}