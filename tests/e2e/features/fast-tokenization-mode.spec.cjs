import { test, expect } from '../fixtures';
import { elSelect } from '../element-plus/element-plus.cjs'


test('fast tokenization mode - default is auto', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('site');

  const switchModeSelect = elSelect(optionsPage.page.getByTestId('partial-tokenizationh-mode'));
  
  await expect(switchModeSelect.selected()).toHaveText('auto');
  
});
