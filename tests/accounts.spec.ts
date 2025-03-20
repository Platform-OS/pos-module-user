import { test, expect } from '@playwright/test';
import { HomePage } from './pages/home';
import { PasswordResetPage } from './pages/passwordReset';
import { RegistrationPage } from './pages/registration';
import { TestMailBox } from './pages/testMailBox';
import { LogInPage } from './pages/login';
import { users } from './data/users';

const PASSWORD = process.env.E2E_TEST_PASSWORD;
const URL = process.env.MPKIT_URL;
if (!PASSWORD) {
  throw new Error('E2E_TEST_PASSWORD environment variable is not set');
}

test.describe('Testing registration', () => {
  test('register new user', async ({ page }) => {
    const homePage = new HomePage(page);
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();
    await registrationPage.registerUser(users.newUser, PASSWORD);

    await expect(homePage.buttonWithText('Log out')).toBeVisible();
  });

  test('validate error messages for empty fields', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const expectedValidationMessage = 'Please fill out this field.';

    await registrationPage.goto();

    const testCases = [
      { email: '', field: 'Email', password: PASSWORD },
      { email: 'email@example.com', field: 'Password', password: '' }
    ];

    for (const testCase of testCases) {
      await registrationPage.registerUser(
        { email: testCase.email },
        testCase.password
      );

      const validationMessage = await registrationPage.form.getValidationMessageForTextInputField(testCase.field);
      await expect(validationMessage).toBe(expectedValidationMessage);
    }
  });

  test('validate error message when using invalid email', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();

    const testCases = [
      ['invalid', "Please include an '@' in the email address. 'invalid' is missing an '@'."],
      ['invalid2$email.com', "Please include an '@' in the email address. 'invalid2$email.com' is missing an '@'."],
      ['invalid3@', "Please enter a part following '@'. 'invalid3@' is incomplete."]
    ];

    for (const [email, expectedMessage] of testCases) {
      await registrationPage.registerUser(
        { email },
        PASSWORD
      );

      const validationMessage = await registrationPage.form.getValidationMessageForTextInputField('Email');
      expect(validationMessage).toBe(expectedMessage);
    }
  });

  test('user is prevented from registering with existing email', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);

    await registrationPage.goto();
    await registrationPage.registerUser(users.test1, PASSWORD);

    expect(registrationPage.form
      .fieldValidationError('Email', 'It seems you already have a registered account. Please check the email field again or sign in with your credentials.'))
      .toBeVisible();
  });

  test('validate password strength indicator', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    const weakPassword = 'weak';
    const expectedError = 'is too short (minimum is 6 characters)';

    await registrationPage.goto();
    await registrationPage.registerUser(users.newUser, weakPassword);

    await expect(registrationPage.page.getByText(expectedError)).toBeVisible();
  });
});

test.describe('Testing login and authentication', () => {
  test('user can log out', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LogInPage(page);

    await loginPage.goto();
    await loginPage.logIn(users.test3.email, PASSWORD);
    await expect(homePage.buttonWithText('Log out')).toBeVisible();

    await homePage.buttonWithText('Log out').click();

    await expect(async () => {
      await expect(homePage.linkWithText('Log in')).toBeVisible();
    }).toPass({
      intervals: [1_000, 2_000, 5_000],
      timeout: 30_000
    });
  });

  test('validate that error message is shown when using wrong credentials', async ({ page }) => {
    const loginPage = new LogInPage(page);

    await loginPage.goto();
    await loginPage.logIn(users.test1.email, 'wrongpassword');
    await expect(loginPage.elementWithText('Invalid email or password')).toBeVisible();
    await loginPage.logIn('wrong@mail.com', PASSWORD);
    await expect(loginPage.elementWithText('Invalid email or password')).toBeVisible();
  });
});

