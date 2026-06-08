import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";

/** Flowxtra brand palette (matches the web app design tokens). */
export const BRAND = {
  primary: "#003f4d", // dark teal
  secondary: "#006980", // teal
  accent: "#00A8CD", // cyan
};

/** teal → cyan gradient used across the CLI. */
export const flowxtraGradient = gradient([BRAND.primary, BRAND.secondary, BRAND.accent]);

/**
 * Render the big "FLOWXTRA" wordmark with a teal→cyan gradient.
 * Falls back to a plain heading if the font can't be rendered.
 */
export function banner(): string {
  let art: string;
  try {
    art = figlet.textSync("FLOWXTRA", { font: "ANSI Shadow", horizontalLayout: "default" });
  } catch {
    art = "FLOWXTRA";
  }
  const tagline = chalk.dim("  Run your hiring from the terminal.");
  return `\n${flowxtraGradient.multiline(art)}\n${tagline}\n`;
}

/** Compact one-line brand mark for headers inside command output. */
export function mark(): string {
  return flowxtraGradient("◆ Flowxtra");
}
