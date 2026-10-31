let parts = [];
let running = false;

export function fireConfetti(cv, colors) {
  const ctx = cv.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap for cheap Android GPUs
  cv.width = cv.clientWidth * dpr;
  cv.height = cv.clientHeight * dpr;
  const W = cv.width;
  const H = cv.height;
  const count = cv.clientWidth < 640 ? 90 : 180;

  for (let i = 0; i < count; i++) {
    parts.push({
      x: W / 2 + (Math.random() - 0.5) * W * 0.3,
      y: H * 0.45,
      vx: (Math.random() - 0.5) * W * 0.035,
      vy: -Math.random() * H * 0.03 - H * 0.008,
      w: (6 + Math.random() * 10) * dpr,
      h: (4 + Math.random() * 6) * dpr,
      r: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[(Math.random() * colors.length) | 0],
      life: 0,
    });
  }

  if (running) return;
  running = true;

  const draw = () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const g = cv.height * 0.0009;
    for (const p of parts) {
      p.vy += g;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life * 0.15)));
      ctx.restore();
    }
    parts = parts.filter((p) => p.y < cv.height + 40 && p.life < 400);
    if (parts.length) requestAnimationFrame(draw);
    else {
      running = false;
      ctx.clearRect(0, 0, cv.width, cv.height);
    }
  };
  requestAnimationFrame(draw);
}