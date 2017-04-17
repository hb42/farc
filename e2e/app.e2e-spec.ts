import { FarcPage } from './app.po';

describe('farc App', () => {
  let page: FarcPage;

  beforeEach(() => {
    page = new FarcPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('farc works!');
  });
});
