import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class WebhooksEvents extends BaseCommand<typeof WebhooksEvents> {
  static description = "List the event types you can subscribe a webhook to";
  static examples = ["$ flowxtra webhooks events"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading events…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("plugins/webhooks/events");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    ui.heading(`Webhook events (${rows.length})`);
    ui.table(
      ["Event", "Description"],
      rows.map((e) => [str(pick(e, ["value", "key", "name"])) || "—", str(pick(e, ["label", "description"])) || "—"]),
    );
  }
}
