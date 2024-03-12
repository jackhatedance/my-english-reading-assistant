'use strict';

import './content.css';
import { lookupShort } from './dictionary.js';
import {loadKnownWords} from './vocabularyStore.js';
import {searchWord} from './language.js';
import {findSiteConfig} from './site-match.js';
import {getSiteOptions, getDefaultSiteOptions} from './optionService.js';
// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

// Log `title` of current active web page

async function getAnnotationOptions(){
  
  let options = await getCurrentSiteOptions();
  if(!options){
    options = await getDefaultSiteOptions();
  }
  return options.annotation;
}

async function getCurrentSiteOptions(){
  let siteDomain = document.location.hostname;
  let options = await getSiteOptions(siteDomain);
  
  return options;
}

window.addEventListener ("load", myMain, false);
function myMain(){

  var jsInitChecktimer = setTimeout (checkForJS_Finish, 100);

  function checkForJS_Finish () {
    
    getCurrentSiteOptions().then(siteOptions=>{
      if(siteOptions.enabled){
        initPageAnnotations(()=>{
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
  }

  if (request.type === 'IS_PAGE_ANNOTATION_INITIALIZED') {
    let initialized = isPageAnnotationInitialized()
    //console.log(`Current page annotation is initialized: ${initialized}`);
    response = {initialized:initialized};
  }

  if (request.type === 'IS_PAGE_ANNOTATION_VISIBLE') {
    let visible = isPageAnnotationVisible();
    //console.log(`Current page annotation is visible: ${visible}`);
    response = {visible:visible};
  }

  if (request.type === 'ENABLED') {
    //console.log(`Current enabled is ${request.payload.enabled}`);
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
    //console.log(`refresh page`);
    let visible = isPageAnnotationVisible();
    
    if(visible){//master document
      //init all documents
      initPageAnnotations(()=>{
        resetPageAnnotationVisibility(visible);
      });
    }
  
  }

  if (request.type === 'ADD_KNOWN_WORD' || request.type === 'REMOVE_KNOWN_WORD') {
    //console.log(`${request.type} known word: ${request.payload.word}`);
    if(request.payload.word){
      //hideAnnotation(request.payload.word);
      let visible = isPageAnnotationVisible();
      resetPageAnnotationVisibility(visible);
    }

  }

  if (request.type === 'KNOWN_WORDS_UPDATED') {
    //console.log(`${request.type}`);
    
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibility(visible);
  }

  if (request.type === 'GET_PAGE_INFO' ) {
    //console.log(`${request.type}`);
    
    //let pageInfo = await getPageInfo();
    getPageInfo().then((pageInfo) => {
      response.pageInfo = pageInfo;
      
      //console.log('pageInfo response:'+ JSON.stringify(response));

      sendResponse(response);
    });
    return true;
  }

  if (request.type === 'CHANGE_STYLE') {
    //console.log(`change style`);
    if(request.payload){
      //annotationOptions = request.payload;
      //changeStyle(await getAnnotationOptions());
      getAnnotationOptions().then(options =>{
        changeStyle(options);
      });
    }
  
  }


  sendResponse(response);
  return;
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

function findStyleSheet(document){
  for(let sheet of document.styleSheets){
    if(sheet.title==='mea-style'){
      return sheet;
    }
  }
  return null;
}
function indexOfMeaAnnotation(styleSheet){
  for(let i =0; i< styleSheet.cssRules.length;i++){
    let rule = styleSheet.cssRules[i];
    if(rule.selectorText === '.mea-annotation'){
      return i;
    }
  }
  return -1;
}
function generateCssRule(options){

  let top = `${options.position * -1}em`;
  let fontSize = `${options.fontSize}em`;
  let opacity = `${options.opacity}`;
  let color = `${options.color}`;

  let rule=`.mea-annotation {
    position: absolute;
    width:100%;
    top: ${top};
    font-size: ${fontSize} !important;
    text-align: center;
    white-space: nowrap;
    color: ${color};
    opacity: ${opacity};
  }`;
  return rule;
}
function changeStyle(options){
  let documents = getAllDocuments();
  for(let document of documents){
    let styleSheet = findStyleSheet(document);
    if(styleSheet){
      let index = indexOfMeaAnnotation(styleSheet);
      if(index >=0){
        styleSheet.deleteRule(index);
      }
      let rule = generateCssRule(options);
      styleSheet.insertRule(rule,0);
      //console.log('changed style of a document');
    }
  }
  //console.log('changeStyle');
}

/**
 * 
 * @returns unknownWords, unknownWordsRatio, annotationOptions
 */
async function getPageInfo() {
  
  
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
  let siteOptions = await getCurrentSiteOptions();
  let domain = document.location.hostname;
  return {
    domain:domain,
    visible: visible,
    unknownWords: unknownWords,
    unknownWordsRatio: unknownWordsRatio,
    siteOptions : siteOptions,
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

  let iframeDocumentConfigs = siteConfig.getIframeDocumentConfigs(document);
  //console.log('start iframe annotattion');
  for(var iframeDocumentConfig of iframeDocumentConfigs) {
    let iframeDocument = iframeDocumentConfig.document;
    if(iframeDocument){
      if(!isDocumentAnnotationInitialized(iframeDocument)){
        //console.log('start iframe initDocumentAnnotations');
        initDocumentAnnotations(iframeDocument, true, iframeDocumentConfig);
      }
    }
  }
  
  
  resolve();
}

async function initDocumentAnnotations(document, isIframe, documentConfig) {
  
  if(documentConfig.canProcess){
    
    addStyle(document);   
    
    let time = setTimeout(async function () {
      changeStyle(await getAnnotationOptions());
    }, 1000);
    

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
  link.title = "mea-style";
  document.getElementsByTagName("head")[0].appendChild(link);
  //console.log('addstyle');
}


function getAllDocuments(){
  let siteConfig = findSiteConfig(document);

  let documents = [document];
  
  for(const config of siteConfig.getIframeDocumentConfigs(document)) {
    documents.push(config.document);    
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

function annotateTextContent(textContent){
  let html = textContent; 

  let result = html.replaceAll(/([a-zA-Z][a-zA-Z']+)/g, function (x) {
    let searchResult = searchWord({
      query: x,
      allowLemma: true,
      allowStem: true,
      allowRemoveSuffixOrPrefix: true,
    });
    
    //finally,
    if(searchResult){// find the correct form which has definition in dictionary
      let baseFormWord = searchResult.word;
      let definition = lookupShort(baseFormWord);
      
      if(searchResult.searchType ==='stem'){
        definition = '根'+searchResult.word+':'+definition;
      }
      if(searchResult.searchType ==='removeSuffixOrPrefix'){
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

  let pageInfo = await getPageInfo();
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

