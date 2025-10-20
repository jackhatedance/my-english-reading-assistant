import './side-panel.css';
import './side-panel-component.css';
import { createApp } from 'vue';
import SidePanel from './components/dialog/SidePanel.vue'
import { AppModes } from './components/types.js';
import { initializeOptionService, getSiteOptions } from './service/optionService.js';
import { initializeCustomDictionaryService } from './dictionary/customDictionary.js';

import {localizeHtmlPage} from './locale.js';
localizeHtmlPage();

var gSendMessageToApp;
var gChromeTabId;

let setSendMessageToApp = (sendMessageToApp)=>{
    gSendMessageToApp = sendMessageToApp;        
};

function sendMessageToContentPage(message, sender, resolve){

    if(gChromeTabId) {
        //console.log('send message to content page,chrome tab id:'+gChromeTabId + ',message:' + JSON.stringify(message));
        chrome.tabs.sendMessage(
            gChromeTabId,
            message,
            resolve
          );
    
    }else{
        console.log('unable to send message to content page, because chrome tab id is undefined, message:' + JSON.stringify(message));
    }
    
    //window.top.postMessage(message);
    //resolve({});            
}

let props = {
    appMode: AppModes.Standalone,
    setSendMessageToApp: setSendMessageToApp,
    sendMessageToContentPage: sendMessageToContentPage,
};

createApp(SidePanel, props).mount('#app');


document.addEventListener('DOMContentLoaded', async () => {
    //console.log('DOMContentLoaded');

    await initializeOptionService();
    //let siteDomain = document.location.hostname;
    
    //let siteOptions = await getSiteOptions(siteDomain);    
    
    //let additionalDictionaryNames = siteOptions.other.additionalDictionaries;
    //await initializeCustomDictionaryService(additionalDictionaryNames);   

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
    //console.log('iframe window recieve message:'+ JSON.stringify(event.data));
    // IMPORTANT: check the origin of the data!
    /* TODO
    if (event.origin === 'https://your-first-site.example') {
        //console.log(event.data);
    } 
    */
   
    gSendMessageToApp(event.data, null, (response)=>{});
}, false);

chrome.tabs.getCurrent((tab)=>{
    gChromeTabId = tab.id;
    //console.log('My Chrome Tab:'+ gChromeTabId);
    load();
});
