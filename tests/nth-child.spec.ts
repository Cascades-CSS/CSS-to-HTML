/*
 * Verify that nth-child selectors will be handled correctly.
 */

import { test, expect } from '@playwright/test';
import { cssToHtml } from '../src/index';

const css = `
span:nth-child(5) {
	content: 'A';
}
div.first:first-child {
	content: 'B';
}
span.last:last-child {
	content: 'C';
}
span:nth-child(8) {
	content: 'D';
}
span:last-child {
	content: 'E';
}
span.second-to-last:nth-last-child(2) {
	content: 'F';
}
`;

test('Nth-Child', async ({ page }) => {
	await page.goto('http://localhost:5173/');
	const body = await page.evaluate(async (css) => { document.body = await cssToHtml(css); return document.body.outerHTML; }, css);

	// The body should have exactly eight direct children.
	const bodyDirectChildren = page.locator('body > *');
	expect(await bodyDirectChildren.count()).toBe(8);

	// The body's direct children should be in a specific order.
	const last = page.locator('div.first:first-child + span + span + span + span.last + span + span.second-to-last + span:last-child');
	expect(await last.count()).toBe(1);
	const lastElement = await last.elementHandle();
	expect(lastElement).toBeTruthy();

	// The first element should have specific text content.
	const first = page.locator('div.first:first-child');
	expect(await first.count()).toBe(1);
	const firstElement = await first.elementHandle();
	const firstContent = await firstElement?.innerHTML();
	expect(firstContent).toBe('B');

	// The fifth element should have specific text content.
	const fifth = page.locator('span.last:nth-child(5)');
	expect(await fifth.count()).toBe(1);
	const fifthElement = await fifth.elementHandle();
	const fifthContent = await fifthElement?.innerHTML();
	expect(fifthContent).toBe('C');

	// The seventh element should have specific text content.
	const seventh = page.locator('span.second-to-last:nth-child(7)');
	expect(await seventh.count()).toBe(1);
	const seventhElement = await seventh.elementHandle();
	const seventhContent = await seventhElement?.innerHTML();
	expect(seventhContent).toBe('F');

	// The last element should have specific text content.
	const lastContent = await lastElement?.innerHTML();
	expect(lastContent).toBe('E');
});
