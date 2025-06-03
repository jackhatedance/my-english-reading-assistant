function findPhrase(sentence, index, phrases){
    let tokens = sentence.split(' ');
    let phrase = phrases.find(item => matchPhrase(tokens, index, item));
    return phrase;
}

function matchPhrase(tokens, index, phrase){
    let phaseTokens = phrase.split(' ');

    return compareSubStrings(tokens, index, phaseTokens, 0, phaseTokens.length);
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