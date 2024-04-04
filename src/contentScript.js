'use strict';

import './content.css';
import {loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark} from './vocabularyStore.js';
import {searchWord, isKnown, getWordParts} from './language.js';
import {findSiteConfig} from './site-match.js';
import {initializeOptionService, refreshOptionsCache, getSiteOptions, getDefaultSiteOptions} from './optionService.js';
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
  //console.log('page on load');
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
  } else if (request.type === 'IS_PAGE_ANNOTATION_INITIALIZED') {
    let initialized = isPageAnnotationInitialized()
    //console.log(`Current page annotation is initialized: ${initialized}`);
    response = {initialized:initialized};
  } else if (request.type === 'IS_PAGE_ANNOTATION_VISIBLE') {
    let visible = isPageAnnotationVisible();
    //console.log(`Current page annotation is visible: ${visible}`);
    response = {visible:visible};
  } else if (request.type === 'ENABLED') {
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

  } else if (request.type === 'REFRESH_PAGE') {
    console.log(`refresh page`);
    let visible = isPageAnnotationVisible();
    
    if(visible){//master document
      if(request.payload.force){
        clearAllDocumentsAnnotationInitializationMark();
      }   
   
      //init all documents
      initPageAnnotations(()=>{
        resetPageAnnotationVisibility(visible);
      });
    }
  
  } else if (request.type === 'ADD_KNOWN_WORD' || request.type === 'REMOVE_KNOWN_WORD') {
    //console.log(`${request.type} known word: ${request.payload.word}`);
    if(request.payload.word){
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
  } else if (request.type === 'GET_PAGE_INFO' ) {
    //console.log(`${request.type}`);
    
    //let pageInfo = await getPageInfo();
    getPageInfo().then((pageInfo) => {
      response.pageInfo = pageInfo;
      
      //console.log('pageInfo response:'+ JSON.stringify(response));

      sendResponse(response);
    });
    return true;
  } else if(request.type === 'OPTIONS_CHANGED' ) {
    refreshOptionsCache();
  }

  if (request.type === 'CHANGE_STYLE') {
    //console.log(`change style`);
    if(request.payload){
      //annotationOptions = request.payload;
      getAnnotationOptions().then(options =>{
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

  if(siteConfig.needRefreshPageAnnotation(document)){
    //console.log('needRefreshPageAnnotation');
    initPageAnnotations(()=>{
      resetPageAnnotationVisibility(true);
    });
  }

  let url = siteConfig.getUrl(document);
  //console.log('gUrl:'+gUrl +',\nurl:'+url);
  if(gUrl && gUrl !== url){
    sendMessageToBackground(siteConfig, 'PAGE_URL_CHANGED');
  }
  
  //update gloabl variable
  gUrl = url;
    
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
    if(rule.selectorText === '.mea-highlight::after'){
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

  let rule=`.mea-highlight::after {
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

function containsMeaStyle(document){
  let styleSheet = findStyleSheet(document);
  if(styleSheet){
    let index = indexOfMeaAnnotation(styleSheet);
    if(index >=0){
      return true;
    }
  }
  return false;
}

function changeStyle(document, options){
  
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

function changeStyleForAllDocuments(options){
  let documents = getAllDocuments();
  for(let document of documents){
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
  
  let unknownWordsCount=0;
  let knownWordsCount=0;
  for(let document of documents) {
    let elements = document.querySelectorAll('.mea-highlight:not(.hide)');
    
    for(var e of elements) {
      //let targetWord = getTargetWordFromElement(e);
      let base = e.getAttribute('data-base-word');
      
      unknownWordMap.set(base, {base, });
      unknownWordsCount++;
    }

    elements = document.querySelectorAll('.mea-highlight.hide');
    for(var e of elements) {
      knownWordsCount++;
    }
  }

  let unknownWords = Array.from(unknownWordMap, ([name, value]) => ({ base: name, root: value.root }));

  let totalWordCount = unknownWordsCount + knownWordsCount;
  let unknownWordsRatio = unknownWordsCount / totalWordCount;
  let visible = isPageAnnotationVisible();
  let siteOptions = await getCurrentSiteOptions();
  let domain = document.location.hostname;
  if(!domain && document.location.protocol==='file:'){
    domain = '[local]';
  }
  let pageInfo = {
    domain:domain,
    visible: visible,
    totalWordCount: totalWordCount,
    unknownWordsCount: unknownWordsCount,
    unknownWords: unknownWords,
    unknownWordsRatio: unknownWordsRatio,
    siteOptions : siteOptions,
  };
  //console.log('page info:'+JSON.stringify(pageInfo));
  return pageInfo;
}

function getBaseWordFromElement(element){
  return element.getAttribute('data-base-word'); 
}

async function initPageAnnotations(resolve) {
  //console.log('initPageAnnotations');
  await initializeOptionService();

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
  

  //send message to background
  //console.log(`send INIT_PAGE_ANNOTATIONS_FINISHED: ${document.title}`);
  sendMessageToBackground(siteConfig, 'INIT_PAGE_ANNOTATIONS_FINISHED');
  
  
  resolve();
}

async function sendMessageToBackground(siteConfig, type){
  console.log('send message to background, type:'+type);

  let pageInfo = await getPageInfo();
  let site = document.location.hostname;
  if(document.location.protocol ==='file:'){
    site='[local]';
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

async function initDocumentAnnotations(document, isIframe, documentConfig) {
  
  if(documentConfig.canProcess){
    

    document.body.setAttribute('mea-initialized', true);

    if(!findStyleSheet(document)){
      addStyle(document);   
    }
    //console.log('initDocumentAnnotations');
    
    var x = 0;
    var intervalID = setInterval(async function () {

      if(containsMeaStyle(document)){
        changeStyle(document, await getAnnotationOptions());
        window.clearInterval(intervalID);
      };

      if (++x === 30) {
          window.clearInterval(intervalID);
      }
    }, 1000);
    
    visitElement(document.body,(element)=>{
      //console.log(element.nodeName + element.nodeType);
      annotateChildTextContents(element, isIframe);
    });  

    addToolbar(document);
    addEventListener(document);
    
  }

}

function addStyle(document){
  var link = document.createElement("link");
  link.href = chrome.runtime.getURL("contentScript.css");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.title = "mea-style";
  document.getElementsByTagName("head")[0].appendChild(link);
  //console.log('add style');
}

function addToolbar(document){
  //check if existed
  if(document.querySelector('.mea-toolbar')){
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

async function addEventListener(document){
  document.querySelectorAll('.mea-highlight').forEach((element) => {
    element.addEventListener('click', async (e) => {
    
      let show = false;

      let highlightElement = e.target.closest('.mea-highlight');
      let targetWord = getBaseWordFromElement(highlightElement);

      //gSelection = selection.toString();
      if(targetWord) {
        show = true;

        let toolbarElement = document.getElementsByClassName('mea-toolbar')[0];

        if(toolbarElement) {

          toolbarElement.style.top = window.scrollY + highlightElement.getBoundingClientRect().top - toolbarElement.offsetHeight + 'px';
          
          let offsetLeft = highlightElement.getBoundingClientRect().left + (highlightElement.offsetWidth * 0.5) - toolbarElement.offsetWidth * 0.5;
          
          let left = window.scrollX + offsetLeft;
          
          toolbarElement.style.left =  left + 'px';
          
          
          
          toolbarElement.style.visibility = 'visible';

          toolbarElement.setAttribute('data-target-word', targetWord);

          //console.log('tooltip style:'+ toobarElement.style.cssText);
        }
      }
    
      
      if(!show) {
        let toolbarElement = document.getElementsByClassName('mea-toolbar')[0];

        toolbarElement.style.visibility = 'hidden';
      }
    });
  });

  document.querySelectorAll('.mea-mark-unknown').forEach((element) => {
    element.addEventListener('click', async (e) => {
      
      let targetWord = e.target.closest('.mea-toolbar').getAttribute('data-target-word');

      if(targetWord){
        
        
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

      if(targetWord){
        
        
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

      if(targetWord){
        
        
        let wordChanges = await removeWordMark(targetWord);
        sendMessageMarkWord(wordChanges);

        let visible = isPageAnnotationVisible();
        resetPageAnnotationVisibility(visible);
        hideToolbar(document);
      }
    });
  });
}

function sendMessageMarkWord(wordChanges){
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

function annotateChildTextContents(element, isIframe){
  //console.log('element.nodeName:'+element.nodeName);
  //console.log('element Id:'+element.getAttribute('id'));
  
  if(!canAnnotate(element)){
    //console.log('containsIframeThatNeedBeProtected');
    return;
  }

  /*
  if(containsMeaClass(element)){
      return;
  }
  */

  if(isInMeaElement(element)){
    return;
  }

  let html = element.innerHTML;
  for(var i=0; i< element.childNodes.length;i++){
    let childNode = element.childNodes[i];
    if(childNode.nodeName==='#text'){
      let textContent = childNode.textContent;
      let annotatedTextContent = annotateTextContent(textContent);
      let unescapedTextContent = textContent.replace(/\u00a0/g, "&nbsp;")
        .replace(/&/g, "&amp;");

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

function isInMeaElement(element){
  let meaContainer = element.closest('.mea-container');
  if(meaContainer){
    return true;
  }else{
    return false;
  }
}

function annotateTextContent(textContent){
  let html = textContent; 

  let result = html.replaceAll(/([a-zA-Z][a-zA-Z'\u2018\u2019&\-]+)/g, function (x) {
    //console.log(x);
    let searchResult = searchWord({
      query: x,
      allowLemma: true,
      allowRemoveSuffixOrPrefix: false,      
    });
    //console.log(JSON.stringify(searchResult));
    //finally,
    if(searchResult){// find the correct form which has definition in dictionary
      let annotatedWord = annotateWord(searchResult);
      //console.log(x+'-> '+ annotatedWord);
      return annotatedWord;
    } else if(x.includes('-')) {
      let subwords = x.split('-');

      let annotatedSubwords = [];
      for(let subword of subwords){
        searchResult = searchWord({
          query: subword,
          allowLemma: true,
          allowRemoveSuffixOrPrefix: false,      
        });
        if(searchResult){// find the correct form which has definition in dictionary
          let annotatedSubword = annotateWord(searchResult);
          annotatedSubwords.push(annotatedSubword);
        }
      }
      return annotatedSubwords.join('-');

    } else {         
      //console.log('search failed');
      return x;
    }
  });

  return result;
}

function annotateWord(searchResult){
  let query = searchResult.query;
  let baseWord = searchResult.word;
  let definition = searchResult.definition;
  
  if(searchResult.searchType ==='stem'){
    definition = '根'+searchResult.word+':'+definition;
  }
  if(searchResult.searchType ==='removeSuffixOrPrefix'){
    definition = '源'+searchResult.word+':'+definition;
  }
  if(searchResult.searchType ==='lemma' && searchResult.lemmaType ==='irregular'){
    definition = '原'+searchResult.word+':'+definition;
  }

  //fix right click selection issue
  if(isStartWithAlphabet(definition)){
    //definition = ':'+definition;
  }      
  
  //only support one-root
  let root ='';
  
  let wordPartObjs = getWordParts(baseWord);
  let parts='';
  if(wordPartObjs){
    let partArray = [];
    for(let partObj of wordPartObjs){
      partArray.push(partObj.word);
    }
    parts = partArray.join(' ');
  }
  let formatted =  format(query, definition, baseWord, parts);
  //console.log('formatted:'+formatted);                 
  return formatted;
}

function isStartWithAlphabet(definition){
  var english = /^[A-Za-z].*$/;
  return english.test(definition);
}

function isPageAnnotationInitialized(){
  return isDocumentAnnotationInitialized(document)
}

function isAllDocumentsAnnotationInitialized(){
  let documents = getAllDocuments();
  
  return documents.every((document)=>{
    return isDocumentAnnotationInitialized(document);
  });
}

function isDocumentAnnotationInitialized(document){
  if(!document.body){
    console.log('body is null');
  }

  let meaInitialized = document.body.getAttribute('mea-initialized');
  if(meaInitialized){
    return true;
  }
  else{
    return false;
  }
}

function clearAllDocumentsAnnotationInitializationMark(){
  let documents = getAllDocuments();
  
  return documents.every((document)=>{
    document.body.removeAttribute('mea-initialized');
  });
}

function isPageAnnotationVisible(){
  let result = document.body.getAttribute('mea-visible');
  if(result === 'true') {
    return true;
  } else {
    return false;
  }
}

async function resetPageAnnotationVisibility(enabled, source) {
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
async function resetDocumentAnnotationVisibility(document, enabled, onUnknownWord){
  //set flag
  document.body.setAttribute('mea-visible', enabled);

  knownWords = await loadKnownWords();



  document.querySelectorAll('.mea-highlight').forEach((element) => { 
    
    let targetWord = getBaseWordFromElement(element);

    if(enabled){
      
      if(isKnown(targetWord, knownWords)){
        element.classList.add("hide");
      } else {
        element.classList.remove("hide");

        if(onUnknownWord){
          onUnknownWord(targetWord);
        }
      }
    } else {
      element.classList.add("hide");
    }
  });			
}



function format(word, annotation, baseWord, parts) {
  let escapedBaseWord = baseWord.replace(/&/g, "&amp;");
  let escapedWord = word.replace(/&/g, "&amp;");
  let s = `<span class="mea-container mea-highlight hide" data-base-word="${escapedBaseWord}" data-parts="${parts}" data-footnote="${annotation}">
      ${escapedWord}
    </span>`;
  return s;
}


