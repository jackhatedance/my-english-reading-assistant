'use strict';

import { endsWithDot } from '../textUtils.js';

function guess(token, options){
    let candicates = [];
    
    let isEndWithDot = endsWithDot(token.content);
    if(isEndWithDot){
        let contentWithoutDot = token.content.slice(0, -1); 
        let token2 = {
            content: contentWithoutDot,
            checkType:'content',
        };
        candicates.push(token2);
    }

    let tokenWithDot = {
        content: token.content,
        checkType: 'content',
    };

    if(options.isSentenceLastWord){
        candicates.push(tokenWithDot);    
    } else {
        candicates.unshift(tokenWithDot);    
    }

    

    return candicates;
}

function endingDot(){
    return guess;
}

export default endingDot;