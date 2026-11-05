/**
 * Footer links whose addresses live in src/config.js: the contact e-mail and the donation page.
 *
 * The e-mail address is filled in from JS rather than written in index.html, so simple
 * harvesting bots that read the HTML without running scripts do not find it.
 */

import { CONTACT_EMAIL, DONATE_URL } from '../config.js';
import { byId } from '../utils/html.js';

export function initFooter() {
  const contact = byId('contactLink');
  contact.href = `mailto:${CONTACT_EMAIL}`;
  contact.textContent = CONTACT_EMAIL;
  byId('donateLink').href = DONATE_URL;
}
