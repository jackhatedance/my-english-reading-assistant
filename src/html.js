'use strict';

const MEA_TAG_PREFIX = 'MEA-';
const TOKEN_TAG = 'MEA-TOKEN';
const TEXT_TAG = 'MEA-TEXT';

const INLINE_TAGS = [
    'A', 'ABBR', 'ACRONYM', 'B', 'BDO', 'BIG', 
    'BR', 'BUTTON', 'CITE', 'CODE', 'DFN', 'EM', 
    'I', 'IMG', 'INPUT', 'KBD', 'LABEL', 'MAP', 
    'OBJECT', 'OUTPUT', 'Q', 'SAMP', 'SCRIPT', 'SELECT', 
    'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TEXTAREA', 
    'TIME', 'TT', 'VAR'
];

function containsTag(arrayInCaption, tag){
    tag = tag.toUpperCase();
    return arrayInCaption.includes(tag);
}

function isInlineTag(tag){
    return INLINE_TAGS.includes(tag.toUpperCase());
}

const IGNORED_TAGS = [
    'STYLE', 
    'SCRIPT', 
    'NOSCRIPT', 
    'TITLE', 
    'BUTTON', 
    'G', 
    'SVG', 
    'PRE', 
    'OPTION', 
    'TIME', 
    'CODE',
    'BDI',
    'TEXTAREA'
];

const LEAF_TEXT_TAGS =[
    'A', 
    'ABBR',
    'ADDRESS',
    'ARTICLE',
    'B',
    'BLOCKQUOTE',
    'CAPTION',
    'CITE',
    'DIV',
    'DD',
    'DT',
    'EM',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'I', 
    'LABEL', 
    'LI',
    'MARK', 
    'P', 
    'S', 
    'SECTION', 
    'SMALL', 
    'SPAN', 
    'STRONG', 
    'SUB', 
    'SUMMARY', 
    'SUP', 
    'TD',
    'TH', 
    'U',
    'BODY',
    'UL',
    'FIGCAPTION'
];

function isLeafTextTag(tag, extraTextTags = []){
    tag = tag.toUpperCase();
    return LEAF_TEXT_TAGS.includes(tag) || extraTextTags.includes(tag);
}

function hasAnyClass(element, classes){
    
    let findResult = classes.find(item => element.classList.contains(item));
    if(findResult){
        return true;
    }
    return false;
}

function isSelfOrDecendantOfClass(element, classes, depth=3){
    let cur = element;
    
    for(let i = 0; i< depth; i++){
        if(!cur){
            break;
        }

        let findResult = classes.find(item => cur.classList.contains(item));
        if(findResult){
            return true;
        }

        cur = cur.parentElement;
    }

    return false;
}

function hasAnyId(element, ids){
    let findResult = ids.includes(element.id);
    if(findResult){
        return true;
    }
    return false;
}

function isSelfOrDecendantOfIds(element, ids, depth=3){
    let cur = element;
    
    for(let i = 0; i< depth; i++){
        if(!cur){
            break;
        }

        let findResult = ids.includes(cur.id);
        if(findResult){
            return true;
        }

        cur = cur.parentElement;
    }

    return false;
}

function isInMeaElement(element) {
    if (!element) {
        console.log('null element');
        return false;
    }

    let isMeaElement = element.tagName.startsWith(MEA_TAG_PREFIX);
    if(isMeaElement){
        return true;
    }        

    let meaElement = element.closest('.mea-element');
    if (meaElement) {
        return true;
    } else {
        return false;
    }
}

function isElementDetached(element){
  let rect = element.getBoundingClientRect();
  return rect.left == 0 
    && rect.top ==0 
    && rect.height == 0 
    && rect.width ==0;
}

export { MEA_TAG_PREFIX, TOKEN_TAG, IGNORED_TAGS, TEXT_TAG, containsTag, isInlineTag, isLeafTextTag, isSelfOrDecendantOfClass, isSelfOrDecendantOfIds, isInMeaElement, hasAnyId, hasAnyClass, isElementDetached };