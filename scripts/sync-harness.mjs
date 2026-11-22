import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';

const skills = new URL('../skills/', import.meta.url);
const constitution = readFileSync(new URL('../HARNESS.md', import.meta.url), 'utf8')
  .replaceAll('\r\n', '\n');

for (const entry of readdirSync(skills, { withFileTypes: true })) {
  if (!entry.isDirectory() || !entry.name.startsWith('harness-')) continue;
  const references = new URL(`${entry.name}/references/`, skills);
  mkdirSync(references, { recursive: true });
  writeFileSync(new URL('HARNESS.md', references), constitution);
}
