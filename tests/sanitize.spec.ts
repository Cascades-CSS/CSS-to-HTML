/*
 * Verify that DOM sanitization is working.
 */

import { test, expect, type Page } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
@import url('http://localhost:5173/import4.css');
div.last[onclick="console.log('foo')"] {
	content: 'A';
}
`;

test('Sanitization Off', async ({ page }) => {
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css1) => { document.body = await cssToHtml(css1, { imports: 'include', sanitize: 'off' }); return document.body.outerHTML; }, css);

	// The body should have exactly two direct children.
	const bodyDirectChildren = page.locator('body > *');
	expect(await bodyDirectChildren.count()).toBe(2);

	// The body's direct children should be in a specific order.
	const last = page.locator('img:first-child + .last:last-child');
	expect(await last.count()).toBe(1);
	const lastElement = await last.elementHandle();
	expect(lastElement).toBeTruthy();

	// There should be exactly one img element.
	const img = page.locator('img');
	expect(await img.count()).toBe(1);
	const imgElement = await img.elementHandle();
	expect(imgElement).toBeTruthy();

	// The img should have an `onload` attribute.
	const imgAttribute = await imgElement?.getAttribute('onload');
	expect(imgAttribute).toBe('console.log(\'danger\')');

	// There should be exactly one div element.
	const div = page.locator('div');
	expect(await div.count()).toBe(1);
	const divElement = await div.elementHandle();
	expect(divElement).toBeTruthy();

	// The div should have specific text content.
	const divContent = await divElement?.innerHTML();
	expect(divContent).toBe('A');

	// The div should have an `onclick` attribute.
	const divAttribute = await divElement?.getAttribute('onclick');
	expect(divAttribute).toBe('console.log(\'foo\')');
});

test('Sanitize Imports Only', async ({ page }) => {
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css1) => { document.body = await cssToHtml(css1, { imports: 'include', sanitize: 'imports' }); return document.body.outerHTML; }, css);

	// The body should have exactly two direct children.
	const bodyDirectChildren = page.locator('body > *');
	expect(await bodyDirectChildren.count()).toBe(2);

	// The body's direct children should be in a specific order.
	const last = page.locator('img:first-child + .last:last-child');
	expect(await last.count()).toBe(1);
	const lastElement = await last.elementHandle();
	expect(lastElement).toBeTruthy();

	// There should be exactly one img element.
	const img = page.locator('img');
	expect(await img.count()).toBe(1);
	const imgElement = await img.elementHandle();
	expect(imgElement).toBeTruthy();

	// The img should not have an `onload` attribute.
	const imgAttribute = await imgElement?.getAttribute('onload');
	expect(imgAttribute).toBeNull();

	// There should be exactly one div element.
	const div = page.locator('div');
	expect(await div.count()).toBe(1);
	const divElement = await div.elementHandle();
	expect(divElement).toBeTruthy();

	// The div should have specific text content.
	const divContent = await divElement?.innerHTML();
	expect(divContent).toBe('A');

	// The div should have an `onclick` attribute.
	const divAttribute = await divElement?.getAttribute('onclick');
	expect(divAttribute).toBe('console.log(\'foo\')');
});

async function expectEverythingToBeSanitized (page: Page): Promise<void> {
	// The body should have exactly two direct children.
	const bodyDirectChildren = page.locator('body > *');
	expect(await bodyDirectChildren.count()).toBe(2);

	// The body's direct children should be in a specific order.
	const last = page.locator('img:first-child + .last:last-child');
	expect(await last.count()).toBe(1);
	const lastElement = await last.elementHandle();
	expect(lastElement).toBeTruthy();

	// There should be exactly one img element.
	const img = page.locator('img');
	expect(await img.count()).toBe(1);
	const imgElement = await img.elementHandle();
	expect(imgElement).toBeTruthy();

	// The img should not have an `onload` attribute.
	const imgAttribute = await imgElement?.getAttribute('onload');
	expect(imgAttribute).toBeNull();

	// There should be exactly one div element.
	const div = page.locator('div');
	expect(await div.count()).toBe(1);
	const divElement = await div.elementHandle();
	expect(divElement).toBeTruthy();

	// The div should have specific text content.
	const divContent = await divElement?.innerHTML();
	expect(divContent).toBe('A');

	// The div should not have an `onclick` attribute.
	const divAttribute = await divElement?.getAttribute('onclick');
	expect(divAttribute).toBeNull();
}

test('Sanitize Everything', async ({ page }) => {
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css1) => { document.body = await cssToHtml(css1, { imports: 'include', sanitize: 'all' }); return document.body.outerHTML; }, css);

	await expectEverythingToBeSanitized(page);
});

test('Sanitize Everything By Default', async ({ page }) => {
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css1) => { document.body = await cssToHtml(css1, { imports: 'include' }); return document.body.outerHTML; }, css);

	await expectEverythingToBeSanitized(page);
});
