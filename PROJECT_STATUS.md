# Project Status

## Overview
- **Project Name**: Ham Radio Study App
- **Status**: Active
- **Last Updated**: 2026-02-08
- **Port**: 4000
- **Deployment**: PM2 (local) + PWA

## Description
A study app to help prepare for the FCC Amateur Radio Technician Class license exam with 411 questions, spaced repetition, and progress tracking.

## Current Focus
PWA deployment and mobile access via local network.

## To-Do List
- [x] Set up PM2 for persistent server
- [x] Add PWA support (manifest, service worker, icons)
- [x] Install as app on phone via Chrome
- [ ] Consider cloud hosting (Vercel or VPS) for remote access
- [ ] Continue studying for license exam

## Recommended Next Steps
1. Study for the FCC exam using the app
2. Consider cloud deployment for access outside home network
3. Prepare for app store submission if desired

## Recent Accomplishments
- All 411 Technician questions loaded
- 10 topic-based lessons complete
- Spaced repetition system working
- Study streaks and achievements implemented
- Dark mode available
- PM2 deployment configured (port 4000)
- PWA installable via Chrome on phone
- Docker removed in favor of PM2

## Notes
Progress is saved in browser localStorage. Be careful about clearing browser data.
Question pool valid 2022-2026.
