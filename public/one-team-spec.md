# Production Specification: One Team

> A single source of truth for product behavior, system contracts, constraints, and acceptance. Resolve blocking decisions and pass the implementation-readiness gate before asking an implementation agent to build production behavior.

**Section labels:** `optional` means omit the section when it does not apply; `if applicable` means keep the heading and record `Not applicable` with a rationale when the condition is absent.

## 1. Document control

- **Product:** One Team
- **Specification ID:** SPEC-001
- **Version:** 0.2.0
- **Current release:** R1
- **Status:** `Draft`
- **Last updated:** 2026-09-23
- **Decision owner:** Owner (holds all roles)
- **Product owner:** Owner
- **Technical owner:** Owner
- **Approvers required:** Owner (sole approver)

### 1.1 Authority and change rules

- This specification is authoritative for: all One Team product behavior, permissions, data rules, and acceptance criteria for R1.
- The architecture baseline is authoritative for: the stack recorded in section 11 (Next.js, PostgreSQL, Drizzle, single VPS).
- Repository guidance is authoritative for: engineering workflow and validation commands (not yet defined; see section 13.2).
- If two authoritative sources conflict, implementation is blocked until the decision owner records a resolution in the decision log.
- Requirement IDs are append-only. Do not reuse an ID after deletion or supersession.
- A change to an approved requirement must update its dependents in the requirements index, acceptance criteria, tests, data model, interfaces, and rollout plan.
- Changes to approved scope or behavior require decision-owner approval and renewed approval of the affected specification version before implementation continues on that change.

## 2. Readiness gate

| Check | Result | Evidence / N/A rationale |
| --- | --- | --- |
| Product, release scope, owners, and status are complete. | Yes | Sections 1, 3.4, 3.5 |
| No open decisions block planning or implementation. | Yes | Section 15: all blocking decisions resolved. DEC-019 open, non-blocking. |
| Current-release requirements are approved; IDs and references are valid. | No | All requirements are `Proposed`; IDs valid (section 4). |
| System behavior and failure/recovery paths are defined. | Yes | Section 7, WF-001 to WF-008; DEC-011, DEC-015 |
| Human-facing behavior and permission rules are defined where applicable. | Yes | Sections 5.2, 5.3, 5.4 |
| Machine contracts, domain rules, and data lifecycle are defined where applicable. | Yes | Contracts: N/A, no external API exposed (8.1). Domain types: Yes (6.1). Data lifecycle: Yes (6.2). |
| Security, privacy, and operational assessments are complete, including justified exclusions. | Yes | Sections 9 to 12; exclusions in DEC-003, DEC-010, DEC-017 |
| Every current-release requirement maps to acceptance criteria and planned verification. | Yes | Sections 4 and 13 |
| Required approvers have approved this version. | No | Not yet approved |

**Readiness decision:** `Ready for planning`
**Blocking decisions:** None

## 3. Problem, goals, and scope

### 3.1 Problem and value proposition

A small team tracks its work in Trello, which does not fit how the team works. Trello has no project-level layer: there is nowhere to keep milestones, a project description with its goals, or shared resources next to the work. Linear fits the workflow better but costs too much and is too complex for the team's non-technical members. One Team gives the team one simple place to track issues inside projects, with project context alongside, easy enough for non-technical members to use.

### 3.2 Feature overview

All features trace to no formal goal; see 3.3 for the rationale.

| Feature | Description | Primary actor(s) | Related goal(s) |
| --- | --- | --- | --- |
| Projects | Admin creates projects, adds people to them, archives and restores them. Projects are never permanently deleted. | Admin | — |
| Project description | Rich-text (basic markdown) description on each project, including its goals. | Admin, Member | — |
| Milestones | Named milestones with optional target date; issues link to them; progress is calculated. | Admin, Member | — |
| Project resources | Links, notes, and files stored on a project. | Admin, Member | — |
| Issues | Issues with title, description, status, priority, assignee, milestone, and due date. Deleted issues are hidden, and the Admin can restore them. | Admin, Member | — |
| Kanban board | One column per status; moving a card changes the issue's status. | Admin, Member | — |
| List view | Issues of a project as a list. | Admin, Member | — |
| Filtering and sorting | Narrow and order issues in both views. | Admin, Member | — |
| Comments | Comments on issues and on projects, with @mentions. | Admin, Member | — |
| Activity feeds | History of changes and comments on each issue and on each project. | Admin, Member | — |
| File attachments | Files on issues and on project resources. 10 MB, common types. | Admin, Member | — |
| Notifications | In-app and email notifications for assignment, comments, @mentions, and status changes. | Admin, Member | — |
| Accounts and sign-in | Admin invites users by email; users sign in; Admin can deactivate them. | Admin, Member | — |

### 3.3 Goals and measurable outcomes

Not applicable. One Team is an internal tool for the owner's team, with no timeline or tracked metrics. Success is the team using it in place of Trello.

### 3.4 In scope

- Projects: create, rename, archive, restore
- Project description (basic markdown), which also holds project goals
- Project membership managed by the Admin
- Milestones with optional target date, linked to issues, with calculated progress
- Project resources: link, note, or file
- Issues: create, edit, soft delete, Admin restore; title, description, status, priority, assignee, milestone, due date
- Kanban board with fixed statuses; drag to change status
- List view
- Filtering and sorting in both views
- Comments on issues and projects, with @mentions
- Activity feed on each issue and each project
- File attachments on issues and project resources
- In-app and email notifications
- User invitation, sign-in, deactivation
- Desktop browsers

### 3.5 Out of scope / non-goals

- Storing credentials or secrets for third-party accounts
- Integrations with Slack, GitHub, Google Drive (FOLLOWUP-001)
- Native mobile apps and mobile-browser layouts
- Importing data from Trello
- Permanently deleting projects
- Workspaces, teams, and multi-tenancy
- Custom or per-project statuses
- Real-time updates (changes appear on page reload)
- Attachments on comments
- Notifications for due dates
- Notification preferences (email is always on)
- Backups (DEC-003)

### 3.6 Assumptions and dependencies

- **ASSUMP-001:** The team is small (single-digit to low double-digit users), so one VPS is sufficient. Verify by the owner's headcount before launch.
- **DEP-001:** Email delivery service for sign-in links, invitations, and notification emails. Vendor chosen at implementation within DEC-011 constraints. Owner: Owner. Needed by: before implementation of REQ-001, REQ-002, and REQ-048.

## 4. Requirements index

Priority is not yet ranked (DEC-019). Target release determines scope; all rows below are R1.

