# Submission

Your submission is one folder in this repository, `submissions/<your-username>/`, and it arrives as one pull request. Every push to that pull request is checked on a clean machine. At the deadline it is frozen and merged.

Use your GitHub username in lowercase for the folder: `submissions/priya-k/`, not `submissions/Priya-K/`.

---

## 1. Fork and create your folder

With the [GitHub CLI](https://cli.github.com):

```bash
gh repo fork voss-labs/C001-multi-tenant-isolation --clone
cd C001-multi-tenant-isolation
git switch -c submission
mkdir -p submissions/YOUR-USERNAME
cp SOLUTION_TEMPLATE.md submissions/YOUR-USERNAME/SOLUTION.md
```

Without the CLI, click **Fork** on this repository, clone your fork, and do the same from `git switch` onwards.

Work only inside your folder. A pull request that changes anything else fails the layout check. If you would rather build in a repository of your own, do that, and copy the folder in when you are ready.

---

## 2. What your folder must contain

```
submissions/your-username/
  Makefile        start, reset, test, stop
  README.md       how to choose the tenant, where the API reference is
  SOLUTION.md     your write-up, from SOLUTION_TEMPLATE.md
  compose.yaml    or however you lay out your containers
  ...             your code, tests, migrations, fixture
```

### The Makefile

The four targets are the contract every reviewer, every breaker and the CI use, so every submission starts the same way whatever its stack (ENG-02):

| Target | Must do |
| --- | --- |
| `start` | Build and start everything in the background, load the standard fixture, and return only once the API accepts requests on `http://localhost:8080`. |
| `reset` | Put the database back to exactly the standard fixture. |
| `test` | Run the isolation suite against the running system. Exit non-zero on any failure. |
| `stop` | Stop and remove everything, including volumes. |

One way to write it:

```make
.PHONY: start reset test stop

start:
	docker compose up --build --detach --wait

reset:
	docker compose exec -T api ./scripts/reset-fixture

test:
	docker compose run --rm tests

stop:
	docker compose down --volumes --remove-orphans
```

`--wait` returns once every service with a healthcheck is healthy, so give your API one. Put the test runner in its own service under a Compose profile, so that `start` does not run it. Start your `compose.yaml` with `name: c001-your-username`.

### Rules for the folder

- `make` and Docker with Compose v2 are the only tools allowed on the host. Your language toolchain, test runner and database all run in containers (ENG-01).
- Commit source, not artifacts: no file over 2 MB, no more than 10 MB in total, and no `node_modules`, virtual environments, build output, symlinks or submodules (ENG-07). Add a `.gitignore` to your folder.
- The CI runner is x86_64. If you build on Apple Silicon, use base images that publish both architectures.

---

## 3. Check it the way CI will

```bash
cd submissions/YOUR-USERNAME
make start && make test && make reset && make stop
```

The Isolation run check runs exactly this, in this order, on a fresh `ubuntu-latest` runner. If it only works in your working copy because of something installed on your machine, it does not work.

---

## 4. Open your pull request

Open it early. A draft is fine. The checks run from your first push, and you have until the deadline to make them pass.

```bash
git add submissions/YOUR-USERNAME
git commit -m "feat: add YOUR-USERNAME submission"
git push -u origin submission
gh pr create --repo voss-labs/C001-multi-tenant-isolation --head YOUR-USERNAME:submission --title "Submission: YOUR-USERNAME" --web
```

The pull request description opens with a template. Fill in every part of it. One pull request per person.

### The two checks

| Check | What it does |
| --- | --- |
| **Submission layout** | Confirms that the pull request changes only your folder, that the required files and Makefile targets exist, and that the size limits hold. It comments on your pull request with exactly what to fix. |
| **Isolation run** | On a fresh GitHub runner: `make start`, confirms something answers on port 8080, then `make test`, `make reset` and `make stop`. The full log is under the check's Details link. |

If a run shows "awaiting approval", a maintainer approves it. You do not need to do anything.

Your code runs on GitHub's disposable runners with a read-only token and no secrets. Nothing it does there can touch this repository.

---

## 5. Keep pushing until the deadline

Push to the same branch as often as you like. Every push reruns both checks.

---

## 6. The deadline

- **The freeze.** On Sunday 29 November at 23:59 IST, a maintainer runs the freeze. It comments `Frozen: <sha>` on every open submission pull request, recording its head at that moment. That commit is what gets reviewed and attacked.
- **Do not push after the freeze.** If your branch moves past the frozen commit, your pull request is not merged until you reset it: `git push -f origin <frozen-sha>:submission`.
- **The merge.** By Monday 30 November, 12:00 IST, every pull request whose frozen commit passes `make start` in the Isolation run check is squash-merged. Then `main` is tagged `c001-frozen`. A failed check is rerun once in case the runner itself failed. A frozen commit that still does not start is closed unmerged and scores 0: you had the check on every push for four weeks.
- **The review** arrives on your pull request, as a summary plus comments on specific lines.
- **The break round** starts, and confirmed breaks are linked from your pull request. You have 72 hours from each confirmation to dispute it in that thread.

When it is merged, your folder is published in this repository under its MIT license.

---

## Labels

| Label | Meaning |
| --- | --- |
| `submission` | A submission pull request, labelled automatically |
| `reviewed` | Review posted on the pull request |
| `verified` | Meets every condition in [Verified](EVALUATION.md#verified) |
| `break-report` | A break reported during the break round |
| `needs-review` | A break report waiting for a maintainer |
| `confirmed` | A break that a maintainer reproduced |
| `duplicate` | The same root cause was already reported |
| `invalid` | Could not be reproduced, out of scope, or filed outside the break round |
| `question` | About the specification, rules or evaluation |
