# Verification — reproduce every claim yourself

Two kinds of check: **offline** (the specification's invariants) and **live** (the measured gaps).

---

## 0. Requirements

```bash
node --version   # expect v20 or newer
```

No dependencies. Nothing to install.

## 1. Offline — the specification's invariants

```bash
node test/run.mjs
```

This runs with **no network**. It asserts, among others:

- no forbidden operation (`submitTransaction`, `signTransaction`, …) exists in any code file;
- the reference client carries no key material and no signing path;
- the probe sends no credentials and time-boxes every request;
- `buildCallUrl` **refuses** to call a raw RFC 6570 template (the [G2](../gaps/G2-hal-templates.md)
  trap);
- truncation is **never** guessed: absent signals are treated as unsafe, not as "complete"
  ([G3](../gaps/G3-event-semantics.md));
- no document asserts a forbidden claim ("Pi is forced to…", "we are first", …);
- adoption is recorded as `not-claimed`, and an opened pull request is listed as a **non-signal**.

## 2. Inspect the registry (offline)

```bash
node gaps.mjs --list        # every measured gap, with its probe
node gaps.mjs --gap G3      # one gap in detail
node gaps.mjs --channel     # the measured channel state
node gaps.mjs --readiness   # the readiness ladder
node gaps.mjs --boundaries  # what this repo refuses to claim
```

## 3. Live — the read-only probes

```bash
node gaps.mjs --probe       # or: node probe.mjs
```

Expected shape of the output (values change with the network; the *comparisons* are the point):

| Probe | What to look for |
|---|---|
| G1 | Mainnet RPC **not reachable**; Testnet RPC **healthy** |
| G2+G6 | HAL link **contains braces**; naive call → **404**; histogram has **no** `invoke_host_function`; `/assets` → **0** |
| G3 | requested `limit: 1000` → **exactly 100** returned; retention **120,960** |
| G4 | open/closed/merged counts; ReadMe line count; last main push date |

## 4. What you should **not** find

- Any write, sign, or submit call.
- Any credential, key, token, or API key.
- Any personal data.
- Any prediction of adoption or priority.
- Any unlabelled claim: every statement is measured, documented, external, or not-claimed.

If any of these appear, this repository has violated its own rules — and
[`test/run.mjs`](../test/gap.test.mjs) should be failing.
