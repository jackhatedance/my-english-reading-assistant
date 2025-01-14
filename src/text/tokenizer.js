import { trimPunctuations, sameLengthStandardizeCharacters } from './textUtils.js';
import { identifyWord } from './identify-word.js';

function tokenize(checkWord, sentence, offsetOfArticle, newLinePositions = []) {
    //split by space, dash (dash is not hyphen)
    const regexp = /([^\s—]+)|([\s—]+)/g;
    let parts = _splitTextByRegex(sentence, regexp, 0);

    parts = splitPartsTextByNewLines(checkWord, parts, offsetOfArticle, newLinePositions);
    //console.log(parts);
    parts = splitCompoundWord(checkWord, parts);

    parts = splitCamelWords(checkWord, parts);

    parts = splitSlashWords(checkWord, parts);

    parts = trimWords(checkWord, parts);

    parts = detectAbbreviationWords(checkWord, parts);

    return parts;
}

function splitCamelWords(checkWord, parts){
    let parts2 = [];
    for(const part of parts){
        let content = part.content;
        //console.log(content);        
        let contentWithoutPunctuation = trimPunctuations(content);
        if(isCamelWord(contentWithoutPunctuation)){
            //console.log('camel world')
            //step 1: check original word
            let checkWordResult = checkWord(contentWithoutPunctuation);            
            if(checkWordResult){
                part.content = checkWordResult;
                parts2.push(part);
            } else {
                
                //step 2: split compound word
                const regexp2 = /([A-Z][^A-Z\s]+)/g;
                let subParts = _splitTextByRegex(content, regexp2, part.offset);
                for(const subPart of subParts){
                    parts2.push(subPart);
                }
            

            }                
        
        } else {
            parts2.push(part);
        }
    }

    return parts2;
}

function splitSlashWords(checkWord, parts){
    let parts2 = [];
    for(const part of parts){
        let content = part.content;
        let contentWithoutPunctuation = trimPunctuations(content);
        if(containsSlash(contentWithoutPunctuation)){
            //console.log('slash world')
            //step 1: check original word
            let checkWordResult = checkWord(contentWithoutPunctuation);            
            if(checkWordResult){
                part.content = checkWordResult;
                parts2.push(part);
            } else {
                
                //step 2: split word
                const regexp2 = /([/])|([^/]+)/g;
                let subParts = _splitTextByRegex(content, regexp2, part.offset);
                for(const subPart of subParts){
                    parts2.push(subPart);
                }

            }                
        
        } else {
            parts2.push(part);
        }
    }

    return parts2;
}

function splitCompoundWord(checkWord, parts){
    let parts2 = [];
    for(const part of parts){
        let content = part.content;
        //console.log(content);        
        let contentWithoutPunctuation = trimPunctuations(content);
        if(containsHyphen(contentWithoutPunctuation)){
            //step 1: check original word
            let checkWordResult = checkWord(contentWithoutPunctuation);            
            if(checkWordResult){
                part.content = checkWordResult;
                parts2.push(part);
            } else {
                //step 2: eliminate hyphen then check word
                const contentWithoutPunctuationAndHyphen = contentWithoutPunctuation.replaceAll(/[-]/g, '');
                checkWordResult = checkWord(contentWithoutPunctuationAndHyphen);  
                if(checkWordResult){
                    part.content = checkWordResult;
                    parts2.push(part);
                } else {
                    //step 3: split compound word by hyphen
                    const regexp2 = /([-])|([^-]+)/g;
                    let subParts = _splitTextByRegex(content, regexp2, part.offset);
                    for(const subPart of subParts){
                        parts2.push(subPart);
                    }
                }

            }                
        
        } else {
            parts2.push(part);
        }
    }

    return parts2;
}


function trimWords(checkWord, parts){
    let parts2 = [];
    for(const part of parts){
            
        
        let originalContent = part.content;
        
        //console.log("originalContent:"+originalContent);
        
        let options = { };
        let transforms = ['punctuation', 'apostrophe'];

        let guessResult = identifyWord(originalContent, options, checkWord, transforms);
        //console.log("guessResult:"+JSON.stringify(guessResult));
        if(guessResult){
            part.content = guessResult.content;
        }        

        parts2.push(part);
    
    }

    return parts2;
}

function detectAbbreviationWords(checkWord, parts){
    let parts2 = [];
    for(const part of parts){
            
        
        let originalContent = part.content;
        
        //console.log("originalContent:"+originalContent);
        
        let options = { };
        let transforms = ['abbreviation'];

        let guessResult = identifyWord(originalContent, options, checkWord, transforms);
        //console.log("guessResult:"+JSON.stringify(guessResult));
        if(guessResult){
            part.content = guessResult.content;
        }        

        parts2.push(part);
    
    }

    return parts2;
}

