---
title: 'Before You Add a Rule to CLAUDE.md, Ask What Will Go Wrong'
date: 2026-11-06T00:00:00.000Z
updatedAt: 2026-11-06T00:00:00.000Z
excerpt: I added three code rules to CLAUDE.md to get cleaner code. They caused more trouble than they saved. The fix was one question I should have asked first.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/claude-md-rules-backfire.md
tags: claude, claude-context
---

> *This post was written with AI assistance.*

I recently added three rules to my `CLAUDE.md`, hoping Claude would write better code, but they gave me more trouble than help.

## The rules

1. **No dead or unused code.** Delete unused exports, files, branches and parameters, and don't add code for later.
2. **No comments in code under `src/`.** That includes line comments, block comments and JSDoc. Say what the code means through names, types and test titles; spec IDs belong in test names, not comments.
3. **TDD.** Never write code without a failing test first.

They read well, and I did not test what Claude actually understood by them.

## What happened

| Rule | What I meant | What Claude did |
| --- | --- | --- |
| No dead code | Remove leftovers | Deleted everything not currently used: structural abstractions, prebuilt UI components, full API signature exports, default handlers that exist for architectural completeness |
| No comments | Remove noise | Removed every comment, including linter directives and the ones that explain architecture |
| Failing test first | Test-drive the logic | On CSS, docs and refactors, wrote pointless tests or got stuck |

The pattern is the same each time. Claude follows the rule literally, and a literal reading has no room for the exceptions I had in my head. "Unused" is not the same as "not needed". "No comments" does not mean `// eslint-disable-next-line` should go. "Test first" makes little sense for a CSS tweak or a rename.

## The fix: ask what will go wrong

Asking Claude before the rule goes in:

```
I'm about to add this rule to CLAUDE.md:

"<the rule>"

What will go wrong with it? Where will it be misread, over-applied, or conflict with something else?
```

Claude is good at this. It lists the exact failures and help me to rewrite the rule. For example:

1. **No dead code.** Delete unused code you find. Keep exports, default handlers and abstractions that the architecture requires, even if nothing calls them yet.
2. **No explanatory comments under `src/`.** Use names, types and test titles instead. Keep linter directives and comments that record a constraint the code cannot express.
3. **TDD for behavior.** Write a failing test first for logic changes. Skip it for CSS, docs and pure refactors that existing tests already cover.

## Why negative feedback works better

This is my guess: asking "is this a good rule?" invites Claude to agree. Asking "what will go wrong?" pushes Claude to look for the ways the rule breaks and to suggest better alternatives.

## Takeaway

A rule in `CLAUDE.md` is code for the model. Treat it like code: before it ships, try to break/test it. Ask Claude what will go wrong, fix the rule, then add it.
