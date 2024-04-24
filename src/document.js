
'use strict';

import { findSiteConfig } from './site-match.js';
import { tranverseElement, tranverseNode } from './dom.js';
import { findStyleSheet, indexOfMeaAnnotation } from './style.js';

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
    tranverseNode(document.body, (node) => {
        if (node.nodeName === '#text') {
            node.textContent = node.textContent.replaceAll(/[`\u2018\u2019]/g, "'");
        }
    });

    //remove text content of some tags
    tranverseElement(document.body, (element) => {
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
    tranverseElement(document.body, (element) => {
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

export { cleanElements, containsMeaStyle, addStyle, isDocumentAnnotationInitialized, isAllDocumentsAnnotationInitialized, getAllDocuments };