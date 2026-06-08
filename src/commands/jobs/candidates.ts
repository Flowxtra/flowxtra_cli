import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class JobsCandidates extends BaseCommand<typeof JobsCandidates> {
  static description = "List candidates who applied to a job";
  static examples = ["$ flowxtra jobs candidates 8f2a"];
  static args = {
    job: Args.string({ description: "Job hash ID", required: true }),
  };
  static flags = {
    limit: Flags.integer({ description: "Max rows to display", default: 50 }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading candidates…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get(`applicantJobForJob/${encodeURIComponent(this.args.job)}`);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No candidates yet for this job.");
      return;
    }

    ui.heading(`Candidates (${rows.length})`);
    ui.table(
      ["ID", "Name", "Email", "Stage", "Applied"],
      rows.slice(0, this.flags.limit).map((c) => [
        str(pick(c, ["id", "candidate_job_id", "candidateJobId"])),
        str(pick(c, ["name", "full_name", "candidate_name", "first_name"])) || "—",
        str(pick(c, ["email", "candidate_email"])) || "—",
        str(pick(c, ["stage", "stage_name", "current_stage"])) || "—",
        str(pick(c, ["created_at", "applied_at", "appliedAt"])) || "—",
      ]),
    );
  }
}
