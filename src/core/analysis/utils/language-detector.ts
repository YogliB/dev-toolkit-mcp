import path from 'node:path';

const languageExtensions: Record<string, string> = {
	'.ts': 'typescript',
	'.tsx': 'typescript',
	'.js': 'javascript',
	'.jsx': 'javascript',
	'.mjs': 'javascript',
	'.cjs': 'javascript',
};

export function detectLanguage(filePath: string): string {
	const extension = path.extname(filePath).toLowerCase();
	return languageExtensions[extension] || 'unknown';
}

export function isSupportedLanguage(filePath: string): boolean {
	const lang = detectLanguage(filePath);
	return lang !== 'unknown';
}
