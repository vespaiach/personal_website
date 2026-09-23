---
title: 'Rebuilding My Personal Website with Claude'
date: '2026-09-22T00:00:00.000Z'
updatedAt: '2026-09-22T00:00:00.000Z'
excerpt: 'I recently rebuilt my personal website, vespaiach.com, from the ground up with Claude Design and Claude Code.'
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/rebuilding-my-personal-website-with-claude.md
tags: claude-code, claude-design, alpine.js, vite.js
---

The idea was to create a terminal-like blog with a virtual filesystem for browsing articles, topics, projects, and information about me. I wanted the site to feel like a small operating environment for my writing, not just another blog with a different visual theme.

The result is a static website where visitors can navigate with familiar links and buttons, or use commands such as:

```
ls
cat /posts/rebuilding-my-website.md
help
clear
```

## 1. Starting with a design system

Before asking Claude Design to generate screens, I gave it a clear visual foundation by using [Warp design system reference from getdesign.md](https://getdesign.md/warp/design-md) as a starting point. Warp’s visual language—dark terminal surfaces, IDE-like panels, and command-oriented interactions—was close to the direction I wanted.

I then asked Claude to adapt that foundation using the [Halflife Rainglow iTerm theme](https://github.com/rainglow/iterm/blob/master/themes/Halflife%20%28rainglow%29.itermcolors).

The result was a design system centered around:

- A dark charcoal terminal background
- Bright cyan, lime, red, and yellow accents
- Monospace typography
- Terminal windows and command prompts
- File-system-inspired navigation
- Panels that feel like command output
- Minimal decoration and strong information hierarchy

The most important instruction was to explain the purpose of the interface, not just its appearance:

> Create a terminal-like personal website for a software engineer who writes about technology, software, computers, and the systems behind them.

## 2. Generating UI mockups

Once the design system was established, I asked Claude Design to generate mockups for the main parts of the site. I organized the content around a virtual filesystem with three top-level directories:

- /posts for articles
- /topics for topics and categories
 -/about for my profile, resume, technology stack, and projects

From there, I created mockups for:

- Directory listings
- Topic listings
- Article pages
- A command palette
- A help modal
- The shared terminal header

A completely realistic terminal interface would have been interesting, but it could also have made the site difficult to use. I therefore decided to support several interaction styles at once:

- Traditional hyperlinks
- Mouse interactions
- Keyboard shortcuts
- Terminal commands

This balance became one of the central design principles:

> The site should feel like a terminal without requiring visitors to already understand one.

## 3. Building view generators with Claude Code

After the visual direction was clear, I used Claude Code to build view generators for the main content types:

- Article views
- Folder listings
- Topic views
- About and profile views
- Command output views

These generators are responsible for producing the HTML displayed inside the terminal. For example, when a visitor enters:

```
cat /posts/rebuilding-my-website.md -> rebuilding-my-website.html will be displayed in terminal
```

The generators also produce standalone HTML pages for each view. This serves two purposes:

1. The same content can be accessed directly through a URL.
2. Search engines can discover and index the content more easily.

It also makes it possible to generate a sitemap while keeping the site fully static.

## 4. Creating common Alpine components

With the visual direction and view structure in place, I moved on to the shared interactive components. I built these with Alpine.js and used the mockups as the reference for the implementation.

The common components included:

- A command line
- A command palette
- A help modal
- A terminal-style header
- Terminal output rendering
- Keyboard shortcut handling
- Navigation prompts

The command line became one of the main interaction points. It gives the website its terminal character while providing a direct way to expose navigation commands.

The command palette provides a more approachable alternative. Visitors can open it with a keyboard shortcut, search for an article, jump to a topic, or navigate to another part of the site without memorizing commands.

The help modal was just as important. A terminal-inspired interface should not hide its controls behind assumptions. The help view explains what users can do and gives them a way to explore the interface.

## 5. Adding command resolvers

Once the shared components were working, I needed a clean way to translate user input into actions. I introduced command resolvers such as:

- `LsCommand`
- `CatCommand`
- `HelpCommand`
- `ClearCommand`

Each resolver is responsible for validating command syntax, resolving path arguments, loading the relevant view, and returning the result to the terminal.

For example:

```text
ls -> resolves the current directory and loads its folder listing.
cat /posts/rebuilding-my-website.md -> resolves the article path, loads the article view, and appends it to the terminal.
```

This separation kept the command system manageable and expandable:

- The command line captures input.
- The command factory identifies the command.
- The resolver validates arguments and performs the lookup.
- The view generator renders the result.
- The terminal appends the output.

## 6. Gluing everything together

The final implementation step was connecting the individual systems.

The command-line component captures user input, including chained commands. A command factory dispatches each command to the appropriate resolver. The resolver uses a path-to-view mapping to determine which view should be loaded. Finally, the command response is appended to the end of the terminal.

This architecture gave the site a predictable flow from input to output:

```
User input
    ↓
Command factory
    ↓
Command resolver
    ↓
View lookup
    ↓
Rendered output
    ↓
Terminal history
```

## 7. Deploying to GitHub Pages

Once the site was working locally, I configured it for deployment to GitHub Pages. The deployment process was intentionally simple:

1. Build the static site.
2. Publish the generated output.
3. Connect the custom domain.

GitHub Pages works well for this type of project because the site does not require a traditional application server. The content and interface are delivered as static assets, while the client-side code handles navigation, commands, and interaction in the browser.

## What I learned

The biggest lesson was that AI tools work better when they are given both a clear visual system and a clear technical structure.

Asking Claude to "design a terminal-style website" might produce something visually interesting, but it would probably be inconsistent. Starting with a design system gave Claude Design a shared vocabulary. Building reusable view generators, components, and command resolvers gave Claude Code an architecture to work within.

Those foundations were necessary, but they were not sufficient. The website still required continuous back-and-forth: reviewing generated work, correcting assumptions, refining interactions, and making product decisions.

My workflow became:

1. Define the visual language.
2. Generate and compare interface directions.
3. Turn repeated patterns into view generators.
4. Build shared interactive components.
5. Connect the command and rendering systems.
6. Refactor the implementation.
7. Perform a final verification pass.

The finished website is more than a new skin for an old blog. It is an experiment in treating a personal website as an interface—a small operating environment for my writing, projects, and ideas.
