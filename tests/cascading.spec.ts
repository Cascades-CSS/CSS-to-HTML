/*
 * Verify that content will cascade.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
a {
	content: 'https://example.com/';
}
a {
	content: 'https://example.com/page';
}
.more p {}
.more p span {
	content: 'A';
}
.more p span {
	content: 'B';
}
`;

test('Cascading', async ({ page }) => {
	const conditions = async () => {
		const body = await page.evaluate(async css => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);

		// The body should have exactly two direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(2);

		// There should be exactly one anchor element,
		// and its href attribute should be populated.
		const anchor = page.locator('a');
		await expect(anchor).toHaveCount(1);
		await expect(anchor).toHaveAttribute('href', 'https://example.com/page');

		// The anchor should not have any text content.
		const anchorElement = await anchor.elementHandle();
		const anchorContent = await anchorElement?.innerHTML();
		expect(anchorContent).toBe('');

		// The element with class `.more` should follow the anchor.
		const more = page.locator('a + .more');
		await expect(more).toHaveCount(1);

		// There should be exactly one span element.
		const span = page.locator('span');
		await expect(span).toHaveCount(1);

		// The span should have specific text content.
		const spanElement = await span.elementHandle();
		const spanContent = await spanElement?.innerHTML();
		expect(spanContent).toBe('B');
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
