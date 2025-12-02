import path from 'node:path';
import { readdir, stat } from 'node:fs/promises';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';
import { createToolDescription } from './description';
import { getScopedEngines } from './utils/scoped-engines';

const ANALYSIS_TIMEOUT_MS = 5000; // 5 seconds per file
const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500KB

const DEFAULT_EXCLUDED_DIRS = new Set([
	'node_modules',
	'.git',
	'.svn',
	'.hg',
	'dist',
	'build',
	'coverage',
	'.next',
	'.nuxt',
	'.cache',
	'.turbo',
	'out',
	'target',
]);

function validateDirectoryPath(
	directory: string,
	projectRoot: string,
): string | undefined {
	const resolvedDirectory = path.resolve(directory);
	if (!resolvedDirectory.startsWith(projectRoot)) {
		return undefined;
	}
	return resolvedDirectory;
}

function shouldExcludeDirectory(directoryName: string): boolean {
	return (
		directoryName.startsWith('.') ||
		DEFAULT_EXCLUDED_DIRS.has(directoryName)
	);
}

async function analyzeFileWithTimeout<T>(
	promise: Promise<T>,
	timeoutMs: number,
	filePath: string,
): Promise<T> {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) =>
			setTimeout(
				() =>
					reject(
						new Error(
							`Analysis timeout for ${filePath} after ${timeoutMs}ms`,
						),
					),
				timeoutMs,
			),
		),
	]);
}

function checkSymbolForAntiPatterns(
	symbols: Array<{ name: string; path: string; line: number }>,
	antiPatterns: Array<{
		type: string;
		description: string;
		path: string;
		line: number;
	}>,
): void {
	for (const symbol of symbols) {
		const name = symbol.name.toLowerCase();
		if (
			name.includes('any') ||
			name.includes('todo') ||
			name.includes('fixme')
		) {
			antiPatterns.push({
				type: 'naming-issue',
				description: `Symbol name contains problematic terms: ${symbol.name}`,
				path: symbol.path,
				line: symbol.line,
			});
		}
	}
}

