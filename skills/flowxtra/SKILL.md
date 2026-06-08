---
name: flowxtra
description: Use when the user wants to manage hiring on Flowxtra — post or list jobs, review or move candidates, schedule interviews, or publish social posts. Drives the `flowxtra` CLI (an ATS / recruiting platform). Trigger on "post a job", "with Flowxtra", "shortlist candidates", "move candidate to <stage>", "our applicants", "schedule an interview".
---

# Flowxtra CLI

Run hiring tasks on Flowxtra through its command-line tool. Every action is a
`flowxtra` subcommand. Add `--json` to any command to get machine-readable output you
can parse.

## Before you start

Check the user is signed in:

```bash
flowxtra auth status --json
```

If `authenticated` is `false`, tell the user to run `flowxtra auth login` (it opens a
browser — you cannot do it for them). Do not proceed until they are signed in.

## Command reference

```bash
# Jobs
flowxtra jobs list --json
flowxtra jobs get <id> --json
flowxtra jobs candidates <job-hash> --json
flowxtra jobs create --title "<title>" [--description "<html>"] \
    [--workplace On-site|Remote|Hybrid] \
    [--employment-type Full-time|Part-time|Contract|Internship|Freelance] \
    [--status Live|Draft]
flowxtra jobs publish <id> [--action publish|unpublish|archive|close]

# Candidates
flowxtra candidates list --json
flowxtra candidates get <candidate-job-id> --json
flowxtra candidates move <candidate-job-id> --stage <stage-id> [--email]
flowxtra candidates reject <candidate-job-id> [--action reject|undo]

# Company
flowxtra company info --json
flowxtra company pipelines --json     # use this to find stage IDs for `candidates move`
flowxtra company offices --json
flowxtra company team --json
flowxtra company workspaces --json

# Meetings & social
flowxtra meetings list --json
flowxtra meetings create --title "<title>" [--candidate <id>] [--start "<datetime>"] [--type google_meet|zoom|jitsi]
flowxtra social accounts --json
flowxtra social posts --json
flowxtra social post --content "<text>" [--account <id>...] [--schedule "<datetime>"]

# Escape hatch — any endpoint
flowxtra api <path> [--method POST] [--field key=value ...]
```

## How to work

1. Prefer `--json` so you can read and summarize results precisely.
2. To move a candidate you need a **stage ID** — get it from `flowxtra company pipelines --json` first.
3. New jobs default to **Draft**. Publish explicitly with `flowxtra jobs publish <id>` (or pass `--status Live` on create) — but confirm with the user before publishing anything public-facing.
4. Creating or sending things (publishing jobs, sending stage emails, posting to social) is outward-facing — confirm with the user before running those.
5. If a specific subcommand doesn't expose a field you need, use `flowxtra api` with `--field key=value`.

For focused workflows see the **post-job** and **screen-candidates** skills.
