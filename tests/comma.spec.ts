/*
 * Verify that combined selectors will be separated correctly.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
h1,
p.subtitle,
p.content {
	content: 'a';
}
`;

test('Comma', async ({ page }) => {
	await page.addScriptTag({ path: './tests/GeneratorScript.js' });

	const result = await page.evaluate(async (css) => {
		document.body = cssToHtml(css);

		return document.body.querySelector('h1')?.innerHTML === 'a'
			&& document.body.querySelector('p.subtitle')?.innerHTML === 'a'
			&& document.body.querySelector('p.content')?.innerHTML === 'a';
	}, css);

	expect(result).toBeDefined();
	expect(result).toBe(true);
});
