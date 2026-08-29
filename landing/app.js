/* ===================================================
   DataPulse — app.js
   Interactive animations & live data simulation
   =================================================== */

'use strict';

// ─── SCROLL PROGRESS BAR ────────────────────────────
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  if (scrollProgress) scrollProgress.style.width = pct + '%';
}, { passive: true });

// ─── NAVBAR SCROLL ─────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ─── CURSOR GLOW ───────────────────────────────────
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow) {
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function animCursor() {
    cx += (tx - cx) * 0.09;
    cy += (ty - cy) * 0.09;
    cursorGlow.style.left = cx + 'px';
    cursorGlow.style.top  = cy + 'px';
    requestAnimationFrame(animCursor);
  })();
}

// ─── THEME TOGGLE ──────────────────────────────────
const themeToggle = document.getElementById('theme-toggle');
let isDark = true;
themeToggle && themeToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'light');
  themeToggle.textContent = isDark ? '🌙' : '☀️';
  themeToggle.style.background = isDark
    ? 'linear-gradient(135deg, #7c3aed, #5b21b6)'
    : 'linear-gradient(135deg, #f59e0b, #d97706)';
  // Update orb visibility for light mode
  document.querySelectorAll('.orb').forEach(o => {
    o.style.opacity = isDark ? '0.45' : '0.18';
  });
});

// ─── PARTICLE CANVAS ───────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('canvas-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  const COLORS = ['#7c3aed', '#a78bfa', '#06b6d4', '#22d3ee', '#5b21b6'];
  const COUNT  = Math.min(80, Math.floor(window.innerWidth / 14));

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  class Particle {
    constructor() { this.reset(true); }
    reset(initial) {
      this.x  = randBetween(0, W);
      this.y  = initial ? randBetween(0, H) : H + 10;
      this.r  = randBetween(0.5, 2.2);
      this.vx = randBetween(-0.3, 0.3);
      this.vy = randBetween(-0.4, -0.9);
      this.life   = 1;
      this.decay  = randBetween(0.0015, 0.004);
      this.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.glow   = this.r > 1.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -10) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.life * 0.75;
      if (this.glow) {
        ctx.shadowColor = this.color;
        ctx.shadowBlur  = 12;
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Draw connecting lines between nearby particles
  function drawConnections() {
    const MAX_DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.save();
          ctx.globalAlpha = (1 - d / MAX_DIST) * 0.12;
          ctx.strokeStyle = '#7c3aed';
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ─── HAMBURGER ─────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navLinks.style.display = navLinks.classList.contains('open') ? 'flex' : 'none';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '68px';
  navLinks.style.left = '0';
  navLinks.style.right = '0';
  navLinks.style.background = 'rgba(6,8,19,.97)';
  navLinks.style.padding = '16px 24px';
  navLinks.style.borderBottom = '1px solid rgba(255,255,255,.08)';
});

// ─── INTERSECTION OBSERVER (REVEAL) ───────────────
const revealEls = document.querySelectorAll(
  '.feature-card, .step, .price-card, .testi-card, .trust-card, .stat-row, .chart-row, .feed-card, .stats-bar, .cta-content'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// ─── COUNTER ANIMATION ────────────────────────────
function animateCounter(el, target, suffix = '', prefix = '', duration = 1800) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.floor(eased * target);
    el.textContent = prefix + val.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Revenue counter in mockup
const revenueEl = document.getElementById('anim-revenue');
const usersEl   = document.getElementById('anim-users');
const revenueObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateCounter(revenueEl, 2418000, '', '$', 2000);
    setTimeout(() => {
      revenueEl.textContent = '$2,418,000';
      // format nicely
      revenueEl.textContent = '$2.4M';
    }, 2050);
    animateCounter(usersEl, 12847, '');
    revenueObs.disconnect();
  }
}, { threshold: 0.3 });
if (revenueEl) revenueObs.observe(revenueEl);

