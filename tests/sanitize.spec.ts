/*
 * Verify that DOM sanitization is working.
 */

// TODO: Make these tests more comprehensive. They should cover a wider range of sanitization cases.

import { test, expect, type Page } from '@playwright/test';
import { evaluate, innerHTML } from './utilities';

const css = `
@import url('http://localhost:5173/import4.css');
div.last[onclick="console.log('foo')"] {
	content: 'A';
}
`;

test('Sanitization Off', async ({ page }) => {
	const conditions = async () => {
		const consoleMessages = new Array<string>();
		page.on('console', message => consoleMessages.push(message.text()));

		await evaluate(page, css, { imports: 'include', sanitize: 'off' });

		// The body should have exactly two direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(2);

		// The body's direct children should be in a specific order.
		const last = page.locator('body > img:first-child + .last:last-child');
		await expect(last).toHaveCount(1);

		// There should be exactly one img element.
		const img = page.locator('img');
		await expect(img).toHaveCount(1);

		// The img should have an `onerror` attribute, and an `xss` class.
		await expect(img).toHaveAttribute('onerror', /.{10}/);
		await expect(img).toHaveClass('xss');

		// There should be exactly one div element,
		// and it should have specific text content.
		const div = page.locator('div');
		await expect(div).toHaveCount(1);
		await expect(innerHTML(div)).resolves.toBe('A');

		// The div should have an `onclick` attribute.
		await expect(div).toHaveAttribute('onclick', 'console.log(\'foo\')');

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
	const conditions = async () => {
		const consoleMessages = new Array<string>();
		page.on('console', message => consoleMessages.push(message.text()));

		await evaluate(page, css, { imports: 'include', sanitize: 'imports' });

		// The body should have exactly two direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(2);

		// The body's direct children should be in a specific order.
		const last = page.locator('body > img:first-child + .last:last-child');
		await expect(last).toHaveCount(1);

		// There should be exactly one img element.
		const img = page.locator('img');
		await expect(img).toHaveCount(1);

		// The img should not have an `onerror` attribute, nor an `xss` class.
		await expect(img).not.toHaveAttribute('onerror');
		await expect(img).not.toHaveClass('xss');

		// There should be exactly one div element,
		// and it should have specific text content.
		const div = page.locator('div');
		await expect(div).toHaveCount(1);
		await expect(innerHTML(div)).resolves.toBe('A');

		// The div should have an `onclick` attribute.
		await expect(div).toHaveAttribute('onclick', 'console.log(\'foo\')');

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
	await expect(bodyDirectChildren).toHaveCount(2);

	// The body's direct children should be in a specific order.
	const last = page.locator('body > img:first-child + .last:last-child');
	await expect(last).toHaveCount(1);

	// There should be exactly one img element.
	const img = page.locator('img');
	await expect(img).toHaveCount(1);

	// The img should not have an `onerror` attribute, nor an `xss` class.
	await expect(img).not.toHaveAttribute('onerror');
	await expect(img).not.toHaveClass('xss');

	// There should be exactly one div element,
	// and it should have specific text content.
	const div = page.locator('div');
	await expect(div).toHaveCount(1);
	await expect(innerHTML(div)).resolves.toBe('A');

	// The div should not have an `onclick` attribute.
	await expect(div).not.toHaveAttribute('onclick');
}

test('Sanitize Everything', async ({ page }) => {
	const conditions = async () => {
		const consoleMessages = new Array<string>();
		page.on('console', message => consoleMessages.push(message.text()));

		await evaluate(page, css, { imports: 'include', sanitize: 'all' });
	
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
	const conditions = async () => {
		const consoleMessages = new Array<string>();
		page.on('console', message => consoleMessages.push(message.text()));

		await evaluate(page, css, { imports: 'include' });

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
