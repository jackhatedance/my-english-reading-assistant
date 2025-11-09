'use strict';
import { SWITCH_MODE_OPTION_ON, SWITCH_MODE_OPTION_OFF } from '../switch-mode.js'

function createFactoryDefaultSiteOptions(){
    return {
        //enabled: false,
        dualAnnotationEnabled: false,
        siteCategory: 'text',
        annotation: {
            content: 'AC_DEFINITION',
            position: 0.0,
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
            textFontSize: 0,
            bionic: {
                enabled: false,
            }
        },
        other:{
            additionalDictionaries: [],
        },
        switch:{
            mode:''
        },
        interaction:{
            clickWord: null,
            hoverWord: null,
            selectText: null,
        }
    };
}
/**
 * make sure all new added fields are not undefined, and assigned with default value
 * 
 * @param {*} option1 
 * @param {*} option2 
 */
function patchDefaultSiteOptionValues(options) {

    patchAll(options);
    //console.log('merged options:'+JSON.stringify(mergedOptions));

}

function patchAll(options) {
    patch_v_0_10_1(options);
    patch_v_0_10_4(options);
    patch_v_0_13_0(options);
    patch_v_0_13_1(options);
    patch_v_0_13_4(options);
    patch_v_1_3_0(options);
    patch_v_1_4_0(options);
    patch_v_1_7_0(options);
}

function patch_v_1_3_0(options){
    let contentOptions = options.content;
    if(!contentOptions.textFontSize){
        contentOptions.textFontSize = 0;
    }
}

function patch_v_0_10_1(options){
    let otherOptions = options.other;
    if(!otherOptions.additionalDictionaries || !Array.isArray(otherOptions.additionalDictionaries)){
        otherOptions.additionalDictionaries = [];
    }
}

function patch_v_0_10_4(options){
    let annotationOptions = options.annotation;
    if(!annotationOptions.interlaced){
        annotationOptions.interlaced = false;
    }
}

function patch_v_0_13_0(options){
    let contentOptions = options.content;
    if(!contentOptions.unknownWordWidth){
        contentOptions.unknownWordWidth = 1;
    }
}

function patch_v_0_13_1(options){

    if(options.dualAnnotationEnabled == null){
        options.dualAnnotationEnabled = false;
    }

    let annotationOptions = options.annotation;
    if(annotationOptions.content == null){
        annotationOptions.content = 'AC_DEFINITION';
    }

    if(options.secondaryAnnotation == null){
        options.secondaryAnnotation = {
            content: 'AC_PRONUNCIATION',
            position: -1,   
            fontSize: 0.3,
            opacity: 0.5,
            color: '#e56910',
            interlaced: false,
        };
    }
}


function patch_v_0_13_4(options){

    if(options.switch == null){
        options.switch = {
            mode: ''
        };
    }

    //migration
    if(options.hasOwnProperty('enabled')){
        let mode = options.enabled ? SWITCH_MODE_OPTION_ON: SWITCH_MODE_OPTION_OFF; 
        options.switch.mode = mode;
        delete options.enabled;
    }
}

function patch_v_1_4_0(options){

    if(options.interaction == null){
        options.interaction = {
            clickWord: null,
            hoverWord: null,
            selectText: null,
        };
    }

    if(options.siteCategory == null){
        options.siteCategory = 'text';
    }

}

function patch_v_1_7_0(options){

    let contentOptions = options.content;
    if(contentOptions.bionic == null){
        contentOptions.bionic = {
            enabled: false,            
        };
    }

}

export { createFactoryDefaultSiteOptions, patchDefaultSiteOptionValues };