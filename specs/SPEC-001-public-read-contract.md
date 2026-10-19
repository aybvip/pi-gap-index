# SPEC-001 — Public Read Compatibility Contract for the Pi Soroban JSON-RPC surface

- **Gap:** [G1](../gaps/G1-mainnet-rpc.md) — no public Mainnet Soroban JSON-RPC
- **Readiness:** level 6 (submission package) — see [`../docs/READINESS.md`](../docs/READINESS.md)
- **Status:** reference specification. **Not** adopted, endorsed, or submitted by anyone. See
  [`../docs/ADOPTION.md`](../docs/ADOPTION.md).
- **Applies to:** `rpc.testnet.minepi.com` today; any future public Soroban RPC endpoint.

> **Claim discipline.** Nothing here asserts that any endpoint *will* be published, or that Pi is
> obliged to publish one. The gap is measured ([G1](../gaps/G1-mainnet-rpc.md)); this is a reference
> for what a *usable* public read surface would have to specify. It is written so that a maintainer
> could adopt it wholesale, in part, or not at all.

---

## 1. Problem

Third-party developers cannot read contract state or contract events on **Mainnet**. Measured today:

```
mainnet_endpoint: https://rpc.mainnet.minepi.com
mainnet_result:   NOT REACHABLE (fetch failed)
testnet_endpoint: https://rpc.testnet.minepi.com   -> HTTP 200 (healthy)
```

Reproduce: `node gaps.mjs --probe`.

The consequence is not merely "an endpoint is down". It is that **every contract-aware tool is
Testnet-only**, and Mainnet consumers are limited to classic Horizon operations. A wallet, an
indexer, or an auditor cannot independently verify contract state on the network that holds value.

---

## 2. What is missing (and this is the real subject)

Publishing an endpoint is necessary but **not sufficient**. What makes a public read surface usable
is a **compatibility contract**. The following are the observable deficits that make the current
surface hard to depend on, each measured elsewhere in this repo:

| # | Deficit | Where measured |
|---|---|---|
| 1 | No public Mainnet read endpoint | [G1](../gaps/G1-mainnet-rpc.md) |
| 2 | Requested `limit` is silently capped | [G3](../gaps/G3-event-semantics.md) |
| 3 | Page results are truncated with no explicit continuation signal | [G3](../gaps/G3-event-semantics.md) |
| 4 | `endLedger` is exclusive, which surprises consumers | [G3](../gaps/G3-event-semantics.md) |
| 5 | Retention window is bounded and not advertised in the response | [G3](../gaps/G3-event-semantics.md) |
| 6 | No published versioning/compatibility statement | [G5](../gaps/G5-rpc-compatibility.md) |
| 7 | REST HAL links are RFC 6570 templates, not callable URLs | [G2](../gaps/G2-hal-templates.md) |

A specification that fixes only (1) leaves six ways for a correct-looking client to be wrong.

---

## 3. Reference specification

### 3.1 Scope

This specification covers **read-only** operations. It deliberately says nothing about transaction
submission, signing, or write paths — a read surface is the part a third party can be granted
without any authority over funds.

### 3.2 Required capabilities

| ID | Capability | Minimum behaviour |
|---|---|---|
| R1 | Network identity | A call that returns the network passphrase and protocol version, so a client can refuse to run against the wrong network. |
| R2 | Health and retention | A call that returns latest ledger, oldest ledger, and the retention window as explicit numbers. |
| R3 | Contract state read | A call that reads a contract's ledger entries by key, with a defined error for "absent". |
| R4 | Event read | A call that reads events for a ledger range, with an explicit truncation signal. |
| R5 | Deterministic pagination | A continuation token that is stable across calls for the same query. |

### 3.3 Required response semantics (the part that is usually missing)

These are normative. They exist because each one has been observed to go wrong:

1. **Truncation MUST be explicit.** If the server returns fewer results than requested, the response
   **MUST** include a field such as `"truncated": true` and a `nextCursor`. A consumer **MUST NOT**
   have to infer truncation from `results.length == cap`.

   > Measured basis: requesting `limit: 1000` returned exactly `100` events with no truncation flag
   > ([G3](../gaps/G3-event-semantics.md)).

