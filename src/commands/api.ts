import { Args, Flags } from "@oclif/core";
import { BaseCommand } from "../base";
import { ui } from "../lib/ui";
import { FlowxtraApi } from "../lib/api";

export default class Api extends BaseCommand<typeof Api> {
  static description = "Make an authenticated request to any Flowxtra API endpoint";
  static examples = [
    "$ flowxtra api jobs/index",
    "$ flowxtra api jobs/store --method POST --field title=Designer --field status=Draft",
    "$ flowxtra api oauth/userinfo --central",
  ];

  static args = {
    path: Args.string({ description: "API path, e.g. jobs/index (no leading /api)", required: true }),
  };

  static flags = {
    method: Flags.string({ description: "HTTP method", options: ["GET", "POST", "PUT", "PATCH", "DELETE"], default: "GET" }),
    field: Flags.string({ description: "Body field as key=value (repeatable)", multiple: true }),
    query: Flags.string({ description: "Query param as key=value (repeatable)", multiple: true }),
    central: Flags.boolean({ description: "Call a central endpoint (omit the tenant subdomain)", default: false }),
  };

  async run(): Promise<void> {
    const body: Record<string, unknown> = {};
    for (const kv of this.flags.field ?? []) {
      const i = kv.indexOf("=");
      if (i > 0) body[kv.slice(0, i)] = kv.slice(i + 1);
    }
    const query: Record<string, string> = {};
    for (const kv of this.flags.query ?? []) {
      const i = kv.indexOf("=");
      if (i > 0) query[kv.slice(0, i)] = kv.slice(i + 1);
    }

    const api = new FlowxtraApi();
    const res = await api.request(this.args.path, {
      method: this.flags.method,
      body: Object.keys(body).length ? body : undefined,
      query: Object.keys(query).length ? query : undefined,
      central: this.flags.central,
    });

    ui.json(res);
  }
}