| ID | Type | Canonical requirement | Priority | Target release | Status | Source / decision | Acceptance IDs | Verification IDs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REQ-001 | Functional | The system shall let the Admin invite a person by email address. | TBD | R1 | Proposed | Owner interview | AC-001, AC-081 | TEST-001 |
| REQ-002 | Functional | The system shall let an invited person activate their account from the invitation. | TBD | R1 | Proposed | Owner interview; DEC-001 | AC-002 | TEST-001 |
| REQ-003 | Functional | The system shall let the Admin deactivate a user, after which that user cannot sign in. | TBD | R1 | Proposed | Owner interview | AC-003 | TEST-001 |
| REQ-004 | Functional | The system shall let the Admin create a project with a required name and optional description. | TBD | R1 | Proposed | Owner interview | AC-004 | TEST-002 |
| REQ-005 | Functional | The system shall let the Admin add a user to a project. | TBD | R1 | Proposed | Owner interview | AC-005 | TEST-002 |
| REQ-006 | Functional | The system shall let the Admin remove a user from a project. | TBD | R1 | Proposed | Owner interview | AC-006 | TEST-002 |
| REQ-007 | Functional | The system shall let the Admin archive a project, making it read-only. | TBD | R1 | Proposed | Owner interview | AC-007 | TEST-002 |
| REQ-008 | Functional | The system shall let the Admin restore an archived project to editable. | TBD | R1 | Proposed | Owner interview | AC-008 | TEST-002 |
| REQ-009 | Functional | The system shall let users with project access edit the project description in basic markdown. | TBD | R1 | Proposed | Owner interview | AC-009 | TEST-004 |
| REQ-010 | Functional | The system shall provide no way to permanently delete a project. | TBD | R1 | Proposed | Owner interview | AC-010 | TEST-002 |
| REQ-011 | Functional | The system shall let users with project access create an issue with a required title and optional markdown description. | TBD | R1 | Proposed | Owner interview | AC-011 | TEST-004 |
| REQ-012 | Functional | The system shall give each issue one status from: Backlog, Todo, In progress, In review, Done, Canceled. | TBD | R1 | Proposed | Owner interview; DEC-013 resolved | AC-012 | TEST-004 |
| REQ-013 | Functional | The system shall give each issue one priority from: None, Low, Medium, High, Urgent, defaulting to None. | TBD | R1 | Proposed | Owner interview | AC-013 | TEST-004 |
| REQ-014 | Functional | The system shall allow an optional single assignee chosen from active users with access to the project. | TBD | R1 | Proposed | Owner interview; DEC-018 resolved | AC-014 | TEST-004 |
| REQ-015 | Functional | The system shall allow an optional milestone chosen from the issue's project. | TBD | R1 | Proposed | Owner interview | AC-015 | TEST-004 |
| REQ-016 | Functional | The system shall allow an optional due date on an issue. | TBD | R1 | Proposed | Owner interview | AC-016 | TEST-004 |
| REQ-017 | Functional | The system shall let users with project access edit any field of any issue in the project. | TBD | R1 | Proposed | Owner interview | AC-017 | TEST-004 |
| REQ-018 | Functional | The system shall let users with project access delete an issue by hiding it, without removing its data. | TBD | R1 | Proposed | Owner interview | AC-018 | TEST-005 |
| REQ-019 | Functional | The system shall let the Admin list deleted issues. | TBD | R1 | Proposed | Owner interview | AC-019 | TEST-005 |
| REQ-020 | Functional | The system shall let the Admin restore a deleted issue. | TBD | R1 | Proposed | Owner interview | AC-020 | TEST-005 |
| REQ-021 | Functional | The system shall show a project's issues on a kanban board with one column per status. | TBD | R1 | Proposed | Owner interview; DEC-009 resolved | AC-021 | TEST-006 |
| REQ-022 | Functional | The system shall change an issue's status when its card is moved to another column. | TBD | R1 | Proposed | Owner interview | AC-022 | TEST-006 |
| REQ-023 | Functional | The system shall show a project's issues in a list view. | TBD | R1 | Proposed | Owner interview | AC-023 | TEST-006 |
| REQ-024 | Functional | The system shall let users filter issues in the board and list views. | TBD | R1 | Proposed | Owner interview; DEC-014 resolved | AC-024 | TEST-006 |
| REQ-025 | Functional | The system shall let users sort issues in the board and list views. | TBD | R1 | Proposed | Owner interview; DEC-014 resolved | AC-025 | TEST-006 |
| REQ-026 | Functional | The system shall warn a user who saves an issue changed by someone else since they loaded it, let them reload, and keep their unsaved input. | TBD | R1 | Proposed | Owner interview | AC-026 | TEST-007 |
| REQ-027 | Functional | The system shall show an activity feed on each issue listing field changes and comments with actor and time. | TBD | R1 | Proposed | Owner interview | AC-027 | TEST-008 |
| REQ-028 | Functional | The system shall let users with project access comment on an issue in basic markdown. | TBD | R1 | Proposed | Owner interview; DEC-020 resolved | AC-028 | TEST-009 |
| REQ-029 | Functional | The system shall let users with project access comment on a project in basic markdown. | TBD | R1 | Proposed | Owner interview; DEC-020 resolved | AC-029 | TEST-009 |
| REQ-030 | Functional | The system shall let a commenter @mention active users with access to the project. | TBD | R1 | Proposed | Owner interview; DEC-018 resolved | AC-030 | TEST-009 |
| REQ-031 | Functional | The system shall let a comment's author edit that comment. | TBD | R1 | Proposed | DEC-002 | AC-031 | TEST-009 |
| REQ-032 | Functional | The system shall let a comment's author delete that comment. | TBD | R1 | Proposed | DEC-002; DEC-015 resolved | AC-032 | TEST-009 |
| REQ-033 | Functional | The system shall show a project activity feed of project changes, issue event summaries, and project comments in time order. | TBD | R1 | Proposed | Owner interview | AC-033 | TEST-008 |
| REQ-034 | Functional | The system shall let users with project access create a milestone with a required name, optional description, and optional target date. | TBD | R1 | Proposed | Owner interview | AC-034 | TEST-010 |
| REQ-035 | Functional | The system shall let users with project access edit a milestone. | TBD | R1 | Proposed | Owner interview | AC-035 | TEST-010 |
| REQ-036 | Functional | The system shall let users with project access delete a milestone. | TBD | R1 | Proposed | Owner interview; DEC-015 resolved | AC-036 | TEST-010 |
| REQ-037 | Functional | The system shall show milestone progress as Done issues over linked issues, excluding Canceled. | TBD | R1 | Proposed | Owner interview | AC-037 | TEST-010 |
| REQ-038 | Functional | The system shall let users with project access add a resource of type link, note, or file. | TBD | R1 | Proposed | Owner interview | AC-038 | TEST-011 |
| REQ-039 | Functional | The system shall let users with project access edit a resource. | TBD | R1 | Proposed | Owner interview | AC-039 | TEST-011 |
| REQ-040 | Functional | The system shall let users with project access delete a resource. | TBD | R1 | Proposed | Owner interview; DEC-015 resolved | AC-040 | TEST-011 |
| REQ-041 | Functional | The system shall let users with project access attach files to an issue. | TBD | R1 | Proposed | Owner interview | AC-041 | TEST-011 |
| REQ-042 | Functional | The system shall reject any uploaded file larger than 10 MB with a visible message. | TBD | R1 | Proposed | Owner interview | AC-042 | TEST-011 |
| REQ-043 | Functional | The system shall notify a user when they are assigned to an issue. | TBD | R1 | Proposed | Owner interview; DEC-006 resolved | AC-043 | TEST-012 |
| REQ-044 | Functional | The system shall notify an issue's assignee and creator when a comment is added to it. | TBD | R1 | Proposed | Owner interview; DEC-006 resolved | AC-044 | TEST-012 |
| REQ-045 | Functional | The system shall notify a user when they are @mentioned in an issue or project comment. | TBD | R1 | Proposed | Owner interview; DEC-006 resolved | AC-045 | TEST-012 |
| REQ-046 | Functional | The system shall notify an issue's assignee and creator when its status changes. | TBD | R1 | Proposed | Owner interview; DEC-006 resolved | AC-046 | TEST-012 |
| REQ-047 | Functional | The system shall show each user a list of their in-app notifications. | TBD | R1 | Proposed | Owner interview | AC-047 | TEST-012 |
| REQ-048 | Functional | The system shall send each notification by email. | TBD | R1 | Proposed | Owner interview; DEC-007 resolved; DEC-011 | AC-048 | TEST-012 |
| REQ-049 | Functional | The system shall show the Admin all projects, including archived ones. | TBD | R1 | Proposed | Owner interview | AC-049 | TEST-002 |
| REQ-050 | Functional | The system shall let an Admin promote a Member to Admin. | TBD | R1 | Proposed | DEC-005 | AC-067 | TEST-002 |
| REQ-051 | Functional | The system shall let an Admin demote another Admin to Member. | TBD | R1 | Proposed | DEC-005 | AC-068 | TEST-002 |
| REQ-052 | Functional | The system shall not notify a user about an action they performed themselves. | TBD | R1 | Proposed | DEC-006 | AC-070 | TEST-012 |
| REQ-053 | Functional | The system shall let an Admin reactivate a deactivated user, restoring their previous role and project memberships. | TBD | R1 | Proposed | DEC-008 | AC-071 | TEST-001 |
| REQ-054 | Functional | The system shall tell a user when their sign-in email could not be sent, so they can try again. | TBD | R1 | Proposed | DEC-011 | AC-072 | TEST-001 |
| REQ-055 | Functional | The system shall let an Admin rename a project. | TBD | R1 | Proposed | DEC-012 | AC-074 | TEST-002 |
| REQ-056 | Functional | The system shall set a new issue's status to Backlog. | TBD | R1 | Proposed | DEC-013 | AC-075 | TEST-004 |
| REQ-057 | Functional | The system shall let users with project access remove an attachment from an issue. | TBD | R1 | Proposed | DEC-015 | AC-076 | TEST-011 |
| SEC-001 | Security | The system shall require an authenticated session for every page and endpoint except sign-in and invitation acceptance. | TBD | R1 | Proposed | Owner interview; DEC-001 | AC-050 | TEST-003 |
| SEC-002 | Security | The system shall respond "not found" when a Member requests any resource of a project they are not a member of. | TBD | R1 | Proposed | Owner interview | AC-051 | TEST-003 |
| SEC-003 | Security | The system shall reject Admin-only actions from Members with a "not allowed" error. | TBD | R1 | Proposed | Owner interview | AC-052 | TEST-003 |
| SEC-004 | Security | The system shall reject edits or deletes of a comment by anyone other than its author, including the Admin. | TBD | R1 | Proposed | DEC-002 | AC-053 | TEST-003 |
| SEC-005 | Security | The system shall end all active sessions of a user when they are deactivated. | TBD | R1 | Proposed | Owner interview | AC-054 | TEST-001 |
| SEC-006 | Security | The system shall accept uploads only of allowlisted types, checked on the server by file content. | TBD | R1 | Proposed | Owner interview | AC-055 | TEST-011 |
| SEC-007 | Security | The system shall serve uploaded files only to users with access to the owning project. | TBD | R1 | Proposed | Owner interview | AC-056 | TEST-011 |
| SEC-008 | Security | The system shall render markdown with raw HTML and scripts removed. | TBD | R1 | Proposed | Derived from markdown scope | AC-057 | TEST-013 |
| SEC-009 | Security | The system shall reject every write to an archived project on the server. | TBD | R1 | Proposed | Owner interview | AC-058 | TEST-002 |
| SEC-010 | Security | The system shall accept each sign-in link once and only within 15 minutes of issue. | TBD | R1 | Proposed | DEC-001 | AC-064 | TEST-001 |
| SEC-011 | Security | The system shall reject invitation links more than 7 days old. | TBD | R1 | Proposed | DEC-001 | AC-065 | TEST-001 |
| SEC-012 | Security | The system shall end a session 30 days after sign-in. | TBD | R1 | Proposed | DEC-001 | AC-066 | TEST-001 |
| SEC-013 | Security | The system shall reject any demotion or deactivation that would leave no active Admin. | TBD | R1 | Proposed | DEC-005 | AC-069 | TEST-002 |
| SEC-014 | Security | The system shall serve all traffic over HTTPS and redirect HTTP to HTTPS. | TBD | R1 | Proposed | DEC-017 | AC-082 | TEST-015 |
| SEC-015 | Security | The system shall keep secrets in a VPS environment file readable only by the app user and outside the repository. | TBD | R1 | Proposed | DEC-017 | AC-083 | TEST-015 |
| SEC-016 | Security | The system shall send at most 5 sign-in links per email address per 15 minutes. | TBD | R1 | Proposed | DEC-017 | AC-084 | TEST-001 |
| SEC-017 | Security | The system shall set session cookies as HttpOnly, Secure, and SameSite=Lax. | TBD | R1 | Proposed | DEC-017 | AC-085 | TEST-003 |
| DATA-001 | Data | The system shall retain deleted issues, with their comments, attachments, and activity, indefinitely. | TBD | R1 | Proposed | Owner interview | AC-059 | TEST-005 |
| DATA-002 | Data | The system shall retain a deactivated user's account and authored content. | TBD | R1 | Proposed | Owner interview | AC-060 | TEST-001 |
| DATA-003 | Data | The system shall record each activity event with actor, timestamp, and change, and never alter it afterwards. | TBD | R1 | Proposed | Owner interview | AC-061 | TEST-008 |
| DATA-004 | Data | The system shall store uploaded files on the VPS disk and their metadata in PostgreSQL. | TBD | R1 | Proposed | Owner interview | AC-062, AC-080 | TEST-011 |
| DATA-005 | Data | The system shall permanently remove a deleted comment's text and keep a "comment deleted" placeholder with author and time. | TBD | R1 | Proposed | DEC-015 | AC-077 | TEST-009 |
| DATA-006 | Data | The system shall delete a resource's file from disk when the resource is deleted. | TBD | R1 | Proposed | DEC-015 | AC-078 | TEST-011 |
| DATA-007 | Data | The system shall delete an attachment's file from disk when it is removed from an issue. | TBD | R1 | Proposed | DEC-015 | AC-079 | TEST-011 |
| SEC-018 | Security | The system shall never write sign-in tokens, secrets, or comment text to logs. | TBD | R1 | Proposed | DEC-016 | AC-088 | TEST-016 |
| OPS-001 | Operations | The system shall retry a failed notification or invitation email up to 3 times over about 10 minutes, then drop and log it. | TBD | R1 | Proposed | DEC-011 | AC-073 | TEST-012 |
| OPS-002 | Operations | The system shall write structured logs to a file on the VPS and delete entries older than 14 days. | TBD | R1 | Proposed | DEC-016 | AC-089 | TEST-016 |
| OPS-003 | Operations | The system shall be watched by an external uptime monitor that emails the owner when the site is unreachable. | TBD | R1 | Proposed | DEC-016 | AC-090 | TEST-016 |
| OPS-004 | Operations | The system shall use only additive database migrations so the previous release runs on the current schema. | TBD | R1 | Proposed | DEC-016 | AC-091 | TEST-016 |
| NFR-001 | Non-functional | The system shall work on current desktop versions of Chrome, Edge, Firefox, and Safari. | TBD | R1 | Proposed | Owner interview | AC-063 | TEST-014 |
| NFR-002 | Non-functional | The system shall load pages in under 2 seconds in normal team use. | TBD | R1 | Proposed | DEC-016 | AC-086 | TEST-014 |
| NFR-003 | Non-functional | The system shall let users complete every core journey using only the keyboard. | TBD | R1 | Proposed | DEC-016 | AC-087 | TEST-014 |

