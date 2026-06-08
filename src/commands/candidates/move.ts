import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";

export default class CandidatesMove extends BaseCommand<typeof CandidatesMove> {
  static description = "Move a candidate to a different pipeline stage";
  static examples = ["$ flowxtra candidates move 42 --stage 5", "$ flowxtra candidates move 42 --stage 5 --email"];
  static args = {
    id: Args.string({ description: "Candidate job ID", required: true }),
  };
  static flags = {
    stage: Flags.integer({ description: "Target pipeline stage ID (see: flowxtra company pipelines)", required: true }),
    email: Flags.boolean({ description: "Also send the stage email template to the candidate", default: false }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Moving candidate…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post(`candidate-job/updateStage/${encodeURIComponent(this.args.id)}`, {
        stage_id: this.flags.stage,
        send_email: this.flags.email,
      });
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    ui.success(`Candidate ${this.args.id} moved to stage ${this.flags.stage}${this.flags.email ? " (email sent)" : ""}`);
  }
}
