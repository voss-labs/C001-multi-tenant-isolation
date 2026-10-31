# Submission

Build your solution in your own repository. Submit it by opening one issue here. Nothing you build is ever merged into this repository.

---

## 1. Create your repository

Make a new public repository under your own account and give it an open-source license. Any stack is fine. Do not fork this repository: a fork carries the challenge files and their history into your work, and you need neither.

With the [GitHub CLI](https://cli.github.com):

```bash
gh repo create c001-multi-tenant-isolation --public --clone --license mit
cd c001-multi-tenant-isolation
curl -fsSL -o SOLUTION.md https://raw.githubusercontent.com/voss-labs/C001-multi-tenant-isolation/main/SOLUTION_TEMPLATE.md
```

Your repository is then `https://github.com/YOUR-USERNAME/c001-multi-tenant-isolation`. Any other name works too.

Without the CLI, create the repository on github.com with a license selected, clone it, and copy [SOLUTION_TEMPLATE.md](../SOLUTION_TEMPLATE.md) into it as `SOLUTION.md`.

---

## 2. What your repository must contain

Reviewers check this list first. Anything missing at the frozen commit is scored as missing.

- [ ] A `README.md` stating the start command, the reset command, the test command, the prerequisites with versions, and where the API reference is.
- [ ] One command that starts everything from a clean clone (ENG-01).
- [ ] The standard fixture, loaded on start or with one more command, and a command that resets to it (ENG-02).
- [ ] One command that runs the isolation suite against the real database and exits non-zero on failure (ENG-03).
- [ ] A test for every scenario in the [test matrix](TEST_MATRIX.md), mapped by ID (ENG-04).
- [ ] A complete `SOLUTION.md` (ENG-05).
- [ ] An API reference (FR-12).
- [ ] An open-source license (ENG-06).

---

## 3. Push and tag

Reviews happen at one exact commit. Push it to your default branch first, so it can never become unreachable, then tag it:

```bash
git push origin HEAD
git tag c001-submission
git push origin c001-submission
git rev-parse HEAD
```

The last command prints the full 40-character SHA. You need it for the issue.

---

## 4. Check it the way a reviewer will

Clone the tag into an empty directory and run it from there:

```bash
dir="$(mktemp -d)"
git clone --branch c001-submission https://github.com/YOUR-USERNAME/c001-multi-tenant-isolation "$dir"
cd "$dir"
```

Run your start command and your test command exactly as your README states them, with nothing else installed or configured. If it only works in your own working copy, it does not work.

---

## 5. Open the submission issue

Open a **[Submission](https://github.com/voss-labs/C001-multi-tenant-isolation/issues/new?template=submission.yml)** issue in this repository and fill in every field. One issue per person. It is labelled `needs-review` automatically.

A maintainer checks that it starts and comments if it does not. Until submissions close, you can fix anything.

---

## 6. Updating before the deadline

You can submit early and keep working. To update your submission, commit and push to your default branch, then move the tag:

```bash
git push origin HEAD
git tag -f c001-submission
git push -f origin c001-submission
git rev-parse HEAD
```

Then edit your submission issue and replace the commit SHA. Only move the tag to a commit that is already pushed to a branch.

---

## 7. After the deadline

- **The Frozen comment is what counts.** By Monday 30 November, 12:00 IST, a maintainer comments `Frozen: <sha>` on your issue, using the SHA in your issue at close. That commit is reviewed and attacked. Edits to the issue after close are ignored.
- **If it does not start,** you have 48 hours from the Frozen comment to post a new SHA in a comment, with changes to build and setup files only ([EVALUATION.md](EVALUATION.md#how-a-review-runs)).
- **Keep the frozen commit reachable** until results are published. Push whatever you like on top of it, but do not rewrite history underneath it.
- **Watch your issue.** The review arrives there as a comment, and confirmed breaks from the break round are linked from it. You have 72 hours from each confirmation to dispute it.

---

## Labels

| Label | Meaning |
| --- | --- |
| `submission` | A solution submitted for review |
| `needs-review` | Waiting for a maintainer |
| `reviewed` | Review posted on the issue |
| `verified` | Meets every condition in [Verified](EVALUATION.md#verified) |
| `break-report` | A break reported during the break round |
| `confirmed` | A break that a maintainer reproduced |
| `duplicate` | The same root cause was already reported |
| `invalid` | Could not be reproduced, out of scope, or filed outside the break round |
| `question` | About the specification, rules or evaluation |
