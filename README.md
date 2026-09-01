# stenbom.me

Robert Stenbom's personal site — a short about page and a technical blog. Built with
[Astro](https://astro.build), deployed to GitHub Pages.

Set in [Source Serif 4](https://github.com/adobe-fonts/source-serif) (self-hosted via
Fontsource), light by default with a Dark toggle in the nav. Posts show reading time, a table
of contents on longer posts, and previous/next links.

## Local development

```sh
npm install
npm run dev       # http://localhost:4321
```

## Build

```sh
npm run build     # static output in dist/
npm run preview   # preview the production build locally
```

## Writing a post

Add a Markdown file to `src/content/blog/`, e.g. `src/content/blog/my-post.md`, with
frontmatter for `title`, `description`, and `date`. See `AGENTS.md` for details.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and deploys
it to GitHub Pages. The custom domain (`stenbom.me`) is set via `public/CNAME`.
