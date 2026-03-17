import { useRef } from "react";
import styles from "./ShareCard.module.css";

const drawCard = (canvas, form, results) => {
  const W = 1080, H = 1080;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, W, H);

  // Grid texture
  ctx.strokeStyle = "rgba(255,92,0,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 64) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Orange accent bar top
  ctx.fillStyle = "#ff5c00";
  ctx.fillRect(0, 0, W, 6);

  // Logo
  ctx.font = "900 52px Arial Black, sans-serif";
  ctx.fillStyle = "#f0ede8";
  ctx.fillText("APEX", 80, 110);
  ctx.fillStyle = "#ff5c00";
  ctx.fillText("·LIFTS", 222, 110);

  // "AI-Powered Coach" badge
  ctx.font = "500 22px Arial, sans-serif";
  ctx.fillStyle = "#555555";
  ctx.fillText("Science-backed · Free", 80, 148);

  // Divider
  ctx.strokeStyle = "#272727";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(80, 175); ctx.lineTo(W - 80, 175); ctx.stroke();

  // Hero name
  const name = form.name ? `${form.name}'s` : "Your";
  ctx.font = "900 88px Arial Black, sans-serif";
  ctx.fillStyle = "#f0ede8";
  ctx.fillText(name, 80, 290);
  ctx.fillStyle = "#ff5c00";
  ctx.fillText("Blueprint.", 80, 390);

  // Goal tag
  ctx.font = "700 28px Arial, sans-serif";
  ctx.fillStyle = "#555555";
  ctx.fillText(`Goal: ${form.goal}  ·  ${form.job || ""}`, 80, 440);

  // Divider
  ctx.strokeStyle = "#272727";
  ctx.beginPath(); ctx.moveTo(80, 470); ctx.lineTo(W - 80, 470); ctx.stroke();

  // Stats grid — 2×2
  const stats = [
    { n: results.targetCals, u: "kcal / day", l: "Target Calories"   },
    { n: results.tdee,       u: "kcal / day", l: "Maintenance"       },
    { n: results.proteinG,   u: "g / day",    l: "Protein"           },
    { n: `${results.carbG}g / ${results.fatG}g`, u: "carbs / fat", l: "Carbs & Fat" },
  ];

  const tileW = 440, tileH = 180;
  const startX = 80, startY = 510;

  stats.forEach((s, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const tx = startX + col * (tileW + 40);
    const ty = startY + row * (tileH + 20);

    // Tile bg
    ctx.fillStyle = "#161616";
    roundRect(ctx, tx, ty, tileW, tileH, 14);
    ctx.fill();

    // Top accent line
    ctx.fillStyle = "#ff5c00";
    roundRect(ctx, tx, ty, tileW, 3, [14, 14, 0, 0]);
    ctx.fill();

    // Number
    ctx.font = "900 64px Arial Black, sans-serif";
    ctx.fillStyle = "#ff5c00";
    ctx.fillText(String(s.n), tx + 24, ty + 82);

    // Unit
    ctx.font = "400 22px Arial, sans-serif";
    ctx.fillStyle = "#555555";
    ctx.fillText(s.u, tx + 24, ty + 112);

    // Label
    ctx.font = "500 24px Arial, sans-serif";
    ctx.fillStyle = "#888888";
    ctx.fillText(s.l, tx + 24, ty + 152);
  });

  // Bottom CTA
  ctx.fillStyle = "#ff5c00";
  roundRect(ctx, 80, 960, W - 160, 80, 14);
  ctx.fill();

  ctx.font = "900 30px Arial Black, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.fillText("apexlifts.vercel.app  ·  Free. No sign up.", W / 2, 1008);
  ctx.textAlign = "left";
};

// Helper — rounded rect
const roundRect = (ctx, x, y, w, h, r) => {
  const radii = Array.isArray(r) ? r : [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + radii[0], y);
  ctx.lineTo(x + w - radii[1], y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radii[1]);
  ctx.lineTo(x + w, y + h - radii[2]);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radii[2], y + h);
  ctx.lineTo(x + radii[3], y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radii[3]);
  ctx.lineTo(x, y + radii[0]);
  ctx.quadraticCurveTo(x, y, x + radii[0], y);
  ctx.closePath();
};

const triggerDownload = (canvas) => {
  const link = document.createElement("a");
  link.download = "apex-lifts-blueprint.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

export default function ShareCard({ form, results }) {
  const canvasRef = useRef(null);

  const handleShare = () => {
    const canvas = canvasRef.current;
    drawCard(canvas, form, results);

    // Native Web Share API — on mobile this opens the OS share sheet
    // (Instagram, WhatsApp, iMessage, etc.) — the viral mechanic
    if (typeof navigator.share === "function") {
      canvas.toBlob((blob) => {
        const file = new File([blob], "apex-lifts-blueprint.png", { type: "image/png" });
        navigator
          .share({
            files: [file],
            title: `${form.name ? form.name + "'s" : "My"} Apex.Lifts Blueprint`,
            text: `${results.targetCals} kcal · ${results.proteinG}g protein — get yours free at apexlifts.vercel.app`,
          })
          .catch(() => triggerDownload(canvas));
      });
    } else {
      triggerDownload(canvas);
    }
  };

  const isMobile = typeof navigator !== "undefined" && /Mobi|Android/i.test(navigator.userAgent);

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <button className={`btn btn-primary ${styles.shareBtn}`} onClick={handleShare}>
        <span>{isMobile ? "📲" : "⬇️"}</span>{" "}
        {isMobile ? "Share my blueprint" : "Download my blueprint card"}
      </button>
      <p className={styles.hint}>
        1080×1080px ·{" "}
        {isMobile ? "Share to Instagram, WhatsApp & more" : "Perfect for Instagram stories & posts"}
      </p>
    </div>
  );
}