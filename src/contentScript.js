'use strict';

import './content.css';
import './side-panel-component.css';
import { loadKnownWords } from './vocabularyStore.js';
import { isKnown, } from './language.js';
import { findSiteProfile, getSiteInfo, compareSiteInfo } from './site-profile/site-profiles.js';
import { refreshOptionsCache, } from './service/optionService.js';
import { searchNote } from './service/noteService.js';
import { sendMessageToEmbeddedApp, resizeVueApp } from './embed/iframe-embed.js';
import { sendMessageToBackground } from './message.js';
import {getBaseWordFromElement} from './word.js';
import { containsSentenceInstancePosition, getSentenceHashSelectionFromInstanceSelection } from './sentence.js';
import { containsParagraphInstancePosition, getParagraphHashSelectionFromInstanceSelection, getParagraphInstanceSelectionsFromParagraphHashSelection } from './paragraph.js';
import { getSentenceInstanceSelectionFromNodeSelection, getParagraphInstanceSelectionFromNodeSelection, getSentenceInstanceSelectionsFromSentenceHashSelection, getSelectedTextOfNote } from './article.js';
import { isAllDocumentsAnnotationInitialized, changeStyleForAllDocuments } from './document.js';
import { getPageInfo, isPageAnnotationVisible, initPageAnnotations, resetPageAnnotationVisibility, getCurrentSiteOptions, isPageAnnotationInitialized, clearPagePreprocessMark } from './page.js'
import { MenuItems } from './menu.js';


//used to check if title changed
var gUrl;

//if site info changed, need to re-search site profile 
var gSiteInfo;
var gSiteProfile;

var gDocumentArticleMap;

var gDomChanges=0;
var gDomChangesMonitored=0;

window.addEventListener("load", myMain, false);
function myMain() {
  //console.log('page on load');
  var jsInitChecktimer = setTimeout(checkForJS_Finish, 100);

  function checkForJS_Finish() {
    if(!gSiteProfile){
      gSiteProfile = findSiteProfile(document);
    }    

    getCurrentSiteOptions().then(siteOptions => {
      if (siteOptions.enabled) {
        initPageAnnotations(gSiteProfile, addDocumentEventListener).then((documentArticleMap) => {
          gDocumentArticleMap = documentArticleMap;
          resetPageAnnotationVisibilityAndNotify(true);
        });
      }
    });

  }


}

function messageListener(request, sender, sendResponse) {
  //console.log(`request type: ${request.type}`);
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
        initPageAnnotations(gSiteProfile, addDocumentEventListener).then((documentArticleMap) => {
          gDocumentArticleMap = documentArticleMap;
          resetPageAnnotationVisibilityAndNotify(request.payload.enabled);
        });
      } else {
        resetPageAnnotationVisibilityAndNotify(request.payload.enabled);
      }

    } else {
      resetPageAnnotationVisibilityAndNotify(false);
    }

  } else if (request.type === 'REFRESH_PAGE') {
    console.log(`refresh page`);
    let visible = isPageAnnotationVisible();

    if (visible) {//master document
      if (request.payload.force) {
        clearPagePreprocessMark(gSiteProfile);
      }

      //init all documents
      initPageAnnotations(gSiteProfile, addDocumentEventListener).then((documentArticleMap) => {
        gDocumentArticleMap = documentArticleMap;
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
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible, source);
    
    //resetPageAnnotationVisibility(gDocumentArticleMap, visible, null);

  } else if (request.type === 'NOTES_UPDATED') {
    //console.log(`${request.type}`);
    let source = request.payload.source;
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible, source, 'note');
  } else if (request.type === 'GET_PAGE_INFO') {
    //it is from popup page

    console.log(`${request.type}`);

    
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
          sendMessageToApp(request2, null, ()=>{});
        }
       
      });
      
    
  } else if (request.type === 'OPTIONS_CHANGED') {
    refreshOptionsCache();
  } else if (request.type === 'CLOSE_DIALOG') {
    closeDialog();
  } else if (request.type === 'RESIZE_IFRAME') {
    let {width, height} = request.payload;
    resizeVueApp(width, height);
  } else if (request.type === 'CHANGE_STYLE') {
    //console.log(`change style`);
    if (request.payload) {
      //annotationOptions = request.payload;
      getCurrentSiteOptions().then(options => {
        changeStyleForAllDocuments(gSiteProfile, options.annotation);
      });
    }

  }


  sendResponse(response);
  return;
}
// Listen for message
chrome.runtime.onMessage.addListener(messageListener);



