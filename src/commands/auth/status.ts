import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { readConfig, isAuthenticated, apiUrl } from "../../lib/config";

export default class AuthStatus extends BaseCommand<typeof AuthStatus> {
  static description = "Show authentication status and connection details";

  static examples = ["$ flowxtra auth status"];

  async run(): Promise<void> {
    const config = readConfig();
    const authed = isAuthenticated(config);

    if (this.wantsJson) {
      ui.json({ authenticated: authed, apiUrl: apiUrl(config), subdomain: config.subdomain, loggedInAt: config.loggedInAt });
      return;
    }

    ui.heading("Status");
    ui.table(
      ["Field", "Value"],
      [
        ["Authenticated", authed ? "yes" : "no"],
        ["API", apiUrl(config)],
        ["Workspace", config.subdomain || "—"],
        ["Signed in at", config.loggedInAt || "—"],
      ],
    );
    if (!authed) ui.hint("\n  Sign in with: flowxtra auth login");
  }
}
