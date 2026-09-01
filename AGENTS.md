# AGENTS.md

Notes for coding agents working on this repo. The README is for readers; this is how to
change the site safely.

## What this repo is

Robert's personal site: an About page and a technical blog. Built with
[Astro](https://astro.build), styled with one handwritten stylesheet, deployed to GitHub
Pages at `stenbom.me`.

## Layout

| Path | Notes |
|---|---|
| `src/pages/index.astro` | About / home page. |
| `src/pages/blog/index.astro` | Blog index — lists all posts, newest first. |
| `src/pages/blog/[slug].astro` | Renders a single post from the `blog` content collection. |
| `src/content/blog/*.md` | Post content. Frontmatter: `title`, `description`, `date`. |
| `src/content.config.ts` | Schema for the `blog` collection. |
| `src/layouts/BaseLayout.astro` | Shared HTML shell: nav, `<slot />`, footer. |
| `src/components/Nav.astro` | Site nav (Home, Blog). |
| `src/styles/global.css` | The one stylesheet. Typography-first, `prefers-color-scheme` dark mode, no framework. |
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
- Don't add a webfont — the system font stack avoids load delay.
- Dark mode is handled by the `prefers-color-scheme` media query in `global.css`; there is no
  JS toggle by design.
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