test.describe.serial('Testing password reset', () => {
  test('user can succesfully reset password', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LogInPage(page);
    const passwordResetPage = new PasswordResetPage(page);
    const testMailBoxPage = new TestMailBox(page);
    const newPassword = `${PASSWORD}+new`;
    const oldPassword = `${PASSWORD}`;

    await test.step('reset via login page', async () => {
      await loginPage.goto();
      await loginPage.resetButton.click();
      await expect(page).toHaveURL(passwordResetPage.path);
      await expect(passwordResetPage.elementWithText('Reset password')).toBeVisible();
      await passwordResetPage.textInputField('Email *').fill(users.test2.email);
      await passwordResetPage.buttonWithText('Email an authentication link').click();
      await expect(homePage.page.getByText(`Please check your inbox. If the provided email was correct, you'll receive some instructions on how to reset your password`)).toBeVisible();
  
      await testMailBoxPage.goto();
      await expect(async () => {
        await page.reload();
        await expect(testMailBoxPage.mailEntry('test2@example.com')).toHaveCount(1);
      }).toPass({
        intervals: [1_000, 2_000, 5_000],
        timeout: 30_000
      });
      
      await testMailBoxPage.linkWithText('Show').first().click();
      await testMailBoxPage.linkWithText('Go to reset password form').click();
      await expect(passwordResetPage.form.headingWithText('Reset Password')).toBeVisible();
      await expect(page).toHaveURL(/\/passwords\/new\?token=.*&email=test2%40example.com/);
      await passwordResetPage.form.fillNewPassword({ password: newPassword, passwordConfirmation: newPassword });
      await passwordResetPage.form.buttonWithText('Update password').click();
  
      await homePage.buttonWithText('Log out').click();
      await expect(homePage.linkWithText('Log in')).toBeVisible();
  
      await loginPage.goto();
      await loginPage.logIn(users.test2.email, newPassword);
      await expect(homePage.buttonWithText('Log out')).toBeVisible();
    });

    await test.step('reset password to the old value', async () => {
      await passwordResetPage.goto();
      await passwordResetPage.textInputField('Email *').fill(users.test2.email);
      await passwordResetPage.buttonWithText('Email an authentication link').click();
      await expect(homePage.page.getByText(`Please check your inbox. If the provided email was correct, you'll receive some instructions on how to reset your password`)).toBeVisible();
  
      await testMailBoxPage.goto();
      await expect(async () => {
        await page.reload();
        await expect(testMailBoxPage.mailEntry('test2@example.com')).toHaveCount(2);
      }).toPass({
        intervals: [1_000, 2_000, 5_000],
        timeout: 30_000
      });
      
      await testMailBoxPage.linkWithText('Show').first().click();
      await testMailBoxPage.linkWithText('Go to reset password form').click();
      await expect(passwordResetPage.form.headingWithText('Reset Password')).toBeVisible();
      await expect(page).toHaveURL(/\/passwords\/new\?token=.*&email=test2%40example.com/);
      await passwordResetPage.form.fillNewPassword({ password: oldPassword, passwordConfirmation: oldPassword });
      await passwordResetPage.form.buttonWithText('Update password').click();
  
      await homePage.buttonWithText('Log out').click();
      await expect(homePage.linkWithText('Log in')).toBeVisible();
  
      await loginPage.goto();
      await loginPage.logIn(users.test2.email, oldPassword);
      await expect(homePage.buttonWithText('Log out')).toBeVisible();
    });
  });

  test(`user cannot reset password with invalid or expired token`, async ({ page }) => {
    const loginPage = new LogInPage(page);
    const testMailBoxPage = new TestMailBox(page);

    await testMailBoxPage.goto();
    await testMailBoxPage.linkWithText('Show').first().click();
    await testMailBoxPage.linkWithText('Go to reset password form').click();

    await expect(loginPage.headingWithText('Login')).toBeVisible();
    await expect(loginPage.page.getByText('The reset password link you’ve entered is invalid or has expired.')).toBeVisible();
  });

  test('validate error messages for password reset form', async ({ browser }) => {
    const context = await browser.newContext({ storageState: `tests/.auth/${users.test1.email}.json` });
    const page = await context.newPage();
    const homePage = new HomePage(page);
    const passwordResetPage = new PasswordResetPage(page);
    const testMailBoxPage = new TestMailBox(page);

    await test.step('validate error when using different passwords', async () => {
      await passwordResetPage.goto();
      await passwordResetPage.textInputField('Email *').fill(users.test1.email);
      await passwordResetPage.buttonWithText('Email an authentication link').click();
      await expect(homePage.page.getByText(`Please check your inbox. If the provided email was correct, you'll receive some instructions on how to reset your password`)).toBeVisible();

      await testMailBoxPage.goto();
      await expect(async () => {
        await page.reload();
        await expect(testMailBoxPage.mailEntry('test1@example.com')).toHaveCount(1);
      }).toPass({
        intervals: [1_000, 2_000, 5_000],
        timeout: 30_000
      });

      await testMailBoxPage.linkWithText('Show').first().click();
      await testMailBoxPage.linkWithText('Go to reset password form').click();

      await expect(page).toHaveURL(/\/passwords\/new\?token=.*&email=test1%40example.com/);
      await passwordResetPage.form.fillNewPassword({ password: 'password1A', passwordConfirmation: 'password2B' });
      await passwordResetPage.form.buttonWithText('Update').click();
      await expect(passwordResetPage.elementWithText('passwords do not match')).toBeVisible();
    });

    await test.step('validate password strength indicator', async () => {
      const weakPassword = 'weak';
      const expectedError = 'is too short (minimum is 6 characters)';

      await passwordResetPage.form.fillNewPassword({ password: weakPassword, passwordConfirmation: weakPassword });
      await passwordResetPage.form.buttonWithText('Update').click();
      await expect(passwordResetPage.elementWithText(expectedError)).toBeVisible();
    });
  });
});