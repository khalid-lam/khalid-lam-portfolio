/* ==========================================================
   Animation de fond : réseau de neurones
   Des nœuds dérivent lentement et se relient quand ils sont
   proches ; la souris attire les liens vers elle.
   ========================================================== */
(() => {
  const canvas = document.getElementById("network-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const LINK_DIST = 170;     // distance max entre deux nœuds reliés (px)
  const MOUSE_DIST = 200;    // rayon d'influence de la souris (px)
  const SPEED = 0.18;

  let width = 0;
  let height = 0;
  let nodes = [];
  let colors = {};
  let rafId = null;
  const mouse = { x: -9999, y: -9999 };

  function readColors() {
    const style = getComputedStyle(document.documentElement);
    colors = {
      node: style.getPropertyValue("--net-node").trim(),
      line: style.getPropertyValue("--net-line").trim(),
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Densité proportionnelle à la surface, plafonnée pour les grands écrans
    const count = Math.min(110, Math.round((width * height) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * SPEED * 2,
      vy: (Math.random() - 0.5) * SPEED * 2,
      r: 1.2 + Math.random() * 1.8,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];

      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < LINK_DIST) {
          ctx.strokeStyle = `rgba(${colors.line}, ${0.22 * (1 - dist / LINK_DIST)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Liens vers la souris
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < MOUSE_DIST) {
        ctx.strokeStyle = `rgba(${colors.line}, ${0.45 * (1 - md / MOUSE_DIST)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      ctx.fillStyle = `rgba(${colors.node}, 0.38)`;
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    for (const n of nodes) {
      // Légère attraction vers la souris
      const dx = mouse.x - n.x;
      const dy = mouse.y - n.y;
      const md = Math.hypot(dx, dy);
      if (md < MOUSE_DIST && md > 1) {
        n.x += (dx / md) * 0.3;
        n.y += (dy / md) * 0.3;
      }

      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    }
    draw();
    rafId = requestAnimationFrame(step);
  }

  function start() {
    stop();
    if (reducedMotion.matches) {
      draw();   // image fixe
    } else {
      rafId = requestAnimationFrame(step);
    }
  }

  function stop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); start(); }, 150);
  });

  window.addEventListener("pointermove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener("pointerleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Pause quand l'onglet n'est pas visible
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });

  reducedMotion.addEventListener("change", start);

  readColors();
  resize();
  start();
})();
