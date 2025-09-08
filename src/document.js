
'use strict';

import log from 'loglevel'
import { traverseElement, traverseNode } from './dom.js';
import { loadKnownWords, } from './vocabularyStore.js';
import { isKnown, } from './language.js';
import { getTargetWordFromElement } from './word.js';
import { getNodeSelectionsFromSentenceHashSelection, getNodeSelectionsFromParagraphHashSelection } from './article.js';
import { getNotes } from './service/noteService.js';
import { getCurrentSiteOptions } from './page.js'
import { mouseUpEventListenerWithParams } from './document/listener.js'
import { createMutationObserver } from './document/mutation-observer.js'
import { tokenizeTextNode, parseDocument, detokenizeTextNode} from './article.js';
import { getOptionsFromCache } from './service/optionService.js';
import { addMeaStyle, removeMeaStyle, findStyleSheet, changeStyle, containsMeaStyle } from './style.js';
import { containsVueApp, addVueApp, removeVueApp } from './embed/iframe-embed.js';
import { createTooltip, removeTooltip } from './tooltip.js'
import { addTooltipEventListener } from './tooltip.js'
import { sendMessageToEmbeddedApp } from './embed/iframe-embed.js';
import { showDialog } from './dialog.js' 

var knownWords;

const gLogger = log.getLogger("document");

function isElementLeaf(element) {

    let childCount = element.childElementCount;
    let text = element.textContent;
    if (!text) {
        text = '';
    }


    return (childCount == 0);
}

function needRemoveTag(element) {
    return (element.getAttribute('mea-remove-tag') === 'true');
}

function allChildrenElementNeedRemoveTag(element) {
    if (element.childElementCount === 0) {
        return false;
    }

    for (let childElement of element.children) {
        if (!needRemoveTag(childElement)) {
            return false;
        }
    }
    return true;
}

function cleanElements(document) {

    //replace punctuations
    traverseNode(document.body, (node) => {
        if (node.nodeName === '#text') {
            //node.textContent = node.textContent.replaceAll(/[`\u2018\u2019]/g, "'");
        }
    });

    //remove text content of some tags
    traverseElement(document.body, (element) => {
        const TAGS_CLEAR_CONTENT = ['SUP', 'S'];
        const TAGS_KEEP_CONTENT = ['EM', 'I', 'B',];
        if (TAGS_CLEAR_CONTENT.includes(element.nodeName)) {
            element.setAttribute('mea-remove-tag', 'true');
            element.innerHTML = '';
            //element.outerHTML = '';
        } else if (TAGS_KEEP_CONTENT.includes(element.nodeName)) {
            if (isElementLeaf(element)) {
                element.setAttribute('mea-remove-tag', 'true');

            }
        }

        if (allChildrenElementNeedRemoveTag(element)) {
            element.innerHTML = element.textContent;
        }
    }, false);

    // merge TEXT NODEs
    traverseElement(document.body, (element) => {
        if (allChildrenElementNeedRemoveTag(element)) {
            element.innerHTML = element.textContent;
        }
    });

}

function isDocumentAnnotationInitialized(document) {
    if (!document.body) {
        console.warn('body is null');
        return false;
    }

    let meaInitialized = document.body.getAttribute('mea-preprocessed');
    if (meaInitialized == "true") {
        return true;
    }
    else {
        return false;
    }
}

function isAllDocumentsAnnotationInitialized(siteProfile) {
    let documents = getAllDocuments(siteProfile);

    return documents.every((document) => {
        return isDocumentAnnotationInitialized(document);
    });
}

function isAnyDocumentsAnnotationInitialized(siteProfile) {
    let documents = getAllDocuments(siteProfile);

    return documents.some((document) => {
        return isDocumentAnnotationInitialized(document);
    });
}

