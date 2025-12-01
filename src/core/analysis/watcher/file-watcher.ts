import fs from 'node:fs';
import path from 'node:path';
import type { GitAwareCache } from '../cache/git-aware';

export type FileChangeCallback = (filePath: string) => void | Promise<void>;

type FSWatcher = ReturnType<typeof fs.watch>;

const boundWatch = fs.watch.bind(fs);

const EXCLUSION_PATTERNS = [
	'node_modules',
	'.git',
	'.cache',
	'.npm',
	'dist',
	'build',
	'.next',
	'.turbo',
	'coverage',
];

const MAX_FILE_COUNT_ESTIMATE = 10_000;
export const MAX_FILE_COUNT_THRESHOLD = 100_000;

function shouldIncludeDirectory(directoryName: string): boolean {
	return !EXCLUSION_PATTERNS.includes(directoryName);
}

async function processDirectoryEntries(
	currentDirectory: string,
	directoriesToProcess: string[],
	fileCount: number,
): Promise<number> {
	const { readdir } = await import('node:fs/promises');
	const entries = await readdir(currentDirectory, { withFileTypes: true });
	let newFileCount = fileCount;

	for (const entry of entries) {
		if (newFileCount >= MAX_FILE_COUNT_ESTIMATE) {
			break;
		}

		if (entry.isFile()) {
			newFileCount++;
			continue;
		}

		if (entry.isDirectory()) {
			const directoryName = entry.name;
			if (shouldIncludeDirectory(directoryName)) {
				const fullPath = path.join(currentDirectory, entry.name);
				directoriesToProcess.push(fullPath);
			}
		}
	}

	return newFileCount;
}

export async function estimateDirectorySize(
	directoryPath: string,
): Promise<number> {
	let fileCount = 0;
	const directoriesToProcess: string[] = [directoryPath];

	while (
		directoriesToProcess.length > 0 &&
		fileCount < MAX_FILE_COUNT_ESTIMATE
	) {
		const currentDirectory = directoriesToProcess.shift()!;

		try {
			fileCount = await processDirectoryEntries(
				currentDirectory,
				directoriesToProcess,
				fileCount,
			);
		} catch {
			continue;
		}
	}

	if (fileCount >= MAX_FILE_COUNT_ESTIMATE) {
		return Math.max(fileCount, MAX_FILE_COUNT_THRESHOLD);
	}

	return fileCount;
}

export class FileWatcher {
	private watchers: Map<string, FSWatcher> = new Map();
	private callbacks: Set<FileChangeCallback> = new Set();
	private debounceTime: number;
	private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
	private cache?: GitAwareCache;
	private readonly exclusionPatterns: string[];

	constructor(debounceTime = 100, cache?: GitAwareCache) {
		this.debounceTime = debounceTime;
		this.cache = cache;
		this.exclusionPatterns = [...EXCLUSION_PATTERNS];
	}

	private shouldExcludePath(filePath: string, rootPath: string): boolean {
		const relativePath = path.relative(rootPath, filePath);
		const pathParts = relativePath.split(path.sep);

		for (const part of pathParts) {
			if (this.exclusionPatterns.includes(part)) {
				return true;
			}
		}

		return false;
	}

	async watchDirectory(directoryPath: string): Promise<void> {
		if (this.watchers.has(directoryPath)) {
			return;
		}

		const resolvedDirectoryPath = path.resolve(directoryPath);
		const estimatedSize = await estimateDirectorySize(
			resolvedDirectoryPath,
		);

		if (estimatedSize >= MAX_FILE_COUNT_THRESHOLD) {
			throw new Error(
				`Directory too large to watch (estimated ${estimatedSize} files). ` +
					`Please set DEVFLOW_ROOT environment variable to a smaller project directory.`,
			);
		}

		if (estimatedSize > 10_000) {
			console.error(
				`[FileWatcher:WARN] Large directory detected (estimated ${estimatedSize} files). ` +
					`Watching may impact performance.`,
			);
		}

		const watcher = boundWatch(
			resolvedDirectoryPath,
			{ recursive: true },
			(eventType, filename) => {
				if (!filename) {
					return;
				}

				const filePath = path.join(resolvedDirectoryPath, filename);

				if (this.shouldExcludePath(filePath, resolvedDirectoryPath)) {
					return;
				}

				const existingTimer = this.debounceTimers.get(filePath);
				if (existingTimer) {
					clearTimeout(existingTimer);
				}

				const timer = setTimeout(() => {
					this.handleFileChange(filePath);
					this.debounceTimers.delete(filePath);
				}, this.debounceTime);

				this.debounceTimers.set(filePath, timer);
			},
		);

		this.watchers.set(resolvedDirectoryPath, watcher);
	}

	onChange(callback: FileChangeCallback): void {
		this.callbacks.add(callback);
	}

	offChange(callback: FileChangeCallback): void {
		this.callbacks.delete(callback);
	}

	private async handleFileChange(filePath: string): Promise<void> {
		if (this.cache) {
			this.cache.invalidate(filePath);
		}

		for (const callback of this.callbacks) {
			try {
				await callback(filePath);
			} catch (error) {
				console.error(
					`[FileWatcher] Error in callback for ${filePath}:`,
					error,
				);
			}
		}
	}

	stop(): void {
		for (const watcher of this.watchers.values()) {
			watcher.close();
		}
		this.watchers.clear();

		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.debounceTimers.clear();
	}
}
