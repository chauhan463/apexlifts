import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <span className={styles.apex}>APEX</span>
        <span className={styles.dot}>·</span>
        <span className={styles.lifts}>LIFTS</span>
      </div>
    </header>
  );
}