**Index rules**

- Use one ID for one independently testable obligation; split compound "and" statements.
- Use `Must`, `Should`, or `Could` for prioritization. Priority alone neither includes nor excludes a requirement from a release.
- Target release determines scope. Agents implement only approved requirements assigned to the current release; `Backlog` and other releases are excluded. All selected requirements are commitments regardless of priority.
- Deferring a selected requirement, including a `Must`, requires a decision-owner-approved `DEC-###` recording the reason, impact, and revised target release. Update dependent scope and obtain renewed specification approval; explanation alone is not approval.
- Use `Proposed`, `Approved`, `Implemented`, `Verified`, or `Superseded` status.
- Every current-release requirement needs at least one acceptance criterion and one defined verification method before implementation, regardless of priority. Backlog entries may leave these pending explicitly.
- `Implemented` means the change exists; `Verified` requires passing evidence for every linked acceptance criterion. Neither status by itself proves release approval.
- Define each requirement once in this index; detailed sections reuse its ID. Define every referenced `AC-###` and `TEST-###` in section 13 and keep both directions of the mapping consistent.
- Record removals and replacements as superseded rows; never erase historical meaning.

## 5. Actors, permissions, and user stories

### 5.1 Actors and systems

| Actor / system | Type | Purpose | Trust level | Allowed capabilities |
| --- | --- | --- | --- | --- |
| Admin | Human | Runs the app for the team; one or more, all with equal rights | Trusted | Everything a Member can do in any project, plus the Admin-only rows in 5.2 |
| Member | Human | Team member working in assigned projects | Trusted within assigned projects | Member rows in 5.2, limited to projects they belong to |
| Anonymous visitor | Human | Not signed in | Untrusted | Sign-in and invitation acceptance only |
| Email delivery service | External system | Sends invitations and notification emails | External | Receives outbound email requests (DEP-001) |
| VPS file storage | Internal system | Holds uploaded files on disk | Internal | Read and write by the app only |

### 5.2 Permission matrix

| Capability | Anonymous | Member | Admin | Resource scope | Denied behavior |
| --- | --- | --- | --- | --- | --- |
| Invite users | Deny | Deny | Allow | App | Not allowed |
| Deactivate users | Deny | Deny | Allow (not the last active Admin) | App | Not allowed |
| Reactivate users | Deny | Deny | Allow | App | Not allowed |
| Promote a Member to Admin | Deny | Deny | Allow | App | Not allowed |
| Demote an Admin to Member | Deny | Deny | Allow (not the last active Admin) | App | Not allowed |
| Create projects | Deny | Deny | Allow | App | Not allowed |
| Rename projects | Deny | Deny | Allow | Project | Not allowed |
| Archive and restore projects | Deny | Deny | Allow | Project | Not allowed |
| Add or remove users on a project | Deny | Deny | Allow | Project | Not allowed |
| See a project and its contents | Deny | Allow | Allow | Member: own projects; Admin: all | Not found |
| Create, edit, move, delete issues | Deny | Allow | Allow | Project | Not found (other projects) |
| View and restore deleted issues | Deny | Deny | Allow | Project | Not allowed |
| Edit project description | Deny | Allow | Allow | Project | Not found (other projects) |
| Create, edit, delete milestones | Deny | Allow | Allow | Project | Not found (other projects) |
| Remove attachments from issues | Deny | Allow | Allow | Project | Not found (other projects) |
| Add, edit, delete resources | Deny | Allow | Allow | Project | Not found (other projects) |
| Comment, @mention, attach files to issues | Deny | Allow | Allow | Project | Not found (other projects) |
| Edit or delete a comment | Deny | Author only | Author only | Comment | Not allowed |
| Any write in an archived project | Deny | Deny | Deny (restore first) | Project | Not allowed, project is archived |

Unauthenticated requests redirect to sign-in.

### 5.3 User stories and workflow outcomes

Shared outcomes for every story below unless stated:

- **Unauthenticated outcome:** redirected to sign-in; nothing changes.
- **Unauthorized outcome:** project outside the user's membership shows "not found"; Admin-only action shows "not allowed"; nothing changes.
- **Invalid-input outcome:** the form stays open with input preserved and the invalid field marked.
- **Dependency-failure outcome:** database failure shows a generic error with input preserved. Email failure never blocks the user action, except sign-in, which shows "Couldn't send the email, try again" (REQ-054).

