# Obsidian Community Plugin registry — PomoVault submission

This document prepares a **human-submitted** pull request to [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases) (`community-plugins.json`). Do not open that PR from automation unless it is truly trivial; use the checklist below and open the PR manually in GitHub.

## Official references (read before submitting)

- [Submit your plugin](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin) — release assets, registry JSON shape, PR flow (Preview → Community Plugin template).
- [Submission requirements for plugins](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins) — `minAppVersion`, description rules, `fundingUrl`, `isDesktopOnly`, sample code, command IDs.
- [Plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines) — API/UI/security conventions reviewers expect.
- [Developer policies](https://docs.obsidian.md/Developer%2Bpolicies) — directory eligibility (telemetry, ads, licensing, disclosures in README, etc.).
- [Manifest reference](https://docs.obsidian.md/Reference/Manifest) — required and optional `manifest.json` fields (there is **no** `repo` field in the manifest; `repo` is only in `community-plugins.json`).

## Prerequisites

### Repository root (source review)

- [ ] `README.md` — purpose and usage (disclose network, external files, accounts, or payments per [Developer policies](https://docs.obsidian.md/Developer%2Bpolicies) if applicable).
- [ ] `LICENSE` — license file present and accurate.
- [ ] `manifest.json` — matches [Manifest](https://docs.obsidian.md/Reference/Manifest); `description` ≤ 250 characters, ends with `.`, no emoji (per [submission requirements](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins)).
- [ ] `versions.json` — at repo root; each released plugin version maps to the **minimum Obsidian app version** for that release. Obsidian uses this when the app is older than `manifest.json`’s `minAppVersion` (see [obsidian-releases README](https://github.com/obsidianmd/obsidian-releases)). Keep entries aligned whenever you cut a release.

### GitHub release (installable artifacts)

- [ ] **Tag = version string** — Create a Git [release](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository#creating-a-release) whose tag is exactly `manifest.json` → `version` (format `x.y.z` only).
- [ ] **Release attachments** — Upload as **binary** assets on that release:
  - `main.js`
  - `manifest.json`
  - `styles.css` (include if the plugin ships styles; Obsidian will download it when present)

PomoVault’s release workflow (tag push) builds artifacts and attaches them to the release; still verify the tag matches `manifest.json` and all three files appear on the release.

### Registry entry (your PR to obsidian-releases)

- [ ] Confirm `id` is unique in [community-plugins.json](https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json) and does not contain the substring `obsidian`.
- [ ] `id`, `name`, `author`, and `description` in the registry entry **match** the same fields in `manifest.json`.

## JSON to add (append to `community-plugins.json`)

Add a comma after the previous entry’s `}`, then append:

```json
{
  "id": "pomovault",
  "name": "PomoVault",
  "author": "Eric Grill",
  "description": "Pomodoro execution for Obsidian. Tasks, timer, and proof-of-work logs in plain markdown.",
  "repo": "EricGrill/pomovault"
}
```

Repository URL: [https://github.com/EricGrill/pomovault](https://github.com/EricGrill/pomovault) — the `repo` value is always `owner/repo` (no `https://`).

If you rename or transfer the GitHub repo, update `repo` in a follow-up PR to obsidian-releases.

## Suggested PR title

```text
Add plugin: PomoVault
```

## Template PR description

Obsidian’s flow uses the **Community Plugin** PR template in obsidian-releases. After opening the PR, switch to **Preview**, choose **Community Plugin**, and check the boxes that apply. Use this as your starting body (adjust links/checkboxes to match reality):

```markdown
## Plugin submission

**Plugin id:** pomovault  
**Plugin name:** PomoVault  
**Author:** Eric Grill  
**Repository:** https://github.com/EricGrill/pomovault  

**Release:** GitHub release tag matches `manifest.json` version; assets attached: `main.js`, `manifest.json`, `styles.css`.

**Manifest:** `id`, `name`, `author`, `description` match this PR’s JSON entry.

**Policies:** README and LICENSE reviewed against [Developer policies](https://docs.obsidian.md/Developer%2Bpolicies) and [Submission requirements for plugins](https://docs.obsidian.md/Plugins/Releasing/Submission+requirements+for+plugins).

---

_(Complete the checklist items from the Community Plugin template in the PR UI — insert `x` in `[ ]` as appropriate.)_
```

## After opening the PR

- Watch for **Validation failed** vs **Ready for review** on the PR.
- If GitHub shows a merge conflict on `community-plugins.json`, the [official guidance](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin) is to leave it for the Obsidian team to resolve after approval.
- For reviewer feedback, update your plugin/release and **comment on the same PR**; do not open a duplicate PR.

## PomoVault `manifest.json` (submission readiness)

Per the current [Manifest](https://docs.obsidian.md/Reference/Manifest) documentation, required plugin fields are: `id`, `name`, `version`, `minAppVersion`, `description`, `author`, `isDesktopOnly`. Optional: `authorUrl`, `fundingUrl`. **Do not add `repo` to `manifest.json`** — it is not part of the manifest schema; it belongs only in `community-plugins.json`.

The repo root manifest is already complete for submission; no manifest change is required solely for registry listing.
