'use strict';



function guess(token, options){
    let candicates = [];

    
    //try to remove the unnecessary hyphen
    if(options.lineEndHyphenMask && containsUnnecessaryChars(options.lineEndHyphenMask)){        
        let cleanContent = removeUnnecessaryChars(token.content, options.lineEndHyphenMask);
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


function containsUnnecessaryChars(str){
    return str && str.includes('#');
}


function removeUnnecessaryChars(str, mask){
    let result ='';
    for(let i=0;i<str.length;i++){
        if(mask[i] !== '#'){
            result = result + str[i];
        }
    }
    return result;
}

export default lineEndHyphen;