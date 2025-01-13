'use strict';


function guess(token, options){
    let candicates = [];

    let content = token.content;

    if(content.match(/[A-Z]{3,}s/)) {
        
        let trimResult = content.slice(0, -1);
        
        candicates.push({
            checkType: 'content',
            content: trimResult,
        });
    }
    
    candicates.push({
        content: token.content,
        checkType: 'content',
    });

    return candicates;
}

function abbreviation(){
    return guess;
}

export default abbreviation;