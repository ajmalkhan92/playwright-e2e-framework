# Playwright E2E Framework

TypeScript + Playwright Test end-to-end framework, demonstrated against the public
[Sauce Demo](https://www.saucedemo.com) shop (login, cart, checkout).

## Quick start

```bash
npm install
npx playwright install        # browsers (use --with-deps on Linux CI)
cp .env.example .env          # optional; defaults already point at Sauce Demo
npm test                      # all projects (chromium, firefox, webkit)
npm run test:smoke            # only @smoke tests
npm run test:chromium         # one browser, fastest feedback
npm run test:ui               # interactive UI mode
npm run report                # open last HTML report
npm run typecheck && npm run lint
```

## Layout

```
playwright.config.ts      projects, reporters, retries, artifacts
src/
  config/env.ts           exports resolved `config` (via utils/configReader)
  utils/jsonReader.ts     generic typed JSON file reader (cached)
  utils/configReader.ts   layered config loader
  pages/                  Page Objects (shared BasePage + one class per page)
  fixtures/baseTest.ts    base test: config, testData, console-error capture
  fixtures/index.ts       extends baseTest to inject page objects
  data/                   static test data (*.json) + types
config/                   default.json, <ENV>.json
tests/
  setup/auth.setup.ts     logs in once, saves storageState
  e2e/*.spec.ts           specs: intent only, no selectors
.github/workflows/e2e.yml CI: typecheck, lint, test, upload report
```

## Design discussions

Each section records a decision, the alternatives, and why we chose as we did, so
future changes can revisit the reasoning rather than the result.

### 1. Playwright Test, TypeScript
- **Chosen:** `@playwright/test` runner with TypeScript (strict).
- **Alternatives:** Playwright library + Jest/Mocha; Cypress; JavaScript.
- **Why:** The built-in runner gives parallelism, fixtures, retries, tracing, HTML
  reports and multi-browser projects with no glue. TypeScript catches broken page-object
  APIs at compile time, which matters as the suite grows.

### 2. Page Object Model, kept thin
- **Chosen:** one class per page, extending a small `BasePage`. Locators are
  `readonly` properties; methods express user actions (`login`, `addToCart`) and
  page-level assertions (`expectCartCount`).
- **Alternatives:** raw selectors in specs; Screenplay pattern; component objects only.
- **Why:** Selectors live in exactly one place, so a UI change is a one-file fix.
  Screenplay is heavier than this suite needs. `BasePage` deliberately has almost
  nothing in it: deep inheritance and wrapper-around-every-Playwright-call
  abstractions hide Playwright's auto-waiting and make failures harder to read.
- **Assertions in page objects:** allowed only as web-first `expect(locator)` helpers
  (they auto-retry). Specs still read as a story, and no page object returns another
  page object implicitly.

### 3. Fixtures for dependency injection
- **Chosen:** `src/fixtures/index.ts` extends `test` so specs receive `loginPage`,
  `cartPage`, etc. as arguments. Specs import `test`/`expect` from `@fixtures` only.
- **Alternatives:** `new LoginPage(page)` in every test or `beforeEach`.
- **Why:** Fixtures are lazy (only constructed if requested), remove boilerplate and
  give one place to add cross-cutting setup later (API clients, test data factories).

### 4. Authentication via storageState + setup project
- **Chosen:** a `setup` project logs in once through the UI and writes
  `.auth/standard-user.json`; browser projects depend on it and load that state.
  Tests that need a logged-out session override it with
  `test.use({ storageState: { cookies: [], origins: [] } })`.
- **Alternatives:** log in inside every test; `globalSetup`; per-worker accounts.
- **Why:** Logging in per test is slow and makes every test fail when login breaks.
  A setup *project* (rather than `globalSetup`) shows up in reports and traces and
  participates in retries. The state file is git-ignored.
- **Trade-off / known limit:** tests share one account, so they must not depend on
  server-side state that persists across tests. Sauce Demo keeps cart state client-side,
  so it is safe here. For a real backend, move to per-worker accounts or create data
  via API per test.

### 5. Locator strategy
- **Order of preference:** role (`getByRole`) → label/placeholder → `data-test`
  attribute → CSS. Never XPath or position-based selectors.
- `testIdAttribute` is set to `data-test` because Sauce Demo uses that name instead
  of Playwright's default `data-testid`. When pointing at your own app, align this
  with your app's convention (preferably `data-testid`).

### 6. Configuration, file readers and environments
- **Chosen:** layered config. `config/default.json` < `config/<ENV>.json` (selected with
  `ENV=staging`) < environment variables / `.env` (e.g. `BASE_URL`, `USER_PASSWORD`).
  `utils/configReader.ts` merges the layers (deep merge, undefined overrides ignored) into a
  typed `AppConfig`. A missing `config/<ENV>.json` fails fast with a clear error.
- **Generic JSON reader:** `utils/jsonReader.ts` `readJson<T>(path)` resolves from the project
  root (not cwd), parses once, caches, and returns a clone so tests cannot mutate shared data.
  Errors name the file and keep the original `cause`. Both config and test data use it.
- **Alternatives:** one hard-coded env object; YAML; a config library (node-config, convict).
- **Why JSON:** zero dependencies, typed via interfaces, diff-friendly. Schema validation
  (zod) is a possible later step. Secrets stay out of committed JSON: use env vars in CI.
  (Sauce Demo creds are public and committed only because this is a demo.)
- **Why env vars still win:** CI can retarget with `BASE_URL=... npm test` with no file edits.

### 6b. Base page and base test
- **BasePage** holds only behaviour every page shares: `goto`, `reload`, `pageTitle`,
  `expectUrl`, `expectOnPage` and a `byTestId` helper. Anything page-specific stays in the subclass.
- **baseTest** (`fixtures/baseTest.ts`) is the framework-wide `test`: it provides `config`,
  typed `testData`, and an auto `consoleErrors` fixture that attaches browser console/page
  errors to the report when a test fails. `fixtures/index.ts` extends it with page objects, so
  fixtures are layered (infrastructure first, pages second) and specs import one `test`.

### 7. Browser matrix and parallelism
- Chromium, Firefox and WebKit run as projects, all `fullyParallel`. Each test gets
  an isolated browser context, which is what makes parallel runs safe.
- CI uses 2 workers (shared runners are small); locally Playwright picks a count from
  CPU cores. Use `npm run test:chromium` for fast local loops.

### 8. Test independence and tagging
- Every test must pass alone and in any order; no test relies on another's output.
- Tags live in the title (`@smoke`) and are selected with `--grep`. Title tags work
  on every Playwright version and keep the mechanism simple. Keep `@smoke` small
  (critical paths only) so it can gate PRs quickly.

### 9. Waiting and flakiness policy
- No `waitForTimeout`/sleeps. Rely on auto-waiting and web-first assertions.
- Retries: 0 locally (so flakes are noticed), 2 on CI. A test that passes only on
  retry is reported as flaky and should be fixed, not tolerated.
- `forbidOnly` on CI prevents a stray `test.only` from silently skipping the suite.

### 10. Diagnostics
- `trace: on-first-retry`, `screenshot: only-on-failure`, `video: retain-on-failure`
  keep artifacts small for passing runs while giving full detail on failures.
  Open a trace with `npx playwright show-trace <trace.zip>`.
- HTML report always; GitHub annotations reporter added on CI.

### 11. Path aliases
- `@pages/*`, `@fixtures`, `@config/*`, `@data/*`, `@utils/*` avoid `../../..` imports. Playwright
  resolves `tsconfig` paths natively, so no extra tooling is needed.

### 12. Quality gates and CI
- `tsc --noEmit` and ESLint (typescript-eslint) run before tests in CI.
- The workflow uploads the HTML report as an artifact even on failure.

## Deliberately out of scope (for now)

Candidates to add when the need appears, rather than up front:

- **API-level setup/teardown** (Playwright `request` fixture) for test data on real backends.
- **Visual regression** (`toHaveScreenshot`), which needs a pinned OS/browser image to be stable.
- **Accessibility checks** (`@axe-core/playwright`).
- **Sharding** (`--shard=1/4`) once the suite outgrows a single CI job.
- **Multiple user roles** as additional setup projects with their own storageState files.
- **Third-party reporters** (Allure, etc.); the built-in HTML report suffices today.

## Adding a test

1. New page? Add `src/pages/FooPage.ts` and register it in `src/fixtures/index.ts`.
2. Add `tests/e2e/foo.spec.ts`, importing `test` from `@fixtures`.
3. Keep selectors out of the spec; add `@smoke` only for critical paths.
