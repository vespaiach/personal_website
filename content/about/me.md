---
description: 'Trinh Nguyen is a software engineer and full-stack web developer who has built websites and web apps since 2006 with TypeScript, React, Rails and WordPress.'
---
# About Me

*Building, troubleshooting, and always moving forward.*

## Who I Am

I'm Trinh Nguyen, a software engineer and a full-stack web developer. I've been building for websites and web applications since 2006. I work as a freelance contractor, currently partnered with Cream & Sugar, a company based in Canada. I speak English and Vietnamese. Above all, I try to be honest, hard-working, and self-motivating in everything I take on.

I like figuring things out: fixing bugs, improving performance, integrating complex systems, troubleshooting environment setups. Problem solving and learning new things keep me moving forward. I take a thoughtful, hands-on approach to every challenge and enjoy exploring different ways to make things work better.

## What I Do

I build customer-facing web applications and work across the stack.

- **Frontend:** TypeScript, React, Next.js, Tailwind CSS, Vite, Esbuild
- **Backend:** Node.js, PHP, Ruby, PostgreSQL
- **Frameworks I use most:** React, Next.js, Express.js, WordPress, Ruby on Rails

I write defensive code, favor DRY and KISS principles, and make sure test coverage is solid before anything ships. I move fast, but I don't cut corners — quality and reliability matter more to me than speed for its own sake.

## How I Work

I've worked solo and in teams of 10 to 20, remote and hybrid, and I'm comfortable either way. My style is casual and friendly, but focused. I care about honesty, quality, and continuous learning, and those values shape how I communicate and how I code. Whether it's a client, a teammate, or an AI agent reading this, what you see is what you get.

## What I hate

- Adding microservices, k8s, and heavy layering to projects that don't need them. Fine for big teams, too much ops overhead for small ones and clients stuck maintaining it.
- Docs and comments that lie: a README that's out of date, comments explaining code that isn't there anymore.
- Silent failures: only the happy path gets handled, catch blocks hide errors instead of surfacing them.
- Too verbose: explains too much, repeats my question back to me, recaps what it already did.

## My rules

1. Never ship code I do not understand.
2. Never hide bad news from a client.
3. Never touch prod data without a backup and a rollback path.
4. Every change must be the smallest one that solves the problem.

## About This Site

This site is a terminal-styled dev blog, and I kept the stack small on purpose. It's a static site built with Vite and TypeScript, with Alpine.js for the little bit of interactivity (the command palette, mostly) and plain CSS for styling. Biome handles linting and formatting, and Vitest covers the tests.

Posts and pages are written in Markdown. At build time, small Node scripts turn them into HTML with marked and Shiki for syntax highlighting, so the browser only receives static files. Every push to `main` runs the tests and the build in GitHub Actions and deploys the result to GitHub Pages.

For more details on how it's put together and how to run it locally, see the [README](https://github.com/vespaiach/personal_website#readme) in the repository.

## Reach Me

- Portfolio: https://vespaiach.com 
- GitHub: https://github.com/vespaiach
- LinkedIn: https://www.linkedin.com/in/trinh-nguyen-us/