- **US-001:** As the Admin, I want to invite a teammate by email, so that they can join One Team.
  - **Success outcome:** invitation sent; invitee listed as pending.
- **US-002:** As the Admin, I want to create a project and add teammates to it, so that they can work in it.
  - **Success outcome:** project appears for the Admin and for each added Member.
- **US-003:** As a Member, I want to create an issue with a title, so that work is tracked.
  - **Success outcome:** issue appears on the board in its status column and in the list view.
- **US-004:** As a Member, I want to drag a card to another column, so that the issue's status updates.
  - **Success outcome:** card stays in the new column; status change appears in the issue feed; assignee and creator are notified.
- **US-005:** As a Member, I want to comment and @mention a teammate, so that they see my question.
  - **Success outcome:** comment appears in the feed; mentioned user gets in-app and email notifications.
- **US-006:** As a Member, I want to keep links, notes, and files on the project, so that the team finds project material in one place.
  - **Success outcome:** resource appears on the project overview, newest first.
- **US-007:** As the Admin, I want to archive a finished project, so that it stops cluttering active work but stays readable.
  - **Success outcome:** project shows as archived and read-only to its Members.
- **US-008:** As the Admin, I want to restore an issue someone deleted by mistake, so that no work is lost.
  - **Success outcome:** issue returns to its previous status column.

### 5.4 User interface behavior

Common to all screens: desktop browsers only (NFR-001). Changes by others appear on reload; there is no live update. Keyboard use required (NFR-003); no formal accessibility standard.

- **Screen: Sign-in and invitation acceptance** (REQ-002, SEC-001). User enters email and receives a magic link; unknown or deactivated emails get the same neutral "check your email" message. Expired or used links show "This link has expired" with a button to request a new one.
- **Screen: Project list** (REQ-004, REQ-049, SEC-002)
  - **States:** Member sees their projects; Admin sees all, with archived ones marked. Empty state: Member sees "You haven't been added to a project yet"; Admin sees a create-project action.
- **Screen: Project overview** (REQ-009, REQ-033 to REQ-040)
  - **Content:** description, milestones with progress, resources newest first, and the project activity feed with a comment box.
  - **Archived:** all edit controls hidden and an "Archived" banner shown; the Admin sees a Restore action.
- **Screen: Board** (REQ-021, REQ-022, REQ-024, REQ-025)
  - **Columns:** all six status columns always shown, in order Backlog, Todo, In progress, In review, Done, Canceled (DEC-009).
  - **Drag:** dropping a card saves immediately; on failure the card returns to its original column with an error message.
- **Screen: List view** (REQ-023 to REQ-025)
  - **Behavior:** one row per issue with status shown as a column. Same filters and sort as the board.
- **Filters and sort (both views):** filter by assignee, priority, milestone (combinable). Sort by priority, due date, or created date; default created date, newest first. Issues without a due date sort last.
- **Screen: Issue detail** (REQ-011 to REQ-018, REQ-026 to REQ-028, REQ-041)
  - **Content:** all fields, attachments, and the activity feed interleaved with comments.
  - **Submission and recovery:** the save control is disabled while pending. On a stale save (REQ-026), a warning offers "Reload" and keeps the typed text available to copy.
  - **Unsaved changes:** leaving with unsaved edits prompts to discard or stay.
- **Screen: Notifications** (REQ-047)
  - **Behavior:** list of notifications, newest first, linking to the issue or project.
- **Screen: Admin, Users** (REQ-001, REQ-003, REQ-050, REQ-051)
  - **Content:** active, pending, and deactivated users, each with their role, and actions to promote or demote.
- **Screen: Admin, Deleted issues** (REQ-019, REQ-020)
  - **Behavior:** per project, with a Restore action.

## 6. Domain model and data lifecycle

### 6.1 Domain types and transformation rules

| Entity | Purpose | Required fields | Relationships | Invariants / uniqueness |
| --- | --- | --- | --- | --- |
| User | Person with access | email: text, unique; name: text; role: Admin/Member; state: pending/active/deactivated | Has many ProjectMembership | At least one active Admin at all times (DEC-005) |
| Invitation | Pending access for an email | email; invited_by; created_at; expires_at | Belongs to User (Admin) | Expires 7 days after sending; resend issues a new link |
| Project | Container for work | name: text, required; description: markdown, nullable; archived_at: timestamp, nullable | Has many issues, milestones, resources, comments, memberships | Never hard-deleted |
| ProjectMembership | User access to a project | user_id; project_id | Joins User and Project | Unique (user_id, project_id) |
| Issue | Unit of work | title: text, required; description: markdown, nullable; status: enum of 6; priority: enum of 5, default None; assignee_id: nullable; milestone_id: nullable; due_date: date, nullable; creator_id; created_at; updated_at; version: int; deleted_at: nullable | Belongs to Project; optional Milestone in same project | Milestone must be in the same project; assignee must have project access |
| Milestone | Grouping of issues toward a target | name: required; description: nullable; target_date: date, nullable | Belongs to Project; has many Issues | Progress derived, not stored |
| Resource | Project reference material | title: required; type: link/note/file; url (link); body markdown (note); attachment_id (file) | Belongs to Project | Exactly one payload matching type |
| Attachment | Uploaded file | filename; mime_type; size_bytes ≤ 10 MB; storage_path; uploaded_by; created_at | Belongs to Issue or Resource | Type in allowlist |
| Comment | Discussion | body: markdown, required; author_id; created_at; edited_at: nullable | Belongs to Issue or Project | Editable only by author |
| ActivityEvent | History record | actor_id; timestamp; subject (issue/project); change description | Belongs to Issue or Project | Append-only |
| Notification | Message to a user | recipient_id; type; link target; created_at; read_at: nullable | Belongs to User | One per recipient per event |

- **Transformations:** markdown is stored as source and rendered sanitized (SEC-008). Milestone progress = count(status = Done) / count(status ≠ Canceled) over linked, non-deleted issues; 0 linked issues shows "No issues."
- **Upload allowlist (proposed, confirm in review):** PNG, JPEG, GIF, WebP, PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, CSV.

### 6.2 Persistent data lifecycle and retention

- **Creation:** users via invitation; projects by the Admin; everything else by users with project access. Each write is a single database transaction with its activity event.
- **States:** User: pending → active ↔ deactivated (Admin reactivates, REQ-053). Project: active ↔ archived. Issue: live ↔ deleted (Admin restores).
- **Update authority:** per 5.2. Activity events are never updated.
- **Deletion/anonymization:** issues soft-deleted (DATA-001). Projects never deleted. Users deactivated, never deleted (DATA-002). Comments: text removed, placeholder kept (DATA-005). Milestones: removed; linked issues unlinked (REQ-036). Resources and removed attachments: record and file deleted permanently (DATA-006, DATA-007). Attachments of a soft-deleted issue are kept with it (DATA-001).
- **Retention:** indefinite for all data. No purge mechanism in R1.
- **Audit history:** ActivityEvent covers issue and project changes. Sign-ins, role changes, and deactivations are written to application logs with actor and time, kept 14 days (OPS-002).
- **Migration/backfill:** Not applicable. R1 is a new system with no existing data; Trello import is out of scope.

## 7. Functional requirements and workflows

### WF-001: Invite and activate a user

- **Related requirements:** REQ-001, REQ-002, SEC-001
- **Trigger:** Admin submits an email address.
- **Preconditions:** Admin signed in; email not already an active user.
- **Normal sequence:**
  1. System creates an Invitation and a pending User.
  2. System sends the invitation email.
  3. Invitee opens the magic link in the invitation and is signed in (DEC-001).
  4. User becomes active and lands on the project list.
- **Postconditions:** active user with no project memberships.
- **Invalid input:** malformed email is rejected inline.
- **Duplicate/concurrent request:** an existing pending invitation is re-sent, not duplicated. An existing active user is rejected with "already a member."
- **Timeout/retry:** invitation email retries up to 3 times over about 10 minutes (OPS-001).
- **Partial failure:** if email fails, the invitation still exists and the Admin can resend.
- **Observability:** logged with request ID and actor (OPS-002).

### WF-002: Deactivate a user

- **Related requirements:** REQ-003, SEC-005, DATA-002
- **Trigger:** Admin deactivates a user.
- **Normal sequence:**
  1. User state becomes deactivated.
  2. All their sessions are revoked.
  3. They are hidden from assignee and @mention pickers; existing assignments still show their name (DEC-018).
- **Postconditions:** content, assignments, and history remain.
- **Invalid input:** deactivating the last active Admin is rejected (DEC-005).
- **Duplicate/concurrent request:** deactivating an already deactivated user has no effect.
- **Timeout/retry:** Not applicable; single database transaction.
- **Partial failure:** session revocation happens in the same transaction as the state change.
- **Observability:** logged with request ID and actor (OPS-002).

