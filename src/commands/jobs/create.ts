import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui, cyan } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toItem, pick, str } from "../../lib/format";

export default class JobsCreate extends BaseCommand<typeof JobsCreate> {
  static description = "Create a new job posting";
  static examples = [
    '$ flowxtra jobs create --title "Senior Backend Engineer" --workplace Remote',
    '$ flowxtra jobs create --title "Designer" --status Live --field category_id=3',
  ];

  static flags = {
    title: Flags.string({ description: "Job title", required: true }),
    description: Flags.string({ description: "Job description (HTML supported)" }),
    requirements: Flags.string({ description: "Job requirements" }),
    "employment-type": Flags.string({ description: "Employment type", options: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"] }),
    workplace: Flags.string({ description: "Workplace type", options: ["On-site", "Remote", "Hybrid"] }),
    status: Flags.string({ description: "Job status", options: ["Live", "Draft"], default: "Draft" }),
    field: Flags.string({ description: "Extra body field as key=value (repeatable)", multiple: true }),
  };

  async run(): Promise<void> {
    const body: Record<string, unknown> = {
      title: this.flags.title,
      status: this.flags.status,
    };
    if (this.flags.description) body.description = this.flags.description;
    if (this.flags.requirements) body.requirements = this.flags.requirements;
    if (this.flags["employment-type"]) body.employment_type = this.flags["employment-type"];
    if (this.flags.workplace) body.workplace = this.flags.workplace;
    for (const kv of this.flags.field ?? []) {
      const idx = kv.indexOf("=");
      if (idx > 0) body[kv.slice(0, idx)] = kv.slice(idx + 1);
    }

    const spinner = this.wantsJson ? null : ui.spinner("Creating job…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post("jobs/store", body);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const job = toItem(res);
    const id = str(pick(job, ["hash_id", "hashId", "id"]));
    ui.success(`Created “${this.flags.title}”${id ? ` (${id})` : ""} as ${this.flags.status}`);
    if (this.flags.status === "Draft") ui.hint(`  Publish it with: ${cyan(`flowxtra jobs publish ${id || "<id>"}`)}`);
  }
}
