# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
where applicable.

## [Unreleased]

### Added

- Interactive debounce, local storage, and media query hooks with keyboard-accessible tabs.
- Unit and browser coverage for debounce cleanup, storage synchronization and failures, and media changes.

- Desktop/mobile Playwright tests and automated axe accessibility scans in CI.
- Shared Prettier formatting and a reproducible demo recording command.
- A Sites deployment pipeline, live preview link, and social preview metadata.

- Configurable step sizes, manual stepping, and per-counter Steady/Sprint/Slow presets.
- Live configuration examples with copy controls and an accessible clipboard fallback.
- A backward-compatible `useCounterController` API with explicit tick and reset controls.
- Guided experiments and regression coverage for stepping, presets, resets, and clipboard behavior.

- Keyboard skip navigation, a branded favicon, and screen-reader status announcements.
- Regression coverage for reset focus and multiple same-direction counter instances.
- CI checks on Node.js 22 and 24, with a separate dependency audit.

- Responsive Hook Lab playground with labeled controls and a hook usage example.
- Independent pause/resume, tick interval selection, and reset controls.
- Optional running and interval settings for `useCounter`, preserving its boolean API.
- Behavioral coverage for timer lifecycle, Strict Mode, invalid delays, and UI interactions.
- ESLint flat configuration, type checking, a combined quality command, and Node version guidance.

### Changed

- Extracted typed counter defaults and controlled settings fields; documented timer and clipboard lifecycle decisions.
- Expanded regression coverage for unchanged rerenders, resets at zero, paused presets, and asynchronous clipboard ordering.

- Refreshed the playground with a lavender and navy palette, distinct counter accents, compact controls, a hook diagram, and an updated demo recording.

- Standardized application filenames to kebab-case, moved reusable components and hooks outside the route directory, and grouped tests by area.
- Renamed the CI workflow to `quality-checks.yml` and updated import paths and documentation.

- Corrected the package identity and removed unused dependencies and components.
- Expanded CI to run lint, type checking, tests, and production builds.
- Documented setup, hook semantics, accessibility, and project structure.
- Enabled Dependabot updates for npm dependencies.

### Fixed

- Increased muted text contrast across the new experiment tabs.

- Preserved keyboard focus when resetting a counter and generated unique control IDs for repeated instances.
- Updated Next.js and its ESLint configuration to 16.3.6 and sharp to 0.35.4 to resolve reported dependency advisories.

- Replaced the placeholder body class and added page metadata.
