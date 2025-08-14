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
    return _isRegularTransformMethod1(base, transform) || 
        _isRegularTransformMethod2(base, transform);
}

function _isRegularTransformMethod1(base, transform) {    
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

function _isRegularTransformMethod2(base, transform) {
    const suffixMap = {
        'man' : 'men'
    };

    for (const key in suffixMap) {
        if (suffixMap.hasOwnProperty(key)) {
            const value = suffixMap[key];
            //console.log(`${key}: ${person[key]}`);
            if(base.endsWith(key) && transform.endsWith(value)){
                const baseWithoutSuffix = base.substring(0, base.length - key.length);
                const transformWithoutSuffix = transform.substring(0, transform.length - value.length);
                if(baseWithoutSuffix === transformWithoutSuffix){
                    return true;
                }
            }
        }
    }

    return false;
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

function singularCandidates(word) {
    const endings = {
        ves: 'fe',
        ies: 'y',
        i: 'us',
        zes: 'ze',
        ses: ['s','se'],
        es: 'e',
        s: ''
    };

    
    let result = [];
    let newEndings = [];
    for (const [key, value] of Object.entries(endings)) {
      if(word.endsWith(key)){
        
        if(Array.isArray(value)){
            newEndings = value;
        }else{
            newEndings = [value];
        }

        for(const newEnding of newEndings){
            let singular = word.replace(new RegExp(`${key}$`), newEnding);
            result.push(singular);
        }
        break;
      }
    }

    return result;
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

export { isRegularTransform, lemmatizeNoun, lemmatizeVerb, lemmatizeAdjective, singularize, singularCandidates, getBaseFromWordParts }