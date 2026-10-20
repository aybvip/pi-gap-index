# Documentation index — pi-gap-index

Measured gaps in the public Pi surface, with reference specifications and the honest limits of what
they claim. Read-only probes; no writes, no keys, no submission.

## Start here

| Document | What it answers |
|---|---|
| [`../README.md`](../README.md) | What this is, what it refuses to claim, quick start |
| [`CHANNEL.md`](CHANNEL.md) | The measured state of the official proposal channel |
| [`ADOPTION.md`](ADOPTION.md) | What is and is not claimed about adoption (answer: nothing is claimed) |
| [`PRIOR-ART.md`](PRIOR-ART.md) | The honest prior-art statement ("no prior work found", never "first") |
| [`READINESS.md`](READINESS.md) | What makes a specification reference-grade |
| [`SOURCES.md`](SOURCES.md) | Every source, by claim kind |
| [`VERIFICATION.md`](VERIFICATION.md) | Reproduce every claim yourself |
| [`EXTERNAL-CLAIM-REVIEW.md`](EXTERNAL-CLAIM-REVIEW.md) | A public Pi economic model, checked claim by claim |

## The gaps

| Gap | Title | Layer | Claim |
|---|---|---|---|
| [G1](../gaps/G1-mainnet-rpc.md) | No public Mainnet Soroban JSON-RPC endpoint | rpc | measured |
| [G2](../gaps/G2-hal-templates.md) | Horizon HAL links are RFC 6570 templates | rest | measured |
| [G3](../gaps/G3-event-semantics.md) | Event reads silently truncated | events | measured |
| [G4](../gaps/G4-channel-process.md) | No published acceptance process | process | measured |
| [G5](../gaps/G5-rpc-compatibility.md) | No compatibility contract for the RPC surface | rpc | documented |
| [G6](../gaps/G6-mainnet-contracts.md) | Mainnet contracts announced, not observable | rpc | measured |

## The specifications

| Spec | Covers | Readiness |
|---|---|---|
| [SPEC-001](../specs/SPEC-001-public-read-contract.md) | Public read compatibility contract (G1, G2, G3, G5, G6) | 6 |
| [TEMPLATE](../specs/TEMPLATE.md) | RFC-shaped submission template | — |

## Commands

| Command | Does |
|---|---|
| `node gaps.mjs --list` | the measured gap registry |
| `node gaps.mjs --gap G1` | one gap in detail |
| `node gaps.mjs --channel` | measured channel state |
| `node gaps.mjs --readiness` | readiness ladder |
| `node gaps.mjs --boundaries` | what this repo refuses to claim |
| `node gaps.mjs --probe` | run the read-only probes (network reads) |
| `node test/run.mjs` | offline invariant suite |

## At a glance

| Concept | Value |
|---|---|
| Claim kinds | measured · documented · external · not-claimed |
| Adoption claim | **not-claimed** |
| Priority claim | none ("no prior work found") |
| Network writes | none — read-only probes |
| Reference implementation | [`../ref/client.mjs`](../ref/client.mjs) |

## Related repositories

- [`pi-user-behavior`](https://github.com/aybvip/pi-user-behavior) — what the chain does and does not show
- [`pi-soroban-events`](https://github.com/aybvip/pi-soroban-events) — event-window semantics
- [`pi-contract-upgrade-trail`](https://github.com/aybvip/pi-contract-upgrade-trail) — contract-upgrade visibility
- [`pi-contribution-evidence-model`](https://github.com/aybvip/pi-contribution-evidence-model) — a contribution evidence *model*
