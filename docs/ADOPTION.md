# Adoption — what is and is not claimed

> **Claim kind: `not-claimed`.** This repository does **not** assert that Pi, or anyone else, will
> adopt anything in it. This page explains why, and what *would* count as evidence if it happened.

---

## 1. The honest position

**Adoption is a decision by the maintainer of a system.** It cannot be compelled, predicted, or
inferred from activity such as opening a pull request. A specification that claims otherwise is
making a claim it cannot support.

So this repository makes **no adoption claim at all**. It publishes:

- **measured gaps** — reproducible observations,
- **reference specifications** — implementable contracts,
- **conformance tests** — predicates anyone can run.

The value of those three things **does not depend on adoption**. They are useful to any developer
facing the same gaps, today.

## 2. Arguments that are deliberately *not* used

| Argument | Why it is rejected here |
|---|---|
| "Pi is forced/obliged to adopt this" | Not measurable. No mechanism is cited because none is observable. |
| "We are first" | Priority is not checkable across an unbounded space. See [`PRIOR-ART.md`](PRIOR-ART.md). |
| "The community wants this" | Sentiment is not a measurement; it is also not the maintainer's decision. |
| "It will be adopted eventually" | A prediction, not a result. |
| "Competing chains already have it" | Possibly relevant to a maintainer, but not a fact this repo has verified in every case; where it is cited, it is labelled **external/unofficial**. |

Each of these may be *true of the world*. None of them is a **measurement this repo can stand behind**,
so none is asserted.

## 3. What *would* be observable evidence of adoption

If adoption ever happens, it will look like one of these — each checkable by someone who is not us:

| Signal | How it is checked |
|---|---|
| A published compatibility statement matching [`SPEC-001`](../specs/SPEC-001-public-read-contract.md) §3.4 | read the maintainer's documentation |
| A response field such as `truncated` / `nextCursor` appearing in a live endpoint | run the probe, read the response |
| Independent projects passing the conformance predicates | run `node test/run.mjs` against their implementation |
| The specification text appearing in the maintainer's own channel | read the channel |

## 4. What are **not** signals

| Non-signal | Why it does not count |
|---|---|
| A pull request being opened | Opening is not accepting; see [`CHANNEL.md`](CHANNEL.md) |
| A star count | Popularity is not a decision |
| A social-media endorsement | Not a maintainer decision |
| A claim that a standard is "inevitable" | Rhetoric, not evidence |

## 5. What this repository *does* claim

Only this: **the gaps are real** (measured), **the specifications are implementable** (a reference
implementation and tests exist), and **the work is useful without permission** (anyone can use it).

If Pi adopts some of it, that will be recorded here **with the measurement that shows it**. If Pi
adopts none of it, **this repository is still correct**, because it never claimed otherwise.

## 6. How to act on this repository

1. Read a gap page; run its probe; check the number yourself.
2. If the gap affects you, use the reference implementation and its tests.
3. If you maintain a system with the same gap, adopt the specification **in your own system** — that
   is a real, checkable adoption, and it needs no one's permission.
4. If you want to propose it upstream, use [`../specs/TEMPLATE.md`](../specs/TEMPLATE.md) and submit it
   **yourself**. This repository will not do it on your behalf.
