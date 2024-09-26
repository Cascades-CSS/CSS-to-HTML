/* Config for building the static version of the library. */

import { resolve } from 'path';
import { defineConfig } from 'vite';
import { version } from './package.json';

export default defineConfig({
  	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.static.ts'),
			name: 'cssToHtml',
			formats: ['iife'],
			fileName: () => 'css-to-html.js'
		},
		outDir: resolve(__dirname, 'static')
	},
	plugins: [
		{
			name: 'add-attribution',
			generateBundle: (_, bundle) => {
				const attribution = `/* CSS-to-HTML v${version}. https://github.com/Cascades-CSS/CSS-to-HTML */\n`;
				bundle['css-to-html.js'].code = attribution + bundle['css-to-html.js'].code;
			}
		}
	]
});
