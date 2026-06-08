import { Args } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";

export default class CustomFieldsDelete extends BaseCommand<typeof CustomFieldsDelete> {
  static description = "Delete a company custom field";
  static examples = ["$ flowxtra custom-fields delete 7"];
  static args = {
    id: Args.string({ description: "Custom field ID", required: true }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Deleting custom field…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.request(`custom-fields/destroy/${encodeURIComponent(this.args.id)}`, { method: "DELETE" });
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    ui.success(`Custom field ${this.args.id} deleted`);
  }
}
