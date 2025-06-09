function findPhrase(sentence, index, phrases){
    let tokens = sentence.split(' ');
    let phrase = phrases.find(item => matchPhrase(tokens, index, item));
    return phrase;
}

function matchPhrase(tokensOfSentence, mainWordIndexOfSentence, phrase){
    let mainWord = tokensOfSentence[mainWordIndexOfSentence];
    
    let phaseTokens = phrase.split(' ');
    let mainWordIndexOfPhrase = phaseTokens.indexOf(mainWord);

    if(mainWordIndexOfPhrase>0){
        //has left part
        let leftLength = mainWordIndexOfPhrase;
        let leftSame = compareSubStrings(tokensOfSentence, mainWordIndexOfSentence - leftLength, phaseTokens, 0, leftLength);
        if(!leftSame){
            return false;
        }
    }

    if(mainWordIndexOfPhrase < phaseTokens.length-1){
        //has left part
        let rightLength = phaseTokens.length - mainWordIndexOfPhrase -1;
        let rightSame = compareSubStrings(tokensOfSentence, mainWordIndexOfSentence + 1, phaseTokens, mainWordIndexOfPhrase+1, rightLength);
        if(!rightSame){
            return false;
        }
    }

    return true;
}

function compareSubStrings(array1, index1, array2, index2, length){
    if(index1+length > array1.length){
        return false;
    }
    if(index2+length > array2.length){
        return false;
    }

    for(let i=0; i<length;i++){
        let str1 = array1[index1+i];
        let str2 = array2[index2+i];

        if(str1 != str2){
            return false;
        }
    }
    return true;
}

export { findPhrase }