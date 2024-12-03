

function tokenize(checkWord, sentence, offsetOfArticle, newLinePositions = []) {
    //split by space, dash (dash is not hyphen)
    const regexp = /([^\s—]+)|([\s—]+)/g;
    let parts = _splitTextByRegex(sentence, regexp, 0);
    let parts1 = splitPartsTextByNewLines(parts, offsetOfArticle, newLinePositions);
    //console.log(parts1);
    let parts2 = [];
    for(const part of parts1){
        let content = part.content;
        if(isCompoundingWord(content)){
            let checkWordResult = checkWord(content);            
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
            parts2.push(part);
        }
    }
    return parts2;
}

function _splitTextByRegex(sentence, regexp, baseIndex) {
    let parts = [];

    const str = sentence;
    const matches = str.matchAll(regexp);

    for (const match of matches) {
        let part = {
            originalContent: match[0],
            content: match[0],
            //relative to sentence
            offset: match.index + baseIndex,
            length: match[0].length,
        };
        parts.push(part);
    }

    return parts;
}

function splitPartsTextByNewLines(parts, sentenceOffsetOfArticle, newLinePositions) {

    let parts2 = [];
    let startPositionIndex = 0;
    for(const part of parts){
        /*
        if(part.originalContent.includes('Ne-')){
            console.log('Ne-');
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

            let subparts = _splitPartByNewLines(part, positions);

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

function isCompoundingWord(word) {
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

function _splitPartByNewLines(part, positions) {
    let parts2 = [];

    let text = part.originalContent;

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
        let subpart = {
            originalContent: restoreUnnecessaryChars(subtext),
            content: removeUnnecessaryChars(subtext),
            offset: startTextIndex + part.offset,
            length: subtext.length,
        };
        parts2.push(subpart);        

        //for next loop
        startTextIndex = endTextIndex;
    }

    //last subpart
    let subtext = text.substring(startTextIndex);
    let subpart = {
        originalContent: restoreUnnecessaryChars(subtext),
        content: removeUnnecessaryChars(subtext),
        offset: startTextIndex + part.offset,
        length: subtext.length,
    };
    parts2.push(subpart);        
    
    return parts2;
}


export { tokenize };