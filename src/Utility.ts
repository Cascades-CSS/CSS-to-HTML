import DOMPurify from 'dompurify';

/**
 * Create a CSS Object Model from a string of CSS.
 * @param css The CSS string.
 * @returns The CSSOM.
 */
export function createCSSOM (css: CSSRuleList | string): CSSRuleList | undefined {
    if (css instanceof CSSRuleList) return css;
	if (typeof css !== 'string') return undefined;
    const styleDocument = document.implementation.createHTMLDocument();
    const styleElement = document.createElement('style');
    styleElement.textContent = css;
    styleDocument.body.append(styleElement);
    return styleElement.sheet?.cssRules;
}

/**
 * Compare two HTML elements, returning `true` if the elements "match".
 * @param a An element.
 * @param b Another element.
 * @returns `true` if the elements are comparable, `false` if not.
 */
export function elementsAreComparable (a: HTMLElement | Element, b: HTMLElement | Element): boolean {
    // Compare tag, id, type attribute, and class list length.
    if (
        a.tagName.toLowerCase() !== b.tagName.toLowerCase()
        || a.id !== b.id
        || a.classList.length !== b.classList.length
    ) {
        return false;
    }
    // Compare type attributes.
    // Compare class lists.
    let differingClasses = 0;
    a.classList.forEach((c) => {
        if (!b.classList.contains(c)) {
            differingClasses++;
        }
    });
    return differingClasses === 0;
}

/**
 * Merge two HTML elements in-place.
 * @param source The element to copy properties from.
 * @param destination The element to merge the copied properties into.
 * @returns A reference to the destination element, or `null` if the elements cannot be merged.
 */
export function mergeElements <T extends HTMLElement | Element> (source: HTMLElement | Element, destination: T): T | null {
	if (source.tagName !== destination.tagName) return null;
	if (source.id && destination.id && source.id !== destination.id) return null;
	if (source.id) {
		destination.id = source.id;
	}
	const mergeFromType = source.getAttribute('type');
	const mergeToType = destination.getAttribute('type');
	if (mergeFromType && mergeToType && mergeFromType !== mergeToType) return null;
	if (mergeFromType) {
		destination.setAttribute('type', mergeFromType);
	}
	if (source.classList.length > 0 || destination.classList.length > 0) {
		const mergedClasses = new Set<string>();
		source.classList.forEach((c) => mergedClasses.add(c));
		destination.classList.forEach((c) => mergedClasses.add(c));
		destination.className = Array.from(mergedClasses).join(' ');
	}
	return destination;
}

/**
 * Replace the first text node of a given element.
 * @param element The element the text node belongs to.
 * @param value The string to replace the text node with.
 */
export function replaceTextNode (element: HTMLElement | Element, value: string): void {
    const nodes = Array.from(element.childNodes);
    const textNode = nodes.find((node) => node.nodeType === Node.TEXT_NODE);
    if (textNode) {
        textNode.textContent = value;
    } else {
        element.append(value);
    }
}

/**
 * Sanitize a given HTML element with DOMPurify.
 * @param element The element to sanitize.
 * @returns A sanitized copy of the given element.
 */
export function sanitizeElement (element: HTMLElement): HTMLElement {
    const sanitizedElement = DOMPurify.sanitize(element, { RETURN_DOM: true });
    if (sanitizedElement.tagName.toLowerCase() === 'body' && element.tagName.toLowerCase() !== 'body') {
        return sanitizedElement.firstElementChild as HTMLElement;
    }
    return sanitizedElement;
}
