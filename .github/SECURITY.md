# Security Policy

## Project Scope

Focus Desk is a personal task and focus application built with Next.js and a Sites Worker. The hosted API requires the platform-provided authenticated user ID and isolates workspaces by that ID in D1. It validates request data, rejects cross-origin writes, and uses optimistic concurrency to prevent stale overwrites. Workspace writes require a matching Origin header and application/json, and request bodies are limited to 1,000,000 bytes while streaming. Only the Sites dispatch boundary should supply trusted identity headers; do not expose the Worker behind an untrusted header-forwarding proxy.

Local Next.js mode uses one SQLite workspace and binds to loopback. It has no account system and is not intended for shared hosting. Local database files are ignored by Git. JSON exports contain task titles and session history; they are user-requested downloads, not encrypted backups.

Only the focus-duration preference uses localStorage. Tasks and session history do not. Reports may concern application code, authentication boundaries, data isolation, dependencies, build configuration, or repository workflows.

## Supported Versions

Security fixes target the latest code on the `main` branch. Older commits,
release snapshots, and forks do not receive maintained security backports.
Users running their own deployment are responsible for applying updates and
securing their hosting environment.

## Reporting a Vulnerability

Please report suspected vulnerabilities privately through
[GitHub's vulnerability reporting form](https://github.com/fatmakahveci/react-ts-custom-hooks/security/advisories/new).
Do not post exploit details, credentials, or other sensitive information in
public issues, discussions, or pull requests.

If private reporting is unavailable, check the
[maintainer's GitHub profile](https://github.com/fatmakahveci) for an available
contact method and request a private reporting channel. Do not include
vulnerability details in a public contact request.

Include the following where possible:

- The affected file, dependency, or workflow, and the commit or release tested.
- A description of the issue, its prerequisites, and its potential impact.
- Minimal reproduction steps or a proof of concept using synthetic data.
- Relevant Node.js, npm, operating system, and browser versions.
- Redacted logs or screenshots, and any suggested fix or mitigation.

An incomplete report is welcome when you have a credible security concern.
Never include real secrets, personal data, or information belonging to others.

## Review and Disclosure

The maintainer will review reports, request clarification when needed, and
assess whether the issue affects this project. Confirmed issues may be addressed
through a code change, dependency update, or documented mitigation.

Please coordinate public disclosure with the maintainer so a fix or mitigation
can be made available first. Contributor credit can be discussed privately;
reporters may request anonymity.

This project is maintained on a best-effort basis. No fixed response or
resolution time, paid support, or bug bounty is promised.

## Responsible Testing

Reproduce issues in a local checkout or an environment you own or have explicit
permission to test. Avoid accessing other people's data, disrupting services,
or modifying resources outside that authorized environment. Stop testing and
report privately if sensitive information is encountered.

For a dependency advisory, include the affected installed version and explain
how the vulnerable behavior can be reached in this application when known.
Ordinary bugs, feature requests, and documentation improvements can be reported
through [public issues](https://github.com/fatmakahveci/react-ts-custom-hooks/issues).
