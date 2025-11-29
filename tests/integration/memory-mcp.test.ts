import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { StorageEngine } from '../../src/core/storage/engine';
import { MemoryRepository } from '../../src/layers/memory/repository';
import {
	createMemoryFileTool,
	createMemoryListTool,
	createMemoryInitTool,
	createMemoryContextTool,
	createMemoryUpdateTool,
} from '../../src/mcp/tools/memory';
import type { CoreMemoryFileName } from '../../src/core/schemas/memory';
import {
	createContextResource,
	createMemoryResourceTemplate,
} from '../../src/mcp/resources/memory';

describe('[Integration:Memory] Memory MCP End-to-End with File-Specific Tools', () => {
	let temporaryDirectory: string;
	let storageEngine: StorageEngine;
	let repository: MemoryRepository;

	beforeEach(async () => {
		const prefix = path.join(os.tmpdir(), 'memory-mcp-test-');
		temporaryDirectory = await mkdtemp(prefix);

		storageEngine = new StorageEngine({
			rootPath: temporaryDirectory,
			debug: false,
		});

		repository = new MemoryRepository({
			storageEngine,
			memorybankPath: '.devflow/memory',
		});
	});

	afterEach(async () => {
		try {
			await rm(temporaryDirectory, { recursive: true, force: true });
		} catch {
			// Ignore cleanup errors
		}
	});

	// ============ FILE-SPECIFIC TOOL TESTS ============

	describe('File-specific composite tools', () => {
		const coreFiles: CoreMemoryFileName[] = [
			'projectBrief',
			'productContext',
			'systemPatterns',
			'techContext',
			'activeContext',
			'progress',
		];

		describe('action: get', () => {
			it('retrieves content for each core file', async () => {
				// Create all 6 core files
				for (const fileName of coreFiles) {
					await repository.saveMemory(fileName, {
						frontmatter: {},
						content: `Test content for ${fileName}`,
					});
				}

				// Test get action for each file
				for (const fileName of coreFiles) {
					const tool = createMemoryFileTool(fileName, repository);
					const result = await tool.execute({ action: 'get' });

					expect(result.type).toBe('text');
					const parsed = JSON.parse(result.text);
					expect(parsed.content).toBe(`Test content for ${fileName}`);
					expect(parsed.frontmatter).toBeDefined();
				}
			});

			it('returns error when file does not exist', async () => {
				const tool = createMemoryFileTool('projectBrief', repository);
				const result = await tool.execute({ action: 'get' });

				expect(result.type).toBe('text');
				const parsed = JSON.parse(result.text);
				expect(parsed.error).toBe('Memory file not found');
				expect(parsed.name).toBe('projectBrief');
				expect(parsed.action).toBe('get');
			});
		});

		describe('action: update', () => {
			it('creates new file with content', async () => {
				const tool = createMemoryFileTool('activeContext', repository);
				const result = await tool.execute({
					action: 'update',
					content: '# Active Context\n\nCurrent work goes here.',
				});

				expect(result.type).toBe('text');
				const parsed = JSON.parse(result.text);
				expect(parsed.success).toBe(true);
				expect(parsed.action).toBe('update');
				expect(parsed.name).toBe('activeContext');
				expect(parsed.message).toContain('Active Context updated');

				// Verify file was created
				const memory = await repository.getMemory('activeContext');
				expect(memory.content).toBe(
					'# Active Context\n\nCurrent work goes here.',
				);
			});

			it('updates existing file with new content', async () => {
				// Create initial file
				await repository.saveMemory('progress', {
					frontmatter: {},
					content: 'Old progress',
				});

				// Update it
				const tool = createMemoryFileTool('progress', repository);
				const result = await tool.execute({
					action: 'update',
					content: 'New progress log',
				});

				expect(result.type).toBe('text');
				const parsed = JSON.parse(result.text);
				expect(parsed.success).toBe(true);

				// Verify update
				const memory = await repository.getMemory('progress');
				expect(memory.content).toBe('New progress log');
			});

			it('returns error when content is missing', async () => {
				const tool = createMemoryFileTool('projectBrief', repository);
				const result = await tool.execute({
					action: 'update',
				} as MemoryFileActionInput);

				expect(result.type).toBe('text');
				const parsed = JSON.parse(result.text);
				expect(parsed.error).toBe('Content required for update action');
				expect(parsed.action).toBe('update');
			});
		});

		describe('action: delete', () => {
			it('deletes existing file', async () => {
				// Create file
				await repository.saveMemory('techContext', {
					frontmatter: {},
					content: 'Tech stack info',
				});

				// Delete it
				const tool = createMemoryFileTool('techContext', repository);
				const result = await tool.execute({ action: 'delete' });

				expect(result.type).toBe('text');
				const parsed = JSON.parse(result.text);
				expect(parsed.success).toBe(true);
				expect(parsed.action).toBe('delete');
				expect(parsed.name).toBe('techContext');

				// Verify deletion
				const getTool = createMemoryFileTool('techContext', repository);
				const getResult = await getTool.execute({ action: 'get' });
				const getParsed = JSON.parse(getResult.text);
				expect(getParsed.error).toBe('Memory file not found');
			});

			it('handles deletion of non-existent file gracefully', async () => {
				const tool = createMemoryFileTool('systemPatterns', repository);
				const result = await tool.execute({ action: 'delete' });

				expect(result.type).toBe('text');
				const parsed = JSON.parse(result.text);
				expect(parsed.error).toBe('Memory file not found');
				expect(parsed.action).toBe('delete');
			});
		});

		describe('tool metadata', () => {
			it('has correct name for each file', () => {
				for (const fileName of coreFiles) {
					const tool = createMemoryFileTool(fileName, repository);
					expect(tool.name).toBe(`memory-${fileName}`);
				}
			});

			it('includes behavioral description', () => {
				const tool = createMemoryFileTool('activeContext', repository);
				expect(tool.description).toContain('ACTIVE CONTEXT');
				expect(tool.description).toContain('WHEN TO USE:');
				expect(tool.description).toContain('CONTAINS:');
				expect(tool.description).toContain('ACTIONS:');
				expect(tool.description).toContain('💡 TIP:');
				expect(tool.description).toContain('❌ NOT FOR:');
			});

			it('description includes trigger phrases', () => {
				const tool = createMemoryFileTool('projectBrief', repository);
				expect(tool.description).toContain('what are we building?');
			});

			it('description includes anti-patterns', () => {
				const tool = createMemoryFileTool('systemPatterns', repository);
				expect(tool.description).toContain('NOT FOR:');
				expect(tool.description).toContain('techContext');
			});
		});
	});

	// ============ GLOBAL TOOLS TESTS ============

	describe('memory-list tool', () => {
		it('always returns 6 core files', async () => {
			const tool = createMemoryListTool();
			const result = await tool.execute();

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.memories).toBeArrayOfSize(6);
			expect(parsed.count).toBe(6);
			expect(parsed.structure).toBe('6-file');

			// Verify all core files are present
			const memoryNames = parsed.memories.map(
				(m: { name: string }) => m.name,
			);
			expect(memoryNames).toContain('projectBrief');
			expect(memoryNames).toContain('productContext');
			expect(memoryNames).toContain('systemPatterns');
			expect(memoryNames).toContain('techContext');
			expect(memoryNames).toContain('activeContext');
			expect(memoryNames).toContain('progress');
		});

		it('marks all files as core files', async () => {
			const tool = createMemoryListTool();
			const result = await tool.execute();

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);

			for (const m of parsed.memories as Array<{ isCoreFile: boolean }>) {
				expect(m.isCoreFile).toBe(true);
			}
		});

		it('includes display names and categories', async () => {
			const tool = createMemoryListTool();
			const result = await tool.execute();

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);

			const projectBrief = parsed.memories.find(
				(m: { name: string }) => m.name === 'projectBrief',
			);
			expect(projectBrief.displayName).toBe('Project Brief');
			expect(projectBrief.category).toBe('foundation');

			const activeContext = parsed.memories.find(
				(m: { name: string }) => m.name === 'activeContext',
			);
			expect(activeContext.displayName).toBe('Active Context');
			expect(activeContext.category).toBe('working-memory');
		});
	});

	describe('memory-init tool', () => {
		it('creates all 6 core template files', async () => {
			const tool = createMemoryInitTool(repository);
			const result = await tool.execute();

			expect(result.type).toBe('text');
			const parsed = JSON.parse(result.text);
			expect(parsed.success).toBe(true);
			expect(parsed.message).toContain('6 of 6 core files');
			expect(parsed.files).toBeArrayOfSize(6);

			// Verify all files were created
			for (const fileResult of parsed.files as Array<{
				name: string;
				success: boolean;
			}>) {
				expect(fileResult.success).toBe(true);

				// Verify file exists and has template content
				const memory = await repository.getMemory(
					fileResult.name as CoreMemoryFileName,
				);
				expect(memory.content).toBeTruthy();
				expect(memory.content.length).toBeGreaterThan(0);
			}
		});

		it('template content includes expected sections', async () => {
			const tool = createMemoryInitTool(repository);
			await tool.execute();

			// Check projectBrief template
			const projectBrief = await repository.getMemory('projectBrief');
			expect(projectBrief.content).toContain('# Project Brief');
			expect(projectBrief.content).toContain('## Core Requirements');
			expect(projectBrief.content).toContain('## Success Criteria');

			// Check activeContext template
			const activeContext = await repository.getMemory('activeContext');
			expect(activeContext.content).toContain('# Active Context');
			expect(activeContext.content).toContain('## Current Focus');
			expect(activeContext.content).toContain('## Active Blockers');
		});
	});

	describe('memory-context tool', () => {
		it('combines all 6 core files with separators', async () => {
			// Create all core files
			await repository.saveMemory('projectBrief', {
				frontmatter: {},
				content: 'Brief content',
			});
			await repository.saveMemory('productContext', {
				frontmatter: {},
				content: 'Product content',
			});
			await repository.saveMemory('systemPatterns', {
				frontmatter: {},
				content: 'Patterns content',
			});
			await repository.saveMemory('techContext', {
				frontmatter: {},
				content: 'Tech content',
			});
			await repository.saveMemory('activeContext', {
				frontmatter: {},
				content: 'Active content',
			});
			await repository.saveMemory('progress', {
				frontmatter: {},
				content: 'Progress content',
			});

			const tool = createMemoryContextTool(repository);
			const result = await tool.execute();

			expect(result.type).toBe('text');
			expect(result.text).toContain('# Project Brief');
			expect(result.text).toContain('Brief content');
			expect(result.text).toContain('# Product Context');
			expect(result.text).toContain('Product content');
			expect(result.text).toContain('# System Patterns');
			expect(result.text).toContain('Patterns content');
			expect(result.text).toContain('# Technical Context');
			expect(result.text).toContain('Tech content');
			expect(result.text).toContain('# Active Context');
			expect(result.text).toContain('Active content');
			expect(result.text).toContain('# Progress');
			expect(result.text).toContain('Progress content');

			// Verify separators
			expect(result.text).toContain('---');
		});

		it('handles missing files gracefully', async () => {
			// Only create some files
			await repository.saveMemory('projectBrief', {
				frontmatter: {},
				content: 'Brief only',
			});

			const tool = createMemoryContextTool(repository);
			const result = await tool.execute();

			expect(result.type).toBe('text');
			expect(result.text).toContain('# Project Brief');
			expect(result.text).toContain('Brief only');
			// Should not crash or fail
		});
	});

	describe('memory-update tool', () => {
		it('returns workflow guide with all 6 files', async () => {
			// Create all files
			await repository.saveMemory('projectBrief', {
				frontmatter: {},
				content: 'Brief',
			});
			await repository.saveMemory('productContext', {
				frontmatter: {},
				content: 'Product',
			});
			await repository.saveMemory('systemPatterns', {
				frontmatter: {},
				content: 'Patterns',
			});
			await repository.saveMemory('techContext', {
				frontmatter: {},
				content: 'Tech',
			});
			await repository.saveMemory('activeContext', {
				frontmatter: {},
				content: 'Active',
			});
			await repository.saveMemory('progress', {
				frontmatter: {},
				content: 'Progress',
			});

			const tool = createMemoryUpdateTool(repository);
			const result = await tool.execute();

			expect(result.type).toBe('text');
			expect(result.text).toContain('# Memory Bank Update Workflow');
			expect(result.text).toContain('## Project Brief');
			expect(result.text).toContain('## Product Context');
			expect(result.text).toContain('## System Patterns');
			expect(result.text).toContain('## Technical Context');
			expect(result.text).toContain('## Active Context');
			expect(result.text).toContain('## Progress');
			expect(result.text).toContain('memory-projectBrief');
			expect(result.text).toContain('memory-productContext');
			expect(result.text).toContain('## Summary');
		});

		it('indicates which files are missing', async () => {
			// Only create one file
			await repository.saveMemory('activeContext', {
				frontmatter: {},
				content: 'Active work',
			});

			const tool = createMemoryUpdateTool(repository);
			const result = await tool.execute();

			expect(result.type).toBe('text');
			expect(result.text).toContain('## Active Context');
			expect(result.text).toContain('Active work');
			expect(result.text).toContain('## Summary');
			expect(result.text).toContain('1 of 6 files loaded');
		});

		it('includes update instructions for each file', async () => {
			const tool = createMemoryUpdateTool(repository);
			const result = await tool.execute();

			expect(result.type).toBe('text');
			expect(result.text).toContain(
				'memory-projectBrief { action: "update"',
			);
			expect(result.text).toContain(
				'memory-activeContext { action: "update"',
			);
		});
	});

	// ============ RESOURCES TESTS ============

	describe('devflow://context/memory resource', () => {
		it('provides combined context from all files', async () => {
			await repository.saveMemory('projectBrief', {
				frontmatter: {},
				content: 'Brief',
			});
			await repository.saveMemory('activeContext', {
				frontmatter: {},
				content: 'Active',
			});

			const resource = createContextResource(repository);
			const result = await resource.load?.();

			expect(result).toBeTruthy();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('Brief');
				expect(result.text).toContain('Active');
			}
		});
	});

	describe('devflow://memory/{name} resource template', () => {
		it('retrieves individual memory files', async () => {
			await repository.saveMemory('systemPatterns', {
				frontmatter: { title: 'Patterns' },
				content: 'Architecture patterns',
			});

			const resourceTemplate = createMemoryResourceTemplate(repository);
			const result = await resourceTemplate.load?.({
				name: 'systemPatterns',
			});

			expect(result).toBeTruthy();
			if (result && !Array.isArray(result)) {
				expect(result.text).toContain('Architecture patterns');
			}
		});
	});
});