### WF-003: Create and edit an issue

- **Related requirements:** REQ-011 to REQ-017, REQ-026, REQ-027, REQ-043, REQ-046
- **Trigger:** user submits the new-issue or edit form.
- **Preconditions:** user has access to the project; project not archived.
- **Normal sequence:**
  1. System validates fields.
  2. On edit, system checks that the submitted version matches the stored version.
  3. System saves, increments the version, and writes activity events for each changed field.
  4. System creates notifications for assignment or status change.
- **Postconditions:** issue visible in board and list; feed updated.
- **Invalid input:** empty title, a milestone from another project, or an assignee without access are each rejected with a field error.
- **Duplicate/concurrent request:** version mismatch shows a warning with Reload, and the user's input is preserved (REQ-026).
- **Timeout/retry:** a database failure shows an error; nothing is saved.
- **Partial failure:** notification and activity writes share the save transaction. Email sending happens after commit (DEC-011).
- **Observability:** logged with request ID and actor (OPS-002).

### WF-004: Move a card on the board

- **Related requirements:** REQ-022, REQ-026, REQ-046
- **Trigger:** user drops a card in another column.
- **Normal sequence:** same as WF-003 with only the status field changing.
- **Duplicate/concurrent request:** if the issue changed since the board loaded, the move is rejected, the card returns to its column, and a prompt asks the user to reload.
- **Partial failure:** on save failure, the card returns to its original column with an error.

### WF-005: Delete and restore an issue

- **Related requirements:** REQ-018 to REQ-020, DATA-001
- **Trigger:** user deletes an issue; Admin restores it.
- **Normal sequence:**
  1. Delete sets deleted_at and writes an activity event.
  2. The issue disappears from all views, filters, and milestone progress.
  3. Admin restore clears deleted_at and writes an activity event.
- **Postconditions:** a restored issue returns with all fields, comments, and attachments.
- **Duplicate/concurrent request:** deleting an already deleted issue has no effect.

### WF-006: Comment and @mention

- **Related requirements:** REQ-028 to REQ-032, REQ-044, REQ-045
- **Trigger:** user posts a comment on an issue or project.
- **Normal sequence:**
  1. System saves the comment and parses @mentions.
  2. System creates notifications for mentioned users (and, on issues, for the assignee and creator).
- **Invalid input:** an empty comment is rejected. A mention of a user without project access is left as plain text and does not notify.
- **Duplicate/concurrent request:** a user who is both mentioned and the assignee gets one notification. The actor is never notified of their own action (REQ-052).

### WF-007: Upload a file

- **Related requirements:** REQ-038, REQ-041, REQ-042, SEC-006, SEC-007, DATA-004
- **Trigger:** user attaches a file to an issue or creates a file resource.
- **Normal sequence:**
  1. System checks size ≤ 10 MB and content type against the allowlist.
  2. System writes the file to VPS disk under a generated name.
  3. System stores the metadata.
- **Invalid input:** oversize or disallowed type is rejected with a message naming the limit.
- **Partial failure:** if the metadata write fails after the disk write, the orphan file is removed.
- **Serving:** files are downloaded only through an authorized route (SEC-007).

### WF-008: Archive and restore a project

- **Related requirements:** REQ-007, REQ-008, SEC-009
- **Trigger:** Admin archives or restores a project.
- **Normal sequence:**
  1. System sets or clears archived_at and writes an activity event.
  2. While archived, all writes to the project and its contents are rejected, and no notifications are generated.

## 8. Interfaces and contracts

### 8.1 API / command / event catalogue

Not applicable. One Team exposes no API, event, or file exchange to other systems. Its HTTP endpoints serve only its own Next.js frontend and are not a published contract.

### 8.2 External dependencies

| Dependency | Used for | Failure modes | Timeout | Retry policy | Fallback | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| Email delivery service (DEP-001), vendor chosen at implementation per DEC-011 | Sign-in links, invitations, notification emails | Outage, rejection, slow | Set at implementation | Sign-in: none, user retries. Others: up to 3 retries over ~10 minutes, then drop and log | In-app notification still delivered; Admin can resend invitations | Owner |

## 9. Security, privacy, and abuse controls

- **Authentication:** magic link by email (DEC-001); no passwords stored. Sign-in links are single use and expire after 15 minutes (SEC-010). Invitations expire after 7 days and can be resent (SEC-011). Sessions last 30 days (SEC-012). Sessions revoked on deactivation (SEC-005).
- **Authorization:** enforced on the server for every request: project membership (SEC-002), role (SEC-003), comment authorship (SEC-004), archived state (SEC-009).
- **Secrets:** database password, email API key, and session secret in an environment file on the VPS, readable only by the app's OS user, never committed to the repository (SEC-015). Rotation: manual, by the owner.
- **Input/output safety:** sanitized markdown (SEC-008); upload size and type checks (REQ-042, SEC-006); files served with download headers through an authorized route (SEC-007).
- **Rate limiting and abuse:** at most 5 sign-in link requests per email address per 15 minutes; excess requests get the same neutral message and send nothing (SEC-016).
- **Privacy:** personal data is limited to names and email addresses of team members. Resource notes may contain sensitive text if users paste it; accepted without a warning (DEC-010, LIMIT-005).
- **Encryption:** in transit, HTTPS only with HTTP redirected (SEC-014); session cookies HttpOnly, Secure, SameSite=Lax (SEC-017). At rest: not applicable in R1, excluded by owner decision (DEC-017).
- **Auditability:** activity events for issues and projects (DATA-003). Security events in application logs, 14 days (OPS-002).
- **Threats and mitigations:** cross-project data exposure → SEC-002, SEC-007. Script injection → SEC-008. Malicious upload → SEC-006. Deactivated user access → SEC-005. Data loss → accepted risk (LIMIT-002).

## 10. Non-functional requirements

| ID | Area | Requirement | Target / bound | Measurement and environment |
| --- | --- | --- | --- | --- |
| NFR-001 | Browser support | Works on current desktop browsers | Chrome, Edge, Firefox, Safari, current versions | Manual check per TEST-014 |
| NFR-002 | Performance | Page load time in normal team use | Under 2 seconds | Manual timing on production with real data, per TEST-014; no load testing |
| NFR-003 | Accessibility | All actions usable by keyboard | Every core journey completes without a mouse | Manual check per TEST-014 |

- **Availability:** no target; an uptime monitor alerts the owner (OPS-003).
- **Scalability:** Not applicable beyond ASSUMP-001; one VPS for a small team.
- **Accessibility:** no formal standard in R1 (DEC-016); keyboard use required (NFR-003). Card moves on the board need a keyboard alternative to dragging.
- **Mobile/responsive:** Not applicable; desktop only by owner decision.
- **Localization/timezones:** English only (DEC-016). Due dates and target dates are calendar dates without time; timestamps are displayed in the viewer's browser timezone.
- **Data residency:** Not applicable; single VPS chosen by owner.
- **Recovery point / recovery time objective:** none; no backups (DEC-003, LIMIT-002).
- **Maintenance windows:** Not applicable; internal tool, downtime accepted.

## 11. Architecture and implementation boundaries

- **Required stack:** Next.js; PostgreSQL; Drizzle ORM; hosted on a single VPS.
- **Existing repository touchpoints:** Not applicable; new project.
- **Component boundaries:** authorization checks live in one server-side layer used by every read and write. No client-side-only permission checks.
- **Consistency/transaction rules:** each user action and its activity events and notification records commit in one transaction. Issue edits use a version number for stale-write detection (REQ-026). Email is sent after commit.
- **Deployment environments:** local development and production VPS only.
- **Configuration and feature flags:** none planned. Secrets in a VPS environment file (SEC-015).
- **Real-time:** none; pages show current data on load.
- **File storage:** VPS local disk (DATA-004).
- **Explicitly deferred architecture decisions:** DEC-011 (email vendor, delegated).

## 12. Observability, operations, and recovery

- **Structured logs:** written to a file on the VPS, kept 14 days (OPS-002). Sign-in tokens, secrets, and comment text never logged (SEC-018).
- **Metrics:** Not applicable in R1; small team, no targets beyond NFR-002.
- **Traces/correlation:** Not applicable in R1; single server process. Log entries include a request ID.
- **Alerts:** free external uptime monitor emails the owner when the site is unreachable (OPS-003). No other alerts.
- **Dashboards:** Not applicable; none in R1.
- **Queue/job operations:** notification and invitation emails are sent after commit with up to 3 retries over about 10 minutes, then dropped and logged (OPS-001). No dead-letter or replay in R1.
- **Backup and restore:** Not applicable in R1 by owner decision (DEC-003). Accepted risk: total data loss on VPS failure (LIMIT-002).
- **Incident behavior:** owner investigates using logs; team told directly. No status page.

