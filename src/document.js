
'use strict';

import { traverseElement, traverseNode } from './dom.js';
import { findStyleSheet, changeStyle, indexOfMeaAnnotation } from './style.js';
import { loadKnownWords, } from './vocabularyStore.js';
import { isKnown, } from './language.js';
import {getBaseWordFromElement} from './word.js';
import { getNodeSelectionsFromSentenceHashSelection, getNodeSelectionsFromParagraphHashSelection } from './article.js';
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
    
    //dynamic style
    var style = document.createElement("style");    
    style.id = "mea-style";
    style.innerHTML = `    
      .mea-sentence {
        
        &::before {
          content: '[';
        }
        &::after {
          content: ']';
        }
      }

      .mea-nonword {
        display:inline !important;
      }

      .mea-highlight {  
        position: relative;
        margin-top: 0px;
        text-indent1: 0px;
        display1: inline-block;
      }

      .mea-highlight { 
        &.mea-hide {
          &::after {
            visibility: hidden;
          }
        }

        &:hover, &.mea-hide:hover {
          &::after{
            background-color: white;
            border: solid 1px;
            opacity: 1;
            z-index: 99;
            visibility: visible;

            content: attr(data-footnote);
          }
        }

        &:not([data-parts='']) {
          &:hover, &.mea-hide:hover {
            &::after{
              content: attr(data-footnote) ' [' attr(data-parts) ']';
            }
          }
        } 
      }


      .mea-highlight::after {
        content: attr(data-footnote-short);
        position: absolute;
        width: max-content;
        line-height: normal;
        text-indent: 0px;
        
        white-space: nowrap;
        left: 0;
        top: -1.5em;
        font-size: 0.5em;
        color: grey;
        opacity: 0.5;
        visibility: hidden;
      }




      .mea-toolbar {
        position: absolute;
        visibility: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        width: auto;
        height:auto;
        background: white;
        text-align: center;
        color: black;
        z-index: 100;

      }

      .mea-toolbar-button {
        border: none;
        margin-right: 2px;
        padding:0px;
        padding-inline: none;
        background: white;

        
      }

      .mea-icon {
        width: 16px;
        height: 16px;

      }

      ::highlight(user-1-highlight) {
        background-color: rgb(255, 241, 92);
        color: black;
      }
      #mea-vue-container * {
        all: revert;
      }
      #mea-vue-container {
        border: none;
        border-radius: 10px;
        box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
        width: fit-content;
        height: fit-content;
        padding: 0px;
        #mea-vueapp-iframe {
          width: 400px;
          height: 610px;
          border: none;
        }

        #vue {
          width: 400px;
          
        }
      }

    `;
    document.getElementsByTagName("head")[0].appendChild(style);
    //console.log('add style');
}




function isDocumentAnnotationInitialized(document) {
    if (!document.body) {
        console.log('body is null');
        return false;
    }

    let meaInitialized = document.body.getAttribute('mea-preprocessed');
    if (meaInitialized) {
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

  function changeStyleForAllDocuments(siteProfile, options) {
    let documents = getAllDocuments(siteProfile);
    
    for (let document of documents) {
      changeStyle(document, options, siteProfile);
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
  
        let targetWord = getBaseWordFromElement(element);
  
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

export { cleanElements, containsMeaStyle, addStyle, isDocumentAnnotationInitialized, isAllDocumentsAnnotationInitialized, getAllDocuments, changeStyleForAllDocuments, resetDocumentAnnotationVisibility };