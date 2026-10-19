# G5 — No published compatibility contract for the Soroban RPC surface

- **Layer:** rpc · **Claim:** documented · **Severity:** medium
- **Probe:** none — this is a **documented absence**, not a runtime measurement
- **Affects:** indexers, infrastructure, wallets

---

## Observation (documented)

The public Pi developer documentation is organised around the **client SDK** and the **Platform API**
(authentication, payments, ads, notifications, staking data). Those are documented in detail.

What is **not found** is a **compatibility contract** for the Soroban JSON-RPC surface: a statement
of a read-API version, a deprecation policy, and which response fields a consumer may depend on.

## Why "documented absence" is the honest label

This gap is **not** measured by a probe, because it is the absence of a document. The honest claim is:
*"a search of the official developer documentation did not find a compatibility statement"* — not
*"no such statement exists anywhere"*. If a statement is published later, this page must be updated.

That distinction is exactly the claim discipline used across this repository
([`../docs/SOURCES.md`](../docs/SOURCES.md)).

## Why a compatibility contract matters

Without one, a consumer cannot answer basic questions:

| Question | Why it matters |
|---|---|
| Which fields may I rely on? | Otherwise every field is a guess that may break |
| What is the version of the read API? | Otherwise upgrades are discovered by breakage |
| What happens to my client on upgrade? | Otherwise every upgrade is an incident |
| How long are events retained? | Otherwise "no data" and "aged out" are indistinguishable |

The last row is already measured as a real behaviour ([G3](G3-event-semantics.md)); the gap here is
that it is not **published as a contract**.

## Relationship to the specification

[`SPEC-001`](../specs/SPEC-001-public-read-contract.md) §3.4 proposes a concrete compatibility block
as a **template a publisher could fill in**. It is written as a proposal, not a demand.

## What is not claimed here

- Not claimed: that Pi has no internal versioning practice. Internal practice is not observable.
- Not claimed: that a public compatibility statement is required by any agreement.
- Not claimed: that the documentation is deficient in the areas it does cover.
