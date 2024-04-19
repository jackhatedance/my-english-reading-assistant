'use strict';

import './content.css';
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from './vocabularyStore.js';
import { searchWord, isKnown, getWordParts } from './language.js';
import { findSiteConfig } from './site-match.js';
import { initializeOptionService, refreshOptionsCache, getSiteOptions, getDefaultSiteOptions } from './optionService.js';
import { split } from "sentence-splitter";
import { getNotes, searchNote } from './noteService.js';
import { generateMiddleSetenceNumbers, containsSentenceInstancePosition, getSentenceContentHash, getSentenceOffset, getSentenceIds, hashPositionToInstancePosition, getSentenceHashSelectionFromInstanceSelection } from './sentence.js';
import { tranverseElement, tranverseNode } from './dom.js';
import { tokenizeTextNode, parseDocument, findTokenInArticle, getNodeSelectionsFromSentenceHashSelection, getSentenceInstanceSelectionFromNodeSelection, getSentenceInstanceSelectionsFromSentenceHashSelection, getSelectedTextOfNote } from './article.js';
import { annotateWord, annotateNonword } from './word.js';

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

async function getCurrentSiteOptions() {
  let siteDomain = document.location.hostname;
  let options = await getSiteOptions(siteDomain);

  return options;
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

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  (response) => {
    //console.log(response.message);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
    //console.log(`${request.type}`);

    //let pageInfo = await getPageInfo();
    getPageInfo().then((pageInfo) => {
      response.pageInfo = pageInfo;

      //console.log('pageInfo response:' + JSON.stringify(response));

      sendResponse(response);
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
});


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

function findStyleSheet(document) {
  for (let sheet of document.styleSheets) {
    if (sheet.title === 'mea-style') {
      return sheet;
    }
  }
  return null;
}
function indexOfMeaAnnotation(styleSheet) {
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    let rule = styleSheet.cssRules[i];
    if (rule.selectorText === '.mea-highlight::after') {
      return i;
    }
  }
  return -1;
}
function indexOfMeaHighlight(styleSheet) {
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    let rule = styleSheet.cssRules[i];
    if (rule.selectorText === '.mea-highlight') {
      return i;
    }
  }
  return -1;
}

function generateCssRuleOfAnnotation(options) {

  let top = `${options.position * -1}em`;
  let fontSize = `${options.fontSize}em`;
  let opacity = `${options.opacity}`;
  let color = `${options.color}`;

  let rule = `.mea-highlight::after {
    content: attr(data-footnote);
    position: absolute;
    width:max-content;
    line-height: normal;
    text-indent: 0px;
    white-space: nowrap;
    left: 0;
    top: ${top};
    font-size: ${fontSize} !important;
    color: ${color};
    opacity: ${opacity};
  }`;
  return rule;
}

function generateCssRuleOfHighlight(options) {

  let lineHeight = `${options.lineHeight}em`;

  let rule = `.mea-highlight {  
    position: relative;
    margin-top: 0px;
    text-indent: 0px;
    display: inline-block;
    line-height: ${lineHeight} !important;
  }`;
  return rule;
}

function containsMeaStyle(document) {
  let styleSheet = findStyleSheet(document);
  if (styleSheet) {
    let index = indexOfMeaAnnotation(styleSheet);
    if (index >= 0) {
      return true;
    }
  }
  return false;
}

function changeStyle(document, options) {

  let styleSheet = findStyleSheet(document);
  if (styleSheet) {
    //annotation
    let index = indexOfMeaAnnotation(styleSheet);
    if (index >= 0) {
      styleSheet.deleteRule(index);
    }
    let rule = generateCssRuleOfAnnotation(options);
    styleSheet.insertRule(rule, 0);
    //console.log('changed style of a document');

    //highlight, aka. text
    index = indexOfMeaHighlight(styleSheet);
    if (index >= 0) {
      styleSheet.deleteRule(index);
    }
    rule = generateCssRuleOfHighlight(options);
    styleSheet.insertRule(rule, 0);
  }
}

function changeStyleForAllDocuments(options) {
  let documents = getAllDocuments();
  for (let document of documents) {
    changeStyle(document, options);
  }
}

/**
 * 
 * @returns unknownWords, unknownWordsRatio, annotationOptions
 */
