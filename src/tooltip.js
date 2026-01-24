import { mergeEntries, hasOnlyLinkOrFormDefinition } from './dictionary/entry-utils.js'
import { entriesToHtml } from './dictionary/definition-formatter.js'
import { searchWord, buildDictionaryOptions, getWordPartObjects, isKnown } from './language.js';
import { sendMessageMarkWordToBackground } from './message.js'; 
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from './vocabularyStore.js';
import { isPageAnnotationVisible } from './page.js'
import { getTargetWordFromSearchResult } from './word.js'
import { findTokenInfoByNode } from './article.js'
import { findPhrase } from './phrase.js'
import { isRegularTransform } from './lemma.js'
import { resetPageAnnotationVisibilityAndNotify, refreshPageAnnotation } from './page/page-utils.js'
import { isElementDetached } from './html.js'
import { INTERACTION_KEY_HOVER_WORD, getEffectiveInteractionOption } from './interaction-utils.js'
import { getCurrentSiteOptionsFromCache } from './current-site-options.js'
import { isBionicHighlightedElement } from './bionic/bionic-utils.js'
import { cursorNearCaret } from './html-utils.js'

import log from 'loglevel'

const gLogger = log.getLogger('tooltip');

const TOOLTIP_DELAY_IN_MILLISECOND = 500;

const DEFINITION_TOOLTIP_ID = 'mea-definition-tooltip';

const TOOLTIP_MARK_TOGGLE_ID = 'mea-tooltip-mark-toggle';
const TOOLTIP_MARK_CLEAR_ID = 'mea-tooltip-mark-clear';

const tickImgUrl = chrome.runtime.getURL("icons/tick.png");
const clearImgUrl = chrome.runtime.getURL("icons/clear.png");

const markToggleTips = chrome.i18n.getMessage('sidepanelWordActionMarkToggle');
const clearMarkTips = chrome.i18n.getMessage('sidepanelWordActionClearMark');

var gPage;

var gCursorInTooltip;
var gTooltipTimeout;

function clearAndSetTooltipTimeout(tooltipTimeout){
  //console.log('clearAndSetTooltipTimeout');
  if(gTooltipTimeout){
    //console.log('clearTimeout');
    clearTimeout(gTooltipTimeout);
  }

  gTooltipTimeout = tooltipTimeout;
}

function clearTooltipTimeout(){
  if(gTooltipTimeout){
    clearTimeout(gTooltipTimeout);
    gTooltipTimeout= null;
  }
}

function removeTooltip(document){
  document.getElementById(DEFINITION_TOOLTIP_ID).remove();
}

function createTooltip(document) {
  let tooltipElement = document.createElement('div');
  tooltipElement.id = DEFINITION_TOOLTIP_ID;
  tooltipElement.classList.add('mea-element', 'mea-supplementary');
  document.body.appendChild(tooltipElement);

  const tooltipElementShowRoot = tooltipElement.attachShadow({ mode: 'open' });


  const style = document.createElement('style');
  style.textContent = `
    #mea-definition-tooltip-wrapper {
      
      p {
        margin: 0px;
        padding: 0px;
      }
      
      .word-mark-actions {
        
        img {
          width: 16px;
          vertical-align: middle;
        }          
      }
      .word-mark-actions .unknown {
        img {
          filter: grayscale(100%);
        }
      }  
    }
  `;
  tooltipElementShowRoot.appendChild(style);
  
  let tooltipWrapperElement = document.createElement('div');
  tooltipWrapperElement.id = 'mea-definition-tooltip-wrapper';
  tooltipElementShowRoot.appendChild(tooltipWrapperElement);

  tooltipWrapperElement.innerHTML = `
    <div class="word-mark-actions">
      <button id="${TOOLTIP_MARK_TOGGLE_ID}" class='mea-tooltip-button' title='${markToggleTips}'><img src="${tickImgUrl}" /></button> <button id="${TOOLTIP_MARK_CLEAR_ID}" class='mea-tooltip-button' title='${clearMarkTips}'><img src="${clearImgUrl}" /></button>
    </div>
    <div id="mea-definitions">
    
    </div>
  `;
  
    

  let markToggle = tooltipElementShowRoot.querySelector('#' + TOOLTIP_MARK_TOGGLE_ID);
  markToggle.addEventListener('click', function() {
    let word = tooltipElement.getAttribute('data-word');  
    //console.log(`toggle ${word}`);
    onMarkToggle(tooltipElement, word);
  });

  let markClear = tooltipElementShowRoot.querySelector('#' + TOOLTIP_MARK_CLEAR_ID);
  markClear.addEventListener('click', function() {
    let word = tooltipElement.getAttribute('data-word');  
    //console.log(`clear ${word}`);
    onClearMark(tooltipElement, word);
  });
}

