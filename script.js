(function () {
  var banner = document.getElementById('banner');
  var headline = document.getElementById('headline');
  var glow = document.getElementById('glow');
  var sub = document.getElementById('sub');
  var sparks = document.getElementById('sparks');

  var messages = [
    'Welcome home!',
    'Rexburg strong ❄︎',
    'You belong here',
    'Have a great semester',
    'Hover the words · tap for a surprise'
  ];
  var next = 0;

  // split the title into hoverable letters
  function write(text) {
    headline.innerHTML = '';
    text.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'ltr' + (ch === ' ' ? ' space' : '');
      var inner = document.createElement('b');
      inner.innerHTML = ch === ' ' ? '&nbsp;' : '';
      if (ch !== ' ') { inner.textContent = ch; }
      s.appendChild(inner);
      s.style.setProperty('--i', i);
      headline.appendChild(s);
    });
  }
  write('Welcome to BYU–Idaho');

  // pointer-following glow
  banner.addEventListener('pointermove', function (e) {
    var r = banner.getBoundingClientRect();
    glow.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    glow.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  });

  // click: confetti burst + a new message
  banner.addEventListener('click', function (e) {
    var r = banner.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;
    var colors = ['#4aa8ff', '#ffffff', '#8fd3ff', '#ffd166'];

    for (var i = 0; i < 14; i++) {
      var d = document.createElement('i');
      var a = (Math.PI * 2 * i) / 14;
      var dist = 40 + Math.random() * 60;
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
  });
})();
