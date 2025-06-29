import { commonStart } from './utils/stringUtils.js'
import * as lemmatize from 'wink-lemmatizer';

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

export { isRegularTransform, lemmatizeVerb }