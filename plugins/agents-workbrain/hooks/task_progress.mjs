#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

function readInput() {
  const raw = readFileSync(0, 'utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function statePath(sessionId) {
  const root = process.env.CLAUDE_PLUGIN_DATA || process.env.PLUGIN_DATA
    || resolve(tmpdir(), 'agents-workbrain-hooks');
  mkdirSync(root, { recursive: true });
  const key = createHash('sha256').update(sessionId || 'unknown-session').digest('hex');
  return resolve(root, `progress-${key}.json`);
}

function isTaskUpdate(input) {
  const serialized = JSON.stringify(input.tool_input || {});
  return /(?:^|[\\/])02_tasks[\\/][^"']+[\\/]task\.md(?:["']|$)/.test(serialized);
}

function isMaterialChange(input) {
  const tool = input.tool_name || '';
  if (['Edit', 'Write', 'apply_patch'].includes(tool)) return true;
  if (tool !== 'Bash') return false;
  const command = String(input.tool_input?.command || '');
  return /(?:^|[;&|\s])(?:git\s+(?:commit|push|merge|rebase)|mv|cp|mkdir|rm|touch|tee|sed\s+-i|perl\s+-pi|apply_patch)(?:\s|$)|(?:^|[^<])>{1,2}(?:[^>]|$)/.test(command);
}

const input = readInput();
const event = input.hook_event_name;
const marker = statePath(input.session_id);

if (event === 'PostToolUse') {
  if (isTaskUpdate(input)) rmSync(marker, { force: true });
  else if (isMaterialChange(input)) {
    writeFileSync(marker, JSON.stringify({ updated_at: new Date().toISOString(), tool: input.tool_name }));
  }
  process.stdout.write('{}');
} else if (event === 'Stop') {
  if (!existsSync(marker)) process.stdout.write('{}');
  else if (input.stop_hook_active) {
    rmSync(marker, { force: true });
    process.stdout.write('{}');
  } else {
    process.stdout.write(JSON.stringify({
      decision: 'block',
      reason: 'Before finishing, update the relevant Workbrain task.md: current status, checked acceptance criteria, evidence or links, and an append-only dated progress comment. If this turn does not belong to a task, state that briefly and then finish.',
    }));
  }
} else if (event === 'SessionEnd') {
  rmSync(marker, { force: true });
  process.stdout.write('{}');
} else {
  process.stdout.write('{}');
}
