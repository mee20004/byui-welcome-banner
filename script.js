/* A small height-field water simulation.
 *
 * The surface is a row of columns, each with a height and a velocity.
 * Every step each column is pulled back toward the rest level by a spring,
 * then each column trades some of its height difference with its neighbours.
 * That exchange is what makes a disturbance travel: drop a splash in one
 * place and the wave spreads out, bounces off the sides and interferes with
 * itself. Nothing here is a scrolling sine wave.
 *
 * The ship is coupled to the same surface: it floats by buoyancy, and the
 * water under the hull is pushed by the hull's own motion, so the ship makes
 * the waves it then rides.
 */
(function () {
  var stage = document.getElementById('stage');
  var canvas = document.getElementById('sea');
  var sub = document.getElementById('sub');
  var ctx = canvas.getContext('2d');

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- sim constants ---- */
  var SPACING = 4;        /* px between columns */
  var STIFF = 0.015;      /* pull back toward rest level */
  var DAMP = 0.995;       /* energy bleed, so it settles */
  var SPREAD = 0.23;      /* how fast a wave travels sideways */
  var PASSES = 2;         /* spread iterations per step */
  var STEP = 1 / 60;

  var W = 0, H = 0, dpr = 1, N = 0, rest = 0;
  var h = [], v = [], ld = [], rd = [];

  var t = 0, acc = 0;
  var wind = 1, windTarget = 1, gust = 0;
  var drops = [];

  /* ---- the ship ---- */
  var ship = { x: 0, y: 0, vy: 0, scale: 0.6, half: 44 };

  var messages = [
    'Full sail ahead!',
    'Welcome home, sailor',
    'Rexburg by sea ❄︎',
    'Have a great semester',
    'Hover for wind · tap to make waves'
  ];
  var next = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth;
    H = stage.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    N = Math.max(24, Math.ceil(W / SPACING) + 1);
    rest = H * 0.58;
    h = new Array(N);
    v = new Array(N);
    ld = new Array(N);
    rd = new Array(N);
    for (var i = 0; i < N; i++) { h[i] = rest; v[i] = 0; ld[i] = 0; rd[i] = 0; }

    ship.scale = Math.max(0.3, Math.min(H / 260, W / 470, 0.9));
    ship.half = 44 * ship.scale;
    ship.x = W * 0.5;
    ship.y = rest;

    /* run the sim forward before the first frame, so the card opens on a
       sea that is already moving instead of a dead flat one */
    for (var p = 0; p < 900; p++) { t += STEP; simulate(); }
  }
  if (window.ResizeObserver) { new ResizeObserver(resize).observe(stage); }
  window.addEventListener('resize', resize);
  resize();

  /* height of the surface at an arbitrary x, interpolated between columns */
  function surfaceAt(x) {
    var f = x / SPACING;
    var i = Math.floor(f);
    if (i < 0) { return h[0]; }
    if (i >= N - 1) { return h[N - 1]; }
    var a = f - i;
    return h[i] * (1 - a) + h[i + 1] * a;
  }

  /* push the surface down (or up, with a negative amount) around x */
  function disturb(x, amount, width) {
    var c = Math.round(x / SPACING);
    var w = Math.max(1, Math.round(width / SPACING));
    for (var i = c - w; i <= c + w; i++) {
      if (i < 0 || i >= N) { continue; }
      var f = 1 - Math.abs(i - c) / (w + 1);
      v[i] += amount * f * f;
    }
  }

  /* ---- one simulation step ---- */
  function simulate() {
    var i;

    /* springs: every column is pulled back toward the rest level */
    for (i = 0; i < N; i++) {
      var d = h[i] - rest;
      v[i] -= STIFF * d;
      v[i] *= DAMP;
      h[i] += v[i];
    }

    /* neighbour exchange: this is what makes waves travel and reflect */
    for (var p = 0; p < PASSES; p++) {
      for (i = 0; i < N; i++) {
        if (i > 0) { ld[i] = SPREAD * (h[i] - h[i - 1]); v[i - 1] += ld[i]; }
        if (i < N - 1) { rd[i] = SPREAD * (h[i] - h[i + 1]); v[i + 1] += rd[i]; }
      }
      for (i = 0; i < N; i++) {
        if (i > 0) { h[i - 1] += ld[i]; }
        if (i < N - 1) { h[i + 1] += rd[i]; }
      }
    }

    /* wind: a long swell fed in from the left, plus scattered chop */
    var w = wind + gust;
    v[0] += Math.sin(t * 0.9) * 0.52 * w;             /* swell rolling in */
    v[1] += Math.sin(t * 0.9) * 0.36 * w;
    v[N - 1] += Math.sin(t * 1.43 + 1.2) * 0.26 * w;  /* and a cross swell */
    v[N - 2] += Math.sin(t * 1.43 + 1.2) * 0.18 * w;
    if (Math.random() < 0.6 * w) {                    /* wind chop */
      disturb(Math.random() * W, (Math.random() - 0.5) * 3.2 * w, 12);
    }

    /* keep the sea in its bed: cap how far a column can stray from rest
       so the swell can never swallow the frame or drain out of it */
    var cap = H * 0.13;
    for (i = 0; i < N; i++) {
      var off = h[i] - rest;
      if (off > cap) { h[i] = rest + cap; v[i] *= -0.35; }
      else if (off < -cap) { h[i] = rest - cap; v[i] *= -0.35; }
    }

    /* ---- the ship floats on the same surface ---- */
    var water = surfaceAt(ship.x);
    var draft = 7 * ship.scale;            /* how deep she sits */
    var target = water - draft;
    ship.vy += (target - ship.y) * 0.06;   /* buoyancy */
    ship.vy *= 0.90;                       /* drag in the water */
    ship.y += ship.vy;

    /* and shoves the water under the hull as she moves: her own wake */
    disturb(ship.x, ship.vy * 0.10, ship.half * 0.75);
  }

  /* ---- drawing ---- */
  function waterShape(offsetY, squash) {
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, rest + (h[0] - rest) * squash + offsetY);
    for (var i = 1; i < N; i++) {
      ctx.lineTo(i * SPACING, rest + (h[i] - rest) * squash + offsetY);
    }
    ctx.lineTo(W, H);
    ctx.closePath();
  }

  function crestLine(offsetY, squash, alpha) {
    ctx.beginPath();
    ctx.moveTo(0, rest + (h[0] - rest) * squash + offsetY);
    for (var i = 1; i < N; i++) {
      ctx.lineTo(i * SPACING, rest + (h[i] - rest) * squash + offsetY);
    }
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(255,255,255,' + alpha + ')';
    ctx.stroke();
  }

  function drawShip() {
    var hullDark = '#4a2a18';
    var hullMid = '#7a4526';
    var s = ship.scale;

    /* heel with the real slope of the water under her */
    var slope = (surfaceAt(ship.x + ship.half) - surfaceAt(ship.x - ship.half)) / (ship.half * 2);

    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(Math.atan(slope) * 0.95);
    ctx.scale(s, s);

    ctx.lineCap = 'round';
    ctx.strokeStyle = hullMid;
    ctx.lineWidth = 5;

    ctx.beginPath();                        /* prow */
    ctx.moveTo(40, -4);
    ctx.quadraticCurveTo(58, -10, 55, -30);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(55, -30);
    ctx.quadraticCurveTo(49, -36, 42, -32);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(51, -31, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = '#f2ece0';
    ctx.fill();

    ctx.beginPath();                        /* stern */
    ctx.moveTo(-40, -4);
    ctx.quadraticCurveTo(-56, -9, -52, -25);
    ctx.strokeStyle = hullMid;
    ctx.stroke();

    ctx.beginPath();                        /* hull */
    ctx.moveTo(-44, -6);
    ctx.lineTo(44, -6);
    ctx.quadraticCurveTo(0, 22, -44, -6);
    ctx.closePath();
    ctx.fillStyle = hullMid;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-44, -6);
    ctx.lineTo(44, -6);
    ctx.lineWidth = 3;
    ctx.strokeStyle = hullDark;
    ctx.stroke();

    for (var i = 0; i < 7; i++) {           /* shields */
      ctx.beginPath();
      ctx.arc(-30 + i * 10, -5, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? '#e8e3d6' : '#c0392b';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = hullDark;
      ctx.stroke();
    }

    ctx.beginPath();                        /* mast */
    ctx.moveTo(0, -8);
    ctx.lineTo(0, -56);
    ctx.lineWidth = 4;
    ctx.strokeStyle = hullMid;
    ctx.stroke();

    ctx.beginPath();                        /* yard */
    ctx.moveTo(-23, -50);
    ctx.lineTo(23, -50);
    ctx.lineWidth = 3;
    ctx.stroke();

    var bill = 5 + wind * 4.5 + gust * 6;   /* the sail bellies with the wind */
    ctx.beginPath();
    ctx.moveTo(-21, -50);
    ctx.lineTo(21, -50);
    ctx.quadraticCurveTo(21 + bill, -32, 21, -14);
    ctx.quadraticCurveTo(0, -8, -21, -14);
    ctx.quadraticCurveTo(-21 + bill, -32, -21, -50);
    ctx.closePath();
    ctx.fillStyle = '#f2ece0';
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-30, -45, 70, 7);
    ctx.fillRect(-30, -31, 70, 7);
    ctx.fillRect(-30, -19, 70, 6);
    ctx.restore();

    ctx.beginPath();                        /* rigging */
    ctx.moveTo(-23, -50); ctx.lineTo(-38, -7);
    ctx.moveTo(23, -50);  ctx.lineTo(38, -7);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(240,235,225,0.55)';
    ctx.stroke();

    ctx.restore();
  }

  /* ---- interaction ---- */
  stage.addEventListener('pointerenter', function () { windTarget = 2.2; });
  stage.addEventListener('pointerleave', function () { windTarget = 1; });

  /* dragging a finger or cursor across the water drags the surface with it */
  stage.addEventListener('pointermove', function (e) {
    var r = stage.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;
    if (y > surfaceAt(x) - 6) { disturb(x, 0.9, 14); }
  });

  stage.addEventListener('click', function (e) {
    var r = stage.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;

    gust = 1.4;
    disturb(x, 13, 26);                     /* a real splash: the ripple spreads */

    for (var i = 0; i < 20; i++) {          /* droplets thrown up by it */
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.0;
      var sp = 60 + Math.random() * 150;
      drops.push({
        x: x, y: Math.min(y, surfaceAt(x)),
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: 1.3 + Math.random() * 2.3
      });
    }

    sub.textContent = messages[next % messages.length];
    next++;
  });

  /* ---- frame ---- */
  var last = performance.now();

  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    wind += (windTarget - wind) * Math.min(dt * 2.5, 1);
    gust *= Math.pow(0.15, dt);
    if (gust < 0.01) { gust = 0; }

    /* fixed-step the sim so it behaves the same on any refresh rate */
    acc += calm ? 0 : dt;
    var steps = 0;
    while (acc >= STEP && steps < 4) { simulate(); acc -= STEP; steps++; }

    /* sky */
    var sky = ctx.createLinearGradient(0, 0, 0, rest);
    sky.addColorStop(0, '#04203f');
    sky.addColorStop(0.65, '#0b3b6b');
    sky.addColorStop(1, '#2f8ac4');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* two parallax copies of the same surface, then the surface itself */
    waterShape(-H * 0.055, 0.45);
    ctx.fillStyle = '#1b5f9bcc';
    ctx.fill();
    crestLine(-H * 0.055, 0.45, 0.16);

    waterShape(-H * 0.022, 0.72);
    ctx.fillStyle = '#0b3157';
    ctx.fill();
    crestLine(-H * 0.022, 0.72, 0.22);

    drawShip();

    waterShape(0, 1);
    ctx.fillStyle = '#05223c';
    ctx.fill();
    crestLine(0, 1, 0.45);

    /* foam where the water is moving fastest */
    for (var i = 0; i < N; i++) {
      var speed = Math.abs(v[i]);
      if (speed > 1.6 && i % 5 === 0) {
        ctx.globalAlpha = Math.min((speed - 1.6) * 0.3, 0.45);
        ctx.fillStyle = '#eaf4ff';
        ctx.beginPath();
        ctx.arc(i * SPACING, h[i] - 1, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    /* droplets fall back in and disturb the surface where they land */
    for (var j = drops.length - 1; j >= 0; j--) {
      var p = drops[j];
      p.vy += 430 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.y >= surfaceAt(p.x) || p.x < -10 || p.x > W + 10) {
        if (p.x > 0 && p.x < W) { disturb(p.x, 0.7, 6); }
        drops.splice(j, 1);
        continue;
      }
      ctx.fillStyle = '#eaf4ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
