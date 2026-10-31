# C001: Multi-Tenant Data Isolation

VOSS Engineering Challenge 001. Build a backend where one organization can never see or touch another organization's data, then prove it by attacking it.

Any language. Any database. Your design.

---

## The problem

Most SaaS products run every customer on the same servers and the same database. One query missing its tenant filter, and customer A is reading customer B's data. This class of bug tops the [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/). It is easy to write and expensive to ship.

Design and build a multi-tenant SaaS prototype whose tenant boundaries hold under ordinary use and under deliberate attack. Then write the automated tests that try to break it.

---

## What you build

- **An HTTP API for a small project tracker:** organizations (tenants), members with roles, projects and tasks.
- **Users who belong to more than one organization,** so deciding which tenant a request is acting for is a real problem, not a lookup.
- **Isolation enforced in two independent layers,** one of which keeps working when your application code gets a query wrong.
- **A test suite that attacks your own system** through 28 scenarios, run with `make test` against a real database.
- **A written design:** your decisions, your threat model, and where it could still fail.

The full requirements are in [SPECIFICATION.md](docs/SPECIFICATION.md). The attacks are in [TEST_MATRIX.md](docs/TEST_MATRIX.md).

---

## Schedule

All times IST.

| Stage | Date |
| --- | --- |
| Challenge opens | Monday 2 November 2026 |
| Submissions close | Sunday 29 November 2026, 23:59 |
| Break round | Monday 30 November to Sunday 6 December 2026 |
| Results | By Sunday 13 December 2026 |

---

## How to take part

1. **Read** [SPECIFICATION.md](docs/SPECIFICATION.md) and [TEST_MATRIX.md](docs/TEST_MATRIX.md). Spend real time on these before you pick a stack.
2. **Fork this repository and create `submissions/<your-username>/`.** Everything you build lives in that folder. [SUBMISSION.md](docs/SUBMISSION.md) has the commands.
3. **Build it.** Any stack, in containers, behind four Makefile targets: `start`, `reset`, `test`, `stop`. If the spec is unclear, ask with the [Question](https://github.com/voss-labs/C001-multi-tenant-isolation/issues/new?template=question.yml) form.
4. **Write it up.** Copy [SOLUTION_TEMPLATE.md](SOLUTION_TEMPLATE.md) into your folder as `SOLUTION.md` and fill in every section.
5. **Open a pull request early.** Every push is checked on a clean GitHub runner: your folder layout, then `make start` and `make test`. Keep pushing until the deadline.
6. **Get frozen, merged and reviewed.** At the deadline your pull request is frozen and merged. A maintainer attacks it and posts the review on your pull request.
7. **Break things.** In the break round, run other submissions in a disposable sandbox, attack them, and file a [Break report](https://github.com/voss-labs/C001-multi-tenant-isolation/issues/new?template=break-report.yml) for each break you find.

---

## How it is judged

| Area | Points |
| --- | --- |
| Isolation (confirmed findings deduct) | 40 |
| Tests | 20 |
| Architecture | 20 |
| Write-up | 10 |
| Engineering | 10 |

There are two rankings: builders, by score, and breakers, by confirmed breaks found in other people's submissions. Every submission that passes all 28 scenarios with no confirmed Critical or High finding is listed as Verified, whatever its rank.

A weakness you find and document specifically yourself costs half as much as one someone else finds. The details are in [EVALUATION.md](docs/EVALUATION.md).

---

## Rules

- **Individual entries. Open to anyone.**
- **Any language, framework and database,** as long as it runs in containers with free tools, and the database, or a process in front of it, can enforce isolation on its own ([ISO-09](docs/SPECIFICATION.md#4-isolation-requirements)).
- **Your folder is merged into this repository** under its MIT license.
- **AI tools are allowed.** Say which ones you used. You must be able to explain every line you submit, and a maintainer may ask you to.
- **Run other people's code in a sandbox:** a disposable virtual machine holding none of your credentials. Never run it on the machine with your SSH keys and tokens.
- **Attack only a frozen commit running in your own sandbox.** Never anything deployed, by anyone.

---

## The docs

| Doc | Read it when |
| --- | --- |
| [SPECIFICATION.md](docs/SPECIFICATION.md) | Before anything else. The requirements and the standard fixture. |
| [TEST_MATRIX.md](docs/TEST_MATRIX.md) | Before you design. These are the attacks you must survive. |
| [EVALUATION.md](docs/EVALUATION.md) | You want to know how points, findings and the break round work. |
| [SUBMISSION.md](docs/SUBMISSION.md) | You are setting up your folder, or opening your pull request. |
| [SOLUTION_TEMPLATE.md](SOLUTION_TEMPLATE.md) | You are writing up your design. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | You found a mistake in the challenge itself. |

---

## Questions

Ask in a [Question](https://github.com/voss-labs/C001-multi-tenant-isolation/issues/new?template=question.yml) issue so that the next person finds the answer. Any answer that changes the rules is added to the specification, so the spec is always the full truth.

---

MIT licensed. Part of [VOSS Labs](https://vosslabs.org) at Vidyalankar Institute of Technology, Mumbai.
