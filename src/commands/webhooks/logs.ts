import { Args } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class WebhooksLogs extends BaseCommand<typeof WebhooksLogs> {
  static description = "Show recent delivery logs for a webhook";
  static examples = ["$ flowxtra webhooks logs 3"];
  static args = {
    id: Args.string({ description: "Webhook ID", required: true }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading logs…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get(`plugins/webhooks/${encodeURIComponent(this.args.id)}/logs`);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No deliveries yet.");
      return;
    }
    ui.heading(`Deliveries (${rows.length})`);
    ui.table(
      ["ID", "Event", "Status", "Code", "When"],
      rows.map((l) => [
        str(pick(l, ["id"])),
        str(pick(l, ["event", "event_type"])) || "—",
        str(pick(l, ["status", "state"])) || "—",
        str(pick(l, ["response_code", "status_code", "http_code"])) || "—",
        str(pick(l, ["created_at", "sent_at"])) || "—",
      ]),
    );
  }
}
