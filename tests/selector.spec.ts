/*
 * Verify that complex selectors will be parsed correctly.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

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
`;

const html = `<body xmlns="http://www.w3.org/1999/xhtml"><div id="cat"></div><div class="mouse"><span class="flea"></span><i></i></div><nav><a class="icon" id="logo"><img src="https://example.com/image2" /></a></nav></body>`;

test('Selector', async ({ page }) => {
	await page.addScriptTag({ path: './dist/Generator.script.js' });

	const result = await page.evaluate(async ([css, html]) => {
		document.body = cssToHtml(css);
		const styleElement = document.createElement('style');
		styleElement.innerText = css;
		document.head.append(styleElement);

		const xml = new XMLSerializer().serializeToString(document.body);

		return xml.trim() === html.trim();
	}, [css, html]);

	expect(result).toBeDefined();
	expect(result).toBe(true);
});
