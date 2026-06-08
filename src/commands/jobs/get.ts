import { Args } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toItem, pick, str } from "../../lib/format";

export default class JobsGet extends BaseCommand<typeof JobsGet> {
  static description = "Show a single job posting";
  static examples = ["$ flowxtra jobs get 8f2a"];
  static args = {
    id: Args.string({ description: "Job ID or hash ID", required: true }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading job…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get(`jobs/show/${encodeURIComponent(this.args.id)}`);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const job = toItem(res);
    ui.heading(str(pick(job, ["title", "name"])) || "Job");
    ui.table(
      ["Field", "Value"],
      [
        ["ID", str(pick(job, ["hash_id", "hashId", "id"]))],
        ["Status", str(pick(job, ["status", "status_by_admin", "state"])) || "—"],
        ["Workplace", str(pick(job, ["workplace", "work_place"])) || "—"],
        ["Employment", str(pick(job, ["employment_type", "employmentType"])) || "—"],
        ["Location", str(pick(job, ["location", "city", "address"])) || "—"],
        ["Applicants", str(pick(job, ["applicants_count", "candidates_count", "applications_count"])) || "0"],
      ],
    );
  }
}
