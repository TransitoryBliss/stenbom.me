// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import figureFromTitledImage from './src/lib/remark-figure.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://stenbom.me',
	// The blog index moved to /; keep old links working.
	redirects: {
		'/blog': '/',
	},
	markdown: {
		// ![alt](src "caption") becomes <figure> with a visible <figcaption>.
		processor: satteri({ mdastPlugins: [figureFromTitledImage] }),
		shikiConfig: {
			themes: { light: 'github-light', dark: 'github-dark' },
			defaultColor: false,
		},
	},
});
