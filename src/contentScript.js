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

//used to check if title changed
var gUrl;

//if site info changed, need to re-search site profile 
var gSiteInfo;
var gSiteProfile;

var gDocumentArticleMap;

var gDomChanges=0;
var gDomChangesMonitored=0;

var gDomMonitorInterval=2000;
const DOM_MONITOR_INTERVAL_MIN = 2000;
const DOM_MONITOR_INTERVAL_MAX = 5000;

var gMouseUpEventListener;
var gObserver;

initLog();
const gLogger = log.getLogger("contentScript");

window.addEventListener("load", myMain, false);

function updateDocumentArticleMap(documentArticleMap, n){
  if(gDocumentArticleMap==null){
    gDocumentArticleMap = new Map();
  }
  for (const [key, value] of documentArticleMap) {
    gDocumentArticleMap.set(key, value);
  }
  
  //console.log("updateDocumentArticleMap:"+n);
  //console.log(documentArticleMap);
  //console.log(gDocumentArticleMap);  
}

function myMain() {
  //console.log('page on load');
  var jsInitChecktimer = setTimeout(checkForJS_Finish, 100);

  function checkForJS_Finish() {
    if(!gSiteProfile){
      gSiteProfile = findSiteProfile(document);
    }    

    getCurrentSiteOptions().then(siteOptions => {
      if (siteOptions.enabled) {
        initPageAnnotations(gSiteProfile, addDocumentEventListener, addWordHoverEventListener).then((documentArticleMap) => {
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
      if (!isAllDocumentsAnnotationInitialized(gSiteProfile)) {
        initPageAnnotations(gSiteProfile, addDocumentEventListener, addWordHoverEventListener).then((documentArticleMap) => {
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
      if (isAnyDocumentsAnnotationInitialized(gSiteProfile)) {
        cleanPageAnnotations(gSiteProfile, removeDocumentEventListener).then((documentArticleMap) => {
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
        clearPagePreprocessMark(gSiteProfile);
      }

      //init all documents
      initPageAnnotations(gSiteProfile, addDocumentEventListener, addWordHoverEventListener).then((documentArticleMap) => {
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
    
    //resetPageAnnotationVisibility(gDocumentArticleMap, visible, null);

  } else if (request.type === 'NOTES_UPDATED') {
    //console.log(`${request.type}`);
    let source = request.payload.source;
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible, source, 'note');
  } else if (request.type === 'GET_PAGE_INFO') {
    //it is from popup page

    //console.log(`${request.type}`);

    
      getPageInfo(gSiteProfile, gDocumentArticleMap).then((pageInfo) => {
        response.pageInfo = pageInfo;

        //console.log('pageInfo response:' + JSON.stringify(response));
        
        sendResponse(response);
         
      });
      return true;
    
  } else if (request.type === 'GET_PAGE_INFO_AS_MESSAGE') {
    //console.log(`${request.type}`);

    
      getPageInfo(gSiteProfile, gDocumentArticleMap).then((pageInfo) => {
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
        changeStyleForAllDocuments(gSiteProfile, siteOptions);
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
  
  gDomMonitorInterval = interval;
}

async function domMonitor() {
  //console.log('domMonitor begin');
  let siteInfoSame = checkSiteInfoChanges();
  if(!gSiteProfile || !siteInfoSame){
    gSiteProfile = findSiteProfile(document);
  }
 
  //check body attribute flag.  
  let needRefresh = gSiteProfile.needRefreshPageAnnotation(document);

  if(gDomChanges > 0){
    gLogger.debug(`DOM changes:${gDomChanges}`);
  }
  
  if (gDomChanges > 0) {
    if(gDomChanges === gDomChangesMonitored){
      //no more changes in this interval. now we can reset annotations
      
      gLogger.debug(`DOM stop changing, ${gDomChanges} changes accumulated`);
      
      //reset
      gDomChanges =0;
      
      clearPagePreprocessMark(gSiteProfile);

      needRefresh = true;
    } else {
      gDomChangesMonitored = gDomChanges;
      needRefresh = false;
    } 
  }
  
  if(needRefresh) {
    gLogger.debug('start refresh page annotation');
    
    let startTime = new Date().getTime();

    let documentArticleMap = await initPageAnnotations(gSiteProfile, addDocumentEventListener, addWordHoverEventListener);
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

  let url = gSiteProfile.getUrl(document);
  //console.log('gUrl:'+gUrl +',\nurl:'+url);
  if (gUrl && gUrl !== url) {
    sendMessageToBackground(gSiteProfile, 'PAGE_URL_CHANGED', getPageInfo, gDocumentArticleMap);
  }

  //update gloabl variable
  gUrl = url;

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
  }, gDomMonitorInterval);
})();

function checkSiteInfoChanges(){
  let siteInfo = getSiteInfo();
  let same = compareSiteInfo(gSiteInfo, siteInfo);
  if(!same){
    gSiteInfo = siteInfo;
  }
    
  return same;
}

function getArticleFunc(document){
  return gDocumentArticleMap.get(document);
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
  gObserver.disconnect();
  document.removeEventListener("mouseup", gMouseUpEventListener);
  //console.log('removeDocumentEventListener');
}

function addDocumentEventListener(document, currentSiteOption) {  
  //console.log('addDocumentEventListener:' + document.baseURI);
  if(!gMouseUpEventListener){
    //console.log('create gMouseUpEventListener');
    gMouseUpEventListener = function(event) {
      mouseUpEventListenerWithParams(event, document, currentSiteOption, gDocumentArticleMap);
    }
  }
  document.addEventListener("mouseup", gMouseUpEventListener);

  //DOM mutation changes
  const targetNode = document.body;
  const config = { attributes: false, childList: true, subtree: true };
  const callback = (mutationList, observer) => {
    let domChangesStart = gDomChanges;
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
        let siteIgnoreDomChange = gSiteProfile.ignoreDomChange(mutation, addedNodeTextContents);
        if(!triggeredBySelf && !ignoreAddedNodeTextContentsSmallChange && !siteIgnoreDomChange){
          //console.log(addedNodeTextContents);
          //console.log(mutation);
          gDomChanges ++;
        }        
      } else if (mutation.type === "attributes") {
        //console.log(`The ${mutation.attributeName} attribute was modified.`);
      }
    }
    let domChangesCount = gDomChanges - domChangesStart;
    if(domChangesCount>0){
      //console.log(`DOM changes: ${domChangesCount}`);
    }    
  };
  gObserver = new MutationObserver(callback);

  gObserver.observe(targetNode, config);

}
  
async function resetPageAnnotationVisibilityAndNotify(enabled, source, types){
  await resetPageAnnotationVisibility(gSiteProfile, gDocumentArticleMap, enabled, types);

  let pageInfo = await getPageInfo(gSiteProfile, gDocumentArticleMap);
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



