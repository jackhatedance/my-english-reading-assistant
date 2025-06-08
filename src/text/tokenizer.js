import { trimPunctuations, sameLengthStandardizeCharacters } from './textUtils.js';
import { guessWord } from './identify-word.js';
import { createBlankMask, replaceMaskedChars, removeMaskedChars } from './textUtils.js';
import { containsAbbreviation } from './transforms/abbreviation.js'
import * as lemmatize from 'wink-lemmatizer';

function tokenizeSentence(checkWord, sentence, offsetOfArticle, newTagPositions = { }) {
    //split by space, dash (dash is not hyphen)
    const regexp = /([^\s—]+)|([\s—]+)/g;
    let parts = _splitTextByRegex(sentence, regexp, 0, null, null);
    parts = splitPartsTextByNewLines(checkWord, parts, offsetOfArticle, newTagPositions.newLinePositions);
    parts = splitPartsTextByNewWords(checkWord, parts, offsetOfArticle, newTagPositions.newWordPositions);
    //console.log(parts);
    parts = splitWords(checkWord, parts);

    //----end of split

    //add sentence position info
    if(parts.length>0){
        let firstPart = parts[0];
        firstPart.isSentenceFirstWord = true;

        let lastPart = findLastEffectiveToken(parts);
        if(lastPart){
            lastPart.isSentenceLastWord = true;
        }
    }
    
    guessPartsWord(checkWord, parts);
    
    return parts;
}

function findLastEffectiveToken(parts){
    let currentNonBlankPart;
    for(let part of parts){
        let blank = part.originalContent.trim().length == 0;
        if(!blank){
            currentNonBlankPart = part;
        }
    }
    return currentNonBlankPart;
}

function tokenizeNodeText(checkWord, sentence) {
    //split by space, dash (dash is not hyphen)
    const regexp = /([^\s—]+)|([\s—]+)/g;
    let parts = _splitTextByRegex(sentence, regexp, 0, null, null);
    //console.log(parts);
    parts = splitWords(checkWord, parts);
    
    return parts;
}


function splitWords(checkWord, parts){
    let parts2 = [];
    for(const part of parts){
        if(part.checked){
            parts2.push(part);
            continue;
        }

        let content = part.content;
        //console.log(content);        
        let contentWithoutPunctuation = trimPunctuations(content);
        if(isCamelWord(contentWithoutPunctuation)){
            splitCamelWords(checkWord, part, parts2);
        } else if(containsSlash(contentWithoutPunctuation)){
            splitSlashWords(checkWord, part, parts2)
        } else if(containsHyphen(contentWithoutPunctuation)){
            splitCompoundWord(checkWord, part, parts2);
        } else {
            parts2.push(part);
        }
    }

    return parts2;
}

function splitCamelWords(checkWord, part, parts){
    let content = part.content;
    let contentWithoutPunctuation = trimPunctuations(content);
    let checkWordResult = checkWord(contentWithoutPunctuation, 'WhenNecessary');            
    if(checkWordResult){
        part.content = checkWordResult.word;
        part.checkWordResult = checkWordResult;
        part.checked = true;
        parts.push(part);
    } else {
        //step 2: split compound word
        const regexp2 = /([A-Z][^A-Z\s]+)/g;
        let subParts = _splitTextByRegex(content, regexp2, part.offset);
        for(const subPart of subParts){
            parts.push(subPart);
        }
    }
}

function splitSlashWords(checkWord, part, parts){
    let content = part.content;
    let contentWithoutPunctuation = trimPunctuations(content);
    let checkWordResult = checkWord(contentWithoutPunctuation, 'WhenNecessary');            
    if(checkWordResult){
        part.content = checkWordResult.word;
        part.checkWordResult = checkWordResult;
        part.chcked = true;
        parts.push(part);
    } else {
        //step 2: split word
        const regexp2 = /([/])|([^/]+)/g;
        let subParts = _splitTextByRegex(content, regexp2, part.offset);
        for(const subPart of subParts){
            parts.push(subPart);
        }
    }
}

