import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class CompanyPipelines extends BaseCommand<typeof CompanyPipelines> {
  static description = "List hiring pipelines and their stages";
  static examples = ["$ flowxtra company pipelines"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading pipelines…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("company-pipelines");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No pipelines found.");
      return;
    }
    ui.heading(`Pipelines (${rows.length})`);
    ui.table(
      ["ID", "Name", "Stages"],
      rows.map((p) => {
        const stages = pick(p, ["stages", "pipeline_stages", "stage_processes"]);
        const count = Array.isArray(stages) ? stages.length : pick(p, ["stages_count"]);
        return [str(pick(p, ["id"])), str(pick(p, ["name", "title"])) || "—", str(count) || "—"];
      }),
    );
  }
}
