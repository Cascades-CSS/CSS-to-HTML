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
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css) => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);

	// The body should have exactly three direct children.
	const bodyDirectChildren = page.locator('body > *');
	expect(await bodyDirectChildren.count()).toBe(3);

	// There should be exactly one heading element.
	const heading = page.locator('h1');
	expect(await heading.count()).toBe(1);
	const headingElement = await heading.elementHandle();
	expect(headingElement).toBeTruthy();

	// The heading should have specific text content.
	const headingContent = await headingElement?.innerHTML();
	expect(headingContent).toBe('A');

	// There should be exactly one element with class `.subtitle`.
	const subtitle = page.locator('.subtitle');
	expect(await subtitle.count()).toBe(1);
	const subtitleElement = await subtitle.elementHandle();
	expect(subtitleElement).toBeTruthy();

	// The element with class `.subtitle` should have specific text content.
	const subtitleContent = await subtitleElement?.innerHTML();
	expect(subtitleContent).toBe('A');

	// There should be exactly one element with class `.content`.
	const content = page.locator('.content');
	expect(await content.count()).toBe(1);
	const contentElement = await content.elementHandle();
	expect(contentElement).toBeTruthy();

	// The element with class `.content` should have specific text content.
	const contentContent = await contentElement?.innerHTML();
	expect(contentContent).toBe('A');
});
