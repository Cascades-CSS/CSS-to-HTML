import fs from 'fs';

let script = fs.readFileSync('dist/Generator.js', { encoding: 'utf-8' });
script = script.replace('export ', '');
script = script.replace(/\/\/# sourceMappingURL=[a-z\.]+/i, '');

fs.writeFileSync('dist/Generator.script.js', script, { encoding: 'utf-8' });

console.log('Done.');
