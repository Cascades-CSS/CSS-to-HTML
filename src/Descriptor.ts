import type { AstRule } from 'css-selector-parser';
import { replaceTextNode } from './Utility.js';

/**
 * Valid positioning pseudo classes.
 */
const positioningPseudoClasses = [
	'first-child',
	'nth-child',
	'nth-last-child',
	'last-child',
	'first-of-type',
	'nth-of-type',
	'nth-last-of-type',
	'last-of-type'
];

/**
 * Parse the position formula of `nth` pseudo classes.
 * 
 * Position formulae are expressed as `an + b`, where `a` and `b` are either `0` or positive integers.
 * @param a
 * @param b
 * @returns A positive integer representing the desired position of the selector, or `false` if the position is invalid.
 */
function parsePositionFormula (a: number, b: number): number | false {
	// Invalid.
	if (a < 0 || b < 0) {
		return false;
	}
	// Invalid.
	if (!Number.isInteger(a) || !Number.isInteger(b)) {
		return false;
	}
	// Valid, return `b`.
	if (a === 0) {
		return b;
	}
	return false;
	// TODO: Add a case for when both `a` and `b` are positive.
}

/**
 * Describes an element based on pieces of a selector.
 */
export class Descriptor {
	public rule: AstRule;
	public element: HTMLElement;
	public combinator = '';
	public position = {
		explicit: false,
		from: 'end' as 'start' | 'end',
		index: 1,
		type: 'child' as 'child' | 'type'
	};
	public invalid = false;
	private rawContent = '';

	constructor (rule: AstRule, content?: string) {
		this.rule = rule;

		// Create the element.
		let tag = 'div';
		if (rule.tag?.type === 'TagName') {
			tag = rule.tag.name;
		} else if (rule.tag?.type === 'WildcardTag') {
			this.invalid = true;
		}
		this.element = document.createElement(tag);

		// Check for pseudo elements.
		if (rule.pseudoElement) {
			this.invalid = true;
		}

		if (this.invalid) return;

		// Set the IDs.
		if (rule.ids) {
			this.element.id = rule.ids.join(' ');
		}

		// Set the classes.
		if (rule.classNames) {
			this.element.className = rule.classNames.join(' ');
		}

		// Set the attributes.
		if (rule.attributes) {
			for (const attribute of rule.attributes) {
				let value = '';
				if (attribute.value?.type === 'String') {
					value = attribute.value.value;
				}
				this.element.setAttribute(attribute.name, value);
			}
		}

		// Set the content.
		if (content) {
			this.content = content;
		}

		// Set the combinator.
		this.combinator = rule.combinator ?? ' ';

		// Set the position.
		if (rule.pseudoClasses && rule.pseudoClasses.length > 0) {
			const pseudoClass = rule.pseudoClasses[0];
			this.invalid = this.invalid || rule.pseudoClasses.length > 1 || !positioningPseudoClasses.includes(pseudoClass.name);
			if (this.invalid) return;
			this.position.explicit = true;
			this.position.from = pseudoClass.name.includes('last') ? 'end' : 'start';
			this.position.type = pseudoClass.name.includes('type') ? 'type' : 'child';
			if (pseudoClass.name.includes('nth')) {
				const position = pseudoClass.argument?.type === 'Formula' && parsePositionFormula(pseudoClass.argument.a, pseudoClass.argument.b);
				if (position) {
					this.position.index = position;
				} else {
					this.invalid = true;
					return;
				}
			}
		}
	}

	/**
	 * The content of the element.
	 */
	public get content (): string {
		return this.rawContent;
	}

	public set content (value: string) {
		this.rawContent = value;
		// Strip any quote marks from around the content string.
		if (/(?:'|")/.test(value.charAt(0)) && /(?:'|")/.test(value.charAt(value.length - 1))) {
			value = value.substring(1, value.length - 1);
		}
		// Place the content in the `href` property of anchor elements.
		if (this.element instanceof HTMLAnchorElement) {
			this.element.href = value;
		}
		// Place the content in the `src` property of audio, iframe, image, and video elements.
		else if (
			this.element instanceof HTMLAudioElement
			|| this.element instanceof HTMLIFrameElement
			|| this.element instanceof HTMLImageElement
			|| this.element instanceof HTMLVideoElement
		) {
			this.element.src = value;
		}
		// Place the content in the `placeholder` property of input and textarea elements.
		else if (
			this.element instanceof HTMLInputElement
			|| this.element instanceof HTMLTextAreaElement
		) {
			this.element.placeholder = value;
		}
		// Use the content as inner-text and place it in the `value` property of option elements.
		else if (this.element instanceof HTMLOptionElement) {
			replaceTextNode(this.element, value);
			this.element.value = value;
		}
		// Place the content in the `value` property of select elements.
		else if (this.element instanceof HTMLSelectElement) {
			this.element.value = value;
		}
		// Use the content as inner-text for all other elements.
		else {
			replaceTextNode(this.element, value);
		}
	}

	/**
	 * A selector string suitable for selecting similar sibling elements.
	 */
	public get siblingSelector (): string {
		let selector = ':scope > ';
		selector += this.position.type === 'type' ? this.element.tagName : '*';
		selector += ':nth';
		selector += this.position.from === 'end' ? '-last' : '';
		selector += this.position.type === 'type' ? '-of-type' : '-child';
		selector += `(${this.position.index})`;
		return selector;
	}
}
