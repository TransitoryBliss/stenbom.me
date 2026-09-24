# Plan: Comments on blog posts

## Context

The blog is a static Astro site on GitHub Pages. There is no server, so comments can't be
stored on the site itself. They have to live somewhere else and be pulled in client-side.

Robert asked (1) whether annotation-style comments (attached to a passage, shown in the
margin) are possible, and (2) how comments work on GitHub Pages at all.

**Decisions made (with Robert):** giscus as the backend, a "quote-to-comment" affordance
instead of true per-paragraph threads, comments loaded behind a button, GitHub login is fine.

### How this works on GitHub Pages

Pages serves static files only. giscus stores every comment as a GitHub Discussion in this
repo and renders them in an `<iframe>` from `giscus.app`. Our build doesn't change and
`deploy.yml` doesn't change. The only "backend" is GitHub itself; moderation is the
Discussions UI. No secrets, no CI changes.

### Why not true annotations

giscus/utterances map one page → one Discussion. Per-paragraph threads would mean one
iframe and one Discussion per paragraph (or per H2 section), which is slow and messy.
Hypothes.is does real text anchoring but is a heavy overlay that fights the typography, and
the annotations are public web-wide, not "our" comments. A custom backend (Cloudflare
Worker + D1) is the only clean path to real annotations and is a separate project.

The middle ground: one thread at the bottom, plus a hover link on every paragraph that
copies a markdown quote with a link back to the section and jumps to the comment box.
Comments then read as replies to a passage. ~30 lines of JS, no backend.

## Approach

### 1. giscus, one thread per post

`src/components/Comments.astro`, rendered after `.post-nav` in `[slug].astro`.

```html
<section class="comments" id="comments" data-term={post.id}>
	<h2>Comments</h2>
	<p class="comments-note">
		Comments are GitHub Discussions and need a GitHub account.
		<button class="comments-load" type="button">Load comments</button>
	</p>
	<div class="giscus"></div>
</section>
```

On click, the script appends the giscus `<script>` with these attributes:

| attr | value | why |
|---|---|---|
| `data-repo` | `TransitoryBliss/stenbom.me` | |
| `data-repo-id` | `R_kgDOG4pO-w` | from `gh api repos/... --jq .node_id` |
| `data-category` | `Comments` | created manually, Announcements type so only giscus/maintainers create threads |
| `data-category-id` | *(fill in from giscus.app after enabling Discussions)* | |
| `data-mapping` | `specific` | |
| `data-term` | `post.id` (the slug) | stable across title edits and `/blog/x` vs `/blog/x/` — `pathname` mapping is fragile with trailing slashes |
| `data-strict` | `1` | exact match on the term hash, no fuzzy title search |
| `data-reactions-enabled` | `0` | keep it plain |
| `data-emit-metadata` | `0` | |
| `data-input-position` | `top` | comment box first, so the quote link has somewhere to land |
| `data-theme` | `light` / `dark` from `document.documentElement.dataset.theme` | |
| `data-lang` | `en` | |
| `data-loading` | `lazy` | belt and braces; we already gate on a click |
| `crossorigin` | `anonymous` | |

Constants live at the top of `Comments.astro` in one object so they're easy to find.

### 2. Theme sync with the existing toggle

`Nav.astro` already toggles `data-theme` on `<html>`. After doing so it dispatches
`window.dispatchEvent(new CustomEvent('themechange'))`. `Comments.astro` listens and, if the
iframe exists:

```ts
iframe.contentWindow?.postMessage(
	{ giscus: { setConfig: { theme: root.dataset.theme } } },
	'https://giscus.app'
);
```

Built-in `light`/`dark` themes are close enough to the palette to start. A custom theme CSS
at `public/giscus.css` (served by Pages with `access-control-allow-origin: *`) is a
possible follow-up, not in scope.

### 3. Quote-to-comment links

Small `<script>` in `Comments.astro` (only on post pages, so it lives there rather than in
the layout). On load, for every `article > p` (not inside `.toc`, `.post-header`, or
`blockquote`/`pre`):

1. Append `<button class="quote-link" type="button" aria-label="Comment on this paragraph">¶</button>`.
2. On click:
   - Find the nearest preceding `h2` (`previousElementSibling` walk) for the anchor; fall
     back to the page URL if there is none.
   - Build:
     ```
     > first ~200 chars of paragraph text…
     >
     > — [Section title](https://stenbom.me/blog/<slug>/#<h2-slug>)
     ```
   - `navigator.clipboard.writeText(quote)`; swap the button text to "Copied" for ~1.5s.
   - If giscus isn't loaded yet, trigger the same load routine as the button.
   - `document.getElementById('comments').scrollIntoView({ behavior: 'smooth' })`.

The giscus textarea is cross-origin so it can't be pre-filled; clipboard + scroll is the
best we can do, and the "Copied" state tells the reader what to do next (paste).

