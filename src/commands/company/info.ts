import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { FlowxtraApi } from "../../lib/api";
import { toItem, pick, str } from "../../lib/format";

export default class CompanyInfo extends BaseCommand<typeof CompanyInfo> {
  static description = "Show your company profile";
  static examples = ["$ flowxtra company info"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Loading company…").start();
    const api = new FlowxtraApi();
    let res: unknown;
    try {
      res = await api.get("companies/profile");
    } finally {
      spinner?.stop();
    }

    if (this.wantsJson) {
      ui.json(res);
      return;
    }

    const c = toItem(res);
    ui.heading(str(pick(c, ["name", "company_name"])) || "Company");
    ui.table(
      ["Field", "Value"],
      [
        ["Name", str(pick(c, ["name", "company_name"])) || "—"],
        ["Email", str(pick(c, ["email", "contact_email"])) || "—"],
        ["Website", str(pick(c, ["website", "url"])) || "—"],
        ["Industry", str(pick(c, ["industry", "sector"])) || "—"],
        ["Country", str(pick(c, ["country", "country_name"])) || "—"],
      ],
    );
  }
}
