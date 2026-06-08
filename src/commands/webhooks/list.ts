import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class WebhooksList extends BaseCommand<typeof WebhooksList> {
  static description = "List your configured webhooks";
  static examples = ["$ flowxtra webhooks list"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading webhooks…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("plugins/webhooks");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No webhooks configured.");
      ui.hint('  Create one with: flowxtra webhooks create --name "X" --url https://… --event application.created');
      return;
    }
    ui.heading(`Webhooks (${rows.length})`);
    ui.table(
      ["ID", "Name", "URL", "Events", "Active"],
      rows.map((w) => {
        const events = pick(w, ["events"]);
        const count = Array.isArray(events) ? events.length : str(events);
        return [
          str(pick(w, ["id"])),
          str(pick(w, ["name"])) || "—",
          str(pick(w, ["url"])) || "—",
          str(count) || "0",
          pick(w, ["status", "is_active", "active"]) ? "yes" : "no",
        ];
      }),
    );
  }
}
