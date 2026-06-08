/** Helpers for turning loosely-typed API JSON into table rows. */

export type Row = Record<string, unknown>;

/** Extract an array from common Laravel/REST response shapes. */
export function toList(res: unknown): Row[] {
  if (Array.isArray(res)) return res as Row[];
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    for (const key of ["data", "items", "jobs", "candidates", "result", "results", "rows"]) {
      if (Array.isArray(obj[key])) return obj[key] as Row[];
    }
    if (obj.data && typeof obj.data === "object" && Array.isArray((obj.data as Record<string, unknown>).data)) {
      return (obj.data as Record<string, unknown>).data as Row[];
    }
  }
  return [];
}

/** First present (non-empty) value among candidate keys. */
export function pick(obj: Row, keys: string[]): unknown {
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return undefined;
}

/** Best-effort display name: a single name field, or first + last. */
export function fullName(obj: Row): string {
  const single = pick(obj, ["name", "full_name", "candidate_name"]);
  if (single) return str(single);
  const first = str(pick(obj, ["first_name"]));
  const last = str(pick(obj, ["last_name"]));
  return `${first} ${last}`.trim();
}

/** Name of a nested related object (e.g. company_office.name). */
export function nestedName(obj: Row, key: string): string {
  const rel = obj[key];
  if (rel && typeof rel === "object" && !Array.isArray(rel)) {
    return str((rel as Row).name ?? (rel as Row).title ?? "");
  }
  return "";
}

export function str(v: unknown): string {
  if (v === undefined || v === null) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

/** Pull a nested object out of common single-resource shapes. */
export function toItem(res: unknown): Row {
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) return obj.data as Row;
    return obj as Row;
  }
  return {};
}
