# External claim review — a circulating Pi economic model

> **Claim kind: this page is a `review`.** It does **not** assert that any external author is wrong
> about their intent, and it does **not** name or link the author. It compares a set of **published
> claims** against **measurements this repository and its siblings can reproduce**, and separates
> three outcomes: *matches a measurement*, *contradicts a measurement*, and *cannot be checked here*.
>
> Nothing on this page is an accusation, a takedown, or a legal opinion. It is a **falsifiability
> table**: for each claim, what would have to be observable for it to be `measured`, and whether it is.

---

## 0. Why this page exists

Public discussion of Pi regularly combines **four different kinds of statement**:

1. statements **quoted from official Pi sources**,
2. statements **true of the Stellar lineage** that Pi inherits,
3. statements that are **plausible modelling** (economics, incentives), and
4. statements that **appear to be consensus facts but are not observable** on the public surface.

Kinds 1–3 are legitimate to make, if labelled. Kind 4 is the one that misleads a reader who then
builds on it. This repository's whole method is to keep those kinds apart, so a review of a public
model is exactly its job.

The review target is a four-part Arabic series published in a public Telegram channel on
2026-10-20, titled (translated) *"Comprehensive economic and software modelling of the Pi Network
system"*. Only the **channel's own public preview text** was read (Telegram truncates the preview at
roughly 1,030 characters per post for unauthenticated readers); the full posts require the Telegram
app. **This page therefore reviews only the excerpt that is publicly quotable, and says so.**

Per this repository's rules, the author is **not named**, no link to the channel is included, and no
statement is made about the author's intent.

---

## 1. Method

For each claim taken from the public excerpt:

| Step | Question |
|---|---|
| C1 | **What exactly is claimed?** (restated, not paraphrased into a straw man) |
| C2 | **What would make it `measured`?** (the observable) |
| C3 | **Is that observable?** (yes / no, and where) |
| C4 | **Verdict** — `matches` · `contradicts` · `uncheckable-here` · `out-of-scope` |

Verdicts are constrained to those four. `contradicts` requires a **reproducible** observation, not a
recollection. `uncheckable-here` is not a synonym for "false".

---

## 2. The claims, one by one

### E1 — "Protocol 28 is adopted; Pi is built on Stellar Core and the Stellar Consensus Protocol"

- **Restated.** Pi's consensus layer is Stellar-derived, and the network now runs Protocol 28.
- **Observable.** The RPC and Horizon both publish the live protocol version and core build.
- **Observed** (this repo, `node gaps.mjs --probe`):
  - Testnet RPC → `getNetwork` → `{"passphrase":"Pi Testnet","protocolVersion":28}`
  - Testnet RPC → `getVersionInfo` → `{"version":"28.0.1","captiveCoreVersion":"v28.0.1","protocolVersion":28}`
  - Mainnet Horizon `/` → `current_protocol_version: 28`, `core_version: stellar-core 28.0.1`,
    `history_latest_ledger: 29312745`
- **Verdict: `matches`.** This is the *correct* part of the model, and it is trivially re-checkable:
  `curl -s https://api.mainnet.minepi.com/ | grep -o '"current_protocol_version":[0-9]*'`

### E2 — "Protocol 28 bundles zero-knowledge proofs into consensus"

- **Restated.** The claim pairs "Stellar SCP" with "ZK-proofs" as one integrated consensus feature.
- **Observable.** A protocol version resolves to a fixed set of CAPs; those CAPs are published.
- **Observed** (documented, official):
  - Protocol 28 = **CAP-83** (partial transaction-set voting), **CAP-85** (atomic contract upgrades),
    **CAP-86** (migration-friendly contract data). No ZK content.
  - ZK-friendly primitives (BN254, Poseidon) arrived in **Protocol 25**, and they are **host
    functions** in the smart-contract environment, *not* consensus.
  - Stellar's own documentation: these primitives *"do not, on their own, provide end-to-end private
    payments"*.
- **Verdict: `contradicts`.** Two distinct layers (consensus vs. contract-host primitives) are
  merged. Repro: the CAP list is in the Stellar protocol release notes; this repo reproduces the live
  version number in §2/E1 but does **not** re-derive the CAP contents, which are **documented**, not
  measured here.

