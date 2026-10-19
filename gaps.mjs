#!/usr/bin/env node
// gaps.mjs — print the measured gap registry, the channel state, and the boundaries.
//
// Read-only, offline for the listing modes. The probes (--probe) are read-only
// network reads and never sign, write, or submit anything.

import {
  GAPS, CHANNEL, READINESS, MAX_READINESS, ADOPTION_MECHANISM,
  BOUNDARIES, FORBIDDEN_CLAIMS, CLAIM_KINDS, gapById,
} from "./lib.mjs";

const out = (s = "") => process.stdout.write(s + "\n");
const rule = (t) => out(`\n=== ${t} ===`);

function help() {
  out("pi-gap-index — measured gaps + reference specs, honestly labelled");
  out("");
  out("  node gaps.mjs --list          the measured gap registry");
  out("  node gaps.mjs --gap G1        one gap in detail");
  out("  node gaps.mjs --channel       measured state of the official proposal channel");
  out("  node gaps.mjs --readiness     what makes a spec reference-grade");
  out("  node gaps.mjs --boundaries    what this repo refuses to claim");
  out("  node gaps.mjs --probe         run the read-only probes (network reads)");
  out("  node gaps.mjs --help          this help");
  out("");
  out("Read-only. No writes, no keys, no submission.");
}

function list() {
  rule("MEASURED GAPS");
  for (const g of GAPS) {
    const probe = g.probe ? `probe: ${g.probe}` : "probe: (documented, no script)";
    out(`  [${g.id}] ${g.title}`);
    out(`      layer:      ${g.layer}`);
    out(`      claim:      ${g.kind}`);
    out(`      severity:   ${g.severity}`);
    out(`      ${probe}`);
    out(`      ${g.statement}`);
  }
  rule("CLAIM KINDS (every statement is exactly one)");
  for (const c of CLAIM_KINDS) out(`  ${c.id.padEnd(12)} ${c.meaning}`);
  rule("REPRODUCE ALL");
  out("  node gaps.mjs --probe");
}

function gap(id) {
  const g = gapById(id);
  if (!g) {
    out(`unknown gap: ${id}`);
    out(`known: ${GAPS.map((x) => x.id).join(", ")}`);
    process.exitCode = 2;
    return;
  }
  rule(`${g.id} — ${g.title}`);
  out(`  layer:     ${g.layer}`);
  out(`  claim:     ${g.kind}`);
  out(`  severity:  ${g.severity}`);
  out(`  affects:   ${g.affects.join(", ")}`);
  out("");
  out(`  statement: ${g.statement}`);
  out("");
  out("  observed:");
  for (const [k, v] of Object.entries(g.observed)) out(`    ${k}: ${v}`);
  out("");
  out(`  consequence: ${g.consequence}`);
  out("");
  out(`  probe: ${g.probe ?? "(documented; no script — see docs/SOURCES.md)"}`);
}

function channel() {
  rule("OFFICIAL PROPOSAL CHANNEL — MEASURED STATE");
  out(`  repo: ${CHANNEL.repo}`);
  out(`  url:  ${CHANNEL.url}`);
  out("");
  out("  measured:");
  for (const [k, v] of Object.entries(CHANNEL.measured)) {
    out(`    ${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
  }
  out("");
  out("  what this shows:");
  out(`    ${CHANNEL.interpretation.whatThisShows}`);
  out("  what this does NOT show:");
  out(`    ${CHANNEL.interpretation.whatThisDoesNotShow}`);
  out("");
  out("  Re-check with: node probe-channel.mjs");
}

function readiness() {
  rule("READINESS LADDER");
  for (const r of READINESS) out(`  ${String(r.level).padStart(2)}  ${r.name.padEnd(26)} needs: ${r.needs}`);
  rule("ADOPTION — WHAT IS AND IS NOT CLAIMED");
  out(`  claim kind: ${ADOPTION_MECHANISM.claim}`);
  out(`  ${ADOPTION_MECHANISM.statement}`);
  out("");
  out("  observable signals (evidence, not prediction):");
  for (const s of ADOPTION_MECHANISM.observableSignals) out(`    + ${s}`);
  out("  non-signals (do not treat as adoption):");
  for (const s of ADOPTION_MECHANISM.nonSignals) out(`    - ${s}`);
}

function boundaries() {
  rule("WHAT THIS REPO REFUSES TO DO");
  for (const b of BOUNDARIES) out(`  - ${b}`);
  rule("PHRASES THAT MUST NOT APPEAR AS ASSERTIONS");
  for (const f of FORBIDDEN_CLAIMS) out(`  x "${f}"`);
}

async function probe() {
  rule("RUNNING READ-ONLY PROBES");
  const { runAllProbes } = await import("./probe.mjs");
  const results = await runAllProbes();
  for (const r of results) {
    out(`\n--- ${r.id} ${r.title} ---`);
    for (const [k, v] of Object.entries(r.fields)) out(`    ${k}: ${v}`);
  }
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) help();
else if (args.includes("--list")) list();
else if (args.includes("--channel")) channel();
else if (args.includes("--readiness")) readiness();
else if (args.includes("--boundaries")) boundaries();
else if (args.includes("--probe")) await probe();
else if (args.includes("--gap")) {
  const i = args.indexOf("--gap");
  gap(args[i + 1]);
} else {
  out(`unknown option: ${args.join(" ")}`);
  out("try: node gaps.mjs --help");
  process.exitCode = 2;
}
