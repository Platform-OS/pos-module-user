import { type Locator, type Page } from '@playwright/test';

export class Select {
  readonly page: Page;
  readonly menu: Locator;
  readonly option: (option: string) => Locator;

  constructor(page: Page) {
    this.page = page;
    this.menu = this.page.locator('select');
    this.option = (option: string) => this.page.locator('option').getByText(option, { exact: true });
  };

  async selectOption(option) {
    await this.menu.selectOption({ label: option });
  };
};
