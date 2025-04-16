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
    // first or last char cannot be punctuation, some punctuations ('.-) allowed in between
    let array = text.match(/(([^,.…!?()[\]{};:'"*#+-=][^,…!?()[\]{};:"*#+=]+[^,.…!?()[\]{};:'"*#+-=])|([^,.…!?()[\]{};:'"*#+-=]+))\.?/);
    
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


function createBlankMask(str) {
    return " ".repeat(str.length);
}

function containsMaskedChars(str){
    return str && str.includes('#');
}

function replaceMaskedChars(str, mask, char){
    let result ='';
    for(let i=0;i<str.length;i++){
        if(mask[i] !== '#'){
            result = result + str[i];
        } else {
            result = result + char;
        }
    }
    return result;
}

function removeMaskedChars(str, mask){
    return replaceMaskedChars(str, mask, '')
}

function removeParentheses(text){
    if(!text){
        return text;
    }
    text = text.replace(/（/, '(');
    text = text.replace(/）/, ')');

    text = text.replace(/［/, '(');
    text = text.replace(/］/, ')');

    text = text.replace(/〈/, '(');
    text = text.replace(/〉/, ')');

    text = text.replace(/【/, '(');
    text = text.replace(/】/, ')');
    
    
    return text.replaceAll(/(\([^\)]*\))/g, '');
}


export { endsWithDot, trimPunctuations, sameLengthStandardizeCharacters, variableLengthStandardizeCharacters, createBlankMask, containsMaskedChars, replaceMaskedChars, removeMaskedChars, removeParentheses };