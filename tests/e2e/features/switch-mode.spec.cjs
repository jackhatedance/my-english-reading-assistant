import { test, expect } from '../fixtures';


test('switch mode - default global switch mode is off', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('general');

  const selectedSitchMode = await optionsPage.page.getByTestId('switch-mode').inputValue();
  
  await expect(selectedSitchMode).toBe('off');
  
});

test('switch mode - default site switch mode is unset', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await testPage.goto();
  
  await popupPage.goto(extensionId);
  
  const selectedSwitchMode = await popupPage.switchMode.inputValue();
  
  await expect(selectedSwitchMode).toBe('');
});

test('switch mode - set global switch mode to auto and visit Chinese page', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('general');

  await optionsPage.page.getByTestId('switch-mode').selectOption('auto');
  
  await testPage.goto('features/switch-mode/chinese.html');

  await popupPage.goto(extensionId);
  const selectedSwitchMode = await popupPage.switchMode.inputValue();
  await expect(selectedSwitchMode).toBe('');

  
  const body = testPage.page.locator('body');
  await expect(body).not.toHaveAttribute('mea-preprocessed');

});

test('switch mode - set global switch mode to auto and visit English page', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('general');

  await optionsPage.page.getByTestId('switch-mode').selectOption('auto');
  
  await testPage.goto('features/switch-mode/english.html');

//  await popupPage.goto(extensionId);
  //await expect(popupPage.switchCheckbox).toBeChecked();

  
  const body = testPage.page.locator('body');
  await expect(body).toHaveAttribute('mea-preprocessed', 'true');

});
