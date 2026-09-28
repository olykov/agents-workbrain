#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { vaultPath } from '../scripts/vault.mjs';

const eventName = 'SessionStart';
const VAULT = vaultPath();
const required = ['AGENTS.md', 'CLAUDE.md', '02_projects', '02_tasks'];
const missing = required.filter((entry) => !existsSync(resolve(VAULT, entry)));
const state = missing.length
  ? `not initialized; missing ${missing.join(', ')}`
  : 'ready';
const context = `Workbrain vault: ${VAULT} (${state}). Start by reading AGENTS.md or CLAUDE.md, then load the relevant project manifest and task.md. Keep task progress durable: update status and timestamps, check completed acceptance criteria, attach evidence or links, and append a dated progress comment before finishing material work. Raw sources are immutable without explicit approval. Creation and routing tools are dry-run by default. If the vault is not initialized, use scripts/init-workbrain.mjs and review the dry-run before applying it.`;

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: eventName,
    additionalContext: context,
  },
}));
