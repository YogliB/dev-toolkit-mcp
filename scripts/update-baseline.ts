import { readFileSync, writeFileSync, existsSync } from 'fs';

interface TestFileMetrics {
	name: string;
	duration: number;
	testCount: number;
}

interface PerformanceMetrics {
	totalDuration: number;
	testCount: number;
	fileCount: number;
	avgPerTest: number;
	files: Map<string, TestFileMetrics>;
	timestamp: string;
}

interface PerformanceBaseline {
	baseline: PerformanceMetrics;
	thresholds: {
		maxRegression: number;
		maxDuration: number;
	};
	history?: PerformanceMetrics[];
}

const RESULTS_FILE = '.vitest/results.json';
const BASELINE_FILE = '.vitest-performance.json';

function parseVitestResults(): PerformanceMetrics | null {
	if (!existsSync(RESULTS_FILE)) {
		return null;
	}

	try {
		const content = readFileSync(RESULTS_FILE, 'utf-8');
		const results = JSON.parse(content);

		const files = new Map<string, TestFileMetrics>();
		let totalDuration = 0;
		let totalTests = 0;

		if (results.testResults) {
			for (const result of results.testResults) {
				const filename = String(result.name);
				const duration =
					result.perfStats?.end - result.perfStats?.start || 0;
				const testCount =
					result.numPassingTests + (result.numFailingTests || 0);

				files.set(filename, {
					name: filename,
					duration,
					testCount,
				});

				totalDuration += duration;
				totalTests += testCount;
			}
		}

		return {
			totalDuration,
			testCount: totalTests,
			fileCount: files.size,
			avgPerTest: totalTests > 0 ? totalDuration / totalTests : 0,
			files,
			timestamp: new Date().toISOString(),
		};
	} catch (error) {
		console.error('Failed to parse Vitest results:', error);
		return null;
	}
}

function loadBaseline(): PerformanceBaseline {
	if (existsSync(BASELINE_FILE)) {
		try {
			return JSON.parse(readFileSync(BASELINE_FILE, 'utf-8'));
		} catch (error) {
			console.error('Failed to parse baseline file:', error);
		}
	}

	return {
		baseline: {
			totalDuration: 0,
			testCount: 0,
			fileCount: 0,
			avgPerTest: 0,
			files: {},
			timestamp: new Date().toISOString(),
		},
		thresholds: {
			maxRegression: 0.2,
			maxDuration: 5000,
		},
		history: [],
	};
}

function saveBaseline(baseline: PerformanceBaseline): void {
	writeFileSync(BASELINE_FILE, JSON.stringify(baseline, null, '\t'));
	console.log(`✅ Baseline updated: ${BASELINE_FILE}`);
}

function main() {
	const updateFlag = process.argv.includes('--update-baseline');

	if (!updateFlag) {
		console.error(
			'Usage: bun run scripts/update-baseline.ts --update-baseline',
		);
		console.error(
			'This will overwrite the performance baseline. Use with caution.',
		);
		process.exit(1);
	}

	const current = parseVitestResults();

	if (!current) {
		console.error('No Vitest results found. Run tests first with CI=1.');
		process.exit(1);
	}

	const current_baseline = loadBaseline();
	const oldBaseline = { ...current_baseline.baseline };

	current_baseline.baseline = current;
	if (!current_baseline.history) {
		current_baseline.history = [];
	}
	current_baseline.history.push(oldBaseline);
	if (current_baseline.history.length > 10) {
		current_baseline.history = current_baseline.history.slice(-10);
	}

	saveBaseline(current_baseline);

	console.log('\nBaseline Update Summary:');
	console.log(
		`Total Duration: ${oldBaseline.totalDuration}ms → ${current.totalDuration}ms`,
	);
	console.log(`Test Count: ${oldBaseline.testCount} → ${current.testCount}`);
	console.log(`Files: ${oldBaseline.fileCount} → ${current.fileCount}`);
	console.log(
		`\nPrevious baselines kept in history: ${current_baseline.history?.length || 0}/10`,
	);
}

main();
