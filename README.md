# Focus Desk

[![Quality checks](https://github.com/fatmakahveci/react-ts-custom-hooks/actions/workflows/quality-checks.yml/badge.svg)](https://github.com/fatmakahveci/react-ts-custom-hooks/actions/workflows/quality-checks.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE.md)

A task manager with a focus timer, session history, and daily totals. Built with React, TypeScript, and Next.js.

## Demo

![Focus Desk demo](demo.gif)

## Features

- Create, edit, prioritize, search, and complete tasks.
- Start 15, 25, or 50-minute focus sessions with pause and resume controls.
- Take five-minute breaks and review daily focus totals.
- View recent sessions and export tasks and history as JSON.

Timers continue across page reloads. Completed focus sessions count toward daily totals; breaks and stopped sessions do not. Completing a session leaves its task open until you mark it done. Daily totals use your device's timezone.

The app supports 1,000 tasks and retains 5,000 sessions, with the latest ten shown in the history. JSON import is not supported.

## Storage

Hosted workspaces are stored per user in Cloudflare D1. Changes sync across tabs and devices every five seconds and when the window regains focus. Conflicting edits prompt you to reload the latest state and retry.

The preferred focus duration is stored in localStorage.

## Run locally

Use Node.js 22.13+ within 22.x, or 24.x, and npm.

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Local development uses SQLite at `.local/focus-desk.sqlite`. Set `FOCUS_DB_PATH` to change the location. The local server binds to loopback and uses a single workspace.

```bash
npm run build
npm start
```

For optional Sites deployment, configure a local Sites project and D1 binding before running `npm run build:sites`. The build includes static pages, the authenticated Worker API, and migrations from `drizzle/`. Deployment metadata is intentionally untracked; this repository no longer includes a Sites project association. Normal local Next.js development and builds do not require that metadata.

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

For an installed Chrome browser, use `PLAYWRIGHT_CHROMIUM_CHANNEL=chrome` with the browser or demo command.

CI runs formatting, lint, type checks, tests, and builds on Node.js 22 and 24. Playwright covers desktop and mobile workflows, including accessibility checks. API tests cover data validation, user isolation, and conflicting writes.

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

See the [contributing guide](.github/CONTRIBUTING.md), [security policy](.github/SECURITY.md), and [changelog](CHANGELOG.md).

Licensed under [Apache 2.0](LICENSE.md).