function splitCompoundWord(checkWord, part, parts){
    let content = part.content;
    let contentWithoutPunctuation = trimPunctuations(content);

    //step 1: check original word
    let guessWordResult = guessWordOfNormal(checkWord, contentWithoutPunctuation);            
    if(guessWordResult){
        part.content = guessWordResult;
        part.checkWordResult = checkWord(guessWordResult, 'WhenNecessary');
        part.checked = true;
        parts.push(part);
    } else {
        //step 2: eliminate hyphen then check word
        const contentWithoutPunctuationAndHyphen = contentWithoutPunctuation.replaceAll(/[-]/g, '');
        guessWordResult = guessWordOfNormal(checkWord, contentWithoutPunctuationAndHyphen);  
        if(guessWordResult){
            part.content = guessWordResult;
            part.checkWordResult = checkWord(guessWordResult, 'WhenNecessary');
            part.checked = true;
            parts.push(part);
        } else {
            //step 3: split compound word by hyphen
            const regexp2 = /([-])|([^-]+)/g;

            //replace '-' to any other letter
            let originalContent = replaceMaskedChars(part.originalContent, part.mask, 'x');
            let originalMaskedChar = '-';
            let subParts = _splitTextByRegex(originalContent, regexp2, part.offset, part.mask, originalMaskedChar);
            for(const subPart of subParts){
                parts.push(subPart);
            }
        }
    }
}


function guessWordOfNormal(checkWord, content){
    let options = { };
    let transforms= ['punctuation', 'endingDot', 'apostrophe'];

    let guessResult = guessWord(content, options, checkWord, transforms);
    //console.log("guessResult:"+JSON.stringify(guessResult));
    if(guessResult){
        return guessResult.content;
    }
}

function guessPartsWord(checkWord, parts){
    let nonEmptyParts = parts.filter(item => item.content.trim().length >0);

    for(const part of nonEmptyParts){
        if(part.checked){
            continue;
        }

        guessPartWord(checkWord, part);
    }

    //round 2, more complex cases
    
    for(const part of nonEmptyParts){
        if(part.checked && !part.checkWordResult?.baseWord){
            guessPartWord2(checkWord, nonEmptyParts, part);
        }
    }

    //for phrase
    for(const part of nonEmptyParts){
        if(part.checked){
            guessPartPhraseBaseWord(checkWord, nonEmptyParts, part);
        }
    }
}

function guessPartWord2(checkWord, parts, part){

    let index = parts.indexOf(part);
    let word = part.checkWordResult.word;

    //be doing
    let previousIndex = index -1;
    if(previousIndex>=0){
        let previousPart = parts[previousIndex];
        
        if(previousPart.checkWordResult?.baseWord == 'be' && part.checkWordResult.word && part.checkWordResult.word.endsWith('ing')){
            let baseWord = lemmatize.verb(word);
            if(baseWord != word){
                let checkWordResult = checkWord(baseWord, 'Never');
                if(checkWordResult){
                    part.transform ={
                        type : '进行时',
                        base : checkWordResult.word,
                    };
                    part.checkWordResult.baseWord = checkWordResult.word; 
                }
            }
        }
    }        
}

function guessPartPhraseBaseWord(checkWord, parts, part){

    let index = parts.indexOf(part);
    let word = part.checkWordResult.word;

    let baseWordOfPhrase;

    if(!baseWordOfPhrase){
        baseWordOfPhrase = part.checkWordResult.baseWord;
    }

    if(!baseWordOfPhrase){
        let checkWordResult = checkWord(word, 'Must');
        if(checkWordResult && checkWordResult.baseWord){
            baseWordOfPhrase = checkWordResult.baseWord;
        }
    }

    if(!baseWordOfPhrase){
        //be doing
        let previousIndex = index -1;
        if(previousIndex>=0){
            let previousPart = parts[previousIndex];
            
            if(previousPart.checkWordResult?.baseWord == 'be' && part.checkWordResult.word && part.checkWordResult.word.endsWith('ing')){
                let baseWord = lemmatize.verb(word);
                if(baseWord != word){
                    let checkWordResult = checkWord(baseWord, 'Never');
                    if(checkWordResult){
                        part.transform ={
                            type : '进行时',
                            base : checkWordResult.word,
                        };
                        baseWordOfPhrase = checkWordResult.word; 
                    }
                }
            }
        }
    }        

    if(!baseWordOfPhrase){
        baseWordOfPhrase = word;
    }

    part.phrase = {
        baseWord: baseWordOfPhrase,
    };
}

