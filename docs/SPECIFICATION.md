# Specification

C001: Multi-Tenant Data Isolation. Version 1.0.

Every requirement has an ID. Your SOLUTION.md, your tests and every review refer to these IDs, so use them.

---

## 1. The problem

Design and build a multi-tenant SaaS prototype. Several organizations share one backend and one persistence layer, and each keeps its own users, resources and data.

The goal is end-to-end isolation: no tenant can read, change or learn about another tenant's data, whether the request is ordinary or deliberately hostile. You prove this with automated tests that attack your own system.

The stack is up to you. So is the architecture. The requirements below say what must be true, not how to make it true.

---

## 2. The domain

The application is a small project tracker. It is deliberately boring, so that all your effort goes into isolation.

| Entity | What it is |
| --- | --- |
| Tenant | An organization. Has a name and a slug. |
| User | A person who can sign in. Users exist on the platform, not inside a tenant. |
| Membership | Links one user to one tenant with exactly one role. A user can hold memberships in any number of tenants. |
| Project | Belongs to exactly one tenant. Has a name and a description. |
| Task | Belongs to exactly one project, and so to that project's tenant. Has a title, a description, a status (`todo`, `in_progress`, `done`) and an optional assignee. |

Because one user can belong to several tenants, "which tenant is this request acting for?" cannot be answered by looking at the user alone. Getting that answer right, every time, is the heart of this challenge.

### Roles

Roles apply per membership. Being an admin in one tenant gives no power in any other.

| Action | `viewer` | `member` | `admin` |
| --- | --- | --- | --- |
| Read projects, tasks and the member list | yes | yes | yes |
| Create, update and delete projects and tasks | no | yes | yes |
| Add members, change roles, remove members | no | no | yes |

---

## 3. Functional requirements

| ID | Requirement |
| --- | --- |
| FR-01 | A person can register an account and sign in. Any authentication mechanism is fine. |
| FR-02 | A signed-in user can create a tenant and becomes its first admin. |
| FR-03 | A signed-in user can list the tenants they belong to, with their role in each. |
| FR-04 | Each request acts for one tenant. How the caller chooses it (subdomain, path, header, a token per tenant, or something else) is your design decision. |
| FR-05 | Admins can add an existing user to their tenant by email with a role, change a member's role, and remove a member. A tenant always keeps at least one admin. Removing a member unassigns their tasks in that tenant. Changing a role does not change task assignments. |
| FR-06 | Members and admins can create, read, update and delete projects. |
| FR-07 | Members and admins can create, read, update and delete tasks inside a project, change a task's status, move a task to another project, and assign it to any user who holds a membership in the tenant, whatever their role. |
| FR-08 | Projects and tasks can be listed with pagination. Tasks can be filtered by project, status and assignee. |
| FR-09 | Tasks can be searched by text across title and description. |
| FR-10 | The status of many tasks can be set in one request (bulk update by a list of task IDs). |
| FR-11 | A project summary returns the number of its tasks in each status. |
| FR-12 | The API is documented: OpenAPI, or a markdown reference listing every operation, how to authenticate and how to choose the tenant. |

The interface is an HTTP API in any style: REST, GraphQL, RPC. A UI is allowed but not scored.

---

## 4. Isolation requirements

These are what the challenge is judged on. Active tenant means the tenant the current request is acting for.

| ID | Requirement |
| --- | --- |
| ISO-01 | **Authenticated identity.** Every operation on tenant data requires authentication. The server works out who the caller is from a credential it can verify, such as a session it issued or a token whose signature it checks. It never trusts a user identifier sent by the client. |
| ISO-02 | **Verified tenant context.** The server resolves the active tenant and accepts it only if the authenticated user currently holds a membership in it. A tenant identifier from the client, wherever it arrives (path, header, subdomain, query, body, token claim), is a request, not a fact, until that check passes. |
| ISO-03 | **Scoped access.** Every read and write of tenant-owned data is limited to the active tenant. That includes lookups by ID, lists, filters, search, pagination, bulk operations, aggregates and reference checks. |
| ISO-04 | **No existence leaks.** A request for another tenant's record is indistinguishable from a request for a record that does not exist: same status code, same body shape, and none of the other record's identifiers or contents. This covers every tenant-owned record, and a user's memberships, roles and tasks in other tenants. It does not cover platform-level facts: whether a tenant slug is taken, whether an email is registered, or whether a user exists. A request to act in a tenant you do not belong to may answer forbidden or not found. Timing side channels are out of scope. |
| ISO-05 | **Server-owned tenancy.** The server sets which tenant owns a record from the active context when the record is created, and that never changes afterwards. Tenant fields supplied by the client are ignored or rejected. |
| ISO-06 | **References stay inside the tenant.** Every reference a write creates or changes, such as a task's project or a task's assignee, must resolve inside the active tenant. An assignee must hold a current membership in it, in any role. |
| ISO-07 | **Role enforcement.** Every operation checks the caller's role in the active tenant against the table in section 2. |
| ISO-08 | **Fresh authorization.** Membership and role changes take effect on the affected user's next request. A credential issued before a user was removed or downgraded must not keep the old access. |
| ISO-09 | **Two independent layers.** Isolation is enforced in at least two layers that fail independently. The second is enforced below your application code, by the data store itself or by a separate process with its own credentials, so that a query your application issues without tenant scoping, through any code path including raw SQL, is still limited to the active tenant. An ORM or repository-level filter is a first layer, not a second. Which mechanism you use, and why, is part of the challenge. |
| ISO-10 | **Fail closed.** If the tenant context is missing, empty or invalid at any layer, the operation returns no tenant data and changes nothing. A query run without context must never fall back to all tenants. |
| ISO-11 | **No context bleed.** Tenant context held anywhere outside the request itself (thread-locals, async context, connection or session variables, caches, pooled connections) never carries over to another request, including under concurrent load. |
| ISO-12 | **Clean errors.** Error responses never contain another tenant's data or identifiers beyond what the caller sent. |

