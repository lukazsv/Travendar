/**
 * Donation dialog, shown in the middle of the screen after the image was saved or shared:
 * the moment people have just got what they came for. It confirms the save, asks for a
 * tip on buycoffee.to (DONATE_URL) and stays open until closed with the ✕ (or Esc).
 *
 * The donation page is a plain link: no third-party script runs on this site.
 * The footer links to the same page.
 */

import { DONATE_URL } from '../config.js';
import { t } from '../i18n.js';
import { flagHTML } from '../render/flags.js';
import { byId } from '../utils/html.js';

let dialog;

export function initDonate() {
  dialog = byId('donateDialog');
  byId('donateBtn').href = DONATE_URL;
  byId('donateLink').href = DONATE_URL;
  byId('donateClose').addEventListener('click', () => dialog.close());
}

/**
 * Opens the dialog.
 * @param {string} title  What just happened, e.g. "JPG image saved".
 */
export function offerDonation(title) {
  const heading = byId('donateTitle');
  heading.textContent = title;
  fillPitch(byId('donateText'));
  if (!dialog.open) dialog.showModal();
  heading.focus({ preventScroll: true }); // not the ✕, so a tap does not show its focus ring
}

/** The pitch text with the Polish flag in place of "{flag}" (in the current flag style). */
function fillPitch(el) {
  const [before, after = ''] = t('donatePitch').split('{flag}');
  const flag = document.createElement('span');
  flag.className = 'donate-flag';
  flag.innerHTML = flagHTML('PL'); // fixed markup from our own helper, no user data
  el.replaceChildren(before, flag, after);
}
