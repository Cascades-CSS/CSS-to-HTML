# <img width="48" src="https://github.com/Cascades-CSS/CSS-to-HTML/raw/main/assets/logo.svg"> CSS-to-HTML

[![Unit Tests](https://github.com/CSS-Canvas/CSS-to-HTML/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/CSS-Canvas/CSS-to-HTML/actions/workflows/unit-tests.yml) [![npm version](https://badge.fury.io/js/css-to-html.svg)](https://www.npmjs.com/package/css-to-html) [![npm](https://img.shields.io/npm/dt/css-to-html)](https://www.npmjs.com/package/css-to-html) [![npm bundle size](https://img.shields.io/bundlephobia/min/css-to-html)](https://www.npmjs.com/package/css-to-html)

Generate HTML documents from just CSS.

Give it a try on [Cascades](https://demo.cascades.app/) ✨


## Usage

> [!NOTE]
> CSS-to-HTML relies on some browser-only JS features, so it doesn't work in Node (yet).  
> If you want to use this in a Node project, please use a webdriver like [Puppeteer](https://pptr.dev/).

### With a Bundler

```sh
npm i css-to-html
```

```js
import { cssToHtml } from 'css-to-html';

// From a CSS string:
const css = 'p { color: purple; }';
const html = await cssToHtml(css);

// Or from a style element:
const css = document.querySelector('style').sheet.cssRules;
const html = await cssToHtml(css);
```

### Or as a Static Script

Download the latest script from the [releases page](https://github.com/Cascades-CSS/CSS-to-HTML/releases). Then include the script in your site:

```html
<script src="path/to/css-to-html.js"></script>

<script>
const css = 'p { color: purple; }';

cssToHtml(css).then(html => {
    console.log(html);
});
</script>
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

> [!NOTE]
> `cssToHtml` always returns an [`HTMLBodyElement`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLBodyElement). To get the string representation of the generated HTML, use [`innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML) or [`outerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/outerHTML). For example:
>
> ```js
> const html = await cssToHtml('h1#greeting { content: "Hello!"; }');
> console.log( html.innerHTML ); // '<h1 id="greeting">Hello!</h1>'
> console.log( html.outerHTML ); // '<body><h1 id="greeting">Hello!</h1></body>'
> ```


## Options

An options object can be passed as the second argument to `cssToHtml()` to customize the behavior of the HTML generator. _(Values marked with * are default)._

| Option       | Values         | Description |
| :----------- | :------------- | :---------- |
| `duplicates` | `preserve`     | Preserve duplicate elements. Eg: <br/> `button {} button {}` <br/> Will become: <br/> `<button></button><button></button>`. |
|              | `remove`     * | Remove duplicate elements. Eg: <br/> `button {} button {}` <br/> Will become: <br/> `<button></button>`. |
| `fill`       | `fill`       * | Fill the DOM with duplicate elements up to the desired location. Eg: <br/> `span#fourth:nth-child(4) {}` <br/> Will become: <br/> `<span></span><span></span><span></span><span id="fourth"></span>`. |
|              | `no-fill`      | Don't fill. Eg: <br/> `span#fourth:nth-child(4) {}` <br/> Will become: <br/> `<span id="fourth"></span>`. |
| `imports`    | `include`      | Fetch imported stylesheets and include them in the HTML generation process. |
|              | `style-only` * | Ignore `@import` rules when generating HTML. |
| `mergeNth`   | `merge`      * | Elements generated from `:nth-` selectors will be merged with any similar element occupying the desired location. |
|              | `no-merge`     | These elements will not be merged. |
| `sanitize`   | `all`        * | Sanitize the generated HTML using [DOMPurify](https://github.com/cure53/DOMPurify). |
|              | `imports`      | Only sanitize the HTML generated from imported stylesheets. |
|              | `off`          | Don't sanitize the generated HTML. |

<details>
<summary>Example</summary>

```js
import { cssToHtml, type Options } from 'css-to-html';

// An example options object (populated with default values).
const options: Options = {
    duplicates: 'remove',
    fill: 'fill',
    imports: 'style-only',
    mergeNth: 'merge',
    sanitize: 'all'
};

const css = 'p { color: purple; }';
const html = await cssToHtml(css, options);
```
</details>
