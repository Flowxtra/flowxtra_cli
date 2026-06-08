import { Args } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";

export default class WebhooksTest extends BaseCommand<typeof WebhooksTest> {
  static description = "Send a test ping to a webhook";
  static examples = ["$ flowxtra webhooks test 3"];
  static args = {
    id: Args.string({ description: "Webhook ID", required: true }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Sending test ping…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post(`plugins/webhooks/${encodeURIComponent(this.args.id)}/test`, {});
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    ui.success(`Test ping sent to webhook ${this.args.id}`);
  }
}
