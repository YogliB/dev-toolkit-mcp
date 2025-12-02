import path from 'node:path';
import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import { isSupportedLanguage } from '../../core/analysis/utils/language-detector';
import { createToolDescription } from './description';

interface SymbolGraph {
	readonly nodes: Array<{
		readonly id: string;
		readonly name: string;
		readonly type: string;
		readonly path: string;
	}>;
	readonly edges: Array<{
		readonly from: string;
		readonly to: string;
		readonly type: string;
	}>;
}

function addSymbolNodes(
	symbols: Array<{
		name: string;
		type: string;
		path: string;
		exported: boolean;
	}>,
	nodes: Map<
		string,
		{ id: string; name: string; type: string; path: string }
	>,
): void {
	for (const symbol of symbols) {
		if (symbol.exported) {
			const nodeId = `${symbol.path}:${symbol.name}`;
			if (!nodes.has(nodeId)) {
				nodes.set(nodeId, {
					id: nodeId,
					name: symbol.name,
					type: symbol.type,
					path: symbol.path,
				});
			}
		}
	}
}

function addRelationshipEdges(
	relationships: Array<{ from: string; to: string; type: string }>,
	edges: Array<{ from: string; to: string; type: string }>,
): void {
	for (const relationship of relationships) {
		edges.push({
			from: relationship.from,
			to: relationship.to,
			type: relationship.type,
		});
	}
}

async function analyzeFileForGraph(
	filePath: string,
	engine: AnalysisEngine,
	nodes: Map<
		string,
		{ id: string; name: string; type: string; path: string }
	>,
	edges: Array<{ from: string; to: string; type: string }>,
): Promise<void> {
	try {
		const analysis = await engine.analyzeFile(filePath);
		addSymbolNodes(analysis.symbols, nodes);
		addRelationshipEdges(analysis.relationships, edges);
	} catch {
		// Ignore errors when analyzing files
	}
}

export function registerGraphTools(
	server: FastMCP,
	engine: AnalysisEngine,
): void {
	server.addTool({
		name: 'getSymbolGraph',
		description: createToolDescription({
			summary:
				'Build a dependency graph showing how symbols connect across files.',
			whenToUse: {
				triggers: [
					'Visualizing architecture and component relationships',
					'Understanding data flow across modules',
					'Planning large refactors that affect multiple files',
				],
				skipIf: 'Need simple reference search (use findReferencingSymbols)',
			},
			parameters: {
				scope: 'Optional directory path to limit graph scope',
			},
			returns:
				'Graph structure with nodes (symbols) and edges (relationships) for visualization or impact analysis',
			workflow: {
				after: [
					'Visualize nodes and edges to understand dependencies',
					'Identify tightly coupled components',
					'Plan refactoring to reduce coupling',
				],
			},
			example: {
				scenario: 'Map dependencies in core module',
				params: { scope: 'src/core' },
				next: 'Visualize graph to find circular dependencies',
			},
			antiPatterns: {
				dont: 'Use for finding specific symbol references',
				do: 'Use findReferencingSymbols for targeted reference searches',
			},
		}),
		parameters: z.object({
			scope: z
				.string()
				.optional()
				.describe('Optional directory scope to analyze'),
		}),
		execute: async ({ scope }: { scope?: string }) => {
			const projectRoot = engine.getProjectRoot();
			const targetPath = scope
				? path.join(projectRoot, scope)
				: projectRoot;

			const nodes = new Map<
				string,
				{ id: string; name: string; type: string; path: string }
			>();
			const edges: Array<{ from: string; to: string; type: string }> = [];

			async function analyzeDirectory(directory: string): Promise<void> {
				try {
					const resolvedDirectory = path.resolve(directory);
					const { readdir } = await import('node:fs/promises');
					const entries = await readdir(resolvedDirectory, {
						withFileTypes: true,
					});
					for (const entry of entries) {
						const fullPath = path.join(
							resolvedDirectory,
							entry.name,
						);
						if (entry.isDirectory()) {
							if (
								!entry.name.startsWith('.') &&
								entry.name !== 'node_modules'
							) {
								await analyzeDirectory(fullPath);
							}
						} else if (
							entry.isFile() &&
							isSupportedLanguage(fullPath)
						) {
							await analyzeFileForGraph(
								fullPath,
								engine,
								nodes,
								edges,
							);
						}
					}
				} catch {
					// Ignore errors when reading directories
				}
			}

			await analyzeDirectory(targetPath);

			return JSON.stringify({
				nodes: [...nodes.values()],
				edges,
			} as SymbolGraph);
		},
	});
}
