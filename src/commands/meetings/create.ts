import { Flags } from "@oclif/core";
import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toItem, pick, str } from "../../lib/format";

export default class MeetingsCreate extends BaseCommand<typeof MeetingsCreate> {
  static description = "Schedule a meeting / interview";
  static examples = [
    '$ flowxtra meetings create --title "Interview · Sara" --candidate 42 --start "2026-06-10 14:00" --type google_meet',
  ];

  static flags = {
    title: Flags.string({ description: "Meeting title", required: true }),
    candidate: Flags.integer({ description: "Candidate job ID to invite" }),
    start: Flags.string({ description: "Start time (e.g. \"2026-06-10 14:00\")" }),
    type: Flags.string({ description: "Provider", options: ["google_meet", "zoom", "jitsi"], default: "google_meet" }),
    field: Flags.string({ description: "Extra body field as key=value (repeatable)", multiple: true }),
  };

  async run(): Promise<void> {
    const body: Record<string, unknown> = { title: this.flags.title, type: this.flags.type };
    if (this.flags.candidate !== undefined) body.candidate_job_id = this.flags.candidate;
    if (this.flags.start) body.start_time = this.flags.start;
    for (const kv of this.flags.field ?? []) {
      const i = kv.indexOf("=");
      if (i > 0) body[kv.slice(0, i)] = kv.slice(i + 1);
    }

    const spinner = this.wantsJson ? null : ui.spinner("Scheduling meeting…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.post("meet/store", body);
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }
    const m = toItem(res);
    const link = str(pick(m, ["link", "url", "join_url", "meeting_url"]));
    ui.success(`Scheduled “${this.flags.title}”`);
    if (link) ui.info(`Join: ${link}`);
  }
}
