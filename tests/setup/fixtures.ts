export const sampleTypeScriptFile = `export class TestClass {
	private name: string;
	
	constructor(name: string) {
		this.name = name;
	}
	
	getName(): string {
		return this.name;
	}
}

export interface TestInterface {
	id: number;
	value: string;
}

export function testFunction(param: string): string {
	return \`Hello, \${param}\`;
}

export const testVariable = 'test';
`;

export const sampleJavaScriptFile = `export class TestClass {
	constructor(name) {
		this.name = name;
	}
	
	getName() {
		return this.name;
	}
}

export function testFunction(param) {
	return \`Hello, \${param}\`;
}
`;

export const sampleTypeScriptFileWithImports = `import { SomeClass } from './other';
import type { SomeType } from './types';

export class MyClass extends SomeClass {
	private value: SomeType;
	
	constructor(value: SomeType) {
		super();
		this.value = value;
	}
}
`;

export const sampleTypeScriptFileWithExports = `export const CONSTANT = 'value';

export function exportedFunction() {
	return CONSTANT;
}

export class ExportedClass {
	method() {
		return exportedFunction();
	}
}

export interface ExportedInterface {
	field: string;
}
`;
