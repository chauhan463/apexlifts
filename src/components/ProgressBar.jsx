import styles from "./ProgressBar.module.css";

export default function ProgressBar({ value, step, stepNames }) {
  const showSteps = stepNames && step >= 1 && step <= 3;

  return (
    <div className={styles.wrap}>
      {showSteps && (
        <div className={styles.steps}>
          {Object.entries(stepNames).map(([num, name]) => {
            const n = Number(num);
            const state = n < step ? "done" : n === step ? "active" : "upcoming";
            return (
              <div key={num} className={`${styles.step} ${styles[state]}`}>
                <span className={styles.stepDot}>{state === "done" ? "✓" : n}</span>
                <span className={styles.stepName}>{name}</span>
              </div>
            );
          })}
        </div>
      )}
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
