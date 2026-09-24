# Focus Desk

[![Quality checks](https://github.com/fatmakahveci/react-ts-custom-hooks/actions/workflows/quality-checks.yml/badge.svg)](https://github.com/fatmakahveci/react-ts-custom-hooks/actions/workflows/quality-checks.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE.md)

**One task. Your full attention.** A personal workspace for turning a task list into focused work, built with React, TypeScript, and Next.js.

## Demo

[Open Focus Desk](https://hook-lab-fatmakahveci.fatmakhv.chatgpt.site/)

Private deployment; owner sign-in required.

## What you can do

1. Add a concrete task and choose its priority.
2. Select it and start a 15, 25, or 50-minute focus session.
3. Pause, resume, or take a five-minute break.
4. Complete the task and review your recorded focus time for today.

Tasks can be renamed, searched, completed, reopened, and deleted with confirmation. Export your tasks and session history as JSON whenever you need a copy. Exports are downloads; importing or restoring exports is not implemented.

The app starts empty. Progress comes from completed focus sessions, not sample metrics. The latest ten sessions are shown; up to 5,000 are retained in exports. Up to 1,000 tasks are supported.

## How your work is saved

The hosted app stores each signed-in user's workspace in Cloudflare D1, keyed by the identity supplied by Sites. Tasks, session history, and an active timer belong to that user. Other tabs and devices refresh every five seconds and when the window regains focus. Revision checks reject stale writes instead of silently overwriting newer changes; review the refreshed workspace and retry the action.

A running timer stores an absolute deadline. Refreshing or closing the page does not reset it. If the deadline passes while the app is closed, reopening records completion once. A paused timer stays paused. Stopping early does not add focus time; breaks do not count toward focus totals. The selected task remains open until you explicitly mark it complete. Daily totals use the viewing device's local timezone.

Tasks and history are not stored in localStorage. Only the preferred focus duration is device-local.

## Run locally

Use Node.js 22.13+ within 22.x, or 24.x, and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Local development uses one personal SQLite workspace in `.local/focus-desk.sqlite`, which is ignored by Git. Set `FOCUS_DB_PATH` to use another file. This local mode is bound to loopback and is not a multi-user hosting configuration. Hosted authentication and D1 are handled by the Sites worker.

```bash
npm run build
npm start
```

The separate Sites build exports the UI and bundles the authenticated Worker API. `.openai/hosting.json` declares the existing project and its logical D1 binding. Drizzle migrations in `drizzle/` travel with the deployment; the API also initializes the same table for a fresh database.

## Commands

| Command                        | Purpose                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `npm run check`                | Formatting, lint, TypeScript, unit/API tests, and production build |
| `npm run test:watch`           | Watch unit tests                                                   |
| `npm run test:browser:install` | Install Chromium once                                              |
| `npm run test:browser`         | Desktop/mobile workflow and accessibility tests                    |
| `npm run demo`                 | Regenerate the GIF using an isolated temporary database            |
| `npm run format`               | Format source and documentation                                    |
| `npm run audit`                | Audit dependencies                                                 |
| `npm run db:generate`          | Generate a migration after a schema change                         |
| `npm run build:sites`          | Build static pages and the D1-backed Sites worker                  |

For an installed Chrome browser, use `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome` with the browser or demo command. Automated accessibility scans supplement manual review; they are not a claim of full conformance.

CI checks Node.js 22 and 24, dependency security, and desktop/mobile browser behavior. API tests run the actual Worker handler against SQLite, covering user isolation, validation, corrupt records, cross-origin writes, and conflicting revisions. Browser tests isolate API state to keep parallel runs independent. A separate integration test and the demo recorder exercise the real local API against dedicated databases.

## Project structure

```text
src/app/                    Focus Desk and local API
src/components/focus/       Task workspace and focus interface
src/hooks/                  Reusable hooks and workspace client
src/lib/                    Workspace validation, timer rules, API handler
db/                         Database schema and shared SQL
sites/worker.ts             Authenticated D1 API and static asset serving
drizzle/                    Versioned database migrations
tests/                      Hook, API, and browser coverage
scripts/                    Demo recorder and deployment build
```

## Contributing and security

Read the [contributing guide](.github/CONTRIBUTING.md), [security policy](.github/SECURITY.md), and [changelog](CHANGELOG.md). The repository retains its original `react-ts-custom-hooks` package name and Apache 2.0 license.
