'use strict';

import './content.css';
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from './vocabularyStore.js';
import { isKnown, } from './language.js';
import { findSiteConfig } from './site-match.js';
import { initializeOptionService, refreshOptionsCache, getDefaultSiteOptions } from './service/optionService.js';
import { getNotes, searchNote } from './service/noteService.js';
import { containsSentenceInstancePosition, getSentenceHashSelectionFromInstanceSelection } from './sentence.js';
import { tokenizeTextNode, parseDocument, findTokenInArticle, getNodeSelectionsFromSentenceHashSelection, getSentenceInstanceSelectionFromNodeSelection, getSentenceInstanceSelectionsFromSentenceHashSelection, getSelectedTextOfNote } from './article.js';
import './side-panel-component.css';
import { addVueApp, addVueAppEventListener, sendMessageToEmbeddedApp } from './embed/iframe-embed.js';
import { cleanElements, containsMeaStyle, addStyle, isDocumentAnnotationInitialized, isAllDocumentsAnnotationInitialized } from './document.js';
import { addToolbar, hideToolbar } from './toolbar.js';
import { findStyleSheet, changeStyle } from './style.js';
import { sendMessageMarkWord } from './message.js';
import { getAllDocuments } from './document.js'
import { getPageInfo, isPageAnnotationVisible, getCurrentSiteOptions } from './page.js'

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page

//used to check if title changed
var gUrl;
/**
 * {id, }
 */


var gArticle;

async function getAnnotationOptions() {

  let options = await getCurrentSiteOptions();
  if (!options) {
    options = await getDefaultSiteOptions();
  }
  return options.annotation;
}


