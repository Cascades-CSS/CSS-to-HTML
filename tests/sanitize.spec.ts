/*
 * Verify that DOM sanitization is working.
 */

// TODO: Make these tests more comprehensive. They should cover a wider range of sanitization cases.

import { test, expect, type Page } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
@import url('http://localhost:5173/import4.css');
div.last[onclick="console.log('foo')"] {
	content: 'A';
}
`;

test('Sanitization Off', async ({ page }) => {
	const consoleMessages = new Array<string>();
	page.on('console', message => consoleMessages.push(message.text()));

	const conditions = async () => {
		const body = await page.evaluate(async css => { document.body = await cssToHtml(css, { imports: 'include', sanitize: 'off' }); return document.body.outerHTML; }, css);

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

		// The img should have an `onerror` attribute.
		const imgAttribute = await imgElement?.getAttribute('onerror');
		expect(imgAttribute).toBeDefined();
		expect(imgAttribute?.length).toBeGreaterThan(10);

		// The img should have an `xss` class.
		const imgClass = await imgElement?.getAttribute('class');
		expect(imgClass).toBe('xss');

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

		// An 'xss' console message should be present.
		expect(consoleMessages.includes('xss')).toBe(true);
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});

test('Sanitize Imports Only', async ({ page }) => {
	const consoleMessages = new Array<string>();
	page.on('console', message => consoleMessages.push(message.text()));

	const conditions = async () => {
		const body = await page.evaluate(async css => { document.body = await cssToHtml(css, { imports: 'include', sanitize: 'imports' }); return document.body.outerHTML; }, css);

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

		// The img should not have an `onerror` attribute.
		const imgAttribute = await imgElement?.getAttribute('onerror');
		expect(imgAttribute).toBeNull();

		// The img should not have an `xss` class.
		const imgClass = await imgElement?.getAttribute('class');
		expect(imgClass).toBeNull();

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

		// An 'xss' console message should not be present.
		expect(consoleMessages.includes('xss')).toBe(false);
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
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

	// The img should not have an `onerror` attribute.
	const imgAttribute = await imgElement?.getAttribute('onerror');
	expect(imgAttribute).toBeNull();

	// The img should not have an `xss` class.
	const imgClass = await imgElement?.getAttribute('class');
	expect(imgClass).toBeNull();

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
	const consoleMessages = new Array<string>();
	page.on('console', message => consoleMessages.push(message.text()));

	const conditions = async () => {
		const body = await page.evaluate(async css => { document.body = await cssToHtml(css, { imports: 'include', sanitize: 'all' }); return document.body.outerHTML; }, css);
	
		await expectEverythingToBeSanitized(page);
	
		// An 'xss' console message should not be present.
		expect(consoleMessages.includes('xss')).toBe(false);
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});

test('Sanitize Everything By Default', async ({ page }) => {
	const consoleMessages = new Array<string>();
	page.on('console', message => consoleMessages.push(message.text()));

	const conditions = async () => {
		const body = await page.evaluate(async css => { document.body = await cssToHtml(css, { imports: 'include' }); return document.body.outerHTML; }, css);

		await expectEverythingToBeSanitized(page);

		// An 'xss' console message should not be present.
		expect(consoleMessages.includes('xss')).toBe(false);
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
