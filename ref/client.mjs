// ref/client.mjs — reference READ-ONLY client for SPEC-001.
//
// This file exists to prove the specification is implementable by a consumer,
// not to stand up a server. It issues only read calls and refuses to proceed
// when it cannot establish network identity.
//
// Enforced by test/gap.test.mjs: no sign/submit/write operations appear here.

const DEFAULT_TESTNET_RPC = "https://rpc.testnet.minepi.com";

/** RFC 6570 brace-stripping (required by gap G2). */
export function stripTemplate(href) {
  if (typeof href !== "string") return href;
  return href.replace(/\{[^}]*\}/g, "");
}

/** True when a HAL href still contains a template expression. */
export function isTemplate(href) {
  return typeof href === "string" && /\{[^}]*\}/.test(href);
}

/**
 * Build a callable URL from a HAL link.
 * SPEC-001 §3.3: never append a query to a raw template.
 */
export function buildCallUrl(href, params = {}) {
  if (href == null) throw new Error("buildCallUrl: href is required");
  if (isTemplate(href)) throw new Error("buildCallUrl: refusing to call a raw URI template; call stripTemplate first");
  const u = new URL(href);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  return u.toString();
}

/**
 * SPEC-001 §3.3.1 — truncation must be explicit.
 * Given a page result, decide whether the window is complete WITHOUT guessing
 * from `results.length == cap`.
 */
export function isTruncated(page, requestedLimit) {
  if (!page || typeof page !== "object") throw new Error("isTruncated: page is required");
  if (typeof page.truncated === "boolean") return page.truncated;          // explicit signal
  if (page.nextCursor != null) return true;                                 // continuation implies more
  if (Number.isFinite(page.effectiveLimit) && Number.isFinite(requestedLimit)) {
    return page.effectiveLimit < requestedLimit;                            // server reduced the limit
  }
  // No explicit signal: the honest answer is "unknown", and callers must treat
  // unknown as unsafe. We return true so a caller never silently assumes完整.
  return true;
}

/**
 * SPEC-001 §3.3.2/§3.3.4 — report what was actually applied.
 * Returns { effectiveLimit, retentionWindow, endLedgerExclusive } or nulls.
 */
export function describePage(page) {
  return {
    effectiveLimit: Number.isFinite(page?.effectiveLimit) ? page.effectiveLimit : null,
    retentionWindow: Number.isFinite(page?.retentionWindow) ? page.retentionWindow : null,
    endLedgerExclusive: typeof page?.endLedgerExclusive === "boolean" ? page.endLedgerExclusive : null,
  };
}

/** Time-boxed read-only JSON-RPC call. */
async function rpc(endpoint, method, params, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    const json = await res.json();
    if (json.error) throw new Error(`${method}: ${json.error.message ?? "rpc error"}`);
    return json.result;
  } finally {
    clearTimeout(t);
  }
}

/**
 * SPEC-001 §3.2 R1 — establish network identity before doing anything else.
 * A client that cannot confirm it is on the intended network must refuse.
 */
export async function establishIdentity(endpoint = DEFAULT_TESTNET_RPC, { expectedPassphrase = null } = {}) {
  const net = await rpc(endpoint, "getNetwork", {});
  const id = { passphrase: net?.passphrase ?? null, protocolVersion: net?.protocolVersion ?? null };
  if (!id.passphrase) throw new Error("establishIdentity: endpoint did not return a passphrase; refusing to proceed");
  if (expectedPassphrase && id.passphrase !== expectedPassphrase) {
    throw new Error(`establishIdentity: wrong network (got '${id.passphrase}', expected '${expectedPassphrase}')`);
  }
  return id;
}

/**
 * SPEC-001 §3.2 R2 + §3.3.4 — health with an explicit retention window.
 */
export async function readHealth(endpoint = DEFAULT_TESTNET_RPC) {
  const h = await rpc(endpoint, "getHealth", {});
  return {
    status: h?.status ?? null,
    latestLedger: h?.latestLedger ?? null,
    oldestLedger: h?.oldestLedger ?? null,
    retentionWindow: h?.ledgerRetentionWindow ?? null,   // must be reported, not inferred
  };
}

/**
 * SPEC-001 §3.2 R4 + §3.3.1/2/3 — event read that never silently assumes a
 * complete window. If the server does not provide explicit signals, the helper
 * marks the page as truncated and reports nulls rather than inventing values.
 */
export async function readEvents(endpoint, { startLedger, endLedger, limit = 200 } = {}) {
  if (!Number.isFinite(startLedger)) throw new Error("readEvents: startLedger is required");
  const raw = await rpc(endpoint, "getEvents", { startLedger, ...(endLedger ? { endLedger } : {}), limit });
  const events = raw?.events ?? [];
  const page = {
    events,
    // Most servers do not yet send these; we surface that honestly as null.
    effectiveLimit: raw?.limit ?? null,
    truncated: raw?.truncated ?? (events.length >= 100 ? true : undefined),
    nextCursor: raw?.cursor ?? null,
    retentionWindow: raw?.ledgerRetentionWindow ?? null,
    endLedgerExclusive: raw?.endLedgerExclusive ?? null,
  };
  return { ...page, truncated: isTruncated(page, limit), described: describePage(page) };
}

export const ENDPOINTS = {
  testnetRpc: DEFAULT_TESTNET_RPC,
  // Mainnet RPC intentionally absent: it is not reachable (gap G1).
};

if (process.argv[1]?.endsWith("client.mjs")) {
  const id = await establishIdentity(ENDPOINTS.testnetRpc);
  const health = await readHealth(ENDPOINTS.testnetRpc);
  console.log("identity:", JSON.stringify(id));
  console.log("health:  ", JSON.stringify(health));
  const page = await readEvents(ENDPOINTS.testnetRpc, { startLedger: Math.max(1, health.latestLedger - 100) });
  console.log("events:  ", `returned=${page.events.length} truncated=${page.truncated} described=${JSON.stringify(page.described)}`);
  console.log("note:    this client is read-only; it never signs or submits.");
}
