---
name: "speckit-design"
description: "Create, update or freeze the feature's UI design record (design.md) from spec.md and docs/tracklite-spec.md, after /speckit-specify (and /speckit-clarify, if run) and before /speckit-plan."
argument-hint: "Optional: a Claude Design canvas link, 'freeze', answers to open questions, or areas to focus on"
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "Trinh Nguyen"
  source: "project-local (not managed by spec-kit)"
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Purpose

Constitution Principle V requires every slice that adds or changes UI to have a **Frozen** `design.md` before `/speckit-plan`. This command produces that file. It records which screens and states the slice renders, the exact copy, which shared components render each element, and the keyboard path. It also links the Claude Design canvas that shows the layout.

Authority (constitution V and Development Constraints):

- `docs/tracklite-spec.md` decides behavior, permissions and copy.
- The canvas and `design.md` decide layout only.
- The design system is Hairline (constitution V). Use its tokens and components; don't invent tokens, colors, fonts or styling.

## Running as a subagent

An orchestrator may run this command in a subagent that can't talk to the user. In that case:

- Never ask the user anything or wait for an answer. Put every question, the design brief and the next step in your final report.
- Every file path in the report is absolute.
- Text in the user input that answers an open question is an answer: record it in design.md as answered, with its source.

## Modes

Pick the mode from the user input:

- **draft** (default, no argument, or text that is only answers or focus areas): create or update `design.md` and output a design brief for Claude Design.
- **link** (the input contains a Claude Design or claude.ai artifact URL): record the canvas and map its frames to the state inventory.
- **freeze** (the input contains `freeze`): run the freeze checklist; set Status to Frozen only if every item passes.

If the input has both a canvas URL and `freeze`, run link mode first, then freeze mode.

## Outline

1. **Setup**: run `.specify/scripts/bash/check-prerequisites.sh --json --paths-only` from the repo root **once**. Parse `FEATURE_DIR` and `FEATURE_SPEC`. The target is `FEATURE_DIR/design.md`. If the feature can't be resolved, stop and report that `/speckit-specify` must run first.

2. **Check the spec hash.** Get the current spec hash with `git hash-object "$FEATURE_SPEC"`. If `design.md` exists, compare it with the "Spec hash" in its header:
   - Same hash and Status `Frozen` in draft mode: change nothing. Report Frozen and stop.
   - Different hash and Status `Frozen`: set Status to `In review`, list the rows the spec change affects, update the header hash, and continue in the requested mode.
   - Different hash and Status `Not applicable`: the spec changed, so run step 3 again.

3. **Decide whether the slice has UI.** Read `FEATURE_SPEC` only. If it adds or changes no screen, overlay, email or other user-visible text:
   - Write `design.md` with only the header (including the spec hash), Status `Not applicable`, and one line saying why.
   - Report that `/speckit-plan` can proceed.
   - Stop. Don't load the rest of the context.

