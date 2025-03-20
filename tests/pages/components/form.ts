import { type Locator, type Page } from '@playwright/test';
import path from 'path';

export class Form {
  readonly page: Page;
  readonly buttonWithText: (text: string) => Locator;
  readonly buttonWithExactText: (text: string) => Locator;
  readonly headingWithText: (text: string) => Locator;
  textInputField: (text: string) => Locator;
  readonly fieldValidationError: (label: string, error: string) => Locator;

  constructor(page: Page) {
    this.page = page;
    this.buttonWithText = (text: string) => page.getByRole('button', { name: text });
    this.buttonWithExactText = (text: string) => page.getByRole('button', { name: text, exact: true });
    this.headingWithText = (text: string) => page.getByRole('heading', { name: text });
    this.textInputField = (text: string = '') => page.getByRole('textbox', { name: text });
    this.fieldValidationError = (label: string, error: string) => page.getByLabel(label).locator('..').getByText(error);
  }

  async fill(fieldsData: { [key: string]: string | undefined }, fieldsMapping: { [key: string]: { type: string, locator: string } }) {
    for (const [key, value] of Object.entries(fieldsData)) {
      if (value !== undefined) {
        const field = fieldsMapping[key];
        if (field) {
          switch (field.type) {
            case 'textbox':
              if (field.locator === '#summary' || field.locator === '#description') {
                await this.page.locator(field.locator).fill('');
                await this.page.locator(field.locator).pressSequentially(value, { delay: 25 });
                break;
              }
              await this.page.locator(field.locator).fill(value);
              break;
            case 'radio':
              await this.page.getByRole('radio', { name: value }).check();
              break;
            case 'checkbox':
              await this.page.locator('label').filter({ hasText: value }).click();
              break;
          }
        }
      }
    }
  }

  submitButton(buttonName: string) {
    return this.page.getByRole('button', { name: buttonName });
  }
}