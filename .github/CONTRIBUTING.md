# Contributing

Thank you for taking the time to improve this project. Focused bug fixes,
documentation improvements, tests, and well-scoped features are welcome.

## Before You Start

- Search existing issues and pull requests to avoid duplicate work.
- Open an issue before starting a large or breaking change so the approach can
  be discussed first.
- Report security vulnerabilities privately by following the
  [security policy](SECURITY.md).

## Development Workflow

1. Fork or clone the repository and create a branch from the default branch.
2. Follow the setup and development instructions in the repository README.
3. Keep changes focused and consistent with the existing code style.
4. Add or update tests and documentation when behavior changes.
5. Run the available lint, type-check, test, and build commands before opening
   a pull request.

Use a short, descriptive branch name such as `fix/cart-total` or
`feat/product-filter`. Write clear commit messages in the imperative mood and
avoid mixing unrelated changes in one commit.

## Pull Requests

Provide a concise description of the problem and solution. Link related issues
and include screenshots or recordings for visible interface changes.

Before requesting review, confirm that:

- [ ] the change is focused and contains no unrelated formatting;
- [ ] tests cover new or corrected behavior where practical;
- [ ] lint, type checks, tests, and builds pass locally when available;
- [ ] documentation is updated when usage or behavior changes;
- [ ] no secrets, credentials, generated artifacts, or debug code are included.

Be responsive to review feedback. Maintainers may request changes or close a
pull request that is out of scope, unsafe, or no longer aligned with the
project.

## Naming and Layout

- Use lowercase kebab-case for application filenames and directories, such as
  `forward-counter.tsx` and `components/counters`.
- Keep React component names in PascalCase and hook functions in camelCase with
  a `use` prefix (`ForwardCounter`, `useCounter`).
- Use `.tsx` for files containing JSX and `.ts` for TypeScript without JSX.
- Keep route files in `src/app`, reusable components in `src/components`, and
  reusable hooks in `src/hooks`. Preserve Next.js special filenames such as
  `page.tsx` and `layout.tsx`.
- Group tests by area under `tests`, matching the source filename with a
  `.test.ts` suffix, or `.test.tsx` when the test uses JSX.
- Preserve conventional tooling and documentation names such as `README.md`,
  `SECURITY.md`, and `package.json`.

## Formatting and Browser Checks

Run `npm run format` before committing and `npm run check` before review.
Install Chromium with `npm run test:browser:install`, then run
`npm run test:browser` for interaction and accessibility checks. Update the
recording with `npm run demo` when the counter experience changes.
