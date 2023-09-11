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
nav input[type="text"].search[readonly] {
	content: 'Search';
}
`;

const html = `<body><div id="cat"></div><div class="mouse"><span class="flea"></span><i></i></div><nav><a id="logo" class="icon" href=""><img src="https://example.com/image2"></a><input class="search" type="text" readonly="" placeholder="Search"></nav></body>`;

test('Selector', async ({ page }) => {
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css) => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);

	expect(body).toBe(html);
});
