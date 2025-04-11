import { type Page } from '@playwright/test';
import { Form } from './form';

export class ProfileEditForm extends Form {
  readonly page: Page;
  readonly nameToLocatorMapping: { [key: string]: { type: string, locator: string } };
  readonly validationMessage: (text: string) => Promise<string>;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.nameToLocatorMapping = {
      firstName: { type: 'textbox', locator: '#pos-user-first-name' },
      lastName: { type: 'textbox', locator: '#pos-user-last-name' }
    };
    this.validationMessage = (text: string) => this.textInputField(text).evaluate((input) => (input as HTMLInputElement).validationMessage);
  }

  async fillProfileData(profileData: {
    firstName?: string;
    lastName?: string;
  }) {
    await this.fill(profileData, this.nameToLocatorMapping);
  }
}
