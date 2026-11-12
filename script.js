(function () {
  var stage = document.getElementById('stage');
  var canvas = document.getElementById('sea');
  var sub = document.getElementById('sub');
  var ctx = canvas.getContext('2d');

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, dpr = 1;
  var t = 0;                 /* seconds */
  var wind = 1;              /* eases toward windTarget */
  var windTarget = 1;
  var gust = 0;              /* click kick, decays */
  var splashes = [];
  var rings = [];
  var stars = [];

  var messages = [
    'Full sail ahead!',
    'Welcome home, sailor',
    'Rexburg by sea ❄︎',
    'Have a great semester',
    'Hover for wind · tap to make waves'
  ];
  var next = 0;

  /* ---------- sizing ---------- */
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = stage.clientWidth;
    H = stage.clientHeight;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = [];
    var n = Math.round((W * H) / 9000);
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.45,
        r: Math.random() * 1.1 + 0.3,
        tw: Math.random() * Math.PI * 2
      });
    }
  }
  if (window.ResizeObserver) { new ResizeObserver(resize).observe(stage); }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- the swell ---------- */
  /* layer 0 is the far water, 2 is the near water the ship sits in */
  function horizon() { return H * 0.54; }

  function waveAt(x, layer) {
    var amp = (2.2 + layer * 2.6) * wind;
    var base = horizon() + layer * (H * 0.09);
    return base
      + Math.sin(x * 0.018 + t * (1.1 + layer * 0.35) + layer) * amp
      + Math.sin(x * 0.041 - t * (1.7 + layer * 0.3)) * amp * 0.45
      + Math.sin(x * 0.007 + t * 0.6) * amp * 0.7;
  }

  function waterPath(layer) {
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, waveAt(0, layer));
    for (var x = 0; x <= W; x += 6) { ctx.lineTo(x, waveAt(x, layer)); }
    ctx.lineTo(W, H);
    ctx.closePath();
  }

  /* ---------- the longship ---------- */
  function drawShip(scale) {
    ctx.save();
    ctx.scale(scale, scale);

    var hullDark = '#4a2a18';
    var hullMid = '#7a4526';

    /* stern and prow posts, curled like a dragon's neck */
    ctx.strokeStyle = hullMid;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    ctx.beginPath();                       /* prow, facing right */
    ctx.moveTo(40, -4);
    ctx.quadraticCurveTo(58, -10, 55, -30);
    ctx.stroke();
    ctx.beginPath();                       /* the little head */
    ctx.moveTo(55, -30);
    ctx.quadraticCurveTo(49, -36, 42, -32);
    ctx.stroke();
    ctx.beginPath();                       /* and its eye */
    ctx.arc(51, -31, 1.6, 0, Math.PI * 2);
    ctx.fillStyle = '#f2ece0';
    ctx.fill();

    ctx.beginPath();                       /* stern, facing left */
    ctx.moveTo(-40, -4);
    ctx.quadraticCurveTo(-56, -9, -52, -25);
    ctx.stroke();

    /* hull */
    ctx.beginPath();
    ctx.moveTo(-44, -6);
    ctx.lineTo(44, -6);
    ctx.quadraticCurveTo(0, 22, -44, -6);
    ctx.closePath();
    ctx.fillStyle = hullMid;
    ctx.fill();

    ctx.beginPath();                       /* waterline shadow */
    ctx.moveTo(-36, 6);
    ctx.quadraticCurveTo(0, 20, 36, 6);
    ctx.lineWidth = 3;
    ctx.strokeStyle = hullDark;
    ctx.stroke();

    /* gunwale */
    ctx.beginPath();
    ctx.moveTo(-44, -6);
    ctx.lineTo(44, -6);
    ctx.lineWidth = 3;
    ctx.strokeStyle = hullDark;
    ctx.stroke();

    /* shields along the side */
    for (var i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(-30 + i * 10, -5, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 ? '#e8e3d6' : '#c0392b';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = hullDark;
      ctx.stroke();
    }

    /* mast */
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(0, -56);
    ctx.lineWidth = 4;
    ctx.strokeStyle = hullMid;
    ctx.stroke();

    /* the yard the sail hangs from */
    ctx.beginPath();
    ctx.moveTo(-23, -50);
    ctx.lineTo(23, -50);
    ctx.lineWidth = 3;
    ctx.strokeStyle = hullMid;
    ctx.stroke();

    /* square sail, bellied out by the wind */
    var bill = 5 + wind * 4.5 + gust * 6;
    ctx.beginPath();
    ctx.moveTo(-21, -50);
    ctx.lineTo(21, -50);
    ctx.quadraticCurveTo(21 + bill, -32, 21, -14);
    ctx.quadraticCurveTo(0, -8, -21, -14);
    ctx.quadraticCurveTo(-21 + bill, -32, -21, -50);
    ctx.closePath();
    ctx.fillStyle = '#f2ece0';
    ctx.fill();

    ctx.save();                            /* red bands across the sail */
    ctx.clip();
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-30, -45, 70, 7);
    ctx.fillRect(-30, -31, 70, 7);
    ctx.fillRect(-30, -19, 70, 6);
    ctx.restore();

    ctx.beginPath();                       /* sail edge */
    ctx.moveTo(-21, -50);
    ctx.lineTo(21, -50);
    ctx.quadraticCurveTo(21 + bill, -32, 21, -14);
    ctx.quadraticCurveTo(0, -8, -21, -14);
    ctx.quadraticCurveTo(-21 + bill, -32, -21, -50);
    ctx.closePath();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(80,50,30,0.5)';
    ctx.stroke();

    /* rigging from the yard tips down to the hull */
    ctx.beginPath();
    ctx.moveTo(-23, -50); ctx.lineTo(-38, -7);
    ctx.moveTo(23, -50);  ctx.lineTo(38, -7);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(240,235,225,0.55)';
    ctx.stroke();

    ctx.restore();
  }

  /* ---------- interaction ---------- */
  stage.addEventListener('pointerenter', function () { windTarget = 2.1; });
  stage.addEventListener('pointerleave', function () { windTarget = 1; });

  stage.addEventListener('click', function (e) {
    var r = stage.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;

    gust = 1.6;
    rings.push({ x: x, y: Math.max(y, horizon()), r: 4, life: 1 });

    for (var i = 0; i < 22; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2;
      var sp = 70 + Math.random() * 150;
      splashes.push({
        x: x, y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 1,
        r: 1.5 + Math.random() * 2.5
      });
    }

    sub.textContent = messages[next % messages.length];
    next++;
  });

  /* ---------- the frame ---------- */
  var last = performance.now();

  function frame(now) {
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!calm) { t += dt; }

    wind += (windTarget - wind) * Math.min(dt * 2.5, 1);
    gust *= Math.pow(0.12, dt);
    if (gust < 0.01) { gust = 0; }
    var w = wind + gust;

    /* sky */
    var sky = ctx.createLinearGradient(0, 0, 0, horizon());
    sky.addColorStop(0, '#04203f');
    sky.addColorStop(0.6, '#0b3b6b');
    sky.addColorStop(1, '#1f6ba8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, horizon() + 2);

    /* stars */
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      var a = 0.35 + 0.35 * Math.sin(t * 1.5 + st.tw);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    /* three bands of water, far to near */
    var colors = ['#15548c', '#0e3f70', '#092b4f'];
    for (var L = 0; L < 3; L++) {
      waterPath(L);
      ctx.fillStyle = colors[L];
      ctx.fill();

      /* a pale crest line on top of each band */
      ctx.beginPath();
      ctx.moveTo(0, waveAt(0, L));
      for (var x = 0; x <= W; x += 6) { ctx.lineTo(x, waveAt(x, L)); }
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.30 - L * 0.07) + ')';
      ctx.stroke();

      /* the ship rides between the middle and the near band */
      if (L === 1) { drawShipOnWave(); }
    }

    /* click ripples */
    for (var i = rings.length - 1; i >= 0; i--) {
      var ring = rings[i];
      ring.r += dt * 150;
      ring.life -= dt * 1.3;
      if (ring.life <= 0) { rings.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.ellipse(ring.x, ring.y, ring.r, ring.r * 0.28, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,' + (ring.life * 0.5) + ')';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    /* splash droplets */
    for (var j = splashes.length - 1; j >= 0; j--) {
      var p = splashes[j];
      p.vy += 420 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 0.9;
      if (p.life <= 0) { splashes.splice(j, 1); continue; }
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = '#eaf4ff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    requestAnimationFrame(frame);
  }

  function drawShipOnWave() {
    /* the ship drifts slowly across and sits on the middle swell */
    var driftX = W * 0.5 + Math.sin(t * 0.22) * W * 0.17;
    var y = waveAt(driftX, 1);
    var slope = (waveAt(driftX + 14, 1) - waveAt(driftX - 14, 1)) / 28;
    var scale = Math.max(0.32, Math.min(H / 250, W / 460, 0.95));

    ctx.save();
    ctx.translate(driftX, y + 2);
    ctx.rotate(Math.atan(slope) * 0.9);
    drawShip(scale);
    ctx.restore();
  }

  requestAnimationFrame(frame);
})();
