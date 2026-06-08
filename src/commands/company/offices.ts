import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toList, pick, str, nestedName } from "../../lib/format";

export default class CompanyOffices extends BaseCommand<typeof CompanyOffices> {
  static description = "List your company offices";
  static examples = ["$ flowxtra company offices"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading offices…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("company-offices/index");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const rows = toList(res);
    if (rows.length === 0) {
      ui.info("No offices configured.");
      return;
    }
    ui.heading(`Offices (${rows.length})`);
    ui.table(
      ["ID", "Name", "City", "Country"],
      rows.map((o) => [
        str(pick(o, ["id"])),
        str(pick(o, ["name", "title"])) || "—",
        str(pick(o, ["city", "location"])) || "—",
        nestedName(o, "country") || str(pick(o, ["country_name"])) || "—",
      ]),
    );
  }
}
