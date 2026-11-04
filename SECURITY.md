# Security policy

## Supported versions

Only the latest version on the `main` branch (the one deployed to the website) receives security fixes.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report it privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability** (GitHub private vulnerability reporting). Include:

- what an attacker can do and under which conditions,
- steps or a file to reproduce it (for example a crafted backup JSON),
- the browser and device you used.

You should get a first answer within 7 days. Once a fix is released, you will be credited in the changelog unless you prefer otherwise.

## Scope

Travel Year is a static site with no server-side code and no accounts. Relevant reports include, for example:

- script injection through stored data, an imported backup file or a crafted link,
- ways around the Content Security Policy in `index.html`,
- the service worker serving content it should not,
- anything that makes the site send user data somewhere.

Out of scope: problems that require a compromised device or browser extension, and missing security headers that depend on the hosting configuration (please mention them anyway).
