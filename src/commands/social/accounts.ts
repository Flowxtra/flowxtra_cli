import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class SocialAccounts extends BaseCommand<typeof SocialAccounts> {
  static description = "List connected social media accounts";
  static examples = ["$ flowxtra social accounts"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading accounts…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("social-accounts");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No social accounts connected.");
      ui.hint("  Connect one from the dashboard, then post with: flowxtra social post");
      return;
    }
    ui.heading(`Social accounts (${rows.length})`);
    ui.table(
      ["ID", "Platform", "Name", "Status"],
      rows.map((a) => [
        str(pick(a, ["id"])),
        str(pick(a, ["platform", "provider", "type"])) || "—",
        str(pick(a, ["name", "account_name", "username", "handle"])) || "—",
        str(pick(a, ["status", "state"])) || (pick(a, ["connected"]) ? "connected" : "—"),
      ]),
    );
  }
}
