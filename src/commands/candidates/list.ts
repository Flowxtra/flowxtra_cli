import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str, fullName, nestedName } from "../../lib/format";

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
      ["ID", "Name", "Location", "Source", "Stage"],
      rows.slice(0, this.flags.limit).map((c) => [
        str(pick(c, ["id", "candidate_job_id"])),
        fullName(c) || "—",
        str(pick(c, ["location"])) || "—",
        str(pick(c, ["source_name", "source"])) || "—",
        nestedName(c, "stage") || str(pick(c, ["stage_name", "stage_id"])) || "—",
      ]),
    );
  }
}
