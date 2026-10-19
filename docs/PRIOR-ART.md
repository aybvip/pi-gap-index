# Prior art — an honest statement

> **Rule followed here:** "no prior work found" — **never** "we are first". Priority across an
> unbounded, partly-invisible space is not a claim this repository can support.

---

## 1. What was searched

| Area | What was looked at | Result |
|---|---|---|
| Public Pi proposal channel | `PiNetwork/PiRC` — content documents and open/closed pull requests | Two published RFC documents (PiRC1, PiRC2); no published compatibility contract for the Soroban RPC surface found |
| Official developer documentation | SDK, Platform API, concepts, troubleshooting | Authentication/payments/ads/notifications documented; no read-API versioning statement found |
| Public Soroban/Stellar practice | standard Soroban JSON-RPC semantics (caps, cursors, exclusivity) | The behaviours described in [G3](../gaps/G3-event-semantics.md) are standard **Soroban** behaviour, not Pi-specific |

## 2. What this means

**Two things, stated separately.**

1. **The gaps are partly inherited.** Silent `limit` capping, cursor semantics, and `endLedger`
   exclusivity come from the **Soroban/Stellar** lineage, not from a Pi design error. Recording them
   is not an accusation against Pi; it is a description of the surface a consumer meets.

2. **The specification text is likely not novel in every respect.** Projects in the Soroban ecosystem
   have written about pagination and truncation before. This repository **does not claim** to be the
   first to notice these behaviours, and **does not claim** priority over any prior discussion.

## 3. What *is* offered, without a priority claim

- A **Pi-specific** read contract (**[SPEC-001](../specs/SPEC-001-public-read-contract.md)**) written
  against **measured** Pi behaviour, with the exact commands that reproduce each row.
- A **measured** record of the Pi proposal channel's state ([`CHANNEL.md`](CHANNEL.md)), which was not
  found published elsewhere in this form.
- A **read-only reference client** ([`../ref/client.mjs`](../ref/client.mjs)) that embeds the rules so
  that a consumer cannot accidentally violate them.

None of this is claimed as a **first**. It is offered as **legible**.

## 4. How to challenge this page

If prior work exists that this page missed, **that is a measurement this repo got wrong**, and the
correct action is to update the page:

1. Add the prior work to §1's table with its URL and status.
2. Adjust §3 to remove any claim that overlaps with it.
3. Keep the rule: "no prior work found" is stated as *found*, not as *never existed*.

A project that updates its prior-art page when corrected is more trustworthy than one that claims
originality. This page is written to be correctable.

## 5. What is not claimed here

- Not claimed: that no prior work exists.
- Not claimed: that this repository was first to any observation.
- Not claimed: that the Soroban behaviours recorded in [G3](../gaps/G3-event-semantics.md) originate
  with Pi.
