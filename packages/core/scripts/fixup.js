// Stamp the dual-build output directories with the correct module type so Node resolves
// dist/cjs/* as CommonJS and dist/esm/* as ES modules, regardless of the root "type".
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
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

console.log('core: wrote dist/cjs and dist/esm package.json type markers');
