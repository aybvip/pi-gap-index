# G4 — The official proposal channel publishes no acceptance process

- **Layer:** process · **Claim:** measured · **Severity:** medium
- **Probe:** `node gaps.mjs --probe`
- **Affects:** proposers, community, developers

---

## Observation (measured)

```
repo:                    PiNetwork/PiRC
reachable:               HTTP 200
open_pull_requests:      94
closed_pull_requests:    23
merged_pull_requests:    0
readme_nonempty_lines:   2
main_last_push:          2026-04-17T02:22:25Z
default_branch:          main
```

Four facts, measured from the public repository:

1. The ReadMe is a **two-line index**. It contains no contribution guide, no acceptance criteria, and
   no review process.
2. The main branch content is a **small set of RFC documents** (PiRC1, PiRC2).
3. There are **94 open** and **23 closed** pull requests, and **0 merged**.
4. The main branch has not received a content update since **2026-04-17**.

## What this shows

- The channel **exists and accepts submissions**.
- The channel **publishes no rule** for what makes a submission acceptable.
- **Merge is not the observed outcome** for any submission in the repository's history.

## What this does *not* show

This is the important part, and it is stated plainly:

> It does **not** show intent, priority, capacity, or that any specific proposal will or will not be
> adopted. Those are not measurable from a repository, and this repo does not claim them.

A channel can be dormant for many reasons — resourcing, a shift to a different venue, an internal
process not visible on GitHub. **None of those are observable here, so none are asserted.**

## Why it is recorded anyway

Because it changes what a proposer should do. If the visible channel has no published acceptance
criteria, then **submission alone is not a strategy**. The measured response is:

1. Make the proposal **legible**: small, cited, runnable, one gap per proposal.
2. Make the work **useful without adoption**: a reference implementation and conformance tests that
   have value even if the proposal is never read.
3. **Do not predict the outcome** — measure, publish, and let the work stand.

This is the reason [`../docs/ADOPTION.md`](../docs/ADOPTION.md) exists, and why adoption is recorded
as **not-claimed**.

## Full detail

See [`../docs/CHANNEL.md`](../docs/CHANNEL.md).