function _splitTextByRegex(originalSentence, regexp, baseIndex) {
    let parts = [];

   
    let sentence = sameLengthStandardizeCharacters(originalSentence);
    
    const str = sentence;
    const matches = str.matchAll(regexp);

    for (const match of matches) {
        let contentWithoutPunctuation = trimPunctuations(match[0]);
        let originalContent = originalSentence.substring(match.index, match.index + match[0].length);
        //console.log('contentWithoutPunctuation:'+contentWithoutPunctuation);
        let part = {
            originalContent: originalContent,
            content:contentWithoutPunctuation,
            //relative to sentence
            offset: match.index + baseIndex,
            length: match[0].length,
        };
        parts.push(part);
    }

    return parts;
}

function splitPartsTextByNewLines(checkWord, parts, sentenceOffsetOfArticle, newLinePositions) {

    let parts2 = [];
    let startPositionIndex = 0;
    for(const part of parts){
        /*
        if(part.originalContent.includes('Ne-')){
            //console.log('Ne-');
        }
        */

        part.sentenceOffsetOfArticle = sentenceOffsetOfArticle;
        let positionIndexes = _findPartPositionIndexes(part, newLinePositions, startPositionIndex);
        
        if(positionIndexes.length > 0){//found
            //console.log("positionIndexes:");
            //console.log(positionIndexes);

            let positions = [];
            for(let idx of positionIndexes){
                let pos = newLinePositions[idx];
                positions.push(pos);
            }

            let subparts = _splitPartByNewLines(checkWord, part, positions);

            for(let subpart of subparts){
                parts2.push(subpart);
            }

            let lastPositionIndex = positionIndexes[positionIndexes.length - 1];
            startPositionIndex = lastPositionIndex + 1;
        }else{
            parts2.push(part);
        }
    }
    return parts2;
}

function _findPartPositionIndexes(part, positions, startPositionIndex){
    let positionIndexes = [];

    for(let i = startPositionIndex; i < positions.length; i++){
        let pos = positions[i] - part.sentenceOffsetOfArticle;

        let found = pos > part.offset && pos < (part.offset + part.length);
        if(found){
            positionIndexes.push(i);
        }
    }

    return positionIndexes;
}

function isCamelWord(word){
    if(word && word.match(/([A-Z][a-z]+){2,}/)){
        return true;
    }
    return false;
}

function containsHyphen(word) {
    var result = false;
    if(word){
        result = word.includes('-');
    }
    return result;    
}

function containsSlash(word) {
    var result = false;
    if(word){
        result = word.includes('/');
    }
    return result;    
}

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

function markUnnecessaryChars(str, index){
    return setCharAt(str, index, '#');
}


function _splitPartByNewLines(checkWord, part, positions) {
    let parts2 = [];

    let text = sameLengthStandardizeCharacters(part.originalContent);
    //line end hyphen mask, either ' ' or '#'
    let mask = " ".repeat(text.length);

    let startTextIndex =0;
    for(let i=0;i<positions.length;i++){
        let absolutePos = positions[i];
    
        let endTextIndex = absolutePos - part.offset - part.sentenceOffsetOfArticle;
        
        //do not split when previous character is '-'
        if(endTextIndex>0 && text.charAt(endTextIndex-1) === '-') {
            //console.log('hyphen:'+ text);
            mask = markUnnecessaryChars(mask, endTextIndex-1);

            continue;
        }
        
        let subtext = text.substring(startTextIndex, endTextIndex);
        let submask = mask.substring(startTextIndex, endTextIndex);

        let originalContent = subtext;
        let content = getContent(checkWord, originalContent, submask);

        let subpart = {
            originalContent: originalContent,
            content: content,
            offset: startTextIndex + part.offset,
            length: subtext.length,
        };
        parts2.push(subpart);        

        //for next loop
        startTextIndex = endTextIndex;
    }

    //last subpart
    let subtext = text.substring(startTextIndex);
    let submask = mask.substring(startTextIndex);

    let originalContent = subtext;
    let content = getContent(checkWord, originalContent, submask);
    
    let subpart = {
        originalContent: originalContent,
        content: content,
        offset: startTextIndex + part.offset,
        length: subtext.length,
    };
    parts2.push(subpart);        
    
    return parts2;
}

function getContent(checkWord, originalContent, submask){
    let content;

    let options = {
        lineEndHyphenMask : submask,
    };

    let transforms = ['punctuation', 'line-end-hyphen', 'compound', 'apostrophe'];

    let guessResult = identifyWord(originalContent, options, checkWord, transforms);
    if(guessResult){
        content = guessResult.content;
    }
    
    //console.log('guess result:'+ JSON.stringify(guessResult));
    
    //fallback
    if(!content){
        content = originalContent;
    }
    return content;
}

export { tokenize };