4. **Load context** (read, don't skim):
   - `FEATURE_SPEC` (spec.md): requirements, acceptance scenarios, scope, the roadmap entry.
   - `ROADMAP.md`: this slice's RM entry, its "In" and "Deferred" items, and the "Rules every slice follows".
   - `docs/tracklite-spec.md`: the full text of every REQ, STD, DATA and SEC rule the entry lists, with their examples; section 3 (out of scope and known limitations), section 6 (standard behaviors), section 7 (roles and permissions), API-004 (page addresses) and NFR-007 (accessibility).
   - `.specify/memory/constitution.md` Principle V.
   - The shared UI components already in the codebase, if any.
   - An existing `design.md`, if present. Update it in place; never discard a recorded canvas link, answered question or frame mapping.

5. **Draft mode**: fill the template.
   - Resolve the template with `.specify/scripts/bash/resolve-template.sh design-template`. If the script or the template is missing, stop and report which one. Don't invent a template.
   - Fill it:
     - **Header**: feature name, branch, today's date, the RM entry, the spec hash, Status `Draft`.
     - **Screens**: every page, overlay and email this slice builds or changes. Pages use their API-004 route; overlays (dialogs, menus, pickers, toasts) name the page they open on; emails name the rule that sends them. The spec has no screen list, so derive screens from the entry's rules and flows, and add no screen the rules don't need.
     - **State inventory**: apply the template's state checklist to **every** screen. Each state gets a row with the rule or example that causes it (for example REQ-013.1 or STD-7), or an N/A entry with a reason. States from later slices are N/A with "RM-n" as the reason.
     - **Copy**: quote spec strings exactly. Strings the spec doesn't give are marked `design`; keep them plain, English only, and don't let them promise behavior.
     - **Component map**: map each element to a shared component named by role (button, text field, dialog, menu, toast, table, card).
       - Where a Hairline component fits (for example Button, TextInput), name it and mark it reuse; otherwise mark it new, built from Hairline tokens.
       - Don't name any other library. Adding one needs the owner's approval (constitution IV), so raise it as an open question if the layout seems to need one.
     - **Keyboard and focus**: tab order, initial focus, focus after every action, and keyboard alternatives (for example REQ-030 for dragging cards). Focus is always visible (NFR-007).
     - **Deferred UI**: slots later slices fill, taken from the entry's "Deferred" items (for example labels on the issue page, RM-7).
     - **Open questions**: anything spec.md or `docs/tracklite-spec.md` leaves open that the layout needs. A question whose answer would change behavior goes to the owner as a DEC candidate, never answered in design.md.
   - Output a **design brief** for Claude Design in the chat (or the report, when running as a subagent), not in the file:
     - the slice intent
     - the screen × state list with the exact copy
     - "use the Hairline Design System's tokens and components; layout only; do not add controls or states that are not listed"
     - a reminder to put the frames on the Tracklite canvas, one page per RM entry

6. **Link mode**: record the canvas.
   - Record the URL and its version in the header.
   - If the canvas can be read (for example with an artifact read tool), read it:
     - Fill the "Canvas frame" column from its frame names.
     - Flag every non-N/A inventory row without a frame, and every frame showing something not in the inventory.
     - Anything shown that isn't in the inventory is either removed from the canvas or raised as a behavior question.
   - If the canvas can't be read, say so in the report and list the rows that still need a frame name. Frame names given in the user input fill those rows.
   - Don't copy canvas markup or inline values into code or into design.md. The canvas is a visual reference only.
   - Set Status to `In review`.

7. **Freeze mode**: check the freeze checklist item by item.
   - List each failing item with what is missing.
   - If all pass, set Status to `Frozen`, fill the frozen date, record the current spec hash, and tick the checklist.
   - Never freeze with open questions or non-N/A rows without frames.

8. **Report**: the mode run, the absolute path of `design.md`, its status, the counts (screens, states, N/A states, new components, open questions), and the next step:
   - Draft: design the canvas in Claude Design from the brief, then run `/speckit-design <canvas link>`.
   - In review: resolve comments, then run `/speckit-design freeze`.
   - Frozen or Not applicable: run `/speckit-plan`.

## Rules

- Never invent REQ, STD, DATA, SEC, NFR, API, OPS, DEC or RM IDs; use the spec's and the roadmap's unchanged.
- Never add a screen, control, state or string that changes behavior. If the design needs one, stop and raise it as a DEC candidate for `docs/tracklite-spec.md`.
- Don't design anything section 3 of the spec puts out of scope (for example keyboard shortcuts, a command palette, in-app notifications, attachments, live updates) or anything planned for a later release (F-009, F-010).
- A Frozen design.md changes only through a re-freeze. If spec.md changes after freezing (the spec hash differs), set Status back to `In review` and say which rows the change affects.
- Keep design.md about layout, states, copy and components. Implementation choices (server code, data loading, libraries, styling) belong in plan.md.

## Done When

- [ ] `FEATURE_DIR/design.md` exists with a status that matches the mode's result, and its header has the current spec hash
- [ ] Every screen has had the state checklist applied, with no silent omissions
- [ ] The design brief was output (draft mode), or frames were mapped (link mode), or the checklist was reported (freeze mode)
- [ ] The next step was reported to the user, or put in the report when running as a subagent