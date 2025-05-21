import { mergeEntries, hasOnlyLinkOrFormDefinition } from './dictionary/entry-utils.js'
import { pronunciationsToText } from './dictionary/definition-formatter.js'
import { searchWord, buildDictionaryOptions, getWordParts, isKnown } from './language.js';
import { getSearchTypeDescription } from './dictionary/search-type.js'
import { sendMessageMarkWordToBackground } from './message.js'; 
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from './vocabularyStore.js';
import { isPageAnnotationVisible } from './page.js'

const DEFINITION_TOOLTIP_ID = 'mea-definition-tooltip';

const TOOLTIP_MARK_TOGGLE_ID = 'mea-tooltip-mark-toggle';
const TOOLTIP_MARK_CLEAR_ID = 'mea-tooltip-mark-clear';

const tickImgUrl = chrome.runtime.getURL("icons/tick.png");
const clearImgUrl = chrome.runtime.getURL("icons/clear.png");

var resetPageAnnotationVisibilityAndNotify;

function createTooltip(document) {
  let tooltipElement = document.createElement('div');
  tooltipElement.id = DEFINITION_TOOLTIP_ID;
  tooltipElement.classList.add('mea-element', 'mea-supplementary');
  document.body.appendChild(tooltipElement);

  const tooltipElementShowRoot = tooltipElement.attachShadow({ mode: 'open' });


  const style = document.createElement('style');
  style.textContent = `
    #mea-definition-tooltip-wrapper {
      
      * {
        margin: 0px;
        padding: 1px;
      }
      
      .word-mark-actions {
        button {
          border-width: 1px;
        }
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
      <button id="${TOOLTIP_MARK_TOGGLE_ID}" class='mea-tooltip-button'><img src="${tickImgUrl}" /></button> <button id="${TOOLTIP_MARK_CLEAR_ID}" class='mea-tooltip-button'><img src="${clearImgUrl}" /></button>
    </div>
    <p>
      <span id='mea-headword'></span>
    </p>
    <p id='mea-definition'></p>
  
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

function updateUI(tooltipElement, headwordHtml, definitionHtml, unknown){
  let headword = tooltipElement.shadowRoot.querySelector('#mea-headword');
  headword.innerHTML = headwordHtml;

  let definition = tooltipElement.shadowRoot.querySelector('#mea-definition');
  definition.innerHTML = definitionHtml;

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

function addTooltipEventListener(document, documentConfig, clickHandler, siteOptions, options, resetPageAnnotationVisibilityAndNotifyFunction) {
  resetPageAnnotationVisibilityAndNotify = resetPageAnnotationVisibilityAndNotifyFunction;

  console.log('addTooltipEventListener');
  const definitionTooltipElement = getTooltipElement();
  var hideTooltipTimeout;

  definitionTooltipElement.shadowRoot.addEventListener('click', (event) => {
    let tooltipButton = event.target.closest('.mea-tooltip-button');
    if(!tooltipButton){
      let word = definitionTooltipElement.getAttribute('data-word');
      clickHandler(word);
    }
  });

  definitionTooltipElement.addEventListener('mouseenter', () => {
    //console.log('clearTimeout 1');
    clearTimeout(hideTooltipTimeout);
  });

  definitionTooltipElement.addEventListener('mouseleave', () => {
    hideTooltipTimeout = setTimeout(() => {
      hideTooltip(definitionTooltipElement); 
    }, 100);
  });

  const meaWords = document.querySelectorAll('.mea-word');
  meaWords.forEach(function(ele) {
    ele.addEventListener('mouseenter', function() {
      //console.log('mouse enter');

      //console.log('clearTimeout 2');
      clearTimeout(hideTooltipTimeout);
      
      let word = ele.getAttribute('data-word');      
      
      let searchResult = searchWord(word, { dictionaryOptions: buildDictionaryOptions(siteOptions) });
      showTooltip(documentConfig, definitionTooltipElement, ele, searchResult, options);
    
    });

    ele.addEventListener('mouseleave', function() {
      //console.log('mouse leave');    
      hideTooltipTimeout = setTimeout(() => {
        hideTooltip(definitionTooltipElement);   
      }, 100); 
    });
  });
}

function showTooltip(documentConfig, tooltipElement, targetElement, searchResult, options){
  
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

  let searchType = targetElement.getAttribute('data-search-type'); 
  let unknown = !targetElement.classList.contains('mea-hide');
  searchResultToHtml(tooltipElement, searchType, searchResult, options.pronunciation.region, unknown);
  tooltipElement.setAttribute('data-word', searchResult.word);
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


function searchResultToHtml(tooltipElement, searchType, searchResult, pronunciationRegion, unknown){
  
  let word = searchResult.word;
  let baseWord = searchResult.baseWord;
  let baseSearchType = searchResult.baseSearchType;


  let lookupResult = searchResult.lookupResult;
  let useBaseWord = searchResult.deepLookupResult && hasOnlyLinkOrFormDefinition(lookupResult.json);
  if(useBaseWord){
    lookupResult = searchResult.deepLookupResult.lookupResult;
  }

  let headWordHtml = generateHeadWordHtml(useBaseWord, word, searchType, baseWord, baseSearchType);
  let partsHtml = generatePartsHtml(useBaseWord, word, baseWord);

  
  let entries = lookupResult.json;
  if(!entries){
    entries = [];
  }
  let entry = mergeEntries(entries);
  let definitionHtml = generateDefinitionHtml(entry);
  let pronunciationText = pronunciationsToText(entry.headword.pronunciations, pronunciationRegion);    

  updateUI(tooltipElement, `${headWordHtml} ${pronunciationText} ${partsHtml}`, definitionHtml, unknown);
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

function generateHeadWordHtml(useBaseWord, word, searchType, baseWord, baseSearchType){
  
  let headWordStr = '';
  if(useBaseWord){
    let description = getSearchTypeDescription(baseSearchType, true);
    let descriptionStr = description ? `${description}:`:'';

    let baseWordStr = baseSearchType == 'raw' ? baseWord: `<i>${baseWord}</i>`;
    headWordStr = `${descriptionStr}${baseWordStr}`;
  } else {
    if(searchType){
      let description = getSearchTypeDescription(searchType, true);
      let descriptionStr = description ? `${description}:`:'';

      let wordStr = searchType == 'raw' ? word: `<i>${word}</i>`;
      headWordStr = `${descriptionStr}${wordStr}`;
    }
  }

  return headWordStr;
}

function generatePartsHtml(useBaseWord, word, baseWord) {
  let effectiveWord = useBaseWord? baseWord : word;
  let wordPartObjs = getWordParts(effectiveWord);
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
  }

  if (isOffRight) {
    //right align
    tooltipElement.style.left = `${baseLeft + targetRect.left - offRight}px`;
    
    tooltipElement.style.left = '';
    tooltipElement.style.right = `10px`;
  }

}

function hideTooltip(tooltipElement){
  //console.log('hideTooltip');
  tooltipElement.style.visibility = 'hidden';
}

export { addTooltipEventListener, createTooltip, showTooltip, hideTooltip }