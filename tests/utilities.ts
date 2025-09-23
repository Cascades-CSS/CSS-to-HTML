import type { Locator, Page } from "@playwright/test";
import { cssToHtml } from '../src/index';

/**
 * Evaluate the `cssToHtml` function against a given CSS string.
 * @returns The generated `body` element's outer HTML.
 */
export async function evaluate(page: Page, css: string, options?: Parameters<typeof cssToHtml>[1]): Promise<string> {
	const args = [css, options] as const;
	const body = await page.evaluate(async ([css, options]) => {
		document.body = await cssToHtml(css, options);
		return document.body.outerHTML;
	}, args);
	return body;
}

/** Retrieve the inner HTML content of a given locator. */
export async function innerHTML(locator: Locator): Promise<string | undefined> {
	const handle = await locator.elementHandle();
	const content = await handle?.innerHTML();
	return content;
}
