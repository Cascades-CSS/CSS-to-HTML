import { Options } from './Config.js';
import { cssToHtml } from './Generator.js';
import { version } from '../package.json';

cssToHtml['Options'] = Options;
cssToHtml['version'] = version;

export default cssToHtml;
