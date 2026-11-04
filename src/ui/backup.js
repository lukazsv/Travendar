/**
 * Backup: export all trips and settings to a JSON file and import them back
 * (Advanced → Backup). Useful before clearing browser data or to move to another device.
 *
 * File format:
 *   { "format": "travendar-backup", "version": 1, "exportedAt": "<ISO time>", "data": <AppState> }
 *
 * Imported files are untrusted: they go through sanitizeState() like localStorage does.
 */

import { BACKUP_FORMAT, BACKUP_VERSION, BACKUP_MAX_BYTES } from '../config.js';
import { state, commit, sanitizeState, replaceState } from '../state.js';
import { t } from '../i18n.js';
import { toISODate } from '../core/dates.js';
import { showToast } from './toast.js';
import { byId } from '../utils/html.js';
import { downloadBlob } from '../utils/download.js';

/** @param {() => void} onImported  called after state was replaced, to re-sync the settings controls */
export function initBackup(onImported) {
  const fileInput = byId('importFile');

  byId('exportBtn').addEventListener('click', () => {
    const backup = {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: state,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `travendar-backup-${toISODate(new Date())}.json`);
    showToast(t('exported'));
  });

  byId('importBtn').addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = ''; // allow choosing the same file again
    if (!file) return;
    try {
      const next = await readBackup(file);
      if (state.trips.length && !confirm(t('importConfirm'))) return;
      replaceState(next);
      onImported();
      commit({ trips: true, lang: true, year: true, flagStyle: true });
      showToast(t('importDone'));
    } catch (err) {
      console.error(err);
      showToast(t('importFailed'));
    }
  });
}

/**
 * Reads and validates a backup file.
 * Also accepts a bare state object (what localStorage holds) for convenience.
 * @param {File} file
 * @returns {Promise<import('../state.js').AppState>}
 */
async function readBackup(file) {
  if (file.size > BACKUP_MAX_BYTES) throw new Error('Backup file too large');
  const json = JSON.parse(await file.text());
  const payload = json?.format === BACKUP_FORMAT ? json.data : json;
  if (json?.format === BACKUP_FORMAT && json.version > BACKUP_VERSION) throw new Error('Backup from a newer version');
  const next = sanitizeState(payload);
  if (!next) throw new Error('Not a Travendar backup');
  return next;
}
