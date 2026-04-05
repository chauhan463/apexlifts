import { useState } from "react";
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

const TABS = ["Overview", "Nutrition", "Training", "Tools"];

export default function Results({ form, results, onRestart, onApplyRecalibration }) {
  const [tab, setTab] = useState("Overview");
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

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t}
            className={`${styles.tabBtn} ${tab === t ? styles.tabActive : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {tab === "Overview" && (
        <div className={styles.tabPanel}>
          {deficitAnalysis && <DeficitBanner analysis={deficitAnalysis} />}

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

          {results.deficitStep && (
            <DeficitStep deficitStep={results.deficitStep} tdee={tdee} goal={form.goal} />
          )}

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
        </div>
      )}

      {/* ── Nutrition ── */}
      {tab === "Nutrition" && (
        <div className={styles.tabPanel}>
          <MacroFoodGuide proteinG={proteinG} carbG={carbG} fatG={fatG} />
          <hr className="divider" />
          <DietReview form={form} results={results} />
        </div>
      )}

      {/* ── Training ── */}
      {tab === "Training" && (
        <div className={styles.tabPanel}>
          <TrainingPlan form={form} results={results} />
        </div>
      )}

      {/* ── Tools ── */}
      {tab === "Tools" && (
        <div className={styles.tabPanel}>
          <ShareCard form={form} results={results} />
          <hr className="divider" />
          <CheckIn form={form} results={results} onApplyRecalibration={onApplyRecalibration} />
        </div>
      )}

      <div className={styles.footer}>
        <button className="btn btn-ghost" onClick={onRestart}>
          ← Start over
        </button>
      </div>
    </div>
  );
}