'use strict';

import './content.css';
import './side-panel-component.css';
import { findSiteProfile, getSiteInfo, compareSiteInfo } from './site-profile/site-profiles.js';
import { getOptionsFromCache, refreshOptionsCache, } from './service/optionService.js';
import { sendMessageToEmbeddedApp, resizeEmbeddedApp } from './embed/iframe-embed.js';
import { sendMessageToBackground } from './message.js';
import { isAllDocumentsAnnotationInitialized, isAnyDocumentsAnnotationInitialized, changeStyleForAllDocuments } from './document.js';
import { mouseUpEventListenerWithParams } from './document/listener.js'
import { getPageInfo, isPageAnnotationVisible, initPageAnnotations, cleanPageAnnotations, resetPageAnnotationVisibility, getCurrentSiteOptions, isPageAnnotationInitialized, clearPagePreprocessMark } from './page.js'
import { MenuItems } from './menu.js';
import { MEA_TAG_PREFIX } from './html.js';
import { updateAdditionalDictionariesInCache } from './dictionary/customDictionary.js'
import { addTooltipEventListener } from './tooltip.js'
import { showDialog, closeDialog } from './dialog.js' 
import log from 'loglevel'
import { initLog } from './log.js'



const DOM_MONITOR_INTERVAL_MIN = 2000;
const DOM_MONITOR_INTERVAL_MAX = 5000;


var page = {
  //used to check if title changed
  url: null,
  //if site info changed, need to re-search site profile 
  siteInfo: null,
  siteProfile: null,
  
  documentArticleMap: null,
  
  domChanges: 0,
  domChangesMonitored:0,

  domMonitorInterval:2000,

  mouseUpEventListener: null,
  observer: null
};

initLog();
const gLogger = log.getLogger("contentScript");

window.addEventListener("load", myMain, false);

function updateDocumentArticleMap(documentArticleMap, n){
  if(page.documentArticleMap==null){
    page.documentArticleMap = new Map();
  }
  for (const [key, value] of documentArticleMap) {
    page.documentArticleMap.set(key, value);
  }
  
  //console.log("updateDocumentArticleMap:"+n);
  //console.log(documentArticleMap);
  //console.log(page.documentArticleMap);  
}

function myMain() {
  //console.log('page on load');
  var jsInitChecktimer = setTimeout(checkForJS_Finish, 100);

  function checkForJS_Finish() {
    if(!page.siteProfile){
      page.siteProfile = findSiteProfile(document);
    }    

    getCurrentSiteOptions().then(siteOptions => {
      if (siteOptions.enabled) {
        initPageAnnotations(page.siteProfile, addDocumentEventListener, addWordHoverEventListener).then((documentArticleMap) => {
          updateDocumentArticleMap(documentArticleMap, 1);
          resetPageAnnotationVisibilityAndNotify(true);
        });
      }
    });

  }


}

