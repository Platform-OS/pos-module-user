import { BrowserContext, expect, test } from '@playwright/test';
import { RegistrationPage } from './pages/registration';
import { executeShellCommand } from './helper';
import process from 'process';
import { users } from './data/users';

const PASSWORD = process.env.E2E_TEST_PASSWORD;
if (!PASSWORD) {
  throw new Error('E2E_TEST_PASSWORD environment variable is not set');
}

test.describe('Register users', () => {
  for (const dataSet of Object.values(users)) {
    if (dataSet.email !== 'test129@example.com') {
      test(`Register test profile for ${dataSet.email}`, async ({ page }) => {
        const signUpPage = new RegistrationPage(page);

        await test.step('Navigate to the registration page', async () => {
          await signUpPage.goto();
        });

        await test.step(`Register user ${dataSet.email}`, async () => {
          await signUpPage.registerUser(
            { email: dataSet.email },
            PASSWORD
          );

          await page.context().storageState({ path: `tests/.auth/${dataSet.email}.json` });
        }); 
      });
    }
  }

  test.describe('Set superadmin role', () => {
    test('Set superadmin role', async () => {
      console.log('Running partial deploy...');
      await executeShellCommand('sh', ['-c', 'cd ./tests/post_import && env CONFIG_FILE_PATH=./../../.pos pos-cli deploy -p staging'], 'Deploy succeeded');
    });
  });
});