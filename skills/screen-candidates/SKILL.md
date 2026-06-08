---
name: screen-candidates
description: Use when the user wants to review applicants and move them through the hiring pipeline on Flowxtra (e.g. "show applicants for the backend role", "shortlist the top 5", "move Sara to interview", "reject this candidate"). Drives the `flowxtra` CLI candidate commands.
---

# Screen candidates on Flowxtra

Review and progress candidates through the pipeline via the `flowxtra` CLI. Requires the
CLI installed and authenticated.

## Steps

1. **Find the job and its applicants:**

   ```bash
   flowxtra jobs list --json                 # find the job hash
   flowxtra jobs candidates <job-hash> --json
   ```

   Each candidate row has an `id` (the candidate-job ID) you'll use below.

2. **Learn the pipeline stages** (you need a stage ID to move someone):

   ```bash
   flowxtra company pipelines --json
   ```

3. **Move a candidate to a stage** (optionally send the stage email template):

   ```bash
   flowxtra candidates move <candidate-job-id> --stage <stage-id> [--email]
   ```

4. **Reject (or undo a rejection):**

   ```bash
   flowxtra candidates reject <candidate-job-id>
   flowxtra candidates reject <candidate-job-id> --action undo
   ```

## Notes

- Sending stage emails (`--email`) and rejections are outward-facing — confirm with the
  user before doing them, especially in bulk.
- To "shortlist the top N", review candidates with `flowxtra candidates get <id> --json`
  and move the chosen ones to the shortlist/interview stage.
