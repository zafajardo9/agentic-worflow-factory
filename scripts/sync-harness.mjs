import { chmodSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';

const skills = new URL('../skills/', import.meta.url);
const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const constitution = read('HARNESS.md');
const graphHelper = read('harness-graph.sh');

for (const entry of readdirSync(skills, { withFileTypes: true })) {
  if (!entry.isDirectory() || !entry.name.startsWith('harness-')) continue;
  const references = new URL(`${entry.name}/references/`, skills);
  mkdirSync(references, { recursive: true });
  writeFileSync(new URL('HARNESS.md', references), constitution);

  const scripts = new URL(`${entry.name}/scripts/`, skills);
  mkdirSync(scripts, { recursive: true });
  const helper = new URL('harness-graph.sh', scripts);
  writeFileSync(helper, graphHelper);
  chmodSync(helper, 0o755);
}
