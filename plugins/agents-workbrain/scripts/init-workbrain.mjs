#!/usr/bin/env node
import { existsSync, mkdirSync, copyFileSync, symlinkSync, lstatSync, readlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { vaultPath } from './vault.mjs';
import { parseArgs } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const vault = vaultPath();
const templates = resolve(import.meta.dirname, '..', 'templates');
const directories = ['00_inbox', '01_knowledge_base/00_system', '02_projects', '02_tasks', '99_archive'];
const files = [
  ['README.md', 'vault_readme.md'],
  ['AGENTS.md', 'AGENTS.md'],
  ['.gitignore', 'vault_gitignore'],
  ['01_knowledge_base/00_system/routing_rules.md', 'routing_rules.md'],
  ['01_knowledge_base/00_system/security_policy.md', 'security_policy.md'],
];

const conflicts = files.map(([target]) => resolve(vault, target)).filter(existsSync);
const claudePath = resolve(vault, 'CLAUDE.md');
if (existsSync(claudePath)) {
  const validLink = lstatSync(claudePath).isSymbolicLink() && readlinkSync(claudePath) === 'AGENTS.md';
  if (!validLink) conflicts.push(claudePath);
}
const plan = {
  mode: args.apply ? 'apply' : 'dry_run', vault, directories,
  files: files.map(([target]) => target), symlink: 'CLAUDE.md -> AGENTS.md',
};
if (!args.apply) {
  console.log(JSON.stringify(plan, null, 2));
  process.exit(0);
}
if (conflicts.length) throw new Error(`Refusing to overwrite existing control files:\n${conflicts.join('\n')}`);
for (const directory of directories) mkdirSync(resolve(vault, directory), { recursive: true });
for (const [target, source] of files) copyFileSync(resolve(templates, source), resolve(vault, target));
if (!existsSync(claudePath)) symlinkSync('AGENTS.md', claudePath);
console.log(JSON.stringify(plan, null, 2));
