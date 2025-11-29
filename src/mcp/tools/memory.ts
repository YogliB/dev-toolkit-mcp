import { z } from 'zod';
import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';
import {
	type CoreMemoryFileName,
	MemoryFileActionInputSchema,
	type MemoryFileActionInput,
} from '../../core/schemas/memory';
import { loadAllTemplates } from '../../layers/memory/templates/loader';

function getFileDisplayName(fileName: CoreMemoryFileName): string {
	const names: Record<CoreMemoryFileName, string> = {
		projectBrief: 'Project Brief',
		productContext: 'Product Context',
		systemPatterns: 'System Patterns',
		techContext: 'Technical Context',
		activeContext: 'Active Context',
		progress: 'Progress',
	};

	const entry = Object.entries(names).find(([key]) => key === fileName);
	return entry ? entry[1] : fileName;
}

interface BehavioralDescription {
	purpose: string;
	updateFrequency: string;
	triggers: string[];
	contains: string[];
	tip: string;
	antiPatterns: Array<{ pattern: string; correctFile: CoreMemoryFileName }>;
}

const behavioralDescriptions: Record<
	CoreMemoryFileName,
	BehavioralDescription
> = {
	projectBrief: {
		purpose: 'Foundation document - source of truth for project scope',
		updateFrequency: 'Rarely (only when scope/goals change)',
		triggers: [
			'User asks "what are we building?"',
			'Need to understand project scope or goals',
			'Starting a new session (load this first)',
			'Validating if work aligns with project objectives',
		],
		contains: [
			"What you're building (high-level description)",
			'Core requirements and success criteria',
			'Target users and stakeholders',
			'Timeline and key milestones',
			"Project scope (what's in/out)",
		],
		tip: "Keep it simple and high-level. This is what you'd tell someone in 5 minutes about the project.",
		antiPatterns: [
			{
				pattern: 'Technology stack details',
				correctFile: 'techContext',
			},
			{
				pattern: 'Architecture decisions',
				correctFile: 'systemPatterns',
			},
			{
				pattern: 'Current work or blockers',
				correctFile: 'activeContext',
			},
		],
	},
	productContext: {
		purpose:
			'Why the project exists and how it should work from a product perspective',
		updateFrequency: 'Medium (when UX changes or product direction shifts)',
		triggers: [
			'User asks "why does this exist?"',
			'Need to understand product value or user problems',
			'Discussing new features or product direction',
			'Questions about user experience or workflows',
		],
		contains: [
			'Why this project exists',
			'Problems being solved (with impact)',
			'Value proposition',
			'How it should work (UX goals)',
			'Core user workflows and scenarios',
			'Product principles',
		],
		tip: 'Focus on user value and experience. This informs all technical decisions.',
		antiPatterns: [
			{
				pattern: 'Technical implementation details',
				correctFile: 'systemPatterns',
			},
			{
				pattern: 'Technology choices',
				correctFile: 'techContext',
			},
			{
				pattern: 'High-level project scope',
				correctFile: 'projectBrief',
			},
		],
	},
	systemPatterns: {
		purpose:
			'Architecture, design patterns, and technical decisions (WHY you built it this way)',
		updateFrequency:
			'On architectural changes (when making design decisions)',
		triggers: [
			'User asks "why did we build it this way?"',
			'Making architectural choices (monolith vs microservices)',
			'Choosing design patterns (repository, factory, observer)',
			'Documenting trade-offs and alternatives considered',
			'Recording technical decisions with context',
		],
		contains: [
			'System architecture overview',
			'Component relationships and data flow',
			'Design patterns in use',
			'Key technical decisions with full context',
			'Alternatives considered and why they were rejected',
			'Consequences and trade-offs',
			'Critical implementation paths',
		],
		tip: 'Document decisions inline with architecture. Include WHY, not just WHAT.',
		antiPatterns: [
			{
				pattern: 'Technology stack (languages, frameworks)',
				correctFile: 'techContext',
			},
			{
				pattern: 'Current implementation tasks',
				correctFile: 'activeContext',
			},
			{
				pattern: 'Product goals or user value',
				correctFile: 'productContext',
			},
		],
	},
	techContext: {
		purpose:
			'Technologies, development setup, constraints, and tools (WHAT tech you use)',
		updateFrequency:
			'On dependency changes (when adding/updating technologies)',
		triggers: [
			'User asks "what tech are we using?"',
			'User asks "how do I run this?"',
			'Adding new dependencies or frameworks',
			'Updating build/deployment processes',
			'Questions about development environment',
		],
		contains: [
			'Technology stack (languages, frameworks, databases)',
			'Key dependencies with versions',
			'Development setup instructions',
			'Environment variables and configuration',
			'Development tools (linters, formatters, testing)',
			'Build and release process',
			'Technical constraints (performance, compatibility)',
		],
		tip: 'Everything a developer needs to know to work with the technology stack.',
		antiPatterns: [
			{
				pattern: 'Why you chose this tech (architecture reasoning)',
				correctFile: 'systemPatterns',
			},
			{
				pattern: 'Current implementation work',
				correctFile: 'activeContext',
			},
			{
				pattern: 'Product requirements',
				correctFile: 'productContext',
			},
		],
	},
	activeContext: {
		purpose:
			'Snapshot of current work, blockers, and recent activity (last 7 days)',
		updateFrequency: 'Multiple times per day (this is your working memory)',
		triggers: [
			'User asks "what was I working on?"',
			'User asks "what\'s blocking me?"',
			'User says "what did we do yesterday?"',
			'User says "update my progress" or "add this to active work"',
			'Recording current blockers or context notes',
		],
		contains: [
			"Current focus (what you're working on NOW)",
			'Active blockers with severity and impact',
			'Recent changes (last 7 days only)',
			'Context notes (important patterns, considerations)',
			'Next immediate steps',
		],
		tip: 'Keep last 7 days only. Archive older entries to progress.md. This is append-often, prune-weekly.',
		antiPatterns: [
			{
				pattern: 'Long-term goals or project scope',
				correctFile: 'projectBrief',
			},
			{
				pattern: 'Completed accomplishments (>7 days old)',
				correctFile: 'progress',
			},
			{
				pattern: 'Architecture decisions',
				correctFile: 'systemPatterns',
			},
		],
	},
	progress: {
		purpose:
			'Session log of completed work and accomplishments (append-only)',
		updateFrequency:
			'After significant accomplishments (multiple times per session)',
		triggers: [
			'User says "log this" or "we finished X"',
			'User says "add to progress" or "mark as done"',
			'Recording completed work or milestones',
			'Documenting lessons learned',
		],
		contains: [
			'Completed work with dates',
			'Decisions made during implementation',
			'Lessons learned and insights',
			'Milestones achieved',
			'Problems solved',
		],
		tip: 'Always append, never overwrite. Archive entries older than 1 week if file gets large.',
		antiPatterns: [
			{
				pattern: 'Current blockers or active work',
				correctFile: 'activeContext',
			},
			{
				pattern: 'Future plans or roadmap',
				correctFile: 'projectBrief',
			},
			{
				pattern: 'Technical decisions (why you did something)',
				correctFile: 'systemPatterns',
			},
		],
	},
};

