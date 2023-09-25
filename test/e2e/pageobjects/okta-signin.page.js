class ninjaSignInPage {
  get username() { return $('#ninja-signin-username') }
  get password() { return $('#ninja-signin-password') }
  get submit() { return $('#ninja-signin-submit') }

  async waitForLoad() {
    return browser.waitUntil(async () => this.submit.then(el => el.isDisplayed()), 5000, 'wait for signin btn');
  }

  async signIn({ username, password }) {
    await this.username.setValue(username);
    await this.password.setValue(password);
    await this.submit.click();
  }
}

export default new ninjaSignInPage();
