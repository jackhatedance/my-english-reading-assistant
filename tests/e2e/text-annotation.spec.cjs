import { test, expect } from './fixtures';




test('past tense rode', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("mea-token[data-word='rode']");
  await expect(rode).toHaveAttribute('data-base-word', 'ride');
  await expect(rode).toHaveAttribute('data-footnote', '原ride:n.骑马,乘坐; vt.骑,乘坐; vi.骑马,乘车; ...');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n.骑马; vt.骑; vi.骑马; ...');
  
});