### E3 — "Coins carry a consensus signature — a 'humanity stamp' — that is lost when sent to a CEX, and KYC'd wallets get fee subsidies"

- **Restated.** Individual units are bound to a verifying person's signature; routing a unit through
  an external exchange strips that binding and revokes fee/gas discounts; re-buying does not restore
  it, and the unit is then classified by ZK + governance contracts as an "open wallet".
- **Observable.** It would require, on the public surface, *at least one* of: a per-unit identity
  field, a governance registry linking an account to a verification state, or a fee schedule that
  varies by that state.
- **Observed** (measured, siblings):
  - A native Pi payment carries **no per-unit origin**. The native asset has no issuer and no code;
    `balances` exposes `{"balance":"…","asset_type":"native"}` and nothing else. The only
    counterparty fields are `from` and an optional `memo`. → `pi-fungibility` `PROOF.md` §1.2–1.3.
  - The SCP signature in a ledger header covers the **`StellarValue`** (`txSetHash`, `closeTime`) —
    a statement about *the ledger*, not about a coin or a person. → `pi-fixed-supply` `PROOF.md` §5.2.
  - A content digest is **content-addressed, not identity-attested**: it cannot say *who* produced a
    record. → `pi-event-integrity` `README.md`.
  - Transaction fees are a **protocol-level base fee, split among nodes**. The official whitepaper
    describes no per-account fee exemption for verified wallets. → documented (Pi whitepaper).
- **Verdict: `contradicts`** (the observable is absent), on the fee and identity parts. The phrase
  "consensus signature" is a real term applied to the wrong object; the observable it needs does not
  exist on the public surface.

### E4 — "More than 420,000 active nodes, equipped to support decentralized AI"

- **Restated.** A node count, plus a capability claim (decentralized AI training/inference).
- **Observable.** The node count is **not published on any endpoint this repo reads**. The count
  appears in official Pi communications, and its value **moves** between them (~350k in one official
  post, ~420k in a later one).
- **Observed.** No RPC/Horizon method exposes a node census. A one-off proof-of-concept where node
  operators ran image-recognition models is **official** and is described by Pi as *exploring the
  capability*, not as a production capability.
- **Verdict: `uncheckable-here`** for the number (official, but not observable on the surface this
  repo measures); the **capability** part is `out-of-scope` — this repo does not measure AI workloads.

### E5 — "Pi Network Ventures is a $100M fund; investments include OpenMind and CiDi Games"

- **Restated.** A fund size and two named investments.
- **Observable.** Primary-source announcements on the operator's own domain.
- **Observed** (documented, official): `minepi.com/blog/pi-ventures/` (launch, $100M in Pi and USD,
  "not obligated to invest the entire $100M"); `minepi.com/blog/pi-network-ventures-openmind/` (first
  investment); `minepi.com/blog/pi-cidi-games/` (CiDi Games).
- **Verdict: `matches`** — but note this is **`documented`, not `measured`**, and it is **financial
  context**, not a consensus fact. This repo does not verify fund flows.

### E6 — "Logarithmic decay of the base mining rate (B), per the December 2021 whitepaper appendix"

- **Restated.** A named mechanism with a named official source.
- **Observable.** The claim cites its own source; the mechanism is described in the official appendix.
- **Verdict: `matches`** as a **`documented`** statement. This repo does not re-derive `B` over time.

### E7 — "M = 2.5 billion free Pi, V = 18, Q from transaction history × N², giving an equilibrium price P"

- **Restated.** An exchange-equation (MV = PQ) model, combined with Metcalfe's law (N²), to derive a
  **price**.
- **Observable.** Each input would need a published, reproducible figure:
  - `M` ("2.5 billion free Pi") vs. a public circulating-supply figure.
  - `V` ("18") vs. any published velocity.
  - The output `P` vs. anything on-chain (there is no price on-chain; price is an external market fact).
