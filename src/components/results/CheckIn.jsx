import { useState, useEffect } from "react";
import { toKg } from "../../utils/calculations";
import styles from "./CheckIn.module.css";

const STORAGE_KEY = "apexlifts_checkins";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveEntry(entry) {
  try {
    const hist = loadHistory();
    hist.unshift(entry); // newest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hist.slice(0, 12))); // keep last 12
  } catch { /* storage unavailable */ }
}

/**
 * Returns the full working so the user can see exactly how
 * the recalibrated TDEE was derived.
 */
function recalibrate(form, results, newWeightVal) {
  const originalKg     = toKg(form.weightVal,  form.weightUnit);
  const newKg          = toKg(newWeightVal,     form.weightUnit);
  const actualChangeKg = newKg - originalKg;                        // + = gained, − = lost

  const totalConsumed    = results.targetCals * 7;
  const expectedChangeKg = ((results.targetCals - results.tdee) * 7) / 7700;
  const realSurplusDay   = (actualChangeKg * 7700) / 7;             // kcal/day net
  const realTDEE         = Math.round(results.targetCals - realSurplusDay);
  const originalOffset   = results.targetCals - results.tdee;       // negative = deficit
  const adjustedTarget   = Math.round(realTDEE + originalOffset);
  const tdeeDiff         = realTDEE - results.tdee;

  return {
    totalConsumed,
    expectedChangeKg,
    actualChangeKg,
    realSurplusDay: Math.round(realSurplusDay),
    realTDEE,
    originalOffset,
    adjustedTarget,
    tdeeDiff,
  };
}

function fmt(n, dec = 2) {
  const s = Math.abs(n).toFixed(dec);
  return n >= 0 ? `+${s}` : `−${s}`;
}

function fmtKcal(n) {
  return n >= 0 ? `+${Math.abs(n)}` : `−${Math.abs(n)}`;
}

