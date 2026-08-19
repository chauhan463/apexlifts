import { useState, useEffect, useRef } from "react";
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

// Animates 0 → value on mount — makes the results reveal feel alive
function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const from = first.current ? 0 : value;
    first.current = false;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

// Renders a number that counts up; keeps a leading sign/symbol static (e.g. "+300", "±0")
function CountUp({ value }) {
  const str = String(value);
  const match = str.match(/^([+\-±])?(\d+)$/);
  const animated = useCountUp(match ? Number(match[2]) : 0);
  if (!match) return <>{str}</>;
  return <>{match[1] || ""}{animated.toLocaleString()}</>;
}

export default function Results({ form, results, onRestart, onApplyRecalibration, onBackToDashboard, initialTab }) {
  const [tab, setTab] = useState(initialTab || "Overview");
  const { tdee, targetCals, proteinG, carbG, fatG } = results;

  // Calorie share per macro (not gram share — fat is 9 kcal/g, protein/carbs are 4)
  const totalKcal = proteinG * 4 + carbG * 4 + fatG * 9 || 1;
  const pPct = Math.round((proteinG * 4 / totalKcal) * 100);
  const cPct = Math.round((carbG * 4 / totalKcal) * 100);
  const macroPct = { p: pPct, c: cPct, f: 100 - pPct - cPct };

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
                <div className={styles.statNum}><CountUp value={s.n} /></div>
                <div className={styles.statUnit}>{s.u}</div>
                <div className={styles.statLabel}>{s.l}</div>
              </div>
            ))}
          </div>

          {results.deficitStep && (
            <DeficitStep deficitStep={results.deficitStep} tdee={tdee} goal={form.goal} />
          )}

          <div className="section-label" style={{ marginTop: 16 }}>Macro breakdown</div>

          {/* Calorie-share proportion bar — protein/carbs/fat by kcal, not grams */}
          <div className={styles.macroBar} role="img" aria-label={`${macroPct.p}% protein, ${macroPct.c}% carbs, ${macroPct.f}% fat by calories`}>
            <div className={`${styles.macroBarSeg} ${styles.p}`} style={{ flexBasis: `${macroPct.p}%` }} />
            <div className={`${styles.macroBarSeg} ${styles.c}`} style={{ flexBasis: `${macroPct.c}%` }} />
            <div className={`${styles.macroBarSeg} ${styles.f}`} style={{ flexBasis: `${macroPct.f}%` }} />
          </div>

          <div className={styles.macrosGrid}>
            {[
              { cls: "p", g: proteinG, nm: "Protein",       kcal: proteinG * 4, pct: macroPct.p },
              { cls: "c", g: carbG,    nm: "Carbohydrates", kcal: carbG * 4,    pct: macroPct.c },
              { cls: "f", g: fatG,     nm: "Fats",          kcal: fatG * 9,     pct: macroPct.f },
            ].map((m) => (
              <div className={`${styles.macroTile} ${styles[m.cls]}`} key={m.cls}>
                <div className={styles.macroG}><CountUp value={m.g} />g</div>
                <div className={styles.macroNm}>{m.nm} · {m.pct}%</div>
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
        {onBackToDashboard && (
          <button className="btn btn-ghost" onClick={onBackToDashboard}>
            ← Dashboard
          </button>
        )}
        <button className="btn btn-ghost" onClick={onRestart}>
          Start over
        </button>
      </div>
    </div>
  );
}