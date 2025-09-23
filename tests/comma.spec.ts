/*
 * Verify that combined selectors will be separated correctly.
 */

import { test, expect } from '@playwright/test';
import { evaluate, innerHTML } from './utilities';

const css = `
h1,
p.subtitle,
p.content {
	content: 'A';
}
`;

test('Comma', async ({ page }) => {
	const conditions = async () => {
		await evaluate(page, css);

		// The body should have exactly three direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(3);

		// There should be exactly one heading element,
		// and it should have specific text content.
		const heading = page.locator('h1');
		await expect(heading).toHaveCount(1);
		await expect(innerHTML(heading)).resolves.toBe('A');

		// There should be exactly one element with class `.subtitle`,
		// and it should have specific text content.
		const subtitle = page.locator('.subtitle');
		await expect(subtitle).toHaveCount(1);
		await expect(innerHTML(subtitle)).resolves.toBe('A');

		// There should be exactly one element with class `.content`,
		// and it should have specific text content.
		const content = page.locator('.content');
		await expect(content).toHaveCount(1);
		await expect(innerHTML(content)).resolves.toBe('A');
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
