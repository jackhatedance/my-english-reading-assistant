import { bionic as bionic_ } from './bionic.js'

const TAG = 'B';
/**
 * is the <b> element in <mea-token><b>...</b></mea-token>
 */
function isBionicHighlightedElement(element){
    return element && element.nodeName.toUpperCase() == TAG;
}


function bionic(word, encode){
    return bionic_(word, encode, TAG);
}

export { isBionicHighlightedElement, bionic }