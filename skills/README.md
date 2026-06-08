# Flowxtra Skills

Agent skills that let Claude, Cursor, Codex and other AI agents run hiring tasks on
[Flowxtra](https://flowxtra.com) through the **Flowxtra CLI**.

## Install

```bash
# 1. Install the CLI (the skills drive it)
npm install -g @flowxtra/cli
flowxtra auth login

# 2. Add the skills to your agent
npx skills add Flowxtra/flowxtra_cli
```

Then just ask your agent: **"Post a job with Flowxtra."**

## Skills in this bundle

| Skill | What it does |
|---|---|
| `flowxtra` | Core skill — teaches the agent the full `flowxtra` CLI surface. |
| `post-job` | Create and publish a job posting end to end. |
| `screen-candidates` | Review applicants and move them through the pipeline. |

All skills require the `flowxtra` CLI to be installed and authenticated
(`flowxtra auth status` should report `Authenticated: yes`).
