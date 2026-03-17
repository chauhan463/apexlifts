import styles from "./DeficitBanner.module.css";

const Protocol = ({ protocol }) => {
  if (!protocol) return null;
  return (
    <div className={styles.protocol}>
      <div className={styles.protocolTitle}>{protocol.title}</div>
      <div className={styles.protocolRows}>
        {protocol.rows.map((r, i) => (
          <div className={styles.protocolRow} key={i}>
            <span>{r.label}</span>
            <span>{r.value}</span>
          </div>
        ))}
      </div>
      {protocol.note && <p className={styles.protocolNote}>{protocol.note}</p>}
    </div>
  );
};

export default function DeficitBanner({ analysis }) {
  if (!analysis) return null;

  const { alerts, warns, goods, dietBreak, reverse, protocol } = analysis;

  // Support both old (dietBreak/reverse) and new (protocol) structure
  const shownProtocol = protocol || (dietBreak ? {
    title: "📋 Recommended: Diet Break",
    rows: [
      { label: "Eat at",    value: `${dietBreak.cals} kcal / day` },
      { label: "Duration",  value: dietBreak.duration },
      { label: "After",     value: dietBreak.after },
    ],
    note: "A diet break at maintenance resets leptin, reduces cortisol, and restores metabolic rate — making the next cut phase more effective.",
  } : null) || (reverse ? {
    title: "🔄 Recommended: Reverse Diet",
    rows: [
      { label: "Current adapted maintenance", value: `${reverse.currentMaintenance} kcal` },
      { label: "Increase by",                 value: `+${reverse.weeklyIncrease} kcal / week` },
      { label: "Target maintenance",          value: `${reverse.targetMaintenance} kcal` },
      { label: "Estimated time",              value: `~${reverse.weeksToReverse} weeks` },
    ],
    note: "Slowly increasing calories trains your metabolism back up without adding fat. Then cut again from a higher, healthier baseline.",
  } : null);

  return (
    <div className={styles.wrap}>
      <div className="section-label">Phase analysis</div>

      {alerts.map((a, i) => (
        <div key={i} className={`${styles.card} ${styles.alert}`}>
          <span className={styles.icon}>🚨</span>
          <p>{a}</p>
        </div>
      ))}
      {warns.map((w, i) => (
        <div key={i} className={`${styles.card} ${styles.warn}`}>
          <span className={styles.icon}>⚠️</span>
          <p>{w}</p>
        </div>
      ))}
      {goods.map((g, i) => (
        <div key={i} className={`${styles.card} ${styles.good}`}>
          <span className={styles.icon}>✅</span>
          <p>{g}</p>
        </div>
      ))}

      <Protocol protocol={shownProtocol} />
    </div>
  );
}