function createBehavioralDescription(fileName: CoreMemoryFileName): string {
	const displayName = getFileDisplayName(fileName);
	const descEntry = Object.entries(behavioralDescriptions).find(
		([key]) => key === fileName,
	);
	if (!descEntry) {
		throw new Error(`No behavioral description found for ${fileName}`);
	}
	const desc = descEntry[1];

	const triggers = desc.triggers.map((t) => `- ${t}`).join('\n');
	const contains = desc.contains.map((c) => `- ${c}`).join('\n');
	const antiPatterns = desc.antiPatterns
		.map((ap) => `${ap.pattern} (→ ${ap.correctFile})`)
		.join(' | ');

	return `**${displayName.toUpperCase()}** - ${desc.purpose} (${desc.updateFrequency})

WHEN TO USE:
${triggers}

CONTAINS:
${contains}

ACTIONS:
- get: Retrieve current content
- update: Save new content (requires content param)
- delete: Remove file

USAGE: { action: "get" }
USAGE: { action: "update", content: "New content here..." }

💡 TIP: ${desc.tip}
❌ NOT FOR: ${antiPatterns}`.trim();
}

export function createMemoryFileTool(
	fileName: CoreMemoryFileName,
	repository: MemoryRepository,
) {
	const displayName = getFileDisplayName(fileName);

	return {
		name: `memory-${fileName}`,
		description: createBehavioralDescription(fileName),
		parameters: MemoryFileActionInputSchema,
		execute: async (input: MemoryFileActionInput) => {
			const { action, content } = input;
			console.error(
				`[DevFlow:INFO] memory-${fileName} called with action: ${action}`,
			);

			try {
				switch (action) {
					case 'get': {
						const memory = await repository.getMemory(fileName);
						console.error(
							`[DevFlow:INFO] Memory operation succeeded: get for ${fileName}`,
						);
						return {
							type: 'text' as const,
							text: JSON.stringify({
								frontmatter: memory.frontmatter,
								content: memory.content,
							}),
						};
					}

					case 'update': {
						if (!content) {
							console.error(
								`[DevFlow:ERROR] memory-${fileName} failed: update action requires content parameter`,
							);
							return {
								type: 'text' as const,
								text: JSON.stringify({
									error: 'Content required for update action',
									action,
								}),
							};
						}

						await repository.saveMemory(fileName, {
							frontmatter: {},
							content,
						});
						console.error(
							`[DevFlow:INFO] Memory operation succeeded: update for ${fileName}`,
						);
						return {
							type: 'text' as const,
							text: JSON.stringify({
								success: true,
								action: 'update',
								name: fileName,
								message: `${displayName} updated successfully`,
							}),
						};
					}

					case 'delete': {
						await repository.deleteMemory(fileName);
						console.error(
							`[DevFlow:INFO] Memory operation succeeded: delete for ${fileName}`,
						);
						return {
							type: 'text' as const,
							text: JSON.stringify({
								success: true,
								action: 'delete',
								name: fileName,
								message: `${displayName} deleted successfully`,
							}),
						};
					}

					default: {
						const exhaustiveCheck: never = action;
						console.error(
							`[DevFlow:ERROR] Invalid action for memory-${fileName}: ${exhaustiveCheck}`,
						);
						return {
							type: 'text' as const,
							text: JSON.stringify({
								error: 'Invalid action',
								validActions: ['get', 'update', 'delete'],
							}),
						};
					}
				}
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:ERROR] memory-${fileName} failed: FileNotFoundError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Memory file not found',
							name: fileName,
							action,
						}),
					};
				}

				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] memory-${fileName} failed: ValidationError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Invalid memory file',
							message: error.message,
							action,
						}),
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] memory-${fileName} failed: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						error: `Failed to ${action} memory`,
						message: errorMessage,
						action,
					}),
				};
			}
		},
	};
}

