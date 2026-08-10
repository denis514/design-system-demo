# Design system demo

A small site built **only** from design tokens exported out of Figma. Nothing here contains a
hardcoded colour, size or font.

It exists for three reasons, in order of importance:

1. **To find what tests cannot.** The plugin's test suite proves the generated SCSS compiles.
   It cannot prove the output is pleasant to use — whether the names are guessable, whether the
   README instructions work when followed literally, whether a developer has to write wrappers
   around our tokens. That only shows up when somebody actually builds a page.
2. **To be a sync target.** From milestone M6 the plugin commits to a repository and opens a
   pull request. Pushing into a folder inside the plugin's own repo would be a rehearsal, not a
   test. This is a real repository with real pull requests.
3. **To catch breakage.** CI builds this site on every change to `tokens/`. A token change that
   breaks the styling fails a pull request instead of reaching production.

## Two findings on the first run

Both were defects in the *generated output*, not in this project, and both were invisible to
the plugin's own tests:

- `@use 'scss'` — the instruction the generated README gives — produced a page with **160
  unresolved `var()` references and no styling at all**. The SCSS entry forwarded `$variables`
  that pointed at custom properties which were only declared in a separate `tokens.css` nobody
  had told you to load.
- The typography classes existed in `tokens.css` and not in the SCSS build, so the entire type
  scale rendered at one size. Two entry points that disagree about what exists.

Fixed in the exporter, and the plugin's compile test now asserts on the result of following the
README rather than on one file's internal consistency.

## Run it

```bash
pnpm install
pnpm run dev
```

Narrow the window past 1024 px. The type scale changes — that is the `Mobile` / `Desktop` mode
from Figma, exported as a media query rather than a theme switch.

## Layout

```
tokens/          written by the plugin. Never edit by hand.
  tokens.css       standalone: custom properties, no build step needed
  scss/index.scss  one @use gives you properties, $variables and mixins
  tokens.manifest.json  which Figma variable each token came from
src/
  styles/main.scss  hand-written components, tokens only
  main.ts           renders the galleries from the manifest
```

The galleries take their **list** of tokens from `tokens.manifest.json` and every **value** from
`var(--token)`. That split makes the page evidence about two things at once: a blank swatch
means the CSS is wrong, a missing swatch means the manifest is wrong.

## Updating tokens

Today, from the plugin repository:

```bash
node dist/cli.mjs <snapshot.json> ../Demo/tokens --breakpoint Desktop=1024
```

From M6, the plugin will open a pull request here directly.

## A note on fonts

The `font-family` tokens name the typeface — they do not load it. That is deliberate: inventing
a fallback stack for someone else's design system would be worse than leaving the decision to
the project. Load your webfont as you normally would.