function getAllDocuments(siteProfile) {
      
    let documents = [document];
  
    for (const config of siteProfile.getIframeDocumentConfigs(document)) {
      if(config.document){
        documents.push(config.document);
      }    
    }
    //console.log('get all documents.');
  
    return documents;
  }

  function changeStyleForAllDocuments(siteProfile, siteOptions) {
    let documents = getAllDocuments(siteProfile);
    
    for (let document of documents) {
      changeStyle(document, siteOptions, siteProfile);
    }
  }


/**
 * 
 * reset all word's display attribute according to vocabulary
 */
async function resetDocumentAnnotationVisibility(article, window, enabled, types) {
  //console.log('resetDocumentAnnotationVisibility begin');

    let document = window.document;
    //set flag
    document.body.setAttribute('mea-visible', enabled);
  
    if (types.includes('word-definition')) {
      //global var
      knownWords = await loadKnownWords();
  
      //show hide unknown word annotation
      document.querySelectorAll('.mea-word').forEach((element) => {
  
        let targetWord = getTargetWordFromElement(element);
  
        if (enabled) {
          let hide = element.classList.contains("mea-hide");
          let known = isKnown(targetWord, knownWords);
          if ((known && !hide) || (!known && hide)) {
            element.classList.toggle("mea-hide");
          }
        } else {
          element.classList.add("mea-hide");
        }
      });
    }
  
  
    if (types.includes('note')) {
      let notes = await getNotes();
  
      //console.log('notes:'+JSON.stringify(notes));
  
      //console.log('show notes');
      if(window.CSS) {
        window.CSS.highlights.clear();
      }
      
      const highlight = new Highlight();
      
      for (let note of notes) {
        //one sentence selection could map to multiple node selections
        //let nodeSelections = getNodeSelectionsFromSentenceHashSelection(document, note.selection);
        let nodeSelections;
        let selectionType = note.selection.type;
        if(selectionType === 'paragraph'){
          nodeSelections = getNodeSelectionsFromParagraphHashSelection(article, note.selection);
        } else {
          nodeSelections = getNodeSelectionsFromSentenceHashSelection(article, note.selection);
        }

        for (let nodeSelection of nodeSelections) {
          //console.log('find node selection:' + JSON.stringify(nodeSelection));
          if (nodeSelection) {
            const range = new Range();
            range.setStart(nodeSelection.anchorNode, nodeSelection.anchorOffset);
            range.setEnd(nodeSelection.focusNode, nodeSelection.focusOffset);
  
            highlight.add(range);
          }
        }
      }
      if (highlight.size > 0) {
        window.CSS.highlights.set("user-1-highlight", highlight);
      }
    }
  
    //console.log('resetDocumentAnnotationVisibility end');
  }
function addDocumentEventListener(page, document, currentSiteOption) {  
  gLogger.debug('addDocumentEventListener:' + document.URL);
  let documentInfo = page.getDocumentInfo(document);
  let mouseUpEventListener = documentInfo.mouseUpEventListener;
  if(!mouseUpEventListener){
    gLogger.debug('create mouseUpEventListener');
    mouseUpEventListener = function(event) {
      mouseUpEventListenerWithParams(event, document, currentSiteOption, page.documentArticleMap);
    }
    documentInfo.mouseUpEventListener = mouseUpEventListener;
  }

  gLogger.debug('add mouseup event listener');
  document.addEventListener("mouseup", mouseUpEventListener);

  //DOM mutation changes
  const targetNode = document.body;
  const config = { attributes: false, childList: true, subtree: true };
  
  let mutationObserver = createMutationObserver(document, page);
  documentInfo.mutationObserver = mutationObserver;

  gLogger.debug('start observing document mutation');
  mutationObserver.observe(targetNode, config);

}  

function removeDocumentEventListener(page, document) { 
  gLogger.debug(`disconnect mutation observer of document: ${document.URL}`);
  let documentInfo = page.getDocumentInfo(document);
  let mutationObserver = documentInfo.mutationObserver;
  mutationObserver.disconnect();

  gLogger.debug('remove mouseup event listener');
  let mouseUpEventListener = documentInfo.mouseUpEventListener;
  document.removeEventListener("mouseup", mouseUpEventListener);
  
}


