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
a {
	content: 'https://example.com/page';
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
nav a#logo.icon > img {
	content: 'https://example.com/image2';
}
.pie .pastry.crenelations {
	background: radial-gradient(circle at center, orange 10%, yellow);
}
.pie .pastry.crenelations div#crenelation:nth-child(8) {
	content: 'o';
}
.pie .pastry.crenelations div:nth-child(3) {
	content: 'm';
}
.pie .pastry.crenelations div:nth-child(9) {
	content: 'p';
}
button {
	content: 'Double-click me';
	background-color: blue;
}
span:nth-child(4) {}
span.first:first-child {}
span:nth-of-type(3) {
	content: '3rd span';
}
`;

const output = cssToHtml(input);

console.log('Input:');
console.log(input);
console.log('Output:');
console.log(output);
	
