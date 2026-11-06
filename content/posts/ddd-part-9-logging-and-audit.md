---
title: 'Domain-Driven Design, Part 9: Error Logs and Audit Trails'
date: 2026-11-05T08:00:00.000Z
updatedAt: 2026-11-05T08:00:00.000Z
excerpt: Neither one is mentioned in the DDD books, and they pull in opposite directions — one belongs nowhere near your domain, the other is already sitting in your domain events waiting to be used.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/ddd-part-9-logging-and-audit.md
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
8. [DDD in a real Next.js project](https://vespaiach.com/posts/ddd-part-8-nextjs-in-practice.html) — the same issue tracker, from Postgres to the form
9. **Error logs and audit trails** — the two concerns the books skip ← *you are here*

Eight parts and we have not mentioned logging or audit trails once. The DDD books barely mention them either. But both show up in a real app within about a week of launch, so here is where they go.

They sound like one topic. They are two, and they end up in opposite places.

## Start with two examples

**One.** The issue page shows a little list under each issue:

> *Alice assigned this to Bob — 10 minutes ago*

**Two.** At 3am, something in your logs says:

> `ERROR connection pool timeout at issue-repository.ts:42`

Both are "a record of what happened." But look at who reads them. The first is read by Alice and Bob, discussed in product meetings, and quoted back to customers by support. The second is read by you, once, while fixing something.

That gives you the rule for the whole post:

> **If a user sees it, it belongs in your domain. If only you see it, it does not.**

The activity feed is part of the product. The error log is plumbing. Keep them apart and both get easy.

## Part one: error logs

The short version: **never put a logger in your domain files.**

Not because logging is bad, but because it undoes the thing the domain layer is for. From Part 8, the test that justified the whole structure was this:

```ts
const issue = Issue.create({ ... })
expect(() => issue.assignTo('bob')).toThrow()
```

No database, no mocks, runs instantly. Add a `logger.warn()` inside `assignTo` and now the test needs a logger configured. Do that in twenty places and the domain stops being the easy part of the codebase.

### So where does it go?

One place: the server action, where you already catch errors.

```ts
try {
  await assignIssue.execute({ ...input, actorId: session.user.id })
} catch (err) {
  // The domain said no. That is the system working.
  if (err instanceof DomainError)    return { message: err.message }
  if (err instanceof ForbiddenError) return { message: err.message }

  // Nobody expected this. This one is a bug.
  logger.error('assignIssue failed', { err, issueId: input.issueId })
  throw err
}
```

The domain throws. The boundary decides what that means. That is the same split as everything else in this series.

### The useful bit: not everything is an error

This is worth getting right because it affects whether your alerts are useful.

When `assignTo` refuses to assign a closed issue, **nothing went wrong**. A rule worked. A user saw a message. If you log that at error level, and two hundred people hit it a day, your error dashboard shows two hundred errors a day and everyone learns to ignore it.

So:

| What happened | Is it a problem? | What to do |
| --- | --- | --- |
| A business rule refused (`DomainError`) | No | Nothing, or a debug line |
| Permission denied (`ForbiddenError`) | No | Count it, don't alert |
| Two people edited at once (`ConcurrencyError`) | No | Count it. Alert only if the rate jumps |
| Anything you did not predict | Yes | Log it with the stack, and wake someone |

The typed errors from Part 5 are what make this sorting possible. You get it for free just by having thrown the right class.

### Two small habits

**Log IDs, not objects.**

```ts
logger.error('assignIssue failed', { err, issueId, actorId })   // good
logger.error('assignIssue failed', { err, issue, session })     // bad
```

The second one copies an email address and a session token into whatever logging service you use, and leaves them there.

**Give each rule a code.** Message text gets reworded; a code does not.

```ts
throw new DomainError('Cannot assign a closed issue', 'issue.closed')
```

Now you can count how often that specific rule fires, and translate it in the UI, without matching on English.

## Part two: audit trails

Now the other one — and the good news is you already built most of it in Part 8 without noticing.

Go back to what a domain event looks like:

```ts
{
  type: 'issue.assigned',
  payload: { issueId: 'i_42', assigneeId: 'bob', actorId: 'alice' }
}
```

Read that out loud. *Alice assigned issue 42 to Bob.* That is the activity feed entry. You are not building an audit trail from scratch — you are displaying events you already publish.

### How it fits together

```
issue.assignTo(...)        the rule runs, an event is recorded
        ↓
outbox_events table        saved in the same transaction as the issue
        ↓
cron job reads it          the same one that sends the email
        ↓
activity_entries table     what the UI reads
```

The one new table:

```ts
export const activityEntries = pgTable('activity_entries', {
  id:         text('id').primaryKey(),
  projectId:  text('project_id').notNull(),
  issueId:    text('issue_id'),
  actorId:    text('actor_id').notNull(),
  kind:       text('kind').notNull(),        // 'issue.assigned'
  data:       jsonb('data').notNull(),       // whatever the UI needs to render
  occurredAt: timestamp('occurred_at').notNull(),
})
```

No `version` column, no update queries, no deletes. An audit trail you can edit is not an audit trail.

And the handler, sitting next to the email one in the cron route:

```ts
if (event.type === 'issue.assigned') {
  await db.insert(activityEntries).values({
    id: event.id,                    // the event's own id — see below
    projectId: event.payload.projectId,
    issueId: event.payload.issueId,
    actorId: event.payload.actorId,
    kind: 'issue.assigned',
    data: { assigneeId: event.payload.assigneeId },
    occurredAt: event.createdAt,
  }).onConflictDoNothing()
}
```

**Why `event.id` and not a fresh UUID.** Part 6 warned that these handlers run twice sooner or later — the job crashes after sending the email but before marking the row done, and next run picks it up again. With a random id you get two identical lines in the feed. Reusing the event's id means the second insert hits the primary key, `onConflictDoNothing` swallows it, and the feed stays clean.

### The one annoying part

Your entity does not know who is doing things:

```ts
assignTo(assigneeId: string): void
```

The event needs an actor, so the method has to take one:

```ts
assignTo(assigneeId: string, actorId: string): void
```

That is slightly irritating — "who is logged in" is request information, not issue information, and now it is in your domain method signature. There is a clever way around it (an ambient context the domain reads from), and I would not take it. Hidden inputs make methods hard to test and hard to read. An extra parameter is ugly in a way you can see, which is the better kind of ugly.

## Three things to know before you build it

**The feed appears a few seconds late.** It is written by the cron job, not by the action. For an activity feed nobody notices. If a regulator needs the record to exist at the same instant as the change, write the activity row inside the same transaction as the issue update instead.

**It only shows what you modeled.** The feed can show "assigned", "status changed", "commented" — because those are events. It cannot show "someone changed the `updated_at` column", because that is not an event and should not become one.

**"Log every field change" is a different job.** If compliance wants every column mutation recorded, that is a database concern — Postgres triggers or a temporal table, sitting underneath everything, invisible to the domain. Do not try to do it with domain events. You will end up emitting events nobody cares about and a feed nobody can read.

Ending up with both an activity feed *and* a technical change log is normal. They look like duplicates but have different readers, different retention and different shapes. Trying to make one serve both usually ruins the readable one.

## One extra line that pays for itself

Make an ID at the start of the request. Put it in the log line and in the event:

```ts
const correlationId = randomUUID()
```

Months later, someone reports one wrong entry in an activity feed. That ID takes you straight from the entry to the log lines for the exact request that produced it. It costs nothing now and is painful to add later.

## What to actually do

- **Always:** keep loggers out of `domain/`, use typed errors, and stop logging expected refusals as errors. Costs nothing, and it is the difference between logs you read and logs you ignore.
- **When users ask to see history:** build the activity projection. Not before — an append-only table nobody opens is just storage.
- **When someone with a compliance requirement asks:** the synchronous write, the database-level change log. Build those against the real requirement, not a guess.
- **Never:** `import logger` inside a domain file.

---

**The series so far:** strategy, the building blocks, the patterns around them, the architecture, a walkthrough, the pitfalls, the questions people ask, a real Next.js implementation, and now the two concerns the books leave out. The ideas are old and the code is ordinary. What makes them work is being deliberate about where each rule lives, and holding that line when the shortcut is right there.
