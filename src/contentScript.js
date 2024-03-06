'use strict';

import './content.css';
import { lookupShort } from './dictionary.js';
import {loadKnownWords} from './vocabularyStore.js';
import {searchWord} from './language.js';
import {findSiteConfig} from './site-match.js';
// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page


// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  (response) => {
    console.log(response.message);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`Current request type is ${request.type}`);
  let response = {};
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  if (request.type === 'IS_PAGE_ANNOTATION_INITIALIZED') {
    let initialized = isPageAnnotationInitialized()
    console.log(`Current page annotation is initialized: ${initialized}`);
    response = {initialized:initialized};
  }

  if (request.type === 'IS_PAGE_ANNOTATION_VISIBLE') {
    let visible = isPageAnnotationVisible();
    console.log(`Current page annotation is visible: ${visible}`);
    response = {visible:visible};
  }

  if (request.type === 'ENABLED') {
    console.log(`Current enabled is ${request.payload.enabled}`);
    if(request.payload.enabled){
      if(!isAllDocumentsAnnotationInitialized()){
        initPageAnnotations(()=>{
          resetPageAnnotationVisibility(request.payload.enabled);
        });
      }else{
        resetPageAnnotationVisibility(request.payload.enabled);
      }
      
    }else {
      resetPageAnnotationVisibility(false);
    }

  }

  if (request.type === 'REFRESH_PAGE') {
    console.log(`refresh page`);
    let visible = isPageAnnotationVisible();
    
    if(visible){//master document
      //init all documents
      initPageAnnotations(()=>{
        resetPageAnnotationVisibility(visible);
      });
    }
  
  }

  if (request.type === 'ADD_KNOWN_WORD' || request.type === 'REMOVE_KNOWN_WORD') {
    console.log(`${request.type} known word: ${request.payload.word}`);
    if(request.payload.word){
      //hideAnnotation(request.payload.word);
      let visible = isPageAnnotationVisible();
      resetPageAnnotationVisibility(visible);
    }

  }

  if (request.type === 'KNOWN_WORDS_UPDATED') {
    console.log(`${request.type}`);
    
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibility(visible);
  }

  if (request.type === 'GET_VOCABULARY_INFO_OF_PAGE' ) {
    console.log(`${request.type}`);
    
    let pageInfo = getVocabularyInfoOfPage();
    response.pageInfo = pageInfo;
    //console.log('unknownWordsOnPage:'+ JSON.stringify(response.words));
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse(response);
  return true;
});

setInterval(refreshTimer, 500);

function refreshTimer() {
  let siteConfig = findSiteConfig(document);

  if(siteConfig.needRefreshPageAnnotation(document)){
    //console.log('needRefreshPageAnnotation');
    initPageAnnotations(()=>{
      resetPageAnnotationVisibility(true);
    });
  }

  
}

var knownWords;


/**
 * 
 * @returns unknownWords, unknownWordsRatio
 */
function getVocabularyInfoOfPage() {
  
  let documents = getAllDocuments();
  let unknownWordSet = new Set();
  
  let unknownWordsCount=0;
  let knownWordsCount=0;
  for(let document of documents) {
    let elements = document.querySelectorAll('.mea-highlight:not(.hide)');
    
    for(var e of elements) {
      unknownWordSet.add(e.getAttribute('base-form-word'));
      unknownWordsCount++;
    }

    elements = document.querySelectorAll('.mea-highlight.hide');
    for(var e of elements) {
      knownWordsCount++;
    }
  }
  let unknownWords = Array.from(unknownWordSet);
  let unknownWordsRatio = unknownWordsCount / (unknownWordsCount + knownWordsCount);
  let visible = isPageAnnotationVisible();
  return {
    enabled: visible,
    unknownWords: unknownWords,
    unknownWordsRatio: unknownWordsRatio,
  };
}

