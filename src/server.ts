import { FastMCP } from 'fastmcp';
import { createStorageEngine } from './core/storage/engine';
import type { StorageEngine } from './core/storage/engine';
import { detectProjectRoot } from './core/config';
import { AnalysisEngine } from './core/analysis/engine';
import { TypeScriptPlugin } from './core/analysis/plugins/typescript';
import { GitAnalyzer } from './core/analysis/git/git-analyzer';
import { GitAwareCache } from './core/analysis/cache/git-aware';
import {
	FileWatcher,
	estimateDirectorySize,
	MAX_FILE_COUNT_THRESHOLD,
} from './core/analysis/watcher/file-watcher';
import { registerAllTools } from './mcp/tools';

let storageEngine: StorageEngine;
let analysisEngine: AnalysisEngine;
let gitAnalyzer: GitAnalyzer;
let cache: GitAwareCache;
let fileWatcher: FileWatcher;

async function validateProjectRoot(projectRoot: string): Promise<void> {
	const estimatedSize = await estimateDirectorySize(projectRoot);

	if (estimatedSize >= MAX_FILE_COUNT_THRESHOLD) {
		throw new Error(
			`Project root directory is too large (estimated ${estimatedSize} files). ` +
				`Watching this directory would cause memory exhaustion. ` +
				`Please set DEVFLOW_ROOT environment variable to point to a smaller project directory.`,
		);
	}

	if (estimatedSize > 10_000) {
		console.error(
			`[DevFlow:WARN] Large project root detected (estimated ${estimatedSize} files). ` +
				`File watching may impact performance. Consider setting DEVFLOW_ROOT to a more specific directory.`,
		);
	}
}

async function initializeServer(): Promise<void> {
	try {
		const projectRoot = await detectProjectRoot();
		console.error(`[DevFlow:INFO] Project root detected: ${projectRoot}`);

		await validateProjectRoot(projectRoot);

		storageEngine = createStorageEngine({
			rootPath: projectRoot,
			debug: false,
		});
		console.error('[DevFlow:INFO] StorageEngine initialized');

		analysisEngine = new AnalysisEngine(projectRoot);
		const tsPlugin = new TypeScriptPlugin(projectRoot);
		analysisEngine.registerPlugin(tsPlugin);
		console.error('[DevFlow:INFO] AnalysisEngine initialized');

		gitAnalyzer = new GitAnalyzer(projectRoot);
		console.error('[DevFlow:INFO] GitAnalyzer initialized');

		cache = new GitAwareCache();
		console.error('[DevFlow:INFO] Cache initialized');

		fileWatcher = new FileWatcher(100, cache);
		await fileWatcher.watchDirectory(projectRoot);
		console.error('[DevFlow:INFO] FileWatcher initialized');
	} catch (error) {
		const errorMessage =
			error instanceof Error
				? error.message
				: 'Unknown error during initialization';
		console.error(
			`[DevFlow:ERROR] Failed to initialize server: ${errorMessage}`,
		);
		if (error instanceof Error && error.stack) {
			console.error(`[DevFlow:ERROR] Stack trace: ${error.stack}`);
		}
		throw error;
	}
}

async function main(): Promise<void> {
	await initializeServer();

	const server = new FastMCP({
		name: 'devflow-mcp',
		version: '0.1.0',
	});

	registerAllTools(server, analysisEngine, storageEngine, gitAnalyzer);
	console.error('[DevFlow:INFO] All MCP tools registered');

	await server.start({
		transportType: 'stdio',
	});
	console.error('DevFlow MCP Server running on stdio');
}

(async () => {
	await main().catch((error) => {
		console.error(
			`[DevFlow:ERROR] Fatal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
		process.exit(1);
	});
})();
