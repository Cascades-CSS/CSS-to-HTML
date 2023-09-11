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
@media screen and (max-width: 200px) {}
div {
	content: 'B';
}
div:hover {
	content: 'C';
}
@media screen and (max-width: 800px) {}
.ignored > section::-webkit-scrollbar {
	width: 0.5rem;
}
`;

test('Ignored', async ({ page }) => {
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css) => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);

	// The body should have exactly one child.
	const bodyDirectChildren = page.locator('body *');
	expect(await bodyDirectChildren.count()).toBe(1);
	const element = await bodyDirectChildren.elementHandle();
	expect(element).toBeTruthy();

	// That element should have specific text content.
	const content = await element?.innerHTML();
	expect(content).toBe('B');
});
