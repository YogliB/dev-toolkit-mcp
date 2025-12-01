import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GitAnalyzer } from '../../../../../src/core/analysis/git/git-analyzer';
import { createTestProject } from '../../../../setup/test-helpers';

describe('GitAnalyzer', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;

	beforeEach(async () => {
		testProject = await createTestProject({ withGit: true });
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should initialize with project root', () => {
		const analyzer = new GitAnalyzer(testProject.root);
		expect(analyzer).toBeDefined();
	});

	it('should return empty string for file hash when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const hash = await analyzer.getFileHash('nonexistent.ts');
		expect(hash).toBe('');
	});

	it('should return empty string for current commit SHA when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const sha = await analyzer.getCurrentCommitSHA();
		expect(sha).toBe('');
	});

	it('should return empty array for recent decisions when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const decisions = await analyzer.getRecentDecisions('1 day ago');
		expect(decisions).toEqual([]);
	});

	it('should return default change velocity when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const velocity = await analyzer.analyzeChangeVelocity(
			'test.ts',
			'1 day ago',
		);

		expect(velocity.path).toBe('test.ts');
		expect(velocity.commitCount).toBe(0);
		expect(velocity.lastModified).toBe('');
		expect(velocity.authors).toEqual([]);
	});

	it('should return empty array for commit messages when git fails', async () => {
		const analyzer = new GitAnalyzer(testProject.root);
		const messages = await analyzer.getCommitMessages('1 day ago');
		expect(messages).toEqual([]);
	});
});
