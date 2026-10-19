# G6 — Mainnet contract capability is announced but not observable on Mainnet

- **Layer:** rpc · **Claim:** measured · **Severity:** medium
- **Probe:** `node gaps.mjs --probe`
- **Affects:** developers, analytics, auditors

---

## Observation (measured)

```
operation_histogram:            11x payment, 6x create_claimable_balance, 3x create_account
issued_assets_records:          0
contract_invocation_observed:   NOT OBSERVED in this window
```

On Mainnet, a recent operation window contains only classic value-moving operations. There are **no
contract-invocation operations** and **no issued assets** in the window measured.

On **Testnet**, in contrast, the contract-event vocabulary is live.

## Why the wording is careful

The measurement is of a **window**, not of the network. The window size is printed so a reader can
judge coverage. The honest statement is:

> *In the measured window, contract invocations and issued assets were not observed.*

**Not:** *"Pi has no contracts on Mainnet."* The second claim is not supported by a window
measurement, and this repository does not make it.

## What this means for a tool

1. Contract capability and observable contract state **differ by environment**.
2. A tool that does not name its environment is **ambiguous**, even when its code is correct.
3. Announcements (blog posts, RFCs) and observable state are **different claim kinds** — one is
   `documented`, the other is `measured`, and they must not be mixed in a single sentence.

## Relationship to the specification

[`SPEC-001`](../specs/SPEC-001-public-read-contract.md) §3.3 requires a response to state which
network it describes, which is the general form of the fix for this class of confusion.

## What is not claimed here

- Not claimed: that Mainnet has no contracts at all — only that none appeared in the measured window.
- Not claimed: that announced capability is untrue — announcements and observations are different
  kinds of statement, and both are recorded honestly.
