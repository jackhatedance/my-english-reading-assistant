import { mergeEntries, hasOnlyLinkOrFormDefinition } from './dictionary/entry-utils.js'
import { pronunciationsToText } from './dictionary/definition-formatter.js'
import { searchWord, buildDictionaryOptions, getWordParts, isKnown } from './language.js';
import { sendMessageMarkWordToBackground } from './message.js'; 
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from './vocabularyStore.js';
import { isPageAnnotationVisible } from './page.js'
import { getTargetWord } from './word.js'
import { findTokenInfoByNode } from './article.js'
import { findPhrase } from './phrase.js'

const DEFINITION_TOOLTIP_ID = 'mea-definition-tooltip';

const TOOLTIP_MARK_TOGGLE_ID = 'mea-tooltip-mark-toggle';
const TOOLTIP_MARK_CLEAR_ID = 'mea-tooltip-mark-clear';

const tickImgUrl = chrome.runtime.getURL("icons/tick.png");
const clearImgUrl = chrome.runtime.getURL("icons/clear.png");

const markToggleTips = chrome.i18n.getMessage('sidepanelWordActionMarkToggle');
const clearMarkTips = chrome.i18n.getMessage('sidepanelWordActionClearMark');

var resetPageAnnotationVisibilityAndNotify;

var gTooltipTimeout;

function clearAndSetTooltipTimeout(tooltipTimeout){
  if(gTooltipTimeout){
    clearTimeout(gTooltipTimeout);
  }

  gTooltipTimeout = tooltipTimeout;
}

function clearTooltipTimeout(){
  if(gTooltipTimeout){
    clearTimeout(gTooltipTimeout);
  }
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
  resetPageAnnotationVisibilityAndNotify(visible);

  sendMessageMarkWordToBackground(wordChanges);
}

async function onMarkAsUnknown(tooltipElement, word) {
  let targetWord = word;
  let wordChanges = await markWordAsUnknown(targetWord);
  updateWordMarkToogle(tooltipElement, true);

  let visible = isPageAnnotationVisible();
  resetPageAnnotationVisibilityAndNotify(visible);

  sendMessageMarkWordToBackground(wordChanges);
}

async function onClearMark(tooltipElement, word) {
  let targetWord = word;
  let wordChanges = await removeWordMark(targetWord);
  
  let knownWords = await loadKnownWords();
  let known = isKnown(word, knownWords);
  updateWordMarkToogle(tooltipElement, !known);

  let visible = isPageAnnotationVisible();
  resetPageAnnotationVisibilityAndNotify(visible);

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

function addTooltipEventListener(document, documentConfig, getArticleFunction, clickHandler, siteOptions, options, resetPageAnnotationVisibilityAndNotifyFunction) {
  resetPageAnnotationVisibilityAndNotify = resetPageAnnotationVisibilityAndNotifyFunction;

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
    //console.log('clearTimeout 1');
    clearTooltipTimeout();
  });

  definitionTooltipElement.addEventListener('mouseleave', () => {
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
      //console.log('mouse enter');

      //console.log('clearTimeout 2');
      clearTooltipTimeout();
      
      let timeout = setTimeout(() => {
        //console.log('timer 2');
        let query = ele.getAttribute('data-query');      
      
        let searchResult = searchWord(query, { 
          allowLemma: true,
          lookupBaseWhenNecessary: true,
          dictionaryOptions: buildDictionaryOptions(siteOptions) });

        let phraseSearchResult = getPhraseSearchResult(document, ele, searchResult, getArticleFunction, siteOptions);
        showTooltip(documentConfig, definitionTooltipElement, ele, searchResult, phraseSearchResult, options);
      }, 500); 
      clearAndSetTooltipTimeout(timeout);      
    
    });

    ele.addEventListener('mouseleave', function() {
      //console.log('mouse leave');    
      let timeout = setTimeout(() => {
        hideTooltip(definitionTooltipElement);   
      }, 100); 
      clearAndSetTooltipTimeout(timeout);  
    });
  });
}

