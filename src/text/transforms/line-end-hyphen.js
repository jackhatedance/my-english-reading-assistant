'use strict';

import { containsMaskedChars, removeMaskedChars } from '../textUtils.js';

function guess(token, options){
    let candicates = [];

    
    //try to remove the unnecessary hyphen
    if(options.lineEndHyphenMask && containsMaskedChars(options.lineEndHyphenMask)){        
        let cleanContent = removeMaskedChars(token.content, options.lineEndHyphenMask);
        let token2 = {
            content: cleanContent,
            checkType: 'content',
        };
        candicates.push(token2);

    }

    candicates.push({
        content: token.content,
        checkType: 'content',
    });
    
    return candicates;
}

function lineEndHyphen(){
    return guess;
}


export default lineEndHyphen;