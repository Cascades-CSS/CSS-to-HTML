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
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css) => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);

	// The body should have exactly two direct children.
	const bodyDirectChildren = page.locator('body > *');
	expect(await bodyDirectChildren.count()).toBe(2);

	// There should be exactly one anchor element.
	const anchor = page.locator('a');
	expect(await anchor.count()).toBe(1);
	const anchorElement = await anchor.elementHandle();
	expect(anchorElement).toBeTruthy();

	// The anchor's href attribute should be populated.
	const anchorHref = await anchorElement?.getAttribute('href');
	expect(anchorHref).toBe('https://example.com/page');

	// The anchor should not have any text content.
	const anchorContent = await anchorElement?.innerHTML();
	expect(anchorContent).toBe('');

	// The element with class `.more` should follow the anchor.
	const more = page.locator('a + .more');
	expect(await more.count()).toBe(1);
	const moreElement = await more.elementHandle();
	expect(moreElement).toBeTruthy();

	// There should be exactly one span element.
	const span = page.locator('span');
	expect(await span.count()).toBe(1);
	const spanElement = await span.elementHandle();
	expect(spanElement).toBeTruthy();

	// The span should have specific text content.
	const spanContent = await spanElement?.innerHTML();
	expect(spanContent).toBe('B');
});
