/*
 * Verify that styles and content will cascade.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
a {
	content: 'https://example.com/';
	border-radius: 5px;
}
a {
	content: 'https://example.com/page';
	border-radius: 10px;
}
`;

test('Cascading', async ({ page }) => {
	await page.addScriptTag({ path: './tests/GeneratorScript.js' });

	const result = await page.evaluate(async (css) => {
		document.body = cssToHtml(css);
		const styleElement = document.createElement('style');
		styleElement.innerText = css;
		document.head.append(styleElement);

		const element = document.body.querySelector('a');
		return element
			&& element.href === 'https://example.com/page'
			&& element.innerHTML === ''
			&& window.getComputedStyle(element).borderRadius === '10px';
	}, css);

	expect(result).toBeDefined();
	expect(result).toBe(true);
});
