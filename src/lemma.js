import { commonStart } from './utils/stringUtils.js'

function isRegularTransform(base, transform){
    let common = commonStart(base, transform);

    let suffix = transform.slice(common.length);

    const suffixes = ['d', 'ed', 'ied', 'ing', 's', 'es', 'ies'];
    return suffixes.includes(suffix);
}

export { isRegularTransform }