const DEFINITION_TOOLTIP_ID = 'mea-definition-tooltip';
import { mergeEntries } from './dictionary/entry-utils.js'
import { pronunciationsToText } from './dictionary/definition-formatter.js'
import { searchWord, buildDictionaryOptions, getWordParts } from './language.js';
import { getSearchTypeDescription } from './dictionary/search-type.js'

function createTooltip(document) {
  let tooltipElement = document.createElement('div');
  tooltipElement.id = DEFINITION_TOOLTIP_ID;
  tooltipElement.classList.add('mea-element', 'mea-supplementary');
  
  document.body.appendChild(tooltipElement);  
}

function getTooltipElement(){
  let topDocument = window.top.document;
  return topDocument.getElementById(DEFINITION_TOOLTIP_ID);
}

function addTooltipEventListener(document, documentConfig, clickHandler, siteOptions, options) {
  const definitionTooltipElement = getTooltipElement();
  var hideTooltipTimeout;

  definitionTooltipElement.addEventListener('click', () => {
    let word = definitionTooltipElement.getAttribute('data-word');
    clickHandler(word);
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
  tooltipElement.innerHTML = searchResultToHtml(searchType, searchResult, options.pronunciation.region);
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


function searchResultToHtml(searchType, searchResult, pronunciationRegion){
  
  let word = searchResult.word;
  let baseWord = searchResult.baseWord;
  let baseSearchType = searchResult.baseSearchType;
  
  let headWordHtml = generateHeadWordHtml(word, searchType, baseWord, baseSearchType);
  let partsHtml = generatePartsHtml(word, baseWord);

  let lookupResult = searchResult.lookupResult;
  if(searchResult.deepLookupResult){
      lookupResult = searchResult.deepLookupResult.lookupResult;
  }
  
  let entries = lookupResult.json;
  if(!entries){
    entries = [];
  }
  let entry = mergeEntries(entries);
  let definitionHtml = generateDefinitionHtml(entry);
  let pronunciationText = pronunciationsToText(entry.headword.pronunciations, pronunciationRegion);    

  return `
  <p>${headWordHtml} ${pronunciationText} ${partsHtml} </p>
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

function generateHeadWordHtml(word, searchType, baseWord, baseSearchType){
  
  let headWordStr = '';
  if(baseWord){
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

function generatePartsHtml(word, baseWord) {
  let effectiveWord = baseWord? baseWord : word;
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