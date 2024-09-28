import { cssToHtml } from '../../dist';
import cssToHtmlStatic from '../../static/css-to-html.js?url';

declare global {
	interface Window { cssToHtml: typeof cssToHtml; }
}

if (window.location.pathname === '/static') {
	const script = document.createElement('script');
	script.src = cssToHtmlStatic;
	document.head.appendChild(script);
	console.info('Using static script.');
} else {
	window.cssToHtml = cssToHtml;
	console.info('Using bundle script.');
}
