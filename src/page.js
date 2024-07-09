'use strict';

import { getSiteOptions, } from './service/optionService.js';
import { tokenizeTextNode, parseDocument, } from './article.js';
import { getAllDocuments, isDocumentAnnotationInitialized, cleanElements, containsMeaStyle, addStyle, resetDocumentAnnotationVisibility } from './document.js';
import { initializeOptionService, } from './service/optionService.js';
import { findSiteProfile } from './site-profile/site-profiles.js';
import { sendMessageToBackground } from './message.js';
import { findStyleSheet, changeStyle } from './style.js';
import { containsVueApp, addVueApp, } from './embed/iframe-embed.js';
import { getIsbn } from './service/pageService.js';

/**
 * 
 * @returns unknownWords, unknownWordsRatio, annotationOptions
 */
async function getPageInfo(siteProfile, documentArticleMap) {
    
    let documents = getAllDocuments(siteProfile);
    let unknownWordMap = new Map();

    let unknownWordsCount = 0;
    let knownWordsCount = 0;
    let isbnsInContent = [];
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

        if(documentArticleMap) {
            let article = documentArticleMap.get(document);
            if(article && article.isbns){
                isbnsInContent.push(article.isbns);
            }
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
    let url = siteProfile.getUrl(document);

    let isbn = await getIsbn(url);
    let title = document.title;

    let pageInfo = {
        url: url,
        title: title,
        isbn: isbn,
        domain: domain,
        visible: visible,
        totalWordCount: totalWordCount,
        unknownWordsCount: unknownWordsCount,
        unknownWords: unknownWords,
        unknownWordsRatio: unknownWordsRatio,
        siteOptions: siteOptions,
        isbnsInContent: isbnsInContent,
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


async function initPageAnnotations(siteProfile, addDocumentEventListener) {
    //console.log('initPageAnnotations');
    await initializeOptionService();

    let documentArticleMap = new Map();
    /*
    knownWords = await loadKnownWords();
    if (!knownWords) {
        knownWords = [];
    }
    */

    if (!isDocumentAnnotationInitialized(document)) {
        let documentConfig = siteProfile.getDocumentConfig(window, document);

        let article = await preprocessDocument(document, false, siteProfile, documentConfig, addDocumentEventListener);
        documentArticleMap.set(document, article);
    }

    let iframeDocumentConfigs = siteProfile.getIframeDocumentConfigs(document);
    //console.log('start iframe annotattion');
    for (var iframeDocumentConfig of iframeDocumentConfigs) {
        let iframeDocument = iframeDocumentConfig.document;
        if (iframeDocument) {
            if (!isDocumentAnnotationInitialized(iframeDocument)) {
                //console.log('start iframe preprocess document');
                let article = await preprocessDocument(iframeDocument, true, siteProfile, iframeDocumentConfig, addDocumentEventListener);
                
                documentArticleMap.set(iframeDocument, article);
            }
        }
    }


    //send message to background
    //console.log(`send INIT_PAGE_ANNOTATIONS_FINISHED: ${document.title}`);
    sendMessageToBackground(siteProfile, 'INIT_PAGE_ANNOTATIONS_FINISHED', getPageInfo, documentArticleMap);


    return documentArticleMap;
}


function getAllWindows(siteProfile) {
    
    let windows = [window];
  
    for (const config of siteProfile.getIframeDocumentConfigs(document)) {
      windows.push(config.window);
    }
  
    return windows;
}

async function resetPageAnnotationVisibility(siteProfile, documentArticleMap, enabled, types) {
    //let unknownWordSet = new Set();
    if (!types) {
      types = ['word-definition', 'note'];
    }
  
    let windows = getAllWindows(siteProfile);
    for (const window of windows) {
        let document = window.document;
        let article = documentArticleMap.get(document);
        if(article){
            await resetDocumentAnnotationVisibility(article, window, enabled, types);
        }
        
    }    
}

async function preprocessDocument(document, isIframe, siteProfile, documentConfig, addDocumentEventListener) {
    //console.log('preprocess document');
    let { window } = documentConfig;

    document.body.setAttribute('mea-preprocessed', true);

    if (!findStyleSheet(document)) {
        addStyle(document);
    }

    if (!isIframe) {
        if(!containsVueApp()){
            addVueApp();
        }        
    }

    let article = null;
    if (documentConfig.canProcess) {


        //console.log('preprocess document');

        var x = 0;
        var intervalID = setInterval(async function () {

            if (containsMeaStyle(document)) {
                let currentSiteOption = await getCurrentSiteOptions();
                changeStyle(document, currentSiteOption.annotation, siteProfile);
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

        addDocumentEventListener(document, documentConfig);
    }
    
    if (documentConfig.canProcess) {
        article = parseDocument(document);

        //console.log(JSON.stringify(article));

    } else {
        //empty article
        article = parseDocument(document, true);
    }
    return article;

}


function clearPagePreprocessMark(siteProfile) {
    let documents = getAllDocuments(siteProfile);
  
    return documents.every((document) => {
      document.body.removeAttribute('mea-preprocessed');
    });
}

export { getPageInfo, initPageAnnotations, resetPageAnnotationVisibility, isPageAnnotationVisible, getCurrentSiteOptions, isPageAnnotationInitialized, clearPagePreprocessMark };