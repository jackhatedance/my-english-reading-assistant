'use strict';

function patchDefaultOptionValues(options) {
    
    patchAll(options);
}

function patchAll(options) {
    patch_v_0_10_1(options);
    patch_v_0_11_1(options);
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

function patch_v_0_11_1(options){
    let dictionaryOptions = options.dictionary;
    if(!dictionaryOptions.hasOwnProperty('automigration')){
        dictionaryOptions.automigration = true;
    }
    
    if(!options.hasOwnProperty('pronunciation')){
        options.pronunciation = {};
    }

    let pronunciationOptions = options.pronunciation;
    if(!pronunciationOptions.hasOwnProperty('region')){
        pronunciationOptions.region = 'us';
    }
}

export { patchDefaultOptionValues };