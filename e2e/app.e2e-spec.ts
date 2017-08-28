import { BubbleBurstPage } from './app.po';

describe('bubble-burst App', () => {
  let page: BubbleBurstPage;

  beforeEach(() => {
    page = new BubbleBurstPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