async function initPageAnnotations(resolve) {

  knownWords = await loadKnownWords();
  if(!knownWords){
    knownWords= [];
  }

  let siteConfig = findSiteConfig(document);
  
  if(!isDocumentAnnotationInitialized(document)){
    let documentConfig = siteConfig.getDocumentConfig(document);
  
    initDocumentAnnotations(document, false, documentConfig);
  }

  //let iframeDocuments = getAllIframeDocuments();
  let iframeDocumentConfigs = siteConfig.getIframeDocumentConfigs(document);
  //console.log('start iframe annotattion');
  for(var iframeDocumentConfig of iframeDocumentConfigs) {
    let iframeDocument = iframeDocumentConfig.document;
    if(iframeDocument){
      if(!isDocumentAnnotationInitialized(iframeDocument)){
        console.log('start iframe initDocumentAnnotations');
        initDocumentAnnotations(iframeDocument, true, iframeDocumentConfig);
      }
    }
  }
  
  
  resolve();
}

function initDocumentAnnotations(document, isIframe, documentConfig) {
  
  if(documentConfig.canProcess){
    if(isIframe){
      addStyle(document);    
    }

    visitElement(document.body,(element)=>{
      //console.log(element.nodeName + element.nodeType);
      annotateChildTextContents(element, isIframe);
    });  
  }

}