setInterval(monitorTimer, 2000);

function monitorTimer() {

  let siteInfoSame = checkSiteInfoChanges();
  if(!gSiteProfile || !siteInfoSame){
    gSiteProfile = findSiteProfile(document);
  }
 

  if (gSiteProfile.needRefreshPageAnnotation(document)) {
    //console.log('needRefreshPageAnnotation');
    initPageAnnotations(gSiteProfile, addDocumentEventListener).then((documentArticleMap) => {
      gDocumentArticleMap = documentArticleMap;
      resetPageAnnotationVisibilityAndNotify(true);
    });
  }

  if (gDomChanges > 0) {
    if(gDomChanges === gDomChangesMonitored){
      //console.log('DOM changed, auto refresh page annotation');
      
      //reset
      gDomChanges =0;

      clearPagePreprocessMark(gSiteProfile);
      
      initPageAnnotations(gSiteProfile, addDocumentEventListener).then((documentArticleMap) => {
        gDocumentArticleMap = documentArticleMap;
        resetPageAnnotationVisibilityAndNotify(true);
      });  
    } else {
      gDomChangesMonitored = gDomChanges;
    } 
  }

  let url = gSiteProfile.getUrl(document);
  //console.log('gUrl:'+gUrl +',\nurl:'+url);
  if (gUrl && gUrl !== url) {
    sendMessageToBackground(gSiteProfile, 'PAGE_URL_CHANGED', getPageInfo, gDocumentArticleMap);
  }

  //update gloabl variable
  gUrl = url;

}

function checkSiteInfoChanges(){
  let siteInfo = getSiteInfo();
  let same = compareSiteInfo(gSiteInfo, siteInfo);
  if(!same){
    gSiteInfo = siteInfo;
  }
    
  return same;
}

