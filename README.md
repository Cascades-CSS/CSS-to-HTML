# CSS-to-HTML

Generate HTML documents from just CSS.


## Usage

From a CSS string.
```javascript
import { cssToHtml } from 'css-to-html';

const css = 'p { color: purple; }';

const html = cssToHtml(css);
```

Or from a style element:
```javascript
import { cssToHtml } from 'css-to-html';

const css = document.querySelector('style').sheet.cssRules;

const html = cssToHtml(css);
```


## Example

Input:
```css
h1 {
    content: 'Awesome!';
    color: grey;
}
p > button.rounded {
    content: 'Click here';
    background: #fff;
    border-radius: 8px;
}
p > button.rounded:hover {
    background: #ddd;
}
a img#logo {
    content: 'https://example.com/image';
    display: block;
    width: 1.5em;
    height: 1.5em;
}
```

Output:
```html
<body>
    <h1>Awesome!</h1>
    <p>
        <button class="rounded">Click here</button>
    </p>
    <a><img src="https://example.com/image" id="logo"></a>
</body>
```
