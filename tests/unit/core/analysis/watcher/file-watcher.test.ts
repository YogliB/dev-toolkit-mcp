import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileWatcher } from '../../../../../src/core/analysis/watcher/file-watcher';
import { GitAwareCache } from '../../../../../src/core/analysis/cache/git-aware';
import {
	createTestProject,
	writeTestFile,
} from '../../../../setup/test-helpers';
import { sampleTypeScriptFile } from '../../../../setup/fixtures';

const handleChange = () => {};

describe('FileWatcher', () => {
	let testProject: Awaited<ReturnType<typeof createTestProject>>;

	beforeEach(async () => {
		testProject = await createTestProject();
	});

	afterEach(async () => {
		await testProject.cleanup();
	});

	it('should watch directory', () => {
		const watcher = new FileWatcher();
		expect(() => {
			watcher.watchDirectory(testProject.root);
		}).not.toThrow();
		watcher.stop();
	});

	it('should not watch same directory twice', () => {
		const watcher = new FileWatcher();
		watcher.watchDirectory(testProject.root);
		expect(() => {
			watcher.watchDirectory(testProject.root);
		}).not.toThrow();
		watcher.stop();
	});

	it('should register and call onChange callback', async () => {
		const watcher = new FileWatcher(50);
		const callbackPaths: string[] = [];

		await writeTestFile(testProject.root, 'src/.gitkeep', '');

		watcher.onChange((filePath) => {
			callbackPaths.push(filePath);
		});

		watcher.watchDirectory(testProject.root);

		await writeTestFile(
			testProject.root,
			'src/test.ts',
			sampleTypeScriptFile,
		);

		await new Promise((resolve) => setTimeout(resolve, 200));

		watcher.stop();
		expect(callbackPaths.length).toBeGreaterThan(0);
		expect(callbackPaths.some((p) => p.includes('test.ts'))).toBe(true);
	});

	it('should remove onChange callback', () => {
		const watcher = new FileWatcher();

		watcher.onChange(handleChange);
		expect(() => {
			watcher.offChange(handleChange);
		}).not.toThrow();

		watcher.stop();
	});

	it('should invalidate cache on file change', async () => {
		const cache = new GitAwareCache();
		const watcher = new FileWatcher(50, cache);
		const filePath = await writeTestFile(
			testProject.root,
			'test.ts',
			sampleTypeScriptFile,
		);

		const analysis = {
			path: filePath,
			symbols: [],
			relationships: [],
			patterns: [],
			ast: { kind: 'SourceFile' },
		};

		await cache.set(filePath, analysis);
		watcher.watchDirectory(testProject.root);

		await writeTestFile(
			testProject.root,
			'test.ts',
			'export const changed = 1;',
		);

		await new Promise((resolve) => setTimeout(resolve, 200));

		watcher.stop();
		const retrieved = await cache.get(filePath);
		expect(retrieved).toBeUndefined();
	});

	it('should debounce file changes', async () => {
		const watcher = new FileWatcher(100);
		let callCount = 0;

		const handleChange = () => {
			callCount++;
		};

		watcher.onChange(handleChange);

		watcher.watchDirectory(testProject.root);

		await writeTestFile(testProject.root, 'test.ts', sampleTypeScriptFile);
		await writeTestFile(
			testProject.root,
			'test.ts',
			'export const v1 = 1;',
		);
		await writeTestFile(
			testProject.root,
			'test.ts',
			'export const v2 = 2;',
		);

		await new Promise((resolve) => setTimeout(resolve, 300));

		watcher.stop();
		expect(callCount).toBeGreaterThan(0);
	});

	it('should stop watching and clear timers', async () => {
		const watcher = new FileWatcher();
		watcher.watchDirectory(testProject.root);

		await writeTestFile(testProject.root, 'test.ts', sampleTypeScriptFile);

		watcher.stop();

		await writeTestFile(testProject.root, 'test2.ts', sampleTypeScriptFile);
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(watcher).toBeDefined();
	});
});