async function onMarkToggle(tooltipElement, word) {
  let knownWords = await loadKnownWords();
  let known = isKnown(word, knownWords);
  if(known){
      await onMarkAsUnknown(tooltipElement, word);
  } else {
      await onMarkAsKnown(tooltipElement, word);
  }
  //console.log('mark toggle');
}

async function onMarkAsKnown(tooltipElement, word) {
  let targetWord = word;
  let wordChanges = await markWordAsKnown(targetWord);

  updateWordMarkToogle(tooltipElement, false);

  let visible = isPageAnnotationVisible();
  //mea-token already existed, reset visibility is enough
  resetPageAnnotationVisibilityAndNotify(gPage, visible);

  sendMessageMarkWordToBackground(wordChanges);
}

async function onMarkAsUnknown(tooltipElement, word) {
  let targetWord = word;
  let wordChanges = await markWordAsUnknown(targetWord);
  updateWordMarkToogle(tooltipElement, true);

  //let visible = isPageAnnotationVisible();
  //always true in this scene
  let visible = true;
  //resetPageAnnotationVisibilityAndNotify(gPage, visible);
  let refreshOptions = {
    words: [word]
  };
  //need to create tokens for unknown words
  //TODO check if token already existed
  await refreshPageAnnotation(gPage, visible, refreshOptions);

  sendMessageMarkWordToBackground(wordChanges);
}

async function onClearMark(tooltipElement, word) {
  let targetWord = word;
  let wordChanges = await removeWordMark(targetWord);
  
  let knownWords = await loadKnownWords();
  let known = isKnown(word, knownWords);
  updateWordMarkToogle(tooltipElement, !known);

  let visible = true;

  let refreshOptions = {
    words: [word]
  };
  await refreshPageAnnotation(gPage, visible, refreshOptions);

  resetPageAnnotationVisibilityAndNotify(gPage, visible);

  sendMessageMarkWordToBackground(wordChanges);
}

function updateUI(tooltipElement, definitionsHtml, unknown){
  let definitions = tooltipElement.shadowRoot.querySelector('#mea-definitions');
  definitions.innerHTML = definitionsHtml;

  updateWordMarkToogle(tooltipElement, unknown);
}

function updateWordMarkToogle(tooltipElement, unknown){
  let markToggle = tooltipElement.shadowRoot.querySelector('#' + TOOLTIP_MARK_TOGGLE_ID);
  if(unknown){
    markToggle.classList.add('unknown');
  } else {
    markToggle.classList.remove('unknown');
  }
}

function getTooltipElement(){
  let topDocument = window.top.document;
  return topDocument.getElementById(DEFINITION_TOOLTIP_ID);
}