async function addDocumentEventListener(document, documentConfig) {
  
  document.addEventListener("mouseup", async (event) => {
    
    //mouse up event on dialog itself, ignore
    let dialog = event.target.closest('.mea-dialog');
    if(dialog){
      return;
    }

    //wont show dialog on a link
    let aLink = event.target.closest('a');
    if(aLink){
      let href = aLink.getAttribute('href');
      if(href) {
        return;
      }      
    }

    let nodeSelection = document.getSelection();
    let selectedText = nodeSelection.toString();

    let article = gDocumentArticleMap.get(document);
    if(article && nodeSelection.type !== 'None'){

      
      let sentenceInstanceSelection = getSentenceInstanceSelectionFromNodeSelection(article, nodeSelection);
      //console.log('mouse up, sentence instance selection:'+JSON.stringify(sentenceInstanceSelection));

      let paragraphInstanceSelection = getParagraphInstanceSelectionFromNodeSelection(article, nodeSelection);
      //console.log('mouse up, paragraph instance selection:'+JSON.stringify(paragraphInstanceSelection));
      
      let sentenceHashSelection = getSentenceHashSelectionFromInstanceSelection(sentenceInstanceSelection, (sentenceNumber) => article.sentences[sentenceNumber].sentenceId);
      //console.log('mouse up, sentence hash selection:'+JSON.stringify(sentenceHashSelection));
      
      let paragraphHashSelection = getParagraphHashSelectionFromInstanceSelection(paragraphInstanceSelection, (paragraphNumber) => article.paragraphs[paragraphNumber].paragraphId);
      //console.log('mouse up, paragraph hash selection:'+JSON.stringify(paragraphHashSelection));
      
      let isSelectionCollapsed = nodeSelection.isCollapsed;
      
      let type;
      let menuItems = [];
      let word;
      
      let filteredNotes = [];
      if (isSelectionCollapsed) {
        //1. mark the word
        let targetElement = event.target;
        let highlightElement = targetElement.closest('.mea-word');
        if(highlightElement){//find word
          word = getBaseWordFromElement(highlightElement);

          let knownWords = await loadKnownWords();
          if(isKnown(word, knownWords)){
            menuItems.push(MenuItems.MarkAsUnknown);
          } else {
            menuItems.push(MenuItems.MarkAsKnown);
          }
          menuItems.push(MenuItems.ClearMark);   
          menuItems.push(MenuItems.Vocabulary);
        }

        //2. search note of the position
        type = 'search-note';
        

        let noteArray = await searchNote(sentenceHashSelection.start, paragraphHashSelection.start);

        for (let note of noteArray) {
          let isContainsPosition;

          let selectionType = note.selection.type;
          if(selectionType === 'paragraph'){
            let paragraphInstanceSelections = getParagraphInstanceSelectionsFromParagraphHashSelection(article, note.selection);
            isContainsPosition = paragraphInstanceSelections.some((s) => containsParagraphInstancePosition(s, paragraphInstanceSelection.start));
          } else {
          let sentenceInstanceSelections = getSentenceInstanceSelectionsFromSentenceHashSelection(article, note.selection);
            isContainsPosition = sentenceInstanceSelections.some((s) => containsSentenceInstancePosition(s, sentenceInstanceSelection.start));
          }
          
          if(!isContainsPosition){
            continue;
          }

          let selectedText = getSelectedTextOfNote(article, note);
          note.selectedText = selectedText;

          filteredNotes.push(note);
        }
        //console.log('search notes:' + JSON.stringify(filteredNotes));
        if(filteredNotes.length>0){
          menuItems.push(MenuItems.ViewNote);
        }
      } else {
        type = 'select-text';
        menuItems.push(MenuItems.AddNote);
      }
      

      if (sentenceHashSelection || paragraphSelection) {
        let request = {
          type: 'SELECTION_CHANGE',
          payload: {
            word: word,
            type: type,            
            selectedText: selectedText,
            sentenceSelection: sentenceHashSelection,
            paragraphSelection: paragraphHashSelection,
            notes: filteredNotes,
          },
        };
        let sender = null;
        let sendResponse = (response) => {
          //console.log(response.message);
        };
        //console.log('selection change:'+JSON.stringify(request));
        sendMessageToApp(request, sender, sendResponse);

        if(menuItems.length>0){
          showDialog(menuItems);
        }
        
      }
    }
  });

  //DOM mutation changes
  const targetNode = document.body;
  const config = { attributes: false, childList: true, subtree: true };
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        //console.log("A child node has been added or removed.");
        gDomChanges ++;
      } else if (mutation.type === "attributes") {
        //console.log(`The ${mutation.attributeName} attribute was modified.`);
      }
    }
  };
  const observer = new MutationObserver(callback);

  observer.observe(targetNode, config);

  //observer.disconnect();
}
  
function closeDialog(){
  let topDocument = window.top.document;
  let dialog = topDocument.querySelector('#mea-vue-container');
  
  dialog.close();
}

function showDialog(menuItems = []){
  let request = {
    type: 'ACTIVE_APP_TAB',
    payload: {      
      activeAppTabId: 'actions-tab',
      menuItems: menuItems,        
    },
  };
  let sender = null;
  let sendResponse = (response) => { };
  sendMessageToApp(request, sender, sendResponse);

  let topDocument = window.top.document;
  let dialog = topDocument.querySelector('#mea-vue-container');
  
  dialog.showModal();  
}

function sendMessageToApp(request, sender, sendResponse){
  //send message to standalone
  /*
  chrome.runtime.sendMessage(
    request,
    sendResponse,
  );
  */
  
  sendMessageToEmbeddedApp(request, sender, sendResponse);
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
    sendMessageToApp(request, sender, sendResponse);
}