export default function CheckIn({ form, results, onApplyRecalibration }) {
  const [open,      setOpen]      = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const [calc,      setCalc]      = useState(null);
  const [applied,   setApplied]   = useState(false);
  const [error,     setError]     = useState("");
  const [history,   setHistory]   = useState([]);

  useEffect(() => { setHistory(loadHistory()); }, [open]);

  const unit        = form.weightUnit;
  const startWeight = parseFloat(form.weightVal);
  const isDeficit   = results.targetCals < results.tdee;
  const offsetLabel = isDeficit
    ? `−${Math.abs(results.targetCals - results.tdee)} kcal deficit`
    : `+${results.targetCals - results.tdee} kcal surplus`;

  const handleSubmit = () => {
    const val = parseFloat(newWeight);
    if (!val || val <= 0) { setError("Enter your current weight."); return; }
    const origKg = toKg(form.weightVal, unit);
    const newKg  = toKg(newWeight, unit);
    if (Math.abs(newKg - origKg) > 5) {
      setError("That change seems large for 7 days — double-check your value.");
      return;
    }
    setError("");
    setApplied(false);
    setCalc(recalibrate(form, results, newWeight));
  };

  const handleApply = () => {
    if (!calc) return;
    onApplyRecalibration(calc.realTDEE, calc.adjustedTarget);
    const entry = {
      id:             Date.now(),
      date:           new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      weightVal:      parseFloat(newWeight),
      unit,
      actualChangeKg: calc.actualChangeKg,
      realTDEE:       calc.realTDEE,
      adjustedTarget: calc.adjustedTarget,
      tdeeDiff:       calc.tdeeDiff,
    };
    saveEntry(entry);
    setHistory(loadHistory());
    setApplied(true);
  };

  const handleRedo = () => { setCalc(null); setNewWeight(""); setApplied(false); setError(""); };

  return (
    <div className={styles.wrap}>
      <button className={styles.toggle} onClick={() => setOpen((o) => !o)}>
        <div className={styles.toggleLeft}>
          <span className={styles.toggleTitle}>7-Day Check-In</span>
          <span className={styles.toggleSub}>
            {history.length > 0
              ? `${history.length} check-in${history.length > 1 ? "s" : ""} recorded — come back weekly to track adaptation`
              : "Come back after 7 days — recalibrate your TDEE with real data"}
          </span>
        </div>
        <span className={styles.toggleChevron}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className={styles.body}>

          {/* ── Input panel ── */}
          {!calc ? (
            <>
              <div className={styles.howTo}>
                <span className={styles.howToIcon}>⏰</span>
                <span>
                  Weigh yourself <strong>first thing in the morning</strong>, after the bathroom,
                  before eating — same conditions as your original weigh-in.
                  Daily fluctuations of ±1–2 {unit} are normal (water, sodium, glycogen).
                  One consistent reading is what matters.
                </span>
              </div>

              <div className={styles.expectRow}>
                <span>At your {offsetLabel}, expect</span>
                <span className={styles.expectVal}>
                  {fmt(((results.targetCals - results.tdee) * 7) / 7700)} {unit} over 7 days
                </span>
              </div>

              <div className={styles.inputBlock}>
                <div className={styles.startRef}>
                  <span className={styles.startRefLabel}>Starting weight</span>
                  <span className={styles.startRefVal}>{startWeight} {unit}</span>
                </div>
                <div className={styles.inputLabel}>Your weight today ({unit})</div>
                <div className={styles.inputRow}>
                  <div className={styles.inputWrap}>
                    <input
                      type="number"
                      placeholder={String(startWeight)}
                      value={newWeight}
                      onChange={(e) => { setNewWeight(e.target.value); setError(""); }}
                      className={styles.input}
                    />
                    <span className={styles.inputUnit}>{unit}</span>
                  </div>
                  <button className={`btn btn-primary ${styles.btn}`} onClick={handleSubmit}>
                    Calculate →
                  </button>
                </div>
                {error && <div className={styles.err}>{error}</div>}
              </div>
            </>
          ) : (
            /* ── Result panel ── */
            <div className={styles.result}>

              {/* Working */}
              <div className={styles.working}>
                <div className={styles.workingTitle}>The maths</div>
                <div className={styles.workingRows}>
                  <div className={styles.workingRow}>
                    <span>You ate</span>
                    <span>{results.targetCals.toLocaleString()} kcal/day × 7 days = <strong>{calc.totalConsumed.toLocaleString()} kcal</strong></span>
                  </div>
                  <div className={styles.workingRow}>
                    <span>Expected change</span>
                    <span>{fmt(calc.expectedChangeKg)} {unit} at your {offsetLabel}</span>
                  </div>
                  <div className={styles.workingRow}>
                    <span>Actual change</span>
                    <span className={styles.orange}><strong>{fmt(calc.actualChangeKg)} {unit}</strong></span>
                  </div>
                  <div className={`${styles.workingRow} ${styles.workingCalc}`}>
                    <span>Real deficit/surplus</span>
                    <span>{fmt(calc.actualChangeKg)} {unit} × 7,700 ÷ 7 = <strong>{fmtKcal(calc.realSurplusDay)} kcal/day</strong></span>
                  </div>
                  <div className={`${styles.workingRow} ${styles.workingCalc}`}>
                    <span>Real TDEE</span>
                    <span>{results.targetCals} − ({fmtKcal(calc.realSurplusDay)}) = <strong className={styles.orange}>{calc.realTDEE.toLocaleString()} kcal</strong></span>
                  </div>
                </div>
              </div>

              {/* Verdict */}
              <div className={styles.verdict}>
                <div className={styles.verdictLeft}>
                  <div className={styles.verdictLabel}>Formula estimate</div>
                  <div className={styles.verdictNum}>{results.tdee.toLocaleString()}</div>
                  <div className={styles.verdictUnit}>kcal maintenance</div>
                </div>
                <div className={styles.verdictArrow}>
                  <span className={calc.tdeeDiff === 0 ? styles.green : styles.amber}>
                    {calc.tdeeDiff === 0 ? "=" : fmtKcal(calc.tdeeDiff) + " kcal"}
                  </span>
                </div>
                <div className={styles.verdictRight}>
                  <div className={styles.verdictLabel}>Your real TDEE</div>
                  <div className={`${styles.verdictNum} ${styles.orange}`}>{calc.realTDEE.toLocaleString()}</div>
                  <div className={styles.verdictUnit}>kcal maintenance</div>
                </div>
              </div>

              {/* New target */}
              <div className={styles.newTarget}>
                <div className={styles.newTargetLabel}>New daily target (same {isDeficit ? "deficit" : "surplus"})</div>
                <div className={styles.newTargetNum}>{calc.adjustedTarget.toLocaleString()} <span>kcal / day</span></div>
                <p className={styles.newTargetNote}>
                  {calc.tdeeDiff === 0
                    ? "Your TDEE estimate was accurate. Keep going — no adjustment needed."
                    : calc.tdeeDiff < 0
                      ? `Your body burns ${Math.abs(calc.tdeeDiff)} kcal less than the formula predicted. Dropping to ${calc.adjustedTarget} kcal maintains the same ${isDeficit ? "deficit" : "surplus"}.`
                      : `Your body burns ${Math.abs(calc.tdeeDiff)} kcal more than the formula predicted. You can eat ${calc.adjustedTarget} kcal and still hit the same ${isDeficit ? "deficit" : "surplus"}.`
                  }
                </p>
                <p className={styles.noiseWarning}>
                  ⚠ One week of data includes water-weight noise. If this adjustment feels large, do another check-in next week before changing your diet.
                </p>
              </div>

              {applied ? (
                <div className={styles.appliedBadge}>
                  ✓ Target updated to {calc.adjustedTarget} kcal — scroll up to see your new numbers
                </div>
              ) : (
                <button className={`btn btn-primary ${styles.applyBtn}`} onClick={handleApply}>
                  Apply — update my target to {calc.adjustedTarget} kcal
                </button>
              )}

              <button className={`btn btn-ghost ${styles.redo}`} onClick={handleRedo}>
                ← Re-enter weight
              </button>
            </div>
          )}

          {/* ── History table ── */}
          {history.length > 0 && (
            <div className={styles.histSection}>
              <div className={styles.histTitle}>Check-in history</div>
              <div className={styles.histTable}>
                <div className={`${styles.histRow} ${styles.histHead}`}>
                  <span>Date</span>
                  <span>Weight</span>
                  <span>Real TDEE</span>
                  <span>Target</span>
                  <span>Drift</span>
                </div>
                {history.map((h) => (
                  <div className={styles.histRow} key={h.id}>
                    <span>{h.date}</span>
                    <span>{h.weightVal} {h.unit}</span>
                    <span>{h.realTDEE.toLocaleString()}</span>
                    <span>{h.adjustedTarget.toLocaleString()}</span>
                    <span className={h.tdeeDiff < -30 ? styles.amber : h.tdeeDiff > 30 ? styles.green : styles.muted}>
                      {h.tdeeDiff === 0 ? "±0" : fmtKcal(h.tdeeDiff)} kcal
                    </span>
                  </div>
                ))}
              </div>
              <p className={styles.histNote}>
                Watch the "Drift" column over time — a consistent negative drift signals metabolic adaptation.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
