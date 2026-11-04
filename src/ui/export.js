/**
 * "Save JPG" and "Share" buttons under the preview.
 * Share uses the Web Share API and is shown only on touch devices that can share files
 * (on phones it is the easiest way to save the image to Photos).
 */

import { state } from '../state.js';
import { t } from '../i18n.js';
import { renderJpeg, exportFileName } from './preview.js';
import { showToast } from './toast.js';
import { byId } from '../utils/html.js';
import { downloadBlob } from '../utils/download.js';

export function initExport() {
  const saveBtn = byId('downloadBtn');
  const shareBtn = byId('shareBtn');

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    try {
      downloadBlob(await renderJpeg(), exportFileName());
      showToast(t('saved'));
    } catch (err) {
      console.error(err);
      showToast(t('saveFailed'));
    } finally {
      saveBtn.disabled = false;
    }
  });

  shareBtn.hidden = !canShareImages();
  shareBtn.addEventListener('click', async () => {
    try {
      const file = new File([await renderJpeg()], exportFileName(), { type: 'image/jpeg' });
      await navigator.share({ files: [file], title: `Travel Year ${state.year}` });
    } catch (err) {
      if (err?.name !== 'AbortError') showToast(t('shareFailed')); // AbortError = user closed the share sheet
    }
  });
}

function canShareImages() {
  try {
    const probe = new File([new Blob()], 'probe.jpg', { type: 'image/jpeg' });
    return Boolean(navigator.canShare?.({ files: [probe] })) && matchMedia('(pointer: coarse)').matches;
  } catch {
    return false;
  }
}
