'use strict';


function endsWithDot(text){
    var result = false;
    if(text){
        if(text.match(/.+[.]/)){
            result = true;
        }
    }
    return result;
}

function trimPunctuations(text){
    var result = text;
    // no "'", or "'" in between 
    let array = text.match(/(([^,.…!?()[\]{};:'"*#+=]+['][^,.…!?()[\]{};:'"*#+=]+)|([^,.…!?()[\]{};:'"*#+=]+))\.?/);
    
    if(array){
        result = array[0];
    }

    //if ends with dot, length must less than n
    if(endsWithDot(result) && result.length > 6){
        result = result.slice(0, -1); 
    }

    return result;
}

function sameLengthStandardizeCharacters(text){
    return text.replaceAll(/[‘’`]/g, "'")
        .replaceAll(/[“”]/g, '"')
        .replaceAll(/[∗]/g, '*')    
           
        .replaceAll(/[–]/g, '—')//u2013 to u2014
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




export { endsWithDot, trimPunctuations, sameLengthStandardizeCharacters, variableLengthStandardizeCharacters };