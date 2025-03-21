import { expect, test as setup } from '@playwright/test';
import process from 'process';
import { LogInPage } from './pages/login';
import { users } from '../tests/data/users';

const PASSWORD = process.env.E2E_TEST_PASSWORD;
if (!PASSWORD) {
  throw new Error('E2E_TEST_PASSWORD environment variable is not set');
}

const testsUsers = [
  users.superadmin,
  users.test1,
  users.test2,
  users.test3
];

for (const user of testsUsers) {
  setup(`authenticate user ${user.email}`, async ({ page }) => {
    const loginPage = new LogInPage(page);
    await loginPage.goto();
    await loginPage.logIn(user.email, PASSWORD);

    await expect(page.getByText('Log out')).toBeVisible();

    await page.context().storageState({ path: `tests/.auth/${user.email}.json` });
  });
}
