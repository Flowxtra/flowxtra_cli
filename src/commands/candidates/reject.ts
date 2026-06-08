import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";

export default class CandidatesReject extends BaseCommand<typeof CandidatesReject> {
  static description = "Reject a candidate application (or undo a rejection)";
  static examples = ["$ flowxtra candidates reject 42", "$ flowxtra candidates reject 42 --action undo"];
  static args = {
    id: Args.string({ description: "Candidate job ID", required: true }),
  };
  static flags = {
    action: Flags.string({ description: "reject or undo", options: ["reject", "undo"], default: "reject" }),
  };

  async run(): Promise<void> {
    const path = this.flags.action === "undo" ? "candidate-job/undoReject" : "candidate-job/reject";
    const spinner = this.wantsJson ? null : ui.spinner(`${this.flags.action === "undo" ? "Undoing rejection" : "Rejecting"}…`).start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post(`${path}/${encodeURIComponent(this.args.id)}`, {});
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    ui.success(this.flags.action === "undo" ? `Rejection undone for candidate ${this.args.id}` : `Candidate ${this.args.id} rejected`);
  }
}