function messageListener(request, sender, sendResponse) {
  //console.log(`receive request type: ${request.type}`);
  let response = {};
  if (request.type === 'IS_PAGE_ANNOTATION_INITIALIZED') {
    let initialized = isPageAnnotationInitialized()
    //console.log(`Current page annotation is initialized: ${initialized}`);
    response = { initialized: initialized };
  } else if (request.type === 'IS_PAGE_ANNOTATION_VISIBLE') {
    let visible = isPageAnnotationVisible();
    //console.log(`Current page annotation is visible: ${visible}`);
    response = { visible: visible };
  } else if (request.type === 'ENABLED') {
    //console.log(`Current enabled is ${request.payload.enabled}`);
    if (request.payload.enabled) {
      if (!isAllDocumentsAnnotationInitialized(page.siteProfile)) {
        initPageAnnotations(page.siteProfile, addDocumentEventListener, addWordHoverEventListener).then((documentArticleMap) => {
          updateDocumentArticleMap(documentArticleMap, 2);
          resetPageAnnotationVisibilityAndNotify(request.payload.enabled);
        });
      } else {
        resetPageAnnotationVisibilityAndNotify(request.payload.enabled);
      }

    } else {
      //hide annotation
      //resetPageAnnotationVisibilityAndNotify(false);

      //remove annotation
      if (isAnyDocumentsAnnotationInitialized(page.siteProfile)) {
        cleanPageAnnotations(page.siteProfile, removeDocumentEventListener).then((documentArticleMap) => {
          //updateDocumentArticleMap(documentArticleMap, 2);
          //resetPageAnnotationVisibilityAndNotify(false);
        });
      } else {
        //resetPageAnnotationVisibilityAndNotify(false);
      }
    }

  } else if (request.type === 'REFRESH_PAGE') {
    //console.log(`refresh page`);
    let visible = isPageAnnotationVisible();

    if (visible) {//master document
      if (request.payload.force) {
        clearPagePreprocessMark(page.siteProfile);
      }

      //init all documents
      initPageAnnotations(page.siteProfile, addDocumentEventListener, addWordHoverEventListener).then((documentArticleMap) => {
        updateDocumentArticleMap(documentArticleMap, 3);
        resetPageAnnotationVisibilityAndNotify(visible);
      });
    }

  } else if (request.type === 'ADD_KNOWN_WORD' || request.type === 'REMOVE_KNOWN_WORD') {
    //console.log(`${request.type} known word: ${request.payload.word}`);
    if (request.payload.word) {
      //hideAnnotation(request.payload.word);
      let visible = isPageAnnotationVisible();
      resetPageAnnotationVisibilityAndNotify(visible);
    }

  } else if (request.type === 'KNOWN_WORDS_UPDATED') {
    //console.log(`${request.type}`);
    
    //hideAnnotation(request.payload.word);
    let source = request.payload.source;
    
    //won't refresh UI until dialog closed
    //let visible = isPageAnnotationVisible();
    //resetPageAnnotationVisibilityAndNotify(visible, source);
    
    //resetPageAnnotationVisibility(page.documentArticleMap, visible, null);

  } else if (request.type === 'NOTES_UPDATED') {
    //console.log(`${request.type}`);
    let source = request.payload.source;
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible, source, 'note');
  } else if (request.type === 'GET_PAGE_INFO') {
    //it is from popup page

    //console.log(`${request.type}`);

    
      getPageInfo(page.siteProfile, page.documentArticleMap).then((pageInfo) => {
        response.pageInfo = pageInfo;

        //console.log('pageInfo response:' + JSON.stringify(response));
        
        sendResponse(response);
         
      });
      return true;
    
  } else if (request.type === 'GET_PAGE_INFO_AS_MESSAGE') {
    //console.log(`${request.type}`);

    
      getPageInfo(page.siteProfile, page.documentArticleMap).then((pageInfo) => {
        response.pageInfo = pageInfo;

        //console.log('pageInfo response:' + JSON.stringify(response));
        
        if(request.payload.src === 'side_panel'){
          let request2 = {
            type:'UPDATE_PAGE_INFO',
            payload:{
              pageInfo
            }
          };
          sendMessageToEmbeddedApp(request2, null, ()=>{});
        }
       
      });
      //don't return true. the response of this message return immediately. another message will be send. 
    
  } else if (request.type === 'OPTIONS_CHANGED') {
    refreshOptionsCache();
  } else if (request.type === 'CLOSE_DIALOG') {
    closeDialog();

    //in case some word marked, refresh UI anyway
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible);
  } else if (request.type === 'RESIZE_IFRAME') {
    let {width, height} = request.payload;
    resizeEmbeddedApp(width, height);
  } else if (request.type === 'CHANGE_SITE_OPTIONS') {
    //console.log(`change site options`);
    if (request.payload) {      
      //annotationOptions = request.payload;
      getCurrentSiteOptions().then(async (siteOptions) => {
        await updateAdditionalDictionariesInCache(siteOptions.other.additionalDictionaries, ['index']);
        changeStyleForAllDocuments(page.siteProfile, siteOptions);
      });
    }

  }

  //default sync return, for async result either return true or Promise
  sendResponse(response);
}
// Listen for message
chrome.runtime.onMessage.addListener(messageListener);


