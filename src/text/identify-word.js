'use strict';

import lineEndHyphen from "./transforms/line-end-hyphen.js";
import apostrophe from "./transforms/apostrophe.js";
import punctuation from "./transforms/punctuation.js";
import compound from "./transforms/compound.js";
import abbreviation from "./transforms/abbreviation.js";
import endingDot from "./transforms/ending-dot.js";

/**
 * guess word by a sequence of transforms
 * @param {*} content 
 * @param {*} options 
 * @param {*} checkWord 
 * @param {*} transforms 
 * @returns 
 */
function guessWord(content, options, checkWord, transforms){

    if(!transforms){
        transforms= ['punctuation', 'endingDot', 'lineEndHyphen', 'apostrophe', 'abbreviation'];
    }

    let headTransformer = buildChain(transforms);
    let token = {
        content: content,
    };
    let result = process(headTransformer, token, options, checkWord);
    
    return result;
}

function getTransform(name){
    if(name === 'line-end-hyphen'){
        return lineEndHyphen();
    } else if(name === 'apostrophe'){
        return apostrophe();
    } else if(name === 'punctuation'){
        return punctuation();
    } else if(name === 'compound'){
        return compound();
    } else if(name === 'abbreviation'){
        return abbreviation();
    } else if(name === 'endingDot'){
        return endingDot();
    }
    
    throw new Error('invalid transform:'+name);    
}

function buildChain(transforms){

    let firstItem = null;
    let lastItem = null;
    for(let transformName of transforms){
        let item = {
            name: transformName,
            transform: getTransform(transformName),            
        };

        if(!firstItem){
            firstItem = item;
        }

        if(lastItem){
            lastItem.next = item;
        }

        //for next loop
        lastItem = item;
    }

    return firstItem;
}

function process(transformer, token, options, checkWord){

    let transformedTokens = transformer.transform(token, options);
    

    for(let transformedToken of transformedTokens){        
        if(transformedToken.checkType === 'content'){
            let checkWordResult = checkWord(transformedToken.content);
            if(checkWordResult){
                return transformedToken;
            }
        } else {
            if(transformedToken.checkType === 'subwords'){
                let checkWordsResult = checkWords(checkWord, transformedToken.subwords);
                if(checkWordsResult){
                    return transformedToken;
                }
            }
        }
    }

    let nextTransformer = transformer.next;
    if(nextTransformer){
        for(let candicate of transformedTokens){   
            //reset
            candicate.type = null;
            candicate.checkType = null;
            
            let processResult = process(nextTransformer, candicate, options, checkWord);
            if(processResult){
                return processResult;
            }
        }
    }
    
}

function checkWords(checkWord, words){
    let result = false;

    let validCount = 0;
    for(let word of words){
        let checkWordResult = checkWord(word);
        if(checkWordResult){
            validCount ++;
        }
    }
    if(validCount === words.length){
        result = true;
    }
    return result;
}

export { guessWord };