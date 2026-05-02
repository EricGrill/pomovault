# Contributing to PomoVault

Thank you for your interest in contributing! This document covers everything you need to get started.

---

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Workflow](#workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

---

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [npm](https://www.npmjs.com/)
- An Obsidian test vault (do **not** develop against your primary personal vault)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/ericgrill/pomovault.git
cd pomovault

# Install dependencies
npm install

# Verify everything works
npm test
npm run verify
```

### Plugin Development

To test the plugin in Obsidian:

1. Build the plugin:
   ```bash
   npm run build
   ```

2. Copy the release files to your test vault:
   ```bash
   mkdir -p /path/to/test-vault/.obsidian/plugins/pomovault
   cp main.js manifest.json styles.css /path/to/test-vault/.obsidian/plugins/pomovault/
   ```

3. Enable PomoVault in Obsidian's Community Plugins settings

4. Reload Obsidian when you make changes (`Cmd/Ctrl + P` → "Reload app without saving")

---

## Project Structure

```
pomovault/
├── src/                    # Plugin source code (TypeScript)
│   ├── main.ts            # Plugin lifecycle, pomoblock processor registration
│   ├── renderer.ts        # UI rendering — timer, task list, NOW WORKING ON
│   ├── task-parser.ts     # Markdown task parsing and formatting
│   ├── task-writer.ts     # Safe task source updates
│   ├── timer.ts           # Pomodoro timer engine
│   ├── task-modal.ts      # Add-task modal UI
│   ├── setup-modal.ts     # First-run setup modal
│   ├── settings.ts        # Plugin settings tab
│   ├── path-policy.ts     # File path conventions
│   ├── log-writer.ts      # Session log writing
│   ├── obsidian-services.ts  # Obsidian API abstraction
│   └── constants.ts       # Shared constants
├── tests/                  # Test suite (Vitest)
├── site/                   # Product website (Vite + React + Tailwind)
├── docs/                   # Additional documentation
├── main.js                 # Compiled plugin output
├── manifest.json           # Obsidian plugin manifest
└── styles.css              # Plugin styles
```

---

## Workflow

1. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** with clear, focused commits

3. **Run verification** before pushing:
   ```bash
   npm run verify
   git diff --check
   ```

4. **Open a Pull Request** with a clear description of the change and its motivation

---

## Coding Standards

### TypeScript

- Use strict TypeScript — the project has `strict: true` enabled
- Prefer explicit types over `any`
- Use `const` and `let`; avoid `var`
- Favor immutable patterns when practical

### Style

- Follow the existing code style in each file
- Use meaningful variable and function names
- Keep functions focused and single-purpose
- Add comments for non-obvious logic, not for self-evident code

### Obsidian API

- Abstract Obsidian API calls through `obsidian-services.ts` when possible — this keeps the core logic testable
- Never overwrite user data; only modify the specific lines you need to
- Respect Obsidian's file system conventions

### CSS

- Use Obsidian CSS variables for theming compatibility
- Test with at least one light and one dark community theme
- Keep selectors specific enough to avoid leaking into the rest of the UI

---

## Testing

All new functionality should include tests. We use [Vitest](https://vitest.dev/).

```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
```

### Writing Tests

- Place tests in `tests/` with the naming pattern `{module}.test.ts`
- Use the existing mocks in `tests/mocks/` as a starting point
- Test behavior, not implementation details
- Cover edge cases and error conditions

### Manual Testing

Some features require manual validation in Obsidian:

- Timer state persistence across note re-renders
- Sound playback on session completion
- Theme compatibility (test with multiple community themes)
- Mobile layout and touch interactions

---

## Submitting Changes

### Pull Request Checklist

Before opening a PR, please confirm:

- [ ] `npm run verify` passes cleanly
- [ ] Tests pass (`npm test`)
- [ ] No trailing whitespace or formatting issues (`git diff --check`)
- [ ] Changes are focused and scoped to a single concern
- [ ] Documentation is updated if user-facing behavior changes
- [ ] The change has been tested in a real Obsidian test vault

### Commit Messages

Use clear, descriptive commit messages in the present tense:

```
Add keyboard shortcut to open PomoVault.md
Fix timer reset on task list update
Update priority badge colors for accessibility
```

### Scope

We welcome contributions in these areas:

- Bug fixes
- Performance improvements
- Accessibility enhancements
- Documentation improvements
- Test coverage

If you're considering a larger feature or architectural change, please open an issue first to discuss the approach.

---

## Questions?

Feel free to open an issue for:

- Bug reports
- Feature requests
- Questions about the codebase
- Clarifications on this guide

---

Thanks for helping make PomoVault better!
