# Evaluation

Your submission is judged by attacking it. A maintainer reviews every submission against the [test matrix](TEST_MATRIX.md) and probes beyond it. Then, in the break round, the other participants attack it too.

---

## Score

100 points in five areas.

| Area | Points | What earns them |
| --- | --- | --- |
| Isolation | 40 | Starts at 40. Confirmed findings deduct from it, with a floor of 0. A single root cause that breaks isolation on every tenant-scoped operation sets it to 0. |
| Tests | 20 | 0.5 for each of the 28 scenarios with a passing test (14 points). Up to 6 more for the suite overall: assertions on data rather than status codes, deterministic runs, attacks you added beyond the matrix. |
| Architecture | 20 | How sound the tenancy model, context propagation and enforcement layers are, and how well the trade-offs are argued. Tested extensions count here. |
| Write-up | 10 | SOLUTION.md: a threat model that names real attackers, explicit assumptions, failure modes stated honestly. |
| Engineering | 10 | It starts first time from a clean clone, the code is clear, the structure fits the problem. Each functional requirement (FR-01 to FR-12) that is missing or broken costs 2 points here. |

**Building less does not make you safer.** A scenario whose feature is missing or broken scores 0 under Tests and counts as failing for Verified.

**Mutation checks.** For every submission, the reviewer checks ATK-26 plus the same three further scenarios, chosen after submissions close. For each one they switch off every layer that enforces it and rerun its test. A test that still passes earns nothing. ATK-26 must fail when only the second layer is off. ATK-25 is never mutation-checked, because a race only fails some of the time.

**A submission that does not start** after the setup fix window scores 0 in every area and is not a target in the break round.

---

## Findings

A finding is anything that breaks an isolation requirement, confirmed by a maintainer who reproduced it. Several symptoms with one root cause count as one finding, at the highest severity among them.

| Severity | Meaning | Deduction |
| --- | --- | --- |
| Critical | Read or changed another tenant's data: a record's contents, a membership, a canary. | 20 |
| High | Learned something about another tenant without reading its data (whether a record exists, a count, an ID). Escalated a role inside a tenant. Kept access after removal or downgrade, whatever that access was used for. | 10 |
| Medium | A missing second layer or missing fail-closed behaviour on some path, or an internal detail leaked through an error, with no cross-tenant impact demonstrated. | 4 |
| Low | A hardening gap with no demonstrated impact, including identifiers that reveal platform-wide counts. | 1 |

**Disclose it yourself and it costs half.** A finding that matches a disclosure in the Known limitations section of your SOLUTION.md at the frozen commit is deducted at half its severity. A disclosure counts only if it names the operation or code path and the requirement it breaks, specifically enough that the finding could be written from it. For example: "`POST /tasks/bulk` skips the second layer; ISO-09". A general statement that something might leak earns nothing. The maintainer decides whether a finding matches.

---

## Verified

Every submission that meets all of these is listed as Verified in the results, whatever its rank:

- All 28 scenarios have tests that pass.
- Its second layer is enforced below the application (ISO-09), and the ATK-26 test proves it.
- No confirmed Critical or High finding, disclosed or not.
- The frozen commit started from a clean clone, or started after a setup fix.

---

## How a review runs

1. **Setup checks while submissions are open.** As submissions arrive, a maintainer checks that each one starts from a clean clone and comments if it does not. Until submissions close, you can fix anything.
2. **Freeze.** By Monday 30 November, 12:00 IST, a maintainer comments `Frozen: <sha>` on every submission issue. That comment decides what is reviewed and attacked; the issue body does not, and edits to the issue after close are ignored. Anything missing at the frozen commit is scored as missing.
3. **Setup fix window.** If the frozen commit does not start, you have 48 hours from the Frozen comment to post a new SHA in a comment. The maintainer diffs it against the frozen commit, accepts changes to build and setup files only, and updates the Frozen comment. If it still does not start, the submission scores 0.
4. **Run.** The reviewer clones the frozen commit, follows your README, runs your isolation suite, records the result, and resets the fixture.
5. **Attack.** They work through the test matrix against your API, then probe beyond it.
6. **Read.** They read your SOLUTION.md and code, and run the mutation checks.
7. **Report.** They post the review as a comment on your submission issue, with a score for each area and every finding with its severity and steps to reproduce, then label the issue `reviewed`.

