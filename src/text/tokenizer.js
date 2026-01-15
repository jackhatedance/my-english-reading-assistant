import { trimPunctuations, sameLengthTrimPunctuations, sameLengthStandardizeCharacters } from './textUtils.js';
import { guessWord } from './identify-word.js';
import { createBlankMask, replaceMaskedChars, removeMaskedChars } from './textUtils.js';
import { containsAbbreviation } from './transforms/abbreviation.js'
import { lemmatizeVerb } from '../lemma.js'
//import posTagger from 'wink-pos-tagger'


function tokenizeSentence(checkWord, sentence, noParse, offsetOfArticle, newTagPositions = { }) {
    /*
    var tagger = posTagger();
    let tags = tagger.tagSentence(sentence);
    console.log(tags);
    */
    let sentenceLength = sentence.length;
    let parts;
    if(noParse){
        let mask = createBlankMask(sentence);
        let part = {
            originalContent: sentence,
            mask: mask,
            content: sentence,
            checkWordResult: null,
            checked: false,
            //relative to sentence
            offset: 0,
            length: sentenceLength,
        };

        parts = [part];
    } else {
    //split by space, dash (dash is not hyphen)
    const regexp = /([^\s—]+)|([\s—]+)/g;
    parts = _splitTextByRegex(sentence, regexp, 0, null, null);
    parts = splitPartsTextByNewLines(checkWord, parts, offsetOfArticle, newTagPositions.newLinePositions);
    parts = splitPartsTextByNewWords(checkWord, parts, offsetOfArticle, newTagPositions.newWordPositions);
    //console.log(parts);
    parts = splitWords(checkWord, parts);
    }
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

    for(const part of parts){
        part.sentenceOffsetOfArticle = offsetOfArticle;
    }
    
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
            checkAndPushPart(parts2, part);
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
            checkAndPushPart(parts2, part);
        }
    }

    return parts2;
}

function splitCamelWords(checkWord, part, parts){
    const { originalContent, content } = part;
    let contentWithoutPunctuation = trimPunctuations(content);
    let checkWordResult = checkWord(contentWithoutPunctuation, 'Always');            
    if(checkWordResult){
        //part.content = checkWordResult.word;
        part.checkWordResult = checkWordResult;
        part.checked = true;
        parts.push(part);
    } else {
        //step 2: split compound word
        const regexp2 = /([A-Z][^A-Z\s]+)/g;
        let subParts = _splitTextByRegex(originalContent, regexp2, part.offset);
        for(const subPart of subParts){
            parts.push(subPart);
        }
    }
}

