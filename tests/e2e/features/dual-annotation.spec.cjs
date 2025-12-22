import { test, expect } from '../fixtures';
import { elSwitch } from '../element-plus/element-plus.cjs'


test('dual annotation - default is on', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('annotation');

  const dualAnnotationSwitch = elSwitch(optionsPage.page.getByTestId('dual-annotation'));
  
  await expect(dualAnnotationSwitch.input()).toBeChecked();

  await testPage.goto();

  await popupPage.goto(extensionId);
  //const dualAnnotationSwitch = elSelect(popupPage.dualAnnotation);
    
  await expect(popupPage.dualAnnotation).toBeVisible();
});


test('dual annotation - set to off', async ({ optionsPage, testPage, extensionId, popupPage }) => {
  
  await optionsPage.goto(extensionId);  
  await optionsPage.gotoTab('annotation');
  
  await optionsPage.page.getByTestId('dual-annotation').click();//turn off

  await testPage.goto();
  
  await popupPage.goto(extensionId);
  //const dualAnnotationSwitch = elSelect(popupPage.dualAnnotation);
    
  await expect(popupPage.dualAnnotation).not.toBeVisible();
});

