#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vaultPath } from './vault.mjs';
import { PROJECT_ID, SLUG, parseArgs, slugify, yamlString } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!PROJECT_ID.test(args.id ?? '')) throw new Error('Use --id PRJ-NAME with uppercase letters, digits and single hyphens.');
if (!args.name?.trim() || /[\r\n]/.test(args.name)) throw new Error('Use --name with one non-empty line.');
const slug = args.slug ?? slugify(args.name, args.id.toLowerCase().replaceAll('-', '_'));
if (!SLUG.test(slug)) throw new Error('Project slug must be snake_case.');

const vault = vaultPath();
const target = resolve(vault, '02_projects', slug, 'project.md');
const now = new Date().toISOString();
const name = args.name.trim();
const content = `---\nschema_version: 1\nproject_id: ${yamlString(args.id)}\nname: ${yamlString(name)}\nslug: ${yamlString(slug)}\nstatus: active\nvault: workbrain\naliases: []\nworkspaces: []\ncreated: ${yamlString(now)}\nupdated: ${yamlString(now)}\n---\n\n# ${name}\n\n## Scope\n\n## Agent context\n\nTask membership is stored in each task's \`projects[]\`.\n\n## Notes\n`;
console.log(JSON.stringify({ mode: args.apply ? 'apply' : 'dry_run', target, project_id: args.id, slug }, null, 2));
if (!args.apply) process.exit(0);
if (existsSync(target)) throw new Error(`Refusing to overwrite ${target}`);
mkdirSync(resolve(target, '..'), { recursive: true });
writeFileSync(target, content);
