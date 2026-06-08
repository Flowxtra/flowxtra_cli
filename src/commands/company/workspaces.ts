import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class CompanyWorkspaces extends BaseCommand<typeof CompanyWorkspaces> {
  static description = "List workspaces you can access";
  static examples = ["$ flowxtra company workspaces"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading workspaces…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("workspaces");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No workspaces found.");
      return;
    }
    ui.heading(`Workspaces (${rows.length})`);
    ui.table(
      ["ID", "Name", "Subdomain"],
      rows.map((w) => [
        str(pick(w, ["id", "tenant_id"])),
        str(pick(w, ["name", "company_name", "title"])) || "—",
        str(pick(w, ["subdomain", "domain"])) || "—",
      ]),
    );
  }
}
