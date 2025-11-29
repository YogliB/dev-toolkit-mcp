import { z } from 'zod';

export const CoreMemoryFile = z.enum([
	'projectBrief',
	'productContext',
	'systemPatterns',
	'techContext',
	'activeContext',
	'progress',
]);

export type CoreMemoryFileName = z.infer<typeof CoreMemoryFile>;

export const MemoryAction = z.enum(['get', 'update', 'delete']);

export type MemoryActionType = z.infer<typeof MemoryAction>;

const MemoryFrontmatterSchema = z.object({
	title: z.string().optional(),
	created: z.union([z.string(), z.date()]).optional(),
	updated: z.union([z.string(), z.date()]).optional(),
	tags: z.array(z.string()).optional(),
	category: z.string().optional(),
});

export const MemoryFileSchema = z.object({
	frontmatter: MemoryFrontmatterSchema,
	content: z.string(),
});

export type MemoryFile = z.infer<typeof MemoryFileSchema>;

export const MemoryFileActionInputSchema = z.object({
	action: MemoryAction.describe(
		'Operation to perform: get, update, or delete',
	),
	content: z
		.string()
		.optional()
		.describe('Content to save (required for update action)'),
});

export type MemoryFileActionInput = z.infer<typeof MemoryFileActionInputSchema>;
