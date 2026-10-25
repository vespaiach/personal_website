---
description: Tracklite, a small, open-source, self-hosted issue tracker for one invite-only team, built on Next.js and PostgreSQL with nothing else to run.
---

# Tracklite

[Open source on GitHub](https://github.com/vespaiach/tracklite) · **Role:** Built + maintain · **Platform:** Next.js, PostgreSQL

Tracklite is a small, open-source, self-hosted issue tracker for one invite-only team. Teams can file issues, move them across a board, and talk about them in comments, without the cycles, roadmaps, and integrations they never use.

## What I did

I designed and built the whole app. Projects have a key (`WEB`), a Markdown description, and labels. Issues are numbered per project (`WEB-42`), with fixed statuses and priorities, an assignee, and up to 10 labels. It has a drag-and-drop board that works with mouse and keyboard, a list view whose search, filters, and sort live in the URL, comments with `@mentions`, a "My issues" landing page, and email notifications for assignments and mentions. Accounts are invitation-only, with member and admin roles.

I'm building it spec-first: a written spec gives every rule an ID (`REQ-047`), and each test is named after the spec example it proves, so a quick grep shows how any rule is covered.

## The problem I solved

Linear and its peers are built for many teams and priced per seat, so a team of under about 15 people pays for, and wades through, features it never needs. Tracklite keeps the core and needs only PostgreSQL: no Redis, no paid queue, and no third-party services beyond an email provider. A worker process from the same codebase sends queued notification emails straight from a Postgres table using `for update skip locked`, and cleans up expired data hourly. The browser app is a strict single-page app that goes through one JSON API, where domain functions are the only permission layer, so every read and write passes the same checks.

**Stack:** TypeScript, Next.js, React, React Router, Redux Toolkit (RTK Query), React Aria Components, Tailwind CSS, Valibot, PostgreSQL, Drizzle ORM, Resend, Vitest, Biome
