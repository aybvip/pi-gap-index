# G2 — Horizon HAL links are RFC 6570 URI templates

- **Layer:** rest · **Claim:** measured · **Severity:** medium
- **Probe:** `node gaps.mjs --probe`
- **Affects:** developers, SDK authors, indexers

---

## Observation (measured)

```
hal_operations_link:    https://api.mainnet.minepi.com/operations{?cursor,limit,order,include_failed}
hal_link_is_template:   true
naive_call_with_template: HTTP 404 (template left in URL)
stripped_call:            HTTP 200
```

Pi Mainnet Horizon returns HAL links containing **literal template expressions**. A client that
appends a query string to the link as-is produces a URL containing braces and receives **404**.

## Why this is worth recording

The failure mode is a **confusing 404**, not a validation error. A developer sees "not found" and
concludes the resource does not exist, when the actual cause is a three-character fix.

## What a consumer must do

1. Detect a template (`\{\}` present).
2. Strip the expression to obtain a callable base.
3. Append the query to the stripped base.

The reference implementation does exactly this and **refuses** to call a raw template:

```js
import { stripTemplate, isTemplate, buildCallUrl } from "./ref/client.mjs";

isTemplate(href);                 // true
stripTemplate(href);              // "https://api.mainnet.minepi.com/operations"
buildCallUrl(stripTemplate(href), { limit: 20 });   // works
buildCallUrl(href, { limit: 20 });                  // throws: refuses the trap
```

## Relationship to the specification

This is one of the seven deficits in
[`SPEC-001`](../specs/SPEC-001-public-read-contract.md) §2. It is included because a read contract
that specifies endpoints but not **how to call the links those endpoints return** is incomplete.

## What is not claimed here

- Not claimed: that templated HAL links are wrong. They are a valid, standards-based design
  ([RFC 6570](https://www.rfc-editor.org/rfc/rfc6570)); the gap is the **absence of guidance** that a
  consumer must expand them.
- Not claimed: that this bug affects any particular named project.
