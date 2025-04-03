import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './page';

export class TestMailBox extends BasePage {
  readonly mailEntry: (text: string) => Locator;

  constructor(page: Page) {
    super(page, '/_tests/sent_mails');
    this.mailEntry = (text) => this.page.locator('ul').filter({ hasText: text });
  };
}