import './side-panel.css';
import './side-panel-component.css';
import { createApp } from 'vue';
import SidePanel from './components/SidePanel.vue'
import { AppModes } from './components/types.js';
import { initializeOptionService } from './service/optionService.js';

import {localizeHtmlPage} from './locale.js';
localizeHtmlPage();

var gSendMessageToApp;

let setSendMessageToApp = (sendMessageToApp)=>{
    gSendMessageToApp = sendMessageToApp;        
};

function sendMessageToContentPage(message, sender, resolve){
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        //console.log('send message to content page:'+ JSON.stringify(message));
        chrome.tabs.sendMessage(
          tab.id,
          message,
          resolve,
        );
    });
}

async function getActiveTabId(resolve){
    let tab = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab.id;
}

let props = {
    appMode: AppModes.Standalone,
    setSendMessageToApp: setSendMessageToApp,
    sendMessageToContentPage: sendMessageToContentPage,
    getActiveTabId: getActiveTabId,
};

createApp(SidePanel, props).mount('#app');


document.addEventListener('DOMContentLoaded', async () => {
    await initializeOptionService();
    load();

});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.active) {
        load();
    }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (tab.active) {
        load();
    }
});

function load(){
    let request = {
        type:'LOAD',
        payload: {

        },
    };
    gSendMessageToApp(request, null, (response) => {});
}

window.addEventListener('message', event => {
    // IMPORTANT: check the origin of the data!
    /* TODO
    if (event.origin === 'https://your-first-site.example') {
        console.log(event.data);
    } 
    */
    gSendMessageToApp(event.data, null, (response)=>{});
});
