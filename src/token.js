import { TOKEN_TAG } from './html.js'
import { isBionicHighlightedElement } from './bionic/bionic-utils.js'

function isMeaTokenElement(element){
    return element.tagName == TOKEN_TAG;
}

function getMeaTokenElement(node){
    
    //case 1: not bionic highlight
    var element = node.parentElement; 
    if(isMeaTokenElement(element)){
        return element;
    }

    //case 2: bionic highlight
    element = node.parentElement.parentElement;
    if(isMeaTokenElement(element)){
        return element;
    }
    
    return null;
}

export { getMeaTokenElement }