// Global tools

const MemoryListInputSchema = z.object({}).optional();

export function createMemoryListTool() {
	return {
		name: 'memory-list',
		description:
			'List all 6 core memory files in the memory bank with metadata',
		parameters: MemoryListInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory-list`);

			try {
				const coreFiles: CoreMemoryFileName[] = [
					'projectBrief',
					'productContext',
					'systemPatterns',
					'techContext',
					'activeContext',
					'progress',
				];

				const memories = coreFiles.map((name) => ({
					name,
					displayName: getFileDisplayName(name),
					isCoreFile: true,
					category: getCategoryForFile(name),
				}));

				console.error(
					`[DevFlow:INFO] Memory operation succeeded: list (6 core files)`,
				);

				return {
					type: 'text' as const,
					text: JSON.stringify(
						{
							memories,
							count: memories.length,
							structure: '6-file',
						},
						undefined,
						2,
					),
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory tool failed: memory-list - Error: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						error: 'Failed to list memories',
						message: errorMessage,
					}),
				};
			}
		},
	};
}

function getCategoryForFile(fileName: CoreMemoryFileName): string {
	const categories: Record<CoreMemoryFileName, string> = {
		projectBrief: 'foundation',
		productContext: 'foundation',
		systemPatterns: 'architecture',
		techContext: 'architecture',
		activeContext: 'working-memory',
		progress: 'working-memory',
	};

	const entry = Object.entries(categories).find(([key]) => key === fileName);
	return entry ? entry[1] : 'unknown';
}

const MemoryContextInputSchema = z.object({}).optional();

export function createMemoryContextTool(repository: MemoryRepository) {
	return {
		name: 'memory-context',
		description: 'Get combined memory context from all 6 core memory files',
		parameters: MemoryContextInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory-context`);

			const sections: string[] = [];
			const coreFiles: CoreMemoryFileName[] = [
				'projectBrief',
				'productContext',
				'systemPatterns',
				'techContext',
				'activeContext',
				'progress',
			];

			let filesLoaded = 0;

			for (const fileName of coreFiles) {
				try {
					const memory = await repository.getMemory(fileName);
					const displayName = getFileDisplayName(fileName);

					sections.push(
						`# ${displayName}`,
						'',
						memory.content,
						'',
						'---',
						'',
					);

					filesLoaded++;
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Unknown error';
					console.error(
						`[DevFlow:WARN] Could not load ${fileName}: ${errorMessage}`,
					);
				}
			}

			const combinedText = sections.join('\n');

			console.error(
				`[DevFlow:INFO] Memory operation succeeded: context (loaded ${filesLoaded}/6 files)`,
			);

			return {
				type: 'text' as const,
				text: combinedText,
			};
		},
	};
}

