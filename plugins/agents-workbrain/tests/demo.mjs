#!/usr/bin/env node
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const home = mkdtempSync(resolve(tmpdir(), 'agents-workbrain-demo-'));
const env = { ...process.env, HOME: home, USERPROFILE: home };
function run(script, args = []) {
  const result = spawnSync(process.execPath, [resolve(root, 'scripts', script), ...args], { env, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout;
}
try {
  run('init-workbrain.mjs', ['--apply']);
  run('project-create.mjs', ['--id', 'PRJ-DEMO', '--name', 'Demo project', '--slug', 'demo', '--apply']);
  run('task-create.mjs', ['--id', 'DEMO-0001', '--title', 'Example task', '--type', 'documentation', '--project', 'demo', '--apply']);
  run('task-create.mjs', ['--title', 'Child task', '--type', 'documentation', '--project', 'demo', '--parent', 'DEMO-0001', '--apply']);
  run('task-create.mjs', ['--title', 'Grandchild task', '--type', 'documentation', '--project', 'demo', '--parent', 'DEMO-0001-001', '--apply']);
  const vault = resolve(home, 'workbrain');
  const rootTask = resolve(vault, '02_work', 'demo', 'tasks', 'demo_0001', 'task.md');
  writeFileSync(rootTask, readFileSync(rootTask, 'utf8').replace('completion_evidence: []', 'completion_evidence: ["Example result"]'));
  const source = resolve(vault, '02_work', 'demo', 'tasks', 'demo_0001_001_01');
  const destination = resolve(vault, 'archive', 'demo', 'demo_0001_001_01');
  const file = resolve(source, 'task.md');
  writeFileSync(file, readFileSync(file, 'utf8').replace('status: todo', 'status: "Closed"'));
  mkdirSync(resolve(vault, 'archive', 'demo'), { recursive: true });
  renameSync(source, destination);
  const context = JSON.parse(run('project-context.mjs', ['--project', 'PRJ-DEMO', '--format', 'json']));
  if (context.task_count !== 3 || context.active_count !== 2) throw new Error('Project context missed active or archived tasks');
  const validation = JSON.parse(run('task-validate.mjs', ['--format', 'json']));
  if (validation.invalid !== 0) throw new Error(JSON.stringify(validation.errors));
  console.log('02_work/demo/project.md');
  console.log('02_work/demo/tasks/demo_0001/task.md');
  console.log('02_work/demo/tasks/demo_0001_001/task.md');
  console.log('archive/demo/demo_0001_001_01/task.md  [Closed]');
  console.log(`demo: PASS; tasks=${context.task_count}; active=${context.active_count}; archived=1`);
  if (process.argv.includes('--keep')) console.log(`Demo vault: ${vault}`);
} finally {
  if (!process.argv.includes('--keep')) rmSync(home, { recursive: true, force: true });
}
