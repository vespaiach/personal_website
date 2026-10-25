---
description: A custom Gutenberg block build of the MuddyBoots marketing site from Figma designs, plus an open-source plugin that upgrades WordPress's Additional CSS.
---

# MuddyBoots

[muddyboots.online](https://muddyboots.online/) · **Role:** Built + maintain · **Platform:** WordPress (Gutenberg)

MuddyBoots is an operations platform for oil & gas and building management teams. It helps them maintain assets, track compliance, and see what's happening across hundreds of sites and thousands of pieces of equipment.

## What I did

I built the marketing site from scratch in WordPress, turning Figma designs from the [Cream & Sugar](https://www.creamsugar.ca/) design team into a fully custom Gutenberg block build, with no page builder plugin and no off-the-shelf theme. I broke the design into modular, reusable block patterns, so the client's team can edit every section without touching code while the site stays true to a detailed, multi-section design system. I continue to maintain the site.

## The problem I solved

WordPress's built-in Additional CSS field was too limited for the responsive, block-level styling the design needed: no nested selectors, no media queries, and no way to scope styles to a single block. So I built [additional-css-enhancement-plugin](https://github.com/vespaiach/additional-css-enhancement-plugin). It adds &-based nested selectors, @media/@supports/@container at-rules, and a compile-validate-preview pipeline that only ships CSS once it matches what's saved in the editor.

**Stack:** WordPress, Gutenberg, PHP, React, JavaScript, Figma