function addStyle(document){
  var link = document.createElement("link");
  link.href = chrome.runtime.getURL("contentScript.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName("head")[0].appendChild(link);
  
}

function getAllDocuments(){
  let documents = [document];
  
  for(const doc of getAllIframeDocuments()) {
    documents.push(doc);    
  }

  return documents;
}

function getAllIframeDocuments(){
  let documents = [];
  let iframes = document.querySelectorAll('iframe');
  console.log('iframes length:'+iframes.length);
  for(const iframe of iframes) {
    try {
      let document = iframe.contentDocument;
      if(document){
        documents.push(iframe.contentDocument);
      }
    }catch(e){
      console.log('access iframe error:'+e);
    }
  }

  return documents;
}

function canAnnotate(element){
  const textTags = [
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'P',
    'UL','OL','LI',
    'BLOCKQUOTE',
    'EM',
    'STRONG',
    'I',
    'CODE',
    'PRE',
    'S',
    'SPAN',
    'DIV'
  ];
  
  if(!textTags.includes(element.nodeName)){
    return false;
  }

  
  return true;  
}

function visitElement(element, visitor) {
  visitor(element);

  let children = element.children;
  /*
  if(element.nodeName=='IFRAME'){
    children = element.contentWindow.document.body.children;
  }
*/
  
  for(const child of children) {      
    visitElement(child, visitor);      
  }
}

function visit(node, visitor) {
  visitor(node);

  let children = node.childNodes;
  for(var i = 0; i < children.length; i++) {      
    visit(children[i], visitor);      
  }
}

function annotateChildTextContents(element, isIframe){
  //console.log('element.nodeName:'+element.nodeName);
  //console.log('element Id:'+element.getAttribute('id'));
  
  if(!canAnnotate(element)){
    //console.log('containsIframeThatNeedBeProtected');
    return;
  }

  if(
    element.classList.contains('mea-highlight') ||
    element.classList.contains('mea-annotation')){
      return;
  }

  let html = element.innerHTML;
  for(var i=0; i< element.childNodes.length;i++){
    let childNode = element.childNodes[i];
    if(childNode.nodeName==='#text'){
      let textContent = childNode.textContent;
      let annotatedTextContent = annotateTextContent(textContent);
      let unescapedTextContent = textContent.replace(/\u00a0/g, "&nbsp;");

      //console.log('innerHTML:'+html);
      //console.log('nodeName:'+childNode.nodeName);
      //console.log('textContent:'+textContent);
      //console.log('unescapedTextContent:'+unescapedTextContent);
      //console.log('annotatedTextContent:'+annotatedTextContent);
      
      html = html.replaceAll(unescapedTextContent, annotatedTextContent);
      //console.log('annotated innerHTML:'+html);
    }
  }

  element.innerHTML = html;
}

function containsIframeChild(element){
  for(const childNode of element.childNodes){
    if(childNode.nodeName==='IFRAME'){
      return true;
    }
  }
  return false;
}
function annotateTextContent(textContent){
  let html = textContent; 

  let result = html.replaceAll(/([a-zA-Z][a-zA-Z']+)/g, function (x) {
    let searchResult = searchWord({
      query: x,
      allowLemma: true,
      allowStem: true,
      allowRemoveSuffix: true,
    });
    
    //finally,
    if(searchResult){// find the correct form which has definition in dictionary
      let baseFormWord = searchResult.word;
      let definition = lookupShort(baseFormWord);
      
      if(searchResult.searchType ==='stem'){
        definition = '根'+searchResult.word+':'+definition;
      }
      if(searchResult.searchType ==='removeSuffix'){
        definition = '源'+searchResult.word+':'+definition;
      }

      //fix right click selection issue
      if(isStartWithAlphabet(definition)){
        definition = ':'+definition;
      }                       
      return format(x, definition, baseFormWord);
      
    }else {         
      return x;
    }
  });

  return result;
}

function annotateLeafElement(element){
  if(element.classList.contains('mea-highlight') ||
    element.classList.contains('mea-annotation')){
      return;
  }

  let html = element.innerHTML; 

  let result = html.replaceAll(/([^<>]\w+[^<>])/g, function (x) {
    let baseFormWord = searchWordBaseForm(x);
    
    //finally,
    if(baseFormWord){// find the correct form which has definition in dictionary
      
        let definition = lookupShort(baseFormWord);
        
        //fix right click selection issue
        if(isStartWithAlphabet(definition)){
          definition = ':'+definition;
        }                       
        return format(x, definition, baseFormWord);
      
    }else {         
      return x;
    }
  });

  element.innerHTML = result;
}

function isStartWithAlphabet(definition){
  var english = /^[A-Za-z].*$/;
  return english.test(definition);
}

function isPageAnnotationInitialized(){
  return document.querySelectorAll('.mea-highlight').length >0;
}

function isAllDocumentsAnnotationInitialized(){
  let documents = getAllDocuments();
  
  return documents.every((document)=>{
    document.querySelectorAll('.mea-highlight').length >0
  });
}

function isDocumentAnnotationInitialized(document){
  return document.querySelectorAll('.mea-highlight').length >0;
}

function isPageAnnotationVisible(){
  let result = document.body.getAttribute('mea-visible');
  if(result === 'true') {
    return true;
  } else {
    return false;
  }
}

async function resetPageAnnotationVisibility(enabled) {
  //let unknownWordSet = new Set();

  for(const doc of getAllDocuments()){
    await resetDocumentAnnotationVisibility(doc, enabled, (word) => {
      //unknownWordSet.add(word);
    });
  }

  let pageInfo = getVocabularyInfoOfPage();
  //send message to side panel
  chrome.runtime.sendMessage(
    {
      type: 'RESET_PAGE_ANNOTATION_VISIBILITY_FINISHED',
      payload: {
        pageInfo: pageInfo
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
async function resetDocumentAnnotationVisibility(document, enabled, onUnknownWord){
  //set flag
  document.body.setAttribute('mea-visible', enabled);

  knownWords = await loadKnownWords();

  document.querySelectorAll('.mea-highlight').forEach((element) => { 
    let baseFormWord = element.getAttribute('base-form-word'); 

    if(enabled){

      if(isKnown(baseFormWord)){
        element.classList.add("hide");
      } else {
        element.classList.remove("hide");

        if(onUnknownWord){
          onUnknownWord(baseFormWord);
        }
      }
    } else {
      element.classList.add("hide");
    }
  });			
}


const pattern = '<div class="mea-highlight hide" base-form-word="#base-form-word#">#word#<div class="mea-annotation">#annotation#</div></div>';
function format(word, annotation, baseFormWord) {
  return pattern.replaceAll('#word#', word).replaceAll('#annotation#', annotation)
    .replaceAll('#base-form-word#', baseFormWord);
}


function isKnown(word) {
  let baseForm = word;
  let found = knownWords.indexOf(baseForm) >= 0;
  if(!found){
    let lowercaseWord = word.toLowerCase();
    found = knownWords.indexOf(lowercaseWord) >= 0;
  }

  return found;
}

