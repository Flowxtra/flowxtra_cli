import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui, cyan } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toItem, pick, str } from "../../lib/format";

export default class WebhooksCreate extends BaseCommand<typeof WebhooksCreate> {
  static description = "Create a webhook that POSTs recruitment events to a URL";
  static examples = [
    '$ flowxtra webhooks create --name "My CRM" --url https://example.com/hook --event application.created --event application.hired',
  ];

  static flags = {
    name: Flags.string({ description: "Webhook name", required: true }),
    url: Flags.string({ description: "HTTPS endpoint to receive events", required: true }),
    event: Flags.string({ description: "Event to subscribe to (repeatable). See: flowxtra webhooks events", multiple: true, required: true }),
  };

  async run(): Promise<void> {
    const body = { name: this.flags.name, url: this.flags.url, events: this.flags.event };

    const spinner = this.wantsJson ? null : ui.spinner("Creating webhook…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post("plugins/webhooks", body);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    const w = toItem(res);
    const id = str(pick(w, ["id"]));
    ui.success(`Created webhook “${this.flags.name}”${id ? ` (${id})` : ""} → ${this.flags.event.length} event(s)`);
    if (id) ui.hint(`  Send a test ping with: ${cyan(`flowxtra webhooks test ${id}`)}`);
  }
}
