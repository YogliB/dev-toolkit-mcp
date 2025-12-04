import { createLogger } from '../core/utils/logger';

const logger = createLogger('BrowserLauncher');

const getBrowserCommand = ():
	| { command: string; args: string[] }
	| undefined => {
	const platform = process.platform;

	switch (platform) {
		case 'darwin': {
			return { command: 'open', args: [] };
		}
		case 'linux': {
			return { command: 'xdg-open', args: [] };
		}
		case 'win32': {
			return { command: 'cmd', args: ['/c', 'start', ''] };
		}
		default: {
			logger.warn(`Unsupported platform for browser launch: ${platform}`);
			return undefined;
		}
	}
};

export const openBrowser = async (url: string): Promise<boolean> => {
	const browserCommand = getBrowserCommand();

	if (!browserCommand) {
		logger.warn('Browser auto-launch not supported on this platform');
		return false;
	}

	try {
		logger.debug(
			`Launching browser with command: ${browserCommand.command} ${browserCommand.args.join(' ')} ${url}`,
		);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		const process = Bun.spawn({
			cmd: [browserCommand.command, ...browserCommand.args, url],
			stdout: 'ignore',
			stderr: 'ignore',
		});

		await process.exited;

		logger.info(`Browser launched successfully: ${url}`);
		return true;
	} catch (error) {
		logger.warn(
			`Failed to launch browser: ${error instanceof Error ? error.message : 'Unknown error'}`,
		);
		return false;
	}
};
