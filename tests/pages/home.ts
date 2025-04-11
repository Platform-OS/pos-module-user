import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './page';

export class HomePage extends BasePage {
  readonly page: Page;
  readonly descriptionList: Locator;
  readonly descriptionDetails: (text: string) => Locator;

  constructor(page: Page) {
    super(page, `/`);
    this.page = page;
    this.descriptionList = this.page.locator('dl');
    this.descriptionDetails = (text: string) => this.descriptionList.getByTestId(text);

  };
}