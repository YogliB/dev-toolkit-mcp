import { MemoryRepository } from '../../layers/memory/repository';
import { FileNotFoundError, ValidationError } from '../../core/storage/errors';
import type { Resource, ResourceTemplate, ResourceResult } from 'fastmcp';

type SessionAuth = Record<string, unknown> | undefined;

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

export function createContextResource(
	repository: MemoryRepository,
): Resource<SessionAuth> {
	return {
		uri: 'devflow://context/memory',
		name: 'Memory Bank Context',
		description: 'Auto-loaded context from all 6 core memory files',
		mimeType: 'text/markdown',
		load: async (): Promise<ResourceResult | ResourceResult[]> => {
			console.error(
				'[DevFlow:INFO] Resource called: devflow://context/memory',
			);

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
						`[DevFlow:INFO] Resource operation: context (${fileName} loaded)`,
					);
				} catch (error) {
					if (error instanceof FileNotFoundError) {
						console.error(
							`[DevFlow:WARN] Resource operation partial: ${fileName}.md missing`,
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
						`[DevFlow:WARN] Resource operation: decisionLog.md is deprecated`,
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
				`[DevFlow:INFO] Resource operation succeeded: context (loaded ${filesLoaded}/6 files)`,
			);

			return {
				text: combinedText,
				mimeType: 'text/markdown',
				uri: 'devflow://context/memory',
			};
		},
	};
}

interface MemoryResourceArguments {
	name: string;
}

export function createMemoryResourceTemplate(
	repository: MemoryRepository,
): ResourceTemplate<
	SessionAuth,
	[{ name: 'name'; description: string; required: true }]
> {
	return {
		uriTemplate: 'devflow://memory/{name}',
		name: 'Memory File',
		description: 'Access individual memory file by name',
		mimeType: 'text/markdown',
		arguments: [
			{
				name: 'name',
				description: 'Name of the memory file to retrieve',
				required: true,
			},
		],
		load: async (
			arguments_: MemoryResourceArguments,
		): Promise<ResourceResult | ResourceResult[]> => {
			const { name } = arguments_;
			console.error(
				`[DevFlow:INFO] Resource called: devflow://memory/{name} with args: { name: "${name}" }`,
			);

			// Add deprecation warning for decisionLog
			if (name === 'decisionLog') {
				console.error(
					`[DevFlow:WARN] Resource access: decisionLog.md is deprecated`,
				);
			}

			try {
				const memory = await repository.getMemory(name);

				const frontmatterLines: string[] = [];
				if (
					memory.frontmatter &&
					Object.keys(memory.frontmatter).length > 0
				) {
					frontmatterLines.push('---');
					for (const [key, value] of Object.entries(
						memory.frontmatter,
					)) {
						frontmatterLines.push(
							`${key}: ${JSON.stringify(value)}`,
						);
					}
					frontmatterLines.push('---', '');
				}

				let text =
					frontmatterLines.length > 0
						? frontmatterLines.join('\n') + memory.content
						: memory.content;

				// Add deprecation notice for decisionLog
				if (name === 'decisionLog') {
					text =
						'⚠️  DEPRECATED: decisionLog.md is deprecated. Migrate content to systemPatterns.md.\n\n' +
						text;
				}

				console.error(
					`[DevFlow:INFO] Resource operation succeeded: memory file "${name}"`,
				);

				return {
					text,
					mimeType: 'text/markdown',
					uri: `devflow://memory/${name}`,
				};
			} catch (error) {
				if (error instanceof FileNotFoundError) {
					console.error(
						`[DevFlow:ERROR] Resource failed: devflow://memory/{name} - FileNotFoundError: Memory "${name}" not found`,
					);
					return {
						text: `# Error: Memory Not Found\n\nMemory file "${name}" could not be found in the memory bank.`,
						mimeType: 'text/markdown',
						uri: `devflow://memory/${name}`,
					};
				}

				if (error instanceof ValidationError) {
					console.error(
						`[DevFlow:ERROR] Resource failed: devflow://memory/{name} - ValidationError: ${error.message}`,
					);
					return {
						text: `# Error: Invalid Memory Name\n\n${error.message}`,
						mimeType: 'text/markdown',
						uri: `devflow://memory/${name}`,
					};
				}

				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				console.error(
					`[DevFlow:ERROR] Resource failed: devflow://memory/{name} - Error: ${errorMessage}`,
				);
				return {
					text: `# Error: Failed to Load Memory\n\n${errorMessage}`,
					mimeType: 'text/markdown',
					uri: `devflow://memory/${name}`,
				};
			}
		},
	};
}
