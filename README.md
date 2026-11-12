# BYU-Idaho Welcome Banner

A tiny, dependency-free welcome banner built to be embedded in a Pathify iframe card.

- Fills 100% of whatever container it is given; never scrolls.
- Animated flowing gradient background in BYU-Idaho navy/blue.
- Hover: a light follows the pointer and individual letters lift and tilt.
- Click/tap: a confetti burst plus a rotating message under the headline.
- Text scales with `clamp()`, so it stays readable in small dynamic containers.
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

Colors live in the `:root` block of `style.css`. The headline text and the
rotating click messages live at the top of `script.js`.
