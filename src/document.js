
'use strict';

import log from 'loglevel'
import { loadKnownWords, } from './vocabularyStore.js';
import { isKnown, } from './language.js';
import { getTargetWordFromElement } from './word.js';
import { getNodeSelectionsFromSentenceHashSelection, getNodeSelectionsFromParagraphHashSelection } from './article.js';
import { getNotes } from './service/noteService.js';
import { getCurrentSiteOptions } from './current-site-options.js'
import { mouseUpEventListenerWithParams, mouseMoveEventListenerWithParams } from './document/listener.js'
import { createMutationObserver } from './document/mutation-observer.js'
import { tokenizeTextNode, parseDocument, detokenizeTextNode, parseArticleTextNodes} from './article.js';
import { getOptionsFromCache } from './service/optionService.js';
import { addMeaStyle, removeMeaStyle, findStyleSheet, changeStyle, containsMeaStyle } from './style.js';
import { generateHighlightName, NOTE_HIGHLIGH_TYPE_UNDERLINE, NOTE_HIGHLIGH_COLOR_BLUE } from './style/highlight-style.js';
import { containsVueApp, addVueApp, removeVueApp } from './embed/iframe-embed.js';
import { createTooltip, removeTooltip } from './tooltip.js'
import { addTooltipEventListener } from './tooltip.js'
import { sendMessageToEmbeddedApp } from './embed/iframe-embed.js';
import { showDialog } from './dialog.js' 
import { MenuItems } from './menu.js';
import { TOKEN_TAG } from './html.js'
import { xbbcToText } from './note/note-util.js'
import { sendMessageToBackground } from './message.js'
import { canProcessStep, STEP_CHANGE_MEA_STYLE, STEP_TOKENIZE_TEXT_NODE, STEP_ADD_DOCUMENT_EVENT_LISTENER, STEP_PARSE_DOCUMENT, STEP_ADD_WORD_LISTENER } from './document/process.js'
import { isBionicHighlightedElement } from './bionic/bionic-utils.js'
import { isFeatureEnabled, FEATURE_NOTE } from './feature-toggle.js'
import { isPartialTokenizationEnabled } from './partial-tokenization-mode.js'

var knownWords;

const gLogger = log.getLogger("document");

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
    let sysOptions = getOptionsFromCache();
    let documents = getAllDocuments(siteProfile);
    
    for (let document of documents) {
      changeStyle(document, sysOptions, siteOptions, siteProfile);
    }
  }


/**
 * 
 * reset all word's display attribute according to vocabulary
 */
async function resetDocumentAnnotationVisibility(article, window, enabled, types, siteOptions) {
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
  
  if(isFeatureEnabled(siteOptions, FEATURE_NOTE)){

  
    if (types.includes('note')) {
      let notes = await getNotes();
  
      //console.log('notes:'+JSON.stringify(notes));
  
      //console.log('show notes');
      if(window.CSS) {
        window.CSS.highlights.clear();
      }
      
      const highlightMap = new Map();
      
      //clear data-note
      document.querySelectorAll('mea-token[data-note]').forEach((element) => {
        element.removeAttribute('data-note');
      });

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
  
            let noteHighlight = note.highlight;
            if(!noteHighlight){
              //default
              noteHighlight = { type: NOTE_HIGHLIGH_TYPE_UNDERLINE, backgroundColor: NOTE_HIGHLIGH_COLOR_BLUE, underlineType: 'wavy'};
            }
            let highlightKey = [noteHighlight.type, noteHighlight.backgroundColor, noteHighlight.underlineType].join(',');
            let highlight = highlightMap.get(highlightKey);
            if(!highlight){
              highlight = new Highlight();
              highlightMap.set(highlightKey, highlight);
            }
            highlight.add(range);

            //note
            let element;
            if(isBionicHighlightedElement(nodeSelection.anchorNode.parentElement)){
              element = nodeSelection.anchorNode.parentElement.parentElement;
            }else{
              element = nodeSelection.anchorNode.parentElement;
            }

            if(element.nodeName.toUpperCase() == TOKEN_TAG){
              let text = xbbcToText(note.content);
              if(text.length>20){
                text = text.substring(0,20) + '...';
              }
              element.setAttribute('data-note', text);
            }
          }
        }
      }

      for(const [key, value] of highlightMap){
        let keyParts = key.split(',');
        let type = keyParts[0];
        let backgroundColor = keyParts[1];
        let underlineType = keyParts[2];
        let highlightName = generateHighlightName(type, backgroundColor, underlineType);

        let highlight = value;
        if (highlight.size > 0) {
          window.CSS.highlights.set(highlightName, highlight);
        }
      }
    }
  }
    //console.log('resetDocumentAnnotationVisibility end');
  }