window.addEventListener("load", myMain, false);
function myMain() {
  //console.log('page on load');
  var jsInitChecktimer = setTimeout(checkForJS_Finish, 100);

  function checkForJS_Finish() {

    getCurrentSiteOptions().then(siteOptions => {
      if (siteOptions.enabled) {
        initPageAnnotations(() => {
          resetPageAnnotationVisibility(true);
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
        initPageAnnotations(() => {
          resetPageAnnotationVisibility(request.payload.enabled);
        });
      } else {
        resetPageAnnotationVisibility(request.payload.enabled);
      }

    } else {
      resetPageAnnotationVisibility(false);
    }

  } else if (request.type === 'REFRESH_PAGE') {
    console.log(`refresh page`);
    let visible = isPageAnnotationVisible();

    if (visible) {//master document
      if (request.payload.force) {
        clearAllDocumentsPreprocessMark();
      }

      //init all documents
      initPageAnnotations(() => {
        resetPageAnnotationVisibility(visible);
      });
    }

  } else if (request.type === 'ADD_KNOWN_WORD' || request.type === 'REMOVE_KNOWN_WORD') {
    //console.log(`${request.type} known word: ${request.payload.word}`);
    if (request.payload.word) {
      //hideAnnotation(request.payload.word);
      let visible = isPageAnnotationVisible();
      resetPageAnnotationVisibility(visible);
    }

  } else if (request.type === 'KNOWN_WORDS_UPDATED') {
    //console.log(`${request.type}`);
    let source = request.payload.source;
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibility(visible, source);
  } else if (request.type === 'NOTES_UPDATED') {
    //console.log(`${request.type}`);
    let source = request.payload.source;
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibility(visible, source, 'note');
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
      getAnnotationOptions().then(options => {
        changeStyleForAllDocuments(options);
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
    initPageAnnotations(() => {
      resetPageAnnotationVisibility(true);
    });
  }

  let url = siteConfig.getUrl(document);
  //console.log('gUrl:'+gUrl +',\nurl:'+url);
  if (gUrl && gUrl !== url) {
    sendMessageToBackground(siteConfig, 'PAGE_URL_CHANGED');
  }

  //update gloabl variable
  gUrl = url;

}

var knownWords;





function changeStyleForAllDocuments(options) {
  let documents = getAllDocuments();
  for (let document of documents) {
    changeStyle(document, options);
  }
}


function getBaseWordFromElement(element) {
  return element.getAttribute('data-base-word');
}

async function initPageAnnotations(resolve) {
  //console.log('initPageAnnotations');
  await initializeOptionService();

  knownWords = await loadKnownWords();
  if (!knownWords) {
    knownWords = [];
  }

  let siteConfig = findSiteConfig(document);

  if (!isDocumentAnnotationInitialized(document)) {
    let documentConfig = siteConfig.getDocumentConfig(window, document);

    preprocessDocument(document, false, documentConfig);
  }

  let iframeDocumentConfigs = siteConfig.getIframeDocumentConfigs(document);
  //console.log('start iframe annotattion');
  for (var iframeDocumentConfig of iframeDocumentConfigs) {
    let iframeDocument = iframeDocumentConfig.document;
    if (iframeDocument) {
      if (!isDocumentAnnotationInitialized(iframeDocument)) {
        //console.log('start iframe preprocess document');
        preprocessDocument(iframeDocument, true, iframeDocumentConfig);
      }
    }
  }


  //send message to background
  //console.log(`send INIT_PAGE_ANNOTATIONS_FINISHED: ${document.title}`);
  sendMessageToBackground(siteConfig, 'INIT_PAGE_ANNOTATIONS_FINISHED');


  resolve();
}

async function sendMessageToBackground(siteConfig, type) {
  //console.log('send message to background, type:' + type);

  let pageInfo = await getPageInfo();
  let site = document.location.hostname;
  if (!site) {
    site = 'NULL';
  }
  let url = siteConfig.getUrl(document);
  chrome.runtime.sendMessage(
    {
      type: type,
      payload: {
        title: document.title,
        url: url,
        site: site,
        totalWordCount: pageInfo.totalWordCount,
      },
    },
    (response) => {
      //console.log(response.message);
    }
  );
}

async function preprocessDocument(document, isIframe, documentConfig) {

  


  document.body.setAttribute('mea-preprocessed', true);

  if (!findStyleSheet(document)) {
    addStyle(document);
  }

  if(!isIframe){
    addVueApp();
    addVueAppEventListener();
  }

  if (documentConfig.canProcess) {

    
    //console.log('preprocess document');

    var x = 0;
    var intervalID = setInterval(async function () {

      if (containsMeaStyle(document)) {
        changeStyle(document, await getAnnotationOptions());
        window.clearInterval(intervalID);
      };

      if (++x === 30) {
        window.clearInterval(intervalID);
      }
    }, 1000);

    cleanElements(document);

    /*
    visitElement(document.body, (element) => {
      //console.log(element.nodeName + element.nodeType);
      annotateChildTextContents(element, isIframe);
    });
    */
    tokenizeTextNode(document);

    addToolbar(document);
    addEventListener(document);

    gArticle = parseDocument(document);
    
    //console.log(JSON.stringify(gArticle));

  }

}

async function addEventListener(document) {
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

    let textNodeInfo = gArticle.textNodeMap.get(textNode);
    if(textNodeInfo){
      console.log('text node info:'+ JSON.stringify(textNodeInfo));

      //console.log('caret:'+gArticle.content.substring(caretIndex, caretIndex+10));
      
      let token = findTokenInArticle(gArticle, textNodeInfo.offset);
  
      if(token){
        console.log('mouse over token:'+token.content);
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

    let sentenceInstanceSelection = getSentenceInstanceSelectionFromNodeSelection(gArticle, nodeSelection);
    console.log('mouse up, sentence instance selection:'+JSON.stringify(sentenceInstanceSelection));
    
    let sentenceHashSelection = getSentenceHashSelectionFromInstanceSelection(sentenceInstanceSelection, (sentenceNumber) => gArticle.sentences[sentenceNumber].sentenceId);
    console.log('mouse up, sentence hash selection:'+JSON.stringify(sentenceHashSelection));
    
    let isSelectionCollapsed = nodeSelection.isCollapsed;
    
    let type = 'select-text';
    
    let filteredNotes = [];
    if (isSelectionCollapsed) {
      type = 'search-note';
      let noteArray = await searchNote(sentenceHashSelection.start);

      for (let note of noteArray) {
        let sentenceInstanceSelections = getSentenceInstanceSelectionsFromSentenceHashSelection(gArticle, note.selection);
        let isContainsPosition = sentenceInstanceSelections.some((s) => containsSentenceInstancePosition(s, sentenceInstanceSelection.start));
        
        if(!isContainsPosition){
          continue;
        }

        let selectedText = getSelectedTextOfNote(gArticle, note);
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

  });

  document.addEventListener("click", async (event) => {
    console.log('click on document');
    let targetElement = event.target;
    let highlightElement = targetElement.closest('.mea-word');
    if(highlightElement){
      handleClickWord(highlightElement);
    }else{
      hideToolbar(document);
    }

  });

  function handleClickWord(highlightElement){
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
  
  document.querySelectorAll('.mea-mark-unknown').forEach((element) => {
    element.addEventListener('click', async (e) => {

      let targetWord = e.target.closest('.mea-toolbar').getAttribute('data-target-word');

      if (targetWord) {


        let wordChanges = await markWordAsUnknown(targetWord);
        sendMessageMarkWord(wordChanges);

        let visible = isPageAnnotationVisible();
        resetPageAnnotationVisibility(visible);
        hideToolbar(document);

      }
    });
  });

  document.querySelectorAll('.mea-mark-known').forEach((element) => {
    element.addEventListener('click', async (e) => {

      let targetWord = e.target.closest('.mea-toolbar').getAttribute('data-target-word');

      if (targetWord) {


        let wordChanges = await markWordAsKnown(targetWord);
        sendMessageMarkWord(wordChanges);

        let visible = isPageAnnotationVisible();
        resetPageAnnotationVisibility(visible);
        hideToolbar(document);
      }
    });
  });
  document.querySelectorAll('.mea-mark-clear').forEach((element) => {
    element.addEventListener('click', async (e) => {

      let targetWord = e.target.closest('.mea-toolbar').getAttribute('data-target-word');

      if (targetWord) {


        let wordChanges = await removeWordMark(targetWord);
        sendMessageMarkWord(wordChanges);

        let visible = isPageAnnotationVisible();
        resetPageAnnotationVisibility(visible);
        hideToolbar(document);
      }
    });
  });

  document.querySelectorAll('.mea-notes').forEach((element) => {
    element.addEventListener('click', async (e) => {
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
      
    });
  });
}


function getAllWindows() {
  let siteConfig = findSiteConfig(document);

  let windows = [window];

  for (const config of siteConfig.getIframeDocumentConfigs(document)) {
    windows.push(config.window);
  }

  return windows;
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

function isPageAnnotationInitialized() {
  return isDocumentAnnotationInitialized(document)
}



function clearAllDocumentsPreprocessMark() {
  let documents = getAllDocuments();

  return documents.every((document) => {
    document.body.removeAttribute('mea-preprocessed');
  });
}


async function resetPageAnnotationVisibility(enabled, source, types) {
  //let unknownWordSet = new Set();
  if (!types) {
    types = ['word-definition', 'note'];
  }

  for (const window of getAllWindows()) {
    await resetDocumentAnnotationVisibility(window, enabled, types);
  }

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

function sendMessageToApp(request, sender, sendResponse){
  //send message to standalone
  chrome.runtime.sendMessage(
    request,
    sendResponse,
  );

  sendMessageToEmbeddedApp(request, sender, sendResponse);
}
/**
 * 
 * reset all word's display attribute according to vocabulary
 */
async function resetDocumentAnnotationVisibility(window, enabled, types) {
  let document = window.document;
  //set flag
  document.body.setAttribute('mea-visible', enabled);

  if (types.includes('word-definition')) {
    knownWords = await loadKnownWords();

    //show hide unknown word annotation
    document.querySelectorAll('.mea-word').forEach((element) => {

      let targetWord = getBaseWordFromElement(element);

      if (enabled) {

        if (isKnown(targetWord, knownWords)) {
          element.classList.add("mea-hide");
        } else {
          element.classList.remove("mea-hide");
        }
      } else {
        element.classList.add("mea-hide");
      }
    });
  }


  if (types.includes('note')) {
    let notes = await getNotes();

    //console.log('notes:'+JSON.stringify(notes));

    //console.log('show notes');
    window.CSS.highlights.clear();
    const highlight = new Highlight();
    
    for (let note of notes) {
      //one sentence selection could map to multiple node selections
      //let nodeSelections = getNodeSelectionsFromSentenceHashSelection(document, note.selection);
      let nodeSelections = getNodeSelectionsFromSentenceHashSelection(gArticle, note.selection);
      for (let nodeSelection of nodeSelections) {
        //console.log('find node selection:' + JSON.stringify(nodeSelection));
        if (nodeSelection) {
          const range = new Range();
          range.setStart(nodeSelection.anchorNode, nodeSelection.anchorOffset);
          range.setEnd(nodeSelection.focusNode, nodeSelection.focusOffset);

          highlight.add(range);
        }
      }
    }
    if (highlight.size > 0) {
      window.CSS.highlights.set("user-1-highlight", highlight);
    }
  }

}