function addTooltipEventListener(page, document, documentConfig, clickHandler, siteOptions, options) {
  gPage = page;
  //console.log('addTooltipEventListener');
  const definitionTooltipElement = getTooltipElement();
  
  definitionTooltipElement.shadowRoot.addEventListener('click', (event) => {
    let tooltipButton = event.target.closest('.mea-tooltip-button');
    if(!tooltipButton){
      let word = definitionTooltipElement.getAttribute('data-word');
      let dictionary = definitionTooltipElement.getAttribute('data-dictionary');
      
      clickHandler(word, dictionary);
    }
  });

  definitionTooltipElement.addEventListener('mouseenter', () => {
    gCursorInTooltip = true;
    //console.log('clearTimeout 1');
    clearTooltipTimeout();
  });

  definitionTooltipElement.addEventListener('mouseleave', () => {
    gCursorInTooltip = false;
    let timeout = setTimeout(() => {
      //console.log('timer 1');
      hideTooltip(definitionTooltipElement); 
    }, 100);
    clearAndSetTooltipTimeout(timeout);
  });

  const meaWords = document.querySelectorAll('.mea-word');
  //console.log(`add mouseenter event listener for mea-word`);
  meaWords.forEach(function(ele) {
    ele.addEventListener('mouseenter', function() {
      //this function must be sync. otherwise the timer won't work correctly.
      //console.log('mouse enter');
      let siteOptions = getCurrentSiteOptionsFromCache();
      let hoverWordEnabled = getEffectiveInteractionOption(options, siteOptions, INTERACTION_KEY_HOVER_WORD);
      if(!hoverWordEnabled){
        return;
      }

      //console.log('clearTimeout 2');
      clearTooltipTimeout();
      
      let timeout = setTimeout(() => {
        //console.log('timer 2');
        //showTooltipForMeaToken(page, document, documentConfig, options, siteOptions, ele, definitionTooltipElement);
      }, TOOLTIP_DELAY_IN_MILLISECOND); 
      clearAndSetTooltipTimeout(timeout);      
    
    });

    ele.addEventListener('mouseleave', function() {
      //this function must be sync. otherwise the timer won't work correctly.
      //console.log('mouse leave');    
      let timeout = setTimeout(() => {
        hideTooltip(definitionTooltipElement);   
      }, 100); 
      clearAndSetTooltipTimeout(timeout);  
    });
  });
}

function showTooltipForMeaToken(page, document, documentConfig, options, siteOptions, meaTokenElement, definitionTooltipElement) {
  let ele = meaTokenElement;      

  let query = ele.getAttribute('data-query');
        
  let article = page.documentArticleMap.get(document);

  let textNode;
  if(isBionicHighlightedElement(ele.firstElementChild)){
    textNode = ele.firstChild.firstChild;
  }else {
    textNode = ele.firstChild;
  }
  
  let tokenInfo  = findTokenInfoByNode(article, textNode, 0);
  let { sentenceInfo, tokenIndex } =  tokenInfo;
  let token = sentenceInfo.tokens[tokenIndex];

  let unknown = !ele.classList.contains('mea-hide');
  let targetRect = ele.getBoundingClientRect();

  if(!isElementDetached(ele)){
    let searchResult = searchWord(query, { 
      allowLemma: true,
      lookupBase: 'Always',
      transform: token.transform,
      dictionaryOptions: buildDictionaryOptions(siteOptions) });

    if (searchResult) {
      let phraseSearchResult = getPhraseSearchResult(tokenInfo, searchResult, siteOptions);
      if(!isElementDetached(ele)){
        showTooltip(documentConfig, definitionTooltipElement, targetRect, unknown, searchResult, phraseSearchResult, options);
      }
    } else {
      hideTooltip(definitionTooltipElement);
    }
  }
}

