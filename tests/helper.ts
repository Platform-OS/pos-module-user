import { Browser, BrowserContext, Page, Locator } from 'playwright';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

export async function switchContext(
  currentContext: BrowserContext | null,
  browser: Browser,
  storageStatePath: string
): Promise<{ context: BrowserContext; page: Page }> {
  try {
    if (currentContext !== null) {
      await currentContext.close();
    }

    const newContext = await browser.newContext({ storageState: storageStatePath });
    const newPage = await newContext.newPage();
    return { context: newContext, page: newPage };
  } catch (error) {
    console.error('Failed to switch context:', error);
    throw error;
  }
}

export async function executeShellCommand(command: string, args: string[], successMessage: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const process: ChildProcessWithoutNullStreams = spawn(command, args);
    let output = '';

    process.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());
      if (output.includes(successMessage)) {
        console.log(`"${successMessage}" found in output.`);
        process.kill();
        resolve();
      }
    });

    process.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    process.on('error', (error) => {
      reject(`Error: ${error.message}`);
    });

    process.on('close', (code) => {
      if (!output.includes(successMessage)) {
        reject(`Command did not produce "${successMessage}" before exiting.`);
      }
    });
  });
}