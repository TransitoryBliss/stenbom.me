// Sätteri mdast plugin (Astro 7's default Markdown processor).
//
// Turns a paragraph that holds only an image with a title into
//
//   <figure><img alt="…" src="…"><figcaption>title</figcaption></figure>
//
// Markdown: ![alt text](/images/foo.png "Caption shown under the image").
// The alt stays for screen readers; the title becomes the visible caption
// and is removed from the <img>, so it doesn't double as a tooltip.
// Images without a title are left alone.
import { defineMdastPlugin } from 'satteri';

export default defineMdastPlugin({
	name: 'figure-from-titled-image',
	paragraph(node, ctx) {
		const content = node.children.filter(
			(c) => !(c.type === 'text' && c.value.trim() === ''),
		);
		if (content.length !== 1 || content[0].type !== 'image') return;
		const image = content[0];
		if (!image.title) return;

		ctx.replaceNode(node, {
			type: 'paragraph',
			data: { hName: 'figure' },
			children: [
				{ type: 'image', url: image.url, alt: image.alt ?? '', title: null },
				{
					type: 'paragraph',
					data: { hName: 'figcaption' },
					children: [{ type: 'text', value: image.title }],
				},
			],
		});
	},
});
