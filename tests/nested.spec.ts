/*
 * Verify that nested selectors will be parsed correctly.
 */

import { test, expect } from '@playwright/test';
import { evaluate, innerHTML } from './utilities';

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

test('Nested', async ({ page }) => {
	const conditions = async () => {
		// The body should have exactly two direct children.
		const bodyDirectChildren = page.locator('body > *');
		await expect(bodyDirectChildren).toHaveCount(2);

		// The body's direct children should be in a specific order.
		const last = page.locator('body > nav + main:last-child');
		await expect(last).toHaveCount(1);

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

		// There should only be one div on the page.
		const divs = page.locator('div');
		await expect(divs).toHaveCount(1);

		// The div with class `.foo` should have specific text content.
		const div = page.locator('nav + main > section > div.foo');
		await expect(div).toHaveCount(1);
		await expect(innerHTML(div)).resolves.toBe('C');
	};

	const tests = async () => {
		const body = await evaluate(page, css);
		await conditions();

		const nestedBody = await evaluate(page, nestedCss);
		await conditions();

		// The outer HTML produced by both inputs should match.
		expect(body).toBe(nestedBody);
	};

	// Bundle.
	await page.goto('http://localhost:5173/');
	await tests();

	// Static.
	await page.goto('http://localhost:5173/static');
	await tests();
});
