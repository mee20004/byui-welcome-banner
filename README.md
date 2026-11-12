# BYU-Idaho Welcome Banner

A tiny, dependency-free welcome banner built to be embedded in a Pathify iframe card.
The whole banner is a flag: the surface is sliced into vertical strips, each one a beat
behind the one before it, so the cloth (and the text printed on it) ripples.

- Fills 100% of whatever container it is given; never scrolls.
- White above and below, so the cloth silhouette waves against the white Pathify card.
- Animated flowing gradient in BYU-Idaho navy/blue, continuous across the strips.
- Hover: the wave speeds up and a soft light follows the pointer.
- Click/tap: a gust rips through the cloth, confetti bursts, and the sub-line swaps message.
- Text scales with `clamp()`; the sub-line drops out under 120px tall.
- Respects `prefers-reduced-motion`.

## Embed

```html
<iframe
  src="https://mee20004.github.io/byui-welcome-banner/"
  title="Welcome to BYU-Idaho"
  style="width:100%;height:100%;border:0;display:block;"
  scrolling="no"
  loading="lazy"></iframe>
```

## Customizing

- Colors: the `:root` block in `style.css`.
- Headline text, click messages, strip count: the top of `script.js`.
- Wave size and speed: the `cloth` keyframes and `.strip` animation in `style.css`.

**After editing**, bump the `?v=` number on the `style.css` and `script.js` links in
`index.html`. Browsers cache those files hard inside an iframe, and without the bump
students keep seeing the old version.
