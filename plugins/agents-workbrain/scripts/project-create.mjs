#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vaultPath } from './vault.mjs';
import { PROJECT_ID, SLUG, parseArgs, parseFrontmatter, slugify, yamlString } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!PROJECT_ID.test(args.id ?? '')) throw new Error('Use --id PRJ-NAME.');
if (!args.name?.trim() || /[\r\n]/.test(args.name)) throw new Error('Use --name with one non-empty line.');
const slug = args.slug ?? slugify(args.name, args.id.toLowerCase().replaceAll('-', '_'));
if (!SLUG.test(slug) || slug === '_no_project') throw new Error('Project slug must be snake_case.');
const vault = vaultPath();
for (const zone of ['02_work', 'archive']) {
  const root = resolve(vault, zone);
  if (!existsSync(root)) continue;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (entry.name === slug) throw new Error(`Project folder already exists: ${slug}`);
    const candidate = resolve(root, entry.name, 'project.md');
    if (existsSync(candidate) && parseFrontmatter(candidate).project_id === args.id) {
      throw new Error(`Project ID already exists: ${args.id}`);
    }
  }
}
const target = resolve(vault, '02_work', slug, 'project.md');
const now = new Date().toISOString();
const name = args.name.trim();
const content = `---\nschema_version: 1\nproject_id: ${yamlString(args.id)}\nname: ${yamlString(name)}\nslug: ${yamlString(slug)}\nstatus: active\nvault: workbrain\naliases: []\nworkspaces: []\ncreated: ${yamlString(now)}\nupdated: ${yamlString(now)}\n---\n\n# ${name}\n\n## Scope\n\n## Agent context\n\nActive tasks live in \`02_work/${slug}/tasks/\`; individually archived tasks live in \`archive/${slug}/\`. Project membership comes from the physical folder and scalar \`project: ${slug}\`.\n\n## Notes\n`;
console.log(JSON.stringify({ mode: args.apply ? 'apply' : 'dry_run', target, project_id: args.id, slug }, null, 2));
if (args.apply) {
  mkdirSync(resolve(vault, '02_work', slug, 'tasks'), { recursive: true });
  writeFileSync(target, content, { flag: 'wx' });
}
