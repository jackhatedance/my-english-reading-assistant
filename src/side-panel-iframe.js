import './side-panel.css';
import './side-panel-component.css';
import { createApp } from 'vue';
import SidePanel from './components/SidePanel.vue'
import { AppModes } from './components/types.js';
import { initializeOptionService } from './service/optionService.js';

import {localizeHtmlPage} from './locale.js';
localizeHtmlPage();

var gSendMessageToApp;
var gChromeTabId;

let setSendMessageToApp = (sendMessageToApp)=>{
    gSendMessageToApp = sendMessageToApp;        
};

function sendMessageToContentPage(message, sender, resolve){

    //console.log('send message to content page,chrome tab id:'+gChromeTabId + ',message:' + JSON.stringify(message));

    if(gChromeTabId) {
        chrome.tabs.sendMessage(
            gChromeTabId,
            message,
            resolve
          );
    
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
        console.log(event.data);
    } 
    */
   
    gSendMessageToApp(event.data, null, (response)=>{});
}, false);


chrome.runtime.sendMessage(
    {
        type: 'WHO_AM_I',
        payload: {          
        },
    },
    (response) => {
      gChromeTabId = response.message;
      //console.log('My Chrome Tab Id:'+ gChromeTabId);
      load();
    },
  );