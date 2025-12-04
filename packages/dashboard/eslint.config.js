// @ts-check

/**
 * Dashboard Package ESLint Configuration
 *
 * This package config is intentionally minimal - most rules are defined in the root
 * eslint.config.mjs using file-based overrides (packages/dashboard/**).
 *
 * This file only contains:
 * - Local ignore patterns (gitignore integration)
 * - Svelte-specific parser configuration (requires local svelte.config.js)
 * - Extension of root config for consistency
 *
 * All dashboard-specific linting rules (svelte, storybook, browser globals)
 * are defined in the root config and scoped to packages/dashboard/** using file patterns.
 * This is the correct ESLint flat config pattern for monorepos.
 */

import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import ts from 'typescript-eslint';
import rootConfig from '../../eslint.config.mjs';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default [
	{
		// Local ignore patterns for dashboard package
		ignores: [
			'dist/**',
			'node_modules/**',
			'coverage/**',
			'**/*.d.ts.map',
			'.svelte-kit/**',
			'build/**',
		],
	},
	// Integrate .gitignore patterns
	includeIgnoreFile(gitignorePath),
	// Inherit all rules from root (includes universal + dashboard-specific via file patterns)
	...rootConfig,
	{
		// Svelte file-specific parser configuration
		// This MUST be in the package config because it imports local svelte.config.js
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig,
			},
		},
	},
];
