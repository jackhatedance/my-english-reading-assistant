import { commonStart } from './utils/stringUtils.js'
import lemmatize from 'wink-lemmatizer'
import { getWordParts } from './word-parts-utils.js'

function isRegularTransform(base, transform){
    base = base.toLowerCase();
    transform = transform.toLowerCase();

    let result = _isRegularTransform(base, transform);

    if(result){
        return true;
    }

    //e.g. levy -> levies
    if(base.endsWith('y')){
        let base2 = base.slice(0, -1) + 'i';
        result = _isRegularTransform(base2, transform);
        if(result){
            return true;
        }
    }

    //case: tug -> tugged
    let lastCharOfBase = base.slice(-1);
    let base2 = base + lastCharOfBase;
    result = _isRegularTransform(base2, transform);
    if(result){
        return true;
    }

    return false;
}

function _isRegularTransform(base, transform) {    
    let common = commonStart(base, transform);

    let suffix = transform.slice(common.length);

    const suffixes = ['ed', 'ing', 'es', 's', 'er', 'est', 'ly'];
    let result = suffixes.includes(suffix);
    if(!result){
        //case of close -> closer
        let lastCharOfBase = base.slice(-1);
        if(lastCharOfBase == 'e'){
            suffix = 'e' + suffix;
        }
        result = suffixes.includes(suffix);
    }

    return result;
}

function lemmatizeVerb(word){
    return lemmatize.verb(word);
}

function lemmatizeAdjective(word){
    return lemmatize.adjective(word);
}

function lemmatizeNoun(word){
    return lemmatize.noun(word);
}


function singularize(word) {
    const endings = {
        ves: 'fe',
        ies: 'y',
        i: 'us',
        zes: 'ze',
        ses: 's',
        es: 'e',
        s: ''
    };
    return word.replace(
        new RegExp(`(${Object.keys(endings).join('|')})$`), 
        r => endings[r]
    );
}

function getBaseFromWordParts(word){
    let parts = getWordParts(word);
    if(parts){
        if(parts.length === 3 && parts[0] === '' && parts[1] !== '' && parts[2] !== ''){
            let base = parts[1];
            
            if(isRegularTransform(base, word)){
                return base;     
            }

        }
    }

    return word;
}

export { isRegularTransform, lemmatizeNoun, lemmatizeVerb, lemmatizeAdjective, singularize, getBaseFromWordParts }