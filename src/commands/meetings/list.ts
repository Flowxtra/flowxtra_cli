import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str } from "../../lib/format";

export default class MeetingsList extends BaseCommand<typeof MeetingsList> {
  static description = "List scheduled meetings / interviews";
  static examples = ["$ flowxtra meetings list"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading meetings…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("meet/index");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No meetings scheduled.");
      return;
    }
    ui.heading(`Meetings (${rows.length})`);
    ui.table(
      ["ID", "Title", "When", "Type", "Link"],
      rows.map((m) => [
        str(pick(m, ["id"])),
        str(pick(m, ["title", "name", "subject"])) || "—",
        str(pick(m, ["start_time", "start", "date", "scheduled_at"])) || "—",
        str(pick(m, ["type", "provider", "platform"])) || "—",
        str(pick(m, ["link", "url", "join_url", "meeting_url"])) || "—",
      ]),
    );
  }
}
