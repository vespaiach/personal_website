---
title: 'Glance: from an old iPad to a family wall calendar'
date: '2026-10-25T00:00:00.000Z'
updatedAt: '2026-10-25T00:00:00.000Z'
excerpt: 'Glance is a free, open source wall calendar for a family screen. It is a PWA, that can work on an old iPad, a spare monitor or a phone.'
github: https://github.com/vespaiach/personal_website/blob/main/content/posts/glance-from-an-old-ipad-to-a-family-wall-calendar.md
tags: glance, pwa, local-first, next.js
---

Glance is a free wall calendar for a family screen, and it is live at [takeaglance.app](https://takeaglance.app).

It runs in a browser, so an old iPad, a spare monitor or a phone all work. Sign in with an email code and the screen shows today's plans, the weather, sticky notes and your photos.

## The idea

It started with old iPads. They still worked, nobody used them, and I didn't want them in a drawer. A family wall calendar seemed like a good second job: a screen in a shared spot that shows what is on today and who it is for.

Before building anything, I looked at the apps that turn an iPad into a wall-mounted calendar. Most cost money, and the free versions come with limited features. So I changed plans and decided to build my own. The result is Glance, a PWA that is [open source](https://github.com/vespaiach/glance), so anyone can build it and run a private version of their own.

## What Glance does

There are six views: Today, Calendar, Weather, Notes, Photos and Settings. The main parts:

- **Today.** A clock, the weather, what is on now or next, the day as a timeline, the newest notes and a photo of the day.
- **Calendar.** A week strip and a day timeline. Free gaps show up as slots, and tapping one starts a new event. Events are for everyone or for specific people, and you can filter by person.
- **Reminders.** 15 minutes before, at the start, or both. The screen shows a strip with a short chime.
- **Notes.** Short sticky notes, up to 280 characters, that can expire after a number of days you choose.
- **Photos.** Upload from your phone by scanning a QR code on the screen. Photos run as a slideshow, as the background, or as the photo of the day.
- **Ambient mode.** At night the screen turns into a dim clock that drifts a few pixels now and then, so nothing burns in. The rest of the time the colors follow the four seasons.

You can sign in as many screens as you like. They stay in sync, work at three sizes (wall, tablet, phone), and keep working when the Wi-Fi drops.

## How I built it

Glance is a Next.js app that runs like a single-page app, with a local database in the browser and one Node server behind it.

- **One page that never reloads.** A persistent shell keeps the clock, idle timer, slideshow and sync alive between views. A wall screen stays on for weeks, so it can't depend on page loads.
- **The screen keeps its own notebook.** Glance is local-first. The screen reads and writes its own copy of the data, and syncs with the server in the background. If the Wi-Fi drops, it still shows today.
- **Offline from a cold start.** A service worker caches the app, fonts and photos, but never API data. A screen can restart with no network and still show everything it had.
- **A PWA with push notifications.** Glance is a progressive web app, so you can install it to the home screen and it runs full screen like a native app. On iPad, this also avoids Safari's 7-day storage cap. Reminders can reach your phone as push notifications, even when Glance isn't open. You turn them on per phone in Settings.
- **Weather from [Open-Meteo](https://open-meteo.com).** The screen refreshes the forecast every 15 minutes, so what you see stays current, and it keeps the last forecast for when the Wi-Fi is down.

## Limits, and trying it

- Weather places are US only.
- Sign-in and the first load need a network. After that it works offline.
- This is the first release, so expect some bugs. I would love to hear your reports, and [pull requests on GitHub](https://github.com/vespaiach/glance) are welcome too.

Glance is free, and anyone can try it at [takeaglance.app](https://takeaglance.app). Put it on a spare screen for a week and see how it goes.
