/*
 * Verify that nth-child selectors will be handled correctly.
 */

import { test, expect } from '@playwright/test';
import { evaluate, innerHTML } from './utilities';

const css = `
span:nth-child(5) {
	content: 'A';
}
div.first:first-child {
	content: 'B';
}
span.last:last-child {
	content: 'C';
}
span:nth-child(8) {
	content: 'D';
}
span:last-child {
	content: 'E';
}
span.second-to-last:nth-last-child(2) {
	content: 'F';
}
`;

test('Nth-Child', async ({ page }) => {
	const conditions = async () => {
		await evaluate(page, css);

		// The body should have exactly eight direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(8);

		// The body's direct children should be in a specific order.
		const last = page.locator('div.first:first-child + span + span + span + span.last + span + span.second-to-last + span:last-child');
		await expect(last).toHaveCount(1);

		// The first element should have specific text content.
		const first = page.locator('div.first:first-child');
		await expect(first).toHaveCount(1);
		await expect(innerHTML(first)).resolves.toBe('B');

		// The fifth element should have specific text content.
		const fifth = page.locator('span.last:nth-child(5)');
		await expect(fifth).toHaveCount(1);
		await expect(innerHTML(fifth)).resolves.toBe('C');

		// The seventh element should have specific text content.
		const seventh = page.locator('span.second-to-last:nth-child(7)');
		await expect(seventh).toHaveCount(1);
		await expect(innerHTML(seventh)).resolves.toBe('F');

		// The last element should have specific text content.
		await expect(innerHTML(last)).resolves.toBe('E');
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
