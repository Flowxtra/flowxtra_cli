import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";

const STATUS: Record<string, string> = {
  publish: "Live",
  unpublish: "Draft",
  archive: "Archived",
  close: "Closed",
};

export default class JobsPublish extends BaseCommand<typeof JobsPublish> {
  static description = "Publish, unpublish, archive or close a job";
  static examples = ["$ flowxtra jobs publish 12", "$ flowxtra jobs publish 12 --action unpublish"];
  static args = {
    id: Args.string({ description: "Numeric job ID", required: true }),
  };
  static flags = {
    action: Flags.string({ description: "What to do", options: Object.keys(STATUS), default: "publish" }),
  };

  async run(): Promise<void> {
    const status = STATUS[this.flags.action];
    const spinner = this.wantsJson ? null : ui.spinner(`Setting status to ${status}…`).start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post(`jobs/updateStatus/${encodeURIComponent(this.args.id)}`, { status });
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    ui.success(`Job ${this.args.id} → ${status}`);
  }
}
