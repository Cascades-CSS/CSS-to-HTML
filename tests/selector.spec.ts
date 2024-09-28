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

const html = `<body><div id="cat"></div><div class="mouse"><span class="flea"></span><i></i></div><nav><a href="" class="icon" id="logo"><img src="https://example.com/image2"></a><input placeholder="Search" readonly="" type="text" class="search"></nav></body>`;

test('Selector', async ({ page }) => {
	const conditions = async () => {
		const body = await page.evaluate(async css => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);

		expect(body).toBe(html);
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await conditions();

	// Static.
	await page.goto('http://localhost:5173/static');
	await conditions();
});
