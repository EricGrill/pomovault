# PomoVault Release Checklist

## Local Verification

- Run `npm run verify`.
- Run `git diff --check`.
- Install `main.js`, `manifest.json`, and `styles.css` into a dedicated test vault at `.obsidian/plugins/pomovault/`.
- Enable PomoVault in Obsidian Community plugins.
- Confirm `PomoVault.md` is created and opened on first run.
- Confirm a task source note can be configured.
- Confirm starting, pausing, resetting, and completing a task works.
- Confirm `PomoVault Log.md` receives work-session ledger entries.
- Confirm the site builds with `npm --prefix site run build`.

## GitHub Pages

- In repository Settings -> Pages, set Source to GitHub Actions.
- Set the custom domain to `pomovault.com`.
- Configure apex DNS records for GitHub Pages.
- Configure `www` as a CNAME to the GitHub Pages default domain if desired.
- Enforce HTTPS after certificate provisioning succeeds.

## Obsidian Community Plugin Release

- Ensure `manifest.json` version matches the Git tag.
- Create a GitHub release whose tag matches `manifest.json`.
- Attach `main.js`, `manifest.json`, and `styles.css`.
- Submit to `obsidianmd/obsidian-releases` with id `pomovault`, name `PomoVault`, author `Eric Grill`, and the repository path.

## External Actions Not Performed Locally

- DNS changes for `pomovault.com`.
- Live GitHub Pages environment configuration.
- GitHub release publishing.
- Obsidian community plugin registry submission.