function splitSlashWords(checkWord, part, parts){
    const { originalContent, content } = part;
    let contentWithoutPunctuation = trimPunctuations(content);
    let checkWordResult = checkWord(contentWithoutPunctuation, 'Always');            
    if(checkWordResult){
        //part.content = checkWordResult.word;
        part.checkWordResult = checkWordResult;
        part.chcked = true;
        parts.push(part);
    } else {
        //step 2: split word
        const regexp2 = /([/])|([^/]+)/g;
        let subParts = _splitTextByRegex(originalContent, regexp2, part.offset);
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
        //part.content = guessWordResult;
        part.checkWordResult = checkWord(guessWordResult, 'Always');
        part.checked = true;
        parts.push(part);
    } else {
        //step 2: eliminate hyphen then check word
        const contentWithoutPunctuationAndHyphen = contentWithoutPunctuation.replaceAll(/[-]/g, '');
        guessWordResult = guessWordOfNormal(checkWord, contentWithoutPunctuationAndHyphen);  
        if(guessWordResult){
            //part.content = guessWordResult;
            part.checkWordResult = checkWord(guessWordResult, 'Always');
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
        guessPartPhraseBaseWord(checkWord, nonEmptyParts, part);
    }
}

function guessPartWord2(checkWord, parts, part){
    if(part.checkWordResult.word && part.checkWordResult.word.endsWith('ing')){

        //preposition doing
        let done = guessGerund(checkWord, parts, part);

        if(!done){
            //be doing
            done = guessContinuousTense(checkWord, parts, part);
        }        
    }       
}

function guessGerund(checkWord, parts, part){

    let index = parts.indexOf(part);
    let word = part.checkWordResult.word;

    let previousIndex1 = index -1;
    let previousPart1 = null;
    if(previousIndex1 >=0){
        previousPart1 = parts[previousIndex1];
    }    

    let previousIndex2 = index -2;
    let previousPart2 = null;
    if(previousIndex2 >=0){
        previousPart2 = parts[previousIndex2];
    }    
    
    if((previousPart1 && previousPart1.checkWordResult?.isPreposition)
        || (previousPart2 && previousPart2.checkWordResult?.isPreposition)){
        let baseWord = lemmatizeVerb(word);
        if(baseWord != word){
            let checkWordResult = checkWord(baseWord, 'Never');
            if(checkWordResult){
                part.transform ={
                    type : '动名词',
                    base : checkWordResult.word,
                };
                part.checkWordResult.baseWord = checkWordResult.word; 

                return true;
            }
        }
    }

        
    return false;
}

function guessContinuousTense(checkWord, parts, part){

    let index = parts.indexOf(part);
    let word = part.checkWordResult.word;

    let previousIndex1 = index -1;
    let previousPart1 = null;
    if(previousIndex1 >=0){
        previousPart1 = parts[previousIndex1];
    }
    
    let previousIndex2 = index -2;
    let previousPart2 = null;
    if(previousIndex2 >=0){
        previousPart2 = parts[previousIndex2];
    }
    
    if((previousPart1 && previousPart1.checkWordResult?.baseWord == 'be')
        || (previousPart2 && previousPart2.checkWordResult?.baseWord == 'be')){
        let baseWord = lemmatizeVerb(word);
        if(baseWord != word){
            let checkWordResult = checkWord(baseWord, 'Never');
            if(checkWordResult){
                part.transform ={
                    type : '进行时',
                    base : checkWordResult.word,
                };
                part.checkWordResult.baseWord = checkWordResult.word; 

                return true;
            }
        }
    }

        
    return false;
}

function guessPartPhraseBaseWord(checkWord, parts, part){

    if(!part.checked){
        part.phrase = {
            baseWord: part.content,
        };
        return;
    }

    let index = parts.indexOf(part);
    let word = part.checkWordResult.word;

    let baseWordOfPhrase;

    if(!baseWordOfPhrase){
        baseWordOfPhrase = part.checkWordResult.baseWord;
    }

    if(!baseWordOfPhrase){
        let checkWordResult = checkWord(word, 'Always');
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
                let baseWord = lemmatizeVerb(word);
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

    if(!guessResult){
        transforms = ['punctuation', 'endingDot', 'lemma'];
        guessResult = guessWord(originalContent, options, checkWord, transforms);        
    }
    
    if(guessResult){
        //part.content = guessResult.content;
        if(!part.checked) {
            let checkWordResult = checkWord(guessResult.content, 'Always');
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
    
    const matchesIter = sentence.matchAll(regexp);
    const matches = Array.from(matchesIter);
    //console.log(matches);

    let lastMatchEndIndex=0;
    
    for (let i=0; i< matches.length; i++) {
        const match = matches[i];

        let matchStartIndex = lastMatchEndIndex;
        let matchEndIndex;
        if(i == matches.length-1){//last
            matchEndIndex = originalSentence.length;
        }else{
            matchEndIndex = match.index + match[0].length;
        }
        const length = matchEndIndex - matchStartIndex;
        
        let submask = mask.substring(matchStartIndex, matchEndIndex);

        let originalContent = originalSentence.substring(matchStartIndex, matchEndIndex);
        let content = sentence.substring(matchStartIndex, matchEndIndex);
        
        let checkWordResult;
        let checked = false;
        let partContent;        
        
        //text from script tag could be very long, and inefficient
        let valid = length < 32;
        
        if(valid){

            originalContent = replaceMaskedChars(originalContent, submask, originalMaskedChar);

            //console.log('originalContent:'+originalContent);
            let cleanContent = removeMaskedChars(content, submask);
            cleanContent = sameLengthTrimPunctuations(cleanContent);
            
            let contentWithoutPunctuation = trimPunctuations(cleanContent);
            //console.log('contentWithoutPunctuation:'+contentWithoutPunctuation);
            partContent = cleanContent;
            
            if(checkWord){
                checkWordResult = checkWord(contentWithoutPunctuation,'Always');
                
                if(checkWordResult){
                    partContent = checkWordResult.word;
                    checked = true;
                } else {
                    partContent = contentWithoutPunctuation;
                    checked = false;
                }
            }
        } else {
            partContent = content;
        }
        //console.log('partContent:'+partContent);

        let part = {
            originalContent: originalContent,
            mask: submask,
            content: partContent,//puncutations either standard or replaced by space, same length with original content
            checkWordResult: checkWordResult,
            checked: checked,
            //relative to sentence
            offset: matchStartIndex + baseIndex,
            length: length,
        };
        parts.push(part);

        lastMatchEndIndex = matchEndIndex;
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
                checkAndPushPart(parts2, subpart);
            }

            let lastPositionIndex = positionIndexes[positionIndexes.length - 1];
            startPositionIndex = lastPositionIndex + 1;
        }else{
            checkAndPushPart(parts2, part);
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
                checkAndPushPart(parts2, subpart);
            }

            let lastPositionIndex = positionIndexes[positionIndexes.length - 1];
            startPositionIndex = lastPositionIndex + 1;
        }else{
            checkAndPushPart(parts2, part);
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
        checkAndPushPart(parts2, subpart);       

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
            checkWordResult = checkWord(content, 'Always');
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
    checkAndPushPart(parts2, subpart);       
    
    return parts2;
}

function _splitPartByNewWords(checkWord, part, positions) {
    let parts2 = [];

    let text = sameLengthStandardizeCharacters(part.originalContent);
    let mask = createBlankMask(text);

    let startTextIndex =0;
    for(let i=0;i<positions.length;i++){
        let absolutePos = positions[i];
    
        let endTextIndex = absolutePos - part.offset - part.sentenceOffsetOfArticle;
        let subtext = text.substring(startTextIndex, endTextIndex);
        let submask = mask.substring(startTextIndex, endTextIndex);

        //let subtextWithoutPunctuation = trimPunctuations(subtext);
        
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
            mask: submask,
            offset: startTextIndex + part.offset,
            length: originalContent.length,
        };
        checkAndPushPart(parts2, subpart);        

        //for next loop
        startTextIndex = endTextIndex;
    }

    //last subpart
    let subtext = text.substring(startTextIndex);
    let submask = mask.substring(startTextIndex);
    let subtextWithoutPunctuation = trimPunctuations(subtext);
        
    let checkWordResult = checkWord(subtextWithoutPunctuation, 'Always');
    
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
        mask: submask,
        checkWordResult: checkWordResult,
        checked: checked,
        offset: startTextIndex + part.offset,
        length: originalContent.length,
    };
    checkAndPushPart(parts2, subpart);     
    
    return parts2;
}

function guessWordOfCrossLine(checkWord, originalContent, submask){
    let options = {
        lineEndHyphenMask : submask,
    };

    let originalContentWithoutPuncutation = trimPunctuations(originalContent);
    let transforms = ['line-end-hyphen', 'compound', 'apostrophe'];

    let guessResult = guessWord(originalContentWithoutPuncutation, options, checkWord, transforms);

    if(!guessResult){
        transforms = ['punctuation', 'endingDot', 'line-end-hyphen', 'compound', 'apostrophe'];

        guessResult = guessWord(originalContent, options, checkWord, transforms);
    }

    //console.log('guess result:'+ JSON.stringify(guessResult));
    return guessResult;
}

function checkAndPushPart(parts, part){
    if(parts.length>0){
        let lastPart = parts[parts.length-1];
        if(lastPart.offset+lastPart.length != part.offset){
            console.log('part is not continuous');
        }
    }
    
    parts.push(part);
}

export { tokenizeSentence, tokenizeNodeText };