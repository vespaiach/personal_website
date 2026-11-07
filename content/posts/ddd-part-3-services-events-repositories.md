---
title: 'Domain-Driven Design, Part 3: Services, Events and Repositories'
date: 2026-11-04T02:00:00.000Z
updatedAt: 2026-11-04T02:00:00.000Z
excerpt: Where logic goes when it belongs to no single object, how domain events stop side effects from being welded to the actions that cause them, and how repositories keep storage out of the domain.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/ddd-part-3-services-events-repositories.md
tags: ddd
---

> *This post was written with AI assistance.*

**The series**

1. [Strategic DDD](https://vespaiach.com/posts/ddd-part-1-strategic-design.html) — subdomains, bounded contexts, ubiquitous language, the context map
2. [The building blocks](https://vespaiach.com/posts/ddd-part-2-entities-value-objects-aggregates.html) — entities, value objects, aggregates and aggregate roots
3. **Services, events, repositories** — logic that spans objects, and keeping storage out of the domain ← *you are here*
4. [The layered architecture](https://vespaiach.com/posts/ddd-part-4-the-layered-architecture.html) — the four layers, the dependency rule, and use cases
5. [A walkthrough](https://vespaiach.com/posts/ddd-part-5-a-walkthrough.html) — one feature built end to end through every layer
6. [Common pitfalls](https://vespaiach.com/posts/ddd-part-6-common-pitfalls.html) — the modeling mistakes and the runtime traps
7. [Frequently asked questions](https://vespaiach.com/posts/ddd-part-7-faq.html) — the concepts people get tangled, and the two that quietly lose data
8. [DDD in a real Next.js project](https://vespaiach.com/posts/ddd-part-8-nextjs-in-practice.html) — the same issue tracker, from Postgres to the form
9. [Error logs and audit trails](https://vespaiach.com/posts/ddd-part-9-logging-and-audit.html) — the two concerns the books skip

Part 2 covered entities, value objects and aggregates. This part covers the three patterns that handle everything those cannot: logic that spans objects, side effects that should not be hard-wired, and persistence that should stay out of the domain.

## 2.4 Domain services

**What:** A domain service is a stateless object that holds domain logic which does not naturally belong to any single entity or value object — typically logic that involves multiple entities working together.

**Why:** When logic involves multiple entities, it does not belong on any one of them. Forcing it onto one entity creates inappropriate dependencies — an issue should not know about all other issues in the project just to calculate its rank. Domain services give that cross-entity logic a proper home without polluting any individual entity.

```ts
// WHAT: RankingService is a Domain Service
// WHY: Ranking logic involves multiple Issue entities.
//      It cannot live on a single Issue because one Issue
//      does not know about the others.
//      It cannot live on Project because Project should not
//      know the details of Lexorank calculation.
//      It belongs in a Domain Service.

class RankingService {
  initialRank(existingIssues: Issue[]): Rank {
    if (existingIssues.length === 0) return Rank.INITIAL
    return Rank.after(existingIssues.at(-1)!.rank)
  }

  rankBetween(above: Issue | null, below: Issue | null): Rank {
    if (!above && !below) return Rank.INITIAL
    if (!above) return Rank.before(below!.rank)
    if (!below) return Rank.after(above.rank)
    return Rank.between(above.rank, below.rank)
  }
}
```

```ts
// WHAT: ProjectAuthorizationService is a Domain Service
// WHY: Authorization logic reads from Project (to check membership + role)
//      but does not belong ON Project — it is a cross-cutting concern
//      that would bloat the Project entity if placed there.

class ProjectAuthorizationService {
  assertCanManageMembers(project: Project, userId: string): void {
    const member = project.getMember(userId)
    if (!member) throw new ForbiddenError("Not a project member")
    if (member.role.value === "member") {
      throw new ForbiddenError("Only admins and owners can manage members")
    }
  }
}
```

**The decision rule:**

```
"Does this logic belong to one specific entity?"
  Yes → put it on the entity as a method
  No, it involves multiple entities → Domain Service
  No, it is infrastructure (email, file storage) → Infrastructure layer
```

## 2.5 Domain events

**What:** A domain event is an immutable record of something significant that happened in the domain. It is always named in the past tense and carries exactly the data that describes what happened.

**Why:** Without domain events, use cases become tightly coupled to their side effects. `AssignIssueUseCase` would directly call the email service, the notification service, the analytics service, and the activity log service — all in one place. Adding a new side effect means modifying the use case. Domain events invert this — the use case just announces what happened, and any number of handlers can react to it independently, without the use case knowing or caring.

```ts
// WHAT: IssueAssigned is a Domain Event
// WHY: It records the fact that an assignment happened.
//      Any part of the system that cares about assignments
//      can subscribe to this event — without AssignIssueUseCase
//      needing to know about them.

class IssueAssigned implements DomainEvent {
  readonly eventId    = UniqueId.generate()
  readonly eventType  = "ISSUE_ASSIGNED"   // past tense — it already happened
  readonly occurredAt = new Date().toISOString()

  constructor(readonly payload: {
    issueId:    string
    projectId:  string
    assigneeId: string
    assignedBy: string
    issueTitle: string
  }) {}
}
```

**Why past tense matters:**

- `IssueAssigned` = something that happened — a fact, immutable
- `AssignIssue` = a command — an instruction to do something

These are fundamentally different concepts. Events describe history; commands describe intent.

### Why events decouple your system

**Without events — tight coupling:**

```
AssignIssueUseCase
  ├── assigns issue in the database
  ├── calls EmailService.send()
  ├── calls NotificationService.create()
  ├── calls AnalyticsService.track()
  └── calls ActivityLog.append()

PROBLEM: Adding Slack notifications means modifying AssignIssueUseCase.
Every new side effect = a change to the use case.
```

**With events — loose coupling:**

```
AssignIssueUseCase
  ├── assigns issue in the database
  └── publishes IssueAssigned ──► message queue

NotificationHandler (reacts to the event)
  ├── sends email
  ├── creates notification record
  └── tracks analytics

BENEFIT: Adding Slack notifications means adding a new handler.
AssignIssueUseCase never changes.
```

## 2.6 Repositories

**What:** A repository is an abstraction that makes your aggregates look like they live in a simple in-memory collection — hiding all the complexity of how they are actually stored and retrieved.

**Why:** Without repositories, your use cases are full of query syntax, index names, and serialization code. That means your business logic is tangled with your storage technology. If you ever change databases, you rewrite your use cases. With repositories, the use case only calls `issueRepo.findById()` — it has no idea how that works, and does not need to.

```ts
// WHAT: IIssueRepository is the Repository interface
// WHY: The domain layer defines what it needs (find, save, delete)
//      without knowing how it is implemented.
//      The Use Case depends on this interface — not on any database.

// Domain layer — pure interface, no database driver
interface IIssueRepository {
  findById(projectId: string, issueId: string): Promise<Issue | null>
  findByProject(projectId: string, filters: IssueFilters): Promise<Issue[]>
  save(issue: Issue): Promise<void>
  delete(projectId: string, issueId: string): Promise<void>
}
```

```ts
// Infrastructure layer — the concrete implementation
// WHY SEPARATE: The Use Case never imports this class directly.
//               It only knows the interface above.
//               Swapping one database for another = write a new class,
//               touch zero Use Cases.

class IssueRepository implements IIssueRepository {
  constructor(private readonly db: Database) {}

  async findById(projectId: string, issueId: string): Promise<Issue | null> {
    // All storage complexity lives here — hidden from the domain
    const rows = await this.db.query(
      "SELECT * FROM issues WHERE project_id = ? AND issue_id = ?",
      [projectId, issueId]
    )
    return rows.length ? IssueMapper.toDomain(rows) : null
  }
}
```

**Why one repository per aggregate root:**

- ❌ `MilestoneRepository` — wrong. Milestones are inside the Project aggregate. Loading a milestone separately bypasses Project's consistency rules.
- ✅ `ProjectRepository` — correct. Load the whole Project aggregate, which includes its milestones.

---

**Next:** [Part 4](https://vespaiach.com/posts/ddd-part-4-the-layered-architecture.html) assembles everything into a layered architecture, and the dependency rule that holds it together.
