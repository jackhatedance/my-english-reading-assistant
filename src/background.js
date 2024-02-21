'use strict';

import {addKnownWord, removeKnownWord} from './vocabularyStore.js';
import {searchWordBaseForm} from './language.js'
// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onInstalled.addListener(function () {
  
  // Create a parent item and two children.
  let parent = chrome.contextMenus.create({
    title: 'MyEnglishAssistant',
    contexts: ['selection'],
    id: 'parent'
  });
  chrome.contextMenus.create({
    contexts: ['selection'],
    title: 'Known',
    parentId: parent,
    id: 'known'
  });
  chrome.contextMenus.create({
    contexts: ['selection'],
    title: 'Unknown',
    parentId: parent,
    id: 'unknown'
  });

});

chrome.contextMenus.onClicked.addListener((item, tab) => {
  
  let word = item.selectionText;
  console.log("select word: " + word);
  if(item.menuItemId == 'known') {
    let baseForm = searchWordBaseForm(word);
    if(baseForm){
      addKnownWord(baseForm);
      console.log("add known word: " + baseForm);
    }
  } else if(item.menuItemId == 'unknown') {
    let baseForm = searchWordBaseForm(word);
    if(baseForm){
      removeKnownWord(baseForm);
      console.log("remove known word: " + baseForm);
    }
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
