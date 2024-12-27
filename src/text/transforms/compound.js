'use strict';


function guess(token, options){
    let candicates = [{
        content: token.content,
        checkType: 'content',
    }];

    let content = token.content;
    if(content && containsHyphen(content)){
        let subwords = content.split('-');   
        let candicateObj = {
            checkType:'subwords',
            subwords: subwords,
            content : content,
            type: 'compound',
        };
        candicates = [candicateObj];
    } else {
        candicates = [token];
    }
    
    return candicates;
}

function compound(){
    return guess;
}

function containsHyphen(word) {
    var result = false;
    if(word){
        result = word.includes('-');
    }
    return result;    
}

export default compound;