// Stats section counters
const counterUsers  = document.getElementById('counter-users');
const counterEvents = document.getElementById('counter-events');
const statsBarObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    animateCounter(counterUsers, 10000, '+');
    animateCounter(counterEvents, 50, 'B+');
    statsBarObs.disconnect();
  }
}, { threshold: 0.3 });
const statsBar = document.getElementById('stats-bar');
if (statsBar) statsBarObs.observe(statsBar);

// ─── MINI BAR FILLS ───────────────────────────────
const miniBarObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.mini-bar-fill').forEach(bar => {
        bar.style.width = bar.style.getPropertyValue('--w') ||
          getComputedStyle(bar).getPropertyValue('--w');
      });
      miniBarObs.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });
document.querySelectorAll('.stat-card').forEach(el => {
  // force fill via style update
  el.querySelectorAll('.mini-bar-fill').forEach(bar => {
    bar.style.width = '0';
  });
  miniBarObs.observe(el);
});

// Force them on load for the mockup
setTimeout(() => {
  document.querySelectorAll('.mini-bar-fill').forEach(bar => {
    const w = bar.style.cssText.match(/--w:\s*([^;]+)/)?.[1] || '0';
    bar.style.width = w;
  });
}, 400);

// ─── LINE CHART ───────────────────────────────────
const chartData = {
  '7d':  [40, 55, 45, 65, 72, 60, 88, 95, 70, 80, 100, 92],
  '30d': [20, 40, 35, 55, 48, 70, 65, 80, 75, 90, 85, 105],
  '90d': [15, 25, 40, 35, 55, 70, 68, 82, 78, 95, 90, 110],
};

function buildPath(data, w = 400, h = 110) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pad = 10;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return [x, y];
  });
  // Smooth curve via catmull-rom
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i][0] + (pts[i + 1][0] - (pts[i - 1]?.[0] ?? pts[i][0])) / 4;
    const cp1y = pts[i][1] + (pts[i + 1][1] - (pts[i - 1]?.[1] ?? pts[i][1])) / 4;
    const cp2x = pts[i + 1][0] - (pts[i + 2]?.[0] ?? pts[i + 1][0] - (pts[i][0])) / 4;
    const cp2y = pts[i + 1][1] - (pts[i + 2]?.[1] ?? pts[i + 1][1] - (pts[i][1])) / 4;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i + 1][0]} ${pts[i + 1][1]}`;
  }
  const areaD = d + ` L ${pts[pts.length-1][0]} ${h} L ${pts[0][0]} ${h} Z`;
  return { line: d, area: areaD, pts };
}

function renderChart(key) {
  const linePath = document.getElementById('line-path');
  const areaPath = document.getElementById('area-path');
  const dotsEl   = document.getElementById('chart-dots');
  if (!linePath) return;

  const { line, area, pts } = buildPath(chartData[key]);
  linePath.setAttribute('d', line);
  areaPath.setAttribute('d', area);

  // Reset animation
  linePath.style.animation = 'none';
  linePath.getBoundingClientRect();
  linePath.style.animation = '';

  // Dots
  dotsEl.innerHTML = '';
  pts.forEach(([x, y], i) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x); circle.setAttribute('cy', y); circle.setAttribute('r', 3);
    circle.setAttribute('fill', '#a78bfa');
    circle.style.opacity = '0';
    circle.style.transition = `opacity .3s ${i * 60}ms`;
    dotsEl.appendChild(circle);
    setTimeout(() => { circle.style.opacity = '1'; }, 500 + i * 60);
  });
}

renderChart('7d');
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const key = tab.id.replace('tab-', '');
    renderChart(key);
  });
});

// ─── DONUT CHART ──────────────────────────────────
function animateDonut() {
  const total  = 239; // circumference of r=38
  const segs   = [
    { el: '.seg-1', share: 0.48, offset: 0,             color: '#7c3aed' },
    { el: '.seg-2', share: 0.31, offset: 0.48,          color: '#06b6d4' },
    { el: '.seg-3', share: 0.21, offset: 0.48 + 0.31,   color: '#f59e0b' },
  ];
  segs.forEach(s => {
    const el = document.querySelector(s.el);
    if (!el) return;
    el.style.strokeDasharray = `0 ${total}`;
    el.style.strokeDashoffset = -(s.offset * total);
    setTimeout(() => {
      el.style.strokeDasharray = `${s.share * total} ${total}`;
    }, 300);
  });
}
const donutObs = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) { animateDonut(); donutObs.disconnect(); }
}, { threshold: 0.3 });
const donutWrap = document.querySelector('.donut-wrap');
if (donutWrap) donutObs.observe(donutWrap);

// ─── LIVE FEED ────────────────────────────────────
const events = [
  { type: 'p', evt: 'Payment received', user: 'user_8f2a', val: '$299' },
  { type: 's', evt: 'New signup',        user: 'user_c19d', val: 'Pro plan' },
  { type: 'w', evt: 'Alert triggered',   user: 'monitor',   val: 'CPU 94%' },
  { type: 'p', evt: 'Upgrade detected',  user: 'user_3b7e', val: '$89 → $299' },
  { type: 's', evt: 'Dashboard created', user: 'user_f44c', val: 'Analytics v2' },
  { type: 'w', evt: 'Anomaly detected',  user: 'AI engine',  val: 'Rev spike' },
  { type: 'p', evt: 'Refund processed',  user: 'user_7a1f', val: '-$29' },
  { type: 's', evt: 'API key generated', user: 'user_9d2b', val: 'sk-...3f4a' },
];

const feedList = document.getElementById('feed-list');
let feedIdx = 0;

function addFeedItem() {
  if (!feedList) return;
  const ev  = events[feedIdx % events.length];
  feedIdx++;

  const now = new Date();
  const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`;

  const item = document.createElement('div');
  item.className = 'feed-item';
  item.innerHTML = `
    <span class="feed-dot-${ev.type}">${ev.type === 'p' ? '●' : ev.type === 's' ? '◆' : '▲'}</span>
    <span class="feed-evt">${ev.evt}</span>
    <span class="feed-user">${ev.user}</span>
    <span class="feed-val" style="color:${ev.type==='p'?'#34d399':ev.type==='s'?'#a78bfa':'#f59e0b'};font-size:.73rem;font-weight:600">${ev.val}</span>
    <span class="feed-time">${time}</span>
  `;

  feedList.insertBefore(item, feedList.firstChild);
  if (feedList.children.length > 5) feedList.removeChild(feedList.lastChild);
}

