/*
 * Verify that combined selectors will be separated correctly.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
h1,
p.subtitle,
p.content {
	content: 'A';
}
`;

test('Comma', async ({ page }) => {
	const conditions = async () => {
		const body = await page.evaluate(async css => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);

		// The body should have exactly three direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(3);

		// There should be exactly one heading element.
		const heading = page.locator('h1');
		await expect(heading).toHaveCount(1);

		// The heading should have specific text content.
		const headingElement = await heading.elementHandle();
		const headingContent = await headingElement?.innerHTML();
		expect(headingContent).toBe('A');

		// There should be exactly one element with class `.subtitle`.
		const subtitle = page.locator('.subtitle');
		await expect(subtitle).toHaveCount(1);

		// The element with class `.subtitle` should have specific text content.
		const subtitleElement = await subtitle.elementHandle();
		const subtitleContent = await subtitleElement?.innerHTML();
		expect(subtitleContent).toBe('A');

		// There should be exactly one element with class `.content`.
		const content = page.locator('.content');
		await expect(content).toHaveCount(1);

		// The element with class `.content` should have specific text content.
		const contentElement = await content.elementHandle();
		const contentContent = await contentElement?.innerHTML();
		expect(contentContent).toBe('A');
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
