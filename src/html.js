'use strict';

const TOKEN_TAG = 'mea-token';
const TEXT_TAG = 'mea-text';

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
    'U',
    'BODY',
    'UL',
];

function isTextTag(tag){
    return TEXT_TAGS.includes(tag);
}


export { TOKEN_TAG, TEXT_TAG, isInlineTag, isTextTag };