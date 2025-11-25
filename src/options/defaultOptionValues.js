'use strict';
import { SWITCH_MODE_OPTION_OFF } from '../switch-mode.js'

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
        switch: {
            mode: SWITCH_MODE_OPTION_OFF
        },
        interaction: {
            clickWord: true,
            hoverWord: true,
            selectText: true
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
    patch_v_1_4_0(options);
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
    /* additionalDictionaryEnabled was removed since v1.3.1. it is always true.
    if(dictionaryOptions.additionalDictionaryEnabled == null){
        dictionaryOptions.additionalDictionaryEnabled = true;
    }
         */
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
    
    if(!options.hasOwnProperty('switch')){
        options.switch = {};
    }

    let switchOptions = options.switch;
    if(!switchOptions.hasOwnProperty('mode')){
        switchOptions.mode = SWITCH_MODE_OPTION_OFF;
    }
}

function patch_v_1_4_0(options){
    
    if(!options.hasOwnProperty('interaction')){
        options.interaction = {};
    }

    let interactionOptions = options.interaction;
    if(!interactionOptions.hasOwnProperty('clickWord')){
        interactionOptions.clickWord = true;
    }
    if(!interactionOptions.hasOwnProperty('hoverWord')){
        interactionOptions.hoverWord = true;
    }
    if(!interactionOptions.hasOwnProperty('selectText')){
        interactionOptions.selectText = true;
    }
}

export { createDefaultOptions, patchDefaultOptionValues };