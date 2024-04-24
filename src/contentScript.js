'use strict';

import './content.css';
import './side-panel-component.css';
import { markWordAsKnown, markWordAsUnknown, removeWordMark } from './vocabularyStore.js';
import { findSiteConfig } from './site-match.js';
import { refreshOptionsCache, } from './service/optionService.js';
import { searchNote } from './service/noteService.js';
import { sendMessageToEmbeddedApp } from './embed/iframe-embed.js';

import { hideToolbar } from './toolbar.js';
import { sendMessageMarkWord, sendMessageToBackground } from './message.js';

import {getBaseWordFromElement} from './word.js';
import { containsSentenceInstancePosition, getSentenceHashSelectionFromInstanceSelection } from './sentence.js';
import { findTokenInArticle, getSentenceInstanceSelectionFromNodeSelection, getSentenceInstanceSelectionsFromSentenceHashSelection, getSelectedTextOfNote } from './article.js';
import { isAllDocumentsAnnotationInitialized, changeStyleForAllDocuments } from './document.js';
import { getPageInfo, isPageAnnotationVisible, initPageAnnotations, resetPageAnnotationVisibility, getCurrentSiteOptions, isPageAnnotationInitialized, clearPagePreprocessMark } from './page.js'



//used to check if title changed
var gUrl;
/**
 * {id, }
 */


var gDocumentArticleMap;

window.addEventListener("load", myMain, false);
function myMain() {
  //console.log('page on load');
  var jsInitChecktimer = setTimeout(checkForJS_Finish, 100);

  function checkForJS_Finish() {

    getCurrentSiteOptions().then(siteOptions => {
      if (siteOptions.enabled) {
        initPageAnnotations(addDocumentEventListener).then((documentArticleMap) => {
          gDocumentArticleMap = documentArticleMap;
          resetPageAnnotationVisibilityAndNotify(true);
        });
      }
    });

  }


}

