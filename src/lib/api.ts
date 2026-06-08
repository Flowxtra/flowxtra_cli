import { apiUrl, readConfig, type FlowxtraConfig } from "./config";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super("You are not signed in. Run `flowxtra auth login` first.");
    this.name = "NotAuthenticatedError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  /** Skip the tenant `subdomain` query param (for central endpoints). */
  central?: boolean;
  /** Override the bearer token (used during the auth handshake). */
  token?: string;
};

/**
 * Thin client over the Flowxtra REST API. Tenant endpoints are reached at
 * `{apiUrl}/api/<path>?subdomain=<subdomain>` with a Sanctum bearer token.
 */
export class FlowxtraApi {
  private readonly base: string;
  private readonly token?: string;
  private readonly subdomain?: string;

  constructor(config: FlowxtraConfig = readConfig()) {
    this.base = apiUrl(config);
    this.token = config.apiToken;
    this.subdomain = config.subdomain;
  }

  private buildUrl(path: string, opts: RequestOptions): string {
    const url = new URL(`/api/${path.replace(/^\/+/, "")}`, this.base);
    if (!opts.central && this.subdomain) {
      url.searchParams.set("subdomain", this.subdomain);
    }
    for (const [k, v] of Object.entries(opts.query ?? {})) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
    return url.toString();
  }

  async request<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
    const token = opts.token ?? this.token;
    if (!token && !opts.token) throw new NotAuthenticatedError();

    const res = await fetch(this.buildUrl(path, opts), {
      method: opts.method ?? "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    const text = await res.text();
    let parsed: unknown;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }

    if (!res.ok) {
      let message = `Request failed with status ${res.status}`;
      if (parsed && typeof parsed === "object" && "message" in parsed) {
        message = String((parsed as Record<string, unknown>).message);
      }
      throw new ApiError(message, res.status, parsed);
    }
    return parsed as T;
  }

  get<T = unknown>(path: string, query?: RequestOptions["query"]): Promise<T> {
    return this.request<T>(path, { method: "GET", query });
  }

  post<T = unknown>(path: string, body?: unknown, query?: RequestOptions["query"]): Promise<T> {
    return this.request<T>(path, { method: "POST", body, query });
  }
}
