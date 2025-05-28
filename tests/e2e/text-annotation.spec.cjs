import { test, expect } from './fixtures';




test('iregular only transform rode', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#transform mea-token[data-query='rode']");
  await expect(rode).toHaveAttribute('data-base-word', 'ride');
  await expect(rode).toHaveAttribute('data-target-word', 'rode');
  await expect(rode).toHaveAttribute('data-footnote', '原ride:n.骑马,乘坐; vt.骑,乘坐; vi.骑马,乘车; ...');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n.骑马; vt.骑; vi.骑马; ...');
  
});


test('iregular not only tranform abode', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#transform mea-token[data-query='abode']");
  await expect(rode).toHaveAttribute('data-word', 'abode');
  await expect(rode).toHaveAttribute('data-target-word', 'abode');
  await expect(rode).toHaveAttribute('data-footnote', 'n.住所,住处; abide的过去式和过去分词');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n.住所,住处; abide的过去式和过去分词');
  
});


test('regular plural multiple meanings boys', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#transform mea-token[data-query='boys']");
  await expect(rode).toHaveText('boys');
  await expect(rode).toHaveAttribute('data-word', 'boys');
  await expect(rode).toHaveAttribute('data-target-word', 'boy');
  await expect(rode).toHaveAttribute('data-footnote', '原boy:n.男孩; 男孩,少年,儿子');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n.男孩; 男孩,少年; ...');
  
});


test('new word tag SUP', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.locator("#new-word-tag-sup mea-token[data-query='boys']");
  await expect(word).toHaveText('boys');
  await expect(word).toHaveAttribute('data-word', 'boys');
  await expect(word).toHaveAttribute('data-target-word', 'boy');
  await expect(word).toHaveAttribute('data-footnote', '原boy:n.男孩; 男孩,少年,儿子');
  await expect(word).toHaveAttribute('data-footnote-short', 'n.男孩; 男孩,少年; ...');
  
  word = testPage.page.locator("#new-word-tag-sup mea-token[data-query='at']");
  await expect(word).toHaveText('at');
  await expect(word).toHaveAttribute('data-word', 'at');
  await expect(word).toHaveAttribute('data-target-word', 'at');
  await expect(word).toHaveAttribute('data-footnote', 'prep.在,向,对');
  await expect(word).toHaveAttribute('data-footnote-short', 'prep.在,向,对');
  
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
