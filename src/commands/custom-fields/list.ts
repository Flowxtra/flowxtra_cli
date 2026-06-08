import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class CustomFieldsList extends BaseCommand<typeof CustomFieldsList> {
  static description = "List your company's custom fields";
  static examples = ["$ flowxtra custom-fields list"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading custom fields…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("custom-fields/index");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No custom fields defined.");
      ui.hint('  Create one with: flowxtra custom-fields create --label "Department"');
      return;
    }
    ui.heading(`Custom fields (${rows.length})`);
    ui.table(
      ["ID", "Label", "Type", "Required", "On job form"],
      rows.map((f) => [
        str(pick(f, ["id"])),
        str(pick(f, ["label", "name"])) || "—",
        str(pick(f, ["type"])) || "—",
        pick(f, ["is_required"]) ? "yes" : "no",
        pick(f, ["show_on_job_form"]) ? "yes" : "no",
      ]),
    );
  }
}
