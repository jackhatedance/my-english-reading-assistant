import { test, expect } from './fixtures';




test('base form this', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='this']");
  await expect(rode).toHaveAttribute('data-target-word', 'this');
  await expect(rode).toHaveAttribute('data-footnote', 'pron.这,本; a.这,本; ad.这么');
  await expect(rode).toHaveAttribute('data-footnote-short', 'pron.这; a.这; ad.这么; ...');
  
});


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


test('definition link crenels', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#definition-link mea-token[data-query='crenels']");
  await expect(rode).toHaveText('crenels');
  await expect(rode).toHaveAttribute('data-word', 'crenels');
  await expect(rode).toHaveAttribute('data-base-word', 'crenel');
  await expect(rode).toHaveAttribute('data-target-word', 'crenel');
  await expect(rode).toHaveAttribute('data-footnote', 'n.雉堞上的凹处,枪眼; vt.使...成雉堞状');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n.雉堞上的凹处,枪眼; vt.使...成雉堞状');
  
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

test('phrase base form give up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-base-form mea-token[data-query='give']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give  
n. 弹性,适应性 vt. 给,授予,供给,产生,发表,付出,献出,让出 vi. 捐赠,支持不住,让步
give up  
vt. 放弃努力,认输
`);
  
});


test('phrase transform irregular gave up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-tranform-irregular mea-token[data-query='gave']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`gave  
give的过去式
give  
n. 弹性,适应性 vt. 给,授予,供给,产生,发表,付出,献出,让出 vi. 捐赠,支持不住,让步
give up  
vt. 放弃努力,认输
`);
  
});


test('phrase transform continuous tense gaving up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-continuous-tense mea-token[data-query='giving']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give  
n. 弹性,适应性 vt. 给,授予,供给,产生,发表,付出,献出,让出 vi. 捐赠,支持不住,让步
give up  
vt. 放弃努力,认输
`);
  
});


test('phrase transform continuous tense 2 gaving up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-continuous-tense2 mea-token[data-query='giving']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give  
n. 弹性,适应性 vt. 给,授予,供给,产生,发表,付出,献出,让出 vi. 捐赠,支持不住,让步
give up  
vt. 放弃努力,认输
`);
  
});


test('phrase gerund giving up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-gerund mea-token[data-query='giving']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give  
   n. 弹性,适应性 vt. 给,授予,供给,产生,发表,付出,献出,让出 vi. 捐赠,支持不住,让步
   give up  
   vt. 放弃努力,认输
`);
  
});

test('phrase prepositon gerund giving up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-preposition-gerund mea-token[data-query='giving']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give  
n. 弹性,适应性 vt. 给,授予,供给,产生,发表,付出,献出,让出 vi. 捐赠,支持不住,让步
give up  
vt. 放弃努力,认输
`);
  
});

test('pdf line end hyphen', async ({ testPage, extensionId, popupPage }) => {
  
  await testPage.gotoPdf();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let compile = testPage.page.locator("mea-token[data-word='compile']").first();
  await expect(compile).toHaveText('com-', 10000);
  await expect(compile).toHaveAttribute('data-footnote', 'vt.编译,编辑,编纂,收集');
  await expect(compile).toHaveAttribute('data-footnote-short', 'vt.编译,编辑,编纂; ...');
  
});
