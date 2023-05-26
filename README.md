# CSS-to-HTML

Generate HTML documents from just CSS.


## Usage

```javascript
import { cssToHtml } from 'css-to-html';

const css = 'p { color: purple; }';

const html = cssToHtml(css);
```


## Example

Input:
```css
h1 {
	color: grey;
}
p > button.rounded {
	background: #fff;
	border-radius: 8px;
}
p > button.rounded:hover {
	background: #ddd;
}
a img#logo {
	display: block;
	width: 1.5em;
	height: 1.5em;
}
```

Output:
```html
<body>
	<h1></h1>
	<p>
		<button class="rounded"></button>
	</p>
	<a><img id="logo"></a>
</body>
```
