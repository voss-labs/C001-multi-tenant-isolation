# SOLUTION

C001: Multi-Tenant Data Isolation. Submission by YOUR-NAME ([@YOUR-USERNAME](https://github.com/YOUR-USERNAME)).

Copy this file into your repository as `SOLUTION.md`, replace every prompt in it, and keep the headings: reviewers read them in this order. Write for an engineer who has never seen your code. Short and precise beats long.

---

## 1. Summary

In three to five sentences: how your system keeps tenants apart, and the one decision that matters most.

## 2. Run it

| Step | Command |
| --- | --- |
| Start | |
| Load the fixture (if separate) | |
| Reset to the fixture | |
| Run the isolation suite | |

Prerequisites, with versions. Where the API reference lives. How to choose the active tenant on a request.

## 3. Stack

For each of language and framework, database, and authentication mechanism: what you chose, why, and one alternative you rejected and why.

## 4. Tenancy model

How tenant data is laid out in storage: shared tables with a tenant column, a schema per tenant, a database per tenant, or something else. Why this layout suits this problem. What it costs, in operations and in risk, at 10 tenants, 10,000 tenants and 1,000,000 tenants.

## 5. Tenant context

Trace one request from arrival to the database and back:

- Where the tenant comes from, and how it is verified against the caller's membership (ISO-01, ISO-02).
- How it is carried through your code.
- How it reaches the database, and how it is cleared afterwards (ISO-11).
- What happens when it is missing (ISO-10).

## 6. Enforcement layers

For each layer: what it enforces, where it lives in your code, how it can fail, and what still protects the data when it does (ISO-09). Link the test that proves your second layer holds on its own (ATK-26).

## 7. Authorization

How roles are checked and where. How a removal or a downgrade takes effect on the user's next request (ISO-07, ISO-08).

## 8. Threat model

- **Assets.** What an attacker wants.
- **Attackers.** At least these four: an outsider with no account; a user of another tenant; a user who belongs to both tenants; a lower-role member of the same tenant. What each can reach, and what stops them.
- **Trust boundaries.** Where untrusted input enters, and where you stop checking it.
- **Assumptions.** What you trust and why: the database, the network, the framework, your token library.
- **Out of scope.** What you deliberately do not defend against.

## 9. Test coverage

| Scenario | Test | Notes |
| --- | --- | --- |
| ATK-01 | | |
| ATK-02 | | |
| ATK-03 | | |
| ATK-04 | | |
| ATK-05 | | |
| ATK-06 | | |
| ATK-07 | | |
| ATK-08 | | |
| ATK-09 | | |
| ATK-10 | | |
| ATK-11 | | |
| ATK-12 | | |
| ATK-13 | | |
| ATK-14 | | |
| ATK-15 | | |
| ATK-16 | | |
| ATK-17 | | |
| ATK-18 | | |
| ATK-19 | | |
| ATK-20 | | |
| ATK-21 | | |
| ATK-22 | | |
| ATK-23 | | |
| ATK-24 | | |
| ATK-25 | | |
| ATK-26 | | |
| ATK-27 | | |
| ATK-28 | | |

Attacks you added beyond the matrix, each with what it checks and why you thought of it:

| Attack | Test | Why |
| --- | --- | --- |
| | | |

## 10. Known limitations

Where it could still break. For each weakness, name the operation or code path and the requirement it breaks, for example "`POST /tasks/bulk` skips the second layer; ISO-09". A weakness disclosed that specifically at your frozen commit is deducted at half its severity if anyone confirms it; a vague one earns nothing ([EVALUATION.md](https://github.com/voss-labs/C001-multi-tenant-isolation/blob/main/docs/EVALUATION.md#findings)). An empty section is a claim that nothing is wrong. Make sure you can defend it.

## 11. Before production

What you would change before real customers used this, in priority order.

## 12. AI use

Which tools you used, for what, and what you checked by hand. "None" is a valid answer.
