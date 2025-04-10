import { type Page, Locator } from '@playwright/test';
import { BasePage } from './page';
import { ProfileEditForm } from './components/profileEditForm';

export class ProfileEditPage extends BasePage {
  readonly form: ProfileEditForm;

  constructor(page: Page) {
    super(page, '/profile');
    this.form = new ProfileEditForm(page);
  };

  async editProfile(profileData: { firstName: string, lastName: string }) {
    await this.form.fillProfileData(profileData);
    await this.buttonWithText('Submit').click();
  };
};