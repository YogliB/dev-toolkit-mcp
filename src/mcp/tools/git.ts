import { z } from 'zod';
import type { FastMCP } from 'fastmcp';
import type { GitAnalyzer } from '../../core/analysis/git/git-analyzer';
import { createToolDescription } from './description';

export function registerGitTools(
	server: FastMCP,
	gitAnalyzer: GitAnalyzer,
): void {
	server.addTool({
		name: 'getRecentDecisions',
		description: createToolDescription({
			summary:
				'Extract architectural decisions from recent commit messages in a time window.',
			whenToUse: {
				triggers: [
					'Understanding recent changes and decisions',
					'Onboarding to active projects',
					'Tracking design evolution over time',
				],
			},
			parameters: {
				since: 'Date or time period to look back (e.g., "1 week ago", "2024-01-01")',
				workspace: 'Optional directory path to filter commits',
			},
			returns:
				'Array of architectural decisions extracted from commit messages',
			workflow: {
				after: [
					'Review decisions for context on recent changes',
					'Use workspace parameter to focus on specific modules',
				],
			},
			example: {
				scenario: 'Review last month of API changes',
				params: { since: '1 month ago', workspace: 'src/api' },
				next: 'Understand design decisions before making changes',
			},
		}),
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
		description: createToolDescription({
			summary:
				'Measure file modification frequency to identify hotspots and volatile code.',
			whenToUse: {
				triggers: [
					'Assessing refactoring risk for specific files',
					'Finding fragile areas requiring stabilization',
					'Prioritizing technical debt reduction',
				],
			},
			parameters: {
				path: 'File or directory path to analyze',
				since: 'Date or time period to analyze (e.g., "1 month ago")',
			},
			returns:
				'Commit counts and change patterns showing modification frequency',
			workflow: {
				after: [
					'Identify high-velocity files as refactoring risks',
					'Focus testing efforts on frequently changing code',
					'Consider stabilization for hotspots',
				],
			},
			example: {
				scenario: 'Identify volatile files in authentication module',
				params: { path: 'src/auth', since: '3 months ago' },
				next: 'Prioritize refactoring for most-changed files',
			},
		}),
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
