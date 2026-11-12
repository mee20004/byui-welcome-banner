(function () {
  var banner = document.getElementById('banner');
  var headline = document.getElementById('headline');
  var glow = document.getElementById('glow');
  var sub = document.getElementById('sub');
  var sparks = document.getElementById('sparks');
  var flag = document.getElementById('flag');

  var TITLE = 'Welcome to BYU–Idaho';
  var FLAG_TEXT = 'BYU–I';
  var STRIPS = 22;

  var messages = [
    'Welcome home!',
    'Rexburg strong ❄︎',
    'You belong here',
    'Have a great semester',
    'Hover the words · tap for a surprise'
  ];
  var next = 0;

  /* ---- the flag: one picture sliced into vertical strips ---- */
  for (var s = 0; s < STRIPS; s++) {
    var strip = document.createElement('div');
    strip.className = 'strip';
    strip.style.setProperty('--i', s);
    /* the free end of the flag swings more than the end on the pole */
    strip.style.setProperty('--amp', (s / (STRIPS - 1)).toFixed(3));

    var face = document.createElement('div');
    face.className = 'face';
    face.style.setProperty('--i', s);
    face.style.setProperty('--n', STRIPS);

    var label = document.createElement('span');
    label.textContent = FLAG_TEXT;
    face.appendChild(label);

    strip.appendChild(face);
    flag.appendChild(strip);
  }

  /* ---- the headline: one hoverable, waving letter at a time ---- */
  TITLE.split('').forEach(function (ch, i) {
    var span = document.createElement('span');
    span.className = 'ltr' + (ch === ' ' ? ' space' : '');
    var inner = document.createElement('b');
    if (ch === ' ') { inner.innerHTML = '&nbsp;'; } else { inner.textContent = ch; }
    span.appendChild(inner);
    span.style.setProperty('--i', i);
    headline.appendChild(span);
  });

  /* ---- pointer-following glow ---- */
  banner.addEventListener('pointermove', function (e) {
    var r = banner.getBoundingClientRect();
    glow.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    glow.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });

  /* ---- click: confetti, a gust through the flag, a new message ---- */
  banner.addEventListener('click', function (e) {
    var r = banner.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;
    var colors = ['#4aa8ff', '#ffffff', '#8fd3ff', '#ffd166'];

    for (var i = 0; i < 16; i++) {
      var d = document.createElement('i');
      var a = (Math.PI * 2 * i) / 16;
      var dist = 40 + Math.random() * 70;
      d.className = 'spark';
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      d.style.background = colors[i % colors.length];
      d.style.setProperty('--dx', Math.cos(a) * dist + 'px');
      d.style.setProperty('--dy', Math.sin(a) * dist + 'px');
      sparks.appendChild(d);
      setTimeout(function (el) { return function () { el.remove(); }; }(d), 800);
    }

    sub.textContent = messages[next % messages.length];
    next++;

    banner.classList.remove('cheer');
    void banner.offsetWidth;
    banner.classList.add('cheer');
    setTimeout(function () { banner.classList.remove('cheer'); }, 1600);
  });
})();
