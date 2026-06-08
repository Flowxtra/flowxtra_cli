---
name: post-job
description: Use when the user wants to create and publish a job posting on Flowxtra (e.g. "post a job", "open a role for a Senior Backend Engineer", "publish a remote designer position with Flowxtra"). Walks through gathering the details, creating the job, and optionally publishing it and announcing it on social media.
---

# Post a job on Flowxtra

Create a job posting through the `flowxtra` CLI. Requires the CLI installed and
authenticated (`flowxtra auth status` → `authenticated: true`).

## Steps

1. **Gather the essentials** (ask the user for anything missing):
   - Title (required)
   - Workplace: On-site / Remote / Hybrid
   - Employment type: Full-time / Part-time / Contract / Internship / Freelance
   - A short description and/or requirements

2. **Create as a draft first** so the user can review:

   ```bash
   flowxtra jobs create --title "Senior Backend Engineer" \
     --workplace Remote --employment-type Full-time \
     --description "<short HTML description>" --status Draft --json
   ```

   Read the returned `id` / `hash_id` from the JSON.

3. **Confirm, then publish** (publishing makes it public — always confirm first):

   ```bash
   flowxtra jobs publish <id> --action publish
   ```

4. **Offer to announce it on social media.** Check connected accounts:

   ```bash
   flowxtra social accounts --json
   ```

   If any are connected and the user agrees, draft a short post and publish it:

   ```bash
   flowxtra social post --content "We're hiring a Senior Backend Engineer! Apply: <apply-url>" --account <id>
   ```

   If no accounts are connected, tell the user they can connect one in the dashboard.

## Notes

- Default to **Draft** and confirm before publishing or posting publicly.
- If `jobs create` rejects a missing field, pass it with `--field key=value` (or fall
  back to `flowxtra api jobs/store --method POST --field ...`).