---

## 5. Engineering requirements

| ID | Requirement |
| --- | --- |
| ENG-01 | Your submission lives entirely in `submissions/<username>/` in this repository, your GitHub username in lowercase, and arrives as one pull request. On the host it needs only `make` and Docker with Compose v2; everything else, including the test runner, runs in containers. No paid services, cloud accounts or API keys. |
| ENG-02 | Your folder's Makefile has four targets. `start` builds and starts everything in the background, loads the standard fixture (section 6), and returns only once the API accepts requests on `http://localhost:8080`. `reset` puts the database back to exactly the standard fixture. `test` runs the isolation suite against the running system. `stop` stops and removes everything, including volumes. Name your Compose project `c001-<username>`. |
| ENG-03 | The isolation suite runs against a real instance of the database you ship, not a mock or an in-memory stand-in for a different engine. `make test` exits non-zero on any failure. |
| ENG-04 | Every scenario in [TEST_MATRIX.md](TEST_MATRIX.md) has at least one automated test, mapped by ID in your SOLUTION.md. |
| ENG-05 | Your folder has a complete SOLUTION.md, built from [SOLUTION_TEMPLATE.md](../SOLUTION_TEMPLATE.md), and a README.md saying how to choose the active tenant on a request and where the API reference is. |
| ENG-06 | The reference machine is the GitHub Actions `ubuntu-latest` runner. Your submission counts as starting only if the Isolation run check on your pull request passes `make start` there. |
| ENG-07 | The folder holds source, not artifacts: no file over 2 MB, no more than 10 MB in total, no dependency folders, build output, symlinks or submodules. |

---

## 6. Standard fixture

Every submission loads the same fixture, so reviewers and break-round participants can attack any submission without learning a new dataset first. Your tests may create more data, but the isolation suite must leave the fixture as it found it, or run against a separate database.

### Tenants

`orion` and `vega`.

### Users

Every fixture user has the password `c001-fixture-password`. This is test data. Never deploy it.

| Email | Role in `orion` | Role in `vega` |
| --- | --- | --- |
| `ada@orion.test` | admin | none |
| `max@orion.test` | member | none |
| `val@orion.test` | viewer | none |
| `eve@vega.test` | none | admin |
| `sam@shared.test` | viewer | admin |

`sam` belongs to both tenants, with a different role in each, on purpose. Most real cross-tenant bugs involve a user who is legitimately inside both, and a role checked in one tenant but applied in the other.

### Data

- Each tenant has at least two projects, and each project has at least three tasks.
- In each tenant, at least one task is assigned to `sam`.
- `orion` has one task whose title and description both contain `CANARY-ORION-7F3A`.
- `vega` has one task whose title and description both contain `CANARY-VEGA-91C2`.

The canary strings appear nowhere else. A canary turning up in any response to the other tenant, whether an error, a search result, a list or an export, is a break, unless the caller sent it in that same request or wrote it into their own tenant's data.

---

## 7. Non-goals

None of these are needed or scored:

- A user interface.
- Deployment to a cloud provider.
- Billing, email delivery, email invitations, SSO, password reset.
- Physical isolation, such as dedicated hosts per tenant. Database per tenant is allowed.
- A platform-operator or super-admin role. If you build one, see EXT-04.
- Timing side channels.
- An attacker who already holds your database credentials or shell access to the host. ATK-27 uses the runtime database identity to check that your design fails closed, not to model that attacker.

---

## 8. Extensions

Optional. They earn credit under Architecture in [EVALUATION.md](EVALUATION.md), and only if they come with tests.

| ID | Extension |
| --- | --- |
| EXT-01 | **Background work.** A job that runs outside the request, such as exporting a project as JSON, and still carries and enforces tenant context. |
| EXT-02 | **Caching.** A cache in front of reads whose entries can never be served to another tenant. |
| EXT-03 | **Audit log.** Denied cross-tenant attempts are recorded per tenant and readable by that tenant's admins. |
| EXT-04 | **Operator access.** A platform operator can reach a tenant's data only with a time-limited, audited grant that the tenant's admin approves. |
| EXT-05 | **Noisy neighbours.** Per-tenant rate limits, so one tenant cannot degrade service for another. |

---

## 9. Reading

Start here. None of these is the answer; each one describes failure modes you will meet.

- [OWASP Multi-Tenant Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html)
- [OWASP API Security Top 10, API1:2023 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)
- [AWS whitepaper: SaaS Tenant Isolation Strategies](https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/saas-tenant-isolation-strategies.html)
- [PostgreSQL: Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), one mechanism among several

---

## Revisions

Answers to questions that change or clarify a requirement are added here, with the date and the issue that raised them. A change never makes a requirement harder after submissions open.

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-11-02 | First release. |
