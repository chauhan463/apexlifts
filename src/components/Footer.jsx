import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.logo}>
        APEX<span>·LIFTS</span>
      </div>
      <span className={styles.sep}>·</span>
      <span className={styles.tagline}>Stop guessing. Start progressing.</span>
    </footer>
  );
}
