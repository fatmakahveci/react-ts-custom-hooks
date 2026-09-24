# Security Policy

## Project Scope

Hook Lab (`react-ts-custom-hooks`) is an educational Next.js application that
demonstrates reusable React hooks through interactive counters. It does not
implement user accounts, payments, or a database. Security reports may still
concern application code, dependencies, build configuration, or repository
workflows.

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
