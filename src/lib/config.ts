import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Persisted CLI credentials & settings, stored at ~/.flowxtra/config.json
 * (override the directory with FLOWXTRA_CONFIG_DIR — useful for tests).
 */
export type FlowxtraConfig = {
  /** Long-lived Sanctum API token used for all API calls. */
  apiToken?: string;
  /** Base URL of the Flowxtra API (defaults to production). */
  apiUrl?: string;
  /** Tenant subdomain the token belongs to. */
  subdomain?: string;
  /** Cached identity for `whoami` without a network round-trip. */
  user?: { name?: string; email?: string; company?: string };
  /** ISO timestamp of last successful login. */
  loggedInAt?: string;
};

export const DEFAULT_API_URL = "https://app.flowxtra.com";

function configDir(): string {
  return process.env.FLOWXTRA_CONFIG_DIR || join(homedir(), ".flowxtra");
}

function configPath(): string {
  return join(configDir(), "config.json");
}

export function readConfig(): FlowxtraConfig {
  const path = configPath();
  if (!existsSync(path)) return {};
  try {
    return JSON.parse(readFileSync(path, "utf8")) as FlowxtraConfig;
  } catch {
    return {};
  }
}

export function writeConfig(config: FlowxtraConfig): void {
  const path = configPath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(config, null, 2), "utf8");
  // Best-effort: restrict to the current user (token lives here).
  try {
    chmodSync(path, 0o600);
  } catch {
    /* not supported on this platform — ignore */
  }
}

export function clearConfig(): void {
  writeConfig({});
}

export function apiUrl(config: FlowxtraConfig = readConfig()): string {
  return process.env.FLOWXTRA_API_URL || config.apiUrl || DEFAULT_API_URL;
}

export function isAuthenticated(config: FlowxtraConfig = readConfig()): boolean {
  return Boolean(config.apiToken);
}
