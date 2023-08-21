/*
 * Verify that remote style sheets can be imported.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
@import url('https://cascades.app/project/wBcGlZUV.css');
div.last {
	content: 'a';
}
`;

test('Import', async ({ page }) => {
	await page.addScriptTag({ path: './dist/Generator.script.js' });

	page.on('console', msg => console.log(msg.text()));

	const result = await page.evaluate(async (css) => {
		document.body = await cssToHtml(css);

		const element = document.body.querySelector('div.last');
		return element
			&& element.innerHTML === 'a'
			&& element.previousElementSibling !== null
			&& element.previousElementSibling.innerHTML === 'Test'
			&& element.nextSibling === null;
	}, css);

	expect(result).toBeDefined();
	expect(result).toBe(true);
});
