#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { vaultPath } from './vault.mjs';
import { PROJECT_ID, TASK_ID, SLUG, TASK_TYPES, TASK_STATUSES, parseArgs, parseFrontmatter } from './lib.mjs';

const args = parseArgs(process.argv.slice(2));
const vault = vaultPath();
const errors = [];
const projects = new Map();
const tasks = new Map();
function entries(directory) {
  return existsSync(directory) ? readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isDirectory()) : [];
}
for (const zone of ['02_work', 'archive']) {
  for (const group of entries(resolve(vault, zone))) {
    const slug = group.name;
    const base = resolve(vault, zone, slug);
    const manifest = resolve(base, 'project.md');
    if (existsSync(manifest)) {
      try {
        const data = parseFrontmatter(manifest);
        if (data.schema_version !== 1) errors.push(`${manifest}: schema_version must be 1`);
        if (!PROJECT_ID.test(data.project_id ?? '')) errors.push(`${manifest}: invalid project_id`);
        if (data.slug !== slug || !SLUG.test(slug)) errors.push(`${manifest}: slug must match its folder`);
        if (!data.name?.trim()) errors.push(`${manifest}: name is required`);
        if (!['active', 'paused', 'archived'].includes(data.status)) errors.push(`${manifest}: invalid status`);
        if (data.vault !== 'workbrain') errors.push(`${manifest}: vault must be workbrain`);
        if (projects.has(data.project_id)) errors.push(`${manifest}: duplicate project_id`);
        projects.set(data.project_id, { path: manifest, slug, zone });
      } catch (error) { errors.push(error.message); }
    } else if (slug !== '_no_project' && zone === '02_work') errors.push(`${base}: missing project.md`);
    for (const folder of [base, resolve(base, 'tasks')]) {
      if (!existsSync(folder)) continue;
      for (const entry of entries(folder)) {
        const path = resolve(folder, entry.name, 'task.md');
        if (!existsSync(path)) continue;
        try {
          const data = parseFrontmatter(path);
          if (data.schema_version !== 1) errors.push(`${path}: schema_version must be 1`);
          if (!TASK_ID.test(data.id ?? '')) errors.push(`${path}: invalid task ID`);
          if (data.slug !== basename(resolve(path, '..')) || !SLUG.test(data.slug ?? '')) errors.push(`${path}: invalid slug`);
          if (!data.title?.trim()) errors.push(`${path}: title is required`);
          if (!TASK_STATUSES.has(data.status)) errors.push(`${path}: invalid status`);
          if (!TASK_TYPES.has(data.type)) errors.push(`${path}: invalid type`);
          if (!['critical', 'high', 'medium', 'low'].includes(data.priority)) errors.push(`${path}: invalid priority`);
          if (data.project !== (slug === '_no_project' ? null : slug)) errors.push(`${path}: project must match physical folder`);
          if (Array.isArray(data.projects) || data.additional_projects !== undefined) errors.push(`${path}: legacy project arrays are not allowed`);
          if (zone === '02_work' && folder === base) errors.push(`${path}: active tasks belong under tasks/`);
          if (zone === '02_work' && ['Closed', 'Cancelled'].includes(data.status)) errors.push(`${path}: terminal task remains active`);
          if (zone === 'archive' && folder === base && !['Closed', 'Cancelled'].includes(data.status) && existsSync(manifest) === false) {
            errors.push(`${path}: individual archived task must be Closed or Cancelled`);
          }
          if (tasks.has(data.id)) errors.push(`${path}: duplicate task ID ${data.id}`);
          tasks.set(data.id, { path, data, slug, zone });
        } catch (error) { errors.push(error.message); }
      }
    }
  }
}
for (const { path, data, slug } of tasks.values()) {
  if (!data.parent) continue;
  const parent = tasks.get(data.parent);
  if (!parent) errors.push(`${path}: unknown parent ${data.parent}`);
  else if (parent.slug !== slug) errors.push(`${path}: parent belongs to another project`);
  const expected = data.parent.split('-').length === 2 ? `${data.parent}-\\d{3}` : `${data.parent}-\\d{2}`;
  if (!new RegExp(`^${expected}$`).test(data.id)) errors.push(`${path}: ID does not match parent hierarchy`);
}
const result = { vault, projects: projects.size, tasks: tasks.size, invalid: errors.length, errors };
if (args.format === 'json') console.log(JSON.stringify(result, null, 2));
else {
  console.log(`projects=${result.projects} tasks=${result.tasks} invalid=${result.invalid}`);
  for (const error of errors) console.log(`ERROR ${error}`);
  console.log(errors.length ? 'FAIL' : 'PASS');
}
if (errors.length) process.exitCode = 1;