async function preprocessDocument(page, document, isIframe, siteProfile, documentConfig) {
    //console.log('preprocess document');
    let { window } = documentConfig;

    document.body.setAttribute('mea-preprocessed', true);

    if (!findStyleSheet(document)) {
        addMeaStyle(document);
    }

    if (!isIframe) {
        if(!containsVueApp()){
            addVueApp();
            createTooltip(document);
        }        
    }

    let options = getOptionsFromCache();
    let currentSiteOption = await getCurrentSiteOptions();

    let article = null;
    if (documentConfig.canProcess) {


        //console.log('preprocess document');
        
        var x = 0;
        var intervalID = window.setInterval(async function () {

            if (containsMeaStyle(document)) {
                //console.log('containsMeaStyle');
                changeStyle(document, currentSiteOption, siteProfile);
                window.clearInterval(intervalID);
            };

            if (++x === 30) {
                window.clearInterval(intervalID);
            }
        }, 1000);

        //cleanElements(document);

        
        tokenizeTextNode(document, options, currentSiteOption, siteProfile);

        let documentInfo = page.getDocumentInfo(document);
        if(!documentInfo.mouseUpEventListener){
            addDocumentEventListener(page, document, currentSiteOption);
        }else {
            gLogger.debug('already has mouseUpEventListener, skip adding');
        }
        
    
        article = parseDocument(document, options, currentSiteOption);

        //console.log(JSON.stringify(article));
        addWordHoverEventListener(page, document, documentConfig, currentSiteOption);
        
    } else {
        //empty article
        article = parseDocument(document, options, currentSiteOption, true);
    }
    return article;

}

async function cleanDocumentAnnotations(page, document, isIframe, siteProfile, documentConfig) {
    gLogger.debug('clean document annotations '+ document.URL+', isIframe '+isIframe);
    let { window } = documentConfig;

    document.body.removeAttribute('mea-preprocessed');
    document.body.removeAttribute('mea-visible');

    if (findStyleSheet(document)) {
        removeMeaStyle(document);
    }

    if (!isIframe) {
        if(containsVueApp()){
            removeVueApp();
            removeTooltip(document);
        }        
    }

    let options = getOptionsFromCache();
    let currentSiteOption = await getCurrentSiteOptions();

    if (documentConfig.canProcess) {
        detokenizeTextNode(document);

        //mouseup event
        removeDocumentEventListener(page, document);
        
        //no word token at all
        //removeWordHoverEventListener(document, documentConfig, currentSiteOption);
    }
}

async function addWordHoverEventListener(page, document, documentConfig, currentSiteOption) {
  let options = getOptionsFromCache();
  addTooltipEventListener(page, document, documentConfig,
    (word, dictionary) => {
      //console.log(`click tooltip of ${word}`);
      let request = {
        type: 'SELECTION_CHANGE',
        payload: {
          word: word,
          dictionary: dictionary,
          type: 'search-note',            
          selectedText: '',
          sentenceSelection: null,
          paragraphSelection: null,
          notes: [],
        },
      };
      let sender = null;
      let sendResponse = (response) => {
        //console.log(response.message);
      };
      //console.log('selection change:'+JSON.stringify(request));
      sendMessageToEmbeddedApp(request, sender, sendResponse);
      showDialog([MenuItems.Vocabulary]);
    }, 
    currentSiteOption,
    options
  );
}

export { cleanElements, isDocumentAnnotationInitialized, isAllDocumentsAnnotationInitialized, isAnyDocumentsAnnotationInitialized, getAllDocuments, changeStyleForAllDocuments, resetDocumentAnnotationVisibility, addDocumentEventListener, removeDocumentEventListener, preprocessDocument, cleanDocumentAnnotations };