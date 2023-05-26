/**
 * Generate an HTML document from CSS.
 * @param css The style sheet.
 * @returns An HTML body element containing the generated DOM.
 */
export function cssToHtml(css: CSSRuleList | string): HTMLBodyElement {
	const output = document.createElement('body');
	let styleRules: CSSRuleList | undefined;
	// Parse the CSS string into a CSSOM.
	if (typeof css === 'string') {
		const styleDocument = document.implementation.createHTMLDocument();
		const styleElement = document.createElement('style');
		styleElement.textContent = css;
		styleDocument.body.append(styleElement);
		styleRules = styleElement.sheet?.cssRules;
	} else if (css instanceof CSSRuleList) {
		styleRules = css;
	}

	if (!styleRules) {
		return output;
	}

	// Convert each rule into an HTML element, then add it to the output DOM.
	for (const [index, rule] of Object.entries(styleRules) as [string, (CSSStyleRule | CSSMediaRule)][]) {
		// Skip:
		// - Media rules.
		// - Rules starting with `*`.
		// - Rules including `:`.
		if (
			rule instanceof CSSMediaRule
			|| rule.selectorText.startsWith('*')
			|| rule.selectorText.includes(':')
		) {
			continue;
		}

		// Format any combinators in the rule's selector.
		let selector = rule.selectorText
			.replaceAll(/([\w-])\s+([\w-\.\#])/g, '$1>$2')	// Replace child combinator spaces with `>`.
			.replaceAll(/>{2,}/g, '>')						// Remove excess `>`.
			.replaceAll(' ', '');							// Remove excess spaces.

		// This object describes an element based on pieces of a selector.
		const descriptor = {
			previousElement: undefined as HTMLElement | undefined,
			previousCharacter: '',
			combinator: '',
			addressCharacter: '',
			classes: [''],
			id: '',
			tag: '',
			add: (character: string): void => {
				if (!descriptor.addressCharacter) {
					descriptor.tag += character;
				}
				else if (descriptor.addressCharacter === '.') {
					descriptor.classes[descriptor.classes.length - 1] += character;
				}
				else if (descriptor.addressCharacter === '#') {
					descriptor.id += character;
				}
				descriptor.previousCharacter = character;
			},
			clear: (): void => {
				descriptor.previousCharacter = '';
				descriptor.addressCharacter = '';
				descriptor.classes = [''];
				descriptor.id = '';
				descriptor.tag = '';
			}
		};

		function addElementToOutput (): void {
			// Create the element.
			const newElement = document.createElement(descriptor.tag || 'div');
			// Add the classes.
			for (const c of descriptor.classes) {
				(c && newElement.classList.add(c));
			}
			// Add the ID.
			if (descriptor.id) {
				newElement.id = descriptor.id;
			}
			// Add the new element to the DOM.
			if (descriptor.previousElement) {
				// Child.
				if (descriptor.combinator === '>') {
					descriptor.previousElement.append(newElement);
				}
				// Sibling.
				else {
					descriptor.previousElement.parentElement?.append(newElement);
				}
			}
			else {
				output.append(newElement);
			}
			// Update the descriptor.
			descriptor.previousElement = newElement;
		}

		// For every character in the selector, plus a stop character to indicate the end of the selector.
		for (const character of selector + '%') {
			// The start of a new selector.
			if (!descriptor.previousCharacter) {
				if (/(?:\+|~|>)/.test(character)) {
					descriptor.combinator = character;
				}
				else if (character === '.' || character === '#') {
					descriptor.addressCharacter = character;
				} else {
					descriptor.add(character);
				}
			}
			// The character is alphanumeric.
			else if (/(?:\w|-)/.test(character)) {
				descriptor.add(character);
			}
			// The character is a dot.
			else if (character === '.') {
				descriptor.addressCharacter = character;
				descriptor.classes.push('');
			}
			// The character is a hash.
			else if (character === '#') {
				descriptor.addressCharacter = character;
			}
			// The character is a combinator.
			else if (/(?:\+|~|>)/.test(character)) {
				addElementToOutput();
				descriptor.clear();
				descriptor.combinator = character;
			}
			// The character none of the above.
			else {
				addElementToOutput();
				descriptor.clear();
			}
		}

		// If the rule has a `content` property, populate the element with the specified content appropriately.
		let content = rule.style.content;
		const element = descriptor.previousElement;
		if (content && element) {
			// Strip any quote marks from around the content string.
			if (/(?:'|")/.test(content.charAt(0)) && /(?:'|")/.test(content.charAt(content.length - 1))) {
				content = content.substring(1, content.length - 1);
			}
			// Place the content in the `href` property of anchor elements.
			if (element instanceof HTMLAnchorElement) {
				element.href = content;
			}
			// Place the content in the `src` property of audio, iframe, image, and video elements.
			else if (
				element instanceof HTMLAudioElement
				|| element instanceof HTMLIFrameElement
				|| element instanceof HTMLImageElement
				|| element instanceof HTMLVideoElement
			) {
				element.src = content;
			}
			// Place the content in the `placeholder` property of input and textarea elements.
			else if (
				element instanceof HTMLInputElement
				|| element instanceof HTMLTextAreaElement
			) {
				element.placeholder = content;
			}
			// Use the content as inner-text and place it in the `value` property of option elements.
			else if (element instanceof HTMLOptionElement) {
				element.innerText = content;
				element.value = content;
			}
			// Place the content in the `value` property of select elements.
			else if (element instanceof HTMLSelectElement) {
				element.value = content;
			}
			// Use the content as inner-text for all other elements.
			else {
				element.innerText = content;
			}
		}
	}

	return output;
}
