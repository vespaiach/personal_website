---
description: Glance, a free, open-source, local-first PWA that turns an old iPad or spare screen into a family wall calendar that keeps working offline.
---

# Glance

[takeaglance.app](https://takeaglance.app/) · [Open source on GitHub](https://github.com/vespaiach/glance) · **Role:** Built + maintain · **Platform:** Next.js (PWA)

Glance is a free, open-source wall calendar for a family screen. It runs in a browser, so an old iPad, a spare monitor, or a phone all work. Sign in with an email code and the screen shows today's plans, the weather, sticky notes, and your photos. The code is public under my GitHub, so anyone can read it, send a pull request, or run a private copy of their own.

## What I did

I designed and built the whole app. It has six views: Today, Calendar, Weather, Notes, Photos, and Settings. That covers a day timeline with tap-to-add events for everyone or specific people, reminders with a chime, sticky notes that expire, photo uploads by scanning a QR code, and a dim, drifting night clock that keeps the screen from burning in. Any number of screens stay in sync at three sizes: wall, tablet, and phone.

## The problem I solved

I had old iPads that still worked, but the apps that turn one into a wall calendar mostly cost money, and the free versions are limited. A wall screen also stays on for weeks and can't fall over when the Wi-Fi drops. So Glance is local-first: each screen reads and writes its own copy of the data in the browser and syncs with the server in the background. A persistent single-page shell keeps the clock, slideshow, and sync alive between views. A service worker caches the app, fonts, and photos, so a screen can restart with no network and still show everything it had. Installed as a PWA, it runs full screen, sidesteps Safari's 7-day storage cap on iPad, and can push reminders to phones even when Glance isn't open.

**Stack:** TypeScript, Next.js, React, StyleX, Dexie (IndexedDB), PostgreSQL, Serwist, Web Push, Open-Meteo, Vitest, Biome
