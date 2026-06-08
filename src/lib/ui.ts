import chalk from "chalk";
import Table from "cli-table3";
import ora, { type Ora } from "ora";
import { BRAND } from "./brand";

const teal = chalk.hex(BRAND.secondary);
const cyan = chalk.hex(BRAND.accent);

export const ui = {
  success(msg: string): void {
    process.stdout.write(`${chalk.green("✓")} ${msg}\n`);
  },
  error(msg: string): void {
    process.stderr.write(`${chalk.red("✗")} ${msg}\n`);
  },
  info(msg: string): void {
    process.stdout.write(`${cyan("›")} ${msg}\n`);
  },
  warn(msg: string): void {
    process.stdout.write(`${chalk.yellow("!")} ${msg}\n`);
  },
  hint(msg: string): void {
    process.stdout.write(`${chalk.dim(msg)}\n`);
  },
  heading(msg: string): void {
    process.stdout.write(`\n${teal.bold(msg)}\n`);
  },
  spinner(text: string): Ora {
    return ora({ text, color: "cyan" });
  },
  /** Print a bordered table with branded headers. */
  table(headers: string[], rows: (string | number)[][]): void {
    const t = new Table({
      head: headers.map((h) => cyan.bold(h)),
      style: { head: [], border: ["grey"] },
      chars: { mid: "", "left-mid": "", "mid-mid": "", "right-mid": "" },
    });
    for (const row of rows) t.push(row.map((c) => String(c)));
    process.stdout.write(`${t.toString()}\n`);
  },
  /** Print a JSON payload (for `--json`). */
  json(data: unknown): void {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
  },
};

export { teal, cyan };
