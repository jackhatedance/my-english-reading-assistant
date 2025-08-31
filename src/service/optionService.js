'use strict';

import {loadKnownWords, loadDefaultKnownWords, saveKnownWords} from '../vocabularyStore.js';
import { patchDefaultOptionValues } from '../options/defaultOptionValues.js';
import { patchDefaultSiteOptionValues } from '../options/defaultSiteOptionValues.js';

var gOptions;

async function getDefaultSiteOptions(){

    let options = await loadSiteOptionsFromStorage('default');
    if(!options){
        options = {
            enabled: false,
            dualAnnotationEnabled: false,
            annotation: {
                content: 'AC_DEFINITION',
                position: 0.1,
                fontSize: 0.3,
                opacity: 0.5,
                color: '#0000ff',
                interlaced: false,
                
                lineHeight: 1.2,
                maxMeaningNumber: 3,
                hideWordClass: false,
            },
            secondaryAnnotation: {
                content: 'AC_PRONUNCIATION',
                position: -1,   
                fontSize: 0.3,
                opacity: 0.5,
                color: '#e56910',
                interlaced: false,
            },
            content: {
                enabled: false,
                unknownWordColor: '#0000ff',
                unknownWordWidth: 1,
            },
            other:{
                additionalDictionaries: [],
            }
        };
    }
    
    patchDefaultSiteOptionValues(options);
    //force to false, otherwise all unsaved sites will be enabled by default, bad experience
    options.enabled = false;

    return options;
    
}

/**
 * make sure all new added fields are not undefined, and assigned with default value
 * 
 * @param {*} option1 
 * @param {*} option2 
 */
function assignDefaultValues(options, defaultOptions) {
    
    options.annotation = Object.assign({}, defaultOptions.annotation, options.annotation);
    options.content = Object.assign({}, defaultOptions.content, options.content);
    options.other = Object.assign({}, defaultOptions.other, options.other);

    let mergedOptions = Object.assign({}, defaultOptions, options);
    //console.log('merged options:'+JSON.stringify(mergedOptions));
    return mergedOptions;
    
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
    //console.log('save site options, domain:'+siteDomain+',options:'+options);
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
            
            if(!options.report){
                options.report = {
                    enabled:false,
                };
            }
            if(!options.dictionary){
                options.dictionary = {
                    enabled:false,
                    dictionaries:[]
                };
            }

            if(!options.unrecognizedWords){
                options.unrecognizedWords = { enabled:false};
            }

            patchDefaultOptionValues(options);
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

async function updateOptions(newOptions) {
    let current = await getOptions();
    const merged = Object.assign(current, newOptions);
    await setOptions(merged);
}


function setSiteOptionsAsDefault(options){
    setSiteOptions('default', options);
}

async function getSiteOptions(siteDomain){
    
    let options = await loadSiteOptionsFromStorage(fixSiteDomain(siteDomain));
        if(!options){
        options ={};
    }

    let defaultOptions = await getDefaultSiteOptions();
    
    
    let effectiveOptions = assignDefaultValues(options, defaultOptions);

    patchDefaultSiteOptionValues(effectiveOptions);
    return effectiveOptions;
}

function setSiteOptions(siteDomain, options){
    return saveSiteOptionsToStorage(fixSiteDomain(siteDomain), options);
}

function fixSiteDomain(domain){
    if(!domain){
        return 'NULL';
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
    //console.log('initialize gOptions:'+JSON.stringify(gOptions));
}

async function refreshOptionsCache(){
    gOptions = await getOptions();
    //console.log('refresh gOptions:'+JSON.stringify(gOptions));
}

function getOptionsFromCache(){
    if(!gOptions){
        console.error('gOptions cache is null');
    }
    return gOptions;
} 

function getSimplifyDefinitionOptions(siteOptions){
    let simplifyDefinitionOptions = {
        hideWordClass: siteOptions.annotation.hideWordClass,
        maxMeaningNumber: siteOptions.annotation.maxMeaningNumber,
    };
    return simplifyDefinitionOptions;
}

function createSimplifyDefinitionOptions(maxMeaningNumber = 6, hideWordClass = false){
    let simplifyDefinitionOptions = {
        hideWordClass: hideWordClass,
        maxMeaningNumber: maxMeaningNumber,
    };
    return simplifyDefinitionOptions;
}

export {getOptions, initializeOptionService, getOptionsFromCache, refreshOptionsCache, setOptions, updateOptions, getDefaultSiteOptions, getSiteOptions, setSiteOptions, setSiteOptionsAsDefault, initVocabularyIfEmpty, getSimplifyDefinitionOptions, createSimplifyDefinitionOptions};