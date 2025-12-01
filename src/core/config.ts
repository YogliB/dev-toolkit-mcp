import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { realpath } from 'node:fs/promises';

function getServerScriptDirectory(): string {
	try {
		const serverModuleUrl = import.meta.url;
		const serverFilePath = fileURLToPath(serverModuleUrl);
		return path.dirname(serverFilePath);
	} catch {
		return process.cwd();
	}
}

async function isValidDevelopmentFlowProjectRoot(
	rootPath: string,
): Promise<boolean> {
	try {
		const packageJsonPath = path.join(rootPath, 'package.json');
		const { readFile: fsReadFile } = await import('node:fs/promises');
		const content = await fsReadFile(packageJsonPath, 'utf8');
		const packageJson = JSON.parse(content);
		return (
			packageJson.name === 'devflow-mcp' ||
			(packageJson.name &&
				typeof packageJson.name === 'string' &&
				packageJson.name.includes('devflow'))
		);
	} catch {
		return false;
	}
}

async function findProjectRootInDirectory(
	startDirectory: string,
	indicators: string[],
	isPrimarySearch: boolean,
): Promise<string | undefined> {
	let currentDirectory = startDirectory;

	while (true) {
		for (const indicator of indicators) {
			try {
				const { readdir } = await import('node:fs/promises');
				const entries = await readdir(currentDirectory);
				if (entries.includes(indicator)) {
					const result = await handleFoundIndicator(
						currentDirectory,
						indicator,
						isPrimarySearch,
					);
					if (result) {
						return result;
					}
				}
			} catch {
				// Continue checking other indicators
			}
		}

		const parentDirectory = path.dirname(currentDirectory);
		if (parentDirectory === currentDirectory) {
			break;
		}

		currentDirectory = parentDirectory;
	}

	return undefined;
}

async function handleFoundIndicator(
	currentDirectory: string,
	indicator: string,
	isPrimarySearch: boolean,
): Promise<string | undefined> {
	const isValid = await isValidDevelopmentFlowProjectRoot(currentDirectory);
	if (isValid) {
		console.error(
			`[DevFlow:DEBUG] Found validated project indicator (${indicator}) at: ${currentDirectory}`,
		);
		return currentDirectory;
	}
	if (isPrimarySearch) {
		console.error(
			`[DevFlow:DEBUG] Found project indicator (${indicator}) at: ${currentDirectory}`,
		);
		console.error(
			`[DevFlow:WARN] Detected root may not be a devflow project. Consider setting DEVFLOW_ROOT environment variable.`,
		);
		return currentDirectory;
	}
	return undefined;
}

export async function detectProjectRoot(startFrom?: string): Promise<string> {
	const devflowRoot = process.env.DEVFLOW_ROOT;
	if (devflowRoot) {
		console.error(
			`[DevFlow:DEBUG] Using DEVFLOW_ROOT override: ${devflowRoot}`,
		);
		return path.resolve(devflowRoot);
	}

	const indicators = ['.git', 'package.json', 'pyproject.toml'];
	const serverScriptDirectory = getServerScriptDirectory();
	const cwd = await realpath('.');

	const searchPaths: Array<{ path: string; isPrimary: boolean }> = [];
	if (startFrom) {
		const { realpath: fsRealpath } = await import('node:fs/promises');
		const resolvedStartFrom = await fsRealpath(startFrom);
		searchPaths.push({ path: resolvedStartFrom, isPrimary: true });
	} else {
		searchPaths.push({ path: cwd, isPrimary: true });
		if (serverScriptDirectory !== cwd) {
			searchPaths.push({ path: serverScriptDirectory, isPrimary: false });
		}
	}

	for (const { path: searchPath, isPrimary } of searchPaths) {
		const found = await findProjectRootInDirectory(
			searchPath,
			indicators,
			isPrimary,
		);
		if (found) {
			return found;
		}
	}

	console.error(
		`[DevFlow:DEBUG] No project indicator found, falling back to cwd: ${cwd}`,
	);
	return cwd;
}
