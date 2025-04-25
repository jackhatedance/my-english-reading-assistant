'use strict';
import parse from 'parenthesis'

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
        .replaceAll(/[ﬀ]/g, "ff")
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

function containsParenthesesPunctuations(text){
    if(!text){
        return false;
    }

    let punctuations = ['(', '[', '<'];
    let findResult = punctuations.find(item => text.includes(item));
    return findResult != null;
}

function standardizeParenthesesPunctuations(text){
    text = text.replaceAll(/（/g, '(');
    text = text.replaceAll(/）/g, ')');

    text = text.replaceAll(/［/g, '[');
    text = text.replaceAll(/］/g, ']');

    text = text.replaceAll(/〈/g, '<');
    text = text.replaceAll(/〉/g, '>');

    text = text.replaceAll(/【/g, '[');
    text = text.replaceAll(/】/g, ']');
    
    return text;
}


function standardizePunctuations(text){
    text = standardizeParenthesesPunctuations(text);

    text = text.replaceAll(/：/g, ':');
    text = text.replaceAll(/！/g, '!');

    text = text.replaceAll(/；/g, ';');
    text = text.replaceAll(/，/g, ',');

    text = text.replaceAll(/。/g, '.');
    
    return text;
}

function removeParentheses(text){
    if(!text){
        return text;
    }
    text = standardizeParenthesesPunctuations(text);
    
    let tokens = parse(text, { brackets: ['{}', '[]', '()', '<>']});
    if(tokens){
        tokens = tokens.filter(item => !Array.isArray(item));
        text = tokens.join('');
    }
    
    
    return text.replaceAll(/[{}[\]()<>]/g, '');
}

function getAllTextContent(token){
    if(!Array.isArray(token)){
        return token;
    }else{
        let array = token;
        let texts = [];
        for(let token of array){
            let text = getAllTextContent(token);
            texts.push(text);
        }
        return texts.join('');
    }
}

function splitButIgnoreParentheses(text, separater){
    if(!containsParenthesesPunctuations(text)){
        return text.split(separater);
    }

    let tokens = parse(text, { brackets: ['{}', '[]', '()', '<>']});
    //console.log(tokens);

    let result = [];
    if(tokens){
        let part='';
        for(let token of tokens){
            if(Array.isArray(token)){
                let tokenText = getAllTextContent(token);
                part = part + tokenText;
            }else {
                for(let char of token){
                    if(char == separater){
                        result.push(part);
                        part = '';
                    }else{
                        part = part + char;
                    }
                }
            }            
        }
        result.push(part);
    }
    return result;
}


export { endsWithDot, trimPunctuations, sameLengthStandardizeCharacters, variableLengthStandardizeCharacters, createBlankMask, containsMaskedChars, replaceMaskedChars, removeMaskedChars, standardizeParenthesesPunctuations, standardizePunctuations, removeParentheses, splitButIgnoreParentheses };