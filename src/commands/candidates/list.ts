import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class CandidatesList extends BaseCommand<typeof CandidatesList> {
  static description = "List candidate applications across your jobs";
  static examples = ["$ flowxtra candidates list", "$ flowxtra candidates list --json"];
  static flags = {
    limit: Flags.integer({ description: "Max rows to display", default: 50 }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading candidates…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("candidate-job/index");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No candidates yet.");
      return;
    }

    ui.heading(`Candidates (${rows.length})`);
    ui.table(
      ["ID", "Name", "Job", "Stage", "Status"],
      rows.slice(0, this.flags.limit).map((c) => [
        str(pick(c, ["id", "candidate_job_id"])),
        str(pick(c, ["name", "full_name", "candidate_name", "first_name"])) || "—",
        str(pick(c, ["job_title", "job", "title"])) || "—",
        str(pick(c, ["stage", "stage_name", "current_stage"])) || "—",
        str(pick(c, ["status", "state"])) || "—",
      ]),
    );
  }
}
