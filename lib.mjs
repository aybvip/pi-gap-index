// lib.mjs — the measured gap registry, as pure data. No writes, no secrets.
//
// Single source of truth for:
//   - the GAPS: measured technical/compatibility gaps in the public Pi surface
//   - the CHANNEL: measured state of the official PiRC proposal channel
//   - the CLAIM RULES: how a gap may be stated (measured / documented / not-claimed)
//   - the READINESS ladder: what makes a spec "reference-grade"

// ---------------------------------------------------------------------------
// 1. Claim rules — the honesty contract
// ---------------------------------------------------------------------------

/**
 * Every statement in this repo is exactly one of these. There is deliberately
 * no "we are first" and no "Pi is forced to adopt this" category.
 */
export const CLAIM_KINDS = [
  {
    id: "measured",
    meaning: "reproduced by a command in this repo, against a public endpoint, right now",
    requires: "a script + the printed window/version",
  },
  {
    id: "documented",
    meaning: "quoted from an official Pi source, with URL and status",
    requires: "the exact source URL and the status label",
  },
  {
    id: "external",
    meaning: "reported by a third party",
    requires: "explicitly flagged UNOFFICIAL",
  },
  {
    id: "not-claimed",
    meaning: "out of scope: adoption, intent, price, endorsement, priority",
    requires: "nothing — it is simply not asserted",
  },
];

/** Phrases that must never appear as an assertion in this repo. */
export const FORBIDDEN_CLAIMS = [
  "Pi is forced to",
  "Pi is obliged to",
  "Pi must adopt",
  "we are first",
  "we invented",
  "guaranteed adoption",
  "this will be merged",
];

// ---------------------------------------------------------------------------
// 2. The measured gaps
// ---------------------------------------------------------------------------
//
// Each gap is a *measured* deficit in the public Pi surface — reproducible by a
// read-only probe. A gap is not a wish; it is an observation with a script.

export const GAPS = [
  {
    id: "G1",
    title: "No public Mainnet Soroban JSON-RPC endpoint",
    layer: "rpc",
    kind: "measured",
    statement:
      "The public Pi Mainnet Soroban JSON-RPC is not reachable, so contract state and events cannot be read from Mainnet by a third party.",
    probe: "probe-rpc.mjs",
    observed: {
      mainnet: "rpc.mainnet.minepi.com -> fetch failure / HTTP 503; certificate reported expired 2023-05-30",
      testnet: "rpc.testnet.minepi.com is the only publicly working Soroban JSON-RPC",
    },
    consequence:
      "Every contract reading (balances, events, escrow state) is Testnet-only today. Mainnet 'behavior' therefore reduces to classic Horizon operations.",
    severity: "high",
    affects: ["developers", "indexers", "wallets", "auditors"],
  },
  {
    id: "G2",
    title: "Horizon HAL links are RFC 6570 URI templates, not ready-to-call URLs",
    layer: "rest",
    kind: "measured",
    statement:
      "Links returned by Pi Mainnet Horizon contain literal template expressions such as '{?cursor,limit,order}'. Appending a query string without stripping the braces returns 404.",
    probe: "probe-rest.mjs",
    observed: {
      mainnet: "api.mainnet.minepi.com operations links carry '{?...}' expressions",
    },
    consequence:
      "Naive clients built from the HAL payload fail. Every consumer must implement RFC 6570 brace-stripping; the failure mode is a confusing 404, not an error message.",
    severity: "medium",
    affects: ["developers", "SDK authors", "indexers"],
  },
  {
    id: "G3",
    title: "Event reads are silently truncated (cap 100, limit ignored, exclusive endLedger)",
    layer: "events",
    kind: "measured",
    statement:
      "getEvents returns at most 100 events per page; the requested limit is ignored, the cursor is not honoured, and endLedger is EXCLUSIVE. Retention is a bounded ledger window.",
    probe: "probe-events.mjs",
    observed: {
      testnet: "page cap = 100 events; limit ignored; endLedger EXCLUSIVE; ledgerRetentionWindow = 120,960",
    },
    consequence:
      "A consumer that trusts 'limit' or 'endLedger' will believe it read a complete window when it did not. Silent truncation is the dangerous part.",
    severity: "high",
    affects: ["developers", "indexers", "analytics"],
  },
  {
    id: "G4",
    title: "The official proposal channel has no published acceptance process",
    layer: "process",
    kind: "measured",
    statement:
      "The official Pi Requests-for-Comment repository publishes no contribution guide: its ReadMe is a two-line index, and its main branch has received no content update for an extended period.",
    probe: "probe-channel.mjs",
    observed: {
      github: "PiNetwork/PiRC -> ReadMe.md is a 2-line index; main branch content is a small set of RFC documents",
    },
    consequence:
      "There is no written rule for what a proposal must contain to be considered, so quality is not distinguishable from volume. See CHANNEL.md for the measured counts.",
    severity: "medium",
    affects: ["proposers", "community", "developers"],
  },
  {
    id: "G5",
    title: "No documented, stable, versioned public contract for the Soroban RPC surface",
    layer: "rpc",
    kind: "documented",
    statement:
      "The public developer documentation describes the SDK and the platform API, but does not publish a compatibility contract for the Soroban JSON-RPC surface a third-party indexer would depend on.",
    probe: null,
    observed: {
      docs: "developer documentation is SDK/Platform-API oriented; no RPC compatibility/versioning contract found",
    },
    consequence:
      "Indexers cannot declare a compatibility target, so upgrades are discovered by breakage rather than by announcement.",
    severity: "medium",
    affects: ["indexers", "infrastructure", "wallets"],
  },
  {
    id: "G6",
    title: "Mainnet contract capability is announced but not observable on Mainnet",
    layer: "rpc",
    kind: "measured",
    statement:
      "A recent Mainnet operation window contains no contract-invocation operations and no issued assets, while contract event vocabulary is live on Testnet.",
    probe: "probe-rest.mjs",
    observed: {
      mainnet: "recent op histogram: payment / create_claimable_balance / create_account; no invoke_host_function; /assets -> 0 records",
      testnet: "live contract-event vocabulary",
    },
    consequence:
      "Capability statements and observable state differ by environment. Any tool must state which environment it measured.",
    severity: "medium",
    affects: ["developers", "analytics", "auditors"],
  },
];