function addDocumentEventListener(page, window, document, documentConfig, options, currentSiteOption) {  
  gLogger.debug('addDocumentEventListener:' + document.URL);
  let documentInfo = page.getDocumentInfo(document);
  let mouseUpEventListener = documentInfo.mouseUpEventListener;
  if(!mouseUpEventListener){
    gLogger.debug('create mouseUpEventListener');
    mouseUpEventListener = function(event) {
      mouseUpEventListenerWithParams(event, document, options, currentSiteOption, page.documentArticleMap, page.siteProfile);
    }
    documentInfo.mouseUpEventListener = mouseUpEventListener;
  }

  gLogger.debug('add mouseup event listener');
  document.addEventListener("mouseup", mouseUpEventListener);


  let mouseMoveEventListener = documentInfo.mouseMoveEventListener;
  if(!mouseMoveEventListener){
    gLogger.debug('create mouseMoveEventListener');
    mouseMoveEventListener = function(event) {
      mouseMoveEventListenerWithParams(event, page, document, documentConfig, options, currentSiteOption);
    }
    documentInfo.mouseMoveEventListener = mouseMoveEventListener;
  }
  gLogger.debug('add mousemove event listener');
  document.addEventListener("mousemove", mouseMoveEventListener); 
  

  //top window and iframe windows all need to send event 
  window.onfocus = () => {
    gLogger.debug('window focus');  
    //console.log("Browser window is in focus");
    sendMessageToBackground(page.siteProfile, 'WINDOW_FOCUS');
  };

  window.onblur = () => {
    //console.log("Browser window has lost focus");
    gLogger.debug('window blur');

    const topDocument = window.top.document;
    if(topDocument.hasFocus()){
      gLogger.debug('tab still has focus');
    }else{
      gLogger.debug('tab lost focus');
      sendMessageToBackground(page.siteProfile, 'WINDOW_BLUR');
    }    
  };
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
  
  gLogger.debug('remove mousemove event listener');
  let mouseMoveEventListener = documentInfo.mouseMoveEventListener;
  document.removeEventListener("mousemove", mouseMoveEventListener);
}


async function preprocessDocument(page, document, isIframe, siteProfile, documentConfig, knownWords) {
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

    let sysOptions = getOptionsFromCache();
    let currentSiteOption = await getCurrentSiteOptions(siteProfile);

    let article = null;
    if (documentConfig.canProcess) {

      if(canProcessStep(documentConfig.processSteps, STEP_CHANGE_MEA_STYLE)){
        //console.log('preprocess document');
        
        var x = 0;
        var intervalID = window.setInterval(async function () {

            if (containsMeaStyle(document)) {
                //console.log('containsMeaStyle');
                changeStyle(document, sysOptions, currentSiteOption, siteProfile);
                window.clearInterval(intervalID);
            };

            if (++x === 30) {
                window.clearInterval(intervalID);
            }
        }, 1000);
      }
      
      if(canProcessStep(documentConfig.processSteps, STEP_PARSE_DOCUMENT)){
        article = parseDocument(document, sysOptions, currentSiteOption);
      }

      if(canProcessStep(documentConfig.processSteps, STEP_TOKENIZE_TEXT_NODE)){
        tokenizeTextNode(document, article, sysOptions, currentSiteOption, siteProfile);
      }

      if(canProcessStep(documentConfig.processSteps, STEP_ADD_DOCUMENT_EVENT_LISTENER)){
        let documentInfo = page.getDocumentInfo(document);
        if(!documentInfo.mouseUpEventListener){
            addDocumentEventListener(page, window, document, documentConfig, sysOptions, currentSiteOption);
        }else {
            gLogger.debug('already has mouseUpEventListener, skip adding');
        }
      }
    
      if(canProcessStep(documentConfig.processSteps, STEP_PARSE_DOCUMENT)){
        parseArticleTextNodes(article, document.body, sysOptions, currentSiteOption);
      }

      if(canProcessStep(documentConfig.processSteps, STEP_ADD_WORD_LISTENER)){
        //console.log(JSON.stringify(article));
        addWordEventListener(page, document, documentConfig, currentSiteOption);
      }
    } else {
        //empty article
        article = parseDocument(document, sysOptions, currentSiteOption, true);
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

    if (documentConfig.canProcess) {
        detokenizeTextNode(document);

        //mouseup event
        removeDocumentEventListener(page, document);
        
        //no word token at all
        //removeWordHoverEventListener(document, documentConfig, currentSiteOption);
    }
}

async function addWordEventListener(page, document, documentConfig, currentSiteOption) {
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
          selectedNotes: [],
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

export { isDocumentAnnotationInitialized, isAllDocumentsAnnotationInitialized, isAnyDocumentsAnnotationInitialized, getAllDocuments, changeStyleForAllDocuments, resetDocumentAnnotationVisibility, removeDocumentEventListener, preprocessDocument, cleanDocumentAnnotations };