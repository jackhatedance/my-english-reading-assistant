'use strict';

function createDefaultOptions(){
    return {
        rootAndAffix: {
            enabled: false,
        },
        report: {
            enabled:false,
        },
        dictionary: {
            enabled:false,
            dictionaries:[]
        },
        unrecognizedWords: { 
            enabled:false
        },
        enable: {
            auto: 'none'
        }
    };
}

function patchDefaultOptionValues(options) {
    
    patchAll(options);
}

function patchAll(options) {
    earlyPatch(options);
    patch_v_0_10_1(options);
    patch_v_0_11_1(options);
    patch_v_0_13_4(options);
}

function earlyPatch(options){
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

function patch_v_0_13_4(options){
    
    if(!options.hasOwnProperty('enable')){
        options.enable = {};
    }

    let enableOptions = options.enable;
    if(!enableOptions.hasOwnProperty('auto')){
        enableOptions.auto = 'none';
    }
}

export { createDefaultOptions, patchDefaultOptionValues };