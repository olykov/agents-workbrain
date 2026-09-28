#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { vaultPath } from './vault.mjs';
import { PROJECT_ID, TASK_ID, SLUG, TASK_TYPES, parseArgs, slugify, yamlString, parseFrontmatter } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!TASK_ID.test(args.id ?? '')) throw new Error('Use --id TEAM-1 with a valid task ID.');
if (!args.title?.trim() || /[\r\n]/.test(args.title)) throw new Error('Use --title with one non-empty line.');
if (!TASK_TYPES.has(args.type)) throw new Error(`Use --type with one of: ${[...TASK_TYPES].join(', ')}`);
const projects = [...new Set((args.projects ?? '').split(',').map((value) => value.trim()).filter(Boolean))];
if (!projects.length || projects.some((id) => !PROJECT_ID.test(id))) throw new Error('Use --projects with one or more comma-separated PRJ-* IDs.');
const slug = args.slug ?? slugify(args.id, args.id.toLowerCase().replaceAll('-', '_'));
if (!SLUG.test(slug)) throw new Error('Task slug must be snake_case.');

const vault = vaultPath();
const knownProjects = new Set();
const projectsRoot = resolve(vault, '02_projects');
if (existsSync(projectsRoot)) {
  for (const entry of readdirSync(projectsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifest = resolve(projectsRoot, entry.name, 'project.md');
    if (existsSync(manifest)) knownProjects.add(parseFrontmatter(manifest).project_id);
  }
}
const missing = projects.filter((id) => !knownProjects.has(id));
if (missing.length) throw new Error(`Unknown project IDs: ${missing.join(', ')}`);

const targetDir = resolve(vault, '02_tasks', slug);
const target = resolve(targetDir, 'task.md');
const now = new Date().toISOString();
const reporter = process.env.USER || process.env.USERNAME || 'User';
const title = args.title.trim();
const content = `---\nschema_version: 1\nid: ${yamlString(args.id)}\ntitle: ${yamlString(title)}\nslug: ${yamlString(slug)}\nstatus: todo\npriority: medium\ntype: ${yamlString(args.type)}\nlabels: []\nassignee: null\nreporter: ${yamlString(reporter)}\ncreated: ${yamlString(now)}\nupdated: ${yamlString(now)}\nstart_date: null\nfinish_date: null\nparent: null\nprojects: ${JSON.stringify(projects)}\nexternal_refs: []\ncompletion_evidence: []\n---\n\n# ${args.id} — ${title}\n\n## Problem\n\n## Sources\n\n## Plan\n\n## Acceptance criteria\n\n## Comments\n\n### ${now} — task created\n\nDrafted.\n`;
console.log(JSON.stringify({ mode: args.apply ? 'apply' : 'dry_run', target, id: args.id, projects }, null, 2));
if (!args.apply) process.exit(0);
if (existsSync(target)) throw new Error(`Refusing to overwrite ${target}`);
mkdirSync(targetDir, { recursive: true });
for (const directory of ['sources', 'meetings', 'evidence', 'notes']) mkdirSync(resolve(targetDir, directory));
writeFileSync(target, content);
