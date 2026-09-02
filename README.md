# React Custom Hooks Demo

[![React](https://img.shields.io/badge/React-TypeScript-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-React-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Last commit](https://img.shields.io/github/last-commit/fatmakahveci/react-ts-custom-hooks)](https://github.com/fatmakahveci/react-ts-custom-hooks/commits/main)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE.md)

A small Next.js and TypeScript project that extracts reusable timer behavior into a custom React hook.

## Highlights

- Forward and backward counters with independent intervals
- Shared counter behavior through `use-counter`
- Effect cleanup for timer lifecycle safety
- Typed, reusable presentation components

## Technology

- Next.js
- React
- TypeScript
- React Hooks

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Quality Checks

```bash
npm run lint
npm run build
```

## Repository Structure

- `src/app/hooks/use-counter.tsx` — reusable counter hook
- `src/app/components/ForwardCounter` — incrementing example
- `src/app/components/BackwardCounter` — decrementing example

## Project Resources

- [Changelog](CHANGELOG.md)
- [Contributing guide](.github/CONTRIBUTING.md)
- [Security policy](.github/SECURITY.md)
- [License](LICENSE.md)
