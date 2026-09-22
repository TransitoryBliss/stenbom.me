/** Estimated reading time in whole minutes at ~230 words per minute (a common adult average). */
export function readingTime(body: string | undefined): number {
	const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 230));
}
