import type { FastMCP } from 'fastmcp';
import type { AnalysisEngine } from '../../core/analysis/engine';
import type { StorageEngine } from '../../core/storage/engine';

interface ProjectOnboarding {
	projectType: string;
	buildCommand?: string;
	testCommand?: string;
	mainPackages: string[];
	dependencies: Record<string, string>;
	devDependencies: Record<string, string>;
	description?: string;
	scripts: Record<string, string>;
}

export function registerProjectTools(
	server: FastMCP,
	engine: AnalysisEngine,
	storage: StorageEngine,
): void {
	server.addTool({
		name: 'getProjectOnboarding',
		description:
			'Extract project metadata including type, build/test commands, dependencies, and main packages from package.json, README, and tsconfig.json',
		execute: async () => {
			const onboarding: ProjectOnboarding = {
				projectType: 'unknown',
				mainPackages: [],
				dependencies: {},
				devDependencies: {},
				scripts: {},
			};

			try {
				const packageJsonContent =
					await storage.readFile('package.json');
				const packageJson = JSON.parse(packageJsonContent);

				onboarding.projectType = packageJson.type || 'commonjs';
				onboarding.description = packageJson.description;
				onboarding.scripts = packageJson.scripts || {};
				onboarding.dependencies = packageJson.dependencies || {};
				onboarding.devDependencies = packageJson.devDependencies || {};

				onboarding.buildCommand = onboarding.scripts?.build;
				onboarding.testCommand = onboarding.scripts?.test;

				const mainPackages = [
					...Object.keys(onboarding.dependencies),
					...Object.keys(onboarding.devDependencies),
				].slice(0, 20);

				onboarding.mainPackages = mainPackages;
			} catch (error) {
				console.error(
					'[getProjectOnboarding] Error reading package.json:',
					error,
				);
			}

			try {
				await storage.readFile('tsconfig.json');
				if (onboarding.projectType === 'unknown') {
					onboarding.projectType = 'typescript';
				}
			} catch {
				// Ignore errors when reading tsconfig.json
			}

			return JSON.stringify(onboarding);
		},
	});
}