## 13. Acceptance and verification

| Acceptance ID | Requirement IDs | Given / when / then | Verification IDs |
| --- | --- | --- | --- |
| AC-001 | REQ-001 | Given the Admin, when they invite a valid email, then an invitation exists and an email is queued to that address | TEST-001 |
| AC-002 | REQ-002 | Given a valid invitation, when the invitee completes activation, then they are active and can sign in | TEST-001 |
| AC-003 | REQ-003 | Given an active user, when the Admin deactivates them, then their sign-in attempts fail | TEST-001 |
| AC-004 | REQ-004 | Given the Admin, when they create a project with a name, then it appears in the project list; without a name it is rejected | TEST-002 |
| AC-005 | REQ-005 | Given a project, when the Admin adds a Member, then that Member sees the project | TEST-002 |
| AC-006 | REQ-006 | Given a Member on a project, when the Admin removes them, then the project returns "not found" to them | TEST-002 |
| AC-007 | REQ-007 | Given an active project, when the Admin archives it, then its Members see it marked archived with no edit controls | TEST-002 |
| AC-008 | REQ-008 | Given an archived project, when the Admin restores it, then Members can edit it again | TEST-002 |
| AC-009 | REQ-009 | Given project access, when a user saves a markdown description, then it renders formatted on the overview | TEST-004 |
| AC-010 | REQ-010 | Given any user, when they look for a project delete action in UI or endpoints, then none exists | TEST-002 |
| AC-011 | REQ-011 | Given project access, when a user creates an issue with a title, then it appears on the board; without a title it is rejected | TEST-004 |
| AC-012 | REQ-012 | Given an issue, when a user sets a status outside the six, then it is rejected; each of the six is accepted | TEST-004 |
| AC-013 | REQ-013 | Given a new issue without priority, when it is saved, then its priority is None; each of the five values is accepted | TEST-004 |
| AC-014 | REQ-014 | Given an issue, when a user assigns an active user with project access, then it saves; an assignee without access is rejected | TEST-004 |
| AC-015 | REQ-015 | Given an issue, when a user sets a milestone from another project, then it is rejected; one from the same project saves | TEST-004 |
| AC-016 | REQ-016 | Given an issue, when a user sets or clears a due date, then it saves | TEST-004 |
| AC-017 | REQ-017 | Given an issue created by another user, when a Member edits it, then the change saves | TEST-004 |
| AC-018 | REQ-018 | Given an issue, when a user deletes it, then it no longer appears in board, list, filters, or milestone progress, and its row still exists in the database | TEST-005 |
| AC-019 | REQ-019 | Given deleted issues, when the Admin opens Deleted issues, then they are listed; a Member cannot open this view | TEST-005 |
| AC-020 | REQ-020 | Given a deleted issue, when the Admin restores it, then it reappears with all fields, comments, and attachments | TEST-005 |
| AC-021 | REQ-021 | Given issues in several statuses, when a user opens the board, then each issue appears in its status column | TEST-006 |
| AC-022 | REQ-022 | Given a card in Todo, when a user drops it in In progress, then after reload its status is In progress | TEST-006 |
| AC-023 | REQ-023 | Given a project with issues, when a user opens the list view, then every non-deleted issue appears | TEST-006 |
| AC-024 | REQ-024 | Given mixed issues, when a user filters by assignee, priority, or milestone, alone or combined, then only matching issues appear in board and list | TEST-006 |
| AC-025 | REQ-025 | Given mixed issues, when a user sorts by priority, due date, or created date, then issues appear in that order in board columns and list, with no-due-date issues last | TEST-006 |
| AC-026 | REQ-026 | Given two users editing the same issue, when the second saves after the first, then the second sees a warning, a Reload option, and their typed text is preserved; nothing is overwritten | TEST-007 |
| AC-027 | REQ-027 | Given an issue whose status and assignee changed, when a user opens it, then the feed shows each change with actor and time | TEST-008 |
| AC-028 | REQ-028 | Given project access, when a user posts an issue comment in markdown, then it appears formatted in the issue feed | TEST-009 |
| AC-029 | REQ-029 | Given project access, when a user posts a project comment, then it appears in the project feed | TEST-009 |
| AC-030 | REQ-030 | Given a comment box, when a user types @, then only active users with project access are offered | TEST-009 |
| AC-031 | REQ-031 | Given their own comment, when the author edits it, then the new text shows as edited | TEST-009 |
| AC-032 | REQ-032 | Given their own comment, when the author deletes it, then its text no longer shows in the feed | TEST-009 |
| AC-033 | REQ-033 | Given project edits, issue events, and project comments, when a user opens the project feed, then all appear in time order | TEST-008 |
| AC-034 | REQ-034 | Given project access, when a user creates a milestone with a name, then it appears; without a name it is rejected | TEST-010 |
| AC-035 | REQ-035 | Given a milestone, when a user changes its name, description, or target date, then the change saves | TEST-010 |
| AC-036 | REQ-036 | Given a milestone with linked issues, when a user deletes it, then it no longer appears, the issues remain with no milestone, and each issue's feed records the change | TEST-010 |
| AC-037 | REQ-037 | Given a milestone with 2 Done, 1 Todo, 1 Canceled issue, when viewed, then progress is 2 of 3 | TEST-010 |
| AC-038 | REQ-038 | Given project access, when a user adds a link, a note, and a file resource, then all three appear newest first | TEST-011 |
| AC-039 | REQ-039 | Given a resource, when a user edits it, then the change saves | TEST-011 |
| AC-040 | REQ-040 | Given a resource, when a user deletes it, then it no longer appears | TEST-011 |
| AC-041 | REQ-041 | Given an issue, when a user attaches an allowed file ≤ 10 MB, then it is listed and downloadable | TEST-011 |
| AC-042 | REQ-042 | Given a file over 10 MB, when a user uploads it, then it is rejected with a message stating the limit | TEST-011 |
| AC-043 | REQ-043 | Given an issue, when user A assigns user B, then B receives a notification | TEST-012 |
| AC-044 | REQ-044 | Given an issue with assignee and creator, when a third user comments, then both receive a notification | TEST-012 |
| AC-045 | REQ-045 | Given a comment mentioning user B, when posted on an issue or project, then B receives a notification | TEST-012 |
| AC-046 | REQ-046 | Given an issue with assignee and creator, when a third user changes status, then both receive a notification | TEST-012 |
| AC-047 | REQ-047 | Given notifications for a user, when they open Notifications, then they see them newest first with links | TEST-012 |
| AC-048 | REQ-048 | Given any notification, when it is created, then an email is sent to the recipient | TEST-012 |
| AC-049 | REQ-049 | Given active and archived projects, when the Admin opens the project list, then all appear | TEST-002 |
| AC-050 | SEC-001 | Given no session, when any app page or endpoint except sign-in and invitation is requested, then access is refused | TEST-003 |
| AC-051 | SEC-002 | Given a Member not on project P, when they request P, its issues, files, or feed, then the response is "not found" | TEST-003 |
| AC-052 | SEC-003 | Given a Member, when they call any Admin-only action, then the response is "not allowed" and nothing changes | TEST-003 |
| AC-053 | SEC-004 | Given a comment by user A, when user B or the Admin tries to edit or delete it, then it is rejected | TEST-003 |
| AC-054 | SEC-005 | Given a signed-in user, when the Admin deactivates them, then their next request is refused | TEST-001 |
| AC-055 | SEC-006 | Given an executable renamed to .pdf, when uploaded, then it is rejected | TEST-011 |
| AC-056 | SEC-007 | Given a file in project P, when a user without access to P requests its URL, then it is not served | TEST-011 |
| AC-057 | SEC-008 | Given markdown with a script tag or raw HTML, when rendered, then no script runs and no raw HTML is output | TEST-013 |
| AC-058 | SEC-009 | Given an archived project, when any write request is sent directly to the server, then it is rejected | TEST-002 |
| AC-059 | DATA-001 | Given a deleted issue, when checked in the database, then the issue, comments, attachments, and events still exist | TEST-005 |
| AC-060 | DATA-002 | Given a deactivated user, when viewing their past issues and comments, then authorship still shows | TEST-001 |
| AC-061 | DATA-003 | Given recorded events, when any update or delete is attempted on them through the app, then no path exists | TEST-008 |
| AC-062 | DATA-004 | Given an uploaded file, when inspected, then the bytes are on VPS disk and a metadata row exists | TEST-011 |
| AC-064 | SEC-010 | Given a sign-in link, when it is used a second time or after 15 minutes, then sign-in is refused and a new link can be requested | TEST-001 |
| AC-065 | SEC-011 | Given an invitation older than 7 days, when opened, then it is refused; a resent invitation works | TEST-001 |
| AC-066 | SEC-012 | Given a session older than 30 days, when a request is made, then the user is sent to sign-in | TEST-001 |
| AC-067 | REQ-050 | Given a Member, when an Admin promotes them, then they can perform Admin-only actions | TEST-002 |
| AC-068 | REQ-051 | Given two Admins, when one demotes the other, then the demoted user gets "not allowed" on Admin-only actions | TEST-002 |
| AC-069 | SEC-013 | Given exactly one active Admin, when anyone tries to demote or deactivate them, then it is rejected | TEST-002 |
| AC-070 | REQ-052 | Given a user who is assignee and creator of an issue, when they change its status or comment on it, then they receive no notification | TEST-012 |
| AC-071 | REQ-053 | Given a deactivated Member of project P, when an Admin reactivates them, then they can sign in and see P again | TEST-001 |
| AC-072 | REQ-054 | Given the email service fails, when a user requests a sign-in link, then they see an error and can request again | TEST-001 |
| AC-073 | OPS-001 | Given the email service fails for a notification, when sending, then it is attempted 4 times in total within about 10 minutes, then a log entry records the drop, and the in-app notification exists | TEST-012 |
| AC-074 | REQ-055 | Given a project, when an Admin renames it, then the new name shows everywhere; a Member's rename attempt gets "not allowed" | TEST-002 |
| AC-075 | REQ-056 | Given a new issue, when it is created, then its status is Backlog and it appears in the Backlog column | TEST-004 |
| AC-076 | REQ-057 | Given an issue attachment uploaded by someone else, when a user with project access removes it, then it is no longer listed | TEST-011 |
| AC-077 | DATA-005 | Given a deleted comment, when the feed and database are checked, then the text is gone and a placeholder with author and time remains | TEST-009 |
| AC-078 | DATA-006 | Given a file resource, when it is deleted, then its file no longer exists on disk | TEST-011 |
| AC-079 | DATA-007 | Given a removed issue attachment, when the disk is checked, then its file no longer exists | TEST-011 |
| AC-080 | DATA-004 | Given the metadata write fails after an upload reaches disk, when the upload completes with an error, then no orphan file remains | TEST-011 |
| AC-081 | REQ-001 | Given a pending invitation, when the Admin invites the same email again, then one invitation exists with a new link and expiry | TEST-001 |
| AC-082 | SEC-014 | Given the production VPS, when a page is requested over HTTP, then it redirects to HTTPS with a valid certificate | TEST-015 |
| AC-083 | SEC-015 | Given the production VPS, when the environment file and repository are inspected, then the file is readable only by the app user and no secret is in the repository | TEST-015 |
| AC-084 | SEC-016 | Given 5 sign-in requests for one email within 15 minutes, when a 6th is made, then no email is sent and the neutral message shows | TEST-001 |
| AC-085 | SEC-017 | Given a successful sign-in, when the session cookie is inspected, then it has HttpOnly, Secure, and SameSite=Lax | TEST-003 |
| AC-086 | NFR-002 | Given production with real team data, when core pages are opened, then each loads in under 2 seconds | TEST-014 |
| AC-087 | NFR-003 | Given only a keyboard, when a user signs in, creates an issue, changes its status, comments, and uploads a file, then all complete | TEST-014 |
| AC-088 | SEC-018 | Given sign-ins and comments have occurred, when the log file is searched, then no token, secret, or comment text appears | TEST-016 |
| AC-089 | OPS-002 | Given log entries older than 14 days, when retention runs, then they are gone | TEST-016 |
| AC-090 | OPS-003 | Given the app is stopped, when the monitor next checks, then the owner receives an email | TEST-016 |
| AC-091 | OPS-004 | Given a new release with migrations, when the previous release is redeployed against the migrated database, then core journeys still work | TEST-016 |
| AC-063 | NFR-001 | Given each supported browser, when core journeys are run, then all complete without layout or functional errors | TEST-014 |

