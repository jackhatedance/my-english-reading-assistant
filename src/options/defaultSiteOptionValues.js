'use strict';

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

export { patchDefaultSiteOptionValues };