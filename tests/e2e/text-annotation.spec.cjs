import { test, expect } from './fixtures';




test('base form this', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='this']");
  await expect(rode).toHaveAttribute('data-target-word', 'this');
  await expect(rode).toHaveAttribute('data-base-word', '');
  await expect(rode).toHaveAttribute('data-footnote', 'pron. 这; 本; a. 这; 本; adv. 这么');
  await expect(rode).toHaveAttribute('data-footnote-short', 'pron. 这; a. 这; adv. 这么; ...');
  
});


test('base form his', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='his']");
  await expect(rode).toHaveAttribute('data-target-word', 'his');
  await expect(rode).toHaveAttribute('data-base-word', '');
  await expect(rode).toHaveAttribute('data-footnote', 'pron. 他的');
  await expect(rode).toHaveAttribute('data-footnote-short', 'pron. 他的');
  
});

test('base form promises', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='promises']");
  await expect(rode).toHaveAttribute('data-target-word', 'promise');
  await expect(rode).toHaveAttribute('data-base-word', 'promise');
  await expect(rode).toHaveAttribute('data-footnote', 'v. 允诺');
  await expect(rode).toHaveAttribute('data-footnote-short', 'v. 允诺');
  
});


test('base form number', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='number']");
  await expect(rode).toHaveAttribute('data-target-word', 'number');
  await expect(rode).toHaveAttribute('data-base-word', '');
  await expect(rode).toHaveAttribute('data-footnote', 'n. 数; 数字; vt. 数; 计算; vi. 计算; 报数; ...');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n. 数; vt. 数; vi. 计算; ...');
  
});


test('base form supplicants', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='supplicants']");
  await expect(rode).toHaveAttribute('data-target-word', 'supplicant');
  await expect(rode).toHaveAttribute('data-base-word', 'supplicant');
  await expect(rode).toHaveAttribute('data-footnote', '恳求; 哀求; 祈求');
  await expect(rode).toHaveAttribute('data-footnote-short', '恳求; 哀求; 祈求');
  
});

test('base form zorses', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='zorse']");
  await expect(rode).toHaveAttribute('data-target-word', 'zorse');
  await expect(rode).toHaveAttribute('data-base-word', '');
  await expect(rode).toHaveAttribute('data-footnote', '雄马和雌斑马的杂交种');
  await expect(rode).toHaveAttribute('data-footnote-short', '雄马和雌斑马的杂交种');
  
});


test('base form misjudgements', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='misjudgements']");
  await expect(rode).toHaveAttribute('data-target-word', 'misjudgement');
  await expect(rode).toHaveAttribute('data-base-word', 'misjudgement');
  await expect(rode).toHaveAttribute('data-footnote', '审判错误; 判断错误');
  await expect(rode).toHaveAttribute('data-footnote-short', '审判错误; 判断错误');
  
});

test('base form rushes', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='rush']");
  await expect(rode).toHaveAttribute('data-target-word', 'rush');
  await expect(rode).toHaveAttribute('data-base-word', '');
  await expect(rode).toHaveAttribute('data-footnote', 'n. 匆促; 冲进; vi. 冲; 奔; vt. 使冲; a. 紧急的; ...');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n. 匆促; vi. 冲; vt. 使冲; ...');
  
});

test('base form glaciers', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#base-form mea-token[data-query='glaciers']");
  await expect(rode).toHaveAttribute('data-target-word', 'glacier');
  await expect(rode).toHaveAttribute('data-base-word', 'glacier');
  await expect(rode).toHaveAttribute('data-footnote', 'n. 冰川');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n. 冰川');
  
});

test('iregular only transform rode', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#transform mea-token[data-query='rode']");
  await expect(rode).toHaveAttribute('data-base-word', 'ride');
  await expect(rode).toHaveAttribute('data-target-word', 'rode');
  await expect(rode).toHaveAttribute('data-footnote', 'ride:n. 骑马; 乘坐; vt. 骑; 乘坐; vi. 骑马; 乘车; ...');
  await expect(rode).toHaveAttribute('data-footnote-short', 'ride:n. 骑马; vt. 骑; vi. 骑马; ...');
  
});


