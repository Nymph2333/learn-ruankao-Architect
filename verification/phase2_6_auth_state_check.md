# Phase 2.6 Auth State Check

## Purpose

Phase 2.6 adds support for normal, user-controlled login state capture for the Ruankao Daren crawler.

The goal is to let a user manually log in through a local Playwright browser, save Playwright `storageState`, and allow later crawler runs to use that state when producing raw snapshots.

This phase does not implement a parser, Markdown renderer, or generated knowledge documents.

## Normal Login-State Flow

1. Run the manual auth script:

   ```bash
   pnpm auth:ruankaodaren
   ```

2. A visible Chromium window opens at:

   ```text
   https://ruankaodaren.com/exam/#/knowlegde
   ```

3. The user manually completes login in that browser window.

4. The user returns to the terminal and presses Enter.

5. The script saves:

   ```text
   .auth/ruankaodaren.storageState.json
   ```

6. Later crawler runs automatically use that file if it exists:

   ```bash
   pnpm crawl:ruankaodaren
   ```

## No Login Bypass

This flow only supports normal user login in a local browser.

It must not:

- bypass login
- crack or infer private interfaces
- evade authorization checks
- submit username or password automatically
- store credentials in scripts
- commit authenticated browser state to Git

If the page still appears to show login-related text after the user presses Enter, the auth script prints a warning but still allows saving state. Some sites apply login state only after a refresh or route change.

## Why Storage State Is Not Committed

Playwright `storageState` may contain cookies, local storage, session identifiers, or other account-bound data.

For that reason:

- storage state is stored only under `.auth/`
- `.auth/` is ignored by Git
- real storage-state files must not be reviewed, shared, or committed

## Acceptance Commands

```bash
pnpm auth:ruankaodaren
pnpm crawl:ruankaodaren
pnpm typecheck
pnpm verify
```

## Expected Metadata After Success

After `pnpm crawl:ruankaodaren`, the latest metadata file under `sources/ruankaodaren/raw/metadata/` should include:

```json
{
  "auth_state_used": true,
  "auth_state_path": ".auth/ruankaodaren.storageState.json"
}
```

The crawler should continue saving the same raw snapshot structure:

- rendered HTML
- full-page screenshot
- XHR / Fetch response snapshots
- run metadata

Phase 3 remains blocked until a successful authenticated raw snapshot is inspected.
