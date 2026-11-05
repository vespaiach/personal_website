---
title: 'Domain-Driven Design, Part 2: Entities, Value Objects and Aggregates'
date: 2026-11-04T01:00:00.000Z
updatedAt: 2026-11-04T01:00:00.000Z
excerpt: The tactical building blocks, in TypeScript — identity that survives change, values that make invalid state impossible, and the consistency boundary that decides what gets loaded and saved together.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/ddd-part-2-entities-value-objects-aggregates.md
tags: ddd
---

> *This post was generated with AI assistance.*

**The series**

1. [Strategic DDD](https://vespaiach.com/posts/ddd-part-1-strategic-design.html) — subdomains, bounded contexts, ubiquitous language, the context map
2. **The building blocks** — entities, value objects, aggregates and aggregate roots ← *you are here*
3. [Services, events, repositories](https://vespaiach.com/posts/ddd-part-3-services-events-repositories.html) — logic that spans objects, and keeping storage out of the domain
4. [The layered architecture](https://vespaiach.com/posts/ddd-part-4-the-layered-architecture.html) — the four layers, the dependency rule, and use cases
5. [A walkthrough](https://vespaiach.com/posts/ddd-part-5-a-walkthrough.html) — one feature built end to end through every layer
6. [Common pitfalls](https://vespaiach.com/posts/ddd-part-6-common-pitfalls.html) — the modeling mistakes and the runtime traps
7. [Frequently asked questions](https://vespaiach.com/posts/ddd-part-7-faq.html) — the concepts people get tangled, and the two that quietly lose data

Part 1 covered the strategic side — subdomains, bounded contexts, ubiquitous language and the context map. This part goes inside one of those boundaries and models the code.

Tactical DDD is about how to model code inside one part of the system, so that individual components stay clean, testable, and aligned with business rules. It has three foundational pieces, and this post covers all three: entities, value objects, and aggregates.

## 2.1 Entities

**What:** An entity is a domain object that has a unique identity that persists over time. Its identity is what makes it "the same thing" — even if all its attributes change.

**Why:** Some things in your domain need to be tracked over their entire lifecycle. An issue is created, updated, assigned, commented on, and eventually closed — it is the same issue throughout all those changes. Without identity, you cannot track that lifecycle. Entities give you a stable handle on objects that change over time.

```ts
// WHAT: Issue is an Entity because it has a lifecycle
// WHY: We need to track "this specific issue" across all its state changes

class Issue {
  constructor(
    public readonly issueId: string,   // ← identity — never changes
    public title: string,              // ← can change (user edits it)
    public status: IssueStatus,        // ← can change (workflow progresses)
    public priority: Priority,         // ← can change (reprioritized)
  ) {}

  equals(other: Issue): boolean {
    return this.issueId === other.issueId
    // WHY: Two issues with the same title are NOT the same issue.
    // Identity is what matters, not attribute equality.
  }
}
```

**Why this matters in practice:**

- Issue `AP-42` starts as "Fix login bug" with status `TODO`
- A user renames it to "Fix OAuth redirect bug" — still `AP-42`
- A user changes status to `IN_PROGRESS` — still `AP-42`
- It is the same issue throughout; identity is stable

**When to use entities:** anything with a lifecycle that needs to be tracked — Issue, Project, User, Member, Milestone, Comment.

## 2.2 Value objects

**What:** A value object is a domain object defined entirely by its attributes — it has no identity of its own. Two value objects with the same attributes are completely interchangeable.

**Why:** Primitive types like `string` and `number` carry no domain meaning. A string status can be set to any value — `"DONE"`, `"done"`, `"Done"`, `"finished"`, `"invalid"` — and the compiler will not complain. A value object wraps that primitive, enforces valid values, and adds domain behavior. It makes invalid state unrepresentable.

```ts
// WHAT: IssueStatus is a Value Object — it wraps a string
//       and adds validation + domain behavior
// WHY: A raw string "status" can hold any value.
//      IssueStatus can only hold valid statuses.
//      It also knows the valid transitions — a string cannot.

class IssueStatus {
  private constructor(public readonly value: string) {}
  //      ↑ private constructor — the only way to create one
  //        is through the static factory methods below

  static readonly TODO        = new IssueStatus("todo")
  static readonly IN_PROGRESS = new IssueStatus("in_progress")
  static readonly IN_REVIEW   = new IssueStatus("in_review")
  static readonly DONE        = new IssueStatus("done")
  static readonly CANCELLED   = new IssueStatus("cancelled")

  static from(value: string): IssueStatus {
    const valid = ["todo", "in_progress", "in_review", "done", "cancelled"]
    if (!valid.includes(value)) {
      throw new DomainError(`Invalid status: ${value}`)
      // WHY: Invalid state is rejected at construction time,
      //      not discovered later when it causes a bug
    }
    return new IssueStatus(value)
  }

  canTransitionTo(next: IssueStatus): boolean {
    // WHY THIS LIVES HERE: The rule "todo can go to in_progress"
    // is a domain rule. It belongs on the domain object that
    // represents status — not in a Use Case or a handler.
    const transitions: Record<string, string[]> = {
      todo:        ["in_progress", "cancelled"],
      in_progress: ["in_review", "todo", "cancelled"],
      in_review:   ["done", "in_progress"],
      done:        [],
      cancelled:   []
    }
    return transitions[this.value].includes(next.value)
  }
}
```

**Why this matters in practice:**

```ts
// ❌ Without a value object — bug waiting to happen
issue.status = "compelted"   // typo — compiler says nothing, bug ships

// ✅ With a value object — caught immediately
issue.status = IssueStatus.from("compelted")  // throws DomainError at runtime
issue.status = IssueStatus.DONE               // only valid values exist
```

| Property | What it means | Why it matters |
| --- | --- | --- |
| **Immutable** | Once created, never changed. Replace entirely instead. | No accidental mutation. Thread-safe by default. |
| **No identity** | No ID field. | Simplifies equality checks. Two `DONE` statuses are the same. |
| **Self-validating** | Invalid state cannot be constructed. | Bugs caught at construction, not at runtime in production. |
| **Behavior-rich** | Carries domain logic (`canTransitionTo`, format rules). | Logic lives where the data lives — not scattered elsewhere. |

## 2.3 Aggregates and aggregate roots

**What:** An aggregate is a cluster of related entities and value objects that are always kept consistent together. The aggregate root is the single object that controls all access to everything inside the cluster.

**Why:** Without aggregates, any part of the codebase can reach into any object and change it directly — creating inconsistent state. For example, a milestone could be deleted while issues still reference it, or a member could be removed while they still have open assignments. The aggregate root acts as a gatekeeper — all changes go through it, so it can enforce consistency rules across the whole cluster.

**What:** Project is an aggregate root. Member, Milestone, Comment and Log are child entities inside the aggregate.

**Why:** These objects only make sense in the context of a project. A milestone without a project is meaningless. A member without a project has no role to play. Keeping them inside the Project aggregate ensures they are always consistent with each other.

```
┌─────────────────────────────────────────────┐
│  Project Aggregate                          │
│                                             │
│  Project (Root) ← only entry point          │
│    ├── Member[]    ← child entity           │
│    ├── Milestone[] ← child entity           │
│    ├── Comment[]   ← child entity           │
│    └── Log[]       ← child entity           │
└─────────────────────────────────────────────┘
```

**Issue is a separate aggregate — why?**

- Issues have their own complex lifecycle (assignees, comments, logs, ranks).
- Putting them inside Project would make Project a god object.
- Issues can exist and be queried independently of the full project.
- Project only holds `issueId`s — a thin reference.

### The three rules

| Rule | Why |
| --- | --- |
| Only the root has a repository | Forces all access through the root. No one can bypass its consistency rules by going directly to a child entity. |
| External objects hold only the root's ID — never a child reference | Prevents tight coupling between aggregates. If Issue held a reference to a Milestone object, changing Milestone would require loading Issue. |
| All changes go through the root | The root can enforce invariants. "A project must always have at least one owner" — only enforceable if all member removals go through Project. |

---

**Next:** [Part 3](https://vespaiach.com/posts/ddd-part-3-services-events-repositories.html) covers the logic that does not fit on any single object — domain services, domain events, and repositories.
