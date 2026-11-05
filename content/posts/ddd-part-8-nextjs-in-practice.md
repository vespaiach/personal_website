---
title: 'Domain-Driven Design, Part 8: DDD in a Real Next.js Project'
date: 2026-11-05T07:00:00.000Z
updatedAt: 2026-11-05T07:00:00.000Z
excerpt: The same issue tracker on a real stack — Next.js App Router, Drizzle, PostgreSQL and Valibot — from the schema through the domain layer to the server action and the form, with the serverless caveats that actually bite.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/ddd-part-8-nextjs-in-practice.md
tags: ddd
---

> *This post was generated with AI assistance.*

**The series**

1. [Strategic DDD](https://vespaiach.com/posts/ddd-part-1-strategic-design.html) — subdomains, bounded contexts, ubiquitous language, the context map
2. [The building blocks](https://vespaiach.com/posts/ddd-part-2-entities-value-objects-aggregates.html) — entities, value objects, aggregates and aggregate roots
3. [Services, events, repositories](https://vespaiach.com/posts/ddd-part-3-services-events-repositories.html) — logic that spans objects, and keeping storage out of the domain
4. [The layered architecture](https://vespaiach.com/posts/ddd-part-4-the-layered-architecture.html) — the four layers, the dependency rule, and use cases
5. [A walkthrough](https://vespaiach.com/posts/ddd-part-5-a-walkthrough.html) — one feature built end to end through every layer
6. [Common pitfalls](https://vespaiach.com/posts/ddd-part-6-common-pitfalls.html) — the modeling mistakes and the runtime traps
7. [Frequently asked questions](https://vespaiach.com/posts/ddd-part-7-faq.html) — the concepts people get tangled, and the two that quietly lose data
8. **DDD in a real Next.js project** — the same issue tracker, from Postgres to the form ← *you are here*

Seven parts of theory. This one is a real stack: **Next.js (App Router), Drizzle, PostgreSQL, Valibot**. Same issue tracker, one feature, every file you would actually write.

## The one idea, restated

Your business rules live in plain TypeScript files that know nothing about Next.js and nothing about your database.

That is the whole thing. The folder layout, the mappers, the repository interfaces — all of it exists to protect that one sentence.

Why it matters in a Next.js app specifically: a rule written inside a server action only works for callers who arrive through that form. Six months later the same issue gets assigned from a bulk-edit screen, a CSV import and an API route, and one of those three forgets the rule. Write it once, somewhere all four can reach.

## Why Drizzle

Worth being straight about this, because Drizzle gives you *less* help with DDD than a heavier ORM does, and that is partly the point.

Drizzle is a typed query builder. It does not track your objects, does not diff them, and does not save them for you. There is no unit of work and no identity map. What you get back from a query is a plain row.

So three pieces of plumbing from earlier parts of this series stay hand-written: a mapper between rows and entities, the version check for optimistic locking, and an explicit transaction around the aggregate and its outbox row. A full Data Mapper ORM would generate all three.

What you get in exchange is worth having in a Next.js app specifically:

| | Why it matters here |
| --- | --- |
| **Stateless client** | No per-request context to fork, no cache to leak between requests. A module-level singleton is correct. Stateful ORMs need careful per-request setup on serverless, and getting it wrong only shows up under concurrent load. |
| **The read side is native** | Part 6's rule is "writes through aggregates, reads straight to SQL." That is just how Drizzle works — no escape hatch needed, no managed entities to avoid. |
| **Nothing hidden** | The SQL is the code. No lazy loading firing a query inside a render, no surprise N+1 from a relation you touched. |
| **Small bundle** | Matters when the query layer ships inside server components on every route. |

The trade: you write perhaps sixty lines of glue per aggregate that an ORM would have handled. For one or two rule-heavy aggregates — which is the realistic case, per the end of this post — that is a fine price for a client that cannot surprise you.

## The folder map

```
src/
├── app/                          ← Next.js: pages, actions, route handlers
│   ├── projects/[id]/
│   │   ├── page.tsx                  server component — reads directly
│   │   ├── actions.ts                server actions — thin adapters
│   │   └── assign-form.tsx           client component
│   └── api/cron/outbox/route.ts      drains the outbox
│
├── domain/                       ← plain TypeScript. No next/*. No Drizzle.
│   └── issue/
│       ├── issue.ts                  entity + its rules
│       ├── issue-status.ts           value object
│       └── issue-repository.ts       interface only
│
├── application/                  ← one file per user action
│   └── assign-issue.ts
│
├── infrastructure/               ← everything that touches the world
│   ├── db/schema.ts                  Drizzle table definitions
│   ├── db/index.ts                   the client
│   ├── issue-mapper.ts               row ↔ entity
│   └── issue-repository.ts           implements the interface
│
└── queries/                      ← read-only SQL for screens. No domain objects.
    └── board.ts
```

One check tells you whether it is still holding:

```bash
rg "from 'next|drizzle-orm" src/domain/
```

If that prints anything, something is in the wrong folder.

The four folders outside `app/` are the four layers from Part 4. `app/` is the presentation layer — all of it, including the parts that run on the server.

## The database

Start here, because it is the part that cannot change easily later.

```ts
// src/infrastructure/db/schema.ts
import {
  pgTable, text, integer, timestamp, jsonb, index, uniqueIndex,
} from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id:        text('id').primaryKey(),
  key:       text('key').notNull().unique(),      // "AP"
  name:      text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const members = pgTable('members', {
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId:    text('user_id').notNull(),
  role:      text('role').notNull(),              // owner | admin | member
  joinedAt:  timestamp('joined_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('members_pk').on(t.projectId, t.userId),
])

export const issues = pgTable('issues', {
  id:         text('id').primaryKey(),
  projectId:  text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  number:     integer('number').notNull(),        // the 42 in AP-42
  title:      text('title').notNull(),
  status:     text('status').notNull().default('todo'),
  rank:       text('rank').notNull(),
  assigneeId: text('assignee_id'),
  version:    integer('version').notNull().default(0),   // Part 6's lost-update fix
  updatedAt:  timestamp('updated_at').defaultNow().notNull(),
}, (t) => [
  uniqueIndex('issues_project_number').on(t.projectId, t.number),
  index('issues_project_rank').on(t.projectId, t.rank),
])

export const outboxEvents = pgTable('outbox_events', {
  id:          text('id').primaryKey(),
  type:        text('type').notNull(),
  payload:     jsonb('payload').notNull(),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
}, (t) => [
  index('outbox_unpublished').on(t.publishedAt, t.createdAt),
])
```

Three things here are deliberate:

- **`version`** makes the lost-update fix from Part 6 possible. Add it now; retrofitting it means a migration plus auditing every write.
- **`uniqueIndex('issues_project_number')`** puts the "issue numbers are unique per project" rule in the database, where a race condition cannot get past it. Domain rules are for rules the database cannot express; this one it can.
- **`outboxEvents`** is the durable side-effect queue. More on it at the end.

### Why the inferred types are not your model

Drizzle will hand you a row type for free:

```ts
type IssueRow = typeof issues.$inferSelect
// { id: string; title: string; status: string; assigneeId: string | null; ... }
```

That type is a shape, not an object. No methods, no constructor you control, and `status` is a bare `string` — so `row.status = 'compelted'` compiles.

Using it as your domain model is the fastest route to the anemic model from Part 6. So you write your own `Issue` class and map between them. That mapping is the main cost of doing this with a query builder, which is exactly why it is a decision rather than a default: map the models with real rules, use the inferred row type directly for the ones without. In this tracker I would map `Issue` and `Project`, and not bother for a tag or a label.

## The domain

Plain TypeScript. Open these files and there is no hint of what framework or database the project uses.

### The value object

```ts
// src/domain/issue/issue-status.ts
export class DomainError extends Error {}

export class IssueStatus {
  private constructor(readonly value: string) {}

  static readonly TODO        = new IssueStatus('todo')
  static readonly IN_PROGRESS = new IssueStatus('in_progress')
  static readonly IN_REVIEW   = new IssueStatus('in_review')
  static readonly DONE        = new IssueStatus('done')
  static readonly CANCELLED   = new IssueStatus('cancelled')

  private static readonly ALL = [
    IssueStatus.TODO, IssueStatus.IN_PROGRESS, IssueStatus.IN_REVIEW,
    IssueStatus.DONE, IssueStatus.CANCELLED,
  ]

  /** The only way in from a database row or a form. */
  static from(value: string): IssueStatus {
    const found = IssueStatus.ALL.find(s => s.value === value)
    if (!found) throw new DomainError(`Invalid status: ${value}`)
    return found
  }

  isClosed(): boolean {
    return this === IssueStatus.DONE || this === IssueStatus.CANCELLED
  }

  canTransitionTo(next: IssueStatus): boolean {
    const allowed: Record<string, string[]> = {
      todo:        ['in_progress', 'cancelled'],
      in_progress: ['in_review', 'todo', 'cancelled'],
      in_review:   ['done', 'in_progress'],
      done:        [],
      cancelled:   [],
    }
    return allowed[this.value].includes(next.value)
  }
}
```

The private constructor is doing the work. Outside this file there are exactly two ways to get an `IssueStatus`: one of the five constants, or `from()` with a value that passes. There is no third way, so an invalid status cannot exist anywhere in the app.

### The entity

```ts
// src/domain/issue/issue.ts
import { IssueStatus, DomainError } from './issue-status'

export interface DomainEvent {
  type: string
  payload: Record<string, unknown>
}

interface IssueProps {
  id: string
  projectId: string
  number: number
  title: string
  status: IssueStatus
  rank: string
  assigneeId: string | null
  version: number
}

export class Issue {
  private readonly pendingEvents: DomainEvent[] = []

  private constructor(private props: IssueProps) {}

  /** New issue — the rules run. */
  static create(input: Omit<IssueProps, 'status' | 'version'>): Issue {
    if (input.title.trim().length === 0) {
      throw new DomainError('Issue title cannot be empty')
    }
    return new Issue({
      ...input,
      title: input.title.trim(),
      status: IssueStatus.TODO,
      version: 0,
    })
  }

  /** Loading a stored row — the rules do NOT re-run. (Part 6) */
  static rehydrate(props: IssueProps): Issue {
    return new Issue(props)
  }

  assignTo(assigneeId: string): void {
    if (this.props.status.isClosed()) {
      throw new DomainError('Cannot assign a closed issue')
    }
    if (this.props.assigneeId === assigneeId) return   // no change, no event
    this.props.assigneeId = assigneeId
    this.pendingEvents.push({
      type: 'issue.assigned',
      payload: { issueId: this.props.id, assigneeId },
    })
  }

  transitionTo(next: IssueStatus): void {
    if (!this.props.status.canTransitionTo(next)) {
      throw new DomainError(
        `Cannot move an issue from ${this.props.status.value} to ${next.value}`,
      )
    }
    this.props.status = next
  }

  pullEvents(): DomainEvent[] { return this.pendingEvents.splice(0) }
  snapshot(): Readonly<IssueProps> { return this.props }
}
```

The two constructors matter more than they look. `create()` applies today's rules; `rehydrate()` trusts the row. Without the split, adding "titles must be under 80 characters" next year makes every older issue with a long title unloadable.

That split is yours to maintain here. An ORM that instantiates entities without calling your constructor gets it for free; a query builder does not, so `rehydrate()` is a real method you have to remember to use.

### The test

This is the payoff, and it is worth seeing how little it needs:

```ts
// src/domain/issue/issue.test.ts
import { expect, test } from 'vitest'
import { Issue } from './issue'
import { IssueStatus } from './issue-status'

test('a closed issue cannot be assigned', () => {
  const issue = Issue.create({
    id: '1', projectId: 'p1', number: 42,
    title: 'Fix OAuth', rank: 'a0', assigneeId: null,
  })
  issue.transitionTo(IssueStatus.IN_PROGRESS)
  issue.transitionTo(IssueStatus.IN_REVIEW)
  issue.transitionTo(IssueStatus.DONE)

  expect(() => issue.assignTo('bob')).toThrow('Cannot assign a closed issue')
})
```

No database, no test container, no mocks, no Next.js, no Drizzle. Runs in about a millisecond. That is the dependency rule from Part 4 paying for itself — and the reason worth caring about it even if you never change your database.

## The client

Short, and pleasantly boring:

```ts
// src/infrastructure/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { pool?: Pool }

const pool = globalForDb.pool ??= new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,                      // keep small: every warm instance holds its own pool
})

export const db = drizzle(pool, { schema })
```

The `globalThis` cache is the standard Next.js trick, and it is here for the usual reason: one connection pool per process, not a new one on every hot reload.

What is *not* here is the interesting part. There is no per-request context to create, no cache to clear, no fork. `db` is stateless, so a module-level singleton is simply correct, and the same object is safe in a server component, a server action and a cron route.

The one genuine serverless concern is pooling. Every warm function instance holds its own pool, so fifty concurrent instances means fifty pools. Put PgBouncer or your provider's pooler in front and keep `max` small. On Neon, the HTTP driver (`drizzle-orm/neon-http`) sidesteps pooling entirely for single-shot queries, at the cost of no interactive transactions — which this post needs, so the pooled driver it is.

## The repository

The interface lives in the domain, because the domain decides what it needs:

```ts
// src/domain/issue/issue-repository.ts
import type { Issue } from './issue'

export interface IssueRepository {
  findById(id: string): Promise<Issue | null>
  save(issue: Issue): Promise<void>
}
```

That file imports nothing. No Drizzle — that is the whole point.

### The mapper

```ts
// src/infrastructure/issue-mapper.ts
import type { issues } from './db/schema'
import { Issue } from '@/domain/issue/issue'
import { IssueStatus } from '@/domain/issue/issue-status'

type IssueRow = typeof issues.$inferSelect

export const IssueMapper = {
  toDomain(row: IssueRow): Issue {
    return Issue.rehydrate({
      id: row.id,
      projectId: row.projectId,
      number: row.number,
      title: row.title,
      status: IssueStatus.from(row.status),   // validated on the way in
      rank: row.rank,
      assigneeId: row.assigneeId,
      version: row.version,
    })
  },
}
```

`IssueStatus.from()` is the boundary check. If somebody writes a bad status straight into Postgres, you find out at load time with a clear error, not three screens later.

### The implementation

```ts
// src/infrastructure/issue-repository.ts
import { and, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { db } from './db'
import { issues, outboxEvents } from './db/schema'
import { IssueMapper } from './issue-mapper'
import type { IssueRepository } from '@/domain/issue/issue-repository'
import type { Issue } from '@/domain/issue/issue'

export class ConcurrencyError extends Error {}

export class DrizzleIssueRepository implements IssueRepository {
  async findById(id: string): Promise<Issue | null> {
    const [row] = await db.select().from(issues).where(eq(issues.id, id)).limit(1)
    return row ? IssueMapper.toDomain(row) : null
  }

  async save(issue: Issue): Promise<void> {
    const s = issue.snapshot()
    const events = issue.pullEvents()

    await db.transaction(async (tx) => {
      // the version in the WHERE clause is the optimistic lock
      const updated = await tx.update(issues)
        .set({
          title: s.title,
          status: s.status.value,
          rank: s.rank,
          assigneeId: s.assigneeId,
          version: s.version + 1,
          updatedAt: new Date(),
        })
        .where(and(eq(issues.id, s.id), eq(issues.version, s.version)))
        .returning({ id: issues.id })

      if (updated.length === 0) {
        throw new ConcurrencyError('This issue was changed by someone else')
      }

      // the event and the data commit together — or not at all
      if (events.length > 0) {
        await tx.insert(outboxEvents).values(
          events.map(e => ({ id: randomUUID(), type: e.type, payload: e.payload })),
        )
      }
    })
  }
}
```

Three things in that method are the hand-written versions of what a heavier ORM would do for you, and all three come straight from Part 6.

**`version` in the `WHERE` clause.** The update only matches if nobody else has saved since you loaded. `.returning()` gives you the rows actually written, so an empty array means somebody got there first. Two admins assigning the same issue at once now produces a clear error for the second one instead of a silent overwrite.

**The explicit transaction.** The issue row and the outbox rows commit together. That is the outbox guarantee from Part 6, and with a query builder it is something you write rather than something you get.

**`pullEvents()` before the transaction.** Events come off the entity once, so a retry of the transaction body cannot double-insert them.

## The use case

Load, authorize, check what spans aggregates, change, save. No framework, no HTTP, no SQL:

```ts
// src/application/assign-issue.ts
import type { IssueRepository } from '@/domain/issue/issue-repository'
import type { ProjectRepository } from '@/domain/project/project-repository'
import { DomainError } from '@/domain/issue/issue-status'

export class NotFoundError extends Error {}
export class ForbiddenError extends Error {}

export interface AssignIssueInput {
  issueId: string
  assigneeId: string
  actorId: string
}

export class AssignIssue {
  constructor(
    private readonly issues: IssueRepository,
    private readonly projects: ProjectRepository,
  ) {}

  async execute(input: AssignIssueInput): Promise<void> {
    const issue = await this.issues.findById(input.issueId)
    if (!issue) throw new NotFoundError('Issue not found')

    const project = await this.projects.findById(issue.snapshot().projectId)
    if (!project) throw new NotFoundError('Project not found')

    // permission — needs the project and the actor together
    const actor = project.memberOf(input.actorId)
    if (!actor) throw new ForbiddenError('Not a project member')
    if (!actor.role.canManageIssues()) {
      throw new ForbiddenError('Only admins and owners can assign issues')
    }

    // spans two aggregates, so it can only live here (Part 5)
    if (!project.memberOf(input.assigneeId)) {
      throw new DomainError('Cannot assign an issue to a non-member')
    }

    issue.assignTo(input.assigneeId)   // the rule lives in here
    await this.issues.save(issue)
  }
}
```

One consequence worth naming, from the FAQ in Part 7: each repository runs its own transaction, so a use case that saved *two* aggregates would not be atomic. This one only writes the issue, so it does not matter. When it does matter, pass a transaction handle into both repositories and let the use case own the boundary.

## Validation with Valibot

Valibot and value objects both validate, and people assume they are competing. They are not — they check different things at different moments.

|  | Valibot | Value object |
| --- | --- | --- |
| Checks | Shape of untrusted input | Domain rules |
| Asks | "Is this a non-empty string?" | "Is this a legal status?" |
| On failure | Returns field errors for the form | Throws — reaching it with bad data is a bug |
| Lives in | `app/` (the boundary) | `domain/` |

```ts
// src/app/projects/[id]/schema.ts
import * as v from 'valibot'

export const AssignIssueSchema = v.object({
  issueId:    v.pipe(v.string(), v.nonEmpty('Pick an issue')),
  assigneeId: v.pipe(v.string(), v.nonEmpty('Pick someone to assign')),
})
```

Valibot's tree-shaking is the reason to prefer it here: you import `object`, `string`, `pipe` and `nonEmpty`, and nothing else ships. In a form-heavy app bundled by Next.js that difference is measurable.

## The server action

The adapter. Three jobs — session, parse, translate errors — and then it gets out of the way:

```ts
// src/app/projects/[id]/actions.ts
'use server'

import * as v from 'valibot'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { AssignIssueSchema } from './schema'
import { assignIssue } from '@/infrastructure/container'
import { NotFoundError, ForbiddenError } from '@/application/assign-issue'
import { DomainError } from '@/domain/issue/issue-status'
import { ConcurrencyError } from '@/infrastructure/issue-repository'

export interface FormState {
  errors?: Record<string, string[]>
  message?: string
  ok?: boolean
}

export async function assignIssueAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await auth()
  if (!session?.user) return { message: 'Please sign in' }

  const result = v.safeParse(AssignIssueSchema, Object.fromEntries(formData))
  if (!result.success) {
    // flatten puts per-field messages under `.nested`
    return { errors: v.flatten(result.issues).nested }
  }

  try {
    await assignIssue.execute({
      ...result.output,
      actorId: session.user.id,
    })
  } catch (err) {
    if (err instanceof NotFoundError)    return { message: err.message }
    if (err instanceof ForbiddenError)   return { message: err.message }
    if (err instanceof DomainError)      return { message: err.message }
    if (err instanceof ConcurrencyError) {
      return { message: 'Someone else changed this issue — reload and try again' }
    }
    throw err   // a real bug: let it hit the error boundary
  }

  revalidatePath(`/projects/${result.output.issueId}`)
  return { ok: true }
}
```

The `v.flatten(result.issues).nested` detail catches people out — `flatten` returns `{ root, nested }`, and the per-field messages are under `nested`, not at the top level.

Notice what is *not* in this file: no business rule, no SQL, no decision about who may assign. And notice what is: `revalidatePath`, session reading, and the error-to-message translation. Those are framework concerns and they belong exactly here.

The last `throw` is deliberate. Known failures become messages; anything else is a bug and should reach your error boundary and your logs rather than being swallowed into a friendly string.

### Wiring

```ts
// src/infrastructure/container.ts
import { AssignIssue } from '@/application/assign-issue'
import { DrizzleIssueRepository } from './issue-repository'
import { DrizzleProjectRepository } from './project-repository'

export const assignIssue = new AssignIssue(
  new DrizzleIssueRepository(),
  new DrizzleProjectRepository(),
)
```

Module-level constants, because the client underneath them is stateless. One file that knows about every layer. No DI container needed at this size.

## The frontend

Here is where Next.js and Drizzle fit together better than people expect.

### Reading: skip the domain entirely

A board screen shows 200 issues. Building 200 `Issue` objects to render them would be slow and pointless — rendering changes nothing, so there is no rule to protect.

```ts
// src/queries/board.ts
import { eq } from 'drizzle-orm'
import { db } from '@/infrastructure/db'
import { issues, users } from '@/infrastructure/db/schema'

export async function getBoard(projectId: string) {
  return db
    .select({
      id:           issues.id,
      number:       issues.number,
      title:        issues.title,
      status:       issues.status,
      assigneeName: users.name,
    })
    .from(issues)
    .leftJoin(users, eq(users.id, issues.assigneeId))
    .where(eq(issues.projectId, projectId))
    .orderBy(issues.rank)
}
```

```tsx
// src/app/projects/[id]/page.tsx
import { getBoard } from '@/queries/board'
import { AssignForm } from './assign-form'

export default async function BoardPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const issues = await getBoard(id)

  return (
    <ul>
      {issues.map(issue => (
        <li key={issue.id}>
          <span>{issue.number} · {issue.title}</span>
          <span>{issue.assigneeName ?? 'Unassigned'}</span>
          <AssignForm issueId={issue.id} />
        </li>
      ))}
    </ul>
  )
}
```

**The rule: writes go through aggregates, reads go straight to SQL.** This is the CQRS idea from Part 6, and the pairing is unusually clean here — Next.js server components were built to query directly, and a query builder has nothing to escape from. The return type of `getBoard` is inferred from the columns you selected, so the component gets exactly the five fields and no more.

Keep these in `src/queries/`, not in `infrastructure/repositories/`. They are not repositories, and calling them that invites somebody to add a `save` method to one.

### Writing: the client form

```tsx
// src/app/projects/[id]/assign-form.tsx
'use client'

import { useActionState } from 'react'
import { assignIssueAction, type FormState } from './actions'

const initial: FormState = {}

export function AssignForm({ issueId }: { issueId: string }) {
  const [state, formAction, pending] = useActionState(assignIssueAction, initial)

  return (
    <form action={formAction}>
      <input type="hidden" name="issueId" value={issueId} />
      <input name="assigneeId" placeholder="User ID" />

      {state.errors?.assigneeId && (
        <p role="alert">{state.errors.assigneeId[0]}</p>
      )}
      {state.message && <p role="alert">{state.message}</p>}

      <button disabled={pending}>
        {pending ? 'Assigning…' : 'Assign'}
      </button>
    </form>
  )
}
```

The client component knows nothing about the domain. It sends a form, gets back either `errors` (per-field, from Valibot) or `message` (one line, from a domain rule), and renders whichever arrived.

That split is worth keeping deliberately. Field errors attach to inputs; rule violations are about the whole action — "cannot assign a closed issue" belongs to no single field. Two shapes, two places in the UI.

### The whole path

```
assign-form.tsx       client    form submit
       ↓
actions.ts            app/      session · Valibot · error → message
       ↓
assign-issue.ts       app layer load, permission, cross-aggregate rule
       ↓
issue.ts              domain    "cannot assign a closed issue"
       ↓
issue-repository.ts   infra     transaction, version check, outbox row
       ↓
Postgres
```

Six files for one button. That is the honest cost. What you get is a rule that cannot be bypassed by the next caller, and a test for it that runs without a database.

## Side effects, and why serverless changes them

This is the one place where deploying to Vercel genuinely changes the design, and it is worth being blunt about.

There is no long-lived process. An in-memory event bus — a `Map` of handlers, the kind every DDD tutorial shows — works perfectly in `next dev` and silently drops events in production, because the function freezes once the response is sent.

Next.js gives you [`after()`](https://nextjs.org/docs/app/api-reference/functions/after), stable since 15.1, which defers work until after the response:

```ts
import { after } from 'next/server'

after(async () => {
  await trackAnalytics(event)
})
```

Read the documentation carefully, though: the callback runs within the route's configured maximum duration, and it needs the platform to support `waitUntil`. It is deferred work, not a background job queue, and no completion guarantee is documented. Good for analytics and logging. Wrong for anything that must happen.

For anything that must happen, the outbox row written inside the transaction earlier is the durable option, and a cron route handler drains it:

```ts
// src/app/api/cron/outbox/route.ts
import { asc, eq, isNull } from 'drizzle-orm'
import { db } from '@/infrastructure/db'
import { outboxEvents } from '@/infrastructure/db/schema'
import { sendAssignmentEmail } from '@/infrastructure/mailer'

export async function GET(request: Request) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const pending = await db.select()
    .from(outboxEvents)
    .where(isNull(outboxEvents.publishedAt))
    .orderBy(asc(outboxEvents.createdAt))
    .limit(50)

  for (const event of pending) {
    try {
      if (event.type === 'issue.assigned') await sendAssignmentEmail(event.payload)
      await db.update(outboxEvents)
        .set({ publishedAt: new Date() })
        .where(eq(outboxEvents.id, event.id))
    } catch (err) {
      console.error('Outbox handler failed', { eventId: event.id, err })
      // leave publishedAt null — it retries next run
    }
  }

  return Response.json({ processed: pending.length })
}
```

```json
// vercel.json
{ "crons": [{ "path": "/api/cron/outbox", "schedule": "*/5 * * * *" }] }
```

This is a poor man's worker and it is honest about that. It also inherits the caveat from Part 6: a crash between sending the email and the update gives you a duplicate, so handlers must tolerate running twice.

| Side effect | Use |
| --- | --- |
| Analytics, logging | `after()` |
| Cache invalidation | `revalidatePath` / `revalidateTag`, in the action |
| Email, webhooks | Outbox + cron |
| Billing, anything auditable | Outbox, always |

## What this costs, honestly

Per aggregate that gets the full treatment:

| Piece | Lines | Could an ORM do it for you? |
| --- | --- | --- |
| Mapper | ~15 | Yes — a Data Mapper ORM maps your class directly |
| `create()` / `rehydrate()` split | ~8 | Yes — ORMs that bypass your constructor on load |
| Version check in `save()` | ~6 | Yes — usually one schema flag |
| Explicit transaction for row + outbox | ~8 | Yes — a unit of work commits them together |
| Per-request client setup | 0 | No — stateful ORMs make this *harder* on serverless |

So roughly forty lines of glue per aggregate, bought in exchange for a client with no hidden state. For one or two rule-heavy aggregates that is a good trade. For twenty, look at a Data Mapper ORM instead.

## How much of this to actually adopt

Most Next.js apps should not do all of it, and saying otherwise would be dishonest.

**Skip nearly all of it** for marketing sites, CMS-backed content, and dashboards over someone else's API. There is no domain of your own to protect — server components plus Drizzle queries directly is correct, and the layering is pure overhead.

**Take three things regardless**, because they cost almost nothing:

1. Ubiquitous language in your schema and component names.
2. Valibot at every server action boundary.
3. Business logic out of `app/`, even if that just means a `lib/` function rather than a full domain layer.

**Add the rest one aggregate at a time**, starting with whichever part of your app has rules that can be *refused*. In this tracker that is `Issue`, because assignment, status transitions and ranking all have real constraints. The admin CRUD screens in the same app can stay plain `db.select()` forever — a mixed codebase is fine, and pretending otherwise is how a sensible refactor turns into a six-month rewrite.

The signal that you needed this and skipped it: the same business rule written in three places, and a bug report proving one of them is wrong.

---

That is the series. The ideas are old and the code is ordinary. What makes them work is being deliberate about where each rule lives, and holding that line when the shortcut is right there.

**Sources:** [Drizzle — schema declaration](https://www.mintlify.com/drizzle-team/drizzle-orm/core/schema-declaration), [Drizzle — PostgreSQL database and transactions](https://mintlify.com/drizzle-team/drizzle-orm/api/postgresql/database), [Next.js — `after()`](https://nextjs.org/docs/app/api-reference/functions/after)