test('transform riding', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#transform mea-token[data-query='riding']");
  await expect(rode).toHaveAttribute('data-word', 'riding');
  await expect(rode).toHaveAttribute('data-base-word', 'ride');
  await expect(rode).toHaveAttribute('data-target-word', 'ride');
  await expect(rode).toHaveAttribute('data-footnote', 'n. 骑; 乘车; 乘; 骑术; 骑马');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n. 骑; 乘车; 乘; ...');
  
});


test('iregular not only tranform abode', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#transform mea-token[data-query='abode']");
  await expect(rode).toHaveAttribute('data-word', 'abode');
  await expect(rode).toHaveAttribute('data-base-word', '');
  await expect(rode).toHaveAttribute('data-target-word', 'abode');
  await expect(rode).toHaveAttribute('data-footnote', 'n. 住所; 住处; abide的过去式和过去分词');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n. 住所; 住处; abide的过去式和过去分词');
  
});


test('regular plural multiple meanings boys', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#transform mea-token[data-query='boys']");
  await expect(rode).toHaveText('boys');
  await expect(rode).toHaveAttribute('data-word', 'boys');
  await expect(rode).toHaveAttribute('data-base-word', 'boy');
  await expect(rode).toHaveAttribute('data-target-word', 'boy');
  await expect(rode).toHaveAttribute('data-footnote', 'n. 男孩');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n. 男孩');
  
});

test('transform giving', async ({ testPage, extensionId, popupPage }) => {
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.locator("#transform mea-token[data-query='giving']");
  await expect(word).toHaveText('giving');
  await expect(word).toHaveAttribute('data-word', 'giving');
  await expect(word).toHaveAttribute('data-base-word', 'give');
  await expect(word).toHaveAttribute('data-target-word', 'give');
  await expect(word).toHaveAttribute('data-footnote', 'n. 礼物; 给予物');
  await expect(word).toHaveAttribute('data-footnote-short', 'n. 礼物; 给予物');
  
});


test('transform interesting', async ({ testPage, extensionId, popupPage }) => {
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.locator("#transform mea-token[data-query='interesting']");
  await expect(word).toHaveText('interesting');
  await expect(word).toHaveAttribute('data-word', 'interesting');
  await expect(word).toHaveAttribute('data-base-word', 'interest');
  await expect(word).toHaveAttribute('data-target-word', 'interest');
  await expect(word).toHaveAttribute('data-footnote', 'a. 有趣的');
  await expect(word).toHaveAttribute('data-footnote-short', 'a. 有趣的');
  
});


test('transform buckled', async ({ testPage, extensionId, popupPage }) => {
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.locator("#transform mea-token[data-query='buckled']");
  await expect(word).toHaveText('buckled');
  await expect(word).toHaveAttribute('data-word', 'buckled');
  await expect(word).toHaveAttribute('data-base-word', 'buckle');
  await expect(word).toHaveAttribute('data-target-word', 'buckle');
  await expect(word).toHaveAttribute('data-footnote', 'a. 有扣的');
  await expect(word).toHaveAttribute('data-footnote-short', 'a. 有扣的');
  
});

test('definition link crenels', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let rode = testPage.page.locator("#definition-link mea-token[data-query='crenel']");
  await expect(rode).toHaveText('crenels');
  await expect(rode).toHaveAttribute('data-word', 'crenel');
  await expect(rode).toHaveAttribute('data-base-word', '');
  await expect(rode).toHaveAttribute('data-target-word', 'crenel');
  await expect(rode).toHaveAttribute('data-footnote', 'n. 雉堞上的凹处; 枪眼; vt. 使...成雉堞状');
  await expect(rode).toHaveAttribute('data-footnote-short', 'n. 雉堞上的凹处; 枪眼; vt. 使...成雉堞状');
  
});


test('unfamiliar word tag SUP', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.locator("#new-word-tag-sup mea-token[data-query='boys']");
  await expect(word).toHaveText('boys');
  await expect(word).toHaveAttribute('data-word', 'boys');
  await expect(word).toHaveAttribute('data-base-word', 'boy');
  await expect(word).toHaveAttribute('data-target-word', 'boy');
  await expect(word).toHaveAttribute('data-footnote', 'n. 男孩');
  await expect(word).toHaveAttribute('data-footnote-short', 'n. 男孩');
  
  word = testPage.page.locator("#new-word-tag-sup mea-token[data-query='at']");
  await expect(word).toHaveText('at');
  await expect(word).toHaveAttribute('data-word', 'at');
  await expect(word).toHaveAttribute('data-base-word', '');
  await expect(word).toHaveAttribute('data-target-word', 'at');
  await expect(word).toHaveAttribute('data-footnote', 'prep. 在; 向; 对');
  await expect(word).toHaveAttribute('data-footnote-short', 'prep. 在; 向; 对');
  
});



