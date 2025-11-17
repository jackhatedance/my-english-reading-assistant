import { test, expect } from '../fixtures';
import { elSelect } from '../element-plus/element-plus.cjs'


test('switch mode - default global switch mode is off', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('general');

  const switchModeSelect = elSelect(optionsPage.page.getByTestId('switch-mode'));
  
  await expect(switchModeSelect.selected()).toHaveText('always off');
  
});

test('switch mode - default site switch mode is unset', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  const switchModeSelect = elSelect(popupPage.switchMode);
  
  
  await expect(switchModeSelect.selected()).toHaveText('always off(default)');
});

test('switch mode - set global switch mode to auto and visit Chinese page', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('general');

  const switchModeSelect = elSelect(optionsPage.page.getByTestId('switch-mode'));
  await switchModeSelect.selectOptionByText('auto');
  
  await testPage.goto('features/switch-mode/chinese.html');

  await popupPage.goto(extensionId);
  
  await expect(elSelect(popupPage.switchMode).selected()).toHaveText('auto(default)');

  
  const body = testPage.page.locator('body');
  await expect(body).not.toHaveAttribute('mea-preprocessed');

});

test('switch mode - set global switch mode to auto and visit English page', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('general');

  await elSelect(optionsPage.page.getByTestId('switch-mode')).selectOptionByText('auto');
  
  await testPage.goto('features/switch-mode/english.html');

//  await popupPage.goto(extensionId);
  //await expect(popupPage.switchCheckbox).toBeChecked();

  
  const body = testPage.page.locator('body');
  await expect(body).toHaveAttribute('mea-preprocessed', 'true');

});
