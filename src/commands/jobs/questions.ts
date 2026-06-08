import { Args } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class JobsQuestions extends BaseCommand<typeof JobsQuestions> {
  static description = "List the application questions on a job";
  static examples = ["$ flowxtra jobs questions 8f2a"];
  static args = {
    job: Args.string({ description: "Job ID or hash ID", required: true }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading questions…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get(`job-application-form/index/${encodeURIComponent(this.args.job)}`);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    // The index returns { data: { job: {...}, job_appliction_question: [...] } }
    const data = (res as { data?: { job_appliction_question?: unknown } })?.data;
    const nested = data?.job_appliction_question;
    const rows: Record<string, unknown>[] = Array.isArray(nested) ? (nested as Record<string, unknown>[]) : toList(res);
    if (rows.length === 0) {
      ui.info("No custom application questions on this job.");
      ui.hint(`  Add one with: flowxtra jobs add-question ${this.args.job} --question "..."`);
      return;
    }
    ui.heading(`Application questions (${rows.length})`);
    ui.table(
      ["ID", "Question", "Type", "Required"],
      rows.map((q) => [
        str(pick(q, ["id"])),
        str(pick(q, ["question", "name"])) || "—",
        str(pick(q, ["answer_type", "type"])) || "—",
        pick(q, ["required"]) ? "yes" : "no",
      ]),
    );
  }
}
