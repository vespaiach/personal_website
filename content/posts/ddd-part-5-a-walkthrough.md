---
title: 'Domain-Driven Design, Part 5: A Walkthrough'
date: 2026-11-04T04:00:00.000Z
updatedAt: 2026-11-04T04:00:00.000Z
excerpt: One feature — assigning an issue — built end to end through every layer, showing where each of its four business rules lands and why it belongs there rather than somewhere more convenient.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/ddd-part-5-a-walkthrough.md
tags: ddd
---

> *This post was generated with AI assistance.*

**The series**

1. [Strategic DDD](https://vespaiach.com/posts/ddd-part-1-strategic-design.html) — subdomains, bounded contexts, ubiquitous language, the context map
2. [The building blocks](https://vespaiach.com/posts/ddd-part-2-entities-value-objects-aggregates.html) — entities, value objects, aggregates and aggregate roots
3. [Services, events, repositories](https://vespaiach.com/posts/ddd-part-3-services-events-repositories.html) — logic that spans objects, and keeping storage out of the domain
4. [The layered architecture](https://vespaiach.com/posts/ddd-part-4-the-layered-architecture.html) — the four layers, the dependency rule, and use cases
5. **A walkthrough** — one feature built end to end through every layer ← *you are here*
6. [Common pitfalls](https://vespaiach.com/posts/ddd-part-6-common-pitfalls.html) — the modeling mistakes and the runtime traps
7. [Frequently asked questions](https://vespaiach.com/posts/ddd-part-7-faq.html) — the concepts people get tangled, and the two that quietly lose data

The first four parts introduced the pieces one at a time. This one builds a single feature through all of them, in order, so you can see where each decision gets made — and, just as importantly, why it gets made there rather than somewhere more convenient.

## The feature

> As a project admin, I want to assign an issue to a teammate, so that they know it is theirs. They should be notified. Closed issues cannot be assigned, and you cannot assign someone who is not a member of the project.

Four rules hide in that paragraph. The whole point of the walkthrough is that each one lands in a different place, and the place is not arbitrary.

| Rule | Where it goes | Why there |
| --- | --- | --- |
| Only admins and owners may assign | Domain service | Needs the project's membership and the actor's role — spans two objects |
| A closed issue cannot be assigned | Entity (`Issue`) | Depends only on the issue's own state |
| The assignee must be a project member | Use case | Needs both aggregates, and neither may hold a reference to the other |
| The assignee gets notified | Event handler | A side effect, not part of assigning |

## Step 1 — the value objects

Start at the bottom. What values does this feature need, and what rules do they carry?

```ts
// Role — who may do what
class Role {
  private constructor(readonly value: string) {}

  static readonly OWNER  = new Role("owner")
  static readonly ADMIN  = new Role("admin")
  static readonly MEMBER = new Role("member")

  static from(value: string): Role {
    const found = [Role.OWNER, Role.ADMIN, Role.MEMBER].find(r => r.value === value)
    if (!found) throw new DomainError(`Invalid role: ${value}`)
    return found
  }

  canManageIssues(): boolean {
    return this === Role.OWNER || this === Role.ADMIN
  }
}
```

`canManageIssues()` is a rule about roles, so it lives on `Role`. The alternative — a `role === "admin" || role === "owner"` check at each call site — is the same logic copied five times, and four of them get missed when a `superadmin` role is added.

`IssueStatus` from Part 2 already has what we need: `isClosed()`.

## Step 2 — the entity method

```ts
class Issue {
  // ...identity and fields from Part 2

  assignTo(assigneeId: string): void {
    if (this.status.isClosed()) {
      throw new DomainError("Cannot assign a closed issue")
    }
    if (this.assigneeId === assigneeId) {
      return   // already theirs — not an error, just nothing to do
    }
    this.assigneeId = assigneeId
  }
}
```

Notice what is **not** here. The entity does not check whether the assignee is a project member, because an `Issue` cannot see the project's membership list and must not be given a reference to the `Project` object. It does not send a notification either. It enforces exactly the rules it has the information to enforce.

## Step 3 — the domain service

The permission rule needs the project and the actor together, so it is not a method on either one:

```ts
class ProjectAuthorizationService {
  assertCanManageIssues(project: Project, actorId: string): void {
    const member = project.getMember(actorId)
    if (!member) throw new ForbiddenError("Not a project member")
    if (!member.role.canManageIssues()) {
      throw new ForbiddenError("Only admins and owners can assign issues")
    }
  }
}
```

It reads from `Project` but does not belong on it — authorization is a cross-cutting concern, and the service will grow methods for issues, milestones and settings that have nothing to do with each other except the permission check.

## Step 4 — the use case

Now the orchestration. Load, authorize, check what spans aggregates, change, save, announce:

```ts
interface AssignIssueCommand {
  issueId:    string
  projectId:  string
  assigneeId: string
  actorId:    string
}

class AssignIssueUseCase {
  constructor(
    private readonly issues:   IIssueRepository,
    private readonly projects: IProjectRepository,
    private readonly auth:     ProjectAuthorizationService,
    private readonly events:   IEventPublisher,
  ) {}

  async execute(cmd: AssignIssueCommand): Promise<void> {
    // 1 — load the aggregates
    const project = await this.projects.findById(cmd.projectId)
    if (!project) throw new NotFoundError("Project not found")

    const issue = await this.issues.findById(cmd.projectId, cmd.issueId)
    if (!issue) throw new NotFoundError("Issue not found")

    // 2 — authorize (domain service)
    this.auth.assertCanManageIssues(project, cmd.actorId)

    // 3 — the rule that spans both aggregates, so it can only live here
    if (!project.getMember(cmd.assigneeId)) {
      throw new DomainError("Cannot assign an issue to a non-member")
    }

    // 4 — the change itself (entity enforces its own rules)
    issue.assignTo(cmd.assigneeId)

    // 5 — persist and announce
    await this.issues.save(issue)
    await this.events.publish(new IssueAssigned({
      issueId:    issue.issueId,
      projectId:  issue.projectId,
      assigneeId: cmd.assigneeId,
      assignedBy: cmd.actorId,
      issueTitle: issue.title,
    }))
  }
}
```

Step 3 is the only business rule written directly in a use case, and it is there for a specific reason worth a comment in your codebase: it needs both aggregates, and the aggregate rule from Part 2 forbids either one from holding a reference to the other. The use case is the only place that has both in hand. That is the legitimate exception — without the comment, the next person assumes rules belong here and starts adding them.

## Step 5 — the handler and the presentation layer

The notification is nowhere in the use case. It lives on its own:

```ts
class SendAssignmentNotification implements IEventHandler<IssueAssigned> {
  readonly handles = "ISSUE_ASSIGNED"

  constructor(
    private readonly email:  IEmailService,
    private readonly people: IPeopleDirectory,
  ) {}

  async handle(event: IssueAssigned): Promise<void> {
    const person = await this.people.findById(event.payload.assigneeId)
    if (!person?.notifyOnAssignment) return

    await this.email.send(
      person.email,
      `You were assigned: ${event.payload.issueTitle}`,
    )
  }
}
```

And the outermost layer translates HTTP to domain and domain errors back to status codes:

```ts
// Presentation — the only layer that knows HTTP exists
async function assignIssueHandler(req: Request, res: Response) {
  try {
    await assignIssue.execute({
      issueId:    req.params.issueId,
      projectId:  req.params.projectId,
      assigneeId: req.body.assigneeId,
      actorId:    req.auth.userId,
    })
    res.status(204).end()
  } catch (err) {
    if (err instanceof NotFoundError)  return res.status(404).json({ error: err.message })
    if (err instanceof ForbiddenError) return res.status(403).json({ error: err.message })
    if (err instanceof DomainError)    return res.status(422).json({ error: err.message })
    throw err
  }
}
```

### The whole feature, by layer

```
Presentation    assignIssueHandler          HTTP in, status codes out
     │
Application     AssignIssueUseCase          loads, authorizes, saves, publishes
     │
Domain          Issue.assignTo()            "not if closed"
                Role.canManageIssues()      "admins and owners"
                ProjectAuthorizationService "is this actor allowed here"
                IssueAssigned               the fact that it happened
     │
Infrastructure  IssueRepository             how an issue is stored
                EventPublisher              how the fact gets delivered
                EmailService                how a person is reached
```

Every rule is in exactly one place, and nothing in the domain column imports a driver, a framework or an SDK.

## What to take from this

The walkthrough is short, but the decisions in it are the ones you will repeat on every feature:

- Start at the values. If a concept has rules attached, it gets a value object before anything else is written.
- Put a rule on the entity whenever the entity has the information to enforce it, and no further out.
- Reach for a domain service when a rule needs two objects and neither one owns it.
- Leave in the use case only what genuinely spans aggregates — and comment why, so the exception does not quietly become the habit.
- Announce what happened; let something else decide what follows.

If you apply those five in order on your own domain, the structure from Part 4 assembles itself. You rarely have to decide where a file goes — the rule's dependencies decide for you.

---

**Next:** [Part 6](https://vespaiach.com/posts/ddd-part-6-common-pitfalls.html) covers what goes wrong — the modeling mistakes, the operational traps that only show up in production, and the five questions everyone asks the first time they try this.
