# AGENTS.md

Notes for coding agents working on this repo. The README is for readers; this is how to
change the site safely.

## What this repo is

Robert's personal site: an About page and a technical blog. Built with
[Astro](https://astro.build), styled with one handwritten stylesheet built for long-form
reading (Source Serif 4, light default, dark toggle), deployed to GitHub Pages at `stenbom.me`.

## Layout

| Path | Notes |
|---|---|
| `src/pages/index.astro` | Front page: the blog index — lists all posts, newest first. |
| `src/pages/about.astro` | About page (`/about/`). |
| `src/pages/blog/[slug].astro` | Renders a single post from the `blog` content collection. Sorts posts in `getStaticPaths` and passes `newer`/`older` for the post-nav; renders reading time, a table of contents (only when the post has ≥3 H2s), and previous/next links. |
| `src/lib/readingTime.ts` | `readingTime(body)` → whole minutes at ~230 wpm. Used by the index and post header. |
| `src/content/blog/*.md` | Post content. Frontmatter: `title`, `description`, `date`. |
| `src/content.config.ts` | Schema for the `blog` collection. |
| `src/layouts/BaseLayout.astro` | Shared HTML shell: nav, `<slot />`, footer. Imports the Fontsource CSS for Source Serif 4 and holds the inline `<head>` script that sets `data-theme` before first paint. |
| `src/components/Nav.astro` | Site nav (Blog, About) plus the Dark/Light theme toggle and its script. "Blog" is active on `/` and under `/blog/`. |
| `src/styles/global.css` | The one stylesheet. Palette as CSS variables, typography rules, Shiki dual-theme selectors, styles for `.toc` and `.post-nav`. No framework. |
| `astro.config.mjs` | Sets Shiki to dual themes `github-light` / `github-dark` with `defaultColor: false`. Redirects `/blog` → `/` (the index used to live there). |
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
- Prose metrics (from reading research, don't drift): body
  `clamp(1.125rem, 1rem + 0.5vw, 1.25rem)` (18–20px; bigger type helps most, Rello et al.
  2016), line-height `1.5` (Butterick's 120–145% plus a little for a serif), paragraph
  margin `1.5em` (one line, so paragraphs separate and the page keeps one rhythm), measure
  `40rem` (~65 characters, Bringhurst's 45–75). The measure is in `rem`, not `ch`, so it
  doesn't shrink for elements with a smaller font-size.
- Theme: light (near-black on warm off-white) is always the default, regardless of OS
  preference. Dark text on a light background reads measurably better for prose
  (Piepenbrock et al., *Ergonomics* 2013/2014, the "positive polarity advantage"), so don't
  flip the default back to dark. Dark is opted into via `data-theme="dark"` on `<html>`,
  chosen with the nav toggle and remembered in `localStorage` under the key `theme`.
  Colours live as variables on `:root` (light) and `html[data-theme='dark']` in
  `global.css` — change values there, not in components.
- Extras are build-time only: reading time (`src/lib/readingTime.ts`), TOC from Astro's
  `render()` headings (threshold: 3 H2s), previous/next from the sorted collection. No JS
  for any of them.
- The only client-side JS is the theme handling: an `is:inline` script in the `<head>` of
  `BaseLayout.astro` (must stay before the stylesheet to avoid a flash) and the toggle
  script in `Nav.astro`. Don't add more without a good reason.
- Code blocks use Shiki dual themes; `global.css` picks `--shiki-dark` or `--shiki-light`
  per theme and forces the block background to `--bg-soft` so it stands out from the page.

## Palette

| Variable | Light (default) | Dark |
|---|---|---|
| `--bg` | `#fbfaf7` | `#161616` |
| `--bg-soft` | `#f2f0eb` | `#222222` |
| `--fg` | `#1a1a1a` | `#dedbd5` |
| `--muted` | `#5c5a56` | `#9c9994` |
| `--accent` | `#1b4f8a` | `#8fb8ea` |
| `--border` | `#e1ded8` | `#333333` |

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
