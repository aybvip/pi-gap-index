# G3 — Event reads are silently truncated

- **Layer:** events · **Claim:** measured · **Severity:** high
- **Probe:** `node gaps.mjs --probe`
- **Affects:** developers, indexers, analytics

---

## Observation (measured)

```
latest_ledger:           27254630
ledger_retention_window: 120960
requested_limit:         1000
events_returned:         100
cap_observed:            YES — returned exactly the cap, not the requested limit
endLedger_semantics:     EXCLUSIVE
```

A request for `limit: 1000` returned **exactly 100 events**, with **no flag** saying the result was
reduced. A consumer reading 100 events and assuming it saw the window is wrong, and nothing in the
response says so.

## The three traps, separately

| # | Trap | Why it is dangerous |
|---|---|---|
| 1 | `limit` is capped silently | A client believes it asked for N and received M with no signal |
| 2 | `endLedger` is **exclusive** | Off-by-one in the window; the last ledger is never included unless the client adds 1 |
| 3 | Retention is bounded and not advertised in the result | "No events" and "events aged out" look identical |

## What a consumer must do

- **Never** infer completeness from `events.length == 100`.
- Treat absence of an explicit truncation signal as **unsafe**, not as "complete".
- Carry the retention window alongside the result.
- State the window in any output, so a reader can judge coverage.

The reference helper encodes this:

```js
isTruncated({}, 100);                    // true  — no signal is treated as unsafe
isTruncated({ effectiveLimit: 100 }, 1000);  // true  — server reduced the limit
isTruncated({ nextCursor: "abc" }, 1000);    // true  — continuation implies more
describePage(page);                      // reports what was actually applied; invents nothing
```

## Relationship to the specification

[`SPEC-001`](../specs/SPEC-001-public-read-contract.md) §3.3 makes explicit truncation a **normative
requirement**, precisely because this measurement shows it is currently absent.

## What is not claimed here

- Not claimed: that a cap of 100 is a mistake. A cap is a reasonable engineering choice; the gap is
  that it is **silent**.
- Not claimed: that any named consumer has mis-read a window. The point is that the response makes it
  *possible* to mis-read.
