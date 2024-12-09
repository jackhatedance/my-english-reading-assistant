'use strict';

function trimPunctuations(text){
    var result = text;
    // no "'", or "'" in between 
    let array = text.match(/(([^,.…!?()[\]{};:'"*#+=]+['][^,.…!?()[\]{};:'"*#+=]+)|([^,.…!?()[\]{};:'"*#+=]+))\.?/);
    
    if(array){
        result = array[0];
    }
    return result;
}

function sameLengthStandardizeCharacters(text){
    return text.replaceAll(/[‘’]/g, "'")
        .replaceAll(/[“”]/g, '"')
        .replaceAll(/[∗]/g, '*')    
           
        ;
    
}

function variableLengthStandardizeCharacters(text){
    return text.replaceAll(/[ﬁ]/g, "fi")
        .replaceAll(/[ﬂ]/g, "fl")

        .replaceAll(/a¨/g, "ä")
        .replaceAll(/o¨/g, "ö")
        .replaceAll(/u¨/g, "ü")
        ;
    
}




export { trimPunctuations, sameLengthStandardizeCharacters, variableLengthStandardizeCharacters };