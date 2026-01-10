'use strict';

import { loadKnownWords, markWordAsKnown, markWordAsUnknown} from './vocabularyStore.js';
import {searchWord, isKnown} from './language.js'
import { getOptions } from './service/optionService.js';
import { migrateDictionary, migrateAllDictionaries } from './dictionary/customDictionary.js'
import log from 'loglevel'
import { initLog, setDebugLoggers } from './log.js'
import { getTabInfo } from './service/tab-service.js';
import { onTabCreated, onTabUpdated, onAnnotationInitialized, onAnnotationCleaned, onTabBlurred, onTabFocused, onTabRemoved, onWordMarked, onIdleStateChanged } from './service/activity-core-service.js'
import { truncateString } from './utils/stringUtils.js'
import { collect } from './track/google-analytics.js'
// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages


initLog();

async function doSetLogLevels(){
  let sysOptions = await getOptions();
  setDebugLoggers(sysOptions.advanced.debugLoggers);
}
doSetLogLevels();

const gLogger = log.getLogger("background");
chrome.idle.setDetectionInterval(5 * 60);//5 minutes

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
  /*
  problem of context menu:
  * right click on MacOs Chrome will select the word, and the selection triggers note operation. Unless user disable the note function firstly.
  I would prefer the hover solution: when user hover mouse to a word, a tooltip will display, a small button in the tooptip to mark words.
  
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
  */
  
  let options = await getOptions();
  if(options.dictionary.automigration == true){
    gLogger.info('check dictionaries');
    migrateAllDictionaries((name, progress) => sendMsgOfIndexBuildingProgress(name, progress));        
  }
});