async function handleTooltipForCaretPosition(page, document, documentConfig, options, siteOptions, caretPosition, cursorPosition){
  const definitionTooltipElement = getTooltipElement();
  //console.log('timer 2');
  //let query = ele.getAttribute('data-query');
    
  const { offsetNode, offset } = caretPosition;
  
  if(gCursorInTooltip){
    return;
  }

  if(offsetNode.id == 'mea-vue-container'){
    //in dialog
    //console.log('in dialog');
    return;
  }

  let targetRect = caretPosition.getClientRect();
  if(!cursorNearCaret(caretPosition, cursorPosition)){
    hideTooltip();
    return;
  }

  //console.log(caretPosition);
  let article = page.documentArticleMap.get(document);
  let tokenInfo = findTokenInfoByNode(article, offsetNode, offset);
  const { sentenceInfo, tokenIndex } = tokenInfo;
  let token = sentenceInfo.tokens[tokenIndex];
  //console.log(token); 

  let isWord = token.checked && token.checkWordResult.word != '';
  if(!isWord){
    return;
  }
  
  let parentElement = offsetNode.parentElement;

  if(isElementDetached(parentElement)){
    hideTooltip(definitionTooltipElement); 
    return;
  }

  let query = token.word? token.word : trimPunctuations(token.content);
  let searchResult = searchWord(query, { 
  allowLemma: true,
  lookupBase: 'Always',
  transform: token.transform,
  dictionaryOptions: buildDictionaryOptions(siteOptions) });

  if (searchResult) {
    let targetWord = getTargetWordFromSearchResult(searchResult);
    let knownWords = await loadKnownWords();
    let unknown = !isKnown(targetWord, knownWords);

    let phraseSearchResult = getPhraseSearchResult(tokenInfo, searchResult, siteOptions);
    showTooltip(documentConfig, definitionTooltipElement, targetRect, unknown, searchResult, phraseSearchResult, options);
  } else {
    hideTooltip(definitionTooltipElement);
  }
  
}

function getPhraseSearchResult(tokenInfo, wordSearchResult, siteOptions){
  let { sentenceInfo, tokenIndex }  = tokenInfo;
  let token = sentenceInfo.tokens[tokenIndex];
        
  let baseWords = [];
  let baseWordIndex;
  for(let i=0;i<sentenceInfo.tokens.length; i++){
    let part = sentenceInfo.tokens[i];
    
    let phraseBaseWord = part.phrase?.baseWord;
    if(phraseBaseWord){
      if(tokenIndex ==i){
        baseWordIndex = baseWords.length;
      }
      
      baseWords.push(phraseBaseWord);
    }
    
  }

  let baseWord = baseWords[baseWordIndex];
  let lookupResult;
  
  let searchResult = searchWord(baseWord, { 
        allowLemma: true,
        lookupBase: 'Never',
        transform: token.transform,
        acceptResult: (lookupResult) => {
          let result = false;
          if(lookupResult){
            let entry = mergeEntries(lookupResult.json);
            let phrases = entry.phrases;
            if(phrases.length > 0){
              result = true;
            }
          }
          return result;
        },
        dictionaryOptions: buildDictionaryOptions(siteOptions) });

  lookupResult = searchResult?.lookupResult;

  let phrases;
  if(lookupResult){
    let entry = mergeEntries(lookupResult.json);
    phrases = entry.phrases;
  }

  if(phrases){
    let sentence = baseWords.join(' ');
    
    let phrase = findPhrase(sentence, baseWordIndex, phrases);
    
    if(phrase){
      let phraseSearchResult = searchWord(phrase, { 
        allowLemma: false,
        lookupBase: 'Never',
        dictionaryOptions: buildDictionaryOptions(siteOptions) });  
        //console.log(phraseSearchResult);
      return phraseSearchResult;
    }
  }  
}

function showTooltip(documentConfig, tooltipElement, targetRect, unknown, searchResult, phraseSearchResult, options){
  
  let iframeLeft=0;
  let iframeTop=0;
  if(documentConfig.iframe){
    let rect = documentConfig.iframe.getBoundingClientRect();
    iframeLeft = rect.left;
    iframeTop = rect.top;
  }

  gLogger.debug(targetRect);

  let baseTop = iframeTop + window.scrollY;
  let baseLeft = iframeLeft + window.scrollX;

  let targetWord = getTargetWordFromSearchResult(searchResult);
  
  searchResultToHtml(tooltipElement, searchResult, targetWord, options.pronunciation.region, phraseSearchResult, unknown);
  tooltipElement.setAttribute('data-word', targetWord);
  tooltipElement.setAttribute('data-dictionary', searchResult.lookupResult.dictionaryName);
  //left top
  
  tooltipElement.style.left = `0px`;
  tooltipElement.style.right = '';
  tooltipElement.style.top = `${baseTop + targetRect.top - tooltipElement.offsetHeight}px`;
  
  const rect = tooltipElement.getBoundingClientRect();
  const tooltipWidth = rect.width;

  tooltipElement.style.left = `${baseLeft + targetRect.left}px`;
  

  adjustIfOutOfViewPort(tooltipElement, baseTop, baseLeft, targetRect, tooltipWidth);

  tooltipElement.style.visibility = 'visible';
  
}


