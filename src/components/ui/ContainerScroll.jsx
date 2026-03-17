/**
 * ContainerScroll — adapted from Aceternity UI (aceternity.com/components)
 * Original: TypeScript + Tailwind CSS
 * Adapted:  JSX + CSS Modules (no Tailwind, no Next.js)
 *
 * Usage:
 *   <ContainerScroll titleComponent={<YourHeading />}>
 *     <img src="..." />   ← shown inside the 3D rotating card
 *   </ContainerScroll>
 */
import { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import React from "react";
import styles from "./ContainerScroll.module.css";

export const ContainerScroll = ({ titleComponent, children }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = () => (isMobile ? [0.7, 0.9] : [1.05, 1]);

  const rotate    = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale     = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inner} style={{ perspective: "1000px" }}>
        {/* Title / hero text — translates upward on scroll */}
        <motion.div style={{ translateY: translate }} className={styles.header}>
          {titleComponent}
        </motion.div>

        {/* 3D card — rotates from tilted to flat as you scroll */}
        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
          }}
          className={styles.card}
        >
          <div className={styles.cardInner}>{children}</div>
        </motion.div>
      </div>
    </div>
  );
};
