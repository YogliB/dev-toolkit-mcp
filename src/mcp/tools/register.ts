import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { registerProjectTools } from './project';
import { registerArchitectureTools } from './architecture';
import { registerSymbolTools } from './symbols';
import { registerPatternTools } from './patterns';
import { registerGraphTools } from './graph';
import { registerGitTools } from './git';
import { registerContextTools } from './context';

export function registerAllTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
	gitAnalyzer: GitAnalyzer,
): void {
	registerProjectTools(server, engine, storage);
	registerArchitectureTools(server, engine);
	registerSymbolTools(server, engine);
	registerPatternTools(server, engine);
	registerGraphTools(server, engine);
	registerGitTools(server, gitAnalyzer);
	registerContextTools(server, engine);
}
