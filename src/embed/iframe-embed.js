'use strict';

import { AppModes } from '../components/types.js';

function addVueApp() {
    var dialog = document.createElement('dialog');
    dialog.id="mea-vue-container";
    dialog.classList.add('mea-element');
    dialog.classList.add('mea-dialog');
    
    document.body.appendChild(dialog);


    let sidePanelUrl = chrome.runtime.getURL("side-panel.html");
    let innerHTML =
        `<iframe id="mea-vueapp" src="${sidePanelUrl}"></iframe>`;
    dialog.innerHTML = innerHTML;
  
    async function getActiveTabId(resolve){
        return null;
    }
    
    let setSendMessageToApp = (sendMessageToApp)=>{
      if(sendMessageToApp){
        gSendMessageToEmbeddedApp = sendMessageToApp;
      }
      
    };
    /*
    let props = {
      appMode: AppModes.Embedded,
      setSendMessageToApp: setSendMessageToApp,
      sendMessageToContentPage: messageListener,
      getActiveTabId: getActiveTabId,
    };
    */
    
  }

function sendMessageToEmbeddedApp(request, sender, resolve){
    window.postMessage(request);
}

export { addVueApp, sendMessageToEmbeddedApp };