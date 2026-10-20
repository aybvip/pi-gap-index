# pi-gap-index

**Measured gaps in the public Pi surface — each with a reproducible probe, a reference
specification, and an explicit statement of what it does *not* claim.**

> **What this is.** An index of concrete, **measured** deficits that a third-party developer meets on
> the public Pi network surface (RPC, REST, events, process), each paired with a **read-only reference
> implementation** and **conformance tests**. Every gap is re-checkable with one command.
>
> **What this is not.** It is **not** a proposal pretending to be inevitable. It makes **no claim**
> that Pi will adopt, endorse, or is obliged to adopt anything. Adoption is recorded as
> `not-claimed`, on purpose, in [`docs/ADOPTION.md`](docs/ADOPTION.md).

---

## The one-line answer

> The public Pi developer surface has **six measurable gaps**; this repository **measures** them,
> **specifies** a read contract against the measurements, and **proves the spec is implementable** —
> while claiming nothing about whether anyone will adopt it.

---

## Why this repository is shaped this way

The obvious plan — *"write a proposal and submit it, and it gets adopted"* — does not survive
contact with the measurement. From the public proposal channel
(`PiNetwork/PiRC`), reproduced by `node gaps.mjs --probe`:

| Figure | Value |
|---|---|
| Open pull requests | **94** |
| Closed pull requests | **23** |
| **Merged pull requests** | **0** |
| Non-empty lines in the ReadMe | **2** |
| Last content push to main | **2026-04-17** |

That is a **measured fact about a channel**, not a statement about anyone's intent
([`docs/CHANNEL.md`](docs/CHANNEL.md) is explicit about the difference). It changes the route, not the
goal:

| Route that does not work | Route this repository takes |
|---|---|
| Submit and wait | Measure, specify, implement, publish |
| Claim priority | "no prior work found" ([`PRIOR-ART.md`](docs/PRIOR-ART.md)) |
| Predict adoption | Record adoption as `not-claimed` ([`ADOPTION.md`](docs/ADOPTION.md)) |
| Argue that Pi is forced to act | Make the work **useful without permission** |

---

## The measured gaps

| Gap | Title | Layer | Severity |
|---|---|---|---|
| [G1](gaps/G1-mainnet-rpc.md) | No public Mainnet Soroban JSON-RPC endpoint | rpc | high |
| [G2](gaps/G2-hal-templates.md) | Horizon HAL links are RFC 6570 templates (naive call → 404) | rest | medium |
| [G3](gaps/G3-event-semantics.md) | Event reads are silently truncated (cap 100, `limit` ignored, exclusive `endLedger`) | events | high |
| [G4](gaps/G4-channel-process.md) | No published acceptance process for proposals | process | medium |
| [G5](gaps/G5-rpc-compatibility.md) | No compatibility contract for the RPC surface | rpc | medium |
| [G6](gaps/G6-mainnet-contracts.md) | Mainnet contract capability announced, not observable in the window | rpc | medium |

Each gap page carries: the **observation**, the **command that reproduces it**, **what it means**,
and **what is not claimed**.

---

## Quick start

Requires **Node.js ≥ 20**. **No npm dependencies.**

```bash
# 1. The measured gap registry
node gaps.mjs --list

# 2. One gap in detail
node gaps.mjs --gap G3

# 3. The measured state of the official proposal channel
node gaps.mjs --channel

# 4. What this repo refuses to claim
node gaps.mjs --boundaries

# 5. Run the read-only probes (network reads; no writes)
node gaps.mjs --probe

# 6. Run the offline invariant suite (no network)
node test/run.mjs
```

All network activity is **read-only**. The probes never sign, submit, or write anything, and send no
credentials.

---

## The reference specification

[`specs/SPEC-001-public-read-contract.md`](specs/SPEC-001-public-read-contract.md) is a **read-only
compatibility contract** for the Soroban RPC surface. It exists because publishing an endpoint is
necessary but not sufficient: a surface with silent truncation, unsignalled caps, and unstated
exclusivity has **six ways for a correct-looking client to be wrong**.

Its normative requirements (§3.3) are each anchored to a measurement in this repo, for example:

> **Truncation MUST be explicit.** A page **MUST** include a `truncated` flag and a `nextCursor`. A
> consumer **MUST NOT** have to infer truncation from `results.length == cap`.
> — measured basis: requesting `limit: 1000` returned exactly `100` events with no flag ([G3](gaps/G3-event-semantics.md))

It is paired with:

- [`ref/client.mjs`](ref/client.mjs) — a **read-only** reference client that **refuses** to call a raw
  template and never assumes a complete window;
- [`test/gap.test.mjs`](test/gap.test.mjs) — offline predicates that fail when the spec is violated;
- [`specs/TEMPLATE.md`](specs/TEMPLATE.md) — the RFC shape, if a maintainer wants to act on it.

---

## What this repository deliberately does **not** contain

- **No adoption claim.** Not "Pi will", not "Pi is forced to". Recorded as `not-claimed`.
- **No priority claim.** "No prior work found", never "first".
- **No submission.** It does not open proposals on your behalf; submission is the owner's action.
- **No writes of any kind.** No signing, no submitting, no ledger changes.
- **No credentials.** No tokens, keys, or API keys are read, stored, or sent.
- **No personal data.**
- **No accusation.** [G4](gaps/G4-channel-process.md) reports numbers about a channel and explicitly
  disclaims intent.

---

## Documentation

- [`docs/INDEX.md`](docs/INDEX.md) — index of everything
- [`docs/CHANNEL.md`](docs/CHANNEL.md) — the measured channel state, and what it does not show
- [`docs/ADOPTION.md`](docs/ADOPTION.md) — why adoption is `not-claimed`
- [`docs/PRIOR-ART.md`](docs/PRIOR-ART.md) — the honest prior-art statement
- [`docs/READINESS.md`](docs/READINESS.md) — what makes a spec reference-grade
- [`docs/SOURCES.md`](docs/SOURCES.md) — every source, by claim kind
- [`docs/VERIFICATION.md`](docs/VERIFICATION.md) — reproduce every claim yourself
- [`docs/EXTERNAL-CLAIM-REVIEW.md`](docs/EXTERNAL-CLAIM-REVIEW.md) — a public Pi economic model, checked claim by claim
- [`llms.txt`](llms.txt) — one-line answers for agent consumption

## Related repositories

- [`pi-user-behavior`](https://github.com/aybvip/pi-user-behavior) — what the chain does and does not show
- [`pi-soroban-events`](https://github.com/aybvip/pi-soroban-events) — event-window semantics, honestly
- [`pi-contract-upgrade-trail`](https://github.com/aybvip/pi-contract-upgrade-trail) — contract-upgrade visibility
- [`pi-contribution-evidence-model`](https://github.com/aybvip/pi-contribution-evidence-model) — a contribution evidence *model*, holding no data

## License

MIT. See [`LICENSE`](LICENSE).

## Scope

- **Read-only, unofficial.** Not affiliated with Pi Network. The probes read public endpoints only.
- **Measured figures are as observed at run time**; the window and endpoint are always printed.
- **Third-party sources are flagged unofficial.** Official sources are linked with status.
