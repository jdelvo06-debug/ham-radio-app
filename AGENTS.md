# AGENTS.md — Ham Radio Study Buddy

Guidance for agents working in the amateur radio exam study app.

## Project Mapping

- Local repo path: `/Users/jeremydelvaux/projects/ham-radio-app`
- Support URL: `https://jdelvo06-debug.github.io/ham-radio-app/support/`
- Purpose: amateur radio exam study app and App Store project.

## Operating Rules

- Keep study content accurate and exam-oriented; verify question pool/source changes before editing curriculum data.
- Verify repo path, git remote, active branch, and clean/dirty status before editing.
- Run project-appropriate tests/build/lint before reporting implementation work complete.

## Agent OS Tasking Boundary

- **Cortana Command Center Kanban is the source of truth for active Agent OS tasking.** Use it for priorities, card status, handoffs, and cross-agent coordination.
- **Bypass Hermes Kanban by default.** Do not create, move, or depend on Hermes Kanban cards unless Jeremy explicitly asks for Hermes Kanban on that task.
- **GitHub remains the source of truth for code workflow only.** Use GitHub for branches, commits, pull requests, CI, releases, and durable code review history. GitHub issues/PRs may reference Command Center Kanban cards, but they do not replace the Command Center board.
- **External task boards are opt-in only.** Do not create, move, or treat external task-board items as source-of-truth tasking unless Jeremy explicitly asks for that tool on that project.
- Before starting non-trivial work, identify the relevant Command Center Kanban card when one exists. If there is no card, proceed from Jeremy's direct instruction and avoid inventing task records unless asked.
