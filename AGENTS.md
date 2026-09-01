# AGENTS.md

Notes for coding agents working on this repo. The README is for readers; this is how to
change the site safely.

## What this repo is

Robert's personal site: an About page and a technical blog. Built with
[Astro](https://astro.build), styled with one handwritten stylesheet (gruvbox colours,
iA Writer typefaces), deployed to GitHub Pages at `stenbom.me`.

## Layout

| Path | Notes |
|---|---|
| `src/pages/index.astro` | About / home page. |
| `src/pages/blog/index.astro` | Blog index — lists all posts, newest first. |
| `src/pages/blog/[slug].astro` | Renders a single post from the `blog` content collection. |
| `src/content/blog/*.md` | Post content. Frontmatter: `title`, `description`, `date`. |
| `src/content.config.ts` | Schema for the `blog` collection. |
| `src/layouts/BaseLayout.astro` | Shared HTML shell: nav, `<slot />`, footer. Holds the inline `<head>` script that sets `data-theme` before first paint, and the font preload. |
| `src/components/Nav.astro` | Site nav (Home, Blog) plus the `[light]`/`[dark]` theme toggle and its script. |
| `src/styles/global.css` | The one stylesheet. Gruvbox palette as CSS variables, `@font-face` for iA Writer Quattro (prose) and Mono (structure/code), Shiki dual-theme selectors. No framework. |
| `astro.config.mjs` | Sets Shiki to dual themes `gruvbox-dark-hard` / `gruvbox-light-hard` with `defaultColor: false`. |
| `public/fonts/` | Self-hosted iA Writer Quattro and Mono woff2 files (Regular, Bold, Italic, BoldItalic each) and their SIL OFL licences. Keep the licence files next to the fonts. |
| `public/CNAME` | Custom domain for GitHub Pages (`stenbom.me`). Don't remove. |
| `.github/workflows/deploy.yml` | Builds with `withastro/action` and deploys via `actions/deploy-pages` on push to `main`. |

## Adding a post

Add a new file under `src/content/blog/`, e.g. `src/content/blog/my-post.md`:

```markdown
---
title: My Post Title
description: One-sentence summary for the index page and meta tags.
date: 2026-01-01
---

Post body in Markdown.
```

The slug is the filename without extension. No other file needs to change — the blog index
and post route both read from the collection automatically.

## Rules

- Keep the design minimal: one stylesheet, no CSS framework, no client-side JS required for
  navigation. The priority is readability and easy navigation over visual flourish.
- Two self-hosted fonts from `public/fonts/` (SIL OFL 1.1, both based on IBM Plex Mono):
  - `--font-prose` = iA Writer Quattro for body text. Plain monospace is measurably harder
    to read as prose (iA's own research); Quattro keeps the typewriter look but uses four
    glyph widths so it flows like proportional text. Don't switch body text back to Mono.
  - `--font-mono` = iA Writer Mono for headings, nav, footer, dates and code.
  Don't add third-party font requests; if you change fonts, self-host them and ship the
  licence.
- Prose metrics: body `1.0625rem` / line-height `1.7`, measure `42rem` (~65 characters of
  Quattro). The measure is in `rem`, not `ch`, so it doesn't shrink for elements with a
  smaller font-size.
- Theme: dark (gruvbox-dark-hard) is always the default, regardless of OS preference. Light
  (gruvbox-light-hard) is opted into via `data-theme="light"` on `<html>`, chosen with the
  nav toggle and remembered in `localStorage` under the key `theme`. Colours live as
  variables on `:root` (dark) and `html[data-theme='light']` in `global.css` — change
  values there, not in components.
- The only client-side JS is the theme handling: an `is:inline` script in the `<head>` of
  `BaseLayout.astro` (must stay before the stylesheet to avoid a flash) and the toggle
  script in `Nav.astro`. Don't add more without a good reason.
- Code blocks use Shiki dual themes; `global.css` picks `--shiki-dark` or `--shiki-light`
  per theme and forces the block background to `--bg-soft` so it stands out from the page.

## Palette

| Variable | Dark (gruvbox-dark-hard) | Light (gruvbox-light-hard) |
|---|---|---|
| `--bg` | `#1d2021` | `#f9f5d7` |
| `--bg-soft` | `#282828` | `#fbf1c7` |
| `--fg` | `#ebdbb2` | `#3c3836` |
| `--muted` | `#a89984` | `#7c6f64` |
| `--accent` | `#fabd2f` | `#b57614` |
| `--border` | `#3c3836` | `#ebdbb2` |
- Commit as `Robert Stenbom <7187639+TransitoryBliss@users.noreply.github.com>`, matching the
  other TransitoryBliss repos.

## Verifying changes

```sh
npm install     # first time only
npm run dev     # local dev server
npm run build   # confirms the static build succeeds
```

Deployment is automatic on push to `main` via GitHub Actions (see `deploy.yml`). GitHub Pages
must be set to the "GitHub Actions" source in repo settings, and DNS for `stenbom.me` must
point at GitHub Pages for the custom domain to resolve.
