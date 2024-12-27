'use strict';


function guess(token, options){
    let candicates = [{
        content: token.content,
        checkType: 'content',
    }];

    let content = token.content;
    if(content.endsWith("'s") || content.endsWith("'ll") ) {
        let lastIndex = content.lastIndexOf("'");
        let trimResult = content.substring(0, lastIndex);
        
        candicates.push({
            checkType: 'content',
            content: trimResult,
        });
    }
    
    return candicates;
}

function apostrophe(){
    return guess;
}

export default apostrophe;