import type {
	AST,
	Symbol,
	Relationship,
	Pattern,
} from '../../src/core/analysis/types';
import type { LanguagePlugin } from '../../src/core/analysis/plugins/base';
import type { GitAnalyzer } from '../../src/core/analysis/git/git-analyzer';

export class MockLanguagePlugin implements LanguagePlugin {
	readonly name: string;
	readonly languages: string[];
	private mockSymbols: Symbol[] = [];
	private mockRelationships: Relationship[] = [];
	private mockPatterns: Pattern[] = [];

	constructor(
		name: string,
		languages: string[],
		options?: {
			symbols?: Symbol[];
			relationships?: Relationship[];
			patterns?: Pattern[];
		},
	) {
		this.name = name;
		this.languages = languages;
		this.mockSymbols = options?.symbols || [];
		this.mockRelationships = options?.relationships || [];
		this.mockPatterns = options?.patterns || [];
	}

	async parse(filePath: string): Promise<AST> {
		return {
			kind: 'SourceFile',
			filePath,
		} as AST;
	}

	async extractSymbols(_ast: AST, filePath: string): Promise<Symbol[]> {
		return this.mockSymbols.map((s) => ({
			...s,
			path: filePath,
		}));
	}

	async buildRelationships(
		_symbols: Symbol[],
		_ast: AST,
		_filePath: string,
	): Promise<Relationship[]> {
		return this.mockRelationships.filter(
			() => _symbols && _ast.kind && _filePath,
		);
	}

	async detectPatterns(
		_ast: AST,
		_symbols: Symbol[],
		_filePath: string,
	): Promise<Pattern[]> {
		return this.mockPatterns.filter(
			() => _ast.kind && _symbols && _filePath,
		);
	}
}

export class MockGitAnalyzer implements GitAnalyzer {
	private mockCommitSHA: string = 'mock-commit-sha';
	private mockFileHash: string = 'mock-file-hash';
	private mockDecisions: Array<{
		commitSHA: string;
		message: string;
		author: string;
		date: string;
		files: string[];
	}> = [];
	private mockChangeVelocity: {
		path: string;
		commitCount: number;
		lastModified: string;
		authors: string[];
	} = {
		path: '',
		commitCount: 0,
		lastModified: '',
		authors: [],
	};

	constructor(_projectRoot: string) {
		if (_projectRoot) {
			// Mock constructor
		}
	}

	setMockCommitSHA(sha: string): void {
		this.mockCommitSHA = sha;
	}

	setMockFileHash(hash: string): void {
		this.mockFileHash = hash;
	}

	setMockDecisions(decisions: typeof this.mockDecisions): void {
		this.mockDecisions = decisions;
	}

	setMockChangeVelocity(velocity: typeof this.mockChangeVelocity): void {
		this.mockChangeVelocity = velocity;
	}

	async getFileHash(_filePath: string): Promise<string> {
		return _filePath && this.mockFileHash;
	}

	async getCurrentCommitSHA(): Promise<string> {
		return this.mockCommitSHA;
	}

	async getRecentDecisions(
		_since: string,
		_workspace?: string,
	): Promise<
		Array<{
			commitSHA: string;
			message: string;
			author: string;
			date: string;
			files: string[];
		}>
	> {
		return this.mockDecisions.filter(
			() => _since && (_workspace !== undefined || true),
		);
	}

	async analyzeChangeVelocity(
		filePath: string,
		_since: string,
	): Promise<{
		path: string;
		commitCount: number;
		lastModified: string;
		authors: string[];
	}> {
		return {
			...this.mockChangeVelocity,
			path: filePath,
			lastModified: _since || this.mockChangeVelocity.lastModified,
		};
	}

	async getCommitMessages(_since: string): Promise<string[]> {
		return this.mockDecisions
			.filter(() => _since !== '')
			.map((d) => d.message);
	}
}
