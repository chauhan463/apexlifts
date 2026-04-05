import styles from "./Intro.module.css";

const FEATURES = [
  ["📊", "Calories & macros calculated for your exact body"],
  ["🤖", "Personal AI insight based on your job & lifestyle"],
  ["🏋️", "Custom weekly training split"],
  ["🍽️", "Diet gap analysis vs your real targets"],
];

export default function Intro({ onStart, savedSession, stepNames, onContinue, onStartFresh }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.eyebrow}>Apex.Lifts · Free Fitness Tool</div>

      <h1 className={styles.h1}>
        <span className={styles.line1}>Stop guessing.</span>
        <span className={styles.accent}>Start progressing.</span>
      </h1>

      <p className={styles.sub}>Science-backed. Personally yours.</p>

      <p className={styles.body}>
        Generic plans don't work because{" "}
        <strong>you're not generic.</strong> Get your exact maintenance
        calories, personalised macros, and an AI coach that actually
        understands your lifestyle — in under 2 minutes.
      </p>

      <div className={styles.feats}>
        {FEATURES.map(([icon, text]) => (
          <div className={styles.feat} key={text}>
            <span className={styles.featIcon}>{icon}</span>
            <span>{text}</span>
          </div>
        ))}
      </div>

      {savedSession ? (
        <div className={styles.sessionBanner}>
          <div className={styles.sessionText}>
            <span className={styles.sessionIcon}>⚡</span>
            <span>
              You were on <strong>{stepNames[savedSession.step]}</strong> — pick up where you left off
            </span>
          </div>
          <div className={styles.sessionBtns}>
            <button className={`btn btn-primary ${styles.cta}`} onClick={onContinue}>
              Continue →
            </button>
            <button className={`btn btn-ghost ${styles.ctaSecondary}`} onClick={onStartFresh}>
              Start fresh
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.ctaGroup}>
          <button className={`btn btn-primary ${styles.cta}`} onClick={onStart}>
            Get my numbers — free →
          </button>
          <p className={styles.trust}>
            No account · No email · Your data never leaves this device
          </p>
        </div>
      )}
    </div>
  );
}
