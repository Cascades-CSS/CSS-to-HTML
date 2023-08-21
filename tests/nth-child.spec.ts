/*
 * Verify that nth-child selectors will be handled correctly.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
span:nth-child(10) {
	color: red;
}
div.first:first-child {
	content: 'a';
}
span.last:last-child {
	content: 'b';
}
span:last-child {
	content: 'c';
}
`;

test('Nth-Child', async ({ page }) => {
	await page.addScriptTag({ path: './dist/Generator.script.js' });

	const result = await page.evaluate(async (css) => {
		document.body = await cssToHtml(css);

		return document.body.querySelectorAll('*').length === 10
			&& document.body.querySelector('div.first')?.previousElementSibling === null
			&& document.body.querySelector('div.first')?.innerHTML === 'a'
			&& document.body.querySelector('span.last')?.nextElementSibling === null
			&& document.body.querySelector('span.last')?.innerHTML === 'c';
	}, css);

	expect(result).toBeDefined();
	expect(result).toBe(true);
});
