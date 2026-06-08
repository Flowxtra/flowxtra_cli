import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui, cyan } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, toItem, pick, str } from "../../lib/format";

export default class JobsCreate extends BaseCommand<typeof JobsCreate> {
  static description = "Create a new job posting (auto-fills office, pipeline and sensible defaults)";
  static examples = [
    '$ flowxtra jobs create --title "Senior Backend Engineer" --workplace Remote',
    '$ flowxtra jobs create --title "Designer" --status Live --min-salary 3000 --max-salary 4500 --skill Figma --skill UX',
    '$ flowxtra jobs create --title "Nurse" --city Vienna --country 15 --field some_extra=value',
  ];

  static flags = {
    title: Flags.string({ description: "Job title", required: true }),
    description: Flags.string({ description: "Job description (HTML supported)" }),
    requirements: Flags.string({ description: "Job requirements (HTML supported)" }),
    workplace: Flags.string({ description: "Workplace type", options: ["On-site", "Remote", "Hybrid"], default: "On-site" }),
    status: Flags.string({ description: "Job status", options: ["Live", "Draft"], default: "Draft" }),
    seniority: Flags.string({ description: "Seniority level (e.g. Junior, Mid, Senior)" }),
    "min-salary": Flags.integer({ description: "Minimum salary" }),
    "max-salary": Flags.integer({ description: "Maximum salary" }),
    currency: Flags.string({ description: "Currency code (defaults to the company currency)" }),
    hours: Flags.integer({ description: "Weekly working hours" }),
    language: Flags.string({ description: "Application language", default: "en" }),
    office: Flags.integer({ description: "Office ID (defaults to the company's default office)" }),
    pipeline: Flags.integer({ description: "Pipeline ID (defaults to the default pipeline)" }),
    city: Flags.string({ description: "Custom location city" }),
    state: Flags.string({ description: "Custom location state/region" }),
    country: Flags.integer({ description: "Custom location country ID" }),
    skill: Flags.string({ description: "Required skill (repeatable)", multiple: true }),
    field: Flags.string({ description: "Extra body field as key=value (repeatable)", multiple: true }),
  };

  async run(): Promise<void> {
    const api = new FlowxtraApi();
    const spinner = this.wantsJson ? null : ui.spinner("Preparing…").start();

    let body: Record<string, unknown>;
    let res: unknown;
    try {
      // Resolve the NOT-NULL references the backend requires.
      const [offices, pipelines, company] = await Promise.all([
        api.get("company-offices/index").then(toList).catch(() => []),
        api.get("company-pipelines").then(toList).catch(() => []),
        api.get("companies/profile").then(toItem).catch(() => ({})),
      ]);

      const officeId =
        this.flags.office ??
        (offices.find((o) => pick(o, ["default_office"])) ?? offices[0])?.id;
      const pipelineId =
        this.flags.pipeline ??
        (pipelines.find((p) => pick(p, ["is_default"])) ?? pipelines[0])?.id;

      if (!officeId) {
        spinner?.stop();
        ui.error("No office found for your company. Create an office in the dashboard, or pass --office <id>.");
        this.exit(1);
        return;
      }

      const currency = this.flags.currency ?? (str(pick(company, ["default_currency"])) || "EUR");

      // Required-by-schema fields + safe defaults.
      body = {
        title: this.flags.title,
        status: this.flags.status,
        workplace: this.flags.workplace,
        office_id: officeId,
        company_pipline_id: pipelineId,
        application_language: this.flags.language,
        currency,
        number_opportunities: 1,
        rate_salary: "month",
        salry_pay_by: "range",
        apply_mode: "separate",
        hours_type: "fixed_hours",
        cv_is_required: "Required",
        caver_latter_is_required: "Not Required",
        // description is NOT NULL and Laravel converts "" → null, so default to
        // a non-empty value (the title) when the user doesn't provide one.
        description: this.flags.description || `<p>${this.flags.title}</p>`,
      };
      if (this.flags.requirements) body.requirements = this.flags.requirements;

      if (this.flags.workplace === "Remote") body.remote_scope = "worldwide";
      if (this.flags.seniority) body.seniority = this.flags.seniority;
      if (this.flags["min-salary"] !== undefined) body.min_salary = this.flags["min-salary"];
      if (this.flags["max-salary"] !== undefined) body.max_salary = this.flags["max-salary"];
      if (this.flags.hours !== undefined) body.hours_number = this.flags.hours;
      if (this.flags.skill?.length) body.skills = this.flags.skill;

      if (this.flags.city) {
        body.use_custom_location = true;
        body.custom_city = this.flags.city;
        if (this.flags.state) body.custom_state = this.flags.state;
        if (this.flags.country !== undefined) body.custom_country_id = this.flags.country;
      }

      for (const kv of this.flags.field ?? []) {
        const i = kv.indexOf("=");
        if (i > 0) body[kv.slice(0, i)] = kv.slice(i + 1);
      }

      if (spinner) spinner.text = "Creating job…";
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
    if (this.flags.status === "Draft" && id) {
      ui.hint(`  Publish it with: ${cyan(`flowxtra jobs publish ${str(pick(job, ["id"]))}`)}`);
    }
  }
}
