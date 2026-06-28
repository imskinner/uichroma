// Post-build fixups for the dual CJS/ESM output:
//   1. Stamp each output dir with the correct module type so Node resolves dist/cjs/* as
//      CommonJS and dist/esm/* as ES modules, regardless of the package's root "type".
//   2. Rewrite the ESM build's extensionless relative specifiers (e.g. `from "./color"`) to
//      include `.js`. tsc emits them extensionless, which the bundler tolerates but Node's
//      strict ESM loader rejects (ERR_MODULE_NOT_FOUND) — so any Node ESM consumer (the MCP
//      server, future Vercel functions) needs the explicit extension.
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');

// 1. Module-type markers.
const targets = [
  ['cjs', { type: 'commonjs' }],
  ['esm', { type: 'module' }],
];
for (const [dir, manifest] of targets) {
  const outDir = path.join(dist, dir);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, 'package.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
}

// 2. Add `.js` to relative import/export specifiers in the ESM output.
const esmDir = path.join(dist, 'esm');
// Matches the specifier in `from "<spec>"` / `import "<spec>"` where <spec> is relative.
const SPECIFIER = /(\bfrom\s*["']|\bimport\s*["'])(\.\.?\/[^"']+?)(["'])/g;
let patched = 0;
for (const file of fs.readdirSync(esmDir)) {
  if (!file.endsWith('.js')) continue;
  const full = path.join(esmDir, file);
  const src = fs.readFileSync(full, 'utf8');
  const out = src.replace(SPECIFIER, (m, pre, spec, post) => {
    if (/\.[a-zA-Z0-9]+$/.test(spec)) return m; // already has an extension
    return `${pre}${spec}.js${post}`;
  });
  if (out !== src) {
    fs.writeFileSync(full, out);
    patched++;
  }
}

console.log(
  `core: wrote dist/cjs and dist/esm package.json type markers; patched ${patched} ESM file(s) with .js extensions`,
);