2. **The effective limit MUST be reported.** Every page **MUST** state the `limit` that was actually
   applied, so a client can detect that its request was reduced.

3. **`endLedger` semantics MUST be stated in the response**, not only in prose. If it is exclusive,
   the response **MUST** say so (`"endLedgerExclusive": true`).

4. **Retention MUST be returned with the window.** A result set **MUST** carry the retention bound,
   so a client can distinguish "no events" from "events aged out".

   > Measured basis: `ledgerRetentionWindow = 120,960`
   > ([G3](../gaps/G3-event-semantics.md)).

5. **Absent data MUST NOT be an error.** Reading a key that does not exist **MUST** return a
   distinguishable "absent" result, not a transport failure. A missing entry is information.

6. **Errors MUST be typed.** Field names for the failure modes (unknown ledger, aged-out window,
   rate limited) **MUST** be stable and documented.

### 3.4 Compatibility statement (template)

A publisher of this surface **SHOULD** publish, alongside it:

```
compatibility:
  network: "<passphrase>"
  protocolVersion: <int>
  readApiVersion: "<semver>"
  retentionWindowLedgers: <int>
  deprecationPolicy: "<what happens to old clients>"
  supportedXdrFormat: ["json", "base64"]
```

This is the capability that [G5](../gaps/G5-rpc-compatibility.md) records as absent. Its absence is
why upgrades are currently discovered by breakage.

### 3.5 What this specification explicitly does NOT require

- It does **not** require a specific transport beyond "a single documented endpoint".
- It does **not** require a particular pagination encoding — only that it be deterministic and
  explicit.
- It does **not** require open write access. Read scope only.
- It does **not** require any change to how the network itself operates.

---

## 4. Reference implementation

[`../ref/client.mjs`](../ref/client.mjs) is a dependency-free, **read-only** client that:

- implements the RFC 6570 brace-stripping required by [G2](../gaps/G2-hal-templates.md),
- treats truncation according to §3.3.1 (never assumes a full window),
- reports the effective limit and retention it observed,
- refuses to proceed when it cannot confirm network identity,
- **issues no write, sign, or submit call of any kind.**

It is a client, not a server. It does not stand up an endpoint — it demonstrates the contract put
into practice by a consumer, which is the check a specification most often fails.

---

## 5. Conformance tests

[`../test/gap.test.mjs`](../test/gap.test.mjs) encodes §3.3 as offline assertions
against the reference client's helpers. Anyone can run them:

```bash
node test/run.mjs
```

A future implementation can be checked against the same predicates without contacting this repo.

---

## 6. Migration / compatibility

| Consumer | Today | With this specification |
|---|---|---|
| Horizon-only tools | unaffected | unaffected (this spec is additive) |
| Testnet contract tools | work; silently capped | get an explicit truncation signal |
| Mainnet contract tools | impossible | possible if an endpoint is published |
| Indexers | discover breakage | read a compatibility statement |

Nothing in this specification requires an existing consumer to change. That is deliberate: a
specification that forces migration is adopted slowly, if at all.

---

## 7. Submission package

A maintainer who wishes to act on this can use the RFC shape in
[`../specs/TEMPLATE.md`](../specs/TEMPLATE.md). The diff is this document plus the reference client
and conformance predicates. **No submission is made by this repository** — submission is the
maintainer's decision, and [the adoption page](../docs/ADOPTION.md) explains why this repo does not
predict the outcome.

---

## 8. What this document does not claim

- It does **not** claim Pi will publish a Mainnet read endpoint.
- It does **not** claim Pi is obliged to adopt anything here.
- It does **not** claim novelty or priority; see
  [`../docs/PRIOR-ART.md`](../docs/PRIOR-ART.md) for the honest prior-art statement.
- It does **not** claim that adoption of this text would be sufficient, on its own, to make the
  surface safe to depend on.