function guessPartWord(checkWord, part){
    let originalContent = part.content;
    let contentWithoutPunctuation = trimPunctuations(originalContent); 

    let guessResult;

    let options = { };
    let transforms;
    
    if(!guessResult){
        if(part.lineBreak){
            guessResult = guessWordOfCrossLine(checkWord, originalContent, part.mask);
        } 
    }

    if(!guessResult){
        transforms = ['abbreviation'];

        if(containsAbbreviation(originalContent)){
            guessResult = guessWord(originalContent, options, checkWord, transforms);
        }
    }
    

    if(!guessResult){
        //ending dot
        transforms = ['endingDot'];
        
        if(contentWithoutPunctuation && contentWithoutPunctuation.endsWith('.')){
            guessResult = guessWord(contentWithoutPunctuation, buildGuessWordOptions(part), checkWord, transforms);
        }
    }

    if(!guessResult){
        transforms = ['punctuation', 'apostrophe'];
        guessResult = guessWord(originalContent, options, checkWord, transforms);        
    }

    
    if(guessResult){
        part.content = guessResult.content;
        if(!part.checked) {
            let checkWordResult = checkWord(guessResult.content, 'WhenNecessary');
            if(checkWordResult){
                part.checkWordResult = checkWordResult;
                part.checked = true;
                part.baseWord = checkWordResult.baseWord; 
            }
            
        }
    }
}

function buildGuessWordOptions(part){
    let options = {};
    if(part.isSentenceLastWord){
        options.isSentenceLastWord = true;
    }
    return options;
}

function _splitTextByRegex(originalSentence, regexp, baseIndex, mask, originalMaskedChar, checkWord) {
    let parts = [];

    if(!mask){
        mask = createBlankMask(originalSentence);
    }
    if(!originalMaskedChar){
        originalMaskedChar = '-';
    }
   
    let sentence = sameLengthStandardizeCharacters(originalSentence);
    
    const matches = sentence.matchAll(regexp);

    for (const match of matches) {
        let submask = mask.substring(match.index, match.index + match[0].length);

        let originalContent = originalSentence.substring(match.index, match.index + match[0].length);
        originalContent = replaceMaskedChars(originalContent, submask, originalMaskedChar);

        let content = sentence.substring(match.index, match.index + match[0].length);
        
        //console.log('originalContent:'+originalContent);
        let cleanContent = removeMaskedChars(content, submask)
        let contentWithoutPunctuation = trimPunctuations(cleanContent);
        //console.log('contentWithoutPunctuation:'+contentWithoutPunctuation);
        let partContent = contentWithoutPunctuation;
        let checkWordResult;
        let checked = false;
        if(checkWord){
            checkWordResult = checkWord(contentWithoutPunctuation,'WhenNecessary');
            
            if(checkWordResult){
                partContent = checkWordResult.word;
                checked = true;
            } else {
                partContent = contentWithoutPunctuation;
                checked = false;
            }
        }
        //console.log('partContent:'+partContent);

        let part = {
            originalContent: originalContent,
            mask: submask,
            content: partContent,
            checkWordResult: checkWordResult,
            checked: checked,
            //relative to sentence
            offset: match.index + baseIndex,
            length: match[0].length,
        };
        parts.push(part);
    }

    return parts;
}