| Verification ID | Acceptance IDs | Type | Method / prerequisites / pass condition | Status | Evidence location | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| TEST-001 | AC-001, AC-002, AC-003, AC-054, AC-060, AC-064, AC-065, AC-066, AC-071, AC-072, AC-081, AC-084 | Automated end-to-end | Invite, activate, deactivate flows against a test database with email captured by a test double; pass when all listed ACs hold | Planned | Pending | Owner |
| TEST-002 | AC-004 to AC-008, AC-010, AC-049, AC-058, AC-067, AC-068, AC-069, AC-074 | Automated integration | Project admin actions and archived-write rejection, called through server endpoints; pass when all listed ACs hold | Planned | Pending | Owner |
| TEST-003 | AC-050 to AC-053, AC-085 | Automated integration | Permission matrix (5.2) run for anonymous, Member-in-project, Member-not-in-project, Admin; pass when every cell matches | Planned | Pending | Owner |
| TEST-004 | AC-009, AC-011 to AC-017, AC-075 | Automated end-to-end | Issue and description create/edit with valid and invalid values; pass when all listed ACs hold | Planned | Pending | Owner |
| TEST-005 | AC-018 to AC-020, AC-059 | Automated integration | Delete, list deleted, restore; database check for retained rows | Planned | Pending | Owner |
| TEST-006 | AC-021 to AC-025 | Automated end-to-end | Board drag, list view, filter and sort on seeded data | Planned | Pending | Owner |
| TEST-007 | AC-026 | Automated integration | Two sessions edit one issue; second save returns conflict; UI keeps input | Planned | Pending | Owner |
| TEST-008 | AC-027, AC-033, AC-061 | Automated integration | Perform changes, read issue and project feeds; confirm no update/delete path on events | Planned | Pending | Owner |
| TEST-009 | AC-028 to AC-032, AC-077 | Automated end-to-end | Comment, mention picker, author edit and delete | Planned | Pending | Owner |
| TEST-010 | AC-034 to AC-037 | Automated integration | Milestone CRUD and progress calculation on seeded issues | Planned | Pending | Owner |
| TEST-011 | AC-038 to AC-042, AC-055, AC-056, AC-062, AC-076, AC-078, AC-079, AC-080 | Automated integration | Resource CRUD; uploads of allowed, oversize, and disguised files; unauthorized download; disk and row check | Planned | Pending | Owner |
| TEST-012 | AC-043 to AC-048, AC-070, AC-073 | Automated integration | Trigger each notification type; check in-app records and emails captured by test double | Planned | Pending | Owner |
| TEST-013 | AC-057 | Automated unit | Render a set of hostile markdown inputs; pass when output contains no script or raw HTML | Planned | Pending | Owner |
| TEST-016 | AC-088 to AC-091 | Operational | On production: search logs for sensitive values; confirm 14-day purge; stop app and confirm monitor email; redeploy previous release after a migration and run smoke check. Pass when all hold | Planned | Pending | Owner |
| TEST-015 | AC-082, AC-083 | Operational | On the production VPS: request http:// URL and check redirect and certificate; check environment file permissions; scan repository for secrets. Pass when all hold | Planned | Pending | Owner |
| TEST-014 | AC-063, AC-086, AC-087 | Manual | Run sign-in, create issue, move card, comment, upload on each supported browser, time page loads, and repeat once keyboard-only; pass when all complete and loads are under 2 s | Planned | Pending | Owner |

### 13.1 Required scenario coverage

- **Happy path and boundary values:** covered, AC-001 to AC-049; 10 MB boundary in AC-042.
- **Authentication, authorization, and resource isolation:** AC-050 to AC-054, AC-056, AC-058.
- **Invalid, malformed, oversized, and unsupported input:** AC-004, AC-011, AC-012, AC-014, AC-015, AC-034, AC-042, AC-055, AC-057.
- **Empty, missing, deleted, disabled, and stale resources:** AC-018 to AC-020, AC-026, AC-054, AC-058.
- **Duplicate, concurrent, reordered, timed-out, and retried operations:** AC-026 (concurrent edit), AC-073 (email retry), AC-081 (duplicate invitation).
- **Dependency outage, partial failure, recovery, and replay:** email outage covered by AC-072 and AC-073; no replay in R1. File orphan cleanup covered by AC-080.
- **Accessibility and responsive behavior:** responsive is Not applicable (desktop only). Keyboard use covered by AC-087.
- **Migration, rollback, backup/restore, and operational alert behavior:** data migration Not applicable (new system); backup/restore Not applicable (DEC-003); rollback covered by AC-091; alerting by AC-090.

### 13.2 Verification commands and limits

- **Static checks:** type check and lint; exact commands set when the repository is created.
- **Unit/integration/e2e checks:** test runner and e2e browser tool chosen when the repository is created; commands recorded here before approval.
- **Performance/security/accessibility checks:** manual, per TEST-014 and TEST-015.
- **Production-only gates:** owner sign-off after deploying to the VPS.
- Do not claim production readiness from local or static checks alone.

## 14. Rollout and follow-up

