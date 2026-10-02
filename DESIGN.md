# Pepe’s Lucky Club design

## Overview

A friendly, free claw-machine arcade, built with React, TypeScript, and original SVG character artwork. The visual direction pairs warm cream, forest green, muted collectible colors, and a serif display face. The machine is the central visual; the adjacent panel holds one prominent action. Supporting cards introduce the four collectible Pepes.

The source of truth is `src/styles.css`, with illustration geometry in `src/Machine.tsx` and `src/Pepe.tsx`. This is a single light-theme, English-language page. These choices were inferred for this assignment.

## Colors

The stylesheet uses hex primitives and semantic aliases in `:root`.

| Token                  | Value                    | Use                              |
| ---------------------- | ------------------------ | -------------------------------- |
| `--color-bg`           | `--cream-50`, `#f8f6ed`  | Page, dialogs, light surfaces    |
| `--color-surface`      | `--cream-100`, `#f1efe3` | Declared secondary surface token |
| `--color-scene`        | `--green-100`, `#e9eddf` | Machine stage                    |
| `--color-border`       | `--cream-200`, `#e0dfd0` | Structural dividers and outlines |
| `--color-text`         | `--ink-800`, `#303b2e`   | Headings and primary text        |
| `--color-muted`        | `--ink-500`, `#656b5d`   | Supporting copy                  |
| `--color-accent`       | `--green-700`, `#2b563d` | Main action and active controls  |
| `--color-accent-hover` | `--green-800`, `#214631` | Main action hover                |
| `--color-focus`        | `#a65031`                | 3px focus outline, offset 4px    |

The primary action uses `#fcf9e9` text. The kindness banner uses `#eeeedd` with `#586541` for its second phrase. Collection backgrounds are defined in `src/game.ts`: `#dce8cb`, `#f6e7bb`, `#e4dff0`, and `#f0d6c7`. They identify characters, not interaction states. Status always includes words, not color alone.

Measured solid rendered pairs include primary text/page 10.83:1, muted text/page 5.08:1, main button 7.94:1, stage caption 4.63:1, and banner phrase 5.34:1. See `artifacts/browser-results.json` for the actual pairs; these measurements do not describe every illustration color.

## Typography

- **DM Sans**, fallback Arial/sans-serif: body, navigation, controls, captions. The local WOFF2 declares normal weights 100–1000; the interface uses 400–700.
- **Fraunces**, fallback Georgia/serif: brand and display headings. The local WOFF2 declares normal weights 100–900; headings use 600 and the wordmark 700.
- Files and OFL licenses live in `public/fonts/`. `font-display: swap` is implemented. Both fonts were confirmed loaded in Chromium. Synthetic styles are disabled; there is no italic interface text.
- The desktop page heading uses `clamp(2.3rem, 4.25vw, 3.8rem)`, line-height 1.15 and −2.2px tracking. Width-specific rules use 47, 43, 37, and 34px. The play heading is 40–54px on wide layouts, falling to 29px at the narrowest breakpoint. The prize section heading is 29px, then 26/24px.
- Body descriptions use 14px with 1.5–1.7 line-height. Actions use 15px/600. Effective game status and prize names use 13px; supporting UI uses mostly 11–12px. Small uppercase metadata and rarity labels use 9–10px. SVG cabinet lettering is decorative and not used as the only instruction.
- Headings use `text-wrap: balance`; descriptions use `pretty`. Counters use tabular numbers. The final “Legible supporting copy” rules in `src/styles.css` deliberately override earlier compact sizes at all breakpoints.

## Layout

`.wrap` supplies the shared horizontal alignment. Its default maximum width is 1264px with 40px inline padding; at 1400px and wider it is 1360px with 55px padding. Padding becomes 28px at 1050px, 20px at 540px, and 16px at 360px.

The stylesheet declares a spacing scale of 4, 8, 12, 16, 24, 32, and 48px as `--space-*`; existing component geometry is expressed primarily with direct pixel values. Common gaps are 8–16px within groups, 20–26px between controls and supporting groups, and 40–58px between sections.

