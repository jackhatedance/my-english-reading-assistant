'use strict';

import './content.css';
import './side-panel-component.css';
import { findSiteProfile } from './site-profile/site-profiles.js';
import { getOptionsFromCache, refreshOptionsCache, } from './service/optionService.js';
import { sendMessageToEmbeddedApp, resizeEmbeddedApp } from './embed/iframe-embed.js';
import { isAllDocumentsAnnotationInitialized, isAnyDocumentsAnnotationInitialized, changeStyleForAllDocuments } from './document.js';
import { mouseUpEventListenerWithParams } from './document/listener.js'
import { getPageInfo, isPageAnnotationVisible, initPageAnnotations, cleanPageAnnotations, resetPageAnnotationVisibility, getCurrentSiteOptions, isPageAnnotationInitialized, clearPagePreprocessMark } from './page.js'
import { MenuItems } from './menu.js';
import { updateAdditionalDictionariesInCache } from './dictionary/customDictionary.js'
import { addTooltipEventListener } from './tooltip.js'
import { showDialog, closeDialog } from './dialog.js' 
import { createMutationObserver } from './document/mutation-observer.js'
import { domMonitor } from './page/page-change-monitor.js'
import { resetPageAnnotationVisibilityAndNotify } from './page/page-utils.js'
import log from 'loglevel'
import { initLog } from './log.js'





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

  /**
   * keys: mouseUpEventListener, mutationObserver
   */
  documentInfoMap: new Map(),
  getDocumentInfo(key){
    let documentInfo = this.documentInfoMap.get(key);
    if(!documentInfo){
      documentInfo = {};
      this.documentInfoMap.set(key, documentInfo);
    }
    return documentInfo;
  },
  
  initDocumentMap(documentArticleMap, n){
    if(this.documentArticleMap==null){
      this.documentArticleMap = new Map();
    }
    this.documentArticleMap.clear();

    for (const [key, value] of documentArticleMap) {
      this.documentArticleMap.set(key, value);
    }

    this.documentInfoMap.clear();
    
    //console.log("initDocumentMap:"+n);
    //console.log(documentArticleMap);
    //console.log(page.documentArticleMap);  
  }
};

initLog();
const gLogger = log.getLogger("contentScript");

window.addEventListener("load", myMain, false);


function myMain() {
  //console.log('page on load');
  var jsInitChecktimer = setTimeout(checkForJS_Finish, 100);

  function checkForJS_Finish() {
    if(!page.siteProfile){
      page.siteProfile = findSiteProfile(document);
    }    

    getCurrentSiteOptions().then(siteOptions => {
      if (siteOptions.enabled) {
        initPageAnnotations(page, addDocumentEventListener, addWordHoverEventListener).then((documentArticleMap) => {
          page.initDocumentMap(documentArticleMap, 1);
          resetPageAnnotationVisibilityAndNotify(page, true);
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
        initPageAnnotations(page, addDocumentEventListener, addWordHoverEventListener).then((documentArticleMap) => {
          page.initDocumentMap(documentArticleMap, 2);
          resetPageAnnotationVisibilityAndNotify(page, request.payload.enabled);
        });
      } else {
        resetPageAnnotationVisibilityAndNotify(page, request.payload.enabled);
      }

    } else {
      //hide annotation
      //resetPageAnnotationVisibilityAndNotify(page, false);

      //remove annotation
      if (isAnyDocumentsAnnotationInitialized(page.siteProfile)) {
        cleanPageAnnotations(page.siteProfile, removeDocumentEventListener).then((documentArticleMap) => {
          //page.initDocumentMap(documentArticleMap, 2);
          //resetPageAnnotationVisibilityAndNotify(page, false);
        });
      } else {
        //resetPageAnnotationVisibilityAndNotify(page, false);
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
      initPageAnnotations(page, addDocumentEventListener, addWordHoverEventListener).then((documentArticleMap) => {
        page.initDocumentMap(documentArticleMap, 3);
        resetPageAnnotationVisibilityAndNotify(page, visible);
      });
    }

  } else if (request.type === 'ADD_KNOWN_WORD' || request.type === 'REMOVE_KNOWN_WORD') {
    //console.log(`${request.type} known word: ${request.payload.word}`);
    if (request.payload.word) {
      //hideAnnotation(request.payload.word);
      let visible = isPageAnnotationVisible();
      resetPageAnnotationVisibilityAndNotify(page, visible);
    }

  } else if (request.type === 'KNOWN_WORDS_UPDATED') {
    //console.log(`${request.type}`);
    
    //hideAnnotation(request.payload.word);
    let source = request.payload.source;
    
    //won't refresh UI until dialog closed
    //let visible = isPageAnnotationVisible();
    //resetPageAnnotationVisibilityAndNotify(page, visible, source);
    
    //resetPageAnnotationVisibility(page.documentArticleMap, visible, null);

  } else if (request.type === 'NOTES_UPDATED') {
    //console.log(`${request.type}`);
    let source = request.payload.source;
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(page, visible, source, 'note');
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
    resetPageAnnotationVisibilityAndNotify(page, visible);
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



//enahnced version of setInterval(), make sure tasks are exectued sequentially.
(function domMonitorLoop() {
  setTimeout(async () => {
    try {
      await domMonitor(page, addDocumentEventListener, addWordHoverEventListener);
    } finally {
      domMonitorLoop();
    }
  }, page.domMonitorInterval);
})();


function getArticleFunc(document){
  return page.documentArticleMap.get(document);
}

async function addWordHoverEventListener(document, documentConfig, currentSiteOption) {
  let options = getOptionsFromCache();
  addTooltipEventListener(page, document, documentConfig, getArticleFunc,
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
    options
  );
}

function removeDocumentEventListener(document) { 
  let documentInfo = page.getDocumentInfo(document);
  let mutationObserver = documentInfo.mutationObserver;
  mutationObserver.disconnect();

  let mouseUpEventListener = documentInfo.mouseUpEventListener;
  document.removeEventListener("mouseup", mouseUpEventListener);
  //console.log('removeDocumentEventListener');
}

function addDocumentEventListener(document, currentSiteOption) {  
  //console.log('addDocumentEventListener:' + document.baseURI);
  let documentInfo = page.getDocumentInfo(document);
  let mouseUpEventListener = documentInfo.mouseUpEventListener;
  if(!mouseUpEventListener){
    //console.log('create page.mouseUpEventListener');
    mouseUpEventListener = function(event) {
      mouseUpEventListenerWithParams(event, document, currentSiteOption, page.documentArticleMap);
    }
    documentInfo.mouseUpEventListener = mouseUpEventListener;
  }
  document.addEventListener("mouseup", mouseUpEventListener);

  //DOM mutation changes
  const targetNode = document.body;
  const config = { attributes: false, childList: true, subtree: true };
  
  let mutationObserver = createMutationObserver(document, page);
  documentInfo.mutationObserver = mutationObserver;

  mutationObserver.observe(targetNode, config);

}




