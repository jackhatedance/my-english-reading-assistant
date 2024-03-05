'use strict';

import {addKnownWord, removeKnownWord, isKnown} from './vocabularyStore.js';
import {searchWord} from './language.js'
// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages


function sendMsg(type, baseForm){
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: type,
        payload: {
          word: baseForm,
        },
      },
      (response) => {
        console.log('add know word is passed to contentScript file');
      }
    );
  });
}

chrome.runtime.onInstalled.addListener(function () {
  
  
  let toggle = chrome.contextMenus.create({
    title: 'Known <-> Unknown: %s',
    contexts: ['selection'],
    id: 'toggle'
  });

  chrome.contextMenus.create({
    title: 'Show Definitions',
    contexts: ['page'],
    id: 'enable'
  });
  chrome.contextMenus.create({
    title: 'Hide Definitions',
    contexts: ['page'],
    id: 'disable'
  });
  /*
  chrome.contextMenus.create({
    title: 'Refresh Definitions',
    contexts: ['page'],
    id: 'refresh'
  });
  */
  
});

chrome.contextMenus.onClicked.addListener(async(item, tab) => {
  
  let word = item.selectionText;
  console.log("select word: " + word);
  if(item.menuItemId === 'toggle') {
    let searchResult = searchWord({
      query: word,
      allowLemma: true,
      allowStem: true,
    });
    if(searchResult){
      let baseForm = searchResult.word;
      if(!await isKnown(baseForm)){
        await addKnownWord(baseForm);
        sendMsg('ADD_KNOWN_WORD', baseForm);
      } else {
        await removeKnownWord(baseForm);
        sendMsg('REMOVE_KNOWN_WORD', baseForm);
      }
      //sendMsg('TOGGLE_WORD', baseForm);
    }
  } else if(item.menuItemId === 'enable') {
    setEnabled(true);
  } else if(item.menuItemId === 'disable') {
    setEnabled(false);
  } else if(item.menuItemId === 'refresh') {
    refresh();
  }

});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GREETINGS') {
    const message = `Hi ${
      sender.tab ? 'Con' : 'Pop'
    }, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});


async function isPageAnnotationVisible(resolve){
  // Communicate with content script of
  // active tab by sending a message
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'IS_PAGE_ANNOTATION_VISIBLE',
        payload: {            
        },
      },
      (response) => {
        console.log('is page visible response: '+ response.visible);
        resolve(response.visible);
      }
    );
  });
}


function setEnabled(enabled) {
    // Communicate with content script of
    // active tab by sending a message
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];

      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'ENABLED',
          payload: {
            enabled: enabled
          },
        },
        (response) => {
          console.log('Current enabled value passed to contentScript file:'+ enabled);
        }
      );
    });
      
     
   
}

function refresh(){
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(
      tab.id,
      {
        type: 'REFRESH_PAGE',
        payload: {            
        },
      },
      (response) => {
        console.log('refresh page response');
        //resolve(response);
      }
    );
  });
}