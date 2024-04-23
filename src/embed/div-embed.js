'use strict';

import { createApp } from 'vue';
import SidePanel from './components/SidePanel.vue';
import { AppModes } from './components/types.js';

function addVueApp() {
  var dialog = document.createElement('dialog');
  dialog.id = "mea-vue-container";
  dialog.classList.add('mea-element');
  dialog.classList.add('mea-dialog');
  document.body.appendChild(dialog);
  let innerHTML = `<div class="mea-dialog-header">
        <button class="mea-close-dialog-button">X</button>
      </div>
      <div id="vue">
      </div>`;

  dialog.innerHTML = innerHTML;

  async function getActiveTabId(resolve) {
    return null;
  }

  let setSendMessageToApp = (sendMessageToApp) => {
    if (sendMessageToApp) {
      gSendMessageToEmbeddedApp = sendMessageToApp;
    }

  };
  let props = {
    appMode: AppModes.Embedded,
    setSendMessageToApp: setSendMessageToApp,
    sendMessageToContentPage: messageListener,
    getActiveTabId: getActiveTabId,
  };

  createApp(SidePanel, props).mount(document.querySelector('#vue'));
}

async function addVueAppEventListener() {
  document.querySelectorAll('.mea-close-dialog-button').forEach((element) => {
    element.addEventListener('click', async (e) => {
      document.querySelector('#mea-vue-container').close();
    });
  });
}

export { addVueApp, addVueAppEventListener };