import './side-panel.css';
import './side-panel-component.css';
import { createApp } from 'vue';
import SidePanel from './components/SidePanel.vue'
import { AppModes } from './components/types.js';
import { initializeOptionService } from './service/optionService.js';

import {localizeHtmlPage} from './locale.js';
localizeHtmlPage();

var gSendMessageToApp;
var gTabId;
var gInitialized = false;

let setSendMessageToApp = (sendMessageToApp)=>{
    gSendMessageToApp = sendMessageToApp;        
};

function sendMessageToContentPage(message, sender, resolve){

    //console.log('send message to content page:'+ JSON.stringify(message));
    if(gInitialized){
        chrome.tabs.sendMessage(
            gTabId,
            message,
            resolve,
        );
    }        
}

async function getActiveTabId(resolve){
    let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0].id;
}

let props = {
    appMode: AppModes.Standalone,
    setSendMessageToApp: setSendMessageToApp,
    sendMessageToContentPage: sendMessageToContentPage,
    getActiveTabId: getActiveTabId,
};

createApp(SidePanel, props).mount('#app');


document.addEventListener('DOMContentLoaded', async () => {
    //console.log('DOMContentLoaded');
    gTabId = await getActiveTabId();

    await initializeOptionService();

    gInitialized = true;

    load();

});


function load(){
    //console.log('load');
    let request = {
        type:'LOAD',
        payload: {

        },
    };
    gSendMessageToApp(request, null, (response) => {});
}

window.addEventListener('message', event => {
    //console.log('recieve message:'+ JSON.stringify(event.data));
    // IMPORTANT: check the origin of the data!
    /* TODO
    if (event.origin === 'https://your-first-site.example') {
        console.log(event.data);
    } 
    */
    gSendMessageToApp(event.data, null, (response)=>{});
}, false);
