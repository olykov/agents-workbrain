#!/usr/bin/env node
import { lstatSync, mkdtempSync, readFileSync, readlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const pluginRoot = resolve(import.meta.dirname, '..');
const scripts = resolve(pluginRoot, 'scripts');
const home = mkdtempSync(resolve(tmpdir(), 'agents-workbrain-'));
const pluginData = resolve(home, 'plugin-data');
const env = {
  ...process.env,
  HOME: home,
  USERPROFILE: home,
  USER: 'Test User',
  CLAUDE_PLUGIN_ROOT: pluginRoot,
  PLUGIN_ROOT: pluginRoot,
  CLAUDE_PLUGIN_DATA: pluginData,
  PLUGIN_DATA: pluginData,
};

function run(command, args, expected = 0, input) {
  const result = spawnSync(command, args, { encoding: 'utf8', env, input });
  if (result.status !== expected) throw new Error(`${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function runProgressHook(payload) {
  return JSON.parse(run(
    process.execPath,
    [resolve(pluginRoot, 'hooks', 'task_progress.mjs')],
    0,
    JSON.stringify(payload),
  ));
}

try {
  const dryRun = run(process.execPath, [resolve(scripts, 'init-workbrain.mjs')]);
  if (!dryRun.includes('dry_run') || !dryRun.includes('CLAUDE.md -> AGENTS.md')) throw new Error(dryRun);
  run(process.execPath, [resolve(scripts, 'init-workbrain.mjs'), '--apply']);
  const claude = resolve(home, 'workbrain', 'CLAUDE.md');
  if (!lstatSync(claude).isSymbolicLink() || readlinkSync(claude) !== 'AGENTS.md') throw new Error('CLAUDE.md is not the expected symlink');
  const agents = readFileSync(resolve(home, 'workbrain', 'AGENTS.md'), 'utf8');
  if (!agents.includes('Before the final response, synchronize the task')) throw new Error(agents);
  run(process.execPath, [resolve(scripts, 'init-workbrain.mjs'), '--apply'], 1);

  const hook = run(process.execPath, [resolve(pluginRoot, 'hooks', 'session_context.mjs')]);
  if (!hook.includes('(ready)')) throw new Error(hook);

  run(process.execPath, [resolve(scripts, 'project-create.mjs'), '--id', 'PRJ-DEMO', '--name', 'Demo project', '--apply']);
  run(process.execPath, [resolve(scripts, 'project-create.mjs'), '--id', 'PRJ-WRONG-', '--name', 'Wrong'], 1);
  run(process.execPath, [
    resolve(scripts, 'task-create.mjs'), '--id', 'DEMO-1', '--title', 'First task',
    '--type', 'documentation', '--projects', 'PRJ-DEMO', '--apply',
  ]);
  run(process.execPath, [
    resolve(scripts, 'task-create.mjs'), '--id', '../BAD', '--title', 'Bad task',
    '--type', 'documentation', '--projects', 'PRJ-DEMO',
  ], 1);

  const validation = run(process.execPath, [resolve(scripts, 'task-validate.mjs')]);
  if (!validation.includes('invalid=0') || !validation.includes('PASS')) throw new Error(validation);
  const context = JSON.parse(run(process.execPath, [
    resolve(scripts, 'project-context.mjs'), '--project', 'PRJ-DEMO', '--format', 'json',
  ]));
  if (context.task_count !== 1 || context.tasks[0].id !== 'DEMO-1') throw new Error(JSON.stringify(context));

  const task = readFileSync(resolve(home, 'workbrain', '02_tasks', 'demo_1', 'task.md'), 'utf8');
  if (!task.includes('reporter: "Test User"')) throw new Error(task);

  const progressSession = 'progress-session';
  const materialChange = runProgressHook({
    hook_event_name: 'PostToolUse',
    session_id: progressSession,
    tool_name: 'Edit',
    tool_input: { file_path: resolve(home, 'project', 'result.md') },
  });
  if (Object.keys(materialChange).length !== 0) throw new Error(JSON.stringify(materialChange));
  const blockedStop = runProgressHook({
    hook_event_name: 'Stop',
    session_id: progressSession,
    stop_hook_active: false,
  });
  if (blockedStop.decision !== 'block' || !blockedStop.reason.includes('task.md')) {
    throw new Error(JSON.stringify(blockedStop));
  }
  runProgressHook({
    hook_event_name: 'PostToolUse',
    session_id: progressSession,
    tool_name: 'Write',
    tool_input: { file_path: resolve(home, 'workbrain', '02_tasks', 'demo_1', 'task.md') },
  });
  const cleanStop = runProgressHook({
    hook_event_name: 'Stop',
    session_id: progressSession,
    stop_hook_active: false,
  });
  if (Object.keys(cleanStop).length !== 0) throw new Error(JSON.stringify(cleanStop));

  runProgressHook({
    hook_event_name: 'PostToolUse',
    session_id: progressSession,
    tool_name: 'apply_patch',
    tool_input: { patch: 'material change' },
  });
  const guardedStop = runProgressHook({
    hook_event_name: 'Stop',
    session_id: progressSession,
    stop_hook_active: true,
  });
  if (Object.keys(guardedStop).length !== 0) throw new Error(JSON.stringify(guardedStop));
  const afterGuard = runProgressHook({
    hook_event_name: 'Stop',
    session_id: progressSession,
    stop_hook_active: false,
  });
  if (Object.keys(afterGuard).length !== 0) throw new Error(JSON.stringify(afterGuard));

  const inbox = JSON.parse(run('python3', [
    resolve(pluginRoot, 'skills', 'workbrain-router', 'scripts', 'inspect_inbox.py'), '--format', 'json',
  ]));
  if (inbox.mode !== 'read_only') throw new Error(JSON.stringify(inbox));
  console.log('smoke: PASS');
} finally {
  rmSync(home, { recursive: true, force: true });
}
