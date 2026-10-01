---
title: 'One prompt runs all of Spec Kit'
date: '2026-10-01T00:00:00.000Z'
updatedAt: '2026-10-01T00:00:00.000Z'
excerpt: "I build web applications mostly alone, with Claude Code doing most of the heavy tasks."
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/one-prompt-runs-all-of-spec-kit.md
tags: speckit, sdd, speckit-glow, claude 
---
# Running Spec Kit on autopilot, with four stops for me

I build web products mostly alone, with Claude Code doing most of the typing. Spec Kit gave me a good process for that work: write the spec, plan it, break it into tasks, build, then check the code against the spec. The weak part was me. I was the one typing ten slash commands in order, reading every output and deciding what to run next.

So I wrote an agent loop that does the typing. It runs the whole Spec Kit pipeline from one Claude Code session and stops only when it needs a human decision. It finishes when `/speckit-converge` reports that the code matches the spec.

## What Spec Kit gives you

Spec Kit is GitHub's toolkit for spec-driven development (SDD). You describe a feature, and a set of slash commands turns that description into files the agent works from:

| # | Command | Output |
|---|---|---|
| 1 | `/speckit-constitution` | project principles |
| 2 | `/speckit-specify` | `spec.md`: what to build and why |
| 3 | `/speckit-clarify` | your answers folded into `spec.md` |
| 4 | `/speckit-design` | `design.md`: screens, states, copy (my own step) |
| 5 | `/speckit-plan` | `plan.md` |
| 6 | `/speckit-checklist` | a requirements checklist |
| 7 | `/speckit-tasks` | `tasks.md` |
| 8 | `/speckit-analyze` | a read-only cross-check report |
| 9 | `/speckit-implement` | the code |
| 10 | `/speckit-converge` | "converged", or new tasks |

`/speckit-design` isn't part of Spec Kit. I added it for UI work. It's optional: features with no UI skip it, and so do projects that don't have the skill. Each command is good on its own. Running all of them by hand is slow, and late in the day it's easy to skip one.

## How it works

The loop is one prompt you paste into a Claude Code session. That session becomes the orchestrator, and it never runs a Spec Kit command itself. For each step it starts a fresh subagent with one job and gets back a report of 10 lines or fewer. The rest of the subagent's transcript is thrown away, so the orchestrator's context grows by about ten lines per step and still has room at step 10.

![Execution model: the main session dispatches a fresh subagent per step and keeps only its short report](/execution-model.png)

A run goes like this:

1. **Find the workspace.** The orchestrator works in the git worktree the session started in and never creates a new one. It records the worktree's absolute path, checks that `.specify/` is there, and looks for a paused run to resume.
2. **Run the commands in order.** Each command goes to its own subagent. Every dispatch starts with the worktree's absolute path, and every file a subagent reports comes back as an absolute path, so the links always open the right file.
3. **Stop at the gates.** There are four:
   - After clarify, I answer the open questions. The loop asks "anything else, or all good?" until I say all good.
   - After design, for UI work only. A subagent first checks `spec.md` for screens or user-visible text. If there's none, the design step is skipped and the loop moves on. Otherwise the loop writes a design brief, I build the screens in Claude Design and paste the link, and we loop until I freeze the design.
   - After checklist, I review the checklist and tick items, because implement halts later on any unchecked item.
   - Before implement, I approve the spec, design, plan and tasks. If `spec.md` changed after the design step, the design is checked again first.
4. **Ask me, never guess.** Clarify, design, checklist and implement all ask questions while they run. A subagent can't reach me, so each question comes back to the orchestrator unanswered. The orchestrator asks me with Claude Code's `AskUserQuestion` tool, one question per modal, and a follow-up subagent writes my answer into the file.
5. **Fix problems, with a limit.** Analyze gets at most 3 attempts to make spec, plan and tasks agree. Implement and converge get at most 5 cycles to close the gaps converge finds. When a limit is hit, the loop stops and shows me what it found and what it tried.
6. **Build.** Before writing code, the loop asks once: sequential or parallel? Parallel runs the core phases first, then sends each phase's `[P]` tasks to separate subagents, at most five at a time.
7. **Finish.** The run ends only when converge's own report says "converged". The loop commits the work on the feature branch and tells me the branch and the worktree path.

![Flow: ten steps with four amber gates and two bounded retry loops](/speckit-flow.png)

## Pausing and resuming

After every report and every answer from me, the loop writes `.specify/loop-state.json`: current step, status, the pending question word for word, the retry counts and the design status (frozen or skipped). I can close the laptop in the middle of a gate.

Next time I open a session in the same worktree and paste the prompt. It reads the file, checks it against the real files, and asks the pending question again. Time away never counts as approval.

## Try it

The full design, with diagrams and the complete operating prompt is speckit-converge-loop.

| File | What it is |
| --- | --- |
| [speckit-converge-loop.md](/speckit-converge-loop.md) | The operating prompt |
| [speckit-design skill](/speckit-design/SKILL.md) | Speckit design skill to collaborate with Claude Design |

To run it:

- Commit Spec Kit's `.specify/` folder and any custom skills (like `speckit-design`) on your main branch.
- Start a Claude Code session in a fresh worktree.
- Paste the operating prompt and fill in the feature description (the tech stack is optional).
- Answer the questions when it stops.

Expect to change it. My gates fit my projects, and yours may belong somewhere else. Adding a step of your own is one more subagent dispatch for the orchestrator, plus a gate if it needs you. The parts I'd keep in any version: a fresh subagent per step, hard retry limits, absolute paths in every report, and only the orchestrator asking questions.