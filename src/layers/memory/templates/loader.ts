import projectBriefTemplate from './projectBrief.md' with { type: 'file' };
import productContextTemplate from './productContext.md' with { type: 'file' };
import systemPatternsTemplate from './systemPatterns.md' with { type: 'file' };
import techContextTemplate from './techContext.md' with { type: 'file' };
import activeContextTemplate from './activeContext.md' with { type: 'file' };
import progressTemplate from './progress.md' with { type: 'file' };
import { file } from 'bun';

export interface LoadedTemplate {
	name: string;
	content: string;
	frontmatter: Record<string, string | string[]>;
}

async function readProjectBriefTemplate(): Promise<string> {
	return await file(projectBriefTemplate).text();
}

async function readProductContextTemplate(): Promise<string> {
	return await file(productContextTemplate).text();
}

async function readSystemPatternsTemplate(): Promise<string> {
	return await file(systemPatternsTemplate).text();
}

async function readTechContextTemplate(): Promise<string> {
	return await file(techContextTemplate).text();
}

async function readActiveContextTemplate(): Promise<string> {
	return await file(activeContextTemplate).text();
}

async function readProgressTemplate(): Promise<string> {
	return await file(progressTemplate).text();
}

export async function loadTemplate(
	templateName: string,
): Promise<LoadedTemplate> {
	let content: string;

	try {
		switch (templateName) {
			case 'projectBrief': {
				content = await readProjectBriefTemplate();
				break;
			}
			case 'productContext': {
				content = await readProductContextTemplate();
				break;
			}
			case 'systemPatterns': {
				content = await readSystemPatternsTemplate();
				break;
			}
			case 'techContext': {
				content = await readTechContextTemplate();
				break;
			}
			case 'activeContext': {
				content = await readActiveContextTemplate();
				break;
			}
			case 'progress': {
				content = await readProgressTemplate();
				break;
			}
			case 'decisionLog': {
				throw new Error(
					'decisionLog template is deprecated. Use systemPatterns.md for architectural decisions instead. See MIGRATION.md for details.',
				);
			}
			default: {
				throw new Error(
					`Invalid template name: "${templateName}". Valid templates: projectBrief, productContext, systemPatterns, techContext, activeContext, progress`,
				);
			}
		}

		return {
			name: templateName,
			content,
			frontmatter: {
				category: getCategoryForTemplate(templateName),
				created: new Date().toISOString(),
			},
		};
	} catch (error) {
		throw new Error(
			`Failed to load template "${templateName}": ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
	}
}

export async function loadAllTemplates(): Promise<LoadedTemplate[]> {
	return await Promise.all([
		loadTemplate('projectBrief'),
		loadTemplate('productContext'),
		loadTemplate('systemPatterns'),
		loadTemplate('techContext'),
		loadTemplate('activeContext'),
		loadTemplate('progress'),
	]);
}

function getCategoryForTemplate(templateName: string): string {
	const categories = new Map<string, string>([
		['projectBrief', 'foundation'],
		['productContext', 'product'],
		['systemPatterns', 'architecture'],
		['techContext', 'technical-setup'],
		['activeContext', 'active-work'],
		['progress', 'tracking'],
	]);

	return categories.get(templateName) ?? 'general';
}

export interface TemplateHierarchy {
	name: string;
	displayName: string;
	dependencies: string[];
	description: string;
}

export function getTemplateHierarchy(): TemplateHierarchy[] {
	return [
		{
			name: 'projectBrief',
			displayName: 'Project Brief',
			dependencies: [],
			description: "Foundation document - what you're building",
		},
		{
			name: 'productContext',
			displayName: 'Product Context',
			dependencies: ['projectBrief'],
			description: 'Why it exists and how it should work',
		},
		{
			name: 'systemPatterns',
			displayName: 'System Patterns',
			dependencies: ['projectBrief', 'productContext'],
			description: 'Architecture, design patterns, and decisions',
		},
		{
			name: 'techContext',
			displayName: 'Technical Context',
			dependencies: ['projectBrief'],
			description: 'Technologies, setup, and constraints',
		},
		{
			name: 'activeContext',
			displayName: 'Active Context',
			dependencies: [
				'projectBrief',
				'productContext',
				'systemPatterns',
				'techContext',
			],
			description: 'Current work focus',
		},
		{
			name: 'progress',
			displayName: 'Progress',
			dependencies: ['activeContext'],
			description: 'Tracking and history',
		},
	];
}
