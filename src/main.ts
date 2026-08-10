import manifest from '../tokens/tokens.manifest.json';
import './styles/main.scss';

/**
 * Renders the token galleries from `tokens.manifest.json`.
 *
 * The list of tokens comes from the manifest; every *value* comes from `var(--token)`. That
 * split is deliberate — it means the page is evidence about two different things at once. If a
 * swatch is blank, the CSS is wrong. If a swatch is missing, the manifest is wrong.
 *
 * It also gives the manifest a job on day one, long before the write-back feature it exists
 * for. A file nobody reads is a file that quietly rots.
 */

interface ManifestToken {
  readonly key: string;
  readonly path: readonly string[];
  readonly type: string;
  readonly tier: string;
  readonly collection: string;
  readonly outputNames: Readonly<Record<string, string>>;
}

const tokens = manifest.tokens as readonly ManifestToken[];
const TIERS = ['primitive', 'semantic', 'component'] as const;

function byTypeAndTier(type: string, tier: string): ManifestToken[] {
  return tokens.filter((token) => token.type === type && token.tier === tier);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className !== undefined) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function mount(id: string, children: readonly Node[]): void {
  const host = document.getElementById(id);
  if (host === null) return;
  host.replaceChildren(...children);
}

/**
 * Ramps, one family per column — the same rule the plugin's own preview page uses.
 *
 * Flat, a hundred colours flow across the grid and every ramp is torn between rows: brand-900
 * ends a line and crimson-100 begins the next. The family is the path minus its last segment,
 * which is structure rather than vocabulary, so a system named in any language splits the same
 * way.
 */
function familiesOf(items: readonly ManifestToken[]): { name: string; tokens: ManifestToken[] }[] {
  const families = new Map<string, ManifestToken[]>();

  for (const token of items) {
    const key = token.path.slice(0, -1).join('/');
    const bucket = families.get(key);
    if (bucket === undefined) families.set(key, [token]);
    else bucket.push(token);
  }

  return [...families.entries()]
    .map(([name, group]) => ({ name, tokens: sortRamp(group) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Numeric steps sort as numbers — string order puts 100 before 50 and 1000 before 200. */
function sortRamp(items: readonly ManifestToken[]): ManifestToken[] {
  const step = (token: ManifestToken): number | null => {
    const last = token.path[token.path.length - 1] ?? '';
    return /^\d+$/.test(last) ? Number(last) : null;
  };
  // A mixed family keeps its arrival order rather than being half-sorted into something
  // arbitrary. Alphabetising default / hover / active invents a sequence nobody chose.
  if (items.some((token) => step(token) === null)) return [...items];
  return [...items].sort((a, b) => (step(a) ?? 0) - (step(b) ?? 0));
}

function cssValue(token: ManifestToken): string {
  const name = token.outputNames['css'] ?? '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderColors(): void {
  const blocks: Node[] = [];

  for (const tier of TIERS) {
    const inTier = byTypeAndTier('color', tier);
    if (inTier.length === 0) continue;

    blocks.push(el('h3', 'group-title', `${tier} · ${String(inTier.length)}`));

    const grid = el('div', 'family-grid');
    for (const family of familiesOf(inTier)) {
      const column = el('div', 'family');
      if (family.name !== '') column.append(el('h4', 'family-name', family.name));

      for (const token of family.tokens) {
        const swatch = el('div', 'swatch');
        const chip = el('div', 'swatch-chip');
        chip.style.background = `var(${token.outputNames['css'] ?? ''})`;
        const text = el('div', 'swatch-text');
        text.append(
          el('span', 'swatch-name', token.path.join('-')),
          el('span', 'swatch-value', cssValue(token)),
        );
        swatch.append(chip, text);
        column.append(swatch);
      }
      grid.append(column);
    }
    blocks.push(grid);
  }

  mount('colors', blocks);
}

function renderSizes(): void {
  // Grouped by collection, the same rule the plugin's preview uses. Tier alone put a 0
  // letter-spacing beside a 512px spacing step — they are the same tier, and the real scale
  // drowned among forty zeroes.
  const dimensions = tokens.filter((token) => token.type === 'dimension');
  const collections = [...new Set(dimensions.map((token) => token.collection))].sort((a, b) =>
    a.localeCompare(b),
  );

  const blocks: Node[] = [];
  for (const collection of collections) {
    const rows = dimensions
      .filter((token) => token.collection === collection)
      .map((token) => ({ token, px: Number.parseFloat(cssValue(token)) || 0 }))
      .sort((a, b) => a.px - b.px);

    blocks.push(el('h3', 'group-title', `${collection} · ${String(rows.length)}`));

    for (const { token, px } of rows) {
      const row = el('div', 'size-row');
      const bar = el('div', 'size-bar');
      bar.style.width = `var(${token.outputNames['css'] ?? ''})`;
      row.append(
        el('span', 'size-name', token.path.join('-')),
        // A zero is a real value and a bar cannot show it; the number always can.
        el('span', 'size-value', px === 0 ? '0' : `${String(px)}px`),
        bar,
      );
      blocks.push(row);
    }
  }

  mount('sizes', blocks);
}

function renderTypography(): void {
  const specimens = tokens
    .filter((token) => token.type === 'typography')
    .map((token) => {
      const className = token.path.join('-');
      const block = el('div', 'type-row');
      const sample = el('p', className, 'The quick brown fox jumps over the lazy dog');
      block.append(sample, el('span', 'type-name', className));
      return { block, sample };
    });

  // Measured rather than read: a text style's size lives in the stylesheet, not the manifest.
  // Mounting first, then sorting by what the browser computed, needs no vocabulary and works on
  // a system we cannot read.
  mount('typography', specimens.map((item) => item.block));

  const measured = specimens
    .map((item) => ({ ...item, size: Number.parseFloat(getComputedStyle(item.sample).fontSize) }))
    .sort((a, b) => b.size - a.size);

  for (const item of measured) {
    item.block.querySelector('.type-name')?.insertAdjacentText(
      'afterbegin',
      `${String(Math.round(item.size))}px · `,
    );
  }
  mount('typography', measured.map((item) => item.block));
}

function renderSummary(): void {
  const summary = document.getElementById('summary');
  if (summary === null) return;
  const colors = tokens.filter((token) => token.type === 'color').length;
  const typography = tokens.filter((token) => token.type === 'typography').length;
  summary.textContent =
    `${String(tokens.length)} tokens from “${manifest.source.fileName}” — ` +
    `${String(colors)} colours, ${String(typography)} text styles.`;
}

renderSummary();
renderColors();
renderSizes();
renderTypography();
