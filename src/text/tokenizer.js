import { trimPunctuations, sameLengthStandardizeCharacters } from './textUtils.js';

function tokenize(checkWord, sentence, offsetOfArticle, newLinePositions = []) {
    //split by space, dash (dash is not hyphen)
    const regexp = /([^\s—]+)|([\s—]+)/g;

    
    let parts = _splitTextByRegex(sentence, regexp, 0);
    let parts1 = splitPartsTextByNewLines(checkWord, parts, offsetOfArticle, newLinePositions);
    //console.log(parts1);
    let parts2 = [];
    for(const part of parts1){
        let content = part.content;
        //console.log(content);        
        let contentWithoutPunctuation = trimPunctuations(content);
        if(isCompoundWord(contentWithoutPunctuation)){
            let checkWordResult = checkWord(contentWithoutPunctuation);            
            if(checkWordResult){
                part.content = checkWordResult;
                parts2.push(part);
            } else {
                const regexp2 = /([-])|([^-]+)/g;
                let subParts = _splitTextByRegex(content, regexp2, part.offset);
                for(const subPart of subParts){
                    parts2.push(subPart);
                }
            }                
        
        } else {
            if(contentWithoutPunctuation.endsWith("'s") && !checkWord(contentWithoutPunctuation)){
                //console.log(contentWithoutPunctuation);
                let contentWithoutS = contentWithoutPunctuation.slice(0, -2);
                //console.log(contentWithoutS);
                part.content = contentWithoutS;                
            }

            parts2.push(part);
        }
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

function isCompoundWord(word) {
    var isCompounding = false;
    if(word){
        isCompounding = word.match(/[a-zA-Z]+-[a-zA-Z]+/);
    }
    return isCompounding;    
}



function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

function markUnnecessaryChars(str, index){
    return setCharAt(str, index, ' ');
}

function restoreUnnecessaryChars(str){
    return str.replaceAll(/[ ]/g, "-");
}

function removeUnnecessaryChars(str){
    return str.replaceAll(/[ ]/g, "");
}

function containsUnnecessaryChars(str){
    return str && str.includes(' ');
}

function _splitPartByNewLines(checkWord, part, positions) {
    let parts2 = [];

    let text = sameLengthStandardizeCharacters(part.originalContent);

    let startTextIndex =0;
    for(let i=0;i<positions.length;i++){
        let absolutePos = positions[i];
    
        let endTextIndex = absolutePos - part.offset - part.sentenceOffsetOfArticle;
        
        //do not split when previous character is '-'
        if(endTextIndex>0 && text.charAt(endTextIndex-1) === '-') {
            //console.log('hyphen:'+ text);
            text = markUnnecessaryChars(text, endTextIndex-1);

            continue;
        }
        
        let subtext = text.substring(startTextIndex, endTextIndex);

        let originalContent = restoreUnnecessaryChars(subtext);
        let content = getContent(checkWord, originalContent, subtext);

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

    let originalContent = restoreUnnecessaryChars(subtext);
    let content = getContent(checkWord, originalContent, subtext);
    
    let subpart = {
        originalContent: originalContent,
        content: content,
        offset: startTextIndex + part.offset,
        length: subtext.length,
    };
    parts2.push(subpart);        
    
    return parts2;
}

function getContent(checkWord, originalContent, subtext){
    let content;
    //sometimes the hyphen at the end of a line is required. 
    if(containsUnnecessaryChars(subtext)){
        let cleanContent = removeUnnecessaryChars(subtext);
        let cleanContentWithoutPunctuation = trimPunctuations(cleanContent);
        let checkWordResult = checkWord(cleanContentWithoutPunctuation); 
        
        if(checkWordResult){
            content = cleanContent;
        }else{
            content = originalContent;
        }
    }else {
        content = originalContent;
    }
    return content;
}

export { tokenize };