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
    let enabled = isPageAnnotationEnabled()
    console.log(`Current page annotation is enabled: ${enabled}`);
    response = {enabled:enabled};
  }

  if (request.type === 'ENABLED') {
    console.log(`Current enabled is ${request.payload.enabled}`);
    if(request.payload.enabled){
      if(!isPageAnnotationInitialized()){
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

  
  //iterate all elements
  visitElement(document.body,(element)=>{
    //console.log(element.nodeName + element.nodeType);
    if(element.children.length == 0){
      annotateLeafElement(element);
    }
  });
/*
  document.querySelectorAll('p').forEach((element) => { 
      let html = element.innerHTML; 

      let result = html.replaceAll(/\w+/g, function (x) {
        let baseFormWord = searchWordBaseForm(x);
        
        //finally,
        if(baseFormWord){// find the correct form which has definition in dictionary
          
            let definition = lookupShort(baseFormWord);                       
            return format(x, definition, baseFormWord);
          
        }else {         
          return x;
        }
      });

      element.innerHTML = result;
  });
  */
  resolve();
}


function visitElement(element, visitor) {
  visitor(element);

  let children = element.children;
  for(var i = 0; i < children.length; i++) {      
    visitElement(children[i], visitor);      
  }
}

function visit(node, visitor) {
  visitor(node);

  let children = node.childNodes;
  for(var i = 0; i < children.length; i++) {      
    visit(children[i], visitor);      
  }
}

function annotateLeafElement(element){
  let html = element.innerHTML; 

  let result = html.replaceAll(/\w+/g, function (x) {
    let baseFormWord = searchWordBaseForm(x);
    
    //finally,
    if(baseFormWord){// find the correct form which has definition in dictionary
      
        let definition = lookupShort(baseFormWord);                       
        return format(x, definition, baseFormWord);
      
    }else {         
      return x;
    }
  });

  element.innerHTML = result;
}

function isPageAnnotationInitialized(){
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

/**
 * 
 * refresh all word's display
 */
async function refreshAnnotations(enabled){
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
  return knownWords.indexOf(word) >= 0;
}