**Disputes.** You have 72 hours from the moment a finding is confirmed, by review or in the break round, to dispute it in the same thread. Every finding is confirmed by Wednesday 9 December. After that, the maintainer's decision is final.

**Walkthroughs.** A maintainer may ask any participant for a short call to walk through their code. If you cannot explain how your own isolation works, your submission may be removed.

---

## Break round

From Monday 30 November, 12:00 IST, to Sunday 6 December, 23:59 IST, participants attack each other's frozen commits. Reports filed outside this window are closed as `invalid`.

### Rules of engagement

- **Run other people's code in a sandbox.** Start every submission you did not write inside a disposable virtual machine that holds none of your credentials: no SSH keys, no GitHub or cloud tokens, no browser profile, no shared home directory. Read the start command, Dockerfiles and compose file before you run anything, and never run it with sudo. Delete the machine afterwards. This applies to maintainers too.
- **Target only the frozen commit, running inside that sandbox.** Never attack anything deployed, by anyone, anywhere, even if a participant has published a link to it. Doing so ends your participation.
- **Code is frozen.** Defenders can reply to a report but cannot fix it for scoring.

### What a break may use

- HTTP requests to the running submission, as any fixture user or any user you register.
- For ISO-09 and ISO-10 findings only, which are Medium at most: a patch that removes application-level scoping from one code path, as in ATK-26 and included in your report; and a direct database connection using the identity the application uses at runtime, with no tenant context set, as in ATK-27.

Setting tenant context yourself, using a database owner or superuser identity, or editing the second layer is out of scope (SPECIFICATION.md, section 7).

### Reporting and credit

- **Use the [Break report](https://github.com/voss-labs/C001-multi-tenant-isolation/issues/new?template=break-report.yml) form**, with steps a maintainer can reproduce against the standard fixture from your report alone.
- **A report is judged as filed.** If you need to correct the steps, post the correction as a comment. The report then dates from that comment.
- **The first valid report of a root cause gets the credit.** Later reports of the same root cause are closed as `duplicate`. If a later report shows a higher severity for the same root cause, its reporter earns the difference.
- **No credit for what is already known.** A root cause already in a review posted before your report earns nothing. One already disclosed in the defender's Known limitations earns half.
- **Reports on your own submission earn nothing.** Put those in your Known limitations instead.

### Breaker points

Only participants whose own submission started earn breaker points.

| Severity | Breaker points |
| --- | --- |
| Critical | 10 |
| High | 5 |
| Medium | 2 |
| Low | 0 |

- At most 20 breaker points come from any one target.
- After three reports closed as `invalid`, a breaker earns no further points.
- Coordinating a break with a defender, or reporting from a second account, disqualifies everyone involved.

Confirmed breaks are also deducted from the defender's Isolation score under the severity table above.

---

## Results

Results are published in the README of this repository by Sunday 13 December 2026:

- **Builders.** Ranked by score. Ties go to fewer findings, then to the higher Isolation score; after that, the rank is shared.
- **Breakers.** Ranked by breaker points. Ties go to more Critical breaks; after that, the rank is shared.
- **Verified.** Every submission that qualifies, in no particular order.

Once results are out, fix what was found. That is not scored, but it is the part you will remember.

---

## Disqualification

- Submitting another participant's work, or a solution copied from anywhere else. Using libraries and reading other people's code is fine.
- A start command, build step, dependency or test designed to do anything beyond running your submission, such as reading files outside the repository or sending data anywhere other than package registries.
- Attacking anything other than a frozen commit running in your own sandbox.
- Coordinating breaks with another participant, or taking part from more than one account.
- Making the frozen commit unreachable, for example by force-pushing over it, before results are published.
- Being unable to explain your own isolation design when asked.
