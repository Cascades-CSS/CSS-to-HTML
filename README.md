# CSS-to-HTML

Generate HTML documents from just CSS.

```bash
npm i css-to-html
```


## Usage

From a CSS string.
```javascript
import { cssToHtml } from 'css-to-html';

const css = 'p { color: purple; }';

const html = await cssToHtml(css);
```

Or from a style element:
```javascript
import { cssToHtml } from 'css-to-html';

const css = document.querySelector('style').sheet.cssRules;

const html = await cssToHtml(css);
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


## Options

An options object can be passed as the second argument to `cssToHtml()` to customize the behaviour of the HTML generator. _(Values marked with * are default)._

| Option       | Values     | Description |
| :----------- | :--------- | :---------- |
| `duplicates` | `preserve` | Preserve duplicate elements. Eg: <br/> `button {} button {}` <br/> Will become: <br/> `<button></button><button></button>`. |
|              | `remove` * | Remove duplicate elements. Eg: <br/> `button {} button {}` <br/> Will become: <br/> `<button></button>`. |
| `fill`       | `fill`   * | Fill the DOM with duplicate elements up to the desired level. Eg: <br/> `span#fourth:nth-child(4) {}` <br/> Will become: <br/> `<span></span><span></span><span></span><span id="fourth"></span>`. |
|              | `no-fill`  | Don't fill. Eg: <br/> `span#fourth:nth-child(4) {}` <br/> Will become: <br/> `<span id="fourth"></span>`. |
