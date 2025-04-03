import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './page';
import { Form } from './components/form';

export class RegistrationForm extends Form {
  readonly page: Page;
  readonly nameToLocatorMapping: { [key: string]: { type: string, locator: string } };
  readonly textInputField: (text: string) => Locator;
  readonly validationMessage: (text: string) => Promise<string>;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.nameToLocatorMapping = {
      email: { type: 'textbox', locator: '#pos-user-email' },
      password: { type: 'textbox', locator: '#pos-user-password' }
    };
    this.textInputField = (text: string) => page.getByLabel(text);
    this.validationMessage = (text: string) => this.textInputField(text).evaluate((input) => (input as HTMLInputElement).validationMessage);
  }

  async fillUserData(userData: {
    email?: string;
    password?: string;
  }) {
    await this.fill(userData, this.nameToLocatorMapping);
  }

  async getValidationMessageForTextInputField(fieldName: string) {
    return await this.validationMessage(fieldName);
  }
}

export class RegistrationPage extends BasePage {
  readonly form: RegistrationForm;

  constructor(page: Page) {
    super(page, '/users/new');
    this.form = new RegistrationForm(page);
  }

  async goto() {
    await this.page.goto(this.path);
  }

  async registerUser(user: { email: string }, password: string) {
    await this.form.fillUserData({ ...user, password });
    await this.form.submitButton('Register').click();
  }
}
