'use strict';

import { trimPunctuations } from '../textUtils.js';

function guess(token, options){
    let candicates = [];
    
    let content = trimPunctuations(token.content);
    let token2 = {
        content: content,
        checkType:'content',
    };
    candicates.push(token2)
        
    return candicates;
}

function punctuation(){
    return guess;
}

export default punctuation;