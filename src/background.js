'use strict';

import {markWordAsKnown, markWordAsUnknown} from './vocabularyStore.js';
import {searchWord, isKnown} from './language.js'
import {initializeOptionService, getOptionsFromCache, refreshOptionsCache} from './service/optionService.js';
import {addActivityToStorage} from './service/activityService.js';
// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

const gTabInfoMap = new Map();

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
        //console.log('add know word is passed to contentScript file');
      }
    );
  });
}

chrome.runtime.onInstalled.addListener(async function () {
  await initializeOptionService();
  
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
  
  chrome.contextMenus.create({
    title: 'Refresh Definitions',
    contexts: ['page'],
    id: 'refresh'
  });
  
  
});

chrome.contextMenus.onClicked.addListener(async(item, tab) => {
  
  let word = item.selectionText;
  //console.log("select word: " + word);
  if(item.menuItemId === 'toggle') {
    let searchResult = searchWord({
      query: word,
      allowLemma: true,
      allowRemoveSuffixOrPrefix: false,
    });
    if(searchResult){
      let baseForm = searchResult.word;
      
      let options = getOptionsFromCache();
      let rootMode = options.rootAndAffix.enabled;

      let targetWord = baseForm;
      if(rootMode && searchResult.roots) {
        let roots = searchResult.roots;
        if(roots.length == 1){
          targetWord = roots[0];
        }
      }

      if(!await isKnown(targetWord)){
        await markWordAsKnown(targetWord);
        sendMsg('ADD_KNOWN_WORD', targetWord);
      } else {
        await markWordAsUnknown(targetWord);
        sendMsg('REMOVE_KNOWN_WORD', targetWord);
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
    //console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  } else if(request.type === 'INIT_PAGE_ANNOTATIONS_FINISHED') {

    //console.log('page changed, type:' + request.type);
    //console.log('tabId:'+ sender.tab.id +', title:'+request.payload.title);
    let tabId =sender.tab.id;

    let startTime = new Date().getTime();
    let title = request.payload.title;
    let url = request.payload.url;
    let site = request.payload.site;
    let totalWordCount = request.payload.totalWordCount;
    let newTabInfo = {tabId: tabId, title: title, url:url, site:site, startTime: startTime, wordChanges:0, totalWordCount: totalWordCount};
    
    //console.log('new tab info:'+ JSON.stringify(newTabInfo));
    let oldTabInfo = gTabInfoMap.get(tabId);
    
    if(oldTabInfo && oldTabInfo.startTime){
      saveReadingActivityAndClearStartTime(oldTabInfo);
    }

    gTabInfoMap.set(tabId, newTabInfo);
    
  } else if(request.type === 'OPTIONS_CHANGED'){

    console.log('options changed, reload options to cache');
    refreshOptionsCache();

  } else if(request.type === 'PAGE_URL_CHANGED'){

    //console.log('page changed, type:' + request.type);
    console.log('page url changed, tabId:'+ sender.tab.id +', title:'+request.payload.title);
    let tabId =sender.tab.id;

    let oldTabInfo = gTabInfoMap.get(tabId);
    if(oldTabInfo){
      saveReadingActivityAndClearStartTime(oldTabInfo);
    }

  } else if(request.type === 'MARK_WORD'){
    let tabId;
    if(request.payload.contentTabId){
      tabId = request.payload.contentTabId;
    } else {
      tabId =sender.tab.id;
    }
    let wordChanges = request.payload.wordChanges;
    let tabInfo = gTabInfoMap.get(tabId);
    
    tabInfo.wordChanges = tabInfo.wordChanges + wordChanges;
    
    console.log(`mark word, tabId:${tabId}, changes:${wordChanges}`);
  }
});

chrome.tabs.onUpdated.addListener((tabId,changeInfo, tab) => {
  if(changeInfo.status==='complete'){
    //console.log('tab updated: ' + 'tabId:' + tabId + 'changeInfo:' +JSON.stringify(changeInfo) + ', '+ JSON.stringify(tab));
    let tabInfo = gTabInfoMap.get(tabId);
    if(tabInfo){
      console.log(`on updated page: ${tabInfo.title}`);
      //saveActivities(tabId, tabInfo);
    }
  }
  
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  //console.log('activeInfo:'+JSON.stringify(activeInfo));

  let tabId = activeInfo.tabId;
  gTabInfoMap.forEach((value, key, map) => {
    if(!value){
      console.log('tabInfo is null, key:'+key);
    }
    let tabInfo = value;
    if(tabId === key){
      //set start time
      tabInfo.startTime = new Date().getTime();
    }else{
      saveReadingActivityAndClearStartTime(tabInfo);
    }
  });

});

chrome.tabs.onRemoved.addListener((tabId,removeInfo) => {
  //console.log('tab removed: '+ 'tabId:' + tabId +','+ JSON.stringify(removeInfo));
  let tabInfo = gTabInfoMap.get(tabId);
  if(tabInfo){
    saveReadingActivityAndClearStartTime(tabInfo);
  }
});

function saveReadingActivityAndClearStartTime(tabInfo){
  let options = getOptionsFromCache();
  //console.log('get options from cache:'+JSON.stringify(options));
  if(!options.report.enabled){
    return;
  }

  if(tabInfo.startTime){

    let endTime = new Date().getTime();
    var duration = endTime - tabInfo.startTime;
    
    //console.log(`finish read page <<${tabInfo.title}>> in ${timeDiff} seconds, word changes:${tabInfo.wordChanges}`);
    addActivityToStorage({
      startTime: tabInfo.startTime,
      endTime: endTime,
      site: tabInfo.site,
      url: tabInfo.url,
      sessionId: tabInfo.tabId,
      duration: duration,
      title: tabInfo.title,
      totalWordCount: tabInfo.totalWordCount,
      wordChanges: tabInfo.wordChanges, 
    });

    tabInfo.startTime = null;
  }
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
          //console.log('Current enabled value passed to contentScript file:'+ enabled);
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
          force: true      
        },
      },
      (response) => {
        //console.log('refresh page response');
        //resolve(response);
      }
    );
  });
}