async function getPageInfo() {


  let documents = getAllDocuments();
  let unknownWordMap = new Map();

  let unknownWordsCount = 0;
  let knownWordsCount = 0;
  for (let document of documents) {
    let elements = document.querySelectorAll('.mea-word:not(.hide)');

    for (var e of elements) {
      //let targetWord = getTargetWordFromElement(e);
      let base = e.getAttribute('data-base-word');

      unknownWordMap.set(base, { base, });
      unknownWordsCount++;
    }

    elements = document.querySelectorAll('.mea-word.hide');
    for (var e of elements) {
      knownWordsCount++;
    }
  }

  let unknownWords = Array.from(unknownWordMap, ([name, value]) => ({ base: name, root: value.root }));

  let totalWordCount = unknownWordsCount + knownWordsCount;
  let unknownWordsRatio = unknownWordsCount / totalWordCount;
  let visible = isPageAnnotationVisible();
  let siteOptions = await getCurrentSiteOptions();
  let domain = document.location.hostname;
  if (!domain) {
    domain = 'NULL';
  }
  let pageInfo = {
    domain: domain,
    visible: visible,
    totalWordCount: totalWordCount,
    unknownWordsCount: unknownWordsCount,
    unknownWords: unknownWords,
    unknownWordsRatio: unknownWordsRatio,
    siteOptions: siteOptions,
  };
  //console.log('page info:'+JSON.stringify(pageInfo));
  return pageInfo;
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

  if (documentConfig.canProcess) {


    document.body.setAttribute('mea-preprocessed', true);

    if (!findStyleSheet(document)) {
      addStyle(document);
    }
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

function cleanElements(document) {

  //replace punctuations
  tranverseNode(document.body, (node) => {
    if (node.nodeName === '#text') {
      node.textContent = node.textContent.replaceAll(/[`\u2018\u2019]/g, "'");
    }
  });

  //remove text content of some tags
  tranverseElement(document.body, (element) => {
    const TAGS_CLEAR_CONTENT = ['SUP', 'S'];
    const TAGS_KEEP_CONTENT = ['EM', 'I', 'B', 'A'];
    if (TAGS_CLEAR_CONTENT.includes(element.nodeName)) {
      element.setAttribute('mea-remove-tag', 'true');
      element.innerHTML = '';
      //element.outerHTML = '';
    } else if (TAGS_KEEP_CONTENT.includes(element.nodeName)) {
      if (isElementLeaf(element)) {
        element.setAttribute('mea-remove-tag', 'true');

      }
    }

    if (allChildrenElementNeedRemoveTag(element)) {
      element.innerHTML = element.textContent;
    }
  }, false);

  // merge TEXT NODEs
  tranverseElement(document.body, (element) => {
    if (allChildrenElementNeedRemoveTag(element)) {
      element.innerHTML = element.textContent;
    }
  });

}

function isElementLeaf(element) {

  let childCount = element.childElementCount;
  let text = element.textContent;
  if (!text) {
    text = '';
  }


  return (childCount == 0);
}

function allChildrenElementNeedRemoveTag(element) {
  if (element.childElementCount === 0) {
    return false;
  }

  for (let childElement of element.children) {
    if (!needRemoveTag(childElement)) {
      return false;
    }
  }
  return true;
}

function needRemoveTag(element) {
  return (element.getAttribute('mea-remove-tag') === 'true');
}

function addStyle(document) {
  var link = document.createElement("link");
  link.href = chrome.runtime.getURL("contentScript.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.title = "mea-style";
  document.getElementsByTagName("head")[0].appendChild(link);
  //console.log('add style');
}

function addToolbar(document) {
  //check if existed
  if (document.querySelector('.mea-toolbar')) {
    return;
  }

  let questionMarkImgUrl = chrome.runtime.getURL("icons/question-mark.png");
  let tickImgUrl = chrome.runtime.getURL("icons/tick.png");
  let clearImgUrl = chrome.runtime.getURL("icons/clear.png");

  var elemDiv = document.createElement('div');
  elemDiv.innerHTML = `
    <button class='mea-mark-unknown mea-toolbar-button'>
      <img class='mea-icon' src='${questionMarkImgUrl}'></img>
    </button>
    <button class='mea-mark-known mea-toolbar-button'>
      <img class='mea-icon' src='${tickImgUrl}'></img>
    </button>  
    <button class='mea-mark-clear mea-toolbar-button'>
      <img class='mea-icon' src='${clearImgUrl}'></img>
    </button>  
    `;

  elemDiv.classList.add('mea-container');
  elemDiv.classList.add('mea-toolbar');
  elemDiv.style.visibility = 'hidden';
  document.body.appendChild(elemDiv);

}

function hideToolbar(document) {
  document.querySelector('.mea-toolbar').style.visibility = 'hidden';
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

  document.addEventListener("mouseup", async () => {

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
      chrome.runtime.sendMessage(
        {
          type: 'SELECTION_CHANGE',
          payload: {
            type: type,
            selectedText: selectedText,
            sentenceSelection: sentenceHashSelection,
            notes: filteredNotes,
          },
        },
        (response) => {
          //console.log(response.message);
        }
      );
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
}

function sendMessageMarkWord(wordChanges) {
  //send to background
  chrome.runtime.sendMessage(
    {
      type: 'MARK_WORD',
      payload: {
        wordChanges: wordChanges,
      },
    },
    (response) => {
      //console.log(response.message);
    }
  );
}

function getAllDocuments() {
  let siteConfig = findSiteConfig(document);

  let documents = [document];

  for (const config of siteConfig.getIframeDocumentConfigs(document)) {
    if(config.document){
      documents.push(config.document);
    }    
  }
  //console.log('get all documents.');

  return documents;
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
  let meaContainer = element.closest('.mea-container');
  if (meaContainer) {
    return true;
  } else {
    return false;
  }
}

function isPageAnnotationInitialized() {
  return isDocumentAnnotationInitialized(document)
}

function isAllDocumentsAnnotationInitialized() {
  let documents = getAllDocuments();

  return documents.every((document) => {
    return isDocumentAnnotationInitialized(document);
  });
}

function isDocumentAnnotationInitialized(document) {
  if (!document.body) {
    console.log('body is null');
  }

  let meaInitialized = document.body.getAttribute('mea-preprocessed');
  if (meaInitialized) {
    return true;
  }
  else {
    return false;
  }
}

function clearAllDocumentsPreprocessMark() {
  let documents = getAllDocuments();

  return documents.every((document) => {
    document.body.removeAttribute('mea-preprocessed');
  });
}

function isPageAnnotationVisible() {
  let result = document.body.getAttribute('mea-visible');
  if (result === 'true') {
    return true;
  } else {
    return false;
  }
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
  chrome.runtime.sendMessage(
    {
      type: 'RESET_PAGE_ANNOTATION_VISIBILITY_FINISHED',
      payload: {
        pageInfo: pageInfo,
        source: source,
      },
    },
    (response) => {
      //console.log(response.message);
    }
  );
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
          element.classList.add("hide");
        } else {
          element.classList.remove("hide");
        }
      } else {
        element.classList.add("hide");
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




