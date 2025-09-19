'use strict';

import {loadKnownWords, loadDefaultKnownWords, saveKnownWords} from '../vocabularyStore.js';
import { createDefaultOptions, patchDefaultOptionValues } from '../options/defaultOptionValues.js';
import { createFactoryDefaultSiteOptions, patchDefaultSiteOptionValues } from '../options/defaultSiteOptionValues.js';
import assign from 'assign-deep'

var gOptions;

async function getDefaultSiteOptions(){

    let options = await loadSiteOptionsFromStorage('default');
    if(!options){
        options = createFactoryDefaultSiteOptions();
    }
    
    //exclude enable section
    //delete options.enable;

    
    patchDefaultSiteOptionValues(options);
    //force to false, otherwise all unsaved sites will be enabled by default, bad experience
    //options.enabled = false;

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
                options = createDefaultOptions();
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

function getEffectiveSiteOptions(siteOptions, defaultSiteOptions){
    let effectiveOptions = assign(defaultSiteOptions, siteOptions);

    patchDefaultSiteOptionValues(effectiveOptions);

    //migrateSiteOptions(effectiveOptions);

    return effectiveOptions;
}

async function getSiteOptions(siteDomain){
    
    let options = await loadSiteOptionsFromStorage(fixSiteDomain(siteDomain));
    if(!options){
        options ={};
    }

    let defaultSiteOptions = await getDefaultSiteOptions();
    
    
    let effectiveOptions = getEffectiveSiteOptions(options, defaultSiteOptions);

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

export {getOptions, initializeOptionService, getOptionsFromCache, refreshOptionsCache, setOptions, updateOptions, getDefaultSiteOptions, getSiteOptions, setSiteOptions, setSiteOptionsAsDefault, initVocabularyIfEmpty, getSimplifyDefinitionOptions, createSimplifyDefinitionOptions, getEffectiveSiteOptions};