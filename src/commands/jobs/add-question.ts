import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";

export default class JobsAddQuestion extends BaseCommand<typeof JobsAddQuestion> {
  static description = "Add a custom application question to a job";
  static examples = [
    '$ flowxtra jobs add-question 8f2a --question "Years of experience?" --type number --required',
    '$ flowxtra jobs add-question 8f2a --question "Preferred start date?" --type select --answer "ASAP" --answer "1 month"',
  ];
  static args = {
    job: Args.string({ description: "Job ID or hash ID", required: true }),
  };
  static flags = {
    question: Flags.string({ description: "The question text", required: true }),
    type: Flags.string({ description: "Answer type", default: "text", options: ["text", "number", "date", "select", "boolean", "file"] }),
    required: Flags.boolean({ description: "Make the question required", default: false }),
    answer: Flags.string({ description: "Choice for select-type questions (repeatable)", multiple: true }),
  };

  async run(): Promise<void> {
    const body: Record<string, unknown> = {
      question: this.flags.question,
      type: this.flags.type,
      required: this.flags.required,
    };
    if (this.flags.answer?.length) body.answers = this.flags.answer.map((fild) => ({ fild }));

    const spinner = this.wantsJson ? null : ui.spinner("Adding question…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post(`job-application-form/add/${encodeURIComponent(this.args.job)}`, body);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    ui.success(`Added question to job ${this.args.job}`);
  }
}
