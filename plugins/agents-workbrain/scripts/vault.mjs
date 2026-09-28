// Single source of truth for the local Workbrain vault.
import { homedir } from 'node:os';
import { resolve } from 'node:path';

export function vaultPath() {
  return resolve(homedir(), 'workbrain');
}
