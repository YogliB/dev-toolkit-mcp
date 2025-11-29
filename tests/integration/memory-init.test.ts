import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { StorageEngine } from '../../src/core/storage/engine';
import { MemoryRepository } from '../../src/layers/memory/repository';
import { createMemoryInitTool } from '../../src/mcp/tools/memory-init';

describe('[Integration] Memory Init Tool End-to-End', () => {
	let temporaryDirectory: string;
	let storageEngine: StorageEngine;
	let repository: MemoryRepository;

	beforeEach(async () => {
		const prefix = path.join(os.tmpdir(), 'memory-init-test-');
		temporaryDirectory = await mkdtemp(prefix);

		storageEngine = new StorageEngine({
			rootPath: temporaryDirectory,
			debug: false,
		});

		repository = new MemoryRepository({
			storageEngine,
		});
	});

	afterEach(async () => {
		try {
			await rm(temporaryDirectory, { recursive: true, force: true });
		} catch {
			// Cleanup might fail in some cases
		}
	});

	it('should create all 6 core memory files', async () => {
		const tool = createMemoryInitTool(repository);
		const result = await tool.execute({});

		expect(result.type).toBe('text');

		const parsed = JSON.parse(result.text.split('\n\n')[0]);
		expect(parsed.success).toBe(true);
		expect(parsed.filesCreated).toHaveLength(6);

		const memories = await repository.listMemories();
		expect(memories).toContain('projectBrief');
		expect(memories).toContain('productContext');
		expect(memories).toContain('systemPatterns');
		expect(memories).toContain('techContext');
		expect(memories).toContain('activeContext');
		expect(memories).toContain('progress');
	});

	it('should create files with proper structure', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const projectBrief = await repository.getMemory('projectBrief');
		expect(projectBrief.content).toContain('# Project Brief');
		expect(projectBrief.frontmatter.category).toBe('foundation');

		const productContext = await repository.getMemory('productContext');
		expect(productContext.content).toContain('# Product Context');
		expect(productContext.frontmatter.category).toBe('product');

		const systemPatterns = await repository.getMemory('systemPatterns');
		expect(systemPatterns.content).toContain('# System Patterns');
		expect(systemPatterns.frontmatter.category).toBe('architecture');

		const techContext = await repository.getMemory('techContext');
		expect(techContext.content).toContain('# Technical Context');
		expect(techContext.frontmatter.category).toBe('technical-setup');

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.content).toContain('# Active Context');
		expect(activeContext.frontmatter.category).toBe('active-work');

		const progress = await repository.getMemory('progress');
		expect(progress.content).toContain('# Progress');
		expect(progress.frontmatter.category).toBe('tracking');
	});

	it('should not create decisionLog.md (deprecated)', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const memories = await repository.listMemories();
		expect(memories).not.toContain('decisionLog');
	});

	it('should not create old projectContext.md', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const memories = await repository.listMemories();
		expect(memories).not.toContain('projectContext');
	});

	it('should create files with placeholders for user to fill', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const projectBrief = await repository.getMemory('projectBrief');
		expect(projectBrief.content).toContain('[');
		expect(projectBrief.content).toContain(']');

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.content).toContain('[DATE]');

		const progress = await repository.getMemory('progress');
		expect(progress.content).toContain('[Milestone Name]');

		const systemPatterns = await repository.getMemory('systemPatterns');
		expect(systemPatterns.content).toContain('[Decision Title]');
	});

	it('should return correct path in result', async () => {
		const tool = createMemoryInitTool(repository);
		const result = await tool.execute({});

		const parsed = JSON.parse(result.text);
		expect(parsed.path).toBe('.devflow/memory');
	});

	it('should include timestamp in result', async () => {
		const tool = createMemoryInitTool(repository);
		const result = await tool.execute({});

		const parsed = JSON.parse(result.text);
		expect(parsed.timestamp).toBeDefined();

		const timestamp = new Date(parsed.timestamp);
		expect(timestamp).toBeInstanceOf(Date);
		expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
	});

	it('should create files with content readable by get tool', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const files = [
			'projectBrief',
			'productContext',
			'systemPatterns',
			'techContext',
			'activeContext',
			'progress',
		];

		for (const fileName of files) {
			const memory = await repository.getMemory(fileName);
			expect(memory).toBeDefined();
			expect(memory.content).toBeDefined();
			expect(memory.content.length).toBeGreaterThan(0);
			expect(memory.frontmatter).toBeDefined();
		}
	});

	it('should create files with proper frontmatter for each type', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const projectBrief = await repository.getMemory('projectBrief');
		expect(projectBrief.frontmatter).toHaveProperty(
			'category',
			'foundation',
		);
		expect(projectBrief.frontmatter).toHaveProperty('created');

		const productContext = await repository.getMemory('productContext');
		expect(productContext.frontmatter).toHaveProperty(
			'category',
			'product',
		);
		expect(productContext.frontmatter).toHaveProperty('created');

		const systemPatterns = await repository.getMemory('systemPatterns');
		expect(systemPatterns.frontmatter).toHaveProperty(
			'category',
			'architecture',
		);
		expect(systemPatterns.frontmatter).toHaveProperty('created');

		const techContext = await repository.getMemory('techContext');
		expect(techContext.frontmatter).toHaveProperty(
			'category',
			'technical-setup',
		);
		expect(techContext.frontmatter).toHaveProperty('created');

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.frontmatter).toHaveProperty(
			'category',
			'active-work',
		);
		expect(activeContext.frontmatter).toHaveProperty('created');

		const progress = await repository.getMemory('progress');
		expect(progress.frontmatter).toHaveProperty('category', 'tracking');
		expect(progress.frontmatter).toHaveProperty('created');
	});

	it('should return all created file names in result', async () => {
		const tool = createMemoryInitTool(repository);
		const result = await tool.execute({});

		const parsed = JSON.parse(result.text);
		const filesCreated = parsed.filesCreated;
		await tool.execute({});

		expect(filesCreated).toContain('projectBrief');
		expect(filesCreated).toContain('productContext');
		expect(filesCreated).toContain('systemPatterns');
		expect(filesCreated).toContain('techContext');
		expect(filesCreated).toContain('activeContext');
		expect(filesCreated).toContain('progress');
	});

	it('should create files with template sections for current context', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.content).toContain('## Current Focus');
		expect(activeContext.content).toContain('## Active Blockers');
		expect(activeContext.content).toContain('## Recent Changes');
		expect(activeContext.content).toContain('## Next Steps');
	});

	it('should create files with template sections for progress', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const progress = await repository.getMemory('progress');
		expect(progress.content).toContain('## Current Milestone');
		expect(progress.content).toContain('## Completed Milestones');
		expect(progress.content).toContain('## Metrics');
		expect(progress.content).toContain('## Known Issues');
	});

	it('should create systemPatterns with decision template sections', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const systemPatterns = await repository.getMemory('systemPatterns');
		expect(systemPatterns.content).toContain('## Key Technical Decisions');
		expect(systemPatterns.content).toContain('**Context:**');
		expect(systemPatterns.content).toContain('**Decision:**');
		expect(systemPatterns.content).toContain('**Rationale:**');
		expect(systemPatterns.content).toContain(
			'**Alternatives Considered:**',
		);
		expect(systemPatterns.content).toContain('**Consequences:**');
	});

	it('should work with full initialization workflow', async () => {
		const tool = createMemoryInitTool(repository);

		const directoryBefore = await storageEngine.exists('.devflow/memory');
		expect(directoryBefore).toBe(false);

		const result = await tool.execute({});
		const parsed = JSON.parse(result.text.split('\n\n')[0]);

		expect(parsed.success).toBe(true);
		expect(parsed.filesCreated).toHaveLength(6);

		const directoryAfter = await storageEngine.exists('.devflow/memory');
		expect(directoryAfter).toBe(true);

		const memories = await repository.listMemories();
		expect(memories.length).toBe(6);
	});

	it('should properly serialize content with markdown formatting', async () => {
		const tool = createMemoryInitTool(repository);
		await tool.execute({});

		const projectBrief = await repository.getMemory('projectBrief');

		expect(projectBrief.content).toMatch(/^# Project Brief/);
		expect(projectBrief.content).toMatch(/## What Are We Building/);
		expect(projectBrief.content).toMatch(/### /);

		const activeContext = await repository.getMemory('activeContext');
		expect(activeContext.content).toMatch(/^# Active Context/);
		expect(activeContext.content).toMatch(/\*\*Last Updated:\*\*/);
	});
});
