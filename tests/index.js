import { cssToHtml } from '../dist/index.js';

const input = `
:root {
	background: #000;
}
* {
	box-sizing: border-box;
}
a {
	content: 'https://example.com/';
	border-radius: 10px;
}
button {
	content: 'Click me';
	background-color: red;
}
button:hover {
	background-color: blue;
}
@media screen and (max-width: 200px) {}
#cat + .mouse >span.flea+i {
	padding: 10px;
	background-color: red;
}
nav    a#logo.icon> img {
	content: 'https://example.com/image';
	display: block;
}
.pie .pastry.crenelations {
	background: radial-gradient(circle at center, orange 10%, yellow);
}
`;

const output = cssToHtml(input);

console.log('Input:');
console.log(input);
console.log('Output:');
console.log(output);
	
