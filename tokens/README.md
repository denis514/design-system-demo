# Design System (Plugin Test Only) — design tokens

Generated from Figma. 625 tokens.

## Use it

Copy the `scss/` folder into your project, then:

```scss
@use 'scss' as tokens;

.button {
  background: tokens.$semantic-brand-500;
}
```

If you do not use SCSS, use `tokens.css` on its own — it needs no build step:

```css
@import 'tokens.css';

.button {
  background: var(--semantic-brand-500);
}
```

## Typography

```scss
.heading {
  @include tokens.body-12-regular;
}
```

## Typography Settings

These values change with screen width automatically — no attribute, no JavaScript. Modes: Mobile → Desktop.

## Keep `tokens.manifest.json`

Commit it alongside these files. It records which Figma variable each token came from, so a
later export can tell what changed instead of guessing.
