import { expect, test } from '@playwright/test';
import { AdminHomePage } from './pages/admin/home';
import { HomePage } from './pages/home';
import { users } from './data/users';

test.describe('Testing Admin Panel', () => {
  test('admin can access admin panel', async ({ browser }) => {
    const context = await browser.newContext({ storageState: `tests/.auth/${users.superadmin.email}.json` });
    const page = await context.newPage();
    const adminHomePage = new AdminHomePage(page);

    await adminHomePage.goto();
    await expect(adminHomePage.elementWithText('You have access to admin.read.')).toBeVisible();
  });

  test('admin impersonate tests', async ({ browser }) => {
    await test.step('admin can impersonate another user', async () => {
      const context = await browser.newContext({ storageState: `tests/.auth/${users.superadmin.email}.json` });
      const page = await context.newPage();
      const adminHomePage = new AdminHomePage(page);
  
      await adminHomePage.goto();;
      await adminHomePage.usersSelect.selectOption('test3@example.com');
      await adminHomePage.buttonWithText('Impersonate').click();
    });

    await test.step('impersonated user has authenticated role', async () => {
      const context = await browser.newContext({ storageState: `tests/.auth/${users.test3.email}.json` });
      const page = await context.newPage();
      const homePage = new HomePage(page);
  
      await homePage.goto();
      await expect(homePage.elementWithText('"roles":["member","authenticated"]}')).toBeVisible();
    });
  });
});