- Above 780px: two columns, weighted toward the machine; four prize cards in one row.
- At 780px and below: stage and controls stack in reading order. The stage is capped at 680px and controls at 540px. Instructions remain below the scene with no fixed overlay covering either.
- At 540px and below: the header navigation occupies a second row, prize cards use two columns, and the free-play badge sits above the play heading. The hero heading breaks between its two phrases.
- Dialogs use `min(540px, calc(100% - 32px))`, a maximum height relative to `100dvh`, and internal vertical scrolling.

The illustration scales through an 800×655 SVG viewBox. Spectators stand to its sides and below the glass. Browser checks found no horizontal overflow at 1440, 960, 780, 390, or 320px. Native browser zoom and physical devices were not tested.

## Elevation & Depth

Most structure comes from spacing and quiet tonal surfaces. The stage has a 1px structural border. The main action has a 3px dark lower shadow to suggest a physical button. Dialogs use a `0 24px 100px #253a2930` shadow with a translucent backdrop and 4px blur. The machine itself uses outlined shapes, a shaded side panel, glass highlights, and a soft ground ellipse.

## Shapes

`--radius-control` is 10px and `--radius-panel` is 20px. The narrow stage uses 15px. Prize image panels use 13px; dialogs 22px. Status labels are compact pills. Icons use a consistent 1.7px rounded outline. Character outlines are 2.3 SVG units, independent of UI icon sizing.

## Components

- **`Pepe` / `PepePortrait` — `src/Pepe.tsx`:** reusable SVG artwork. Hats: none, bucket, wizard, crown, cap, beanie, flower; shirt color and class identify the player and spectators. Portraits are decorative. The scene has a descriptive accessible SVG title and description.
- **`Machine` — `src/Machine.tsx`:** receives `phase`, `position`, `caught`, `celebrating`, and `motion`. Draws the giant Pepe cabinet, glass, claw, prizes, hatch, five spectators, and active player. The scene is artwork; use the native adjacent game controls to play.
- **Game controls — `src/App.tsx`:** one native primary button changes from Play to Drop to Play again. Arrow buttons and the labeled native range move the claw. Busy presses use `aria-disabled` with a handler guard, preserving focus. A stable polite live region announces each stage and result. Space/Enter activate buttons; arrows aim while a game control is focused. No deadline is imposed.
- **Collection — `src/game.ts` and `src/App.tsx`:** four prizes with deterministic centers and ±24 SVG-unit catch tolerance. Storage is versioned and sanitized; corrupt data becomes empty. Unavailable storage retains a usable session and explains the limitation in the collection dialog.
- **Dialogs — `src/App.tsx`:** native `showModal()`, accessible headings, initial close-button focus, explicit first/last button Tab wrapping, native Escape closing, and trigger focus restoration. The collection also has useful empty and completed states.
- **Settings:** Sound is opt-in and synthesized locally. Crowd animation has a visible pause/resume toggle. Buttons expose pressed state.
- **Motion — `src/styles.css`, timings in `src/game.ts`:** the arm reaches over 260ms; the red button depresses after 230ms; game action begins at the end of the 520ms pressing phase while contact is held. Drop/lift each last 950ms; hatch delivery lasts 1000ms. The player jumps while spectators clap, wave, and dance; celebration ends after 3600ms. Idle characters chat, blink, watch, and lean. UI transitions are 150ms with `--ease`; active controls scale to 0.96.
- **Reduced motion:** transforms and keyframes are disabled under `prefers-reduced-motion: reduce`. The game still completes, status updates remain, and the prize appears in the hatch. Forced-colors focus uses the system Highlight color.

## Do’s and Don’ts

- Start another surface with `.wrap`, the existing font roles, and semantic color tokens. Use the primary filled button for the main action and quieter native buttons for secondary actions.
- Keep instructions and game status outside the SVG so they stay readable, selectable, and accessible.
- Add character variations through `Pepe` props; preserve the glass and control clearances.
- Update state, static text, and animation together. Never make motion or color the only way to understand a result.
- Keep gameplay free, unhurried, and local. Do not imply rarity labels represent paid odds or monetary value.
- Preserve local font files, relative asset URLs, and the `./` Vite base when adding content. Do not add a route that requires server rewrites.

Design-method attribution is in `THIRD_PARTY_NOTICES.md`; review findings and unperformed checks are in `artifacts/validation.md`.
