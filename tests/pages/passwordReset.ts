import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './page';
import { PasswordResetForm } from './components/passwordResetForm';

export class PasswordResetPage extends BasePage {
  readonly form: PasswordResetForm;
  readonly page: Page;
  readonly textInputField: (text: string) => Locator;

  constructor(page: Page) {
    super(page, '/passwords/reset')
    this.form = new PasswordResetForm(page);
    this.page = page;
    this.textInputField = (text) => page.getByLabel(text);
  };
}
