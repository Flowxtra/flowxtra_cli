import { BaseCommand } from "../../base";
import { ui } from "../../lib/ui";
import { logout } from "../../lib/auth";
import { isAuthenticated } from "../../lib/config";

export default class AuthLogout extends BaseCommand<typeof AuthLogout> {
  static description = "Sign out and remove the stored API token";

  static examples = ["$ flowxtra auth logout"];

  async run(): Promise<void> {
    const was = isAuthenticated();
    logout();
    if (this.wantsJson) {
      ui.json({ ok: true, wasSignedIn: was });
      return;
    }
    if (was) ui.success("Signed out. Your local token has been removed.");
    else ui.info("You weren't signed in.");
  }
}
