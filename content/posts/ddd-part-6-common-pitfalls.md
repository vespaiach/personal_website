---
title: 'Domain-Driven Design, Part 6: Common Pitfalls'
date: 2026-11-04T05:00:00.000Z
updatedAt: 2026-11-04T05:00:00.000Z
excerpt: The modeling mistakes caught in review, the operational traps that only surface in production, the five questions everyone asks the first time — and when not to use DDD at all.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/ddd-part-6-common-pitfalls.md
tags: ddd
---

> *This post was written with AI assistance.*

**The series**

1. [Strategic DDD](https://vespaiach.com/posts/ddd-part-1-strategic-design.html) — subdomains, bounded contexts, ubiquitous language, the context map
2. [The building blocks](https://vespaiach.com/posts/ddd-part-2-entities-value-objects-aggregates.html) — entities, value objects, aggregates and aggregate roots
3. [Services, events, repositories](https://vespaiach.com/posts/ddd-part-3-services-events-repositories.html) — logic that spans objects, and keeping storage out of the domain
4. [The layered architecture](https://vespaiach.com/posts/ddd-part-4-the-layered-architecture.html) — the four layers, the dependency rule, and use cases
5. [A walkthrough](https://vespaiach.com/posts/ddd-part-5-a-walkthrough.html) — one feature built end to end through every layer
6. **Common pitfalls** — the modeling mistakes and the runtime traps ← *you are here*
7. [Frequently asked questions](https://vespaiach.com/posts/ddd-part-7-faq.html) — the concepts people get tangled, and the two that quietly lose data
8. [DDD in a real Next.js project](https://vespaiach.com/posts/ddd-part-8-nextjs-in-practice.html) — the same issue tracker, from Postgres to the form
9. [Error logs and audit trails](https://vespaiach.com/posts/ddd-part-9-logging-and-audit.html) — the two concerns the books skip

Part 5 showed the pattern working. This part is the other half of learning it: everything that goes wrong, in roughly the order you will hit it.

Two kinds of problem, and they fail differently. **Modeling mistakes** are visible in the code and caught in review if anyone is looking. **Operational pitfalls** look fine in review and surface in production — nothing about them shows up until the day a queue retries or two people click at once. A third kind, the conceptual confusion that shapes a design before any of this, has its own post: [Part 7](https://vespaiach.com/posts/ddd-part-7-faq.html).

## Modeling mistakes

Each of these is the Part 5 walkthrough, done wrong.

| Mistake | What it looks like | Why it hurts / how to fix |
| --- | --- | --- |
| **Anemic domain model** | Entities are just data bags. All logic lives in use cases: `issue.status = "done"` | Business logic is scattered across use cases. Changing a rule means finding every use case that touches status. **Fix:** put behavior on entities — `issue.transitionTo(IssueStatus.DONE)` |
| **Fat use cases** | Use cases do everything: validate, authorize, calculate, send email, log activity | Hard to test, hard to read, hard to change. **Fix:** move domain logic into entities and domain services. Use cases should orchestrate, not implement. |
| **Repositories for child entities** | `MilestoneRepository`, `AssigneeRepository` | Bypasses the aggregate root's consistency rules. A milestone loaded directly can be changed without Project knowing. **Fix:** only aggregate roots get repositories. |
| **Cross-aggregate direct references** | Issue holds a reference to a Milestone object | Creates tight coupling. Loading Issue now requires loading Milestone. Changes to Milestone break Issue. **Fix:** reference by ID only. |
| **Primitive obsession** | `string status`, `string rank`, `string role` | Any string is valid. No behavior, no validation, bugs at runtime. **Fix:** value objects carry validation and behavior at construction time. |
| **God aggregate root** | Project has 40+ methods | Impossible to read, test, or change. **Fix:** delegate to child entities and domain services. Root stays at ~15 focused methods. |
| **Skipping ubiquitous language** | Code says "ticket", domain expert says "issue" | Developers and domain experts speak different languages. Translation errors become bugs. **Fix:** rename everything to match domain language. |
| **Events named as commands** | The issue aggregate publishes `NotifyAssignee` | The event now carries one consumer's concern, and the next consumer does not fit. **Fix:** name the fact — `IssueAssigned`. The handler decides what follows. |
| **Layer leakage** | A driver import or framework type inside the domain folder | The domain can no longer be tested or reasoned about on its own. **Fix:** an import rule per folder in your linter catches what code review misses. |

## Operational pitfalls

The table above is about modeling. These are the ones that look fine in review and surface in production.

### The event that never arrives

Look again at the end of the use case from Part 5:

```ts
await this.issues.save(issue)
await this.events.publish(new IssueAssigned({ ... }))
```

Two systems, two chances to fail. If the process dies between them, the issue is assigned and nobody is ever told. Swapping the lines makes it worse — now you can announce an assignment that did not happen.

**The fix:** write the event into the same store as the data, in the same transaction, and let a separate worker publish from there and mark it sent. The aggregate collects events as it goes:

```ts
class Issue {
  private readonly pendingEvents: DomainEvent[] = []

  assignTo(assigneeId: string): void {
    if (this.status.isClosed()) throw new DomainError("Cannot assign a closed issue")
    this.assigneeId = assigneeId
    this.pendingEvents.push(new IssueAssigned({ ... }))
  }

  pullEvents(): DomainEvent[] {
    return this.pendingEvents.splice(0)
  }
}

// the repository writes the row and the events together
async save(issue: Issue): Promise<void> {
  await this.db.transaction(async tx => {
    await tx.upsert("issues", IssueMapper.toRow(issue))
    await tx.insertMany("outbox", issue.pullEvents().map(toOutboxRow))
  })
}
```

This is the outbox pattern. Any store that can do two writes in one transaction supports it. Whether it is worth the machinery depends on what the event triggers — a missed notification is survivable, a missed billing record is not. The real mistake is not knowing which one you built.

### Handlers that cannot be run twice

Following from the above: delivery is rarely exactly-once. A handler that creates a notification record every time it runs will send three emails the day the queue retries. Check before acting, or key the side effect on the event ID.

### A handler failure that fails the action

If your publisher awaits every handler and lets exceptions through, a broken email provider now blocks issue assignment. Handlers run independently of the action, and of each other:

```ts
for (const handler of handlers) {
  try {
    await handler.handle(event)
  } catch (err) {
    logger.error(`Handler ${handler.constructor.name} failed`, { event, err })
  }
}
```

### Aggregates that grow without limit

The Project aggregate in Part 2 holds `Comment[]` and `Log[]`. That is fine in a diagram and wrong in production: both grow forever, and an aggregate is loaded and saved whole, so renaming a project eventually means loading ten thousand log entries.

**The rule:** if a collection grows without bound, it is not part of the aggregate. Members and milestones are bounded — tens, not millions. Comments and logs become their own aggregates, referenced by ID.

### Two people editing the same aggregate

Two admins assign the same issue at once. Both load it, both change it, both save — one silently overwrites the other. Aggregates need a version:

```ts
async save(issue: Issue): Promise<void> {
  const updated = await this.db.update(
    "UPDATE issues SET ..., version = ? WHERE issue_id = ? AND version = ?",
    [issue.version + 1, issue.issueId, issue.version]
  )
  if (updated === 0) throw new ConcurrencyError("Issue was modified by someone else")
}
```

This is also the feedback signal for aggregate size: frequent conflicts mean the boundary is too wide.

### Rehydration that re-runs creation rules

A subtle one. If your repository rebuilds an entity through the same constructor used to create a new one, then every stored row has to satisfy today's rules. The day you add "titles must be under 80 characters", every older issue with a longer title becomes unloadable.

Keep two paths: `create()` applies the rules, `rehydrate()` trusts the row. Changing a rule then affects new data only, and migrating the old data stays a deliberate decision.

### Reads forced through aggregates

A board screen needs 200 issues with a title, status and assignee name. Loading 200 full aggregates to render a list is slow and pointless.

**The fix:** writes go through aggregates; reads can go straight to storage. A plain query returning exactly the columns the screen needs — no domain objects — is not a violation. Formalized, that split is CQRS, but you do not need the ceremony to use the idea.

### Modeling before you understand the domain

The most expensive one, and the hardest to see while doing it. Aggregate boundaries drawn before you know the vocabulary produce confident, wrong abstractions — and a wrong abstraction is harder to remove than no abstraction, because it looks deliberate.

If you cannot yet explain the difference between two concepts to a domain expert without hedging, you are not ready to put a boundary between them. Build the obvious version, learn what the arguments are actually about, then refactor toward the model.

## When not to use DDD

Everything in this series costs effort, and it costs reading effort too — a new engineer meets five files for one update where they expected one. That is worth paying only when the complexity is genuinely in the business rules.

Skip most of it when:

- **The domain is CRUD.** If the rule is "save the form and show it later", an aggregate adds nothing. Use the framework's happy path.
- **The rules live somewhere else.** A thin UI over someone else's API has no domain of its own to model.
- **You do not understand the domain yet.** See the last pitfall above.
- **It is short-lived.** A prototype that ships in three weeks and dies in three months does not need a consistency boundary.

What is worth taking even into a small project: ubiquitous language, value objects for anything with rules attached, and keeping business logic out of request handlers. Those three are nearly free and pay back immediately. Aggregates and layering are for when the domain earns them.

---

**Next:** [Part 7](https://vespaiach.com/posts/ddd-part-7-faq.html) closes the series with the questions people ask about DDD itself — what separates a subdomain from a domain object, a root from a child entity, a domain service from infrastructure, and the two about events and saving that quietly lose data when answered wrongly.