/*
 * Verify that `:root`, `*`, etc are ignored correctly.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
@import url('https://example.com/example.css');
:root {
	background: #000;
}
* {
	content: 'a';
	box-sizing: border-box;
}
@media screen and (max-width: 200px) {}
div {
	content: 'a';
}
div:hover {
	content: 'b';
}
`;

test('Ignored', async ({ page }) => {
	await page.addScriptTag({ path: './dist/Generator.script.js' });

	const result = await page.evaluate(async (css) => {
		document.body = await cssToHtml(css);

		const element = document.body.querySelector('div');
		return element
			&& element.innerHTML === 'a'
			&& element.previousSibling === null
			&& element.nextSibling === null;
	}, css);

	expect(result).toBeDefined();
	expect(result).toBe(true);
});
