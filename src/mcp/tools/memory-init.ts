import { z } from 'zod';
import { MemoryRepository } from '../../layers/memory/repository';
import { ValidationError } from '../../core/storage/errors';
import { loadAllTemplates } from '../../layers/memory/templates/loader';

const MemoryInitInputSchema = z.object({}).optional();

export interface InitializationResult {
	success: boolean;
	message: string;
	filesCreated: string[];
	path: string;
	timestamp: string;
	structure: string;
	hierarchy: string;
}

export function createMemoryInitTool(repository: MemoryRepository) {
	return {
		name: 'memory-init',
		description:
			'Initialize memory bank with 6 core files (Cline structure): projectBrief, productContext, systemPatterns, techContext, activeContext, progress',
		parameters: MemoryInitInputSchema,
		execute: async (): Promise<{
			type: 'text';
			text: string;
		}> => {
			console.error(
				'[DevFlow:INFO] Memory initialization tool called: memory-init',
			);

			try {
				const filesCreated: string[] = [];
				const timestamp = new Date().toISOString();

				// Check for legacy structure
				const existingFiles = await repository.listMemories();
				const hasLegacyFiles = existingFiles.some(
					(file) =>
						file.name === 'projectContext' ||
						file.name === 'decisionLog',
				);

				if (hasLegacyFiles) {
					console.error(
						'[DevFlow:WARN] Memory initialization: legacy 4-file structure detected',
					);
				}

				const templates = await loadAllTemplates();

				for (const template of templates) {
					try {
						await repository.saveMemory(template.name, {
							frontmatter: template.frontmatter,
							content: template.content,
						});

						filesCreated.push(template.name);
						console.error(
							`[DevFlow:INFO] Memory initialization: created ${template.name}.md`,
						);
					} catch (error) {
						const errorMessage =
							error instanceof Error
								? error.message
								: 'Unknown error';
						console.error(
							`[DevFlow:WARN] Memory initialization: failed to create ${template.name}.md - ${errorMessage}`,
						);

						throw error;
					}
				}

				// Build hierarchy visualization
				const hierarchyText = [
					'',
					'File Hierarchy:',
					'projectBrief.md (foundation)',
					'├── productContext.md (why/how)',
					'├── systemPatterns.md (architecture + decisions)',
					'└── techContext.md (tech stack)',
					'    ├── activeContext.md (current work)',
					'    └── progress.md (tracking)',
					'',
				].join('\n');

				const result: InitializationResult = {
					success: true,
					message:
						'Memory bank initialized successfully with 6 core files (Cline structure)',
					filesCreated,
					path: '.devflow/memory',
					timestamp,
					structure: 'cline-6-file',
					hierarchy: hierarchyText,
				};

				console.error(
					`[DevFlow:INFO] Memory initialization succeeded: created ${filesCreated.length} files`,
				);

				// Add deprecation warning if legacy files exist
				let responseText = JSON.stringify(result, undefined, 2);
				if (hasLegacyFiles) {
					responseText +=
						'\n\n⚠️  DEPRECATION WARNING: Legacy 4-file structure detected (projectContext.md, decisionLog.md).\n' +
						'The new 6-file Cline structure is recommended. See MIGRATION.md for upgrade instructions.\n' +
						'Legacy files will continue to work but are no longer created by memory-init.';
				}

				return {
					type: 'text' as const,
					text: responseText,
				};
			} catch (error) {
				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] Memory initialization failed: ValidationError - ${error.message}`,
					);

					return {
						type: 'text' as const,
						text: JSON.stringify({
							success: false,
							error: 'Validation failed',
							message: error.message,
						}),
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Memory initialization failed: ${errorMessage}`,
				);

				return {
					type: 'text' as const,
					text: JSON.stringify({
						success: false,
						error: 'Initialization failed',
						message: errorMessage,
					}),
				};
			}
		},
	};
}
