import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { AddressInfo } from "node:net";
import open from "open";
import { apiUrl, readConfig, writeConfig, clearConfig, type FlowxtraConfig } from "./config";

const SCOPES = ["profile", "company", "jobs:read", "jobs:write", "applicants:read", "applicants:write", "mcp"];

type TokenResponse = { access_token: string; refresh_token?: string; token_type?: string; expires_in?: number };
type UserInfo = { name?: string; email?: string; company?: { subdomain?: string; name?: string } };
type RegisterResponse = { client_id: string; client_secret?: string };

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pkce(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

const SUCCESS_HTML = `<!doctype html><meta charset="utf-8"><title>Flowxtra CLI</title>
<style>body{font-family:system-ui,sans-serif;background:#003f4d;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0}
.card{text-align:center}.c{color:#00A8CD}</style>
<div class="card"><h1>✓ <span class="c">Flowxtra CLI</span> connected</h1>
<p>You're signed in. You can close this tab and return to your terminal.</p></div>`;

/** Run the full browser-based OAuth + PKCE login and persist credentials. */
export async function login(onStatus?: (msg: string) => void): Promise<FlowxtraConfig> {
  const base = apiUrl();
  const status = onStatus ?? (() => {});

  const { verifier, challenge } = pkce();
  const state = base64url(randomBytes(16));

  // 1. Spin up a loopback server to catch the redirect.
  const { code, redirectUri, port, server } = await new Promise<{
    code: Promise<string>;
    redirectUri: string;
    port: number;
    server: ReturnType<typeof createServer>;
  }>((resolve) => {
    let resolveCode!: (v: string) => void;
    let rejectCode!: (e: Error) => void;
    const codePromise = new Promise<string>((res, rej) => {
      resolveCode = res;
      rejectCode = rej;
    });

    const srv = createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://localhost");
      if (url.pathname !== "/callback") {
        res.writeHead(404).end();
        return;
      }
      const returnedState = url.searchParams.get("state");
      const returnedCode = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      res.writeHead(200, { "Content-Type": "text/html" }).end(SUCCESS_HTML);
      if (error) rejectCode(new Error(`Authorization denied: ${error}`));
      else if (returnedState !== state) rejectCode(new Error("State mismatch — aborting for safety."));
      else if (returnedCode) resolveCode(returnedCode);
      else rejectCode(new Error("No authorization code returned."));
    });

    srv.listen(0, "127.0.0.1", () => {
      const p = (srv.address() as AddressInfo).port;
      resolve({ code: codePromise, redirectUri: `http://127.0.0.1:${p}/callback`, port: p, server: srv });
    });
  });

  try {
    // 2. Register a per-machine OAuth client (localhost redirect is permitted).
    status("Registering CLI client…");
    const reg = (await postJson(`${base}/api/oauth/register`, {
      client_name: "Flowxtra CLI",
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      token_endpoint_auth_method: "client_secret_post",
    })) as RegisterResponse;

    // 3. Open the consent page in the browser.
    const authorizeUrl = new URL(`${base}/authorize`);
    authorizeUrl.searchParams.set("client_id", reg.client_id);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", SCOPES.join(" "));
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("code_challenge", challenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");

    status("Opening your browser to sign in…");
    await open(authorizeUrl.toString()).catch(() => {});
    status(`If the browser didn't open, visit:\n  ${authorizeUrl.toString()}`);

    // 4. Wait for the redirect with the code.
    const authCode = await code;

    // 5. Exchange the code for an access token (PKCE).
    status("Exchanging authorization code…");
    const token = (await postForm(`${base}/api/oauth/token`, {
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: redirectUri,
      client_id: reg.client_id,
      ...(reg.client_secret ? { client_secret: reg.client_secret } : {}),
      code_verifier: verifier,
    })) as TokenResponse;

    // 6. Identify the user + tenant.
    status("Fetching your account…");
    const info = (await getJson(`${base}/api/oauth/userinfo`, token.access_token)) as UserInfo;

    // 7. Mint a long-lived Sanctum API token for subsequent calls.
    status("Creating your API token…");
    const apiTokenRes = (await postJson(`${base}/api/oauth/create-api-token`, {}, token.access_token)) as { api_token: string };

    const config: FlowxtraConfig = {
      ...readConfig(),
      apiToken: apiTokenRes.api_token,
      subdomain: info.company?.subdomain,
      user: { name: info.name, email: info.email, company: info.company?.name },
      loggedInAt: new Date().toISOString(),
    };
    writeConfig(config);
    return config;
  } finally {
    server.close();
  }
}

export function logout(): void {
  clearConfig();
}

/* ---- tiny fetch helpers ---- */

async function postJson(url: string, body: unknown, bearer?: string): Promise<unknown> {
  return parse(
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
      body: JSON.stringify(body),
    }),
  );
}

async function postForm(url: string, fields: Record<string, string>): Promise<unknown> {
  return parse(
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams(fields).toString(),
    }),
  );
}

async function getJson(url: string, bearer: string): Promise<unknown> {
  return parse(await fetch(url, { headers: { Accept: "application/json", Authorization: `Bearer ${bearer}` } }));
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    if (body && typeof body === "object") {
      const o = body as Record<string, unknown>;
      const found = o.error_description ?? o.error ?? o.message;
      if (found !== undefined) msg = String(found);
    }
    throw new Error(msg);
  }
  return body;
}
