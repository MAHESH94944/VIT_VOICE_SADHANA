// Lightweight confetti: creates a canvas and animates particles briefly
export default function fireConfetti({
  particleCount = 80,
  spread = 60,
  duration = 1500,
} = {}) {
  const colors = ["#ff7a59", "#ffd166", "#06d6a0", "#118ab2", "#8b5cf6"];
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 100;
    const angle = (Math.random() - 0.5) * (spread * (Math.PI / 180));
    const speed = 4 + Math.random() * 6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed * (Math.random() + 0.4),
      vy: Math.sin(angle) * speed * (Math.random() + 0.4) - 6,
      size: 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
    });
  }

  const start = performance.now();
  function render(now) {
    const t = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.vy += 0.25; // gravity
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    if (t < duration) requestAnimationFrame(render);
    else {
      document.body.removeChild(canvas);
    }
  }
  requestAnimationFrame(render);
}
