# Zap-N-Hop — Project Rules for Claude

These rules apply to every response in this project. Follow them before the auto-commit fires.

---

## 1. Docs must be updated in the same response as any code change

When you add, change, or remove a feature:

1. Add a new numbered entry to `docs/10-feature-requests.md` (never renumber existing entries).
   - Include: what was asked, status, what was built, files changed, link to design note.
2. Add a matching entry to `docs/09-design-decisions.md` under the current session.
   - Include: what was built, why this approach, alternatives considered.
3. Do this in the **same response** — not a follow-up, not after the commit.

---

## 2. Commit rules

- Do not add a `Co-Authored-By:` trailer to commit messages.
- Git username: Philip Thangiah (Sodagaming67).

---

## 3. Code style

- No comments unless the WHY is non-obvious.
- No new files unless the feature genuinely requires one.
- No error handling for scenarios that can't happen.

---

## 4. Communication style

- User is a beginner — use plain language, avoid jargon.
- Keep responses short and direct.
- No trailing summaries of what was just done.
