(() => {
  const section = document.querySelector('.hbx-centered');
  if (!section) return;
  const host = section.querySelector('.hbx-atmosphere');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  host.append(canvas);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let width = 0, height = 0, visible = false, frame = 0, last = 0, time = 0;
  const points = [];
  for (let row = 1; row < 29; row++) {
    const latitude = row / 29 * Math.PI / 2;
    const count = Math.round(105 * Math.sin(latitude));
    for (let column = 0; column < count; column++) {
      points.push([latitude, column / count * Math.PI * 2]);
    }
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const globe = Number(host.dataset.globe || 0);
    const scale = Math.min(width / 1200, height / 760) * (1 - .23 * globe);
    const radius = 490 * scale;
    const centerX = width / 2, baseY = height / 2 + (190 - 190 * globe) * scale;
    const pulse = .5 + .5 * Math.sin(time * .65);
    const glow = ctx.createRadialGradient(centerX, baseY, 20, centerX, baseY, radius * 1.12);
    glow.addColorStop(0, 'rgba(244,102,73,0)');
    glow.addColorStop(.7, `rgba(244,102,73,${.035 + pulse * .025})`);
    glow.addColorStop(1, 'rgba(244,102,73,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    for (const [sourceLatitude, longitude] of points) {
      const latitude = sourceLatitude * (1 + globe);
      const angle = longitude + time * .065;
      const ring = radius * Math.sin(latitude);
      const x = centerX + ring * Math.cos(angle);
      const y = baseY - 475 * scale * Math.cos(latitude) + 115 * scale * Math.sin(latitude) * Math.sin(angle);
      const edge = Math.abs(x - centerX) / radius;
      const wave = Math.pow(Math.max(0, Math.cos(latitude * 5 - time * .8)), 12);
      const alpha = .12 + edge * .32 + wave * .25;
      ctx.fillStyle = `rgba(244,102,73,${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, Math.max(.65, 1.25 * scale), 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = `rgba(244,102,73,${.23 + pulse * .18})`;
    ctx.lineWidth = 1;
    ctx.shadowColor = '#f46649'; ctx.shadowBlur = 14 + pulse * 12;
    ctx.beginPath();ctx.ellipse(centerX, baseY, radius, 115 * scale, 0, 0, Math.PI);ctx.stroke();
    // Round data lights travel along the front rim, without streaks.
    for (let i = 0; i < 3; i++) {
      const angle = ((time * .14 + i * Math.PI / 3) % Math.PI);
      const fade = Math.sin(angle);
      ctx.fillStyle = `rgba(255,232,212,${fade * .8})`;
      ctx.beginPath();ctx.arc(centerX + radius * Math.cos(angle), baseY + 115 * scale * Math.sin(angle), 2.3 * scale, 0, Math.PI * 2);ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || reduced.matches) { last = 0; return; }
    if (last) time += Math.min((now - last) / 1000, .05);
    last = now;
    draw(); frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    if (reduced.matches) { host.classList.remove('is-animated'); return; }
    host.classList.add('is-animated');
    draw();
    if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  new ResizeObserver(() => {
    width = host.clientWidth; height = host.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); draw();
  }).observe(host);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }).observe(section);
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
})();
