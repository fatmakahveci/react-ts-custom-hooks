# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
where applicable.

## [Unreleased]

### Added

- Responsive Hook Lab playground with labeled controls and a hook usage example.
- Independent pause/resume, tick interval selection, and reset controls.
- Optional running and interval settings for `useCounter`, preserving its boolean API.
- Behavioral coverage for timer lifecycle, Strict Mode, invalid delays, and UI interactions.
- ESLint flat configuration, type checking, a combined quality command, and Node version guidance.

### Changed

- Refreshed the playground with a lavender and navy palette, distinct counter accents, compact controls, a hook diagram, and an updated demo recording.

- Standardized application filenames to kebab-case, moved reusable components and hooks outside the route directory, and grouped tests by area.
- Renamed the CI workflow to `quality-checks.yml` and updated import paths and documentation.

- Corrected the package identity and removed unused dependencies and components.
- Expanded CI to run lint, type checking, tests, and production builds.
- Documented setup, hook semantics, accessibility, and project structure.
- Enabled Dependabot updates for npm dependencies.

### Fixed

- Replaced the placeholder body class and added page metadata.
