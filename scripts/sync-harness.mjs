import { chmodSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';

const skills = new URL('../skills/', import.meta.url);
const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
const constitution = read('HARNESS.md');
const helpers = ['harness-graph.sh', 'harness-graph.mjs', 'harness-issue.sh', 'harness-brain.sh'];

for (const entry of readdirSync(skills, { withFileTypes: true })) {
  if (!entry.isDirectory() || !entry.name.startsWith('harness-')) continue;
  const references = new URL(`${entry.name}/references/`, skills);
  mkdirSync(references, { recursive: true });
  writeFileSync(new URL('HARNESS.md', references), constitution);

  const scripts = new URL(`${entry.name}/scripts/`, skills);
  mkdirSync(scripts, { recursive: true });
  for (const helper of helpers) {
    const target = new URL(helper, scripts);
    writeFileSync(target, read(helper));
    chmodSync(target, 0o755);
  }
}
