import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	cacheDir: '.vitest/cache',
	test: {
		globals: true,
		environment: 'node',

		// Test discovery patterns
		include: ['**/*.{test,spec}.ts'],
		exclude: ['**/node_modules/**', '**/dist/**'],

		// Performance: Parallel execution
		pool: 'forks',

		// Performance: Within-file concurrent tests
		sequence: {
			concurrent: process.env.CI ? false : true,
			shuffle: false,
		},

		// Environment-specific optimizations
		isolate: process.env.CI ? true : false,
		maxWorkers: process.env.CI ? 1 : undefined,

		// Timeouts
		testTimeout: 5000,
		hookTimeout: 10_000,

		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'json-summary'],
			reportOnFailure: true,
			exclude: [
				'node_modules/',
				'src/**/*.spec.ts',
				'src/**/*.test.ts',
				'tests/**',
				'dist/',
				'scripts/',
			],
		},

		// Reporter for performance tracking (CI mode)
		reporters: process.env.CI ? ['default', 'json'] : ['default'],
		outputFile: process.env.CI
			? {
					json: '.vitest/results.json',
				}
			: undefined,
	},

	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
