import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { readConfig, isAuthenticated } from "../../lib/config";
import { NotAuthenticatedError } from "../../lib/api";

export default class AuthWhoami extends BaseCommand<typeof AuthWhoami> {
  static description = "Show the currently signed-in account";

  static examples = ["$ flowxtra auth whoami"];

  async run(): Promise<void> {
    const config = readConfig();
    if (!isAuthenticated(config)) throw new NotAuthenticatedError();

    if (this.wantsJson) {
      ui.json({ user: config.user, subdomain: config.subdomain, loggedInAt: config.loggedInAt });
      return;
    }

    ui.heading("You");
    ui.table(
      ["Field", "Value"],
      [
        ["Name", config.user?.name || "—"],
        ["Email", config.user?.email || "—"],
        ["Company", config.user?.company || "—"],
        ["Workspace", config.subdomain || "—"],
      ],
    );
  }
}