function getPhraseSearchResult(document, element, wordSearchResult, getArticleFunction, siteOptions){
  let { sentenceInfo, tokenIndex }  = findTokenInfoByNode(getArticleFunction(document), element.firstChild);
        
  let baseWords = [];
  let baseWordIndex;
  for(let i=0;i<sentenceInfo.tokens.length; i++){
    let part = sentenceInfo.tokens[i];
    
    if(part.checkWordResult){
      if(tokenIndex ==i){
        baseWordIndex = baseWords.length;
      }
      let word = part.checkWordResult.baseWord? part.checkWordResult.baseWord: part.checkWordResult.word;
      baseWords.push(word);
    }
    
  }

  let baseWord = baseWords[baseWordIndex];
  let lookupResult;
  if(baseWord == wordSearchResult.word){
    lookupResult = wordSearchResult.lookupResult;
  }else if(baseWord == wordSearchResult.baseWord){
    lookupResult = wordSearchResult.deepLookupResult.lookupResult;
  }
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
        lookupBaseWhenNecessary: false,
        dictionaryOptions: buildDictionaryOptions(siteOptions) });  
        //console.log(phraseSearchResult);
      return phraseSearchResult;
    }
  }  
}

function showTooltip(documentConfig, tooltipElement, targetElement, searchResult, phraseSearchResult, options){
  
  let iframeLeft=0;
  let iframeTop=0;
  if(documentConfig.iframe){
    let rect = documentConfig.iframe.getBoundingClientRect();
    iframeLeft = rect.left;
    iframeTop = rect.top;
  }
  let targetRect = targetElement.getBoundingClientRect();
  let baseTop = iframeTop + window.scrollY;
  let baseLeft = iframeLeft + window.scrollX;

  let unknown = !targetElement.classList.contains('mea-hide');
  let targetWord = getTargetWord(searchResult);
  
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
  
  let html;
  if(targetWord == word){
    let wordHtml = lookupResultToHtml(word, searchResult.lookupResult, pronunciationRegion, true);
    let baseHtml = '';
    if(hasOnlyLinkOrFormDefinition(searchResult.lookupResult.json)){
      if(searchResult.deepLookupResult){
        baseHtml = lookupResultToHtml(baseWord, searchResult.deepLookupResult.lookupResult, pronunciationRegion, false);
      }else{
        console.log(`deepLookupResultof ${word} is null`);
      }
    }

    if(baseHtml){
      html = `${wordHtml} <br> ${baseHtml}`;
    }else{
      html = `${wordHtml}`;
    }
    
  } else{
    let baseHtml = lookupResultToHtml(baseWord, searchResult.deepLookupResult.lookupResult, pronunciationRegion, true);
    html = baseHtml;
  }

  if(phraseSearchResult){
    let phrase = phraseSearchResult.query;
    let phraseHtml = lookupResultToHtml(phrase, phraseSearchResult.lookupResult, pronunciationRegion, true);

    html = html +'<br>'+ phraseHtml;
  }

  updateUI(tooltipElement, html, unknown);
}

function lookupResultToHtml(word, lookupResult, pronunciationRegion, isBold){
  let wordHtml = isBold? `<b>${word}</b>` : word;
  let partsHtml = generatePartsHtml(word);
  let entries = lookupResult.json;
  if(!entries){
    entries = [];
  }
  let entry = mergeEntries(entries);
  let definitionHtml = generateDefinitionHtml(entry);
  let pronunciationText = pronunciationsToText(entry.headword.pronunciations, pronunciationRegion);    
  return `<p>${wordHtml} ${pronunciationText} ${partsHtml}</p>
  <p>${definitionHtml}</p>
  `;
}

function generateDefinitionHtml(entry) {
  let definitionObj = entry;

  let groupTexts = [];
  for(let definitionGroup of definitionObj.definitionGroups){
      let wordClass = definitionGroup.name;

      let definitions = definitionGroup.definitions.filter(item => item.text && item.text.length > 0);

      /*
      let shortDefinitions = definitions.filter(item => item.text && item.text.length < 10);
      if(shortDefinitions.length >= 3){
          definitions = shortDefinitions;
      }*/
      let definitionTexts = definitions.map(item => item.text );
      
      let definitionsText = definitionTexts.join(',');
      let groupText = `${wordClass} ${definitionsText}`;
      groupTexts.push(groupText);
  }
  let groupsText = groupTexts.join('<br> ');

  
  let text = groupsText;
  //console.log(text);
  return text;
}


function generatePartsHtml(word) {
  let wordPartObjs = getWordParts(word);
  let parts = '';
  if (wordPartObjs) {
      let partArray = [];
      for (let partObj of wordPartObjs) {
          partArray.push(partObj.word);
      }
      parts = partArray.join(' ');
  }
  let partsHtml = parts ? ` [${parts}]` : '';  
  return partsHtml;
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
  //console.log('hideTooltip');
  tooltipElement.style.visibility = 'hidden';
}

export { addTooltipEventListener, createTooltip, showTooltip, hideTooltip }