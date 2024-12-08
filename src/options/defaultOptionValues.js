'use strict';

function patchDefaultOptionValues(options) {
    
    patchAll(options);
}

function patchAll(options) {
    patch_v_0_10_1(options);
}

function patch_v_0_10_1(options){
    let dictionaryOptions = options.dictionary;
    if(dictionaryOptions.additionalDictionaryEnabled === null){
        dictionaryOptions.additionalDictionaryEnabled = false;
    }
    if(!dictionaryOptions.additionalDictionaries){
        dictionaryOptions.additionalDictionaries = [];
    }
}

export { patchDefaultOptionValues };