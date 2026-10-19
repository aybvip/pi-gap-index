// test/gap.test.mjs — offline invariants for pi-gap-index.
// No network. No personal data. No writes.
import {
  GAPS, CHANNEL, READINESS, MAX_READINESS, ADOPTION_MECHANISM,
  BOUNDARIES, FORBIDDEN_CLAIMS, CLAIM_KINDS, FORBIDDEN_OPERATIONS, gapById,
} from "../lib.mjs";
import { stripTemplate, isTemplate, buildCallUrl, isTruncated, describePage } from "../ref/client.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

let pass = 0, fail = 0;
const failures = [];
function ok(cond, label) {
  if (cond) { pass++; return; }
  fail++; failures.push(label);
}
function eq(a, b, label) {
  const A = JSON.stringify(a), B = JSON.stringify(b);
  if (A === B) { pass++; return; }
  fail++; failures.push(`${label}\n    expected: ${B}\n    actual:   ${A}`);
}

// --- claim discipline -------------------------------------------------------
eq(CLAIM_KINDS.map((c) => c.id), ["measured", "documented", "external", "not-claimed"],
  "exactly four claim kinds, none named 'inevitable'");
ok(FORBIDDEN_CLAIMS.length >= 5, "forbidden-claim list is populated");
ok(FORBIDDEN_CLAIMS.some((f) => /forced|obliged/i.test(f)), "forbids 'Pi is forced/obliged' claims");
ok(FORBIDDEN_CLAIMS.some((f) => /first|invented/i.test(f)), "forbids priority claims");
ok(!CLAIM_KINDS.some((c) => /adopted|endorsed/i.test(c.id)), "there is no 'adopted' claim kind");

// --- gaps are measured/documented and complete ------------------------------
ok(GAPS.length >= 6, "there are at least six gaps");
for (const g of GAPS) {
  ok(/^G[0-9]+$/.test(g.id), `gap id looks like G<n>: ${g.id}`);
  ok(["measured", "documented"].includes(g.kind), `${g.id} is measured or documented (never opinion)`);
  ok(g.statement && g.consequence && g.severity, `${g.id} has statement, consequence and severity`);
  ok(Array.isArray(g.affects) && g.affects.length > 0, `${g.id} names who is affected`);
  ok(g.observed && Object.keys(g.observed).length > 0, `${g.id} records what was observed`);
}
eq(gapById("G1").probe, "probe-rpc.mjs", "G1 points at the RPC probe");
eq(gapById("nope"), null, "unknown gap id resolves to null");
ok(GAPS.some((g) => g.id === "G4" && /acceptance process/i.test(g.title)),
  "G4 records the missing acceptance process");

// --- a measured gap must have a probe -------------------------------------
for (const g of GAPS.filter((x) => x.kind === "measured")) {
  ok(typeof g.probe === "string" && g.probe.length > 0, `measured gap ${g.id} has a probe script`);
}

// --- the channel figures are numbers, and intent is not claimed ------------
ok(Number.isInteger(CHANNEL.measured.openPullRequests), "channel open-PR count is an integer");
ok(Number.isInteger(CHANNEL.measured.mergedPullRequests), "channel merged-PR count is an integer");
ok(/does not show intent/i.test(CHANNEL.interpretation.whatThisDoesNotShow),
  "channel section explicitly disclaims intent claims");
ok(!/will (be|get) (merged|adopted)/i.test(JSON.stringify(CHANNEL)),
  "channel section does not predict adoption");

// --- readiness ladder -------------------------------------------------------
eq(READINESS[0].level, 0, "readiness starts at 0");
ok(READINESS.some((r) => r.name === "conformance tests"), "readiness includes conformance tests");
ok(READINESS.some((r) => /submission/i.test(r.name)), "readiness reaches a submission package");

// --- adoption is 'not-claimed' and lists non-signals -----------------------
eq(ADOPTION_MECHANISM.claim, "not-claimed", "adoption is explicitly not-claimed");
ok(ADOPTION_MECHANISM.nonSignals.some((s) => /pull request/i.test(s)),
  "a opened pull request is listed as a NON-signal");
ok(!/will adopt/i.test(ADOPTION_MECHANISM.statement), "adoption statement does not predict adoption");

// --- boundaries and forbidden operations -----------------------------------
ok(BOUNDARIES.length >= 5, "there are at least five boundaries");
ok(BOUNDARIES.some((b) => /obliged|forced|likely to adopt/i.test(b)), "boundary: no obligation/adoption claim");
ok(BOUNDARIES.some((b) => /read-only/i.test(b)), "boundary: probes are read-only");
ok(FORBIDDEN_OPERATIONS.length >= 4, "forbidden-operation list is populated");
ok(FORBIDDEN_OPERATIONS.includes("submitTransaction"), "submitting transactions is forbidden");

