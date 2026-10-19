# Readiness — what makes a specification reference-grade

A proposal is only as useful as it is **checkable**. This ladder makes the levels explicit, so a
reader can see how far any given gap has been taken.

---

## The ladder

| Level | Name | Needs | Checked by |
|---|---|---|---|
| 0 | **observation** | a reproducible probe that shows the gap | running the probe |
| 1 | **problem statement** | who is affected and what breaks | reading the gap page |
| 2 | **specification** | a concrete, versioned interface/format | reading the spec |
| 3 | **reference implementation** | runnable, dependency-free, read-only where possible | running it |
| 4 | **conformance tests** | offline predicates anyone can run | `node test/run.mjs` |
| 5 | **migration / compatibility** | what changes for existing consumers | reading the spec §compatibility |
| 6 | **submission package** | RFC-shaped text + a ready diff | [`../specs/TEMPLATE.md`](../specs/TEMPLATE.md) |

## Current state

| Gap | Level reached | Notes |
|---|---|---|
| [G1](../gaps/G1-mainnet-rpc.md) public Mainnet RPC | **6** | [`SPEC-001`](../specs/SPEC-001-public-read-contract.md) + [`ref/client.mjs`](../ref/client.mjs) + conformance |
| [G2](../gaps/G2-hal-templates.md) HAL templates | **3** | helpers in the reference client, tested |
| [G3](../gaps/G3-event-semantics.md) event truncation | **4** | normative rules in SPEC-001 §3.3 + conformance tests |
| [G4](../gaps/G4-channel-process.md) channel process | **1** | measured and documented; no spec is meaningful here |
| [G5](../gaps/G5-rpc-compatibility.md) compatibility contract | **6** | SPEC-001 §3.4 provides the template |
| [G6](../gaps/G6-mainnet-contracts.md) Mainnet contracts | **1** | measured; dependent on G1 |

> **Why level 6 does not mean "done".** Level 6 means *ready to be read*, not *accepted*. Acceptance
> is a maintainer decision and is recorded as `not-claimed` in [`ADOPTION.md`](ADOPTION.md).

## The rule for raising a level

A level may only be raised when the new artifact is **runnable by a stranger**:

- level 0→1: the probe exists and prints the number it claims;
- level 1→2: the spec uses MUST/SHOULD and versions itself;
- level 2→3: the implementation runs with no dependencies;
- level 3→4: the tests fail when the spec is violated;
- level 4→5: the compatibility section states what does *not* change;
- level 5→6: the template is filled, with no adoption prediction.

## What is *never* a level

- A pull request that was opened.
- A claim of priority.
- A prediction that the standard is inevitable.

Those are activity and rhetoric. The ladder measures **artifacts**.
