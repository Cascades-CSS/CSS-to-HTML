import fs from 'fs';

const file = fs.readFileSync('dist/Generator.js', { encoding: 'utf-8' });

let script = file;
script = script.replace('export ', '');
script = script.replace(/\/\/# sourceMappingURL=[a-z\.]+/i, '');

fs.writeFileSync('tests/GeneratorScript.js', script, { encoding: 'utf-8' });

console.log('Done.');
