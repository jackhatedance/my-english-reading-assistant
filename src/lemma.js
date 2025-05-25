import { commonStart } from './utils/stringUtils.js'

function isRegularTransform(base, transform){
    let common = commonStart(base, transform);

    let suffix = transform.slice(common.length);

    //case: tug -> tugged
    if(suffix.endsWith('ed') && suffix.length == 3){
        let firstCharOfSuffix = suffix.slice(0,1);
        let lastCharOfBase = base.slice(-1);
        if(firstCharOfSuffix == lastCharOfBase){
            suffix = suffix.slice(1);
        }
    }

    const suffixes = ['d', 'ed', 'ied', 'ing', 's', 'es', 'ies'];
    return suffixes.includes(suffix);
}

export { isRegularTransform }