'use strict';

import { getSiteOptions, } from './service/optionService.js';
import { tokenizeTextNode, parseDocument, } from './article.js';
import { getAllDocuments, isDocumentAnnotationInitialized, cleanElements, containsMeaStyle, addStyle, resetDocumentAnnotationVisibility } from './document.js';
import { initializeOptionService, } from './service/optionService.js';
import { findSiteConfig } from './site-match.js';
import { sendMessageToBackground } from './message.js';
import { findStyleSheet, changeStyle } from './style.js';
import { addVueApp, addVueAppEventListener, } from './embed/iframe-embed.js';
import { addToolbar } from './toolbar.js';

/**
 * 
 * @returns unknownWords, unknownWordsRatio, annotationOptions
 */
async function getPageInfo() {


    let documents = getAllDocuments();
    let unknownWordMap = new Map();

    let unknownWordsCount = 0;
    let knownWordsCount = 0;
    for (let document of documents) {
        let elements = document.querySelectorAll('.mea-word:not(.mea-hide)');

        for (var e of elements) {
            //let targetWord = getTargetWordFromElement(e);
            let base = e.getAttribute('data-base-word');

            unknownWordMap.set(base, { base, });
            unknownWordsCount++;
        }

        elements = document.querySelectorAll('.mea-word.mea-hide');
        for (var e of elements) {
            knownWordsCount++;
        }
    }

    let unknownWords = Array.from(unknownWordMap, ([name, value]) => ({ base: name, root: value.root }));

    let totalWordCount = unknownWordsCount + knownWordsCount;
    let unknownWordsRatio = unknownWordsCount / totalWordCount;
    let visible = isPageAnnotationVisible();
    let siteOptions = await getCurrentSiteOptions();
    let domain = document.location.hostname;
    if (!domain) {
        domain = 'NULL';
    }
    let pageInfo = {
        domain: domain,
        visible: visible,
        totalWordCount: totalWordCount,
        unknownWordsCount: unknownWordsCount,
        unknownWords: unknownWords,
        unknownWordsRatio: unknownWordsRatio,
        siteOptions: siteOptions,
    };
    //console.log('page info:'+JSON.stringify(pageInfo));
    return pageInfo;
}

function isPageAnnotationVisible() {
    let result = document.body.getAttribute('mea-visible');
    if (result === 'true') {
        return true;
    } else {
        return false;
    }
}


async function getCurrentSiteOptions() {
    let siteDomain = document.location.hostname;
    let options = await getSiteOptions(siteDomain);

    return options;
}


function isPageAnnotationInitialized() {
    return isDocumentAnnotationInitialized(document)
}


async function initPageAnnotations(addDocumentEventListener) {
    //console.log('initPageAnnotations');
    await initializeOptionService();

    let article = null;
    /*
    knownWords = await loadKnownWords();
    if (!knownWords) {
        knownWords = [];
    }
    */

    let siteConfig = findSiteConfig(document);

    if (!isDocumentAnnotationInitialized(document)) {
        let documentConfig = siteConfig.getDocumentConfig(window, document);

        article = await preprocessDocument(document, false, documentConfig, addDocumentEventListener);
    }

    let iframeDocumentConfigs = siteConfig.getIframeDocumentConfigs(document);
    //console.log('start iframe annotattion');
    for (var iframeDocumentConfig of iframeDocumentConfigs) {
        let iframeDocument = iframeDocumentConfig.document;
        if (iframeDocument) {
            if (!isDocumentAnnotationInitialized(iframeDocument)) {
                //console.log('start iframe preprocess document');
                article = await preprocessDocument(iframeDocument, true, iframeDocumentConfig, addDocumentEventListener);
            }
        }
    }


    //send message to background
    //console.log(`send INIT_PAGE_ANNOTATIONS_FINISHED: ${document.title}`);
    sendMessageToBackground(siteConfig, 'INIT_PAGE_ANNOTATIONS_FINISHED', getPageInfo);


    return article;
}


function getAllWindows() {
    let siteConfig = findSiteConfig(document);
  
    let windows = [window];
  
    for (const config of siteConfig.getIframeDocumentConfigs(document)) {
      windows.push(config.window);
    }
  
    return windows;
}

async function resetPageAnnotationVisibility(article, enabled, source, types) {
    //let unknownWordSet = new Set();
    if (!types) {
      types = ['word-definition', 'note'];
    }
  
    for (const window of getAllWindows()) {
      await resetDocumentAnnotationVisibility(article, window, enabled, types);
    }    
}

async function preprocessDocument(document, isIframe, documentConfig, addDocumentEventListener) {

    document.body.setAttribute('mea-preprocessed', true);

    if (!findStyleSheet(document)) {
        addStyle(document);
    }

    if (!isIframe) {
        addVueApp();
        addVueAppEventListener();
    }

    let article = null;
    if (documentConfig.canProcess) {


        //console.log('preprocess document');

        var x = 0;
        var intervalID = setInterval(async function () {

            if (containsMeaStyle(document)) {
                let currentSiteOption = await getCurrentSiteOptions();
                changeStyle(document, currentSiteOption.annotation);
                window.clearInterval(intervalID);
            };

            if (++x === 30) {
                window.clearInterval(intervalID);
            }
        }, 1000);

        cleanElements(document);

        /*
        visitElement(document.body, (element) => {
          //console.log(element.nodeName + element.nodeType);
          annotateChildTextContents(element, isIframe);
        });
        */
        tokenizeTextNode(document);

        addToolbar(document);
        addDocumentEventListener(document);

        article = parseDocument(document);

        //console.log(JSON.stringify(gArticle));

    }
    return article;

}

export { getPageInfo, initPageAnnotations, resetPageAnnotationVisibility, isPageAnnotationVisible, getCurrentSiteOptions, isPageAnnotationInitialized };