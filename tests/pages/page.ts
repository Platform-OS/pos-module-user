import { type Locator, type Page } from '@playwright/test';

export class BasePage {
  path: string;
  readonly page: Page;
  readonly buttonWithText: (text: string) => Locator;
  readonly elementWithText: (text: string) => Locator;
  readonly headingWithText: (text: string) => Locator;
  readonly linkWithText: (text: string) => Locator;

  constructor(page: Page, path: string) {
    this.page = page;
    this.path = path;
    this.buttonWithText = (text: string) => page.getByRole('button', { name: text, exact: true });
    this.elementWithText = (text: string) => page.getByText(text);
    this.headingWithText = (text: string) => page.getByRole('heading', { name: text });
    this.linkWithText = (text: string) => page.getByRole('link', { name: text, exact: true });
  };

  async goto() {
    await this.page.goto(this.path);
  };
}