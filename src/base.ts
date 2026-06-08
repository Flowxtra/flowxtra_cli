import { Command, Flags, type Interfaces } from "@oclif/core";
import chalk from "chalk";
import { ui } from "./lib/ui";
import { ApiError, NotAuthenticatedError } from "./lib/api";

export type BaseFlags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof BaseCommand)["baseFlags"] & T["flags"]
>;

/**
 * Shared base for every Flowxtra command:
 *  - global `--json` and `--no-color` flags
 *  - consistent, branded error formatting
 */
export abstract class BaseCommand<T extends typeof Command> extends Command {
  static baseFlags = {
    json: Flags.boolean({ description: "Output raw JSON (good for scripts)", helpGroup: "GLOBAL" }),
    "no-color": Flags.boolean({ description: "Disable colored output", helpGroup: "GLOBAL" }),
  };

  protected flags!: BaseFlags<T>;
  protected args!: Interfaces.InferredArgs<T["args"]>;

  public async init(): Promise<void> {
    await super.init();
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    });
    this.flags = flags as BaseFlags<T>;
    this.args = args as Interfaces.InferredArgs<T["args"]>;

    if (this.flags["no-color"] || process.env.NO_COLOR) {
      chalk.level = 0;
    }
  }

  /** True when `--json` was passed. */
  protected get wantsJson(): boolean {
    return Boolean(this.flags?.json);
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<unknown> {
    if (err instanceof NotAuthenticatedError) {
      ui.error(err.message);
      ui.hint("  Sign in with: flowxtra auth login");
      this.exit(1);
    }
    if (err instanceof ApiError) {
      ui.error(err.message);
      if (err.status === 401) ui.hint("  Your session may have expired — run: flowxtra auth login");
      this.exit(1);
    }
    return super.catch(err);
  }
}
