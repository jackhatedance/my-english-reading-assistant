'use strict';


function guess(token, options){
    let candicates = [];

    let content = token.content;

    if(containsAbbreviation(content)) {        
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

function containsAbbreviation(content){
    return content.match(/[A-Z]{3,}s/);
}

export default abbreviation;
export { containsAbbreviation }