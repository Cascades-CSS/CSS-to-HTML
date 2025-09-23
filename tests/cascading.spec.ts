/*
 * Verify that content will cascade.
 */

import { test, expect } from '@playwright/test';
import { evaluate, innerHTML } from './utilities';

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
		await evaluate(page, css);

		// The body should have exactly two direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(2);

		// There should be exactly one anchor element,
		// its href attribute should be populated,
		// and it should not have any text content.
		const anchor = page.locator('a');
		await expect(anchor).toHaveCount(1);
		await expect(anchor).toHaveAttribute('href', 'https://example.com/page');
		await expect(innerHTML(anchor)).resolves.toBe('');

		// The element with class `.more` should follow the anchor.
		const more = page.locator('a + .more');
		await expect(more).toHaveCount(1);

		// There should be exactly one span element,
		// and it should have specific text content.
		const span = page.locator('span');
		await expect(span).toHaveCount(1);
		await expect(innerHTML(span)).resolves.toBe('B');
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
