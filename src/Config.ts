export type DuplicatesOption = 'preserve' | 'remove';
export type FillOption = 'fill' | 'no-fill';
export type ImportsOption = 'include' | 'style-only';
export type MergeNthOption = 'merge' | 'no-merge';
export type SanitizationOption = 'all' | 'imports' | 'off';

export class Options {
	duplicates?: DuplicatesOption = 'remove';
	fill?: FillOption = 'fill';
	imports?: ImportsOption = 'style-only';
	mergeNth?: MergeNthOption = 'merge';
	sanitize?: SanitizationOption = 'all';

	constructor (options?: Partial<Options>) {
		if (typeof options?.duplicates === 'string') this.duplicates = options.duplicates;
		if (typeof options?.fill       === 'string') this.fill = options.fill;
		if (typeof options?.imports    === 'string') this.imports = options.imports;
		if (typeof options?.mergeNth   === 'string') this.mergeNth = options.mergeNth;
		if (typeof options?.sanitize   === 'string') this.sanitize = options.sanitize;
	}
}
