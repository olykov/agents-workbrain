import { readFileSync } from 'node:fs';

export const PROJECT_ID = /^PRJ-[A-Z0-9]+(?:-[A-Z0-9]+)*$/;
export const TASK_ID = /^[A-Z][A-Z0-9]*-[A-Z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
export const TASK_TYPES = new Set([
  'research', 'discovery', 'feature', 'bug-fix', 'refactor', 'chore', 'incident', 'documentation',
]);
export const TASK_STATUSES = new Set([
  'backlog', 'todo', 'in_progress', 'review', 'done', 'blocked', 'cancelled',
]);

const CYRILLIC = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z',
  и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ь: '', ю: 'iu', я: 'ia', ы: 'y', э: 'e', ъ: '', ё: 'e',
};

export function parseArgs(argv) {
  const values = { apply: false, format: 'text' };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') values.apply = true;
    else if (arg.startsWith('--')) {
      const key = arg.slice(2).replaceAll('-', '_');
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${arg}`);
      values[key] = value;
      index += 1;
    } else throw new Error(`Unexpected argument: ${arg}`);
  }
  return values;
}

export function slugify(value, fallback) {
  const transliterated = [...value.toLowerCase()].map((char) => CYRILLIC[char] ?? char).join('');
  const slug = transliterated.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return slug || fallback;
}

export function yamlString(value) {
  return JSON.stringify(String(value));
}

export function parseFrontmatter(path) {
  const text = readFileSync(path, 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (!match) throw new Error(`${path}: missing YAML frontmatter`);
  const data = {};
  for (const line of match[1].split('\n')) {
    const field = line.match(/^([a-z_]+):(?:\s*(.*))?$/);
    if (!field) continue;
    const [, key, raw = ''] = field;
    const value = raw.trim();
    if (value === 'null') data[key] = null;
    else if (value.startsWith('[')) {
      try { data[key] = JSON.parse(value); } catch { data[key] = undefined; }
    } else if (value.startsWith('"')) {
      try { data[key] = JSON.parse(value); } catch { data[key] = undefined; }
    } else if (/^\d+$/.test(value)) data[key] = Number(value);
    else data[key] = value;
  }
  return data;
}
