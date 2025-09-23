/*
 * Verify that remote style sheets can be imported.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
@import url('http://localhost:5173/import1.css');
div.last {
	content: 'D';
}
`;

test('Import', async ({ page }) => {
	const conditions = async () => {
		const body = await page.evaluate(async css => { document.body = await cssToHtml(css, { imports: 'include' }); return document.body.outerHTML; }, css);

		// The body should have exactly four direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(4);

		// The body's direct children should be in a specific order.
		const last = page.locator('.first:first-child + .second + .third + .last:last-child');
		await expect(last).toHaveCount(1);

		// There should be exactly one span element.
		const span = page.locator('span');
		await expect(span).toHaveCount(1);

		// The span should have specific text content.
		const spanElement = await span.elementHandle();
		const spanContent = await spanElement?.innerHTML();
		expect(spanContent).toBe('A');
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