test('tokenize punctuation double quotation am', async ({ testPage, extensionId, popupPage }) => {
  
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.locator("#tokenize-punctuation-last-word-double-quotation mea-token[data-query='am']");
  await expect(word).toHaveText('am.”');
  await expect(word).toHaveAttribute('data-word', 'am');
  await expect(word).toHaveAttribute('data-base-word', 'be');
  await expect(word).toHaveAttribute('data-target-word', 'am');
  await expect(word).toHaveAttribute('data-footnote', 'be:v. 是; 表示; 在');
  await expect(word).toHaveAttribute('data-footnote-short', 'be:v. 是; 表示; 在');
  
});

test('phrase base form give up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-base-form mea-token[data-query='give']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give /giv/ 
n. 弹性; 适应性 vt. 给; 授予; 供给; 产生; 发表; 付出; 献出; 让出 vi. 捐赠; 支持不住; 让步give up  
vt. 放弃努力; 认输
`);
  
});


test('phrase transform irregular gave up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-tranform-irregular mea-token[data-query='gave']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`gave /geiv/ 
give的过去式give /giv/ 
n. 弹性; 适应性 vt. 给; 授予; 供给; 产生; 发表; 付出; 献出; 让出 vi. 捐赠; 支持不住; 让步give up  
vt. 放弃努力; 认输
`);
  
});


test('phrase transform continuous tense gaving up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-continuous-tense mea-token[data-query='giving']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give /giv/ 
n. 弹性; 适应性 vt. 给; 授予; 供给; 产生; 发表; 付出; 献出; 让出 vi. 捐赠; 支持不住; 让步giving /'giviŋ/  [give ing]
n. 礼物; 给予物give up  
vt. 放弃努力; 认输
`);
  
});


test('phrase transform continuous tense 2 gaving up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-continuous-tense2 mea-token[data-query='giving']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give /giv/ 
      n. 弹性; 适应性 vt. 给; 授予; 供给; 产生; 发表; 付出; 献出; 让出 vi. 捐赠; 支持不住; 让步giving /'giviŋ/  [give ing]
      n. 礼物; 给予物give up  
      vt. 放弃努力; 认输
    `);
  
});


test('phrase gerund giving up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-gerund mea-token[data-query='giving']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give /giv/ 
        n. 弹性; 适应性 vt. 给; 授予; 供给; 产生; 发表; 付出; 献出; 让出 vi. 捐赠; 支持不住; 让步giving /'giviŋ/  [give ing]
        n. 礼物; 给予物give up 
        vt. 放弃努力; 认输
`);
  
});

test('phrase prepositon gerund giving up', async ({ testPage, extensionId, popupPage }) => {
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let word = testPage.page.hover("#phrase-preposition-gerund mea-token[data-query='giving']");

  let definitions = testPage.page.locator("#mea-definitions");
  await expect(definitions).toHaveText(`give /giv/
        n. 弹性; 适应性 vt. 给; 授予; 供给; 产生; 发表; 付出; 献出; 让出 vi. 捐赠; 支持不住; 让步giving /'giviŋ/  [give ing]
        n. 礼物; 给予物give up 
        vt. 放弃努力; 认输
`);
  
});

test('pdf line end hyphen', async ({ testPage, extensionId, popupPage }) => {
  
  await testPage.gotoPdf();
  
  await popupPage.goto(extensionId);
  await popupPage.toggle();


  let compile = testPage.page.locator("mea-token[data-word='compile']").first();
  await expect(compile).toHaveText('com-', { timeout: 10000 });
  await expect(compile).toHaveAttribute('data-footnote', 'vt. 编译; 编辑; 编纂; 收集');
  await expect(compile).toHaveAttribute('data-footnote-short', 'vt. 编译; 编辑; 编纂; ...');
  
});

