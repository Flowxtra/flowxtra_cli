import { BaseCommand } from "../../base";
import { banner } from "../../lib/brand";
import { ui, teal } from "../../lib/ui";
import { login } from "../../lib/auth";

export default class AuthLogin extends BaseCommand<typeof AuthLogin> {
  static description = "Sign in to Flowxtra via your browser";

  static examples = ["$ flowxtra auth login"];

  async run(): Promise<void> {
    const spinner = this.wantsJson ? null : ui.spinner("Starting sign-in…").start();

    try {
      const config = await login((msg) => {
        if (spinner) spinner.text = msg.split("\n")[0];
        else if (msg.includes("visit")) ui.info(msg);
      });
      spinner?.stop();

      if (this.wantsJson) {
        ui.json({ ok: true, user: config.user, subdomain: config.subdomain });
        return;
      }

      process.stdout.write(banner());
      const who = config.user?.name || config.user?.email || "your account";
      ui.success(`Signed in as ${teal(who)}${config.user?.company ? ` · ${config.user.company}` : ""}`);
      ui.hint("  Try: flowxtra jobs list");
    } catch (err) {
      spinner?.stop();
      throw err;
    }
  }
}
