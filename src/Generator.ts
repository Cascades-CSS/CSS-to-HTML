type Combinator = '>' | '~' | '+';

interface Options {
	duplicates?: 'preserve' | 'remove';
	fill?: 'fill' | 'no-fill'
}

/**
 * Generate an HTML document from CSS.
 * @param css The style sheet.
 * @returns An HTML body element containing the generated DOM.
 */
export function cssToHtml(css: CSSRuleList | string, options: Options = {}): HTMLBodyElement {
	const output = document.createElement('body');
	const fillerElements = [] as HTMLElement[];
	function isFillerElement (element: HTMLElement | Element): boolean {
		for (const element of fillerElements) {
			if (element.isSameNode(element)) {
				return true;
			}
		}
		return false;
	}
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
		// - Non-style rules.
		// - Rules including `*`.
		// - Rules including `:` (that aren't `nth-child` or `nth-of-type`).
		if (
			!(rule instanceof CSSStyleRule)
			|| rule.selectorText.includes('*')
			|| (rule.selectorText.includes(':')
				&& !rule.selectorText.includes(':first-child')
				&& !rule.selectorText.includes(':nth-child')
				&& !rule.selectorText.includes(':last-child')
				&& !rule.selectorText.includes(':first-of-type')
				&& !rule.selectorText.includes(':nth-of-type')
				&& !rule.selectorText.includes(':last-of-type')
			)
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
			combinator: '' as '' | Combinator,
			addressCharacter: '' as '' | '.' | '#',
			classes: [''],
			id: '',
			tag: '',
			position: {
				type: '' as 'child' | 'type',
				index: 0
			},
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
			},
			matchesElement: (element: Element): boolean => {
				const descriptorTag = (descriptor.tag.toUpperCase() || 'DIV');
				const descriptorClasses = descriptor.classes.filter((c) => Boolean(c));
				// Compare tag, id, and classlist length.
				if (
					element.tagName !== descriptorTag
					|| element.id !== descriptor.id
					|| element.classList.length !== descriptorClasses.length
				) {
					return false;
				}
				// Compare classlists.
				const differingClasses = descriptorClasses.filter((c) => !element.classList.contains(c));
				return !differingClasses.length;
			}
		};

		function addElementToOutput (): void {
			if (options.duplicates !== 'preserve') {
				// If an identical element already exists, skip adding the new element.
				const existingElements = Array.from(
					(descriptor.combinator === '>' ?
					descriptor.previousElement?.children :
					descriptor.previousElement?.parentElement?.children) ?? output.children
				);
				const matchingElement = existingElements.find((element) => descriptor.matchesElement(element));
				if (matchingElement) {
					// Reference the matching element so properties such as `content` can cascade.
					descriptor.previousElement = matchingElement as HTMLElement;
					return;
				}
			}
			// Create the new element.
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

		function addElementToOutputWithFill (childType: 'child' | 'type', fillType: 'first' | 'nth' | 'last', fillAmount: number): void {
			const desiredIndex = fillAmount - 1;

			// Create the new element.
			const newElement = document.createElement(descriptor.tag || 'div');
			// Add the classes.
			for (const c of descriptor.classes) {
				(c && newElement.classList.add(c));
			}
			// Add the ID.
			if (descriptor.id) {
				newElement.id = descriptor.id;
			}

			// Get a reference to the parent element.
			let parentElement = undefined as HTMLElement | undefined;
			if (descriptor.previousElement) {
				if (descriptor.combinator === '>') {
					parentElement = descriptor.previousElement;
				} else {
					parentElement = descriptor.previousElement.parentElement ?? output;
				}
			} else {
				parentElement = output;
			}

			if (!parentElement) {
				return;
			}

			// Update the descriptor.
			descriptor.previousElement = newElement;

			if (fillType === 'first') {
				parentElement.prepend(newElement);
				return;
			}

			if (fillType === 'last') {
				parentElement.append(newElement);
				return;
			}

			// Check if there is a sibling element in the desired position.
			const blockingSibling = parentElement.querySelector(childType === 'type' ? `${newElement.tagName}:nth-of-type(${fillAmount})` : `:nth-child(${fillAmount})`);
			if (blockingSibling) {
				parentElement.insertBefore(newElement, blockingSibling);
				if (isFillerElement(blockingSibling)) {
					blockingSibling.remove();
				}
				return;
			}

			// Add the element to the DOM.
			parentElement.append(newElement);

			if (options.fill !== 'no-fill') {
				// Count the previous siblings.
				let previousSiblings = 0;
				let previousSibling = newElement.previousElementSibling;
				while (previousSibling && previousSiblings < desiredIndex) {
					previousSibling = previousSibling?.previousElementSibling;
					if (childType === 'type' && previousSibling?.tagName !== newElement.tagName) {
						continue;
					}
					previousSiblings++;
				}

				// Fill duplicate elements up to the desired position.
				const duplicatesRequired = desiredIndex - previousSiblings;
				for (let i = 0; i < duplicatesRequired; i++) {
					// Create the duplicate element.
					const duplicateElement = newElement.cloneNode() as HTMLElement;
					// Remove the ID.
					duplicateElement.removeAttribute('id');
					// Make a note of the duplicate element.
					fillerElements.push(duplicateElement);
					// Add the duplicate element to the DOM.
					parentElement.insertBefore(duplicateElement, newElement);
				}
			}
		}

		// For every character in the selector, plus a stop character to indicate the end of the selector.
		selector += '%';
		for (let i = 0; i < selector.length; i++) {
			const character = selector[i];
			// The start of a new selector.
			if (!descriptor.previousCharacter) {
				if (/(?:\+|~|>)/.test(character)) {
					descriptor.combinator = character as Combinator;
				} else if (character === '.' || character === '#') {
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
				descriptor.combinator = character as Combinator;
			}
			// The character is a colon.
			else if (character === ':') {
				const nthSelector = selector.substring(i + 1);
				const pseudoSelector =
					/^(first-child|first-of-type)/i.exec(nthSelector)
					?? /^(nth-child|nth-of-type)\(([0-9]+)\)/i.exec(nthSelector)
					?? /^(last-child|last-of-type)/i.exec(nthSelector);
				if (pseudoSelector) {
					const childType = pseudoSelector[1].includes('type') ? 'type' : 'child';
					const fillType = pseudoSelector[1].split('-')[0] as 'first' | 'nth' | 'last';
					addElementToOutputWithFill(childType, fillType, parseInt(pseudoSelector[2]) || 0);
					i += pseudoSelector[0].length;
				}
				descriptor.clear();
			}
			// The character is none of the above.
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
