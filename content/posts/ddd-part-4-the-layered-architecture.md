---
title: 'Domain-Driven Design, Part 4: The Layered Architecture'
date: 2026-11-04T03:00:00.000Z
updatedAt: 2026-11-04T03:00:00.000Z
excerpt: Four layers, one dependency rule, and a place for every piece from the first three posts — plus a summary of every DDD concept in the series and what each one is actually for.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/ddd-part-4-the-layered-architecture.md
tags: ddd
---

> *This post was generated with AI assistance.*

**The series**

1. [Strategic DDD](https://vespaiach.com/posts/ddd-part-1-strategic-design.html) — subdomains, bounded contexts, ubiquitous language, the context map
2. [The building blocks](https://vespaiach.com/posts/ddd-part-2-entities-value-objects-aggregates.html) — entities, value objects, aggregates and aggregate roots
3. [Services, events, repositories](https://vespaiach.com/posts/ddd-part-3-services-events-repositories.html) — logic that spans objects, and keeping storage out of the domain
4. **The layered architecture** — the four layers, the dependency rule, and use cases ← *you are here*
5. [A walkthrough](https://vespaiach.com/posts/ddd-part-5-a-walkthrough.html) — one feature built end to end through every layer
6. [Common pitfalls](https://vespaiach.com/posts/ddd-part-6-common-pitfalls.html) — the modeling mistakes and the runtime traps
7. [Frequently asked questions](https://vespaiach.com/posts/ddd-part-7-faq.html) — the concepts people get tangled, and the two that quietly lose data
8. [DDD in a real Next.js project](https://vespaiach.com/posts/ddd-part-8-nextjs-in-practice.html) — the same issue tracker, from Postgres to the form
9. [Error logs and audit trails](https://vespaiach.com/posts/ddd-part-9-logging-and-audit.html) — the two concerns the books skip

Parts 2 and 3 covered the tactical building blocks. This part gives them a place to live: four layers, one dependency rule, and a summary of every concept in the series so far.

## The layered architecture

**What:** The layered architecture organizes your code into four concentric layers, each with a single responsibility. Dependencies only flow inward — outer layers know about inner layers, never the reverse.

**Why:** Without layers, everything depends on everything. A request handler imports the database driver directly. A domain entity imports the email client. A use case imports HTTP types. When you change databases, you touch domain code. When you change your email provider, you touch business logic. Layers prevent this by giving each concern a home and enforcing that the most important layer — the domain — depends on nothing external.

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                    │
│                                                         │
│  WHAT: Request handlers, presenters, HTTP shapes        │
│  WHY:  Translates HTTP ↔ domain. Knows about request    │
│        shapes and JSON responses.                       │
│        Nothing else should know about HTTP.             │
└───────────────────────────┬─────────────────────────────┘
                            │ calls
┌───────────────────────────▼─────────────────────────────┐
│                  APPLICATION LAYER                      │
│                                                         │
│  WHAT: Use Cases — one per user action                  │
│  WHY:  Orchestrates the domain to fulfill one           │
│        user intent. Coordinates multiple aggregates.    │
│        The only layer that talks to multiple            │
│        aggregates at once.                              │
└───────────────────────────┬─────────────────────────────┘
                            │ uses
┌───────────────────────────▼─────────────────────────────┐
│                    DOMAIN LAYER                         │
│                                                         │
│  WHAT: Entities, Value Objects, Aggregates,             │
│        Domain Services, Domain Events,                  │
│        Repository Interfaces                            │
│  WHY:  Pure business logic. No database driver.         │
│        No HTTP. No message queue. This layer can be     │
│        tested with zero infrastructure — just plain     │
│        TypeScript. It is the heart of the system.       │
└───────────────────────────┬─────────────────────────────┘
                            │ implemented by
┌───────────────────────────▼─────────────────────────────┐
│                INFRASTRUCTURE LAYER                     │
│                                                         │
│  WHAT: Database repositories, message-queue event bus,  │
│        file storage, email client, auth provider,       │
│        mappers                                          │
│  WHY:  Implements what the domain defines.              │
│        All driver and SDK code lives here — isolated    │
│        from business logic. Swap one database for       │
│        another by rewriting this layer only.            │
└─────────────────────────────────────────────────────────┘
```

**The dependency rule — the single most important rule:**

- Domain depends on **nothing**
- Application depends on Domain only
- Presentation depends on Application + Domain
- Infrastructure depends on Domain (to implement its interfaces)
- Nothing depends on Infrastructure except the composition root

## Use cases

The application layer has exactly one building block, and it is the one piece of tactical DDD that Parts 2 and 3 did not cover — because it does not belong to the domain.

**What:** A use case is one thing a user can do, written as one class with one public method. It loads the aggregates it needs, calls them, saves them, and publishes what happened.

**Why:** Something has to sequence a request, and the domain cannot do it. An entity cannot load another aggregate. A domain service holds rules, not orchestration. A request handler could do the sequencing, but then the logic only exists for callers arriving over HTTP — a scheduled job or a CLI command doing the same thing would have to duplicate it. The use case is where the sequence lives, independent of what triggered it.

```ts
class AssignIssueUseCase {
  constructor(
    private readonly issues:   IIssueRepository,
    private readonly projects: IProjectRepository,
    private readonly auth:     ProjectAuthorizationService,
    private readonly events:   IEventPublisher,
  ) {}

  async execute(cmd: AssignIssueCommand): Promise<void> {
    // load → authorize → check what spans aggregates → change → save → announce
  }
}
```

### What a use case does, and what it must not

| A use case does | A use case does not |
| --- | --- |
| Load aggregates through repositories | Contain business rules that belong on an entity |
| Call a domain service to authorize | Know about HTTP, queues, or the database |
| Check rules that genuinely span two aggregates | Reference another use case |
| Call methods on aggregates | Decide what happens after the event |
| Save what changed, publish the events | Format a response |

The defining constraint is the third row on the left. A use case is the **only** place two aggregates may meet, because the aggregate rules from Part 2 forbid either one from holding a reference to the other. That is what the layer exists for.

### Four habits that keep them honest

- **One public method.** A class with `assign`, `unassign` and `reassign` is three use cases wearing a coat.
- **Input is a plain command object.** No framework request types; the presentation layer translates.
- **No branching on the caller.** A use case that behaves differently for the web and the API is two use cases.
- **Past about fifty lines, look for the rule that escaped.** Fat use cases are almost always an entity's logic that leaked outward.

Use cases are also the natural seam for anything that wraps a whole user action — a transaction, an audit entry, a metric. Those are cross-cutting concerns, applied around `execute()` rather than written inside it.

## Everything in the app at a glance

| Concept | Example in the app | What / why |
| --- | --- | --- |
| **Subdomain** | Issue tracking (core), Notifications (supporting) | **What:** distinct business capability. **Why:** guides where to invest effort |
| **Bounded context** | Project, Issue, Notification | **What:** explicit model boundary. **Why:** prevents model pollution |
| **Ubiquitous language** | Issue, Member, Rank, IssueNumber, Milestone | **What:** shared vocabulary. **Why:** closes the gap between devs and domain |
| **Entity** | Issue, Project, User | **What:** identity-based object. **Why:** tracks lifecycle over time |
| **Value object** | IssueStatus, Priority, Rank | **What:** value-based, immutable object. **Why:** makes invalid state impossible |
| **Aggregate root** | Project, Issue, User | **What:** cluster entry point. **Why:** enforces consistency rules |
| **Domain service** | RankingService, ProjectAuthorizationService | **What:** stateless cross-entity logic. **Why:** logic with no natural entity home |
| **Domain event** | IssueAssigned, UserMentioned | **What:** immutable record of what happened. **Why:** decouples side effects from actions |
| **Repository** | IProjectRepository, IIssueRepository | **What:** collection abstraction. **Why:** hides persistence from the domain |
| **Use case** | CreateIssueUseCase, AssignIssueUseCase | **What:** one user action, orchestrated. **Why:** single place for coordination |

## The mental model, one sentence each

- **Subdomain** → a distinct area of business capability
- **Bounded context** → a boundary where a model has one precise meaning
- **Ubiquitous language** → the shared vocabulary that code and business both speak
- **Entity** → an object tracked by identity across its lifetime
- **Value object** → an immutable object defined entirely by its value
- **Aggregate** → a consistency boundary: what changes together stays together
- **Aggregate root** → the single gatekeeper for everything inside an aggregate
- **Domain service** → stateless logic that spans multiple entities
- **Domain event** → an immutable record of something that happened
- **Repository** → a collection abstraction that hides persistence details
- **Use case** → the orchestrator of one user action across the domain

---

**Next:** [Part 5](https://vespaiach.com/posts/ddd-part-5-a-walkthrough.html) builds one feature end to end through all four layers, so you can see where each decision gets made.