// Start with 3 items
addFeedItem(); addFeedItem(); addFeedItem();
setInterval(addFeedItem, 2400);

// ─── PRICING TOGGLE ───────────────────────────────
const billingToggle = document.getElementById('billing-toggle');
const toggleMonthly = document.getElementById('toggle-monthly');
const toggleAnnual  = document.getElementById('toggle-annual');

function updatePricing(annual) {
  toggleMonthly.classList.toggle('active', !annual);
  toggleAnnual.classList.toggle('active', annual);
  document.querySelectorAll('.amount[data-monthly]').forEach(el => {
    const target = annual ? +el.dataset.annual : +el.dataset.monthly;
    animateCounter(el, target, '', '', 600);
  });
}

billingToggle.addEventListener('change', () => updatePricing(billingToggle.checked));
toggleMonthly.addEventListener('click', () => { billingToggle.checked = false; updatePricing(false); });
toggleAnnual.addEventListener('click',  () => { billingToggle.checked = true;  updatePricing(true);  });

// ─── SMOOTH SCROLL FOR NAV LINKS ──────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ─── PARALLAX ORB ON MOUSE MOVE ──────────────────
document.addEventListener('mousemove', e => {
  const mx = (e.clientX / window.innerWidth  - 0.5) * 30;
  const my = (e.clientY / window.innerHeight - 0.5) * 30;
  document.querySelectorAll('.orb').forEach((orb, i) => {
    const factor = (i + 1) * 0.4;
    orb.style.transform = `translate(${mx * factor}px, ${my * factor}px)`;
  });
});
