# The official proposal channel — measured state

> **This page reports facts about a public repository. It makes no claim about Pi's intent,
> priorities, or plans.** Intent is not measurable, so it is not asserted.

---

## 1. What was measured

From the public repository `PiNetwork/PiRC` (`https://github.com/PiNetwork/PiRC`), reproduced with
`node gaps.mjs --probe` (section `G4`):

| Figure | Value |
|---|---|
| Open pull requests | **94** |
| Closed pull requests | **23** |
| **Merged pull requests** | **0** |
| Non-empty lines in the ReadMe | **2** |
| Main-branch content documents | PiRC1, PiRC2 |
| Last content push to main | **2026-04-17** |

## 2. What this shows

1. **The channel exists and accepts submissions.** Pull requests can be opened; issues can be filed.
2. **There is no published acceptance process.** The ReadMe is a two-line index. It states no criteria,
   no review steps, and no definition of "ready".
3. **Merge is not the observed outcome** for any submission in the repository's history.
4. **The main branch is not receiving content updates** at the time of measurement.

## 3. What this does *not* show

Stated plainly, because the distinction is the whole point:

- It does **not** show *why*. Resourcing, a change of venue, an internal process that is not on
  GitHub, or a deliberate freeze are all consistent with these numbers. **None is observable, so none
  is claimed.**
- It does **not** show that any specific proposal will be rejected — or accepted.
- It does **not** show that the channel is "abandoned". That is an interpretation, not a measurement.
- It does **not** show anything about Pi's intent. Intent is not a measurable quantity.

## 4. Why this changes the strategy (not the goal)

If submission has no observable path to acceptance, then **submission is not a strategy on its own**.
The measurable response has three parts:

| Response | Why it is measurable |
|---|---|
| **Make each proposal legible** — one gap, cited, runnable, no adoption prediction | Legibility is observable: a reader can check every claim |
| **Make the work useful without adoption** — reference implementation + conformance tests | Utility is observable: someone else can run it today |
| **Publish the measurement** — including this page | Verifiability is observable: the numbers can be re-checked |

The goal is unchanged: contribute real specifications to the ecosystem. What changes is the **route**:
from *"submit and wait"* to *"measure, specify, implement, and let the work stand"*.

## 5. Re-checking this page

```bash
node gaps.mjs --probe         # includes the G4 channel measurement
node probe.mjs                # same probes, standalone
```

If any figure changes, **this page must be updated with the new measurement**. That is the same rule
every page in this repository follows.

## 6. The honest formulation

> The channel is **open** and **undocumented**. Recording that is not an accusation; it is the reason
> this repository puts its weight on *legibility and usefulness* rather than on *submission*.

See [`ADOPTION.md`](ADOPTION.md) for what is and is not claimed about adoption.