- **Observed** (measured / external):
  - Circulating supply reported by a public market aggregator on 2026-10-17: **~11.24 billion** of a
    100 billion cap. The claimed `M = 2.5 billion` does not match any figure this repo can find.
  - `pi-fixed-supply` measures the **total supply cap** at `100,000,000,000.0000000` across sampled
    ledgers, and — importantly — **explicitly refuses to claim anything about circulating supply**
    (`docs/VERIFICATION.md`, "never claimed" rows). So this repo cannot certify *or* refute a
    circulating figure; it can only point at the two numbers disagreeing.
  - `V = 18`: **no published source found.** A velocity is not observable on the public read surface.
  - The model **outputs a price**, which is exactly what `pi-fungibility` and `pi-fixed-supply`
    **refuse** to produce (`pi-fungibility` `DISCLAIMER.md`: "no claim about price"; `pi-fixed-supply`:
    circulating supply / price explicitly out of scope).
- **Verdict: `contradicts`** the `V` and `M` inputs (no source / disagree with the public figure);
  the *output* is `out-of-scope` for this repository on principle — **this project does not produce
  price estimates**, because a price is not a measurement of the chain.

---

## 3. The summary table

| # | Claim | Kind as published | Verdict here |
|---|---|---|---|
| E1 | Pi = Stellar/SCP; Protocol 28 live | sounds measured | **`matches`** (measured) |
| E2 | Protocol 28 = consensus + ZK | sounds measured | **`contradicts`** |
| E3 | Per-coin "humanity stamp"; CEX strips it; KYC fee subsidy | sounds measured | **`contradicts`** (absent observable) |
| E4 | >420k nodes; decentralized-AI capability | official + aspirational | **`uncheckable-here`** / `out-of-scope` |
| E5 | $100M Ventures; OpenMind; CiDi | sounds measured | **`matches`** (`documented`) |
| E6 | Logarithmic mining decay (WP Dec 2021) | cited | **`matches`** (`documented`) |
| E7 | MV=PQ + N² ⇒ price; M=2.5B, V=18 | sounds measured | **`contradicts`** inputs; output `out-of-scope` |

---

## 4. The one structural observation

The series opens with **"1 Pi = 1 Pi"** — a refusal to price Pi — and closes, in its fourth part, by
**deriving a price**. Those two positions cannot both be held. The refusal is a *framing*; the
derivation is a *model* whose inputs (`M`, `V`) are un- sourced while a public figure for one of them
differs by a large factor.

This is not a claim about the author. It is the standard failure mode this repository is built to
avoid: **unlabelled inputs producing a numeric output that a reader will treat as measured.**

---

## 5. What this page does **not** claim

- **No intent claim.** Nothing here is about why the claims were made.
- **No identity claim.** The author and channel are not named or linked.
- **No legal or securities opinion.** Whether Pi is a security is a legal question; this repository
  makes no statement on it (see E-status below).
- **No fraud claim.** `contradicts` means *"a reproducible observation is inconsistent with the
  claim"*, nothing more.
- **No price claim.** This repository never produces a price estimate, in either direction.
- **No completeness claim.** Only the publicly quotable excerpt was reviewed; the full four posts
  were not read because Telegram withholds them from unauthenticated readers.

Claims the series makes that are **out of scope** for this repository and therefore neither
confirmed nor denied: the securities classification of Pi (E-legal), the strategic value of the
Ventures investments (E-financial), and any statement about Pi's intent or future plans.

---

## 6. Reproduce this review

```bash
# live version facts used in E1 (read-only)
node gaps.mjs --probe

# the sibling measurements cited in E3 and E7
#   pi-fungibility     — per-unit origin absence: examples/provenance-check.mjs
#   pi-fixed-supply    — header signature scope, and total-supply cap
#   pi-event-integrity — content-addressed vs identity-attested
```

Every figure this page attributes to *this repository* is reproduced by a command in it. Every
figure it attributes to an **official Pi source** is labelled `documented`. Every figure it
attributes to a **market aggregator** is labelled `external — unofficial`.

---

See also: [`CHANNEL.md`](CHANNEL.md) (the measured state of the official proposal channel),
[`ADOPTION.md`](ADOPTION.md) (adoption is `not-claimed`), [`SOURCES.md`](SOURCES.md) (every source by
claim kind).
