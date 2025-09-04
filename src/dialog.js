import { sendMessageToEmbeddedApp } from './embed/iframe-embed.js';

function closeDialog(){
  let topDocument = window.top.document;
  let dialog = topDocument.querySelector('#mea-vue-container');
  
  dialog.close();
}

function showDialog(menuItems = []){
  let request = {
    type: 'ACTIVE_APP_TAB',
    payload: {      
      activeAppTabId: 'actions-tab',
      menuItems: menuItems,        
    },
  };
  let sender = null;
  let sendResponse = (response) => { };
  sendMessageToEmbeddedApp(request, sender, sendResponse);

  let topDocument = window.top.document;
  let dialog = topDocument.querySelector('#mea-vue-container');
  
  dialog.showModal();  
}

export { showDialog, closeDialog }