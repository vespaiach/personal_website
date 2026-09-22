# vespaiach.com

Personal blog and portfolio site

I wanted a personal site that didn't look like a template, and one I fully owned, so I built it as a terminal. Posts, topics, and about pages read like a file explorer, complete with a keyboard command palette for navigation.

Under the hood: Vite and TypeScript for the shell, Alpine.js for the small interactive bits, plain CSS for styling. Content is Markdown, compiled at build time into static HTML with marked and Shiki, so nothing runs server side. Biome and Vitest keep it clean and tested, and GitHub Actions builds and deploys every push to GitHub Pages.

Result: a fast, fully static site with no server, no database, and no hosting bill. Publishing is just a Markdown file and a push.

Stack: TypeScript, Vite, Alpine.js, Markdown, Shiki, Biome, Vitest, GitHub Actions, GitHub Pages