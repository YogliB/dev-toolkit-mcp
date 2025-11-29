import { z } from 'zod';
import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';

function getFileDisplayName(fileName: string): string {
	const names = new Map<string, string>([
		['projectBrief', 'Project Brief'],
		['productContext', 'Product Context'],
		['systemPatterns', 'System Patterns'],
		['techContext', 'Technical Context'],
		['activeContext', 'Active Context'],
		['progress', 'Progress'],
	]);

	return names.get(fileName) ?? fileName;
}

const MemoryGetInputSchema = z.object({
	name: z.string().min(1, 'Memory name must not be empty'),
});

type MemoryGetInput = z.infer<typeof MemoryGetInputSchema>;

export function createMemoryGetTool(repository: MemoryRepository) {
	return {
		name: 'memory-get',
		description: 'Get a memory file by name',
		parameters: MemoryGetInputSchema,
		execute: async (input: MemoryGetInput) => {
			const { name } = input;
			console.error(
				`[DevFlow:INFO] Memory tool called: memory:get with input: { name: "${name}" }`,
			);

			try {
				const memory = await repository.getMemory(name);
				console.error(
					`[DevFlow:INFO] Memory operation succeeded: get for ${name}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						frontmatter: memory.frontmatter,
						content: memory.content,
					}),
				};
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:ERROR] Memory tool failed: memory:get - FileNotFoundError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Memory not found',
							name,
						}),
					};
				}

				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] Memory tool failed: memory:get - ValidationError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Invalid memory file',
							message: error.message,
						}),
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory tool failed: memory:get - Error: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						error: 'Failed to get memory',
						message: errorMessage,
					}),
				};
			}
		},
	};
}

const MemorySaveInputSchema = z.object({
	name: z.string().min(1, 'Memory name must not be empty'),
	frontmatter: z.record(z.string(), z.any()).optional(),
	content: z.string(),
});

type MemorySaveInput = z.infer<typeof MemorySaveInputSchema>;

export function createMemorySaveTool(repository: MemoryRepository) {
	return {
		name: 'memory-save',
		description: 'Save or update a memory file',
		parameters: MemorySaveInputSchema,
		execute: async (input: MemorySaveInput) => {
			const { name, frontmatter, content } = input;
			console.error(
				`[DevFlow:INFO] Memory tool called: memory:save with input: { name: "${name}", content: ${content.length} chars }`,
			);

			try {
				await repository.saveMemory(name, {
					frontmatter: frontmatter ?? {},
					content,
				});
				console.error(
					`[DevFlow:INFO] Memory operation succeeded: save for ${name}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						success: true,
						message: 'Memory saved',
						name,
					}),
				};
			} catch (error) {
				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] Memory tool failed: memory:save - ValidationError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Validation failed',
							message: error.message,
						}),
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory tool failed: memory:save - Error: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						error: 'Failed to save memory',
						message: errorMessage,
					}),
				};
			}
		},
	};
}

const MemoryListInputSchema = z.object({}).optional();

