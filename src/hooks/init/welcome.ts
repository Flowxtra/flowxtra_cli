import { Hook } from "@oclif/core";
import { banner } from "../../lib/brand";
import { ui, cyan, teal } from "../../lib/ui";
import { readConfig, isAuthenticated } from "../../lib/config";

/**
 * Prints the branded banner on bare `flowxtra` invocation (and above help),
 * plus a short getting-started panel. Subcommands run untouched.
 */
const hook: Hook<"init"> = async function (options) {
  const argv = options.argv ?? [];
  const isVersion = argv.includes("--version") || argv.includes("-v");
  const isHelp = argv.includes("--help") || argv.includes("-h");

  // Only act on the bare entrypoint (no command id).
  if (options.id || isVersion) return;

  process.stdout.write(banner());

  // Above `--help`, just show the banner and let oclif render the help below.
  if (isHelp) return;

  const config = readConfig();
  if (isAuthenticated(config)) {
    const who = config.user?.name || config.user?.email || "your account";
    ui.info(`Signed in as ${teal(who)}${config.user?.company ? ` · ${config.user.company}` : ""}`);
  } else {
    ui.info(`Get started: ${cyan("flowxtra auth login")}`);
  }

  process.stdout.write(`\n${teal.bold("Common commands")}\n`);
  ui.table(
    ["Command", "What it does"],
    [
      ["auth login", "Sign in via your browser"],
      ["jobs list", "List your job postings"],
      ["jobs create", "Create a new job"],
      ["candidates shortlist", "Shortlist top candidates"],
      ["meetings create", "Schedule an interview"],
    ],
  );
  ui.hint(`\nRun ${cyan("flowxtra --help")} to see every command.`);

  // Stop here — don't fall through to oclif's default help on bare invocation.
  process.exit(0);
};

export default hook;
export { hook };