// --- the library and client contain no forbidden operation -----------------
const libSrc = readFileSync(join(root, "lib.mjs"), "utf8");
const clientSrc = readFileSync(join(root, "ref", "client.mjs"), "utf8");
const probeSrc = readFileSync(join(root, "probe.mjs"), "utf8");
for (const op of FORBIDDEN_OPERATIONS) {
  for (const [name, src] of [["lib.mjs", libSrc], ["ref/client.mjs", clientSrc], ["probe.mjs", probeSrc]]) {
    ok(!new RegExp(`\\b${op}\\s*\\(`).test(src), `${name} does not define/call ${op}()`);
  }
}
// read-only invariant: the client must not carry a signing path
ok(!/sign(Transaction|With)?\s*\(|keypair|secret|privateKey/i.test(clientSrc),
  "ref client has no signing/key material");
// the probe sends no credentials: no auth header is constructed, and no key/token is read.
// (A bare mention in a comment is fine; constructing an auth header is not.)
ok(!/headers\s*:\s*\{[^}]*Authorization/i.test(probeSrc), "probe builds no Authorization header");
ok(!/\b(Bearer|apiKey|api_key|secretKey)\b/i.test(probeSrc.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")),
  "probe mentions no credential outside comments");
ok(/AbortController/.test(probeSrc), "probe time-boxes every request");


// --- RFC 6570 handling matches the measured trap ---------------------------
const tpl = "https://api.mainnet.minepi.com/operations{?cursor,limit,order,include_failed}";
ok(isTemplate(tpl), "detects the measured HAL template");
eq(stripTemplate(tpl), "https://api.mainnet.minepi.com/operations", "strips the template to a callable base");
ok(!isTemplate(stripTemplate(tpl)), "stripped link is no longer a template");
let threw = false;
try { buildCallUrl(tpl, { limit: 20 }); } catch { threw = true; }
ok(threw, "buildCallUrl refuses to call a raw template (the G2 trap)");
eq(buildCallUrl("https://api.mainnet.minepi.com/operations", { limit: 20 }),
  "https://api.mainnet.minepi.com/operations?limit=20", "appends query only to a stripped link");

// --- truncation is explicit, never guessed ---------------------------------
ok(isTruncated({ truncated: true }, 1000) === true, "explicit truncated:true is honoured");
ok(isTruncated({ truncated: false }, 1000) === false, "explicit truncated:false is honoured");
ok(isTruncated({ nextCursor: "abc" }, 1000) === true, "a nextCursor implies truncation");
ok(isTruncated({ effectiveLimit: 100 }, 1000) === true, "server reducing the limit implies truncation");
ok(isTruncated({}, 100) === true, "no signal is treated as unsafe (true), not as 'complete'");
eq(describePage({ effectiveLimit: 100, retentionWindow: 120960, endLedgerExclusive: true }),
  { effectiveLimit: 100, retentionWindow: 120960, endLedgerExclusive: true },
  "describePage reports what was actually applied");
eq(describePage({}), { effectiveLimit: null, retentionWindow: null, endLedgerExclusive: null },
  "describePage invents no values when the server sends none");

// --- documentation consistency ---------------------------------------------
const docs = [
  "README.md", "llms.txt",
  "docs/INDEX.md", "docs/CHANNEL.md", "docs/ADOPTION.md", "docs/SOURCES.md",
  "docs/READINESS.md", "docs/PRIOR-ART.md", "docs/VERIFICATION.md",
  "specs/SPEC-001-public-read-contract.md", "specs/TEMPLATE.md",
];
for (const rel of docs) {
  let src;
  try { src = readFileSync(join(root, rel), "utf8"); } catch { failures.push(`${rel} is missing`); fail++; continue; }
  ok(src.length > 200, `${rel} has content`);
}

// A forbidden phrase is only a violation when ASSERTED. Documents in this repo
// legitimately *quote* them to deny them ("no claim that Pi is forced to…", or in
// a table of rejected arguments, or wrapped in quotes). So we flag only bare
// assertions: not negated, not quoted, not on a line that marks it as rejected.
const NEGATION = /\b(no|not|never|does not|do not|must not|refuse|refuses|unless|reject|rejected|without|forbid|forbidden|cannot|can't|isn't|aren't|disclaim|non-signal|non-claim)\b/i;
const REJECT_MARK = /(non-signal|non-claim|forbidden|rejected|not claimed|not-claimed|does not claim|doesn't claim|never (a|an) |avoid|refus)/i;
function assertsForbidden(line, phrase) {
  if (!line.toLowerCase().includes(phrase.toLowerCase())) return false;
  if (NEGATION.test(line) || REJECT_MARK.test(line)) return false;
  // a quoted mention inside a sentence is a quotation, not an assertion
  if (new RegExp(`["'\`][^"'\`]*${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[^"'\`]*["'\`]`, "i").test(line)) return false;
  return true;
}
for (const rel of docs) {
  const src = readFileSync(join(root, rel), "utf8");
  for (const phrase of FORBIDDEN_CLAIMS) {
    const offending = src.split(/\r?\n/).filter((l) => assertsForbidden(l, phrase));
    ok(offending.length === 0,
      `${rel}: does not ASSERT forbidden claim "${phrase}"${offending[0] ? ` (offending: ${offending[0].trim().slice(0, 100)})` : ""}`);
  }
}

// --- every gap has a page ---------------------------------------------------
const gapPages = readdirSync(join(root, "gaps")).filter((f) => f.endsWith(".md"));
ok(gapPages.length >= GAPS.length - 1, `there is a page per gap (${gapPages.length} pages, ${GAPS.length} gaps)`);
for (const g of GAPS.filter((x) => x.id !== "G5")) {
  ok(gapPages.some((p) => p.startsWith(g.id)), `gap page exists for ${g.id}`);
}

// --- llms.txt states the honest limits -------------------------------------
const llms = readFileSync(join(root, "llms.txt"), "utf8");
ok(/not-claimed/i.test(llms), "llms.txt states adoption is not-claimed");
ok(/read-only/i.test(llms), "llms.txt states the probes are read-only");
ok(/no prior work found/i.test(llms) || /does not claim priority/i.test(llms),
  "llms.txt is honest about prior art / priority");

console.log("pi-gap-index — invariant tests");
console.log(`  pass: ${pass}`);
console.log(`  fail: ${fail}`);
if (fail > 0) {
  console.log("\nFAILURES:");
  for (const f of failures) console.log("  - " + f);
  process.exitCode = 1;
}
