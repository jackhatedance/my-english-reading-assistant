'use strict';

import { getSiteOptions, } from './service/optionService.js';
import { initializeCustomDictionaryService } from './dictionary/customDictionary.js';
import { tokenizeTextNode, parseDocument, detokenizeTextNode} from './article.js';
import { getAllDocuments, isDocumentAnnotationInitialized, cleanElements, containsMeaStyle, addStyle, removeMeaStyle, resetDocumentAnnotationVisibility } from './document.js';
import { initializeOptionService, getOptionsFromCache } from './service/optionService.js';
import { sendMessageToBackground } from './message.js';
import { findStyleSheet, changeStyle } from './style.js';
import { containsVueApp, addVueApp, removeVueApp } from './embed/iframe-embed.js';
import { getIsbn } from './service/pageService.js';
import { initializeDictionaryService, flushUnrecognizedWords, getUnrecognizedWords } from './service/dictionaryService.js';
import { createTooltip, removeTooltip } from './tooltip.js'
import { getTargetWordFromElement } from './word.js';
import { addDocumentEventListener, removeDocumentEventListener } from './document.js'
import { addWordHoverEventListener } from './document/document-listener.js'
import log from 'loglevel'

const gLogger = log.getLogger("page");
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
            let base = getTargetWordFromElement(e);

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
    let readingDifficulty = getReadingDifficulty(unknownWordsRatio);
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
        readingDifficulty: readingDifficulty,
        siteOptions: siteOptions,
        isbnsInContent: isbnsInContent,
    };
    //console.log('page info:'+JSON.stringify(pageInfo));
    return pageInfo;
}

/**
 * easy, normal, hard
 */
function getReadingDifficulty(unknownWordRatio) {
    //console.log('unknownWordRatio:'+unknownWordRatio);

    let result = 'HARD';

    if(unknownWordRatio < 0.03){
        result = 'EASY';    
    } else if(unknownWordRatio < 0.05){
        result = 'NORMAL';    
    }

    return result;
}

function isPageAnnotationVisible() {
    let result = document.body.getAttribute('mea-visible');
    if (result === 'true') {
        return true;
    } else {
        return false;
    }
}

/**
 * DON'T import it from popup.js, I don't know why. otherwise the project cannot be built.
 * @returns 
 */
async function getCurrentSiteOptions() {
    let siteDomain = document.location.hostname;
    let options = await getSiteOptions(siteDomain);

    return options;
}


function isPageAnnotationInitialized() {
    return isDocumentAnnotationInitialized(document)
}

var gServiceInitialized = false;
async function initializeServiceOnlyOnce(){
    if(!gServiceInitialized){
        await doInitializeService();
        gServiceInitialized = true;
    }
}

async function doInitializeService(){
    await initializeOptionService();
    let options = getOptionsFromCache();

    let siteOptions = await getCurrentSiteOptions();
    //console.log(`get site options:`+ JSON.stringify(siteOptions));
    let additionalDictionaryNames = siteOptions.other.additionalDictionaries;
        
    await initializeCustomDictionaryService(additionalDictionaryNames, ['index'], {});
    
    await initializeDictionaryService(options.unrecognizedWords.enabled);

}

async function initPageAnnotations(page) {
    
    const { siteProfile, documentArticleMap } = page;

    //console.log('initPageAnnotations');
    await initializeServiceOnlyOnce();

    let newDocumentArticleMap = new Map();
    /*
    knownWords = await loadKnownWords();
    if (!knownWords) {
        knownWords = [];
    }
    */

    if (!isDocumentAnnotationInitialized(document)) {
        let documentConfig = siteProfile.getDocumentConfig(window, document);

        let article = await preprocessDocument(page, document, false, siteProfile, documentConfig);
        newDocumentArticleMap.set(document, article);
    } else {
        let article = newDocumentArticleMap.get(document);
        newDocumentArticleMap.set(document, article);
    }

    let iframeDocumentConfigs = siteProfile.getIframeDocumentConfigs(document);
    //console.log('start iframe annotattion');
    for (var iframeDocumentConfig of iframeDocumentConfigs) {
        let iframeDocument = iframeDocumentConfig.document;
        if (iframeDocument) {
            if (!isDocumentAnnotationInitialized(iframeDocument)) {
                //console.log('start iframe preprocess document');
                let article = await preprocessDocument(page, iframeDocument, true, siteProfile, iframeDocumentConfig);
                
                newDocumentArticleMap.set(iframeDocument, article);
            }else {
                let article = documentArticleMap.get(iframeDocument);
                newDocumentArticleMap.set(iframeDocument, article);
            }
        }
    }

    flushUnrecognizedWords();
    
    //send message to background
    //console.log(`send INIT_PAGE_ANNOTATIONS_FINISHED: ${document.title}`);
    sendMessageToBackground(siteProfile, 'INIT_PAGE_ANNOTATIONS_FINISHED', getPageInfo, documentArticleMap);


    return newDocumentArticleMap;
}

async function cleanPageAnnotations(page){
    const { siteProfile } = page; 
    
    gLogger.debug('cleanPageAnnotations');
    if (isDocumentAnnotationInitialized(document)) {
        let documentConfig = siteProfile.getDocumentConfig(window, document);

        await cleanDocumentAnnotations(page, document, false, siteProfile, documentConfig);
        //documentArticleMap.set(document, article);
    }

    let iframeDocumentConfigs = siteProfile.getIframeDocumentConfigs(document);
    //console.log('start iframe annotattion');
    for (var iframeDocumentConfig of iframeDocumentConfigs) {
        let iframeDocument = iframeDocumentConfig.document;
        if (iframeDocument) {
            if (isDocumentAnnotationInitialized(iframeDocument)) {
                //console.log('start iframe preprocess document');
                await cleanDocumentAnnotations(page, iframeDocument, true, siteProfile, iframeDocumentConfig);
                //documentArticleMap.set(iframeDocument, article);
            }
        }
    }
    //return documentArticleMap;
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

async function preprocessDocument(page, document, isIframe, siteProfile, documentConfig) {
    //console.log('preprocess document');
    let { window } = documentConfig;

    document.body.setAttribute('mea-preprocessed', true);

    if (!findStyleSheet(document)) {
        addStyle(document);
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

function clearPagePreprocessMark(siteProfile) {
    let documents = getAllDocuments(siteProfile);
  
    return documents.every((document) => {
      document.body.removeAttribute('mea-preprocessed');
    });
}

export { getPageInfo, initPageAnnotations, cleanPageAnnotations, resetPageAnnotationVisibility, isPageAnnotationVisible, getCurrentSiteOptions, isPageAnnotationInitialized, clearPagePreprocessMark };