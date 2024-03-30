'use strict';

import {loadKnownWords, loadDefaultKnownWords, saveKnownWords} from './vocabularyStore.js';

var gOptions;

async function getDefaultSiteOptions(){

    let options = await loadSiteOptionsFromStorage('default');
    if(!options){
        options = {
            enabled: false,
            annotation: {
                fontSize: 0.4,
                position: 0.5,        
                opacity: 0.5,
                color: '#0000ff',
            }
        };
    }

    //force to false, otherwise all unsaved sites will be enabled by default, bad experience
    options.enabled = false;

    return options;
    
}

function loadSiteOptionsFromStorage(siteDomain){
    return new Promise(resolve => {
        chrome.storage.local.get(['sitesOptions'], (result) => {
            //console.log('load sitesOptions:'+JSON.stringify(result.sitesOptions));
            
            let siteOptions = undefined;
            if(result.sitesOptions){
                siteOptions = result.sitesOptions[siteDomain];
            }
            
            resolve(siteOptions);
        });
    });
}

function saveSiteOptionsToStorage(siteDomain, options){
    
    return new Promise(resolve => {
        chrome.storage.local.get(['sitesOptions'], (result) => {
            let sitesOptions = result.sitesOptions;
            if(!sitesOptions){
                sitesOptions = {};
            }
            sitesOptions[siteDomain] = options;

            let object = {sitesOptions: sitesOptions};
            //console.log('save sitesOptions:'+JSON.stringify(sitesOptions));
            chrome.storage.local.set(object, resolve);
        });
    });    
}

function getOptions(){
    return new Promise(resolve => {
        chrome.storage.local.get(['options'], (result) => {
            let options = result.options;
            if(!options){
                options = {};
            }
            if(!options.rootAndAffix) {
                options.rootAndAffix = {
                    enabled: false,
                };
            }
            if(!options.unknownWords){
                options.unknownWords = [];
            }
            resolve(options);
        });
    });
}

function setOptions(options){
    return new Promise(resolve => {
        let object = {options: options};
        chrome.storage.local.set(object, resolve);
    });    
}


function setSiteOptionsAsDefault(options){
    setSiteOptions('default', options);
}

async function getSiteOptions(siteDomain){
    
    let options = await loadSiteOptionsFromStorage(fixSiteDomain(siteDomain));
    if(!options){
        options = await getDefaultSiteOptions();
    };
    return options;
}

function setSiteOptions(siteDomain, options){
    return saveSiteOptionsToStorage(fixSiteDomain(siteDomain), options);
}

function fixSiteDomain(domain){
    if(!domain){
        return 'nosite';
    }
    return domain;
}

async function initVocabularyIfEmpty(){
    //console.log('initVocabularyIfEmpty');
    let knownWordsResult = await loadKnownWords();
    
    //console.log(JSON.stringify(knownWordsResult));

    if(isEmptyVocabulary(knownWordsResult)){
        //console.log('initVocabulary');
        let knownWordsResult = await loadDefaultKnownWords();
        await saveKnownWords(knownWordsResult);
    }
}

function isEmptyVocabulary(vocabulary){
    if(vocabulary){
        for(let item of vocabulary){
            if(item){
                return false;
            }
        }
    }
    return true;
}

async function initializeOptionService(){
    gOptions = await getOptions();
}

function getOptionsFromCache(){
    return gOptions;
} 
  
export {getOptions, initializeOptionService, getOptionsFromCache, setOptions, getDefaultSiteOptions, getSiteOptions, setSiteOptions, setSiteOptionsAsDefault, initVocabularyIfEmpty};