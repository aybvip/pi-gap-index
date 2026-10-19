// probe.mjs — READ-ONLY probes that reproduce the measured gaps.
//
// Rules, enforced by test/gap.test.mjs:
//   - GET/POST reads only. No signing, no submission, no writes.
//   - Every network call is time-boxed.
//   - No API keys, tokens, or credentials are read or sent.
//   - Where a probe cannot reach an endpoint, that IS the measurement.

const MAINNET_REST = "https://api.mainnet.minepi.com";
const TESTNET_RPC = "https://rpc.testnet.minepi.com";
const MAINNET_RPC = "https://rpc.mainnet.minepi.com";
const TIMEOUT_MS = 15000;

/** Time-boxed fetch. Returns { ok, status, json|text|error } and never throws. */
async function get(url, { method = "GET", body = null } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      signal: ctrl.signal,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* keep text */ }
    return { ok: res.ok, status: res.status, json, text, url, method };
  } catch (e) {
    return { ok: false, status: null, json: null, text: null, error: e.message, url, method };
  } finally {
    clearTimeout(t);
  }
}

/** RFC 6570 detection: does this HAL href contain a template expression? */
export function hasTemplate(href) {
  return typeof href === "string" && /\{[^}]*\}/.test(href);
}

/** Strip a template expression to get a usable base URL. */
export function stripTemplate(href) {
  return typeof href === "string" ? href.replace(/\{[^}]*\}/g, "") : href;
}

// ---------------------------------------------------------------------------
// G1 — Mainnet Soroban JSON-RPC reachability
// ---------------------------------------------------------------------------
async function probeRpc() {
  const req = { jsonrpc: "2.0", id: 1, method: "getHealth" };
  const [mainnet, testnet] = await Promise.all([
    get(MAINNET_RPC, { method: "POST", body: req }),
    get(TESTNET_RPC, { method: "POST", body: req }),
  ]);
  const fields = {
    mainnet_endpoint: MAINNET_RPC,
    mainnet_result: mainnet.ok
      ? `HTTP ${mainnet.status} — ${JSON.stringify(mainnet.json)?.slice(0, 120)}`
      : `NOT REACHABLE (status=${mainnet.status ?? "n/a"}, ${mainnet.error ?? "no body"})`,
    testnet_endpoint: TESTNET_RPC,
    testnet_result: testnet.ok
      ? `HTTP ${testnet.status} — health: ${JSON.stringify(testnet.json?.result ?? testnet.json).slice(0, 160)}`
      : `HTTP ${testnet.status ?? "n/a"} (${testnet.error ?? "no body"})`,
  };
  return {
    id: "G1",
    title: "public Mainnet Soroban JSON-RPC reachability",
    fields,
    verdict: mainnet.ok
      ? "mainnet-reachable-at-measurement-time"
      : "mainnet-not-reachable-at-measurement-time (this reproduces the gap)",
  };
}

// ---------------------------------------------------------------------------
// G2 + G6 — Horizon HAL templates and Mainnet operation histogram
// ---------------------------------------------------------------------------
async function probeRest() {
  const root = await get(`${MAINNET_REST}/`);
  const opsTemplate = root.json?._links?.operations?.href ?? null;
  const opsUrl = opsTemplate ? `${stripTemplate(opsTemplate)}?limit=20&order=desc` : `${MAINNET_REST}/operations?limit=20&order=desc`;

  const naive = opsTemplate ? await get(`${opsTemplate}?limit=20`) : null;
  const ops = await get(opsUrl);
  const assets = await get(`${MAINNET_REST}/assets?limit=20`);

  const records = ops.json?._embedded?.records ?? [];
  const histogram = {};
  for (const r of records) histogram[r.type] = (histogram[r.type] ?? 0) + 1;

  const fields = {
    endpoint: MAINNET_REST,
    hal_operations_link: opsTemplate ?? "(not found)",
    hal_link_is_template: opsTemplate ? String(hasTemplate(opsTemplate)) : "n/a",
    naive_call_with_template: naive
      ? `HTTP ${naive.status} (template left in URL)${naive.ok ? "" : " — confirms the trap"}`
      : "n/a",
    stripped_call: `HTTP ${ops.status}`,
    operation_histogram: Object.keys(histogram).length
      ? Object.entries(histogram).map(([k, v]) => `${v}x ${k}`).join(", ")
      : "(none read)",
    issued_assets_records: Array.isArray(assets.json?._embedded?.records)
      ? assets.json._embedded.records.length
      : `HTTP ${assets.status}`,
    contract_invocation_observed: histogram.invoke_host_function ? "yes" : "NOT OBSERVED in this window",
    window: `${records.length} operations requested (limit=20) — printed so the reader can judge coverage`,
  };
  return {
    id: "G2+G6",
    title: "Horizon HAL templates + Mainnet operation histogram",
    fields,
  };
}

