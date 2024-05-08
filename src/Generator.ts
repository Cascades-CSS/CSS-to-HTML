import { createParser } from 'css-selector-parser';
import type { AstRule, AstSelector } from 'css-selector-parser';
import * as DOMPurify from 'dompurify';
import { Descriptor } from './Descriptor.js';
import { createCSSOM, elementsAreComparable, mergeElements } from './Utility.js';

export class Options {
	duplicates?: 'preserve' | 'remove';
	fill?: 'fill' | 'no-fill';
	imports?: 'include' | 'style-only';
	mergeNth?: 'merge' | 'no-merge';
	sanitize?: 'all' | 'imports' | 'off';
}

const parse = createParser({ syntax: 'progressive' });

class Rule {
	rule: CSSStyleRule;
	selectorAst: AstSelector;

	constructor (rule: CSSStyleRule) {
		this.rule = rule;
		this.selectorAst = parse(rule.selectorText);
	}
}

/**
 * Generate an HTML document from CSS.
 * @param css The style sheet.
 * @param options `(Optional)` Options with which to configure the generator.
 * @returns An HTML body element containing the generated DOM.
 */
export async function cssToHtml (css: CSSRuleList | string, options: Options = {}): Promise<HTMLBodyElement> {
	const output = document.createElement('body');

	const fillerElements = new Array<HTMLElement>();
	function isFillerElement (element: HTMLElement | Element): boolean {
		return Boolean(fillerElements.find((fillerElement) => element.isSameNode(fillerElement)));
	}

	// Parse the CSS string into a CSSOM.
	let styleRules = createCSSOM(css);
	if (!styleRules) {
		console.warn('Failed to construct style rules. HTML will be incomplete.');
		return output;
	}

	// Parse the CSSOM into individual rules.
	const rules = new Array<Rule>();
	const importSet = new Set<string>();
	
	async function parseRules (source: CSSRuleList, urlBase: string): Promise<void> {
		let seenStyleRule = false;
		for (const rule of Object.values(source!)) {
			if (rule instanceof CSSStyleRule) {
				seenStyleRule = true;
				rules.push(new Rule(rule));
			}
			// Fetch the content of imported stylesheets.
			else if (rule instanceof CSSImportRule && !seenStyleRule && options.imports === 'include') {
				const url = new URL(rule.href, urlBase);
				if (url.pathname.endsWith('.css') && !importSet.has(url.href)) {
					importSet.add(url.href);
					const resource = await fetch(url.href);
					if (resource.status !== 200) throw new Error(`Response status for stylesheet "${url.href}" was ${resource.status}.`);
					const text = await resource.text();
					const importedRule = createCSSOM(text);
					if (importedRule) await parseRules(importedRule, url.href);
				}
			}
		}
	}
	await parseRules(styleRules, window.location.href);

	// Populate the DOM.
	for (const { rule, selectorAst } of rules) {
		// Traverse each rule nest of the selector AST.
		for (const r of selectorAst.rules) {
			const nest = new Array<Descriptor>();
			let invalidNest = false;
			// Create a descriptor for each of the nested selectors.
			let next: AstRule | undefined = r;
			do {
				const descriptor = new Descriptor(next);
				if (descriptor.invalid) {
					invalidNest = true;
					next = undefined;
					break;
				}
				nest.push(descriptor);
				next = next.nestedRule;
			} while (next);
			// Skip this nest if it contains any invalid descriptors.
			if (invalidNest) continue;
			// Set the content of the last descriptor in the nest.
			const content = rule.style.content;
			nest[nest.length - 1].content = content;
			// Add each descriptor in the nest to the DOM.
			let nestIndex = 0;
			for (const descriptor of nest) {
				// Get a reference to the appropriate parent element.
				let parent: HTMLElement = output;
				if (nestIndex <= 0) {
					parent = output;
				} else if (descriptor.combinator === '~' || descriptor.combinator === '+') {
					parent = nest[nestIndex - 1].element.parentElement ?? output;
				} else if (descriptor.combinator === '>' || descriptor.combinator === ' ') {
					parent = nest[nestIndex - 1].element;
				}
				// Attach the element to the parent.
				if (descriptor.position.explicit) {
					const fromStart = descriptor.position.from === 'start';
					// Check if there is a sibling element in the desired position.
					let previousSiblings = 0;
					let previousSiblingsNeedCounting = true;
					const blockingSibling = parent.querySelector(descriptor.siblingSelector);
					if (blockingSibling) {
						const target = fromStart ? blockingSibling : blockingSibling.nextElementSibling;
						if (isFillerElement(blockingSibling)) {
							parent.insertBefore(descriptor.element, target);
							blockingSibling.remove();
						} else if (options.mergeNth !== 'no-merge' && mergeElements(descriptor.element, blockingSibling)) {
							descriptor.element = blockingSibling as HTMLElement;
							descriptor.content = descriptor.content;
						} else {
							parent.insertBefore(descriptor.element, target);
						}
						previousSiblings = 0;
					} else if (descriptor.position.index > 1) {
						previousSiblings = parent.childElementCount;
						previousSiblingsNeedCounting = false;
						parent[fromStart ? 'append' : 'prepend'](descriptor.element);
					} else {
						parent[fromStart ? 'prepend' : 'append'](descriptor.element);
					}
					// Fill duplicate elements if required.
					if (descriptor.position.explicit && options.fill !== 'no-fill') {
						const desiredIndex = descriptor.position.index - 1;
						// Count the previous siblings.
						if (previousSiblingsNeedCounting) {
							let previousSibling = descriptor.element[fromStart ? 'previousElementSibling' : 'nextElementSibling'];
							while (previousSibling && previousSiblings < desiredIndex) {
								previousSibling = previousSibling?.[fromStart ? 'previousElementSibling' : 'nextElementSibling'];
								if (descriptor.position.type === 'type' && previousSibling?.tagName !== descriptor.element.tagName) {
									continue;
								}
								previousSiblings++;
							}
						}
						// Fill duplicate elements up to the desired position.
						const duplicatesRequired = desiredIndex - previousSiblings;
						for (let i = 0; i < duplicatesRequired; i++) {
							// Create the duplicate element.
							const duplicateElement = descriptor.element.cloneNode();
							if (!(duplicateElement instanceof HTMLElement)) continue;
							// Remove the ID.
							duplicateElement.removeAttribute('id');
							// Make a note of the duplicate element.
							fillerElements.push(duplicateElement);
							// Add the duplicate element to the DOM.
							parent.insertBefore(duplicateElement, fromStart ? descriptor.element : descriptor.element.nextElementSibling);
						}
					}
				} else {
					if (options.duplicates !== 'preserve') {
						// If an identical element already exists, skip adding the new element.
						const existingElements = Array.from(parent.children);
						const matchedElement = existingElements.find((element) => elementsAreComparable(descriptor.element, element));
						if (matchedElement instanceof HTMLElement && mergeElements(descriptor.element, matchedElement)) {
							// Reference the matching element so properties such as `content` can cascade.
							descriptor.element = matchedElement;
							descriptor.content = descriptor.content;
						} else {
							parent.append(descriptor.element);
						}
					} else {
						parent.append(descriptor.element);
					}
				}
				nestIndex++;
			}
		}
	}

	if (options.sanitize === 'all') {
		const cleanHtml = DOMPurify.sanitize(output, { RETURN_DOM: true });
		if (cleanHtml instanceof HTMLBodyElement) return cleanHtml;
		const body = document.createElement('body');
		body.append(cleanHtml);
		return body;
	}

	return output;
}
