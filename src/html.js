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

function isInlineTag(tag){
    return INLINE_TAGS.includes(tag);
}

const TEXT_TAGS =[
    'A', 
    'ABBR',
    'ADDRESS',
    'ARTICLE',
    'B',
    'BLOCKQUOTE',
    'DIV',
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

function isTextTag(tag, extraTextTags = []){
    return TEXT_TAGS.includes(tag) || extraTextTags.includes(tag);
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


export { MEA_TAG_PREFIX, TOKEN_TAG, TEXT_TAG, isInlineTag, isTextTag, isSelfOrDecendantOfClass, isSelfOrDecendantOfIds };