async function analyzeFileForAntiPatterns(
	filePath: string,
	engine: AnalysisEngine,
	antiPatterns: Array<{
		type: string;
		description: string;
		path: string;
		line: number;
	}>,
	fileCount: { current: number; total: number },
): Promise<void> {
	try {
		// Check file size before analyzing
		const stats = await stat(filePath);
		if (stats.size > MAX_FILE_SIZE_BYTES) {
			console.error(
				`[detectAntiPatterns] Skipping large file (${(stats.size / 1024).toFixed(1)}KB): ${filePath}`,
			);
			return;
		}

		console.error(
			`[detectAntiPatterns] [${fileCount.current}/${fileCount.total}] Analyzing: ${filePath}`,
		);

		const analysisPromise = engine.analyzeFile(filePath);
		const analysis = await analyzeFileWithTimeout(
			analysisPromise,
			ANALYSIS_TIMEOUT_MS,
			filePath,
		);

		checkSymbolForAntiPatterns(analysis.symbols, antiPatterns);
		console.error(
			`[detectAntiPatterns] [${fileCount.current}/${fileCount.total}] ✓ Found ${analysis.symbols.length} symbols`,
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error';
		console.error(
			`[detectAntiPatterns] [${fileCount.current}/${fileCount.total}] ✗ Error: ${errorMessage}`,
		);
	}
}

export function registerPatternTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
	git: GitAnalyzer,
): void {
	server.addTool({
		name: 'findCodePatterns',
		description: createToolDescription({
			summary:
				'Search for specific architectural patterns (middleware, controller, service, error-handler) within a directory.',
			whenToUse: {
				triggers: [
					'Standardizing code structure across modules',
					'Finding examples to follow for consistency',
					'Auditing pattern usage and distribution',
				],
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				type: 'Pattern type to search for (e.g., middleware, controller, service, error-handler)',
				scope: 'Optional directory path to limit search',
			},
			returns:
				'Array of patterns with type, name, path, line number, and confidence score',
			workflow: {
				after: [
					'Review patterns for consistency',
					'Use found examples as templates',
					'Identify areas needing standardization',
				],
			},
			example: {
				scenario: 'Find all middleware patterns in API module',
				params: {
					projectRoot: '/path/to/project',
					type: 'middleware',
					scope: 'src/api',
				},
				next: 'Ensure all middleware follows the same structure',
			},
		}),
		parameters: z.object({
			projectRoot: z
				.string()
				.optional()
				.describe(
					'Optional absolute path to project root directory to analyze (overrides DEVFLOW_ROOT)',
				),
			type: z
				.string()
				.describe(
					'Pattern type to search for (e.g., middleware, controller, service, error-handler)',
				),
			scope: z
				.string()
				.optional()
				.describe('Optional directory scope to search'),
		}),
		execute: async ({
			projectRoot,
			type,
			scope,
		}: {
			projectRoot?: string;
			type: string;
			scope?: string;
		}) => {
			const engines = await getScopedEngines(projectRoot, {
				storage,
				analysis: engine,
				git,
			});
			const resolvedProjectRoot = engines.analysis.getProjectRoot();
			const targetPath = scope
				? path.join(resolvedProjectRoot, scope)
				: resolvedProjectRoot;

			const patterns: Array<{
				type: string;
				name: string;
				path: string;
				line: number;
				confidence: number;
			}> = [];

			async function searchDirectory(directory: string): Promise<void> {
				const validatedDirectory = validateDirectoryPath(
					directory,
					resolvedProjectRoot,
				);
				if (!validatedDirectory) {
					return;
				}

				const safeDirectory = validatedDirectory as string;
				let entries;
				try {
					entries = await readdir(safeDirectory, {
						withFileTypes: true,
					});
				} catch {
					return;
				}

				for (const entry of entries) {
					const fullPath = path.join(safeDirectory, entry.name);
					if (entry.isDirectory()) {
						if (!shouldExcludeDirectory(entry.name)) {
							await searchDirectory(fullPath);
						}
					} else if (
						entry.isFile() &&
						isSupportedLanguage(fullPath)
					) {
						try {
							const analysis =
								await engines.analysis.analyzeFile(fullPath);
							const matchingPatterns = analysis.patterns.filter(
								(p) => p.type === type,
							);
							patterns.push(...matchingPatterns);
						} catch {
							// Ignore errors when analyzing files
						}
					}
				}
			}

			await searchDirectory(targetPath);

			return JSON.stringify(patterns);
		},
	});

	server.addTool({
		name: 'detectAntiPatterns',
		description: createToolDescription({
			summary:
				'Scan codebase for common code smells: problematic naming (any, todo, fixme) and other anti-patterns.',
			whenToUse: {
				triggers: [
					'During code reviews or pre-commit checks',
					'Before releases to ensure code quality',
					'When improving codebase health',
				],
			},
			parameters: {
				projectRoot:
					'Optional absolute path to project root (overrides DEVFLOW_ROOT)',
				scope: 'Optional directory path to limit search (e.g., "src", "lib")',
			},
			returns:
				'Array of anti-patterns with type, description, file path, and line number',
			workflow: {
				after: [
					'Review each issue with file path and line number',
					'Fix critical anti-patterns immediately',
					'Plan refactoring for lower-priority issues',
				],
			},
			example: {
				scenario: 'Pre-release quality check on src directory',
				params: { projectRoot: '/path/to/project', scope: 'src' },
				next: 'Address all naming issues and TODOs',
			},
		}),
		parameters: z.object({
			projectRoot: z
				.string()
				.optional()
				.describe(
					'Optional absolute path to project root directory to analyze (overrides DEVFLOW_ROOT)',
				),
			scope: z
				.string()
				.optional()
				.describe(
					'Optional directory scope to limit search (e.g., "src", "lib")',
				),
		}),
		execute: async ({
			projectRoot,
			scope,
		}: {
			projectRoot?: string;
			scope?: string;
		}) => {
			const engines = await getScopedEngines(projectRoot, {
				storage,
				analysis: engine,
				git,
			});
			const resolvedProjectRoot = engines.analysis.getProjectRoot();
			const targetPath = scope
				? path.join(resolvedProjectRoot, scope)
				: resolvedProjectRoot;

			console.error(
				`[detectAntiPatterns] Starting scan at: ${targetPath}`,
			);

			const antiPatterns: Array<{
				type: string;
				description: string;
				path: string;
				line: number;
			}> = [];

			const fileCount = { current: 0, total: 0 };

			// First pass: count total files
			async function countFiles(directory: string): Promise<void> {
				const validatedDirectory = validateDirectoryPath(
					directory,
					resolvedProjectRoot,
				);
				if (!validatedDirectory) {
					return;
				}

				const safeDirectory = validatedDirectory as string;
				let entries;
				try {
					entries = await readdir(safeDirectory, {
						withFileTypes: true,
					});
				} catch {
					return;
				}

				for (const entry of entries) {
					const fullPath = path.join(safeDirectory, entry.name);
					if (entry.isDirectory()) {
						if (!shouldExcludeDirectory(entry.name)) {
							await countFiles(fullPath);
						}
					} else if (
						entry.isFile() &&
						isSupportedLanguage(fullPath)
					) {
						fileCount.total++;
					}
				}
			}

			async function searchDirectory(directory: string): Promise<void> {
				const validatedDirectory = validateDirectoryPath(
					directory,
					resolvedProjectRoot,
				);
				if (!validatedDirectory) {
					return;
				}

				const safeDirectory = validatedDirectory as string;
				let entries;
				try {
					entries = await readdir(safeDirectory, {
						withFileTypes: true,
					});
				} catch {
					return;
				}

				for (const entry of entries) {
					const fullPath = path.join(safeDirectory, entry.name);
					if (entry.isDirectory()) {
						if (!shouldExcludeDirectory(entry.name)) {
							await searchDirectory(fullPath);
						}
					} else if (
						entry.isFile() &&
						isSupportedLanguage(fullPath)
					) {
						fileCount.current++;
						await analyzeFileForAntiPatterns(
							fullPath,
							engines.analysis,
							antiPatterns,
							fileCount,
						);
					}
				}
			}

			// Count files first
			console.error('[detectAntiPatterns] Counting files...');
			await countFiles(targetPath);
			console.error(
				`[detectAntiPatterns] Found ${fileCount.total} files to analyze`,
			);

			// Then analyze them
			await searchDirectory(targetPath);

			console.error(
				`[detectAntiPatterns] Complete: Found ${antiPatterns.length} anti-patterns in ${fileCount.current} files`,
			);

			return JSON.stringify(antiPatterns);
		},
	});
}
