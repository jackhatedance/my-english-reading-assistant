import { test, expect } from './fixtures';




test('iregular only transform rode', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("mea-token[data-query='rode']");
  await expect(rode).toHaveAttribute('data-base-word', 'ride');
  await expect(rode).toHaveAttribute('data-footnote', '原ride:n.骑马,乘坐; vt.骑,乘坐; vi.骑马,乘车; ...');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n.骑马; vt.骑; vi.骑马; ...');
  
});


test('iregular not only tranform abode', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("mea-token[data-query='abode']");
  await expect(rode).toHaveAttribute('data-footnote', 'n.住所,住处; abide的过去式和过去分词');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n.住所,住处; abide的过去式和过去分词');
  
});


test('regular plural multiple meanings boys', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("mea-token[data-query='boys']");
  await expect(rode).toHaveText('boys');
  await expect(rode).toHaveAttribute('data-footnote', 'n.男孩; 男孩,少年,儿子');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n.男孩; 男孩,少年; ...');
  
});


test('regular plural single meanings girls', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("mea-token[data-query='girls']");
  await expect(rode).toHaveText('girls');
  await expect(rode).toHaveAttribute('data-footnote', 'n.女孩,少女,女佣');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n.女孩,少女,女佣');
  
});


test('pdf line end hyphen', async ({ testPage, extensionId, popupPage }) => {
  
  await testPage.gotoPdf();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let compile = testPage.page.locator("mea-token[data-word='compile']").first();
  await expect(compile).toHaveText('com-');
  await expect(compile).toHaveAttribute('data-footnote', 'vt.编译,编辑,编纂,收集');
  await expect(compile).toHaveAttribute('data-footnote-short', 'vt.编译,编辑,编纂; ...');
  
});
