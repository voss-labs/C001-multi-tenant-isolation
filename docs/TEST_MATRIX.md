# Test matrix

Twenty-eight attacks your system must survive. Every one needs at least one automated test in your suite (ENG-04), and every one is what a reviewer will try against your submission by hand.

The scenarios use the [standard fixture](SPECIFICATION.md#6-standard-fixture). `eve` is the usual attacker: an admin in `vega` with no access to `orion`. `sam` is the hard case: a viewer in `orion` and an admin in `vega`.

---

## How to write these tests

- **Check the data, not only the status code.** After a denied write, read the record back as its owner and confirm nothing changed. After a denied read, confirm the response holds none of the target's data. A test that only asserts `404` can pass against a system that deleted the record anyway.
- **Use the real database.** ENG-03. Isolation enforced by your database cannot be tested against a mock of it.
- **Leave the fixture as you found it,** or run the suite against its own database (ENG-02). Reviewers attack the standard fixture after running your suite.
- **Name each test with its scenario ID**, for example `test_atk07_update_foreign_task`, or map the IDs in the coverage table of your SOLUTION.md.
- **Make each test fail when its defenses are removed.** Reviewers check this by switching off every layer that enforces a scenario and rerunning its test ([mutation checks](EVALUATION.md#score)). ATK-26 is the one test that must fail when only your second layer is off. ATK-25 is exempt.
- **Status codes are yours to choose.** Pick them, document them, use them consistently. Where a scenario says "the same response as a missing record", that means the same status code and the same body shape as a request for a well-formed ID that does not exist.

You will find attacks that are not on this list. Add tests for them and list them in your SOLUTION.md. That counts in your favour.

---

## A. Identity and tenant context

| ID | Attack | Must hold | Checks |
| --- | --- | --- | --- |
| ATK-01 | Call every operation on tenant data with no credential at all. | Rejected as unauthenticated. No tenant data in the response. | ISO-01 |
| ATK-02 | Present a broken credential: tampered signature, altered user or tenant claim, expired, issued for a user who has since been deleted (delete the user directly in the database if your API has no account deletion), and `alg: none` if you use JWTs. | Every variant is rejected. | ISO-01 |
| ATK-03 | `eve` asks to act in `orion` through your tenant selector, then through every other channel your framework reads (header, path, query, body, subdomain), one at a time. | Denied, or, where your design ignores that channel, the request runs entirely in `vega`. Never any `orion` data. | ISO-02 |
| ATK-04 | `eve` sends two tenant selectors in one request, one naming `vega` and one naming `orion` (for example `vega` in the path and `orion` in a header or body field). Then `sam` does the same, naming `vega`, where he is admin, in one selector and `orion`, where he is viewer, in the other, and attempts a task write and a role change. | Each request either runs entirely in one tenant the caller belongs to, with that tenant's role, or is rejected. It never checks permission in one tenant and acts in the other. `orion` is unchanged. | ISO-02, ISO-03 |
| ATK-05 | `sam`, acting in `vega`, requests an `orion` task by its ID. `sam` can see that task when acting in `orion`. Then `ada` reads the `orion` member list and `sam`'s member record. | The first is the same response as a missing record: belonging to both tenants never widens what one request can reach. Nothing `ada` reads reveals `sam`'s `vega` membership, role or tasks. | ISO-03, ISO-04 |

## B. Object access by ID

| ID | Attack | Must hold | Checks |
| --- | --- | --- | --- |
| ATK-06 | `eve` reads an `orion` project and an `orion` task by ID. | The same response as a missing record. | ISO-03, ISO-04 |
| ATK-07 | `eve` updates an `orion` task by ID. | The same response as a missing record. `ada` reads the task back unchanged. | ISO-03, ISO-04 |
| ATK-08 | `eve` deletes an `orion` project and an `orion` task by ID. | The same response as a missing record. Both still exist for `ada`. | ISO-03, ISO-04 |
| ATK-09 | `eve` creates a project, a task and a new membership in `vega`, each with a body that also names `orion` as the tenant, using every tenant field name your model accepts or might accept (`tenant_id`, `tenantId`, `org`, ...). Then she tries the same on update. | Everything created belongs to `vega`, or the request is rejected. `orion` gains nothing, and `eve` gains no `orion` membership. | ISO-05 |

## C. References between records

| ID | Attack | Must hold | Checks |
| --- | --- | --- | --- |
| ATK-10 | `eve` creates a task in `vega` whose project is an `orion` project. | Rejected, with the same response as a missing project. Nothing is created in either tenant. | ISO-04, ISO-06 |
| ATK-11 | `eve` updates a `vega` task to move it into an `orion` project. | Rejected, with the same response as a missing project. The task is still in its `vega` project. | ISO-04, ISO-06 |
| ATK-12 | `eve` assigns a `vega` task to `ada`, who is only in `orion`. | Rejected, and the response reveals nothing about `ada`'s memberships. Assigning the same task to `sam`, who is in `vega`, succeeds. | ISO-06 |
| ATK-13 | `ada` removes `sam` from `orion`. | `sam`'s `orion` tasks become unassigned. `sam`'s `vega` tasks and membership are untouched. | ISO-06 |

## D. Lists, search and derived data

| ID | Attack | Must hold | Checks |
| --- | --- | --- | --- |
| ATK-14 | `eve` lists projects and tasks with filters pointing at `orion`: an `orion` project ID, a tenant parameter, `ada` as assignee. | Only `vega` records, or the same response as the same filter with a well-formed ID that does not exist. Never an `orion` record. Any total, count or has-more field counts only `vega` records. | ISO-03, ISO-04 |
| ATK-15 | `eve` searches for `CANARY-ORION-7F3A`. `ada` searches for `CANARY-VEGA-91C2`. | Zero results for each. Each canary is still found by its own tenant. | ISO-03 |
| ATK-16 | `eve` pages through `vega` tasks and keeps a next-page cursor. `ada` replays that cursor in `orion`. If your cursors can be decoded, forge one that points at `orion` records. | Rejected, or only the caller's own tenant data. | ISO-03 |
| ATK-17 | `eve` requests the summary of an `orion` project. Then she requests the summary of a `vega` project. | The first is the same response as a missing project. The second counts only `vega` tasks, matching a manual count. | ISO-03, ISO-04 |
| ATK-18 | `eve` bulk-updates status with a list mixing `vega` and `orion` task IDs. | `orion` tasks are unchanged when `ada` reads them. The response does not reveal which `orion` IDs exist. Whether the `vega` part still applies or the whole request is rejected is your call; document it. | ISO-03, ISO-04 |

## E. Membership and roles

| ID | Attack | Must hold | Checks |
| --- | --- | --- | --- |
| ATK-19 | `val`, a viewer, creates, updates and deletes a project and a task in `orion`. | Forbidden. Nothing changes. | ISO-07 |
| ATK-20 | `max`, a member, adds a member, changes a role and removes a member in `orion`. | Forbidden. Memberships unchanged. | ISO-07 |
| ATK-21 | `eve`, admin of `vega`, adds herself to `orion`, changes `ada`'s role in `orion` and removes `ada` from `orion`. Then she changes `sam`'s role in `vega`, and finally removes `sam` from `vega`. | The `orion` attempts are denied and `orion` memberships are unchanged. The `vega` changes apply to `sam`'s `vega` membership only: his `orion` role and membership stay exactly as they were. | ISO-02, ISO-07 |
| ATK-22 | `max` and `val` each try to make themselves admin. `ada`, the only admin of `orion`, tries to remove herself and to downgrade herself. | Every attempt rejected. `orion` still has an admin. | ISO-07 |
| ATK-23 | `sam` signs in and keeps the credential. `ada` removes `sam` from `orion`. `sam` reuses the same credential against `orion`. | Denied on that very next request. `sam` still works normally in `vega`. | ISO-08 |
| ATK-24 | `max` signs in and keeps the credential. `ada` changes `max` to viewer. `max` tries a write with the same credential. | Forbidden on that very next request. | ISO-08 |

## F. Infrastructure and failure

| ID | Attack | Must hold | Checks |
| --- | --- | --- | --- |
| ATK-25 | Send at least 200 interleaved requests in parallel, alternating `ada` in `orion` and `eve` in `vega`, mixing reads, writes and lists. Use enough concurrency that requests share workers and pooled database connections. | Every response contains only the caller's tenant data. Every write lands in the caller's tenant. | ISO-11 |
| ATK-26 | In a test-only setup, bypass your application-level tenant scoping on one read path and one write path, then attempt cross-tenant access through them. | Your second layer still blocks both. The test fails if that second layer is removed. | ISO-09 |
| ATK-27 | Connect with exactly the database identity your application uses at runtime. For a database or schema per tenant, use the identity in use before a tenant is selected. Run a read and a write against tenant tables, schema-qualified where your layout allows, with no tenant context set. | Zero rows or an error. Nothing written. | ISO-10 |
| ATK-28 | Acting as `eve`, trigger every error path you have with `orion` identifiers: validation failure, not found, conflict, and an internal error if one can be provoked. | No `orion` data or identifiers in any response body or header, beyond what `eve` sent. | ISO-12 |