// ---------------------------------------------------------------------------
// G3 — event read semantics (cap, limit ignored, exclusive endLedger)
// ---------------------------------------------------------------------------
async function probeEvents() {
  const health = await get(TESTNET_RPC, { method: "POST", body: { jsonrpc: "2.0", id: 1, method: "getHealth" } });
  const latest = health.json?.result?.latestLedger ?? null;
  const retention = health.json?.result?.ledgerRetentionWindow ?? null;

  if (!latest) {
    return {
      id: "G3",
      title: "Soroban event read semantics",
      fields: { endpoint: TESTNET_RPC, result: `no latestLedger (HTTP ${health.status} ${health.error ?? ""})` },
    };
  }

  const start = Math.max(1, latest - 200);
  // Ask for 1000 — measure whether the cap is applied silently.
  const evs = await get(TESTNET_RPC, {
    method: "POST",
    body: { jsonrpc: "2.0", id: 2, method: "getEvents", params: { startLedger: start, endLedger: latest, limit: 1000 } },
  });
  const events = evs.json?.result?.events ?? [];
  const topics = new Set();
  for (const e of events) {
    for (const t of e.topicJson ?? e.topic ?? []) {
      if (typeof t === "string") topics.add(t);
    }
  }

  const fields = {
    endpoint: TESTNET_RPC,
    latest_ledger: String(latest),
    ledger_retention_window: String(retention ?? "(not reported)"),
    requested_limit: "1000",
    events_returned: String(events.length),
    cap_observed: events.length >= 100 && events.length < 1000 ? "YES — returned exactly the cap, not the requested limit" : `returned ${events.length} (< cap or > cap)`,
    endLedger_semantics: "EXCLUSIVE (documented behaviour; window is [startLedger, endLedger) )",
    distinct_topics_sample: String(topics.size),
  };
  return { id: "G3", title: "Soroban event read semantics (cap / limit / endLedger)", fields };
}

// ---------------------------------------------------------------------------
// G4 — official channel measured state (public API; unauthenticated read)
// ---------------------------------------------------------------------------
async function probeChannel() {
  const base = "https://api.github.com/repos/PiNetwork/PiRC";
  const H = { "Accept": "application/vnd.github+json" };
  async function getAll(url) {
    let page = 1, all = [];
    while (page <= 4) {
      const r = await get(`${url}${url.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
      const j = r.json;
      if (!Array.isArray(j) || j.length === 0) break;
      all = all.concat(j);
      if (j.length < 100) break;
      page++;
    }
    return all;
  }
  const [repo, openPR, closedPR, readme] = await Promise.all([
    get(base),
    getAll(`${base}/pulls?state=open`),
    getAll(`${base}/pulls?state=closed`),
    get(`${base}/readme`),
  ]);
  const merged = closedPR.filter((p) => p.merged_at).length;
  let readmeLines = null;
  try {
    const txt = Buffer.from(readme.json?.content ?? "", "base64").toString("utf8");
    readmeLines = txt.split(/\r?\n/).filter((l) => l.trim()).length;
  } catch { /* ignore */ }

  const fields = {
    repo: "PiNetwork/PiRC",
    reachable: repo.status ? `HTTP ${repo.status}` : "unreachable",
    open_pull_requests: String(openPR.length),
    closed_pull_requests: String(closedPR.length),
    merged_pull_requests: String(merged),
    readme_nonempty_lines: String(readmeLines ?? "(unread)"),
    main_last_push: repo.json?.pushed_at ?? "(unknown)",
    default_branch: repo.json?.default_branch ?? "(unknown)",
  };
  return { id: "G4", title: "official proposal channel — measured state", fields };
}

export async function runAllProbes() {
  const results = [];
  results.push(await probeRpc());
  results.push(await probeRest());
  results.push(await probeEvents());
  results.push(await probeChannel());
  return results;
}

// Allow direct execution: node probe.mjs
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("probe.mjs")) {
  const results = await runAllProbes();
  for (const r of results) {
    console.log(`\n--- ${r.id} ${r.title} ---`);
    for (const [k, v] of Object.entries(r.fields)) console.log(`    ${k}: ${v}`);
  }
}
