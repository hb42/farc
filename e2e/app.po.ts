import { browser, element, by } from 'protractor';

export class FarcPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('farc-root h1')).getText();
  }
}