function splitPartsTextByNewLines(checkWord, parts, sentenceOffsetOfArticle, newLinePositions) {
    if(!newLinePositions){
        newLinePositions = [];
    }

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

function splitPartsTextByNewWords(checkWord, parts, sentenceOffsetOfArticle, newWordPositions) {
    if(!newWordPositions){
        newWordPositions = [];
    }

    let parts2 = [];
    let startPositionIndex = 0;
    for(const part of parts){
        part.sentenceOffsetOfArticle = sentenceOffsetOfArticle;
        let positionIndexes = _findPartPositionIndexes(part, newWordPositions, startPositionIndex);
        
        if(positionIndexes.length > 0){//found
            //console.log("positionIndexes:");
            //console.log(positionIndexes);

            let positions = [];
            for(let idx of positionIndexes){
                let pos = newWordPositions[idx];
                positions.push(pos);
            }

            let subparts = _splitPartByNewWords(checkWord, part, positions);

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
    let mask = createBlankMask(text);

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
        let content;
        /*
        let guessWordResult = guessWordOfCrossLine(checkWord, originalContent, submask);
        let content;
        let checked;
        if(guessWordResult){
            content = guessWordResult.content;
            if(guessWordResult.checkType=='content'){
                checked = true;
            }            
        }else {
            content = originalContent;
            checked = false;
        }
            */

        content = originalContent;
        let checked = false;

        let subpart = {
            originalContent: originalContent,
            mask: submask,
            content: content,
            checked: checked,
            offset: startTextIndex + part.offset,
            length: subtext.length,
            lineBreak: true,
        };
        parts2.push(subpart);        

        //for next loop
        startTextIndex = endTextIndex;
    }

    //last subpart
    let subtext = text.substring(startTextIndex);
    let submask = mask.substring(startTextIndex);

    let originalContent = subtext;
    let guessWordResult = guessWordOfCrossLine(checkWord, originalContent, submask);
    let content;
    let checked;
    let checkWordResult;
    if(guessWordResult){
        content = guessWordResult.content;
        if(guessWordResult.checkType=='content'){
            checked = true;
            checkWordResult = checkWord(content, 'WhenNecessary');
        }
    }else {
        content = originalContent;
        checked = false;
    }

    let subpart = {
        originalContent: originalContent,
        mask: submask,
        content: content,
        checked: checked,
        checkWordResult: checkWordResult,
        offset: startTextIndex + part.offset,
        length: subtext.length,
    };
    parts2.push(subpart);        
    
    return parts2;
}

function _splitPartByNewWords(checkWord, part, positions) {
    let parts2 = [];

    let text = sameLengthStandardizeCharacters(part.originalContent);
    
    let startTextIndex =0;
    for(let i=0;i<positions.length;i++){
        let absolutePos = positions[i];
    
        let endTextIndex = absolutePos - part.offset - part.sentenceOffsetOfArticle;
        let subtext = text.substring(startTextIndex, endTextIndex);

        let subtextWithoutPunctuation = trimPunctuations(subtext);
        
        //let checkWordResult = checkWord(subtextWithoutPunctuation);
        
        let originalContent = subtext;
        
        let content, checked;
        /*
        if(checkWordResult){
            content = checkWordResult;
            checked = true;
        } else {
            content = originalContent;
            checked = false;
        }
            */
        content = originalContent;
        
        let subpart = {
            originalContent: originalContent,
            content: content,
            offset: startTextIndex + part.offset,
            length: originalContent.length,
        };
        parts2.push(subpart);        

        //for next loop
        startTextIndex = endTextIndex;
    }

    //last subpart
    let subtext = text.substring(startTextIndex);
    let subtextWithoutPunctuation = trimPunctuations(subtext);
        
    let checkWordResult = checkWord(subtextWithoutPunctuation, 'WhenNecessary');
    
    let originalContent = subtext;
    
    let content, checked;
    if(checkWordResult){
        content = checkWordResult.word;
        checked = true;
    } else {
        content = originalContent;
        checked = false;
    }

    let subpart = {
        originalContent: originalContent,
        content: content,
        checkWordResult: checkWordResult,
        checked: checked,
        offset: startTextIndex + part.offset,
        length: originalContent.length,
    };
    parts2.push(subpart);        
    
    return parts2;
}

function guessWordOfCrossLine(checkWord, originalContent, submask){
    let options = {
        lineEndHyphenMask : submask,
    };

    let transforms = ['punctuation', 'endingDot', 'line-end-hyphen', 'compound', 'apostrophe'];

    let guessResult = guessWord(originalContent, options, checkWord, transforms);
        
    //console.log('guess result:'+ JSON.stringify(guessResult));
    return guessResult;
}

export { tokenizeSentence, tokenizeNodeText };