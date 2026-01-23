'use strict';

import { loadKnownWords } from './vocabularyStore.js';
import { initializeCustomDictionaryService } from './dictionary/customDictionary.js';
import { getAllDocuments, isDocumentAnnotationInitialized, resetDocumentAnnotationVisibility } from './document.js';
import { initializeOptionService, getOptionsFromCache } from './service/optionService.js';
import { sendMessageToBackground } from './message.js';
import { searchBookByUrlAsync } from './service/bookService.js';
import { initializeDictionaryService, flushUnrecognizedWords, getUnrecognizedWords } from './service/dictionaryService.js';
import { getTargetWordFromElement } from './word.js';
import { preprocessDocument, cleanDocumentAnnotations } from './document.js'
import { getCurrentSiteOptions, getCurrentSiteOptionsFromCache, initializeCurrentSiteOptionCache } from './current-site-options.js'
import { fixSiteDomain } from './site.js'
import { parseDocument, countUnknownWords } from './article.js'
import { canProcessStep, STEP_PARSE_DOCUMENT } from './document/process.js'

import log from 'loglevel'

const gLogger = log.getLogger("page");

/**
 * 
 * @returns unknownWords, unknownWordsRatio, annotationOptions
 */
async function getPageInfo(siteProfile, documentArticleMap, options) {
    
    if(!options){
        options = { sections: [ 'word' ]};
    }

    let documents = getAllDocuments(siteProfile);

    //word section begin
    let unknownWordMap = new Map();
    let unknownWords;
    let unknownWordsCount = 0;
    let knownWordsCount = 0;
    let totalWordCount = 0;
    let unknownWordsRatio;
    let readingDifficulty;
    if(options.sections.includes('word')) {
        for (let document of documents) {
            let elements = document.querySelectorAll('.mea-word:not(.mea-hide)');

            for (var e of elements) {
                //let targetWord = getTargetWordFromElement(e);
                let base = getTargetWordFromElement(e);

                unknownWordMap.set(base, { base, });
                unknownWordsCount++;
            }

            
            let article = documentArticleMap.get(document);
            totalWordCount += article.wordsCount;
            
        }

        unknownWords = Array.from(unknownWordMap, ([name, value]) => ({ base: name, root: value.root }));

        knownWordsCount = totalWordCount - unknownWordsCount;
        unknownWordsRatio = unknownWordsCount / totalWordCount;
        readingDifficulty = getReadingDifficulty(unknownWordsRatio);
    }
    //word section end

    let isbnsInContent = [];
    for (let document of documents) {
        if(documentArticleMap) {
            let article = documentArticleMap.get(document);
            if(article && article.isbns){
                isbnsInContent.push(...article.isbns);
            }
        }
    }

    
    let visible = isPageAnnotationVisible();
    let siteOptions = await getCurrentSiteOptions(siteProfile);
    let domain = document.location.hostname;
    domain = fixSiteDomain(domain);

    let url = siteProfile.getUrl(document);

    let book = await searchBookByUrlAsync(url);
    
    let isbn = book?.isbn;
    
    let title = document.title;

    let pageInfo = {
        url: url,
        title: title,
        isbn: isbn,
        domain: domain,
        visible: visible,
        siteProfileName: siteProfile.name,
        //word section begin
        totalWordCount: totalWordCount,
        unknownWordsCount: unknownWordsCount,
        unknownWords: unknownWords,
        unknownWordsRatio: unknownWordsRatio,
        readingDifficulty: readingDifficulty,
        //word section end
        siteOptions: siteOptions,
        isbnsInContent: isbnsInContent,
    };
    gLogger.debug('page info:'+JSON.stringify(pageInfo));
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


function isPageAnnotationInitialized() {
    return isDocumentAnnotationInitialized(document)
}

var gServiceInitialized = false;
async function initializeServiceOnlyOnce(siteProfile){
    if(!gServiceInitialized){
        await doInitializeService(siteProfile);
        gServiceInitialized = true;
    }
}

async function doInitializeService(siteProfile){
    await initializeOptionService();
    let options = getOptionsFromCache();

    await initializeCurrentSiteOptionCache(siteProfile);
    let siteOptions = await getCurrentSiteOptionsFromCache();
    //console.log(`get site options:`+ JSON.stringify(siteOptions));
    let additionalDictionaryNames = siteOptions.other.additionalDictionaries;
        
    await initializeCustomDictionaryService(additionalDictionaryNames, ['index'], {});
    
    await initializeDictionaryService(options.unrecognizedWords.enabled);

}

async function initPageAnnotations(page, reuseArticle, refreshOptions) {
    
    const { siteProfile, documentArticleMap } = page;

    //console.log('initPageAnnotations');
    await initializeServiceOnlyOnce(siteProfile);

    let sysOptions = getOptionsFromCache();
    let currentSiteOptions = await getCurrentSiteOptions(siteProfile);
    
    let newDocumentArticleMap = new Map();
    
    var knownWords = await loadKnownWords();
    if (!knownWords) {
        knownWords = [];
    }

    page.startProcessingDocument();

    if (!isDocumentAnnotationInitialized(document)) {
        let documentConfig = siteProfile.getDocumentConfig(window, document);

        let article = getArticle(page, reuseArticle, document, documentConfig, sysOptions, currentSiteOptions, knownWords);

        await preprocessDocument(page, article, document, false, siteProfile, documentConfig, currentSiteOptions, knownWords, refreshOptions);
        newDocumentArticleMap.set(document, article);
    } else {
        let article = documentArticleMap.get(document);
        newDocumentArticleMap.set(document, article);
    }

    let iframeDocumentConfigs = siteProfile.getIframeDocumentConfigs(document);
    //console.log('start iframe annotattion');
    for (var documentConfig of iframeDocumentConfigs) {
        let document = documentConfig.document;
        if (document) {
            if (!isDocumentAnnotationInitialized(document)) {
                //console.log('start iframe preprocess document');
                let article = getArticle(page, reuseArticle, document, documentConfig, sysOptions, currentSiteOptions, knownWords);

                await preprocessDocument(page, article, document, true, siteProfile, documentConfig, currentSiteOptions, knownWords, refreshOptions);
                
                newDocumentArticleMap.set(document, article);
            }else {
                let article = documentArticleMap.get(document);
                newDocumentArticleMap.set(document, article);
            }
        }
    }

    page.stopProcessingDocument();
    
    flushUnrecognizedWords();
    
    //send message to background
    //console.log(`send PAGE_ANNOTATION_INITIALIZED: ${document.title}`);
    let pageInfo = await getPageInfo(siteProfile, newDocumentArticleMap);
    sendMessageToBackground(siteProfile, 'PAGE_ANNOTATION_INITIALIZED', pageInfo);


    return newDocumentArticleMap;
}

function getArticle(page, reuseArticle, document, documentConfig, sysOptions, currentSiteOptions, knownWords){
    let article;
    
    if(reuseArticle == true){
        article = page.documentArticleMap.get(document);
        
        //re-count unknown words
        countUnknownWords(article, knownWords);

        article.originalTextNodes = article.textNodes;
        article.textNodes = [];
        article.textNodeMap = new Map();

        return article;
    }
    
    if (documentConfig.canProcess) {
        if(canProcessStep(documentConfig.processSteps, STEP_PARSE_DOCUMENT)){
            article = parseDocument(document, sysOptions, currentSiteOptions);
        }
    } else {
        //empty article
        article = parseDocument(document, sysOptions, currentSiteOptions, true);
    }
    return article;
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
    sendMessageToBackground(siteProfile, 'PAGE_ANNOTATION_CLEANED');
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
  
    let siteOptions = await getCurrentSiteOptions(siteProfile);

    let windows = getAllWindows(siteProfile);
    for (const window of windows) {
        let document = window.document;
        let article = documentArticleMap.get(document);
        if(article){
            await resetDocumentAnnotationVisibility(article, window, enabled, types, siteOptions);
        }
        
    }    
}

function clearPagePreprocessMark(siteProfile) {
    let documents = getAllDocuments(siteProfile);
  
    documents.forEach((document) => {
      document.body.removeAttribute('mea-preprocessed');
    });
}

export { getPageInfo, initPageAnnotations, cleanPageAnnotations, resetPageAnnotationVisibility, isPageAnnotationVisible, isPageAnnotationInitialized, clearPagePreprocessMark };