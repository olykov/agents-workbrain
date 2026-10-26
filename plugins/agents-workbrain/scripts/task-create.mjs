#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { vaultPath } from './vault.mjs';
import { SLUG, TASK_ID, TASK_TYPES, parseArgs, parseFrontmatter, yamlString } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!args.title?.trim() || /[\r\n]/.test(args.title)) throw new Error('Use --title with one non-empty line.');
if (!TASK_TYPES.has(args.type)) throw new Error(`Use --type with one of: ${[...TASK_TYPES].join(', ')}`);
const project = args.project ?? '_no_project';
if (project !== '_no_project' && !SLUG.test(project)) throw new Error('Use --project PROJECT_SLUG or _no_project.');
const vault = vaultPath();
if (project !== '_no_project' && !existsSync(resolve(vault, '02_work', project, 'project.md'))) {
  throw new Error(`Active project not found: ${project}`);
}
const tasks = new Map();
for (const zone of ['02_work', 'archive']) {
  const root = resolve(vault, zone);
  if (!existsSync(root)) continue;
  for (const group of readdirSync(root, { withFileTypes: true })) {
    if (!group.isDirectory()) continue;
    for (const directory of [resolve(root, group.name), resolve(root, group.name, 'tasks')]) {
      if (!existsSync(directory)) continue;
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const path = resolve(directory, entry.name, 'task.md');
        if (existsSync(path)) tasks.set(parseFrontmatter(path).id, { path, project: group.name, zone });
      }
    }
  }
}
const parent = args.parent ?? null;
let id = args.id;
if (parent) {
  const record = tasks.get(parent);
  if (!record || record.zone !== '02_work' || record.project !== project) throw new Error('Parent must be an active task in the same project.');
  const depth = parent.split('-').length - 2;
  if (depth >= 2) throw new Error('Maximum two subtask levels.');
  const width = depth === 0 ? 3 : 2;
  const suffix = new RegExp(`^${parent}-(\\d{${width}})$`);
  const max = Math.max(0, ...[...tasks.keys()].map((candidate) => Number(suffix.exec(candidate)?.[1] ?? 0)));
  if (max >= 10 ** width - 1) throw new Error('No child ID remains in this range.');
  id ??= `${parent}-${String(max + 1).padStart(width, '0')}`;
  if (!suffix.test(id)) throw new Error(`Child ID must be ${parent}-<${width} digits>.`);
} else if (!/^[A-Z]+-\d{4,}$/.test(id ?? '')) {
  throw new Error('Root ID must use PREFIX-0001 or a larger numeric sequence.');
}
if (!TASK_ID.test(id) || tasks.has(id)) throw new Error(`Invalid or duplicate task ID: ${id}`);
const slug = id.toLowerCase().replaceAll('-', '_');
const target = resolve(vault, '02_work', project, 'tasks', slug, 'task.md');
if (existsSync(target)) throw new Error(`Task already exists: ${target}`);
const now = new Date().toISOString();
const title = args.title.trim();
const content = `---\nschema_version: 1\nid: ${yamlString(id)}\ntitle: ${yamlString(title)}\nslug: ${yamlString(slug)}\nstatus: todo\npriority: medium\ntype: ${yamlString(args.type)}\nlabels: []\nassignee: null\nreporter: null\nmodel: null\ncreated: ${yamlString(now)}\nupdated: ${yamlString(now)}\nstart_date: null\nfinish_date: null\nepic: null\nparent: ${parent ? yamlString(parent) : 'null'}\nproject: ${project === '_no_project' ? 'null' : yamlString(project)}\nexternal_refs: []\nrelations: {"depends_on":[],"blocks":[],"related":[]}\nimplementation: {"workspaces":[]}\ncommits: []\ntests: []\ndesign_reports: []\nreview_reports: []\ncompletion_evidence: []\nreview: {}\nbacklog_ref: ""\n---\n\n# ${id} — ${title}\n\n## Problem\n\n## Plan\n\n## Acceptance criteria\n\n## Comments\n\n### ${now} — task created\nDrafted.\n`;
console.log(JSON.stringify({ mode: args.apply ? 'apply' : 'dry_run', target, id, parent, project }, null, 2));
if (args.apply) {
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, content, { flag: 'wx' });
}
