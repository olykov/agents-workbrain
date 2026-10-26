#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { vaultPath } from './vault.mjs';
import { PROJECT_ID, parseArgs, parseFrontmatter } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!PROJECT_ID.test(args.project ?? '')) throw new Error('Use --project with a valid PRJ-* ID.');
const vault = vaultPath();
function projects(zone) {
  const root = resolve(vault, zone);
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory())
    .map((entry) => resolve(root, entry.name, 'project.md')).filter(existsSync)
    .map((path) => ({ path, data: parseFrontmatter(path) }));
}
const project = [...projects('02_work'), ...projects('archive')].find(({ data }) => data.project_id === args.project);
if (!project) throw new Error(`Project not found: ${args.project}`);
const slug = project.data.slug;
const tasks = [];
for (const [zone, directory] of [['02_work', resolve(vault, '02_work', slug, 'tasks')], ['archive', resolve(vault, 'archive', slug)], ['archive', resolve(vault, 'archive', slug, 'tasks')]]) {
  if (!existsSync(directory)) continue;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = resolve(directory, entry.name, 'task.md');
    if (existsSync(path)) tasks.push({ path, archived: zone === 'archive', ...parseFrontmatter(path) });
  }
}
tasks.sort((a, b) => String(a.id).localeCompare(String(b.id)));
const result = {
  project_id: args.project, project_file: project.path, name: project.data.name,
  archived: project.path.includes('/archive/'), task_count: tasks.length,
  active_count: tasks.filter((task) => !task.archived).length,
  tasks: tasks.map(({ path, id, title, status, type, parent, archived }) => ({ id, title, status, type, parent, archived, path })),
};
if (args.format === 'json') console.log(JSON.stringify(result, null, 2));
else {
  console.log(`${result.project_id} — ${result.name} (${result.task_count} tasks)`);
  for (const task of result.tasks) console.log(`${task.id}\t${task.archived ? 'archived' : task.status}\t${task.title}`);
}
