export const siteContent = {
  nav: ["Workflow", "Features", "Docs", "GitHub"],
  headline: "PomoVault",
  subhead: "Pomodoro execution for Obsidian. Tasks, timer, and proof-of-work logs in plain markdown.",
  proofSurfaces: [
    {
      title: "PomoVault.md",
      caption: "The rendered Obsidian note: timer, current focus, queue, and controls together.",
      kind: "panel",
    },
    {
      title: "Tasks.md",
      caption: "The source stays normal Markdown, including due dates and priority metadata.",
      kind: "tasks",
      lines: [
        "# Today",
        "- [ ] Draft launch post 📅 2026-05-04 ⏫",
        "- [ ] Reply to support note 📅 2026-05-02",
        "- [x] Review release checklist ✅ 2026-05-02",
      ],
    },
    {
      title: "PomoVault Log.md",
      caption: "Completed sessions append to a minimum ledger inside the vault.",
      kind: "ledger",
      lines: [
        "## 2026-05-02",
        "- 09:00-09:25 | Work | 25m | Completed | Draft launch post",
        "- 09:25-09:30 | Short Break | 5m | Completed",
      ],
    },
  ],
  features: [
    "Self-contained Pomodoro timer",
    "Integrated markdown task manager",
    "Minimal session ledger",
    "No Dataview or Tasks dependency",
  ],
};
