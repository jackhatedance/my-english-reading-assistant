'use strict';

function trimPunctuations(text){
    var result = text;
    let array = text.match(/([a-zA-ZÀ-ÿ]+['’&.\-]?)+/);
    if(array){
        result = array[0];
    }
    return result;
}

export { trimPunctuations };