function adjustDomMonitorInterval(workTime){
  let interval = workTime * 0.5

  if(interval < DOM_MONITOR_INTERVAL_MIN){
    interval = DOM_MONITOR_INTERVAL_MIN;
  } else if(interval > DOM_MONITOR_INTERVAL_MAX){
    interval = DOM_MONITOR_INTERVAL_MAX;
  }
  
  page.domMonitorInterval = interval;
}

async function domMonitor() {
  //console.log('domMonitor begin');
  let siteInfoSame = checkSiteInfoChanges();
  if(!page.siteProfile || !siteInfoSame){
    page.siteProfile = findSiteProfile(document);
  }
 
  //check body attribute flag.  
  let needRefresh = page.siteProfile.needRefreshPageAnnotation(document);

  if(page.domChanges > 0){
    gLogger.debug(`DOM changes:${page.domChanges}`);
  }
  
  if (page.domChanges > 0) {
    if(page.domChanges === page.domChangesMonitored){
      //no more changes in this interval. now we can reset annotations
      
      gLogger.debug(`DOM stop changing, ${page.domChanges} changes accumulated`);
      
      //reset
      page.domChanges =0;
      
      clearPagePreprocessMark(page.siteProfile);

      needRefresh = true;
    } else {
      page.domChangesMonitored = page.domChanges;
      needRefresh = false;
    } 
  }
  
  if(needRefresh) {
    gLogger.debug('start refresh page annotation');
    
    let startTime = new Date().getTime();

    let documentArticleMap = await initPageAnnotations(page.siteProfile, addDocumentEventListener, addWordHoverEventListener);
    updateDocumentArticleMap(documentArticleMap, 4);
    let endTime1 = new Date().getTime();
    let elapseTime1 = endTime1 - startTime;
    gLogger.debug(`initPageAnnotations ${elapseTime1} ms`);

    await resetPageAnnotationVisibilityAndNotify(true);
    let endTime2 = new Date().getTime();
    let elapseTime2 = endTime2 - endTime1;
    let elapseTimeTotal = endTime2 - startTime;
    adjustDomMonitorInterval(elapseTimeTotal);
    gLogger.debug(`resetPageAnnotation ${elapseTime2} ms`);

  }

  let url = page.siteProfile.getUrl(document);
  //console.log('page.url:'+page.url +',\nurl:'+url);
  if (page.url && page.url !== url) {
    sendMessageToBackground(page.siteProfile, 'PAGE_URL_CHANGED', getPageInfo, page.documentArticleMap);
  }

  //update gloabl variable
  page.url = url;

  //console.log('domMonitor end');
}

//enahnced version of setInterval(), make sure tasks are exectued sequentially.
(function domMonitorLoop() {
  setTimeout(async () => {
    try {
      await domMonitor();
    } finally {
      domMonitorLoop();
    }
  }, page.domMonitorInterval);
})();

function checkSiteInfoChanges(){
  let siteInfo = getSiteInfo();
  let same = compareSiteInfo(page.siteInfo, siteInfo);
  if(!same){
    page.siteInfo = siteInfo;
  }
    
  return same;
}

function getArticleFunc(document){
  return page.documentArticleMap.get(document);
}

