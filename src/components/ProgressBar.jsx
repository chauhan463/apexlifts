import styles from "./ProgressBar.module.css";

export default function ProgressBar({ value }) {
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${value}%` }} />
    </div>
  );
}