export function createMemoryListTool(repository: MemoryRepository) {
	return {
		name: 'memory-list',
		description: 'List all memory files in the memory bank with metadata',
		parameters: MemoryListInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory:list`);

			try {
				const memoryNames = await repository.listMemories();

				// Define core files for Cline 6-file structure
				const coreFiles = [
					'projectBrief',
					'productContext',
					'systemPatterns',
					'techContext',
					'activeContext',
					'progress',
				];

				// Detect structure
				const hasClineStructure = coreFiles.every((name) =>
					memoryNames.includes(name),
				);
				const hasLegacyFiles =
					memoryNames.includes('projectContext') ||
					memoryNames.includes('decisionLog');

				let structure = 'unknown';
				if (hasClineStructure) {
					structure = 'cline-6-file';
				} else if (hasLegacyFiles) {
					structure = 'legacy-4-file';
				} else if (memoryNames.length > 0) {
					structure = 'partial';
				}

				// Add metadata to each memory
				const memories = memoryNames.map((name) => {
					const isCoreFile = coreFiles.includes(name);
					const isDeprecated =
						name === 'decisionLog' || name === 'projectContext';

					return {
						name,
						isCoreFile,
						deprecated: isDeprecated ? true : undefined,
						category: isCoreFile
							? getCategoryForFile(name)
							: 'custom',
					};
				});

				console.error(
					`[DevFlow:INFO] Memory operation succeeded: list (found ${memories.length} memories, structure: ${structure})`,
				);

				const result: {
					memories: Array<{
						name: string;
						isCoreFile: boolean;
						deprecated?: boolean;
						category: string;
					}>;
					count: number;
					structure: string;
					warning?: string;
				} = {
					memories,
					count: memories.length,
					structure,
				};

				// Add deprecation warning if legacy files detected
				if (hasLegacyFiles) {
					result.warning =
						'Legacy 4-file structure detected. Consider migrating to Cline 6-file structure. See MIGRATION.md.';
				}

				return {
					type: 'text' as const,
					text: JSON.stringify(result, undefined, 2),
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory tool failed: memory:list - Error: ${errorMessage}`,
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

function getCategoryForFile(fileName: string): string {
	const categories = new Map<string, string>([
		['projectBrief', 'foundation'],
		['productContext', 'product'],
		['systemPatterns', 'architecture'],
		['techContext', 'technical-setup'],
		['activeContext', 'active-work'],
		['progress', 'tracking'],
	]);

	return categories.get(fileName) ?? 'general';
}

const MemoryDeleteInputSchema = z.object({
	name: z.string().min(1, 'Memory name must not be empty'),
});

type MemoryDeleteInput = z.infer<typeof MemoryDeleteInputSchema>;

export function createMemoryDeleteTool(repository: MemoryRepository) {
	return {
		name: 'memory-delete',
		description: 'Delete a memory file by name',
		parameters: MemoryDeleteInputSchema,
		execute: async (input: MemoryDeleteInput) => {
			const { name } = input;
			console.error(
				`[DevFlow:INFO] Memory tool called: memory:delete with input: { name: "${name}" }`,
			);

			try {
				await repository.deleteMemory(name);
				console.error(
					`[DevFlow:INFO] Memory operation succeeded: delete for ${name}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						success: true,
						message: 'Memory deleted',
						name,
					}),
				};
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:ERROR] Memory tool failed: memory:delete - FileNotFoundError: ${error.message}`,
					);
					return {
						type: 'text' as const,
						text: JSON.stringify({
							error: 'Memory not found',
							name,
						}),
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory tool failed: memory:delete - Error: ${errorMessage}`,
				);
				return {
					type: 'text' as const,
					text: JSON.stringify({
						error: 'Failed to delete memory',
						message: errorMessage,
					}),
				};
			}
		},
	};
}

const MemoryContextInputSchema = z.object({}).optional();

export function createMemoryContextTool(repository: MemoryRepository) {
	return {
		name: 'memory-context',
		description:
			'Get combined memory context from all 6 core memory files (Cline structure)',
		parameters: MemoryContextInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory-context`);

			const sections: string[] = [];
			const coreFiles = [
				'projectBrief',
				'productContext',
				'systemPatterns',
				'techContext',
				'activeContext',
				'progress',
			];
			let filesLoaded = 0;

			// Load all 6 core files in hierarchical order
			for (const fileName of coreFiles) {
				try {
					const memory = await repository.getMemory(fileName);
					sections.push(
						`# ${getFileDisplayName(fileName)}\n`,
						memory.content,
						'\n',
					);
					filesLoaded++;
					console.error(
						`[DevFlow:INFO] Memory operation: context (${fileName} loaded)`,
					);
				} catch (error) {
					if (error instanceof FileNotFoundError) {
						console.error(
							`[DevFlow:WARN] Memory operation partial: ${fileName}.md missing`,
						);
					} else {
						const errorMessage =
							error instanceof Error
								? error.message
								: 'Unknown error';
						console.error(
							`[DevFlow:WARN] Failed to load ${fileName}: ${errorMessage}`,
						);
					}
				}
			}

			// Check for deprecated decisionLog.md
			try {
				const decisionLog = await repository.getMemory('decisionLog');
				if (decisionLog) {
					console.error(
						`[DevFlow:WARN] Memory operation: decisionLog.md is deprecated - migrate to systemPatterns.md`,
					);
					sections.push(
						'\n⚠️  DEPRECATION: decisionLog.md detected. Migrate content to systemPatterns.md "Key Technical Decisions" section.\n',
					);
				}
			} catch {
				// Ignore - decisionLog doesn't exist (which is correct)
			}

			const combinedText =
				sections.length > 0
					? sections.join('\n')
					: '# Memory Bank Context\n\nNo memory files found. Use memory-init to create them.';

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
			'Review all 6 core memory files with guided update workflow (Cline structure)',
		parameters: MemoryUpdateInputSchema,
		execute: async () => {
			console.error(`[DevFlow:INFO] Memory tool called: memory-update`);

			const sections: string[] = [
				'# Memory Bank Update Workflow',
				'',
				'Your task: Review all memory files and update them to reflect current project state.',
				'',
				'## File Hierarchy',
				'',
				'Files are structured hierarchically:',
				'- **projectBrief.md** (foundation) → defines scope',
				'- **productContext.md** (why/how) → built on projectBrief',
				'- **systemPatterns.md** (architecture + decisions) → built on projectBrief + productContext',
				'- **techContext.md** (tech stack) → built on projectBrief',
				'- **activeContext.md** (current work) → references all above',
				'- **progress.md** (tracking) → archives from activeContext',
				'',
				'## Update Process',
				'',
				"1. **Review ALL 6 files** - Read each memory file below, even if some don't need updates",
				"2. **Document Current State** - Capture what's happening right now",
				'3. **Clarify Next Steps** - Identify immediate priorities and blockers',
				'4. **Document Insights** - Record patterns, lessons learned, and decisions',
				'',
				'## Focus Areas',
				'',
				'Pay particular attention to:',
				'- **projectBrief.md**: Have core requirements or scope changed?',
				'- **productContext.md**: Has user experience or product direction shifted?',
				'- **systemPatterns.md**: Any new architectural decisions or patterns?',
				'- **techContext.md**: Have technologies or setup changed?',
				'- **activeContext.md**: Is current work accurately captured?',
				'- **progress.md**: Are milestones and metrics up to date?',
				'',
				'---',
				'',
			];

			const filesToLoad = [
				'projectBrief',
				'productContext',
				'systemPatterns',
				'techContext',
				'activeContext',
				'progress',
			];

			let filesLoaded = 0;
			const failedFiles: string[] = [];

			for (const fileName of filesToLoad) {
				try {
					const memory = await repository.getMemory(fileName);
					sections.push(
						`## ${getFileDisplayName(fileName)}`,
						'',
						'```markdown',
						memory.content,
						'```',
						'',
					);
					filesLoaded++;
					console.error(
						`[DevFlow:INFO] Memory operation: loaded ${fileName}`,
					);
				} catch (error) {
					if (error instanceof FileNotFoundError) {
						console.error(
							`[DevFlow:WARN] Memory operation partial: ${fileName}.md missing`,
						);
						failedFiles.push(fileName);
						sections.push(
							`## ${getFileDisplayName(fileName)} (Not Found)`,
							'',
							`*Note: ${fileName}.md does not exist yet. Use memory-init to create it or memory-save to initialize it.*`,
							'',
						);
					} else {
						const errorMessage =
							error instanceof Error
								? error.message
								: 'Unknown error';
						console.error(
							`[DevFlow:WARN] Memory operation partial: failed to load ${fileName} - ${errorMessage}`,
						);
						failedFiles.push(fileName);
						sections.push(
							`## ${getFileDisplayName(fileName)} (Error Loading)`,
							'',
							`*Note: Could not load ${fileName}.md - ${errorMessage}*`,
							'',
						);
					}
				}
			}

			// Check for deprecated decisionLog.md
			try {
				const decisionLog = await repository.getMemory('decisionLog');
				if (decisionLog) {
					console.error(
						`[DevFlow:WARN] Memory operation: decisionLog.md is deprecated`,
					);
					sections.push(
						'## ⚠️  decisionLog.md (DEPRECATED)',
						'',
						'```markdown',
						decisionLog.content,
						'```',
						'',
						'**ACTION REQUIRED:** Migrate this content to systemPatterns.md under "Key Technical Decisions" section.',
						'',
					);
				}
			} catch {
				// Ignore - file doesn't exist
			}

			sections.push(
				'---',
				'',
				'## What to Update',
				'',
				'### For Each File:',
				'',
				'**projectBrief.md:**',
				'- [ ] Core requirements are still accurate',
				'- [ ] Goals reflect current direction',
				'- [ ] Scope boundaries are correct (what changed?)',
				'- [ ] Success criteria are still valid',
				'- [ ] Timeline/milestones are current',
				'',
				'**productContext.md:**',
				'- [ ] Problems being solved are still relevant',
				'- [ ] User experience goals match reality',
				'- [ ] Core workflows are documented',
				'- [ ] Product principles guide decisions',
				'- [ ] Success metrics are measurable',
				'',
				'**systemPatterns.md:**',
				'- [ ] Architecture diagram is current',
				'- [ ] Component relationships are accurate',
				'- [ ] Design patterns reflect actual implementation',
				'- [ ] Architectural decisions are documented with full context',
				'- [ ] Technical debt is tracked',
				'',
				'**techContext.md:**',
				'- [ ] Technology stack versions are current',
				'- [ ] Development setup instructions work',
				'- [ ] Dependencies are up to date',
				'- [ ] Technical constraints are documented',
				'- [ ] Build and release process is accurate',
				'',
				'**activeContext.md:**',
				"- [ ] Current focus accurately describes what's being worked on NOW",
				'- [ ] All active blockers are listed with current status',
				'- [ ] Recent changes (last 7 days) are documented',
				'- [ ] Context notes reflect important patterns or considerations',
				'- [ ] Next steps are clear priorities',
				'- [ ] Archive entries older than 7 days to progress.md',
				'',
				'**progress.md:**',
				'- [ ] Current milestone status and percentage are accurate',
				'- [ ] Task completion status is up-to-date',
				'- [ ] Metrics (velocity, resolution time, trends) are current',
				'- [ ] Known issues reflect real problems with severity',
				'- [ ] Lessons learned are documented',
				'- [ ] Risk tracking is current',
				'- [ ] Archive old entries (>90 days)',
				'',
				'## Next Steps After Review',
				'',
				'After reviewing, update files using memory-save tool:',
				'',
				'```json',
				'{',
				'  "name": "activeContext",',
				'  "content": "# Updated content...",',
				'  "frontmatter": {',
				'    "category": "active-work",',
				'    "updated": "2024-03-20T14:30:00Z"',
				'  }',
				'}',
				'```',
				'',
				'Use memory-list to see all files, memory-get to retrieve specific files.',
				'',
				'## Tips',
				'',
				'- **Be specific:** Use dates, file names, and concrete examples',
				'- **Link decisions:** Reference decision numbers when relevant',
				'- **Archive old work:** Move entries >30 days old from activeContext to progress',
				'- **Update timestamps:** Mark when updates occur',
				'- **Document blockers:** Severity, impact, and workarounds',
				'- **Track metrics:** Velocity helps predict future milestones',
				'',
			);

			const missingFilesSuffix =
				failedFiles.length > 0
					? ` (missing: ${failedFiles.join(', ')})`
					: '';
			const successMessage = `Successfully loaded ${filesLoaded}/6 memory files${missingFilesSuffix}`;
			const summary =
				filesLoaded > 0
					? successMessage
					: 'No memory files found. Use memory-init to create them.';

			console.error(
				`[DevFlow:INFO] Memory operation succeeded: update loaded ${filesLoaded} files`,
			);

			sections.push(
				'---',
				'',
				`**Status:** ${summary}`,
				'',
				'**Structure:** Cline 6-file hierarchy (projectBrief → productContext → systemPatterns → techContext → activeContext → progress)',
				'',
				'Begin by reviewing the memory files above, then use the memory-save tool to update them.',
			);

			return {
				type: 'text' as const,
				text: sections.join('\n'),
			};
		},
	};
}

export { createMemoryInitTool } from './memory-init';