const MemoryUpdateInputSchema = z.object({}).optional();

export function createMemoryUpdateTool(repository: MemoryRepository) {
	return {
		name: 'memory-update',
		description:
			'Review all 6 core memory files with guided update workflow',
		parameters: MemoryUpdateInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory-update`);

			const sections: string[] = [
				'# Memory Bank Update Workflow',
				'',
				'Review each core memory file below. Update files as needed using the memory-{fileName} tools.',
				'',
				'**Available tools for updates:**',
				'- `memory-projectBrief { action: "update", content: "..." }`',
				'- `memory-productContext { action: "update", content: "..." }`',
				'- `memory-systemPatterns { action: "update", content: "..." }`',
				'- `memory-techContext { action: "update", content: "..." }`',
				'- `memory-activeContext { action: "update", content: "..." }`',
				'- `memory-progress { action: "update", content: "..." }`',
				'',
				'---',
				'',
			];

			const filesToLoad: Array<{
				name: CoreMemoryFileName;
				displayName: string;
			}> = [
				{ name: 'projectBrief', displayName: 'Project Brief' },
				{ name: 'productContext', displayName: 'Product Context' },
				{ name: 'systemPatterns', displayName: 'System Patterns' },
				{ name: 'techContext', displayName: 'Technical Context' },
				{ name: 'activeContext', displayName: 'Active Context' },
				{ name: 'progress', displayName: 'Progress' },
			];

			let filesLoaded = 0;
			const failedFiles: string[] = [];

			for (const { name, displayName } of filesToLoad) {
				try {
					const memory = await repository.getMemory(name);

					sections.push(
						`## ${displayName}`,
						'',
						`**File:** \`${name}.md\` | **Update:** \`memory-${name} { action: "update", content: "..." }\``,
						'',
						'### Current Content',
						'',
						'```markdown',
						memory.content,
						'```',
						'',
						'---',
						'',
					);

					filesLoaded++;
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Unknown error';
					console.error(
						`[DevFlow:WARN] Could not load ${name}: ${errorMessage}`,
					);

					sections.push(
						`## ${displayName}`,
						'',
						`**Status:** ⚠️ File not found or error loading`,
						'',
						`**Create:** \`memory-${name} { action: "update", content: "..." }\``,
						'',
						'---',
						'',
					);

					failedFiles.push(name);
				}
			}

			const missingFilesSuffix =
				failedFiles.length > 0
					? ` (${failedFiles.length} files missing or failed to load)`
					: '';
			const successMessage = `Memory operation succeeded: update workflow (loaded ${filesLoaded}/6 files${missingFilesSuffix})`;
			const summary = `Review complete. ${filesLoaded} of 6 files loaded.${
				failedFiles.length > 0
					? ` Missing: ${failedFiles.join(', ')}`
					: ''
			}`;

			sections.push('## Summary', '', summary, '');

			console.error(`[DevFlow:INFO] ${successMessage}`);

			return {
				type: 'text' as const,
				text: sections.join('\n'),
			};
		},
	};
}

const MemoryInitInputSchema = z.object({}).optional();

export function createMemoryInitTool(repository: MemoryRepository) {
	return {
		name: 'memory-init',
		description: 'Initialize memory bank with 6 core template files',
		parameters: MemoryInitInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory-init`);

			try {
				const loadedTemplates = await loadAllTemplates();
				const results: Array<{ name: string; success: boolean }> = [];

				for (const template of loadedTemplates) {
					try {
						await repository.saveMemory(
							template.name as CoreMemoryFileName,
							{
								frontmatter: template.frontmatter,
								content: template.content,
							},
						);
						results.push({ name: template.name, success: true });
						console.error(
							`[DevFlow:INFO] Created template for ${template.name}`,
						);
					} catch (error) {
						results.push({ name: template.name, success: false });
						const errorMessage =
							error instanceof Error
								? error.message
								: 'Unknown error';
						console.error(
							`[DevFlow:ERROR] Failed to create ${template.name}: ${errorMessage}`,
						);
					}
				}

				const successCount = results.filter((r) => r.success).length;
				const message = `Memory bank initialized with ${successCount} of 6 core files`;

				console.error(`[DevFlow:INFO] ${message}`);

				return {
					type: 'text' as const,
					text: JSON.stringify(
						{
							success: true,
							message,
							files: results,
						},
						undefined,
						2,
					),
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Failed to load templates: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						success: false,
						error: 'Failed to initialize memory bank',
						message: errorMessage,
					}),
				};
			}
		},
	};
}
