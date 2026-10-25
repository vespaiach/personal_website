---
description: Maintaining absporu.ca, the WordPress/Elementor site of Alberta's SPOR SUPPORT Unit, plus custom Elementor widgets and a retrying Mailchimp sync.
---

# AbSPORU (Alberta SPOR SUPPORT Unit)

[absporu.ca](https://absporu.ca/) · **Role:** Maintain · **Platform:** WordPress (Elementor)

The Alberta SPOR SUPPORT Unit is a health research organization that connects patients, clinicians, and researchers across Alberta's patient-oriented research network. Its site carries training and event listings, patient-partner opportunities, research service applications, and navigation for researchers, patients, and policy-makers.

## What I did

I maintain the site on an ongoing basis: publishing and updating content, building and adjusting Elementor pages and sections, keeping plugins, theme, and core up to date, and troubleshooting issues as they come up. Throughout, I keep the front end fast, accessible, and easy for non-technical staff to update themselves.

## The problem I solved

Staff needed to build new pages without drifting from the site's look. I built custom Elementor widgets for buttons, feature photos, bar charts, line charts, and more, all styled to match the site, so admins can put together on-brand pages without touching CSS.

I also connected the site's subscribe forms to Mailchimp for email marketing. Calls to Mailchimp can fail, so subscribers go through a small job queue built on Action Scheduler that retries failed sends. No sign-up gets lost.

**Stack:** WordPress, Elementor, PHP, Action Scheduler, Mailchimp API
