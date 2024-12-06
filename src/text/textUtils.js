'use strict';

function trimPunctuations(text){
    var result = text;
    let array = text.match(/([^,!?(){};"]+)/);
    if(array){
        result = array[0];
    }
    return result;
}

export { trimPunctuations };