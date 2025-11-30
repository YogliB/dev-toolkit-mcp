import { FastMCP } from 'fastmcp';
import { createStorageEngine } from './core/storage/engine';
import type { StorageEngine } from './core/storage/engine';
import { detectProjectRoot } from './core/config';
import { AnalysisEngine } from './core/analysis/engine';
import { TypeScriptPlugin } from './core/analysis/plugins/typescript';
import { GitAnalyzer } from './core/analysis/git/git-analyzer';
import { GitAwareCache } from './core/analysis/cache/git-aware';
import { FileWatcher } from './core/analysis/watcher/file-watcher';
import { registerAllTools } from './mcp/tools';

let storageEngine: StorageEngine;
let analysisEngine: AnalysisEngine;
let gitAnalyzer: GitAnalyzer;
let cache: GitAwareCache;
let fileWatcher: FileWatcher;

async function initializeServer(): Promise<void> {
	try {
		const projectRoot = await detectProjectRoot();
		console.error(`[DevFlow:INFO] Project root detected: ${projectRoot}`);

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
		fileWatcher.watchDirectory(projectRoot);
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
