import { describe, it, expect } from 'vitest';

describe.concurrent('Concurrent Tests Example', () => {
	it('should execute test 1 concurrently', async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(true).toBe(true);
	});

	it('should execute test 2 concurrently', async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(true).toBe(true);
	});

	it('should execute test 3 concurrently', async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(true).toBe(true);
	});

	it('should execute test 4 concurrently', async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(true).toBe(true);
	});

	it('should execute test 5 concurrently', async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(true).toBe(true);
	});
});

describe('Sequential Tests Example', () => {
	it('runs sequentially (test 1)', async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(true).toBe(true);
	});

	it('runs sequentially (test 2)', async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(true).toBe(true);
	});

	it('runs sequentially (test 3)', async () => {
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(true).toBe(true);
	});
});
