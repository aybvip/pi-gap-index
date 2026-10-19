# G1 — No public Mainnet Soroban JSON-RPC endpoint

- **Layer:** rpc · **Claim:** measured · **Severity:** high
- **Probe:** `node gaps.mjs --probe` (or `node probe.mjs`)
- **Affects:** developers, indexers, wallets, auditors

---

## Observation (measured)

```
mainnet_endpoint: https://rpc.mainnet.minepi.com
mainnet_result:   NOT REACHABLE (fetch failed)
testnet_endpoint: https://rpc.testnet.minepi.com
testnet_result:   HTTP 200 — {"status":"healthy","latestLedger":27254629, …}
```

Reproduce as of 2026-10-19. The Testnet endpoint is the only publicly working Soroban JSON-RPC.

## What it means

Contract state and contract events **cannot be read from Mainnet by a third party**. Every
contract-aware tool is therefore Testnet-only, while the network that holds value exposes only
classic Horizon operations.

## Why this is the highest-severity gap

Three separate classes of consumer lose independent verification:

1. **Auditors** cannot confirm contract state on the network that matters.
2. **Wallets** cannot show contract holdings derived from the chain.
3. **Indexers** cannot build a Mainnet contract index, so contract activity is invisible to
   analytics.

> **A note on certificates.** Earlier observations recorded a certificate expiry on this host. The
> current measurement is simply "not reachable". Both are the same gap; the reachability probe is the
> one that is reproducible without trusting a clock.

## Consequence

Statements about contract capability and observable contract state differ by environment. **Any tool
must state which environment it measured** — a rule this repo follows everywhere.

## Reference specification

[`../specs/SPEC-001-public-read-contract.md`](../specs/SPEC-001-public-read-contract.md) — a read-only
compatibility contract, written so a maintainer could adopt it in whole, in part, or not at all.

## What is not claimed here

- Not claimed: that an endpoint will be published.
- Not claimed: that Pi is obliged to publish one.
- Not claimed: that a published endpoint alone would be sufficient (the six other deficits in
  [`SPEC-001`](../specs/SPEC-001-public-read-contract.md) §2 remain).
