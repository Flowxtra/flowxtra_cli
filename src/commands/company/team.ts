import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class CompanyTeam extends BaseCommand<typeof CompanyTeam> {
  static description = "List team members in your workspace";
  static examples = ["$ flowxtra company team"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading team…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("company-users/index");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No team members found.");
      return;
    }
    ui.heading(`Team (${rows.length})`);
    ui.table(
      ["ID", "Name", "Email", "Role"],
      rows.map((u) => [
        str(pick(u, ["id"])),
        str(pick(u, ["name", "full_name", "first_name"])) || "—",
        str(pick(u, ["email"])) || "—",
        str(pick(u, ["role", "role_name", "user_role"])) || "—",
      ]),
    );
  }
}
