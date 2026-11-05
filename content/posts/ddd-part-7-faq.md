---
title: 'Domain-Driven Design, Part 7: Frequently Asked Questions'
date: 2026-11-05T06:00:00.000Z
updatedAt: 2026-11-05T06:00:00.000Z
excerpt: Subdomains versus domain objects, roots versus child entities, domain services versus infrastructure, and the two questions about events and saving that quietly lose data when answered wrongly.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/ddd-part-7-faq.md
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
7. **Frequently asked questions** — the concepts people get tangled, and the two that quietly lose data ← *you are here*
8. [DDD in a real Next.js project](https://vespaiach.com/posts/ddd-part-8-nextjs-in-practice.html) — the same issue tracker, from Postgres to the form

Every question here came from someone actually trying to apply DDD for the first time — half of them while reading about it, half while writing the code. They are grouped by what they are really about, because several are the same confusion wearing different clothes.

Two of them, both in the last section, are corrections rather than explanations: the ones about whether an event saves anything and why the write has to be synchronous. They are the most useful entries here, because getting them wrong produces a design that looks right and loses data.

## Strategy and tactics

### Is a subdomain the same thing as a domain object?

No — they sit at completely different levels, and the fact that both have "domain" in the name is unhelpful.

A **subdomain** is strategic. It divides the business problem into independent areas of capability: project management, issue tracking, identity and access. A subdomain is large. It spans many files, several layers, and dozens of objects.

A **domain object** is tactical, and it is a thing in your code: `Issue`, `Project`, `IssueStatus`. An entity, a value object or an aggregate holding specific data and specific rules.

The analogy worth keeping: a subdomain is a department in a company; a domain object is a form that a person in that department fills in. You would not ask whether a department and a form are the same kind of thing.

One follows from the other, which is why they get confused: you identify subdomains first (Part 1), and then model domain objects inside whichever one you have decided to build (Parts 2 and 3).

### Do domain events belong to a subdomain or to a bounded context?

To a bounded context. The distinction matters more than it first appears:

|  | What it bounds | Level |
| --- | --- | --- |
| Subdomain | A business capability | Strategic — about the organization |
| Bounded context | A model and its vocabulary | Tactical — about code and data |
| Domain event | A fact inside one model | Tactical — belongs to one context |

`IssueAssigned` belongs to the Issue context, because that is where the model that produced it lives. Its *name* and its *payload* are written in that context's language.

But the event's reach is not limited to its context — that is the whole point of events. `IssueAssigned` is published in the Issue context and consumed in the Notification context, which has a different model of a person (a Recipient, not a Member) and does not import anything from the Issue model to handle it. The event crosses the boundary; the model does not.

This is also why the naming rule from Part 3 matters so much. An event named for a reaction (`NotifyAssignee`) belongs to its consumer, which means it cannot cross a boundary cleanly. An event named for a fact belongs to its producer and travels anywhere.

## Entities and aggregates

### Is a notification an entity or a value object?

The question usually comes from noticing that notifications feel small and disposable — more like data than like a thing with a life of its own.

It is an entity. The test is not size or importance, it is identity plus mutable state:

```ts
class Notification {
  constructor(
    readonly notificationId: string,   // identity
    readonly userId: string,
    readonly type: NotificationType,
    private read: boolean,             // state that changes
  ) {}

  markAsRead(): void {
    this.read = true
  }
}
```

It has an ID, and `read` goes from false to true over its lifetime. That is an entity.

The real question underneath is usually a different one: *should it be its own aggregate?* No — a notification has no meaning without the person being notified, so it lives inside the User aggregate. Being an entity and being an aggregate root are separate questions, and conflating them is where the confusion starts.

### How do I tell an aggregate root from a child entity?

Both have identity. Both can have mutable state. The difference is entirely about access:

|  | Aggregate root | Regular entity |
| --- | --- | --- |
| Identity | Yes | Yes |
| Reachable from outside | Directly | Only through its root |
| Has a repository | Yes | No |
| Lifecycle | Independent | Lives and dies with its root |
| Publishes domain events | Yes | No — the root does it |

In the tracker: `Project`, `Issue` and `User` are roots. `Member`, `Milestone`, `Comment`, `Log` and `Notification` are not.

Four tests for deciding which you have, in the order they usually settle it:

**Can it exist on its own?** A milestone with no project is meaningless — nobody would query for it, and deleting the project should delete it. That is a child. An issue has its own status, workflow and comments, and people link to it directly. That is a root.

**What must be true at every instant?** A root is the gatekeeper for rules spanning the whole cluster, enforced in one transaction. "A project always has at least one owner" is only enforceable if every member removal goes through `Project`. Whatever enforces a rule like that is a root, and everything it reaches is inside.

**Does it grow without bound?** Comments and activity logs do. An aggregate is loaded and saved whole, so an unbounded collection inside one is a performance problem waiting to appear. Those become roots of their own however dependent they feel.

**Would you want a repository for it?** If yes, it is a root — or it should be. That one has its own entry below.

### Doesn't the aggregate root just become a god object?

It can, and this is the most legitimate objection to the whole pattern. Left unchecked, `Project` ends up with forty methods covering members, milestones, comments, attachments, issues, ranking and permissions.

Three things keep it from happening:

**Draw the boundary correctly.** Issue is its own aggregate, not a child of Project. That decision alone removes roughly half of what `Project` would otherwise be asked to do — assignment, ranking, issue comments, issue logs.

**Let child entities validate themselves.** The root coordinates; it does not implement.

```ts
// The root doing the child's job
class Project {
  updateMilestone(id: string, changes: MilestoneProps): void {
    const milestone = this.milestones.find(m => m.milestoneId === id)
    if (!milestone) throw new DomainError("Not found")
    if (changes.dueDate < changes.startDate) throw new DomainError("Invalid dates")
    if (changes.name.length > 100) throw new DomainError("Name too long")
    milestone.name = changes.name
  }
}

// The child owning its own rules
class Milestone {
  applyChanges(changes: Partial<MilestoneProps>): void {
    if (changes.dueDate && changes.startDate && changes.dueDate < changes.startDate) {
      throw new DomainError("Due date cannot be before start date")
    }
    if (changes.name && changes.name.length > 100) {
      throw new DomainError("Milestone name too long")
    }
    Object.assign(this, changes)
  }
}

class Project {
  updateMilestone(id: string, changes: Partial<MilestoneProps>): void {
    const milestone = this.milestones.find(m => m.milestoneId === id)
    if (!milestone) throw new DomainError("Milestone not found in this project")
    milestone.applyChanges(changes)
    this.updatedAt = new Date()
  }
}
```

**Move cross-cutting concerns out.** Authorization, ranking and text parsing are domain services, not methods on the root.

After all three, `Project` holds around fifteen focused methods — three for members, three for milestones, a few for comments and attachments, one for project info, and some read-only getters. If yours passes twenty, something in that list has escaped.

### If aggregates can't reference each other, how do they work together?

They do not. The use case layer is the only place where two aggregates meet.

```ts
// An aggregate reaching for another aggregate
class Issue {
  async assignTo(userId: string): Promise<void> {
    const project = await projectRepository.findById(this.projectId)
    // Issue now depends on a repository, and on Project.
    // Two aggregates are welded together and neither can be tested alone.
  }
}
```

The use case holds both instead, and the shape is the same every time:

```
1. Load the aggregates it needs (in parallel where possible)
2. Authorize, via a domain service
3. Check the rules that span aggregates
4. Call methods on each aggregate
5. Save what changed
6. Publish the events
```

Assigning an issue touches three: `Project` (is the assignee a member?), `Issue` (add the assignee), and `User` (notification preferences). None of the three imports either of the others.

A practical consequence worth knowing up front: each aggregate saves separately, so a use case that changes two of them is not atomic unless your store gives you a transaction across both. Decide per use case whether that matters. For an assignment it usually does not; for anything involving money it does.

### What does "one repository per aggregate root" actually prevent?

Three things, and the first is the one that corrupts data.

**Invariants get bypassed.** An aggregate is a consistency boundary, and the root is the only thing that can see the whole cluster at once. A `MilestoneRepository` lets any caller load a milestone, change it, and save it without the project ever knowing:

```ts
// Bypassing the root
const milestone = await milestoneRepo.findById("m1")
milestone.name = "Sprint 2"
await milestoneRepo.save(milestone)
// Nobody checked the caller's permission on the project.
// No log entry was written.
// No event was published.
// The project's own updatedAt is now wrong.

// Through the root
const project = await projectRepo.findById("p1")
project.updateMilestone("m1", { name: "Sprint 2" }, actorId)
await projectRepo.save(project)
```

Nothing in the first version looks broken; the data quietly is.

**Partial loads become inconsistent.** Fetching through the root loads the cluster together, so rules that span it are checked against a complete picture. Load the pieces separately and you are checking rules against a snapshot that may never have existed as a whole.

**The repository layer stops exploding.** Without the rule, the obvious thing is one repository per database table, and you end up with fifteen of them, most wrapping four lines of query each. With it, the tracker needs three: `ProjectRepository`, `IssueRepository`, `UserRepository`.

The pressure to break the rule almost always comes from a read — a screen wants a list of milestones and loading whole projects feels wasteful. That is a fair complaint with a different answer: add a read path that queries storage directly and returns exactly the columns the screen needs, with no domain objects involved. Writes go through the root; reads do not have to.

The rule of thumb worth memorizing: **if you find yourself wanting a repository for a non-root entity, either it should be its own aggregate root, or you are about to break a boundary.**

## Layers

### Is the infrastructure layer a kind of domain service?

No. They are opposites, and the word "service" on both is the only thing they share.

The **infrastructure layer** is the outermost ring. It talks to the world: database drivers, the email client, file storage, third-party APIs, the message queue. Its entire job is to keep those technical details away from the business rules.

A **domain service** sits in the innermost ring. It holds business rules that span several objects — a ranking algorithm, a permission check that needs a project and an actor together — and it imports nothing external at all.

|  | Domain service | Infrastructure service |
| --- | --- | --- |
| Layer | Domain (innermost) | Infrastructure (outermost) |
| Contains | Business rules | Technical detail |
| Example | `RankingService`, `ProjectAuthorizationService` | `SmtpMailer`, `SqlIssueRepository`, a password hasher |
| Imports | Nothing outside the domain | Drivers, SDKs, libraries |
| Testable without infrastructure | Yes | It *is* the infrastructure |
| Changes when | A business rule changes | A vendor or library changes |

The practical test: if swapping your email provider would change the file, it is infrastructure. If changing a business rule would change it, it is domain.

The confusing case is a service with a foot in both — "send the assignment notification" sounds like one thing but is two. Deciding *whether* a person should be notified is a domain rule. Actually delivering the mail is infrastructure. Split them: the domain owns the decision, and an interface like `send(email)` is all it knows about the delivery.

## Events, side effects and saving

These six are really one question asked six ways, and they are the ones most worth getting straight.

### What is a side effect, and why separate it from the domain?

A side effect is any change a function makes outside its own scope, or any way it touches the world while running: writing to a database, calling a network service, sending mail, touching global state, writing a file.

Pure logic is easy to test — call it, check what comes back. A function that sends an email is not: testing it means either sending real mail or building a fake mail server. Worse, a function that does five side effects fails in five ways, and when it fails halfway you are left with some of them done.

DDD's answer is to let the core logic change state and announce what happened, and have separate handlers do the rest:

```ts
// Tangled: one method, five ways to fail
issue.assigneeId = userId
await db.save(issue)
await mailer.send(...)
await analytics.track(...)
await activityLog.append(...)

// Separated: change state, record the fact
issue.assignTo(userId)
await this.issues.save(issue)
await this.events.publish(new IssueAssigned({ ... }))
```

The rules in `assignTo` can now be tested with no infrastructure at all, which is the practical payoff of the whole dependency rule from Part 4.

### Where do the side effects actually run?

The use case publishes an event and returns. Something else does the work:

```
Use case          Queue              Handler            Email service
   │                │                   │                    │
   │ publish ──────►│                   │                    │
   │◄── returns     │                   │                    │
   │                │─── delivers ─────►│                    │
   │                │                   │─── send ──────────►│
   │                │◄── acknowledges ──│                    │
```

The request finishes as soon as the event is published. The user is not waiting on an email server, and an email failure does not fail the assignment.

Three things this buys you, and one it costs:

- The API stays fast — publishing is a single write, not a round trip to a mail provider.
- Failures retry on their own, instead of surfacing as a failed user action.
- New side effects are new handlers; the use case never changes.
- The cost: the work now happens somewhere the original request cannot see. Handler failures need their own logging and their own alerting, or they fail silently — and that is a genuinely different operational posture from code that runs inline.

None of this is tied to a particular queue or mail provider. The domain defines `publish(event)` and `send(email)`; which products sit behind those two methods is a deployment decision, and the point of the whole exercise is that it stays one.

### Which component publishes domain events?

The aggregate root.

It is the only object that sees the whole cluster and knows when a rule actually passed. A use case can see that it *called* `assignTo`; only the aggregate knows whether the assignment really changed anything, or was a no-op because the issue was already assigned to that person.

In practice the root collects events into a pending list as it works, and something downstream dispatches them:

```ts
assignTo(assigneeId: string): void {
  if (this.status.isClosed()) throw new DomainError("Cannot assign a closed issue")
  if (this.assigneeId === assigneeId) return      // no change, so no event
  this.assigneeId = assigneeId
  this.pendingEvents.push(new IssueAssigned({ ... }))
}
```

That early return is the argument in miniature. Put the event in the use case and you publish one every time somebody re-assigns an issue to the person who already had it.

### Does publishing an event save anything to the database?

No, and this is the most consequential misunderstanding on the list.

An aggregate root is a plain object with business rules. It does not write to storage. The **repository** persists it:

```ts
await this.issues.save(issue)                      // this is what saves
await this.events.publish(issue.pullEvents())      // this is not
```

Domain events are never a mechanism for telling the database to store something. They exist only for side effects — mail, logging, analytics, read models — after the business transaction has already succeeded.

The failure mode is worth picturing: if you treat the event as the save, then an event that is dropped, delayed or retried becomes data that is missing, late or duplicated, and nothing in the code says so.

### Why must saving be synchronous rather than handled by an event?

Because persisting the user's intent *is* the request, and everything else is a consequence of it.

- **It has to be durable before you answer.** Returning 204 means "this happened." If the actual write is sitting in a queue, a crash makes that a lie.
- **The transaction has to be real.** The rules you checked were checked against state you are now committing. Defer the commit and you have checked rules against a picture that may have changed by the time anything is written.
- **The responsibilities differ.** Primary state is the goal of the request and must succeed now. A notification is secondary and can arrive a second later, or be retried, without anyone being harmed.

So: the use case saves through the repository, synchronously, and only then publishes. Side effects go asynchronous; the write never does.

### How does the outbox pattern make the save and the publish reliable together?

It removes the gap between them.

The problem is that a save and a publish are two systems. If the process dies between them, the issue is assigned and nobody is ever told. Reversing the order only makes it worse — then you can announce an assignment that did not happen.

The outbox fixes this by making the publish part of the save. The event is written into a table in the same database, inside the same transaction as the data:

```ts
async save(issue: Issue): Promise<void> {
  await this.db.transaction(async tx => {
    await tx.upsert("issues", IssueMapper.toRow(issue))
    await tx.insertMany("outbox", issue.pullEvents().map(toOutboxRow))
  })
}
```

Either both land or neither does. A background worker then reads unsent rows from the outbox, publishes them, and marks them sent.

What this buys and what it costs:

- **It guarantees at-least-once delivery.** The event cannot be lost, because it is as durable as the data it describes.
- **It does not guarantee exactly-once.** The worker can publish and crash before marking the row sent, so the event goes out twice. Handlers still have to tolerate repeats — see the operational pitfalls in [Part 6](https://vespaiach.com/posts/ddd-part-6-common-pitfalls.html).
- **It adds a table and a worker.** For a missed notification that is probably not worth it. For a billing record it is. The real mistake is not knowing which one you built.

---

That is the series. The ideas here are old and the code is ordinary. What makes them work is being deliberate about where each rule lives, and holding that line when the shortcut is right there.
