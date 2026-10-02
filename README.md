# Pepe’s Lucky Club

A complete static arcade built with Vite, React, and TypeScript. Play a free claw machine beside a visible Pepe player and five animated spectators. Successful grabs travel into the collection hatch, trigger a group celebration, and join a collection saved in this browser.

## Install and develop

Use Node.js 22.18+ (validated with Node 24.9.0) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Dependencies are normal npm packages; no registry mirror or vendored dependency archive is required.

## Rebuild and preview

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

`build` also runs TypeScript before generating `dist/`. The supplied export is already built. For a dependency-free preview of that export, run `python3 -m http.server 4173 --directory dist` and open `http://localhost:4173/`.

The Rollup override in `package.json` is deliberate: the initially resolved 4.64.0 stalled during production transformation in this environment; the pinned 4.46.2 completes. Retain the lockfile for reproducibility.

## Play

1. Select **Let’s play**. Your Pepe reaches across and presses the machine’s red button.
2. Aim over a prize with the slider or left/right buttons, then select **Drop the claw**. Aiming has no time limit. With keyboard focus on a game control, use arrow keys; Space or Enter activates a focused button.
3. Watch the prize lift and arrive in the hatch. Your Pepe jumps while the spectators clap, cheer, and dance. Open **My collection** to see the result, or select **Play again**.

The four catch centers are deterministic; a grab within 24 SVG units of a center wins that character. Dropping between them can miss. Rarity labels describe the characters; they are not randomized odds. Plays are unlimited and free. There is no wallet, payment, backend, or real-world prize.

Sound starts off. The crowd can be paused, and the system reduced-motion preference is respected. Collection data is stored under `pepe-lucky-collection-v1` in local storage. It is specific to the browser and origin; clearing site data clears it. If storage is unavailable, the collection lasts for the current visit.

## Browser validation

```sh
npx playwright install chromium
npm run test:browser
```

The test serves the **production `dist/`** under `/preview/`, launches Chromium, runs interactions and accessibility scans, saves evidence in `artifacts/`, and closes its server/browser before exiting. It does not require a persistent background process. An existing Chromium can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

Actual worker results are documented in [artifacts/validation.md](artifacts/validation.md), with structured output in [artifacts/browser-results.json](artifacts/browser-results.json). Production build and standalone typecheck passed; all four game-rule tests passed. Browser coverage includes five viewport widths, keyboard and touch gameplay, every collectible, misses, repeated clicks, collection persistence and failure recovery, motion preferences, focus handling, and local resource loading. See the validation document for final accessibility scan results and explicit limitations.

The provided browser connector could not launch its expected browser. Validation instead used installed Chromium 154 through Playwright in a bounded foreground script. The worker kept all installed dependencies and npm caches in `/tmp`; no dependency/cache directory or ignore-file change is delivered.

The equivalent worker commands were:

```sh
npm install --prefix /tmp/pepe-build --cache /tmp/pepe-npm-cache --no-audit --no-fund
npm run build --prefix /tmp/pepe-build
npm run typecheck --prefix /tmp/pepe-build
npm run test --prefix /tmp/pepe-build
PEPE_TEST_PACKAGE=/tmp/pepe-build/package.json \
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/ms-playwright/chromium-1246/chrome-linux64/chrome \
npm run test:browser
```

The first command followed copying the package manifest into the isolated build directory; source, public assets, configuration, and tests were also copied there. The resulting lockfile and complete export were copied back. `PEPE_TEST_PACKAGE` is an optional test-only dependency location; normal installations need neither worker-specific path.

## Publish

Publish **the contents of `dist/`**, including `index.html`, `assets/`, `fonts/`, and `favicon.svg`, to any static web host. The publisher does not need to build or install packages. Vite uses `base: './'`; the finished HTML and CSS use relative asset URLs, tested at `/preview/`. Hash links handle in-page navigation, so no route rewrites are required. All runtime assets are local, including fonts; no external API or credential is needed.

Source, `package.json`, `package-lock.json`, required configuration, and `dist/` are part of this delivery. When versioning or packaging, select these deliverables explicitly and exclude any locally installed `node_modules`, caches, and temporary build directories at every nesting level. There is no submodule or vendored registry. Do not replace `dist/index.html` with the source `index.html`.

## Files

- `src/App.tsx`: page, accessible controls/dialogs, timed state sequence, collection and sound.
- `src/Machine.tsx`, `src/Pepe.tsx`: original SVG machine and reusable characters.
- `src/game.ts`: prizes, catch rules, timings, storage sanitization.
- `src/styles.css`: tokens, typography, responsive layouts, animation, accessibility preferences.
- `tests/`: game-rule tests and reproducible browser checks.
- `DESIGN.md`: final implemented design system and component behavior.
- `artifacts/`: validation record, machine-readable results, and real browser screenshots.
- `THIRD_PARTY_NOTICES.md`, `licenses/`, `public/fonts/*OFL.txt`: attribution and licenses.

Manual screen-reader sessions, native browser zoom, physical devices, Safari/Firefox, and listening to audio output were not verified. These limitations do not replace the recorded Chromium interaction results.
