/*
 * Verify that `:root`, `*`, etc are ignored correctly.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
:root {
	background: #000;
}
* {
	content: 'A';
	box-sizing: border-box;
}
:is(html, body, main) {
	content: 'B';
}
@media screen and (max-width: 200px) {}
div {
	content: 'C';
}
div:hover {
	content: 'D';
}
@media screen and (max-width: 800px) {}
.ignored > section::-webkit-scrollbar {
	width: 0.5rem;
}
`;

test('Ignored', async ({ page }) => {
	const conditions = async () => {
		const body = await page.evaluate(async css => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);

		// The body should have exactly one child.
		const bodyDirectChildren = page.locator('body *');
		await expect(bodyDirectChildren).toHaveCount(1);

		// That element should have specific text content.
		const element = await bodyDirectChildren.elementHandle();
		const content = await element?.innerHTML();
		expect(content).toBe('C');
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
