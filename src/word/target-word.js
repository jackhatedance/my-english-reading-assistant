import { isRegularTransform } from '../lemma.js'

function getTargetWord(word, baseWord){
    if(!baseWord){
        return word;
    }

    let regularTransform = isRegularTransform(baseWord, word);
    if(regularTransform){
        return baseWord;
    }else {
        return word;
    }

}

export { getTargetWord }