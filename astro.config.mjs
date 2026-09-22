// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://stenbom.me',
	markdown: {
		shikiConfig: {
			themes: { dark: 'gruvbox-dark-hard', light: 'gruvbox-light-hard' },
			defaultColor: false,
		},
	},
});
