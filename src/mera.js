'use strict';

import './content.css';
import './side-panel-component.css';
import { findSiteProfile } from './site-profile/site-profiles.js';
import { initPageAnnotations, getCurrentSiteOptions } from './page.js'
import { domMonitor } from './page/page-change-monitor.js'
import { pageMessageListenerWithParams } from './page/page-message-listener.js'
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
    //console.log('initDocumentMap');

    if(this.documentArticleMap==null){
      this.documentArticleMap = new Map();
    }
    this.documentArticleMap.clear();

    for (const [key, value] of documentArticleMap) {
      this.documentArticleMap.set(key, value);
    }

    //only keep valid document
    for (let [key, value] of this.documentInfoMap) {
      if(!documentArticleMap.has(key)){
        this.documentInfoMap.delete(key);
      }
    }
    
    
    //console.log("initDocumentMap:"+n);
    //console.log(documentArticleMap);
    //console.log(this.documentArticleMap);  

    //console.log("documentInfoMap:"+n);
    //console.log(this.documentInfoMap);
  }
};

initLog();
const gLogger = log.getLogger("mera");

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
        initPageAnnotations(page).then((documentArticleMap) => {
          page.initDocumentMap(documentArticleMap, 1);
          resetPageAnnotationVisibilityAndNotify(page, true);
        });
      }
    });

  }

}

// Listen for message
let pageMessageListener = function(request, sender, sendResponse) {
    return pageMessageListenerWithParams(page, request, sender, sendResponse);
  };
chrome.runtime.onMessage.addListener(pageMessageListener);



//enahnced version of setInterval(), make sure tasks are exectued sequentially.
(function domMonitorLoop() {
  setTimeout(async () => {
    try {
      await domMonitor(page);
    } finally {
      domMonitorLoop();
    }
  }, page.domMonitorInterval);
})();






