/*
 * Verify that complex selectors will be parsed correctly.
 */

import { test, expect } from '@playwright/test';
import { evaluate } from './utilities';

const css = `
#cat + .mouse  >span.flea+i {
	padding: 10px;
	background-color: red;
}
nav    a#logo.icon> img {
	content: 'https://example.com/image';
	display: block;
}
nav>a#logo.icon > img {
	content: 'https://example.com/image2';
}
nav input[type="text"].search[readonly] {
	content: 'Search';
}
`;

test('Selector', async ({ page }) => {
	const conditions = async () => {
		await evaluate(page, css);

		// The body should have exactly three direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(3);

		// The body's direct children should be in a specific order.
		const last = page.locator('body > div#cat + div.mouse + nav:last-child');
		await expect(last).toHaveCount(1);

		// The div with class `.mouse` should have exactly two children.
		const mouse = page.locator('.mouse > span.flea:first-child + i:last-child');
		await expect(mouse).toHaveCount(1);

		// The anchor should have an empty link.
		const anchor = page.locator('nav > a#logo.icon');
		await expect(anchor).toHaveCount(1);
		await expect(anchor).toHaveAttribute('href', '');

		// The image should have a specific src.
		const image = anchor.locator('> img');
		await expect(image).toHaveCount(1);
		await expect(image).toHaveAttribute('src', 'https://example.com/image2');

		// The input should follow the anchor, and have specific attributes.
		const input = anchor.locator('+ input.search');
		await expect(input).toHaveCount(1);
		await expect(input).toHaveAttribute('placeholder', 'Search');
		await expect(input).toHaveAttribute('readonly', '');
		await expect(input).toHaveAttribute('type', 'text');
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
