'use strict';

import {loadKnownWords, loadDefaultKnownWords, saveKnownWords} from '../vocabularyStore.js';
import { createDefaultOptions, patchDefaultOptionValues } from '../options/defaultOptionValues.js';


var gOptions;

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


export {getOptions, initializeOptionService, getOptionsFromCache, refreshOptionsCache, setOptions, updateOptions, initVocabularyIfEmpty, };