'use strict';
import { SWITCH_MODE_OPTION_OFF } from '../switch-mode.js'
import { PARTIAL_TOKENIZATION_MODE_AUTO } from '../partial-tokenization-mode.js'

const PARTIAL_TOKENIZATION_TOKEN_LENGTH_MIN = 10000;

function createDefaultOptions(){
    return {
        rootAndAffix: {
            enabled: false,
        },
        report: {
            enabled:true,
        },
        dictionary: {
            enabled: false,
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
        },
        partialTokenization:{
            mode: PARTIAL_TOKENIZATION_MODE_AUTO,
        },
        advanced:{
            primaryAnnotationPositionMin: -0.2,
            primaryAnnotationPositionMax: 0.5,
            secondaryAnnotationPositionMin: -1.6,
            secondaryAnnotationPositionMax: -0.8,
            textFontSizeMax: 28,
            maxMeaningNumberMax: 20,
            partialTokenizationTokenLengthMin: PARTIAL_TOKENIZATION_TOKEN_LENGTH_MIN,

            debugLoggers: [],
        },
        annotation: {
            dualAnnotation: {
                enabled: true,
            },
            interlaced: {
                enabled: false,
            },
            hideWordClass: {
                enabled: true,
            },
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
    patch_v_1_11_0(options);
    patch_v_1_12_0(options);
    patch_v_1_17_0(options);
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

function patch_v_1_11_0(options){
    
    if(!options.hasOwnProperty('advanced')){
        options.advanced = {};
    }

    let advancedOptions = options.advanced;
    if(!advancedOptions.hasOwnProperty('primaryAnnotationPositionMin')){
        advancedOptions.primaryAnnotationPositionMin = -0.2;
    }
    if(!advancedOptions.hasOwnProperty('primaryAnnotationPositionMax')){
        advancedOptions.primaryAnnotationPositionMax = 0.5;
    }

    if(!advancedOptions.hasOwnProperty('secondaryAnnotationPositionMin')){
        advancedOptions.secondaryAnnotationPositionMin = -1.6;
    }
    if(!advancedOptions.hasOwnProperty('secondaryAnnotationPositionMax')){
        advancedOptions.secondaryAnnotationPositionMax = -0.8;
    }

    if(!advancedOptions.hasOwnProperty('textFontSizeMax')){
        advancedOptions.textFontSizeMax = 28;
    }

    if(!advancedOptions.hasOwnProperty('partialTokenizationTokenLengthMin')){
        advancedOptions.partialTokenizationTokenLengthMin = PARTIAL_TOKENIZATION_TOKEN_LENGTH_MIN;
    }

    if(!advancedOptions.hasOwnProperty('maxMeaningNumberMax')){
        advancedOptions.maxMeaningNumberMax = 20;
    }

    if(!advancedOptions.hasOwnProperty('debugLoggers')){
        advancedOptions.debugLoggers = [];
    }
    
}


function patch_v_1_12_0(options){
    
    if(!options.hasOwnProperty('annotation')){
        options.annotation = {};
    }

    let annotationOptions = options.annotation;
    if(!annotationOptions.hasOwnProperty('dualAnnotation')){
        annotationOptions.dualAnnotation = {
            enabled:true
        };
    }
    if(!annotationOptions.hasOwnProperty('interlaced')){
        annotationOptions.interlaced ={
            enabled:false
        };
    }

    if(!annotationOptions.hasOwnProperty('hideWordClass')){
        annotationOptions.hideWordClass = {
            enabled:true
        };
    }

}

function patch_v_1_17_0(options){
    
    if(!options.hasOwnProperty('partialTokenization')){
        options.partialTokenization = {};
    }

    let partialTokenizationOptions = options.partialTokenization;
    if(!partialTokenizationOptions.hasOwnProperty('mode')){
        partialTokenizationOptions.mode = PARTIAL_TOKENIZATION_MODE_AUTO;
    }
}

export { createDefaultOptions, patchDefaultOptionValues };