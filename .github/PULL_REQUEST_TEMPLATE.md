Submission: `submissions/YOUR-USERNAME/`

**Stack:** language, framework and database, with versions.

**Tenancy model:** shared tables with a tenant column, schema per tenant, database per tenant, or other.

**Second enforcement layer:** one line. What blocks a cross-tenant query when the application-level check is missing? (ISO-09)

**Summary:** three to five sentences on how your design keeps tenants apart.

**AI use:** which tools you used, and for what. "None" is a valid answer.

- [ ] This pull request changes only `submissions/YOUR-USERNAME/`.
- [ ] `make start`, `make test`, `make reset` and `make stop` work, and both checks pass.
- [ ] Every scenario in TEST_MATRIX.md has an automated test, mapped by ID in SOLUTION.md.
- [ ] My second enforcement layer is enforced below my application code, not by an ORM or repository filter.
- [ ] SOLUTION.md is complete, including Known limitations.
- [ ] This is my own work, and I can walk a reviewer through any part of it.
- [ ] My Makefile, build and tests do nothing beyond running this submission.
- [ ] I agree that my folder is published here under the MIT license, and that other participants will attack it during the break round.

Fixing the challenge itself rather than submitting? Replace all of this with what was wrong and what you changed.
