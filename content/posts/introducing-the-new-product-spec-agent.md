---
title: 'Introducing the New Product Spec Agent'
date: '2026-09-29T00:00:00.000Z'
updatedAt: '2026-09-29T00:00:00.000Z'
excerpt: "This is a new version of the agent from Turning Product Ideas into Clear Specifications with AI, now it's organized by feature."
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/introducing-the-new-product-spec-agent.md
tags: PRD, product-specification, claude 
---

Read the post [Turning Product Ideas into Clear Specifications with AI](https://vespaiach.com/posts/turning-product-ideas-into-clear-specifications-with-ai.html) for more detail.

## Why specs need a new shape

The previous spec template spreads one feature across many sections: user stories in one place, requirements in another, acceptance criteria and tests in a third. Readers have to piece each feature back together, and an agent that updates one copy of a fact can leaves the other copies wrong.

I wanted a new spec that a product person can read in five minutes and an agent can build from without guessing.

## How a session works

You paste the prompt (link in below) into your AI tool and describe your idea in a sentence. From there, the agent works in five stages:

1. **Intake.** It works out whether you're starting fresh, revising a spec, or converting one from another format.
2. **Discovery.** It interviews you one question at a time, with buttons and multi-select where your tool has them.
3. **Draft.** It assembles the spec and checks it for gaps and contradictions.
4. **Clarify.** It turns every open question into a decision with an owner, then resolves them with you one by one.
5. **Finalize.** It sets readiness honestly and hands you the finished spec as a Markdown file.

## One spec, two readers

The spec is a single Markdown document in three layers, so each reader can stop where they need to.

| Layer | What's in it | Who reads it |
| --- | --- | --- |
| Part A: Overview | Where things stand, summary, goals, roles and permissions, features at a glance, boundaries, glossary | Everyone. A business reader can stop here. |
| Part B: Features | One self-contained block per feature | Product, engineering, and the agents building each feature |
| Part C: System | Shared behaviors, data, interfaces, security, quality targets, architecture, operations | Engineers and agents |

## From spec to code

The spec is the first half of a pipeline. A second prompt, the Spec-to-Tasks Agent, reads a finished spec and turns it into ordered tasks. Each task is a ready-to-run prompt: paste it into a fresh coding-agent session and it has everything it needs, copied word for word from the spec.

<figure class="md-diagram">
<svg viewBox="0 0 720 280" role="img" aria-label="Your idea goes to the Product Spec Agent, which writes the spec. When ready, the Spec-to-Tasks Agent turns the spec into task prompts for coding agents. A blocked coding agent sends a question back to the spec.">
  <defs>
    <marker id="spec-flow-arrow" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="8" markerHeight="8" markerUnits="userSpaceOnUse" orient="auto">
      <path class="md-diagram__arrowhead" d="M0 0L8 4L0 8z"/>
    </marker>
  </defs>
  <rect class="md-diagram__box" x="1" y="1" width="194" height="84" rx="6"/>
  <text class="md-diagram__title" x="98" y="31">Your idea</text>
  <text class="md-diagram__text" x="98" y="51">One sentence, plus any</text>
  <text class="md-diagram__text" x="98" y="69">notes or a PRD</text>
  <rect class="md-diagram__box" x="241" y="1" width="194" height="84" rx="6"/>
  <text class="md-diagram__title" x="338" y="31">Product Spec Agent</text>
  <text class="md-diagram__text" x="338" y="51">Interviews you, one</text>
  <text class="md-diagram__text" x="338" y="69">question at a time</text>
  <rect class="md-diagram__box md-diagram__box--key" x="481" y="1" width="194" height="84" rx="6"/>
  <text class="md-diagram__title" x="578" y="31">The spec</text>
  <text class="md-diagram__text" x="578" y="51">One Markdown file that</text>
  <text class="md-diagram__text" x="578" y="69">people and agents share</text>
  <rect class="md-diagram__box" x="481" y="165" width="194" height="84" rx="6"/>
  <text class="md-diagram__title" x="578" y="195">Spec-to-Tasks Agent</text>
  <text class="md-diagram__text" x="578" y="215">Checks the spec, then</text>
  <text class="md-diagram__text" x="578" y="233">plans tasks in waves</text>
  <rect class="md-diagram__box" x="241" y="165" width="194" height="84" rx="6"/>
  <text class="md-diagram__title" x="338" y="195">Task prompts</text>
  <text class="md-diagram__text" x="338" y="215">One ready-to-run prompt</text>
  <text class="md-diagram__text" x="338" y="233">per task</text>
  <rect class="md-diagram__box" x="1" y="165" width="194" height="84" rx="6"/>
  <text class="md-diagram__title" x="98" y="195">Coding agents</text>
  <text class="md-diagram__text" x="98" y="215">Build, test and report,</text>
  <text class="md-diagram__text" x="98" y="233">one task per session</text>
  <path class="md-diagram__edge" d="M197 43H239" marker-end="url(#spec-flow-arrow)"/>
  <path class="md-diagram__edge" d="M437 43H479" marker-end="url(#spec-flow-arrow)"/>
  <path class="md-diagram__edge" d="M578 87V163" marker-end="url(#spec-flow-arrow)"/>
  <path class="md-diagram__edge" d="M479 207H437" marker-end="url(#spec-flow-arrow)"/>
  <path class="md-diagram__edge" d="M239 207H197" marker-end="url(#spec-flow-arrow)"/>
  <text class="md-diagram__label" x="566" y="129">Ready for implementation</text>
  <path class="md-diagram__edge md-diagram__edge--loop" d="M98 251V273H703V43H677" marker-end="url(#spec-flow-arrow)"/>
</svg>
<figcaption>Blocked on an unclear rule? The agent stops and proposes a decision. The decision owner updates the spec, and only affected tasks are regenerated.</figcaption>
</figure>

- **A checker runs first.** `spec-check.py` confirms every ID is defined, every rule has examples, and every TBD points to an open decision. It can also run in CI.
- **Tasks follow feature blocks.** A task builds one feature end to end, and the feature's examples define when it's done.
- **Shared behaviors are built once,** then applied by every feature task.
- **Questions flow back, not into the code.** When a coding agent hits an unclear rule, it stops and proposes a decision instead of guessing. Once the spec is updated, only the affected tasks are regenerated.

## Try it

The agent prompt is the only file you need. The others are there when you want them.

| File | What it is |
| --- | --- |
| [product-spec-agent-loop.md](/product-spec-agent-loop.md) | The Product Spec Agent prompt, with the spec template built in |
| [spec-to-tasks-agent.md](/spec-to-tasks-agent.md) | The Spec-to-Tasks Agent prompt, which turns a finished spec into task prompts |
| [spec-check.py](/spec-check.py) | The checker. Run `python3 spec-check.py your-spec.md` |
| [example-spec-leavedesk.md](example-spec-leavedesk.md) | A complete example spec for a fictional leave-request tool |
| [production-specification-template.md](production-specification-template.md) | The empty spec template on its own |

To start, paste the prompt into your AI tool as the system prompt, as custom instructions or as your first message. Then describe your idea in a sentence.

A few things to know before you try it:

- **It's long.** The prompt is about 40,000 characters. If your tool limits custom instructions to a few thousand characters, upload it as a file or paste it as your first message.
- **It's smoothest with structured input.** It works in plain chat, but tools with buttons and multi-select make the interview faster.
- **A full session takes a while.** One question per turn adds up for a large product. The light depth and "draft it now" keep small products quick.

## A solo dev would do

If you are the only developer, product owner, and project manager, this solo edition of a product specification is for you. Everything that exists for other people to read or sign off on is removed:

- The status box and approvals
- Owners and approvers
- Goals with metrics
- The readiness checklist
- Cross-feature journeys
- Proposed/Approved status on features
- The discovery step that asked for owners

[product-spec-agent-loop-solo.md](/product-spec-agent-loop-solo.md)
