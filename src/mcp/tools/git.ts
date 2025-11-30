import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';

export function registerGitTools(
	server: FastMCP,
	gitAnalyzer: GitAnalyzer,
): void {
	server.addTool({
		name: 'getRecentDecisions',
		description:
			'Extract recent architectural decisions from git commit messages',
		parameters: z.object({
			since: z
				.string()
				.describe(
					'Date or time period to look back (e.g., "1 week ago", "2024-01-01")',
				),
			workspace: z
				.string()
				.optional()
				.describe('Optional workspace/directory to filter commits'),
		}),
		execute: async ({
			since,
			workspace,
		}: {
			since: string;
			workspace?: string;
		}) => {
			const decisions = await gitAnalyzer.getRecentDecisions(
				since,
				workspace,
			);
			return JSON.stringify(decisions);
		},
	});

	server.addTool({
		name: 'analyzeChangeVelocity',
		description: 'Analyze how frequently a file or path has been changed',
		parameters: z.object({
			path: z.string().describe('File or directory path to analyze'),
			since: z
				.string()
				.describe(
					'Date or time period to analyze (e.g., "1 month ago")',
				),
		}),
		execute: async ({
			path: filePath,
			since,
		}: {
			path: string;
			since: string;
		}) => {
			const velocity = await gitAnalyzer.analyzeChangeVelocity(
				filePath,
				since,
			);
			return JSON.stringify(velocity);
		},
	});
}
