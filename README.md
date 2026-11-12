# BYU-Idaho Welcome Banner

A small height-field water simulation with a longship floating in it, built to be
embedded in a Pathify iframe card. No dependencies, no build step.

## How the water works

The surface is a row of columns, each with a height and a velocity (`script.js`).
Every step, each column is pulled back toward the rest level by a spring, then
trades part of its height difference with its neighbours. That exchange is what
makes a disturbance *travel* — drop a splash and the ripple spreads outward,
reflects off the sides, and interferes with itself. It is a simulation, not a
scrolling sine wave.

The ship is coupled to the same surface: she floats by buoyancy, heels to the real
slope of the water beneath her, and shoves the water under her hull as she moves,
so she makes the waves she then rides. The sim is pre-rolled 900 steps before the
first frame, so the card opens on a sea that is already moving.

- Fills 100% of whatever container it is given; never scrolls.
- **Hover:** the wind rises, the swell builds, and the sail bellies out.
- **Move the pointer over the water:** you drag the surface and leave ripples.
- **Click/tap:** a real splash — the ripple propagates outward, droplets arc up and
  disturb the surface where they land, and the sub-line swaps message.
- Amplitude is capped at 13% of the height so the swell can never swallow the frame.
- Respects `prefers-reduced-motion` (the sea holds still).

## Embed

```html
<iframe
  src="https://mee20004.github.io/byui-welcome-banner/"
  title="Welcome to BYU-Idaho"
  style="width:100%;height:100%;border:0;display:block;"
  scrolling="no"
  loading="lazy"></iframe>
```

## Tuning

The constants at the top of `script.js` are the whole sim:

| Constant | What it does |
| --- | --- |
| `STIFF` | How hard a column is pulled back to rest. Higher = choppier, shorter waves. |
| `DAMP` | Energy bleed per step. Lower = the sea settles faster. |
| `SPREAD` | How fast a wave travels sideways. Keep `SPREAD * PASSES` under 0.5 or it goes unstable. |
| `SPACING` | Pixels between columns. Lower = finer detail, more work per frame. |

Swell strength, wind chop and the amplitude cap live in `simulate()`. Colors live in
the sky gradient and the three `ctx.fillStyle` lines in `frame()`. Headline and click
messages are at the top of `script.js` and in `index.html`.

**After editing**, bump the `?v=` number on the `style.css` and `script.js` links in
`index.html`. Browsers cache those files hard inside an iframe, and without the bump
students keep seeing the old version.
