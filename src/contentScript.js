'use strict';

import './content.css';
import { lookupShort } from './dictionary.js';
import {loadKnownWords, loadUnknownWords} from './vocabularyStore.js';
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
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

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
  let response = {};
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  if (request.type === 'IS_PAGE_ANNOTATION_INITIALIZED') {
    let initialized = isPageAnnotationInitialized()
    console.log(`Current page annotation is initialized: ${initialized}`);
    response = {initialized:initialized};
  }

  if (request.type === 'ENABLED') {
    console.log(`Current enabled is ${request.payload.enabled}`);
    if(request.payload.enabled){
      setupAnnotations(request.payload.enabled);
    }else {
      refreshAnnotations();
    }

  }
  if (request.type === 'ADD_KNOWN_WORD' || request.type === 'REMOVE_KNOWN_WORD') {
    console.log(`add known word: ${request.payload.word}`);
    if(request.payload.word){
      //hideAnnotation(request.payload.word);
      refreshAnnotations();
    }

  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse(response);
  return true;
});

var knownWords, unknownWords;
async function setupAnnotations(enabled) {

  knownWords = await loadKnownWords();
  if(!knownWords){
    knownWords= [];
  }

  unknownWords = await loadUnknownWords();
  if(!unknownWords){
    unknownWords= [];
  }               

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

  
  refreshAnnotations();


}

function isPageAnnotationInitialized(){
  return document.querySelectorAll('.mea-highlight').length >0;
}

/**
 * 
 * refresh all word's display
 */
async function refreshAnnotations(){
  let enabled = await chrome.storage.sync.get(['enabled']);
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


const pattern = '<span class="mea-highlight hide" base-form-word="#base-form-word#">#word#<span class="mea-annotation">#annotation#</span></span>';
function format(word, annotation, baseFormWord) {
  return pattern.replaceAll('#word#', word).replaceAll('#annotation#', annotation)
    .replaceAll('#base-form-word#', baseFormWord);
}

//const knownWords = ['I', 'am'];
//const unknownWords = ['outskirt', 'fuzzy', 'month'];

function isKnown(word) {
  return knownWords.indexOf(word) >= 0;
}

function isUnknown(word) {
  return unknownWords.indexOf(word) >= 0;
}

