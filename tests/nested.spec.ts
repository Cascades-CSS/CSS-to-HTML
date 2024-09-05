/*
 * Verify that nested selectors will be parsed correctly.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
nav > a#logo.icon img {
	content: 'https://example.com/image';
}
nav a#logo.icon > img {
	content: 'https://example.com/image2';
	display: block;
}
nav input[type="text"].search[readonly] {
	content: 'Search';
}

main {
	content: 'A';
}
main section {
	content: 'B';
}
main section .foo {
	content: 'C';
}
main section * {
	content: 'D';
}
main section :is(aside) > p {
	content: 'E';
}
`;

const nestedCss = `
nav > a#logo.icon img {
	content: 'https://example.com/image';
}
nav a#logo.icon {
	border-radius: 5px;

	& > img {
		content: 'https://example.com/image2';
		display: block;
	}
}
nav {
	& input[type="text"].search[readonly] {
		content: 'Search';
	}
}

main {
	content: 'A';

	& section {
		content: 'B';

		.foo {
			content: 'C';
		}

		& * {
			content: 'D';
		}
	}

	:is(aside) {
		& > p {
			content: 'E';
		}
	}
}
`;

const html = `<body><nav><a href="" class="icon" id="logo"><img src="https://example.com/image2"></a><input placeholder="Search" readonly="" type="text" class="search"></nav><main>A<section>B<div class="foo">C</div></section></main></body>`;

test('Nested', async ({ page }) => {
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css) => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);
	const nestedBody = await page.evaluate(async (css) => { document.body = await cssToHtml(css); return document.body.outerHTML; }, nestedCss);

	expect(body).toBe(html);
	expect(nestedBody).toBe(html);
});