function searchResultToHtml(tooltipElement, searchResult, targetWord, pronunciationRegion, phraseSearchResult, unknown){
  
  let word = searchResult.word;
  let baseWord = searchResult.baseWord;
  
  let paragraphs = [];
  let wordHtml = null;

  let linkOrDefinitionOnly = hasOnlyLinkOrFormDefinition(searchResult.lookupResult.json);
  let regular = baseWord && isRegularTransform(baseWord, word);
  
  let hideWordHtml = false;
  if(linkOrDefinitionOnly && regular){
    hideWordHtml = true;
  }

  if(!hideWordHtml) {
    wordHtml = lookupResultToHtml(word, searchResult.lookupResult, pronunciationRegion, true);
  }

  let baseHtml = null;
  if(searchResult.deepLookupResult){
    baseHtml = lookupResultToHtml(baseWord, searchResult.deepLookupResult.lookupResult, pronunciationRegion, true);
  }

  let html;
  if(targetWord == word){
    paragraphs.push(wordHtml);
    paragraphs.push(baseHtml);
  } else {
    paragraphs.push(baseHtml);
    paragraphs.push(wordHtml);
  }

  if(phraseSearchResult){
    let phrase = phraseSearchResult.query;
    let phraseHtml = lookupResultToHtml(phrase, phraseSearchResult.lookupResult, pronunciationRegion, true);

    paragraphs.push(phraseHtml);
  }

  paragraphs = paragraphs.filter(item => item!=null);
  html = paragraphs.join('<br>');

  updateUI(tooltipElement, html, unknown);
}

function lookupResultToHtml(word, lookupResult, pronunciationRegion, isBold){
  
  let entries = lookupResult.json;
    
  let wordPartObjects = getWordPartObjects(word);
  return entriesToHtml(word, entries, pronunciationRegion, wordPartObjects, { supportLink:false});
}

function adjustIfOutOfViewPort(tooltipElement, baseTop, baseLeft, targetRect, tooltipWidth){
  
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const rect = tooltipElement.getBoundingClientRect();
  //const tooltipWidth = rect.width;
  const tooltipHeight = rect.height;
  const tooltipLeft = rect.left;
  const tooltipTop = rect.top;

  const isOffLeft = tooltipLeft < 0;

  const offRight = tooltipLeft + tooltipWidth - windowWidth;
  const isOffRight = offRight > 0;

  const isOffTop = tooltipTop < 0;
  const isOffBottom = tooltipTop + tooltipHeight > windowHeight;

  if (isOffTop) {
    //under target
    tooltipElement.style.top = `${baseTop + targetRect.bottom}px`;  
    
    moveActions(tooltipElement, true);
  } else {
    moveActions(tooltipElement, false);
  }

  if (isOffRight) {
    //right align
    tooltipElement.style.left = `${baseLeft + targetRect.left - offRight}px`;
    
    tooltipElement.style.left = '';
    tooltipElement.style.right = `10px`;
  }

}

function moveActions(tooltipElement, top){
  let wrapper = tooltipElement.shadowRoot.querySelector('#mea-definition-tooltip-wrapper')
  let actions = wrapper.querySelector('.word-mark-actions')
  
  if(top){
    if(wrapper.firstElementChild != actions){
      wrapper.prepend(actions);
    }
  }else {
    if(wrapper.lastElementChild != actions){
      wrapper.appendChild(actions);
    }
  }
}

function hideTooltip(tooltipElement){
  if(!tooltipElement){
    tooltipElement = getTooltipElement();
  }
  //console.log('hideTooltip');
  tooltipElement.style.visibility = 'hidden';
}

export { addTooltipEventListener, createTooltip, removeTooltip, showTooltip, hideTooltip, handleTooltipForCaretPosition }