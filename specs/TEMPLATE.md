# RFC template — a submission-ready shape

Use this shape when turning a gap into a proposal. It mirrors the structure of the two RFCs
published in the official channel, so a maintainer could read it without translation.

> **No submission is made by this repository.** Submitting is the owner's action. See
> [`../docs/ADOPTION.md`](../docs/ADOPTION.md).

---

```markdown
# PiRC-<n>: <Title>

## Metadata
- Status: Draft | Review | Final (this repo only ever publishes Draft)
- Author(s): <name>
- Created: <YYYY-MM-DD>
- Gap reference: <G-id from this repo>

## 1. Summary
One paragraph. What is specified, in one breath.

## 2. Motivation (measured)
Why this is needed. Cite a reproducible observation, not an opinion.
- Observation: <what was measured>
- Command: <how to reproduce it>
- Effect: <who is blocked and how>

## 3. Specification
Normative language (MUST / SHOULD / MAY). Interfaces, fields, formats.
Version this section.

## 4. Backwards compatibility
What existing consumers notice. Prefer "nothing changes" where true.

## 5. Security considerations
Failure modes, and what the spec does to make them visible rather than silent.

## 6. Reference implementation
A link to runnable code that implements the spec, read-only where possible.

## 7. Conformance tests
Predicates anyone can run. No dependency on this repository required.

## 8. Alternatives considered
What was rejected and why. Honest, not perfunctory.

## 9. Open questions
What is not settled. Stating uncertainty is a feature.

## 10. What this proposal does NOT claim
Adoption, priority, endorsement, or that it is inevitable.
```

---

## Authorship and claim rules

1. **One gap per proposal.** A proposal covering six deficits is six proposals.
2. **Every motivation row is measured or documented.** No row is "everyone knows".
3. **No adoption prediction.** Write what the spec does, not what will happen to it.
4. **No priority claim.** If you looked for prior work, say "no prior work found" — never "first".
5. **Reference implementation must run offline** where the subject permits it.

## A note on volume

The measured channel state ([`../docs/CHANNEL.md`](../docs/CHANNEL.md)) shows that the channel
receives far more submissions than it processes. The response is **not** to submit more; it is to
make each submission *legible*: small, cited, runnable, and honest about its limits.
