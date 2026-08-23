# Design System (Dev) — design tokens

Generated from Figma by Token Portal. 636 tokens.
Do not edit these files by hand — the next export overwrites them.

## Install it

This folder is a package inside the repository. Declare it once, at the repository root —
in `package.json`:

```json
{
  "workspaces": ["tokens"]
}
```

or, if you use pnpm, in `pnpm-workspace.yaml`:

```yaml
packages:
  - 'tokens'
```

Then add it to the project that uses it and install:

```bash
npm install design-system-dev-tokens@* --workspace <your app>
```

## Use it

Point Sass at this folder once. In Vite:

```js
css: {
  preprocessorOptions: {
    scss: { loadPaths: ['node_modules/design-system-dev-tokens'] },
  },
}
```

Then, anywhere in your styles:

```scss
@use 'tokens' as tokens;

.button {
  background: tokens.$semantic-brand-primary-100;
  /* or, without SCSS: background: var(--semantic-brand-primary-100); */
}
```

That single `@use` brings three things with it: the custom properties that hold the values,
the `$variables` that point at them, and the typography mixins.

## Typography

```scss
.heading {
  @include tokens.body-12-regular;
}
```

## Typography Settings

These values change with screen width on their own — no attribute, no JavaScript. Modes: Mobile → Desktop.

## What's inside

- `package.json`
- `tokens.d.ts`
- `tokens.js`
- `tokens.manifest.json`
- `tokens.scss`

`tokens.manifest.json` is how the plugin works out what changed since last time. Keep it —
without it, the next export cannot tell a rename from a deletion.