function messageListener(request, sender, sendResponse) {
  //console.log(`Current request type is ${request.type}`);
  let response = {};
  if (request.type === 'COUNT') {
    //console.log(`Current count is ${request.payload.count}`);
  } else if (request.type === 'IS_PAGE_ANNOTATION_INITIALIZED') {
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
      if (!isAllDocumentsAnnotationInitialized()) {
        initPageAnnotations(addDocumentEventListener).then((documentArticleMap) => {
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
        clearPagePreprocessMark();
      }

      //init all documents
      initPageAnnotations(addDocumentEventListener).then((documentArticleMap) => {
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
    let source = request.payload.source;
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible, source);
  } else if (request.type === 'NOTES_UPDATED') {
    //console.log(`${request.type}`);
    let source = request.payload.source;
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible, source, 'note');
  } else if (request.type === 'GET_PAGE_INFO') {
    console.log(`${request.type}`);

    
      //let pageInfo = await getPageInfo();
      getPageInfo().then((pageInfo) => {
        response.pageInfo = pageInfo;

        console.log('pageInfo response:' + JSON.stringify(response));
        
        sendResponse(response);
         
      });
      return true;
    
  } else if (request.type === 'GET_PAGE_INFO_AS_MESSAGE') {
    console.log(`${request.type}`);

    
      //let pageInfo = await getPageInfo();
      getPageInfo().then((pageInfo) => {
        response.pageInfo = pageInfo;

        console.log('pageInfo response:' + JSON.stringify(response));
        
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
      return true;
    
  } else if (request.type === 'OPTIONS_CHANGED') {
    refreshOptionsCache();
  }

  if (request.type === 'CHANGE_STYLE') {
    //console.log(`change style`);
    if (request.payload) {
      //annotationOptions = request.payload;
      getCurrentSiteOptions().then(options => {
        changeStyleForAllDocuments(options.annotation);
      });
    }

  }


  sendResponse(response);
  return;
}
// Listen for message
chrome.runtime.onMessage.addListener(messageListener);



setInterval(monitorTimer, 500);

function monitorTimer() {
  let siteConfig = findSiteConfig(document);

  if (siteConfig.needRefreshPageAnnotation(document)) {
    //console.log('needRefreshPageAnnotation');
    initPageAnnotations(addDocumentEventListener).then((documentArticleMap) => {
      gDocumentArticleMap = documentArticleMap;
      resetPageAnnotationVisibilityAndNotify(true);
    });
  }

  let url = siteConfig.getUrl(document);
  //console.log('gUrl:'+gUrl +',\nurl:'+url);
  if (gUrl && gUrl !== url) {
    sendMessageToBackground(siteConfig, 'PAGE_URL_CHANGED', getPageInfo);
  }

  //update gloabl variable
  gUrl = url;

}

async function addDocumentEventListener(document) {
  document.addEventListener("mouseover", async (event) => {
    let textNode = event.target;

    let parentElement = textNode.parentElement;
    if(!parentElement){
      //it is the top (html) element
      return;
    }

    if (!isInMeaElement(parentElement)) {
      return;
    }
    //console.log('mouse over:'+ textNode.textContent);
    let article = gDocumentArticleMap.get(document);
    if(article){

      let textNodeInfo = article.textNodeMap.get(textNode);
      if(textNodeInfo){
        console.log('text node info:'+ JSON.stringify(textNodeInfo));

        //console.log('caret:'+article.content.substring(caretIndex, caretIndex+10));
        
        let token = findTokenInArticle(article, textNodeInfo.offset);
    
        if(token){
          console.log('mouse over token:'+token.content);
        }
      }
    }
  });

  document.addEventListener("mousemove", async (event) => {
    /*
    let x = event.clientX;
    let y = event.clientY;
    let caretRange = document.caretRangeFromPoint(x, y);
    let text = caretRange.startContainer.textContent;
    //console.log(`mouse over, element text:${text}, start offset:${caretRange.startOffset}`);

    let textNode = caretRange.startContainer;
    let textNodeInfo = gArticle.textNodeMap.get(textNode);
    if(textNodeInfo){
      console.log('text node info:'+ JSON.stringify(textNodeInfo));

      let caretIndex = textNodeInfo.offset + caretRange.startOffset;
    
      //console.log('caret:'+gArticle.content.substring(caretIndex, caretIndex+10));
      
      let token = findTokenInArticle(gArticle, caretIndex);
  
      if(token){
        console.log('mouse over token:'+token.content);
      }
    }
    */
  });

  document.addEventListener("mouseup", async (event) => {
    let dialog = event.target.closest('.mea-dialog');
    if(dialog){
      return;
    }

    let nodeSelection = document.getSelection();
    let selectedText = nodeSelection.toString();

    let article = gDocumentArticleMap.get(document);
    if(article){

      
      let sentenceInstanceSelection = getSentenceInstanceSelectionFromNodeSelection(article, nodeSelection);
      console.log('mouse up, sentence instance selection:'+JSON.stringify(sentenceInstanceSelection));
      
      let sentenceHashSelection = getSentenceHashSelectionFromInstanceSelection(sentenceInstanceSelection, (sentenceNumber) => article.sentences[sentenceNumber].sentenceId);
      console.log('mouse up, sentence hash selection:'+JSON.stringify(sentenceHashSelection));
      
      let isSelectionCollapsed = nodeSelection.isCollapsed;
      
      let type = 'select-text';
      
      let filteredNotes = [];
      if (isSelectionCollapsed) {
        type = 'search-note';
        let noteArray = await searchNote(sentenceHashSelection.start);

        for (let note of noteArray) {
          let sentenceInstanceSelections = getSentenceInstanceSelectionsFromSentenceHashSelection(article, note.selection);
          let isContainsPosition = sentenceInstanceSelections.some((s) => containsSentenceInstancePosition(s, sentenceInstanceSelection.start));
          
          if(!isContainsPosition){
            continue;
          }

          let selectedText = getSelectedTextOfNote(article, note);
          note.selectedText = selectedText;

          filteredNotes.push(note);
        }
        //console.log('search notes:' + JSON.stringify(filteredNotes));

      }
      

      if (sentenceHashSelection) {
        let request = {
          type: 'SELECTION_CHANGE',
          payload: {
            type: type,
            selectedText: selectedText,
            sentenceSelection: sentenceHashSelection,
            notes: filteredNotes,
          },
        };
        let sender = null;
        let sendResponse = (response) => {
          //console.log(response.message);
        };
        sendMessageToApp(request, sender, sendResponse);
      }
    }
  });

  document.addEventListener("click", async (event) => {
    console.log('click on document');
    let targetElement = event.target;
    let highlightElement = targetElement.closest('.mea-word');
    if(highlightElement){
      handleClickWord(document, highlightElement);
    }else{
      hideToolbar(document);
    }

  });  
  
  document.querySelectorAll('.mea-mark-unknown').forEach((element) => {
    element.addEventListener('click', async (e) => {
      handleToolbarMarkUnknownAction(e);
    });
  });

  document.querySelectorAll('.mea-mark-known').forEach((element) => {
    element.addEventListener('click', async (e) => {
      handleToolbarMarkKnownAction(e);
    });
  });

  document.querySelectorAll('.mea-mark-clear').forEach((element) => {
    element.addEventListener('click', async (e) => {
      handleToolbarClearAction(e);
    });
  });

  document.querySelectorAll('.mea-notes').forEach((element) => {
    element.addEventListener('click', async (e) => {
      handleToolbarNoteAction(e);      
    });
  });
}

function handleClickWord(document, highlightElement){
  let show = false;

    let targetWord = getBaseWordFromElement(highlightElement);

    //gSelection = selection.toString();
    if (targetWord) {
      show = true;

      let toolbarElement = document.getElementsByClassName('mea-toolbar')[0];

      if (toolbarElement) {

        toolbarElement.style.top = window.scrollY + highlightElement.getBoundingClientRect().top - toolbarElement.offsetHeight + 'px';

        let offsetLeft = highlightElement.getBoundingClientRect().left + (highlightElement.offsetWidth * 0.5) - toolbarElement.offsetWidth * 0.5;

        let left = window.scrollX + offsetLeft;

        toolbarElement.style.left = left + 'px';



        toolbarElement.style.visibility = 'visible';

        toolbarElement.setAttribute('data-target-word', targetWord);

        //console.log('tooltip style:'+ toobarElement.style.cssText);
      }
    }


    if (!show) {
      let toolbarElement = document.getElementsByClassName('mea-toolbar')[0];

      toolbarElement.style.visibility = 'hidden';
    }
}

async function handleToolbarMarkUnknownAction(event){

  let targetWord = event.target.closest('.mea-toolbar').getAttribute('data-target-word');

  if (targetWord) {


    let wordChanges = await markWordAsUnknown(targetWord);
    sendMessageMarkWord(wordChanges);

    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible);
    hideToolbar(document);

  }
}

async function handleToolbarMarkKnownAction(event){

  let targetWord = event.target.closest('.mea-toolbar').getAttribute('data-target-word');

  if (targetWord) {


    let wordChanges = await markWordAsKnown(targetWord);
    sendMessageMarkWord(wordChanges);

    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible);
    hideToolbar(document);
  }
}

async function handleToolbarClearAction(event){

  let targetWord = event.target.closest('.mea-toolbar').getAttribute('data-target-word');

  if (targetWord) {
    let wordChanges = await removeWordMark(targetWord);
    sendMessageMarkWord(wordChanges);

    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(visible);
    hideToolbar(document);
  }
}

async function handleToolbarNoteAction(event){
  getPageInfo().then((pageInfo) => {
    let request ={
      type:'UPDATE_PAGE_INFO',
      payload:{
        pageInfo
      },
    };
    
    let sender = null;
    let sendResponse = (response) => {};
    sendMessageToApp(request, sender, sendResponse); 
  });
  
  let topDocument = window.top.document;
  let dialog = topDocument.querySelector('#mea-vue-container');

  /*
  let elementLeft = element.getBoundingClientRect().left;
  let clientWidth = topDocument.body.clientWidth;
  let pageNumber = Math.floor(elementLeft / clientWidth);


  let left = window.scrollX + clientWidth * pageNumber + (clientWidth - 400) / 2;
  dialog.style.left = left + 'px';
  */
  dialog.showModal();
}

function isInMeaElement(element) {
  if (!element) {
    console.log('null element');
    return false;
  }
  
  let meaElement = element.closest('.mea-element');
  if (meaElement) {
    return true;
  } else {
    return false;
  }
}




function sendMessageToApp(request, sender, sendResponse){
  //send message to standalone
  chrome.runtime.sendMessage(
    request,
    sendResponse,
  );

  sendMessageToEmbeddedApp(request, sender, sendResponse);
}

async function resetPageAnnotationVisibilityAndNotify(enabled, source, types){
  await resetPageAnnotationVisibility(gDocumentArticleMap, enabled, source, types);

  let pageInfo = await getPageInfo();
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



