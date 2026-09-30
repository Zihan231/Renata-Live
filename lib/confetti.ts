import confetti from "canvas-confetti";

const COLORS = ["#38d6ff", "#1f6bff", "#ffffff", "#ffc53d", "#064da1"];

export function celebrate() {
  const end = Date.now() + 1200;
  (function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS });
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export function burst(x = 0.5, y = 0.5) {
  confetti({ particleCount: 90, spread: 80, startVelocity: 38, origin: { x, y }, colors: COLORS });
}
