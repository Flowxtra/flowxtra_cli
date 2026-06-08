import { Args } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";

export default class WebhooksDelete extends BaseCommand<typeof WebhooksDelete> {
  static description = "Delete a webhook";
  static examples = ["$ flowxtra webhooks delete 3"];
  static args = {
    id: Args.string({ description: "Webhook ID", required: true }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Deleting webhook…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.request(`plugins/webhooks/${encodeURIComponent(this.args.id)}`, { method: "DELETE" });
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    ui.success(`Webhook ${this.args.id} deleted`);
  }
}
