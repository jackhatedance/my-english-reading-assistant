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
}

function patch_v_0_10_1(options){
    let otherOptions = options.other;
    if(!otherOptions.additionalDictionaries){
        otherOptions.additionalDictionaries = [];
    }
}

function patch_v_0_10_4(options){
    let annotationOptions = options.annotation;
    if(!annotationOptions.interlaced){
        annotationOptions.interlaced = false;
    }
}

export { patchDefaultSiteOptionValues };