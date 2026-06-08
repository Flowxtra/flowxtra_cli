<div align="center">

# Flowxtra CLI

**Run your hiring from the terminal — post jobs, screen candidates and manage pipelines.**

[![npm](https://img.shields.io/npm/v/@flowxtra/cli.svg)](https://www.npmjs.com/package/@flowxtra/cli)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)

</div>

The **Flowxtra CLI** (`@flowxtra/cli`) is a scriptable, CI-ready command-line tool for
[Flowxtra](https://flowxtra.com) — the multi-channel recruiting platform. It works on its
own and as the engine behind Flowxtra **skills** for Claude, Cursor, Codex and other AI agents.

> ⚠️ **Status: in active development.** Commands and the package name may change before the
> first stable release.

> 💡 **Posting jobs on Flowxtra is free.** `flowxtra jobs create` uses Flowxtra's
> [free job posting](https://flowxtra.com/free-job-posting) — publish a role to your career
> page (and partner channels) without a credit card.

## Install

```bash
npm install -g @flowxtra/cli
```

Requires Node.js 18+.

## Sign in

```bash
flowxtra auth login
```

Opens your browser, signs you in with OAuth 2.0 (PKCE), and stores a long-lived API token
at `~/.flowxtra/config.json` (readable only by you).

```bash
flowxtra auth whoami     # show the signed-in account
flowxtra auth status     # show connection details
flowxtra auth logout     # remove the local token
```

## Usage

```bash
flowxtra jobs create --title "Senior Backend Engineer" --workplace Remote
flowxtra jobs list
flowxtra jobs candidates <job-hash>
flowxtra candidates move 42 --stage 5 --email
```

Add `--json` to any command for machine-readable output. Global flags: `--json`, `--no-color`.
Run `flowxtra --help` to see every command.

## Commands

| Group | Commands |
|---|---|
| `auth` | `login` · `logout` · `whoami` · `status` |
| `jobs` | `list` · `get` · `candidates` · `create` · `publish` |
| `candidates` | `list` · `get` · `move` · `reject` |
| `company` | `info` · `offices` · `pipelines` · `team` · `workspaces` |
| `meetings` | `list` · `create` |
| `social` | `accounts` · `posts` · `post` |
| `api` | `<path>` — authenticated request to any Flowxtra endpoint |

## Use with AI agents

Install the Flowxtra **skills** so your agent can drive the CLI for you:

```bash
npx skills add Flowxtra/flowxtra_cli
```

Then just ask your agent: **"Post a job with Flowxtra."** See [`skills/`](./skills) for details.

## Development

```bash
npm install
npm run build
./bin/dev.js --help     # run from TypeScript source
./bin/run.js --help     # run the compiled build
```

Point the CLI at a non-production API with `FLOWXTRA_API_URL`, and use an isolated config
with `FLOWXTRA_CONFIG_DIR`.

## Contributing

Issues and pull requests are welcome at
[github.com/Flowxtra/flowxtra_cli](https://github.com/Flowxtra/flowxtra_cli/issues).
Please don't commit credentials — the CLI stores tokens locally, never in the repo.

---

<div align="center">

Made by **[Flowxtra GmbH](https://flowxtra.com)** · Wipplingerstraße 20/18, 1010 Vienna, Austria · office@flowxtra.com

Licensed under [MIT](./LICENSE).

</div>
