'use strict';

import './content.css';
import { lookupShort } from './dictionary.js';
import {loadKnownWords} from './vocabularyStore.js';
import {searchWordBaseForm} from './language.js';
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

  if (request.type === 'IS_PAGE_ANNOTATION_ENABLED') {
    let enabled = isPageAnnotationEnabled();
    console.log(`Current page annotation is enabled: ${enabled}`);
    response = {enabled:enabled};
  }

  if (request.type === 'ENABLED') {
    console.log(`Current enabled is ${request.payload.enabled}`);
    if(request.payload.enabled){
      if(!isAllDocumentsAnnotationInitialized()){
        initPageAnnotations(()=>{
          refreshAnnotations(request.payload.enabled);
        });
      }else{
        refreshAnnotations(request.payload.enabled);
      }
      
    }else {
      refreshAnnotations(false);
    }

  }

  if (request.type === 'REFRESH_PAGE') {
    console.log(`refresh page`);
    let enabled = isPageAnnotationEnabled();
    
    if(enabled){//master document
      //init all documents
      initPageAnnotations(()=>{
        refreshAnnotations(enabled);
      });
    }
  
  }

  if (request.type === 'ADD_KNOWN_WORD' || request.type === 'REMOVE_KNOWN_WORD') {
    console.log(`add known word: ${request.payload.word}`);
    if(request.payload.word){
      //hideAnnotation(request.payload.word);
      let enabled = isPageAnnotationEnabled();
      refreshAnnotations(enabled);
    }

  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse(response);
  return true;
});

var knownWords;

async function initPageAnnotations(resolve) {

  knownWords = await loadKnownWords();
  if(!knownWords){
    knownWords= [];
  }

  if(!isDocumentAnnotationInitialized(document)){
    initDocumentAnnotations(document, false);
  }

  let iframeDocuments = getAllIframeDocuments();
  //console.log('start iframe annotattion');
  for(var iframeDocument of iframeDocuments) {
    if(!isDocumentAnnotationInitialized(iframeDocument)){
      //console.log('start iframe initDocumentAnnotations');
      initDocumentAnnotations(iframeDocument, true);
    }
  }
  
  
  resolve();
}

function initDocumentAnnotations(document, isIframe){
  visitElement(document.body,(element)=>{
    //console.log(element.nodeName + element.nodeType);
    
    annotateChildTextContents(element);
  });
  if(isIframe){
    addStyle(document);    
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

function containsIframeThatNeedBeProtected(element){
  //case of epubjs
  let iframe = element.querySelector('iframe');
  if(iframe){
    let id = iframe.id;
    if(id){
      return id.startsWith('epubjs');
    }
  }
  return false;  
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

function annotateChildTextContents(element){
  //console.log('element.nodeName:'+element.nodeName);
  //console.log('element Id:'+element.getAttribute('id'));
  
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
    return;
  }

  if(element.nodeName==='DIV' && containsIframeThatNeedBeProtected(element)){
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
      let annotatedTextContent = annotateTextContent(childNode.textContent);
      //console.log('nodeName:'+childNode.nodeName);
      //console.log('textContent:'+textContent);
      //console.log('annotatedTextContent:'+annotatedTextContent);
      html = html.replaceAll(textContent, annotatedTextContent);
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

  let result = html.replaceAll(/(\w+)/g, function (x) {
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

function isPageAnnotationEnabled(){
  let result = document.body.getAttribute('mea-enabled');
  if(result === 'true') {
    return true;
  } else {
    return false;
  }
}

async function refreshAnnotations(enabled) {
  for(const doc of getAllDocuments()){
    await refreshAnnotationsForOne(doc, enabled);
  }
}
/**
 * 
 * refresh all word's display
 */
async function refreshAnnotationsForOne(document, enabled){
  //set flag
  document.body.setAttribute('mea-enabled', enabled);

  knownWords = await loadKnownWords();

  document.querySelectorAll('.mea-highlight').forEach((element) => { 
    let baseFormWord = element.getAttribute('base-form-word'); 

    if(enabled){

      if(isKnown(baseFormWord)){
        element.classList.add("hide");
      } else {
        element.classList.remove("hide");
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

