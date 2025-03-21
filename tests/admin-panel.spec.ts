import { expect, test } from '@playwright/test';
import { AdminHomePage } from './pages/admin/home';
import { SubscriptionPage } from './pages/subscription';
import { HomePage } from './pages/home';
import { users } from './data/users';

test.describe('Testing Admin Panel', () => {
  test('admin can access admin panel', async ({ browser }) => {
    const context = await browser.newContext({ storageState: `tests/.auth/${users.superadmin.email}.json` });
    const page = await context.newPage();
    const adminHomePage = new AdminHomePage(page);

    await adminHomePage.goto();
    await expect(adminHomePage.elementWithText('If you are seeing this page, you have been granted permissions admin.read.')).toBeVisible();
  });

  test('admin can access subscription area', async ({ browser }) => {
    const context = await browser.newContext({ storageState: `tests/.auth/${users.superadmin.email}.json` });
    const page = await context.newPage();
    const homePage = new HomePage(page);
    const subscriptionPage = new SubscriptionPage(page);

    await homePage.goto();
    await homePage.linkWithText('Subscription area').click();

    await expect(subscriptionPage.elementWithText('If you are seeing this page, you have been granted permissions subscription.read.')).toBeVisible();
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