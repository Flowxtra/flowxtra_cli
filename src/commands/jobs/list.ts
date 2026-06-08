import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";

type Job = Record<string, unknown>;

export default class JobsList extends BaseCommand<typeof JobsList> {
  static description = "List your job postings";

  static examples = ["$ flowxtra jobs list", "$ flowxtra jobs list --json"];

  static flags = {
    limit: Flags.integer({ description: "Max rows to display", default: 25 }),
  };

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading jobs…").start();
    const api = new FlowxtraApi();

    let res: unknown;
    try {
      res = await api.get("jobs/index");
    } finally {
      spinner?.stop();
    }

    const jobs = normalize(res);

    if (this.wantsJson) {
      ui.json(jobs);
      return;
    }

    if (jobs.length === 0) {
      ui.info("No jobs yet.");
      ui.hint('  Create one with: flowxtra jobs create --title "Your role"');
      return;
    }

    ui.heading(`Jobs (${jobs.length})`);
    ui.table(
      ["ID", "Title", "Status", "Location", "Applicants"],
      jobs.slice(0, this.flags.limit).map((j) => [
        str(pick(j, ["hash_id", "hashId", "id"])),
        str(pick(j, ["title", "name", "job_title"])) || "—",
        str(pick(j, ["status", "status_by_admin", "state"])) || "—",
        str(pick(j, ["location", "city", "address"])) || "—",
        str(pick(j, ["applicants_count", "candidates_count", "applications_count"])) || "0",
      ]),
    );
  }
}

function normalize(res: unknown): Job[] {
  if (Array.isArray(res)) return res as Job[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    for (const key of ["data", "jobs", "result", "results"]) {
      if (Array.isArray(obj[key])) return obj[key] as Job[];
    }
    // Laravel paginator nested under data.data
    if (obj.data && typeof obj.data === "object" && Array.isArray((obj.data as Record<string, unknown>).data)) {
      return (obj.data as Record<string, unknown>).data as Job[];
    }
  }
  return [];
}

function pick(obj: Job, keys: string[]): unknown {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return undefined;
}

function str(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