Progressive enhancement: the buttons are injected by JS, so with JS off nothing appears
and the page is unchanged.

### 4. Styles (`global.css`)

- Add `.comments` to the sans/0.9rem group next to `.post-nav`.
- `.comments`: `margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid var(--border)`
  (mirrors `.post-nav`).
- `.comments h2`: mono/sans, small, `--muted`, matches `.toc-title`.
- `.comments-load`: reuse `.theme-toggle` look (check its rule in `global.css` ~line 240–260
  and extract a shared `.btn-plain` if they'd otherwise duplicate).
- `.quote-link`: `position: absolute; left: -1.75rem` on `article p { position: relative }`;
  `opacity: 0`, `p:hover .quote-link, .quote-link:focus-visible { opacity: 1 }`; `--muted`,
  `--font-sans`. Below `48rem` viewport (no margin room) fall back to `position: static;
  margin-left: 0.5rem; opacity: 0.5` so it's still reachable on touch devices.

## Files to modify

- `src/components/Comments.astro` — **new**: markup, giscus loader, theme listener, quote links.
- `src/pages/blog/[slug].astro` — import and render `<Comments post={post} />` after `.post-nav`.
- `src/components/Nav.astro` — dispatch `themechange` after toggling.
- `src/styles/global.css` — `.comments*` and `.quote-link` rules; add `.comments` to the
  sans group at line ~226.
- `AGENTS.md` — Layout table row for `Comments.astro`; Rules bullet: giscus is the one
  third-party script, loaded only on click; where the ids live; that `themechange` is the
  hook for anything else that needs the theme. (Aside: the fonts bullet in AGENTS.md
  describes iA Writer Quattro/Mono but the code uses Source Serif 4 + system sans — worth
  fixing while in there, but flag before touching.)

Manual, outside the repo:

- Settings → General → Features → enable **Discussions**.
- Create a Discussion category `Comments`, format **Announcements**.
- Install the giscus GitHub App on `TransitoryBliss/stenbom.me` only.
- Open giscus.app, select the repo + category, copy the `data-category-id`.

## Reuse

- Theme source of truth: `document.documentElement.dataset.theme`, set in
  `BaseLayout.astro` head script, toggled in `Nav.astro`. Don't add another.
- `.post-nav` / `.toc` / `.toc-title` rules in `global.css` (lines 356–410) for spacing and
  the muted sans heading look.
- `.theme-toggle` button styling for `.comments-load`.
- Heading `id`s already emitted by Astro's markdown renderer (same slugs `render()` returns
  in `headings[]`) — used as the section anchor in quotes.
- `post.id` (slug) already passed into `[slug].astro`; pass it down as `data-term`.

## Steps

- [x] Manual: enable Discussions, create `Comments` (Announcements), install giscus app,
      fetch category id from giscus.app.
- [x] `Nav.astro`: dispatch `themechange` after toggle.
- [x] `Comments.astro`: markup + config object + `loadGiscus()` (idempotent) + button handler
      + `themechange` listener.
- [x] `Comments.astro`: quote-link injection and click handler (`buildQuote(p)`, clipboard,
      "Copied" state, `loadGiscus()`, scroll).
- [x] `[slug].astro`: render `<Comments post={post} />`.
- [x] `global.css`: `.comments`, `.comments h2`, `.comments-load`, `.quote-link` (+ narrow
      viewport fallback), `article p { position: relative }`.
- [x] `AGENTS.md`: Layout row, Rules bullet, and (if agreed) fix the stale font bullet.
- [ ] Post one test comment, confirm it lands in the right category with the right term,
      delete it.

## Verification

- `npm run build` succeeds; `npm run preview` serves post pages.
- Fresh load of a post: Network tab shows **no** request to `giscus.app`; no `¶` visible
  until a paragraph is hovered.
- Click "Load comments" → iframe appears in the current theme. Toggle Dark/Light → iframe
  re-themes with no reload (watch Network: no new giscus document request).
- Load comments on `/blog/how-i-write-these-posts/` and `/blog/how-i-write-these-posts`
  (no slash) → same Discussion (term mapping, not pathname).
- Hover a paragraph → `¶` appears; click → clipboard contains the blockquote + section
  link, button reads "Copied", page scrolls to the comment box and giscus loads if it
  wasn't already. Paste into the box → renders as a quote with a working link.
- Keyboard: Tab reaches `¶` (focus-visible shows it) and Enter triggers it.
- Narrow viewport (<48rem): `¶` sits inline after the paragraph, not off-screen.
- JS disabled: post reads exactly as before, "Load comments" button does nothing visible
  (acceptable; note says comments need a GitHub account anyway).
- Post a comment while logged in → appears under Discussions › Comments with the slug as
  the title; delete it from the GitHub UI.