export const gapById = (id) => GAPS.find((g) => g.id === id) ?? null;

// ---------------------------------------------------------------------------
// 3. The official channel — measured, and reported without accusation
// ---------------------------------------------------------------------------

/**
 * These figures are *observed from the public repository* and are re-checkable
 * with probe-channel.mjs. They are reported as facts about a channel, not as a
 * judgement about Pi's intentions. Intent is not measurable and is not claimed.
 */
export const CHANNEL = {
  repo: "PiNetwork/PiRC",
  url: "https://github.com/PiNetwork/PiRC",
  measured: {
    openPullRequests: 94,
    closedPullRequests: 23,
    mergedPullRequests: 0,
    readmeLines: 2,
    mainBranchContentDocs: ["PiRC1", "PiRC2"],
  },
  interpretation: {
    whatThisShows:
      "The channel exists and accepts submissions; merge is not currently the outcome for any submission observed.",
    whatThisDoesNotShow:
      "It does not show intent, priority, or that any specific proposal will or will not be adopted. Those are not measurable and are not claimed.",
  },
};

// ---------------------------------------------------------------------------
// 4. Readiness ladder — what makes a spec "reference-grade"
// ---------------------------------------------------------------------------

export const READINESS = [
  { level: 0, name: "observation", needs: "a reproducible probe that shows the gap" },
  { level: 1, name: "problem statement", needs: "who is affected and what breaks" },
  { level: 2, name: "specification", needs: "a concrete interface/format, versioned" },
  { level: 3, name: "reference implementation", needs: "runnable, dependency-free, read-only where possible" },
  { level: 4, name: "conformance tests", needs: "offline checks anyone can run against the spec" },
  { level: 5, name: "migration / compatibility", needs: "what changes for existing consumers, and what does not" },
  { level: 6, name: "submission package", needs: "RFC-shaped text + a diff ready for an upstream proposal" },
];

export const MAX_READINESS = READINESS.length - 1;

// ---------------------------------------------------------------------------
// 5. The honest adoption model
// ---------------------------------------------------------------------------
//
// This repo does NOT assert that Pi will adopt anything. It states the only
// mechanism that is actually verifiable: independent use.
//
// The mechanism below is offered as a *description of how standards spread*,
// not as a claim about Pi's decisions.

export const ADOPTION_MECHANISM = {
  claim: "not-claimed",
  statement:
    "Adoption is a decision by the maintainer of a system. It cannot be compelled or predicted from outside, and this repo does not assert it.",
  observableSignals: [
    "other projects run the reference implementation or pass its conformance tests",
    "the formats are consumed by tooling that does not depend on this repo",
    "the proposal is discussed on its technical merits in the maintainer's own channel",
  ],
  nonSignals: [
    "a pull request being opened",
    "a star count",
    "a claim that a standard is 'inevitable'",
  ],
};

// ---------------------------------------------------------------------------
// 6. Boundaries — what this repo refuses to do
// ---------------------------------------------------------------------------

export const BOUNDARIES = [
  "It does not claim Pi is obliged, forced, or likely to adopt anything.",
  "It does not claim priority, novelty, or that no prior work exists elsewhere.",
  "It does not submit anything on the user's behalf; submission is the owner's action.",
  "It writes no personal data and holds no keys, tokens, or credentials.",
  "It never signs or submits a network operation; probes are read-only.",
  "It does not present its own preferences as Pi's roadmap.",
];

/** Operations that must not exist anywhere in this repo's code. */
export const FORBIDDEN_OPERATIONS = [
  "signTransaction",
  "submitTransaction",
  "postTransaction",
  "createProposal",
  "submitToPiRC",
  "writeLedger",
];
