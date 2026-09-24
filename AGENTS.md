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
| `src/lib/remark-figure.mjs` | Remark plugin: a paragraph holding only `![alt](src "caption")` becomes `<figure><img><figcaption>caption</figcaption></figure>`. Images without a title are left alone. Registered in `astro.config.mjs`. |
| `src/content/blog/*.md` | Post content. Frontmatter: `title`, `description`, `date`. |
| `src/content.config.ts` | Schema for the `blog` collection. |
| `src/layouts/BaseLayout.astro` | Shared HTML shell: nav, `<slot />`, footer. Imports the Fontsource CSS for Source Serif 4 and holds the inline `<head>` script that sets `data-theme` before first paint. |
| `src/components/Nav.astro` | Site nav (Blog, About) plus the Dark/Light theme toggle and its script. "Blog" is active on `/` and under `/blog/`. Dispatches a `themechange` event on `window` after toggling. |
| `src/components/Comments.astro` | Comments via giscus (GitHub Discussions), one thread per post, rendered after `.post-nav` in `[slug].astro`. Holds the giscus repo/category ids. Nothing from `giscus.app` loads until the reader clicks "Load comments" or a paragraph's `¶` quote link. |
| `src/styles/global.css` | The one stylesheet. Palette as CSS variables, typography rules, Shiki dual-theme selectors, styles for `.toc`, `.post-nav`, `.comments` and `.quote-link`. No framework. |
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

Images go in `public/images/<slug>/`. Give each one an alt text (what's in the picture, for
screen readers) and a title, which becomes the visible caption under it:

```markdown
![herdr with two panes and the sidebar open](/images/my-post/herdr.png "What the caption says.")
```

There is no image pipeline; export screenshots at a sensible size (≤ ~2000px wide) before
adding them.

## Rules

- Keep the design minimal: one stylesheet, no CSS framework, no client-side JS required for
  navigation. The priority is readability and easy navigation over visual flourish.
- Fonts (variables in `global.css`):
  - `--font-serif` = Source Serif 4 (variable, optical sizing) for everything by default,
    self-hosted via `@fontsource-variable/source-serif-4`, imported in `BaseLayout.astro`.
  - `--font-sans` = system sans stack for nav, post meta, TOC, post-nav, comments, footer.
  - `--font-mono` = `ui-monospace` stack for code.
  Don't add third-party font requests; if you change fonts, self-host them (Fontsource or
  `public/fonts/`) and ship the licence.
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
- The one exception, and the only third-party script, is comments (`Comments.astro`):
  giscus, backed by the repo's GitHub Discussions (category "Announcements", keyed by id so
  it can be renamed). It is loaded on click only, so a fresh page load makes no request to
  `giscus.app`. The iframe follows the theme toggle via the `themechange` event and
  giscus's `setConfig` postMessage. Posts are mapped with `data-mapping="specific"` and
  `data-term` = the post slug, so renaming a post title or changing the URL doesn't lose
  its thread; renaming the slug does. Each `article > p` gets a JS-injected `¶` button that
  copies a markdown quote of the paragraph (with a link to its H2) and scrolls to the box.
  Moderation is the Discussions UI; commenters need a GitHub account.
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
