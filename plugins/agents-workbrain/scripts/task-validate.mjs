#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { vaultPath } from './vault.mjs';
import { PROJECT_ID, TASK_ID, SLUG, TASK_TYPES, TASK_STATUSES, parseArgs, parseFrontmatter } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const vault = vaultPath();

function manifests(root, filename) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(root, entry.name, filename))
    .filter(existsSync);
}

const projectFiles = manifests(resolve(vault, '02_projects'), 'project.md');
const taskFiles = manifests(resolve(vault, '02_tasks'), 'task.md');
const errors = [];
const projects = new Map();
for (const path of projectFiles) {
  try {
    const data = parseFrontmatter(path);
    if (data.schema_version !== 1) errors.push(`${path}: schema_version must be 1`);
    if (!PROJECT_ID.test(data.project_id ?? '')) errors.push(`${path}: invalid project_id`);
    if (!data.name) errors.push(`${path}: name is required`);
    if (!SLUG.test(data.slug ?? '') || resolve(path, '..').split('/').at(-1) !== data.slug) errors.push(`${path}: slug must match its folder`);
    if (!['active', 'paused', 'archived'].includes(data.status)) errors.push(`${path}: invalid status`);
    if (data.vault !== 'workbrain') errors.push(`${path}: vault must be workbrain`);
    if (projects.has(data.project_id)) errors.push(`${path}: duplicate project_id ${data.project_id}`);
    projects.set(data.project_id, path);
  } catch (error) { errors.push(error.message); }
}

const tasks = new Map();
for (const path of taskFiles) {
  try {
    const data = parseFrontmatter(path);
    const folder = resolve(path, '..').split('/').at(-1);
    if (data.schema_version !== 1) errors.push(`${path}: schema_version must be 1`);
    if (!TASK_ID.test(data.id ?? '')) errors.push(`${path}: invalid id`);
    if (!data.title) errors.push(`${path}: title is required`);
    if (!SLUG.test(data.slug ?? '') || folder !== data.slug) errors.push(`${path}: slug must match its folder`);
    if (!TASK_STATUSES.has(data.status)) errors.push(`${path}: invalid status`);
    if (!TASK_TYPES.has(data.type)) errors.push(`${path}: invalid type`);
    if (!['critical', 'high', 'medium', 'low'].includes(data.priority)) errors.push(`${path}: invalid priority`);
    if (!Array.isArray(data.projects) || data.projects.length === 0) errors.push(`${path}: projects must be a non-empty array`);
    else for (const id of data.projects) {
      if (!PROJECT_ID.test(id)) errors.push(`${path}: invalid project ID ${id}`);
      else if (!projects.has(id)) errors.push(`${path}: unknown project ID ${id}`);
    }
    if (tasks.has(data.id)) errors.push(`${path}: duplicate task id ${data.id}`);
    tasks.set(data.id, { path, data });
  } catch (error) { errors.push(error.message); }
}

for (const { path, data } of tasks.values()) {
  if (data.parent && !tasks.has(data.parent)) errors.push(`${path}: unknown parent ${data.parent}`);
  const seen = new Set([data.id]);
  let current = data.parent;
  while (current && tasks.has(current)) {
    if (seen.has(current)) { errors.push(`${path}: parent cycle includes ${current}`); break; }
    seen.add(current);
    current = tasks.get(current).data.parent;
  }
}

const result = { vault, projects: projectFiles.length, tasks: taskFiles.length, invalid: errors.length, errors };
if (args.format === 'json') console.log(JSON.stringify(result, null, 2));
else {
  console.log(`projects=${result.projects} tasks=${result.tasks} invalid=${result.invalid}`);
  for (const error of errors) console.log(`ERROR ${error}`);
  console.log(errors.length ? 'FAIL' : 'PASS');
}
if (errors.length) process.exitCode = 1;
