#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { vaultPath } from './vault.mjs';
import { PROJECT_ID, parseArgs, parseFrontmatter } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (!PROJECT_ID.test(args.project ?? '')) throw new Error('Use --project with a valid PRJ-* ID.');
const vault = vaultPath();

function manifests(root, filename) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isDirectory())
    .map((entry) => resolve(root, entry.name, filename)).filter(existsSync);
}

const project = manifests(resolve(vault, '02_projects'), 'project.md')
  .map((path) => ({ path, data: parseFrontmatter(path) }))
  .find(({ data }) => data.project_id === args.project);
if (!project) throw new Error(`Project not found: ${args.project}`);
const tasks = manifests(resolve(vault, '02_tasks'), 'task.md')
  .map((path) => ({ path, ...parseFrontmatter(path) }))
  .filter((task) => Array.isArray(task.projects) && task.projects.includes(args.project))
  .sort((a, b) => String(a.id).localeCompare(String(b.id)));
const result = {
  project_id: args.project, project_file: project.path, name: project.data.name,
  task_count: tasks.length,
  tasks: tasks.map(({ path, id, title, status, type }) => ({ id, title, status, type, path })),
};
if (args.format === 'json') console.log(JSON.stringify(result, null, 2));
else {
  console.log(`${result.project_id} — ${result.name} (${result.task_count} tasks)`);
  for (const task of result.tasks) console.log(`${task.id}\t${task.status}\t${task.title}`);
}
