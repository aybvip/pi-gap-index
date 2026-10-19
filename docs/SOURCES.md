# Sources

Every claim in this repository is exactly one of: **measured**, **documented**, **external**, or
**not-claimed**. This page lists the sources behind each kind.

---

## Measured (reproduced by this repo, right now)

| Ref | Endpoint / system | Used for | Reproduce with |
|---|---|---|---|
| M1 | `https://api.mainnet.minepi.com` (Pi Mainnet Horizon REST) | G2 HAL templates, G6 operation histogram, issued assets | `node gaps.mjs --probe` |
| M2 | `https://rpc.testnet.minepi.com` (Pi Testnet Soroban JSON-RPC) | G3 event semantics, health, retention | `node gaps.mjs --probe` |
| M3 | `https://rpc.mainnet.minepi.com` (Pi Mainnet Soroban JSON-RPC) | G1 reachability | `node gaps.mjs --probe` |
| M4 | `https://api.github.com/repos/PiNetwork/PiRC` (public read API) | G4 channel state | `node gaps.mjs --probe` |

All four are **read-only** calls. No credentials are sent. Every call is time-boxed.

## Documented (quoted from official Pi sources)

| Ref | Source | Used for | Status |
|---|---|---|---|
| D1 | `docs.minepi.com` — developer documentation (SDK, Platform API, concepts) | G5: no read-API compatibility statement found | **Official** |
| D2 | `github.com/PiNetwork/PiRC` — PiRC1, PiRC2 | context for the channel and its scope | **Official** |

Where this repository says "not found", it means *"a search of the official developer documentation
did not find it"*, not *"it does not exist anywhere"*.

## External (unofficial — flagged)

| Ref | Source | Used for | Status |
|---|---|---|---|
| X1 | Public Soroban/Stellar protocol behaviour and community discussion | Context for G3: the recorded event semantics follow the Soroban lineage | **Unofficial** |
| X2 | Sibling repositories by the same author | Context for Pi Mainnet/Testnet behaviour already measured there | **Unofficial — independent** |

Nothing **external** is used to support a claim about Pi's intent, plans, or future behaviour.

## Sibling repositories (unofficial, independent)

| Repo | Used here for |
|---|---|
| `github.com/aybvip/pi-user-behavior` | Mainnet vs Testnet observability; the B1–B7 layer split |
| `github.com/aybvip/pi-soroban-events` | Event-window semantics (cap, cursor, exclusivity, retention) |
| `github.com/aybvip/pi-contract-upgrade-trail` | Contract-upgrade visibility |
| `github.com/aybvip/pi-fixed-supply` · `pi-fungibility` | Native-asset observations used as context |

## Not-claimed

The following are **never** asserted here, and no source is offered because none exists:

- Adoption, endorsement, or obligation on the part of Pi.
- Priority or novelty of any specification.
- Intent, priority, or capacity behind the channel's measured state.
- Any prediction about future availability of any endpoint.

See [`ADOPTION.md`](ADOPTION.md) and [`PRIOR-ART.md`](PRIOR-ART.md).

## Update rule

If any **measured** figure changes, the corresponding gap page, [`CHANNEL.md`](CHANNEL.md), and this
table must be updated **with the new measurement**. The claim kind of a row never changes by
convenience — only by new evidence.
