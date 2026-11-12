(function () {
  var stage = document.getElementById('stage');
  var flag = document.getElementById('flag');
  var glow = document.getElementById('glow');
  var sparks = document.getElementById('sparks');

  var TITLE = 'Welcome to BYU–Idaho';
  var STRIPS = 44;                     /* more strips = smoother cloth */

  var messages = [
    'Welcome home!',
    'Rexburg strong ❄︎',
    'You belong here',
    'Have a great semester',
    'Hover me · tap for a surprise'
  ];
  var next = 0;

  /* ---- cut the banner into strips; each one carries the whole face ---- */
  for (var i = 0; i < STRIPS; i++) {
    var strip = document.createElement('div');
    strip.className = 'strip';
    strip.style.setProperty('--i', i);
    /* the end away from the pole swings the most */
    strip.style.setProperty('--amp', (i / (STRIPS - 1)).toFixed(3));

    var face = document.createElement('div');
    face.className = 'face';
    face.style.setProperty('--i', i);
    face.style.setProperty('--n', STRIPS);

    var inner = document.createElement('div');

    var h = document.createElement('h1');
    h.className = 'headline';
    h.textContent = TITLE;

    var p = document.createElement('p');
    p.className = 'sub';
    p.textContent = messages[messages.length - 1];

    inner.appendChild(h);
    inner.appendChild(p);
    face.appendChild(inner);
    strip.appendChild(face);
    flag.appendChild(strip);
  }

  var subs = flag.querySelectorAll('.sub');

  /* ---- pointer-following glow ---- */
  stage.addEventListener('pointermove', function (e) {
    var r = stage.getBoundingClientRect();
    glow.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    glow.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });

  /* ---- click: confetti, a gust through the cloth, a new message ---- */
  stage.addEventListener('click', function (e) {
    var r = stage.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;
    var colors = ['#4aa8ff', '#ffffff', '#8fd3ff', '#ffd166'];

    for (var k = 0; k < 18; k++) {
      var d = document.createElement('i');
      var a = (Math.PI * 2 * k) / 18;
      var dist = 45 + Math.random() * 75;
      d.className = 'spark';
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      d.style.background = colors[k % colors.length];
      d.style.setProperty('--dx', Math.cos(a) * dist + 'px');
      d.style.setProperty('--dy', Math.sin(a) * dist + 'px');
      sparks.appendChild(d);
      setTimeout(function (el) { return function () { el.remove(); }; }(d), 800);
    }

    var msg = messages[next % messages.length];
    next++;
    for (var s = 0; s < subs.length; s++) { subs[s].textContent = msg; }

    stage.classList.remove('cheer');
    void stage.offsetWidth;
    stage.classList.add('cheer');
    setTimeout(function () { stage.classList.remove('cheer'); }, 1800);
  });
})();
