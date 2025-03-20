import { type Locator, type Page } from '@playwright/test';
import { Form } from './form';

export class PasswordResetForm extends Form {
  readonly page: Page;
  readonly nameToLocatorMapping: { [key: string]: { type: string, locator: string } };
  readonly validationMessage: (text: string) => Promise<string>;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.nameToLocatorMapping = {
      password: { type: 'textbox', locator: '#password\\[password\\]' },
      passwordConfirmation: { type: 'textbox', locator: '#password\\[password_confirmation\\]' }
    };
    this.validationMessage = (text: string) => this.textInputField(text).evaluate((input) => (input as HTMLInputElement).validationMessage);
  };

  async fillNewPassword(passwordData: {
    password?: string;
    passwordConfirmation?: string;
  }) {
    await this.fill(passwordData, this.nameToLocatorMapping);
  };
}
