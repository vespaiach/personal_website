---
title: 'Domain-Driven Design, Part 1: Strategic Design'
date: 2026-11-04T00:00:00.000Z
updatedAt: 2026-11-04T00:00:00.000Z
excerpt: Subdomains, bounded contexts, ubiquitous language and the context map — the half of DDD that decides what you build, what you buy, and where the boundaries go, before any code is written.
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/ddd-part-1-strategic-design.md
tags: ddd
---

> *This post was generated with AI assistance.*

**The series**

1. **Strategic DDD** — subdomains, bounded contexts, ubiquitous language, the context map ← *you are here*
2. [The building blocks](https://vespaiach.com/posts/ddd-part-2-entities-value-objects-aggregates.html) — entities, value objects, aggregates and aggregate roots
3. [Services, events, repositories](https://vespaiach.com/posts/ddd-part-3-services-events-repositories.html) — logic that spans objects, and keeping storage out of the domain
4. [The layered architecture](https://vespaiach.com/posts/ddd-part-4-the-layered-architecture.html) — the four layers, the dependency rule, and use cases
5. [A walkthrough](https://vespaiach.com/posts/ddd-part-5-a-walkthrough.html) — one feature built end to end through every layer
6. [Common pitfalls](https://vespaiach.com/posts/ddd-part-6-common-pitfalls.html) — the modeling mistakes and the runtime traps
7. [Frequently asked questions](https://vespaiach.com/posts/ddd-part-7-faq.html) — the concepts people get tangled, and the two that quietly lose data

## The example app

Every example in this series comes from one application: an issue tracker, in the spirit of Linear or Jira, but deliberately smaller than either.

The scope is one team's working set. You create a project, invite people into it, file issues, give them a status and a priority, drag them into the order you want to work on them, group them under milestones, and assign them to someone — who then needs telling.

**What it does:**

| Area | What is in scope |
| --- | --- |
| Projects | A project has a key (`AP`), a name, and members with roles — owner, admin, member |
| Issues | Title, description, status, priority, assignee, and a position in a manually ordered list |
| Status | A small state machine: todo → in progress → in review → done, plus cancelled |
| Milestones | A named group of issues inside a project, optionally with a due date |
| Comments | Threaded discussion on an issue |
| Notifications | Email when you are assigned an issue or mentioned in a comment |

**What is deliberately out of scope:**

No cycles or sprints, no roadmaps, no sub-issues or dependencies, no custom fields, no workflow automation, no third-party integrations, no time tracking, no SLAs, no multi-workspace hierarchy. Linear has all of these. Carrying them would mean every example came with three paragraphs of setup before reaching the point.

### Why this app

It is small enough to hold in your head and still large enough to hit every problem DDD exists for:

- **A real state machine.** Issue status has rules about which transitions are legal — the standard example of a value object that carries behavior.
- **Ordering with its own algorithm.** Manual drag-and-drop ranking is logic that fits on no single issue, which is what domain services are for.
- **Permissions that span objects.** "Can this person assign this issue?" needs the project, the member, and the issue at once.
- **Side effects.** Assigning an issue should notify someone, and that notification must not be welded to the assignment.
- **Two obvious candidates for aggregate boundaries.** Projects and issues are clearly related and clearly separable — the decision of where to draw the line between them is the most instructive one in the whole series.

If your own domain is nothing like an issue tracker, the shapes still transfer. Most business software has entities with lifecycles, values with rules attached, permissions that span objects, and side effects that want decoupling.

## What DDD is, and why it exists

**What:** DDD is a software design philosophy that says your code structure should mirror your business structure — not your database schema or your framework conventions.

**Why it exists:** Without it, codebases develop what Eric Evans called a "Big Ball of Mud" — a system where everything is connected to everything, no one understands the full picture, and every change breaks something unexpected. DDD gives you a principled way to manage that complexity as the system grows.

## The two levels

|  | Strategic DDD | Tactical DDD |
| --- | --- | --- |
| **What** | How to divide a large system into independent parts | How to model code inside one part of the system |
| **Why** | So teams can work independently without stepping on each other | So individual components stay clean, testable, and aligned with business rules |

This post covers the strategic level. Parts 2 and 3 cover the tactical one, and Part 4 puts both into an architecture.

## 1.1 Subdomains

**What:** A subdomain is a distinct area of business capability. Every real-world business is made up of several of them — each with its own rules, vocabulary, and experts.

**Why:** Not all parts of your system are equally important or equally complex. Identifying subdomains lets you invest your best engineering effort where it matters most, and use off-the-shelf solutions where it does not.

```
Your project management app
├── Identity & access     ← Generic    → use a managed provider, never build this
├── Project management    ← Core      → your competitive advantage
├── Issue tracking        ← Core      → your competitive advantage
├── Collaboration         ← Supporting→ needed but not unique
├── Notifications         ← Supporting→ needed but not unique
└── Reporting             ← Supporting→ needed but not unique
```

| Type | What it means | Why it matters |
| --- | --- | --- |
| **Core** | Your unique business value. No one else does it exactly like you. | Invest your best engineers here. This is what users pay for. |
| **Supporting** | Necessary but not unique. Other companies need it too. | Build it carefully but don't over-engineer it. |
| **Generic** | Commodity. Solved problems: auth, email, payments. | Buy or use open source. Never build from scratch. |

## 1.2 Bounded contexts

**What:** A bounded context is an explicit boundary inside which a particular model — and its language — has one precise, consistent meaning. The same word can mean different things in different contexts, and that is intentional and correct.

**Why:** Without explicit boundaries, models bleed into each other. A "User" object starts carrying fields for authentication, project membership, notification preferences, billing, and analytics all at once. It becomes impossible to change one concern without breaking another. Bounded contexts prevent this by giving each concern its own clean model.

```
Identity context          Project context           Notification context
────────────────────      ────────────────────      ────────────────────
User =                    User =                    User =
  email                     Member                    Recipient
  password                  role (admin/member)       email
  verified: bool            joinedAt                  notifyOnAssignment
  mfaEnabled                permissions               notifyOnMention
```

**Why separate — Identity:** auth logic has nothing to do with project roles. Mixing them creates a fragile, bloated object.

**Why separate — Project:** project membership rules have nothing to do with login credentials.

**Why separate — Notification:** notification preferences have nothing to do with who can log in or what role they have.

They share only the `userId` — a thin reference, never the full object.

## 1.3 Ubiquitous language

**What:** Ubiquitous language is a shared, precise vocabulary agreed upon by developers and domain experts — used consistently everywhere: in conversations, documentation, tickets, and code.

**Why:** When developers use different words than domain experts, translation errors creep in. A domain expert says "assign a member to an issue" and a developer implements `insertUserRecord()`. The gap between those two descriptions is where bugs are born. Ubiquitous language closes that gap — the code reads like the business speaks.

| ❌ Developer language | ✅ Ubiquitous language | Why it matters |
| --- | --- | --- |
| `user_record` | `Member` | "Member" implies project membership — "user_record" does not |
| `ticket` | `Issue` | Your domain calls them issues — so should your code |
| `ticket_number` | `IssueNumber` (e.g. `AP-42`) | Carries format rules and project prefix |
| `reorder_position` | `Rank` | "Rank" is the domain word — implies ordering algorithm (Lexorank) |
| `task_group` | `Milestone` | Matches what users see in the UI |

## 1.4 Context map

**What:** A context map is a diagram showing how your bounded contexts relate to and communicate with each other — what data crosses boundaries and in what direction.

**Why:** Contexts cannot be completely isolated — they need to share data. Without a context map, those relationships are implicit and undocumented. Teams accidentally create tight coupling between contexts, making independent deployment and change impossible. The context map makes integration points explicit and intentional.

```
┌──────────────┐   userId  ┌──────────────┐   issueId    ┌──────────────┐
│   Identity   │──────────►│   Project    │─────────────►│    Issue     │
│   context    │           │   context    │              │   context    │
└──────────────┘           └──────────────┘              └──────┬───────┘
                                                                │
                                                    IssueAssigned event
                                                                │
                                                                ▼
                                                         ┌──────────────┐
                                                         │ Notification │
                                                         │   context    │──► email
                                                         └──────────────┘
```

**Why this shape:**

- Identity → Project: Project needs to know who the user is (`userId` only)
- Project → Issue: Issue needs to know which project it belongs to
- Issue → Notification: Notification reacts to things that happen in Issue via events — so Issue never directly calls Notification

---

**Next:** [Part 2](https://vespaiach.com/posts/ddd-part-2-entities-value-objects-aggregates.html) moves from strategy to code — entities, value objects, and the aggregate boundaries that hold them together.
