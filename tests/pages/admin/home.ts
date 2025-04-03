import { type Locator, type Page } from '@playwright/test';
import { Select } from '../components/select';
import { BasePage } from '../page';

export class AdminHomePage extends BasePage {
  readonly page: Page;
  readonly usersSelect: Select;

  constructor(page: Page) {
    super(page, `/admin`);
    this.page = page;
    this.usersSelect = new Select(this.page);
  };
}
