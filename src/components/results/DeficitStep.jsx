import styles from "./DeficitStep.module.css";

const CONFIGS = {
  "Lose fat": {
    key:   "deficit",
    steps: [
      { weeks: "0–4 wks",  value: -200, label: "Foundation", display: "−200 kcal" },
      { weeks: "4–8 wks",  value: -300, label: "Step 1",     display: "−300 kcal" },
      { weeks: "8–12 wks", value: -400, label: "Step 2",     display: "−400 kcal" },
      { weeks: "12+ wks",  value: null, label: "Diet Break", display: "🔄 Break"  },
    ],
    next: {
      [-200]: "Next step at week 4: deficit increases to −300 kcal as your body begins adapting.",
      [-300]: "Next step at week 8: deficit increases to −400 kcal. After week 12, a diet break resets your metabolism.",
      [-400]: (tdee) => `At week 12, take a diet break at ${tdee} kcal for 1–2 weeks before continuing.`,
    },
    finalLabel: "Maximum deficit reached",
  },
  "Build muscle": {
    key:   "surplus",
    steps: [
      { weeks: "0 wks",    value: +150, label: "Foundation", display: "+150 kcal" },
      { weeks: "1–4 wks",  value: +200, label: "Step 1",     display: "+200 kcal" },
      { weeks: "4–8 wks",  value: +300, label: "Peak",       display: "+300 kcal" },
      { weeks: "8–12 wks", value: +300, label: "Sustain",    display: "+300 kcal" },
      { weeks: "12+ wks",  value: null, label: "Mini Cut",   display: "✂️ Cut"    },
    ],
    next: {
      [150]: "Next step at week 1: surplus increases to +200 kcal as muscle protein synthesis ramps up.",
      [200]: "Next step at week 4: surplus increases to +300 kcal — the prime hypertrophy window.",
      [300]: (_, label) => label === "Sustain surplus"
        ? "At week 12, a 3–4 week mini cut at −200 kcal will restore insulin sensitivity for a better next bulk."
        : "Maintain this surplus through weeks 8–12. Focus on progressive overload, not more food.",
    },
    finalLabel: "Mini cut recommended",
  },
};

export default function DeficitStep({ deficitStep, tdee, goal }) {
  if (!deficitStep) return null;

  const config = CONFIGS[goal];
  if (!config) return null;

  const activeValue = deficitStep[config.key] ?? deficitStep.surplus ?? deficitStep.deficit;
  const isFinal     = deficitStep.label === config.finalLabel;

  // For "next step" hint text
  const nextHint = config.next[activeValue];
  const nextText = typeof nextHint === "function"
    ? nextHint(tdee, deficitStep.label)
    : nextHint;

  return (
    <div className={styles.wrap}>
      {/* Badge + reason */}
      <div className={styles.header}>
        <span className={styles.badge}>{deficitStep.label}</span>
        <p className={styles.reason}>{deficitStep.reason}</p>
      </div>

      {/* Step ladder */}
      <div className={styles.ladder} style={{ gridTemplateColumns: `repeat(${config.steps.length}, 1fr)` }}>
        {config.steps.map((step, i) => {
          const stepVal  = step.value;
          const isActive = stepVal === activeValue || (stepVal === null && isFinal);
          // "past" = steps before the active one
          const activeIdx = config.steps.findIndex(
            s => s.value === activeValue || (s.value === null && isFinal)
          );
          const isPast = i < activeIdx;

          return (
            <div
              key={i}
              className={`${styles.step} ${isActive ? styles.active : ""} ${isPast ? styles.past : ""}`}
            >
              <div className={styles.stepBar} />
              <div className={styles.stepInfo}>
                <span className={styles.stepLabel}>{step.label}</span>
                <span className={styles.stepValue}>{step.display}</span>
                <span className={styles.stepWeeks}>{step.weeks}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next step hint */}
      {nextText && !isFinal && (
        <p className={styles.next}>{nextText}</p>
      )}
    </div>
  );
}