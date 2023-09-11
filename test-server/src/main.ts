import { cssToHtml } from '../../dist';

declare global {
	interface Window { cssToHtml: typeof cssToHtml; }
}
window.cssToHtml = cssToHtml;
