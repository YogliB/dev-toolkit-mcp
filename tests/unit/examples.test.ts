import { describe, it, expect } from 'vitest';

describe.concurrent('Unit Test Examples', () => {
	it('should execute concurrent test 1', async () => {
		await new Promise((resolve) => setTimeout(resolve, 5));
		expect(1 + 1).toBe(2);
	});

	it('should execute concurrent test 2', async () => {
		await new Promise((resolve) => setTimeout(resolve, 5));
		expect(2 + 2).toBe(4);
	});

	it('should execute concurrent test 3', async () => {
		await new Promise((resolve) => setTimeout(resolve, 5));
		expect(3 + 3).toBe(6);
	});

	it('should execute concurrent test 4', async () => {
		await new Promise((resolve) => setTimeout(resolve, 5));
		expect(4 + 4).toBe(8);
	});

	it('should execute concurrent test 5', async () => {
		await new Promise((resolve) => setTimeout(resolve, 5));
		expect(5 + 5).toBe(10);
	});
});

describe('Sequential Unit Tests', () => {
	it('should run sequentially test 1', async () => {
		await new Promise((resolve) => setTimeout(resolve, 5));
		expect('hello'.length).toBe(5);
	});

	it('should run sequentially test 2', async () => {
		await new Promise((resolve) => setTimeout(resolve, 5));
		expect('world'.toUpperCase()).toBe('WORLD');
	});

	it('should run sequentially test 3', async () => {
		await new Promise((resolve) => setTimeout(resolve, 5));
		expect([1, 2, 3].length).toBe(3);
	});
});