- **Release strategy:** deploy to the VPS, owner runs a smoke check, then invites the team. Local and production environments only; no staging.
- **Backward compatibility:** Not applicable; no prior version or data.
- **Rollback:** trigger is a broken production release. Redeploy the previous version. Migrations are additive only, so the previous version runs on the new schema (OPS-004). Owner: Owner.
- **Post-release monitoring:** uptime monitor (OPS-003) and log review by the owner during the first week.
- **Known limitations:**
  - **LIMIT-001:** One VPS holds the app, database, and files; any VPS failure takes the whole app down.
  - **LIMIT-002:** No backups. Losing the VPS disk loses all data permanently.
  - **LIMIT-003:** No real-time updates; users see others' changes only after reload.
  - **LIMIT-004:** Desktop browsers only.
  - **LIMIT-006:** Sign-in depends on email delivery. If the email service is down, nobody can sign in who isn't already signed in.
  - **LIMIT-005:** Nothing stops users pasting credentials into resource notes, which are stored as plain text (accepted, DEC-010).
- **Future work:**
  - **FOLLOWUP-001:** Integrations with Slack, GitHub, and Google Drive. Out of R1 scope.

## 15. Decision log

| Decision ID | Question / conflict | Status | Blocks while open | Owner | Affected requirement IDs | Resolution / rationale / constraints | Due date | Resolved date / approval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEC-001 | How do users sign in (email and password, magic link, Google, or combination)? Includes invitation expiry and resend rules. | Resolved | — | Owner | REQ-002, SEC-001, SEC-010 to SEC-012, WF-001 | Magic link by email; no passwords stored. Sign-in link single use, 15 minutes. Invitation 7 days, Admin can resend. Session 30 days. | — | 2026-09-23, Owner |
| DEC-002 | Who can edit or delete comments? | Resolved | — | Owner | REQ-031, REQ-032, SEC-004 | Only the author, including for the Admin. | — | 2026-09-23, Owner |
| DEC-003 | Backups for database and files? | Resolved | — | Owner | Section 12, LIMIT-002 | No backups in R1. Owner accepts the risk of total data loss. | — | 2026-09-23, Owner |
| DEC-004 | Integrations in R1? | Resolved | — | Owner | FOLLOWUP-001 | Removed to keep the first iteration simple. | — | 2026-09-23, Owner |
| DEC-005 | With a single Admin seat, what happens if the Admin leaves or is locked out? Can the Admin role be transferred? | Resolved | — | Owner | REQ-003, REQ-050, REQ-051, SEC-013, 5.1, 5.2, 6.1 | Multiple Admins with equal rights. Any Admin can promote or demote others. The last active Admin cannot be demoted or deactivated. | — | 2026-09-23, Owner |
| DEC-006 | Are users notified of their own actions (e.g. assigning themselves)? | Resolved | — | Owner | REQ-043 to REQ-046, REQ-052 | No. A user is never notified about an action they performed. | — | 2026-09-23, Owner |
| DEC-007 | Can users turn off email notifications? | Resolved | — | Owner | REQ-048 | No. Email notifications are always on; there is no preference setting in R1. | — | 2026-09-23, Owner |
| DEC-008 | Can the Admin reactivate a deactivated user? | Resolved | — | Owner | REQ-003, REQ-053, 6.2 | Yes. An Admin can reactivate; the user returns with their previous role and project memberships. | — | 2026-09-23, Owner |
| DEC-009 | Is the Canceled column hidden on the board by default? | Resolved | — | Owner | REQ-021 | No. All six columns always show; there is no column toggle. | — | 2026-09-23, Owner |
| DEC-010 | Should the resource note form warn against pasting credentials? | Resolved | — | Owner | REQ-038, LIMIT-005 | No warning. Accepted as known limitation LIMIT-005. | — | 2026-09-23, Owner |
| DEC-011 | Which email service, and how are send failures retried? | Resolved (vendor delegated) | — | Owner | REQ-001, REQ-048, REQ-054, OPS-001, DEP-001 | Vendor delegated to implementation within constraints: transactional service with HTTP API; free or low-cost tier fits a small team; sends from owner's domain with SPF and DKIM; API key in server config only. Exceeding any constraint is a blocker. Sign-in link failure is shown to the user with no background retry. Notification and invitation emails retry up to 3 times over about 10 minutes, then are dropped and logged. | — | 2026-09-23, Owner |
| DEC-012 | Who can rename a project: Admin only, or Members too? | Resolved | — | Owner | 5.2, REQ-055 | Admin only. | — | 2026-09-23, Owner |
| DEC-013 | What status does a new issue start in? | Resolved | — | Owner | REQ-012, REQ-056 | Backlog. | — | 2026-09-23, Owner |
| DEC-014 | Which fields can issues be filtered and sorted by? | Resolved | — | Owner | REQ-024, REQ-025 | Filter: assignee, priority, milestone. Sort: priority, due date, created date. Default sort: created date, newest first (proposed by Claude, confirm in review). No status filter; list view shows status as a column. | — | 2026-09-23, Owner |
| DEC-015 | Delete behavior for comments, milestones, resources, and issue attachments: hidden or removed? What happens to issues linked to a deleted milestone? Can attachments be removed from an issue? | Resolved | — | Owner | REQ-032, REQ-036, REQ-040, REQ-057, DATA-005 to DATA-007 | Comment: text removed permanently; feed keeps a "comment deleted" placeholder with author and time. Milestone: removed permanently; linked issues stay with no milestone, recorded in each issue's feed. Resource: removed permanently, file deleted from disk. Attachment: anyone with project access can remove it from an issue; file deleted from disk. | — | 2026-09-23, Owner |
| DEC-016 | Operations baseline: logging, error alerting, performance and accessibility targets, staging environment, rollout and rollback steps, language. | Resolved | — | Owner | Sections 10, 12, 14; NFR-002, NFR-003, OPS-002 to OPS-004, SEC-018 | Logs to file on VPS, 14 days, no tokens, secrets, or comment text. Free uptime monitor emails owner on downtime; no other alerts. Pages load under 2 s in normal use; no load testing. No formal accessibility standard; keyboard-usable. Local and production only. Rollout: deploy, owner smoke check, invite team. Rollback: redeploy previous version; migrations additive only. English only. | — | 2026-09-23, Owner |
| DEC-017 | Security baseline: HTTPS, where secrets live, sign-in rate limiting, encryption at rest. | Resolved | — | Owner | Section 9, SEC-014 to SEC-017 | HTTPS only with a free TLS certificate, HTTP redirected. Secrets in an environment file on the VPS readable only by the app user, never committed. Max 5 sign-in link requests per email per 15 minutes. Session cookies HttpOnly, Secure, SameSite=Lax. Encryption at rest excluded from R1 by owner. | — | 2026-09-23, Owner |
| DEC-018 | Confirm assumption: deactivated users are removed from assignee and @mention pickers. | Resolved | — | Owner | REQ-014, REQ-030, WF-002 | Confirmed. Deactivated users are hidden from pickers; existing assignments and authorship still show their name. | — | 2026-09-23, Owner |
| DEC-019 | Priority ranking (Must/Should/Could) for requirements. | Open | Neither | Owner | Section 4 | Pending. Cannot affect readiness: per index rules, priority does not determine scope; all R1 rows are commitments. | Before approval | Pending |
| DEC-020 | Confirm assumption: issue descriptions and comments use the same basic markdown as project descriptions. | Resolved | — | Owner | REQ-011, REQ-028, REQ-029, SEC-008 | Confirmed. Same basic markdown for project descriptions, issue descriptions, comments, and resource notes. | — | 2026-09-23, Owner |

## 16. Glossary and revision history

### 16.1 Glossary

- **Admin:** a user who manages users and projects; there can be several, all equal. Not "owner" or "manager."
- **Member:** any non-Admin user. Sees only projects they belong to.
- **Project member:** a user added to a specific project by the Admin.
- **Archived project:** read-only project, restorable by the Admin. Not "closed."
- **Deleted issue:** an issue hidden from all views but kept in the database; the Admin can restore it.
- **Deactivated user:** a user who can no longer sign in; their content stays. Not "deleted user."
- **Resource:** a link, note, or file stored on a project.
- **Activity feed:** time-ordered history of changes and comments on an issue or project.

### 16.2 Revision history

| Version | Date | Author | Summary | Approval / impact |
| --- | --- | --- | --- | --- |
| 0.1.0 | 2026-09-23 | Owner, drafted with Claude | Initial draft from discovery | Not approved |
| 0.2.0 | 2026-09-23 | Owner, drafted with Claude | Clarification pass: DEC-001, DEC-005 to DEC-018, DEC-020 resolved; added REQ-050 to REQ-057, SEC-010 to SEC-018, DATA-005 to DATA-007, OPS-001 to OPS-004, NFR-002, NFR-003 | Not approved |