async function addWordHoverEventListener(document, documentConfig, currentSiteOption) {
  let options = getOptionsFromCache();
  addTooltipEventListener(document, documentConfig, getArticleFunc,
    (word, dictionary) => {
      //console.log(`click tooltip of ${word}`);
      let request = {
        type: 'SELECTION_CHANGE',
        payload: {
          word: word,
          dictionary: dictionary,
          type: 'search-note',            
          selectedText: '',
          sentenceSelection: null,
          paragraphSelection: null,
          notes: [],
        },
      };
      let sender = null;
      let sendResponse = (response) => {
        //console.log(response.message);
      };
      //console.log('selection change:'+JSON.stringify(request));
      sendMessageToEmbeddedApp(request, sender, sendResponse);
      showDialog([MenuItems.Vocabulary]);
    }, 
    currentSiteOption,
    options,
    resetPageAnnotationVisibilityAndNotify
  );
}

function removeDocumentEventListener(document) { 
  page.observer.disconnect();
  document.removeEventListener("mouseup", page.mouseUpEventListener);
  //console.log('removeDocumentEventListener');
}

function addDocumentEventListener(document, currentSiteOption) {  
  //console.log('addDocumentEventListener:' + document.baseURI);
  if(!page.mouseUpEventListener){
    //console.log('create page.mouseUpEventListener');
    page.mouseUpEventListener = function(event) {
      mouseUpEventListenerWithParams(event, document, currentSiteOption, page.documentArticleMap);
    }
  }
  document.addEventListener("mouseup", page.mouseUpEventListener);

  //DOM mutation changes
  const targetNode = document.body;
  const config = { attributes: false, childList: true, subtree: true };
  const callback = (mutationList, observer) => {
    let domChangesStart = page.domChanges;
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        //console.log("A child node has been added or removed.");
        //console.log(mutation);
        let addedNodeTextContentArray = [];
        for(let node of mutation.addedNodes){
          if(node.textContent && node.textContent != ''){
            addedNodeTextContentArray.push(node.textContent);
          }          
        }
        let addedNodeTextContents = '';
        if(addedNodeTextContentArray.length>0){
          addedNodeTextContents = addedNodeTextContentArray.join('')
        } 

        const minContentChangeSize = 10;
        let addedNodeTextContentsLength = addedNodeTextContents.length;
        let ignoreAddedNodeTextContentsSmallChange = addedNodeTextContentsLength < minContentChangeSize;
        
        //skip the mutations that triggered by itself.
        let triggeredByTokenize = mutation.addedNodes.length > 0 && mutation.addedNodes[0].nodeName.startsWith(MEA_TAG_PREFIX);
        
        let targetId = mutation.target?.id;
        let triggeredInMeaElement = false;
        if(targetId){
          triggeredInMeaElement = targetId.toUpperCase().startsWith(MEA_TAG_PREFIX);
        }
        
        let triggeredBySelf = triggeredByTokenize || triggeredInMeaElement;
        let siteIgnoreDomChange = page.siteProfile.ignoreDomChange(mutation, addedNodeTextContents);
        if(!triggeredBySelf && !ignoreAddedNodeTextContentsSmallChange && !siteIgnoreDomChange){
          //console.log(addedNodeTextContents);
          //console.log(mutation);
          page.domChanges ++;
        }        
      } else if (mutation.type === "attributes") {
        //console.log(`The ${mutation.attributeName} attribute was modified.`);
      }
    }
    let domChangesCount = page.domChanges - domChangesStart;
    if(domChangesCount>0){
      //console.log(`DOM changes: ${domChangesCount}`);
    }    
  };
  page.observer = new MutationObserver(callback);

  page.observer.observe(targetNode, config);

}
  
async function resetPageAnnotationVisibilityAndNotify(enabled, source, types){
  await resetPageAnnotationVisibility(page.siteProfile, page.documentArticleMap, enabled, types);

  let pageInfo = await getPageInfo(page.siteProfile, page.documentArticleMap);
    //send message to side panel
    let request = {
        type: 'RESET_PAGE_ANNOTATION_VISIBILITY_FINISHED',
        payload: {
          pageInfo: pageInfo,
          source: source,
        },
      };
    let sender = null;
    let sendResponse = (response) => {
      //console.log(response.message);
    };
    sendMessageToEmbeddedApp(request, sender, sendResponse);
}



