import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './page';

export class LogInPage extends BasePage {
  readonly page: Page;
  readonly emailInputField: Locator;
  readonly loginButton: Locator;
  readonly passwordInputField: Locator;
  readonly resetButton: Locator;
  readonly elementWithText: (text: string) => Locator;

  constructor(page: Page) {
    super(page, '/sessions/new')
    this.page = page;
    this.elementWithText = (text) => page.getByText(text);
    this.emailInputField = page.getByRole('textbox', { name: 'Email' });
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.passwordInputField = page.getByRole('textbox', { name: 'Password' });
    this.resetButton = page.getByRole('link', { name: 'Reset' });
  }

  async logIn(email: string, password: string) {
    await this.emailInputField.fill(email);
    await this.passwordInputField.fill(password);
    await this.loginButton.click();
  }
}
