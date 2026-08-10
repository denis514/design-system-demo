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

function renderColors(): void {
  const blocks: Node[] = [];

  for (const tier of TIERS) {
    const inTier = byTypeAndTier('color', tier);
    if (inTier.length === 0) continue;

    blocks.push(el('h3', 'group-title', `${tier} · ${String(inTier.length)}`));

    const grid = el('div', 'swatch-grid');
    for (const token of inTier) {
      const name = token.outputNames['css'] ?? '';
      const swatch = el('div', 'swatch');
      const chip = el('div', 'swatch-chip');
      chip.style.background = `var(${name})`;
      swatch.append(chip, el('span', 'swatch-name', token.path.join('-')));
      grid.append(swatch);
    }
    blocks.push(grid);
  }

  mount('colors', blocks);
}

function renderSizes(): void {
  const dimensions = tokens
    .filter((token) => token.type === 'dimension')
    // Only the primitive scale: the semantic layer points at it, so showing both is noise.
    .filter((token) => token.tier === 'primitive')
    .slice(0, 40);

  const rows = dimensions.map((token) => {
    const name = token.outputNames['css'] ?? '';
    const row = el('div', 'size-row');
    const bar = el('div', 'size-bar');
    bar.style.width = `var(${name})`;
    row.append(el('span', 'size-name', token.path.join('-')), bar);
    return row;
  });

  mount('sizes', rows);
}

function renderTypography(): void {
  const specimens = tokens
    .filter((token) => token.type === 'typography')
    .map((token) => {
      const className = token.path.join('-');
      const block = el('div', 'type-row');
      const sample = el('p', className, 'The quick brown fox jumps over the lazy dog');
      block.append(sample, el('span', 'type-name', className));
      return block;
    });

  mount('typography', specimens);
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