chrome.contextMenus.onClicked.addListener(async(item, tab) => {
  
  let word = item.selectionText;
  //console.log("select word: " + word);
  if(item.menuItemId === 'toggle') {
    let searchResult = searchWord(word, {
      allowLemma: true,      
    });
    if(searchResult){
      let baseForm = searchResult.word;
      
      let options = await getOptionsFrom();
      let rootMode = options.rootAndAffix.enabled;

      let targetWord = baseForm;
      if(rootMode && searchResult.roots) {
        let roots = searchResult.roots;
        if(roots.length == 1){
          targetWord = roots[0];
        }
      }

      let vocabulary = await loadKnownWords();

      if(!isKnown(targetWord, vocabulary)){
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

  let tabId = null;
  let tabTitle = '';
  if(sender.tab != null){
    tabId =sender.tab.id;
    tabTitle = truncateString(sender.tab.title,20);
  }

  gLogger.debug(`on message:${request.type}, ${tabTitle}`);
  
  let message = 'ok';
  if(request.type === 'PAGE_ANNOTATION_INITIALIZED') {

    //console.log('page changed, type:' + request.type);
    //console.log('tabId:'+ sender.tab.id +', title:'+request.payload.title);
    

    let startTime = new Date().getTime();
    let title = request.payload.title;
    let url = request.payload.url;
    let isbn = request.payload.isbn;
    let site = request.payload.site;
    let totalWordCount = request.payload.totalWordCount;
    let newTabInfo = {tabId: tabId, title: title, url:url, isbn: isbn, site:site, startTime: startTime, wordChanges:0, totalWordCount: totalWordCount};
    
    onInitPageFinished(tabId, newTabInfo, sender.tab);
  } else if(request.type === 'PAGE_ANNOTATION_CLEANED'){
    onCleanPageFinished(tabId);
  } else if(request.type === 'PAGE_LOADED_WITHOUT_AUTO_ENABLE'){
    setIcon(tabId, false);
  } else if(request.type === 'WINDOW_FOCUS'){
    onTabFocused(tabId);
  } else if(request.type === 'WINDOW_BLUR'){
    onTabBlurred(tabId);
  } else if(request.type === 'MARK_WORD'){
    let tabId;
    if(request.payload.contentTabId){
      tabId = request.payload.contentTabId;
    } else {
      tabId =sender.tab.id;
    }
    let wordChanges = request.payload.wordChanges;
    
    onWordMarked(tabId, wordChanges);
  } else if(request.type === 'DICTIONARY_CHANGE'){
    
    //console.log('DICTIONARY_CHANGE event:' + JSON.stringify(request.payload));
    let dictionaryName = request.payload.dictionaryName;
    //dictionary migration
    migrateDictionary(dictionaryName, (progress) => sendMsgOfIndexBuildingProgress(dictionaryName, progress));        
  } else if(request.type === 'OPTIONS_CHANGE'){
    doSetLogLevels();
  } else if(request.type === 'TRACK_EVENTS'){
    onTrackEvents(request.payload.events);
  }

  sendResponse({
    message,
  });
});

async function onInitPageFinished(tabId, newTabInfo, tab){
  await onAnnotationInitialized(tabId, newTabInfo, tab);
  setIcon(tabId, true);
}

async function onCleanPageFinished(tabId){
  await onAnnotationCleaned(tabId);
  setIcon(tabId, false);
}

chrome.tabs.onCreated.addListener(async (tab) => {
  
  gLogger.debug(`on event: tabCreated, tabId:${tab.id}`);
  //console.log('tab updated: ' + 'tabId:' + tabId + 'changeInfo:' +JSON.stringify(changeInfo) + ', '+ JSON.stringify(tab));
  
  await onTabCreated(tab);
  
});

chrome.tabs.onUpdated.addListener(async (tabId,changeInfo, tab) => {
  
  if(changeInfo.status==='complete'){
    gLogger.debug(`on event: tabUpdated, tabId:${tabId}, status:${changeInfo.status}`);
    //console.log('tab updated: ' + 'tabId:' + tabId + 'changeInfo:' +JSON.stringify(changeInfo) + ', '+ JSON.stringify(tab));
    
    await onTabUpdated(tabId, changeInfo, tab);

    let tabInfo = await getTabInfo(tabId);
    if(tabInfo){
      //it is impossible to get tabInfo here. the tabInfo is set after this event
      //console.log(`on updated page: ${tabInfo.title}`);
    }else {
      //by default, set it to active firstly.
      //so that it show colorful icon on special pages, such as "chrome://"
      setIcon(tabId, true);
    }
  }
  
});

//below event is no longer required. replaced by focus and blur event;
/*
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('activeInfo:'+JSON.stringify(activeInfo));

  let tabId = activeInfo.tabId;
  //i guess below code is to save activity for all other tabs, actually another one tab which start time is not null
  let tabInfoMap = await getTabInfoMap();
  for (let key of tabInfoMap.keys()) {
      let tabInfo = tabInfoMap.get(key);
      
      if(!tabInfo){
        //console.log('tabInfo is null, key:'+key);
      }
      
      if(tabId === key){
        //set start time
        tabInfo.startTime = new Date().getTime();
      }else{
        await saveReadingActivityAndClearStartTime(tabInfo);
      }
  }
  
  await saveTabInfoMap(tabInfoMap);

});
*/

chrome.tabs.onRemoved.addListener(async (tabId,removeInfo) => {
  gLogger.debug(`on event: tabRemoved, tabId:${tabId}`);
  await onTabRemoved(tabId);
});

chrome.idle.onStateChanged.addListener(async (newState)=>{
  gLogger.debug(`on event: StateChanged, newState:${newState}`);
  await onIdleStateChanged(newState);
});


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


function sendMsgOfIndexBuildingProgress(name, progress){
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if(tabs.length>0){
      const tab = tabs[0];
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: 'DICTIONARY_JOB_PROGRESS',
          payload: {      
            "name": name,
            "progress": progress,
          },
        },
        (response) => {
          //console.log('refresh page response');
          //resolve(response);
        }
      );
    }
  });  
}


const activeIcon = {
  "16": "icons/icon_16.png",
  "32": "icons/icon_32.png",
  "48": "icons/icon_48.png",
  "128": "icons/icon_128.png"
};

const inactiveIcon = {
  "16": "icons/inactive/icon_16.png",
  "32": "icons/inactive/icon_32.png",
  "48": "icons/inactive/icon_48.png",
  "128": "icons/inactive/icon_128.png"
};

function setIcon(tabId, active){
  if(active){
    chrome.action.setIcon({
        path: activeIcon,
        tabId: tabId
      });
  }else {
    chrome.action.setIcon({
        path: inactiveIcon,
        tabId: tabId
      });
  }
}

async function onTrackEvents(events){
  await collect(events);
}