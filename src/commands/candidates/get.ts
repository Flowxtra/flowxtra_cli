import { Args } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toItem, pick, str } from "../../lib/format";

export default class CandidatesGet extends BaseCommand<typeof CandidatesGet> {
  static description = "Show a single candidate application";
  static examples = ["$ flowxtra candidates get 42"];
  static args = {
    id: Args.string({ description: "Candidate job ID", required: true }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading candidate…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get(`candidate-job/show/${encodeURIComponent(this.args.id)}`);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const c = toItem(res);
    ui.heading(str(pick(c, ["name", "full_name", "candidate_name"])) || "Candidate");
    ui.table(
      ["Field", "Value"],
      [
        ["ID", str(pick(c, ["id", "candidate_job_id"]))],
        ["Email", str(pick(c, ["email", "candidate_email"])) || "—"],
        ["Phone", str(pick(c, ["phone", "mobile"])) || "—"],
        ["Job", str(pick(c, ["job_title", "job", "title"])) || "—"],
        ["Stage", str(pick(c, ["stage", "stage_name", "current_stage"])) || "—"],
        ["Status", str(pick(c, ["status", "state"])) || "—"],
      ],
    );
  }
}
