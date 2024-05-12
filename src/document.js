
'use strict';

import { findSiteConfig } from './site-match/site-match.js';
import { traverseElement, traverseNode } from './dom.js';
import { findStyleSheet, changeStyle, indexOfMeaAnnotation } from './style.js';
import { loadKnownWords, } from './vocabularyStore.js';
import { isKnown, } from './language.js';
import {getBaseWordFromElement} from './word.js';
import { getNodeSelectionsFromSentenceHashSelection } from './article.js';
import { getNotes } from './service/noteService.js';

var knownWords;

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
            node.textContent = node.textContent.replaceAll(/[`\u2018\u2019]/g, "'");
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




function containsMeaStyle(document) {
    let styleSheet = findStyleSheet(document);
    if (styleSheet) {
        let index = indexOfMeaAnnotation(styleSheet);
        if (index >= 0) {
            return true;
        }
    }
    return false;
}


function addStyle(document) {
    var link = document.createElement("link");
    link.href = chrome.runtime.getURL("contentScript.css");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.title = "mea-style";
    document.getElementsByTagName("head")[0].appendChild(link);
    //console.log('add style');
}




function isDocumentAnnotationInitialized(document) {
    if (!document.body) {
        console.log('body is null');
    }

    let meaInitialized = document.body.getAttribute('mea-preprocessed');
    if (meaInitialized) {
        return true;
    }
    else {
        return false;
    }
}

function isAllDocumentsAnnotationInitialized() {
    let documents = getAllDocuments();

    return documents.every((document) => {
        return isDocumentAnnotationInitialized(document);
    });
}

function getAllDocuments() {
    let siteConfig = findSiteConfig(document);
  
    let documents = [document];
  
    for (const config of siteConfig.getIframeDocumentConfigs(document)) {
      if(config.document){
        documents.push(config.document);
      }    
    }
    //console.log('get all documents.');
  
    return documents;
  }

  function changeStyleForAllDocuments(options) {
    let documents = getAllDocuments();
    for (let document of documents) {
      changeStyle(document, options);
    }
  }


/**
 * 
 * reset all word's display attribute according to vocabulary
 */
async function resetDocumentAnnotationVisibility(article, window, enabled, types) {
    let document = window.document;
    //set flag
    document.body.setAttribute('mea-visible', enabled);
  
    if (types.includes('word-definition')) {
      //global var
      knownWords = await loadKnownWords();
  
      //show hide unknown word annotation
      document.querySelectorAll('.mea-word').forEach((element) => {
  
        let targetWord = getBaseWordFromElement(element);
  
        if (enabled) {
  
          if (isKnown(targetWord, knownWords)) {
            element.classList.add("mea-hide");
          } else {
            element.classList.remove("mea-hide");
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
      window.CSS.highlights.clear();
      const highlight = new Highlight();
      
      for (let note of notes) {
        //one sentence selection could map to multiple node selections
        //let nodeSelections = getNodeSelectionsFromSentenceHashSelection(document, note.selection);
        let nodeSelections = getNodeSelectionsFromSentenceHashSelection(article, note.selection);
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
  
  }

export { cleanElements, containsMeaStyle, addStyle, isDocumentAnnotationInitialized, isAllDocumentsAnnotationInitialized, getAllDocuments, changeStyleForAllDocuments, resetDocumentAnnotationVisibility };