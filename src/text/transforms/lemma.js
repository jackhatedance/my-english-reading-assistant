'use strict';

import { singularCandidates, getBaseFromWordParts, lemmatizeAdjective, lemmatizeNoun, lemmatizeVerb } from '../../lemma.js'

function guess(token, options){
    let candicates = [{
        content: token.content,
        checkType: 'content',
    }];

    let input = token.content;
    let word;
    
    let words = singularCandidates(input);
    for(const word of words){
        candicates.push({
            checkType: 'content',
            content: word,
        });
    }

    word = getBaseFromWordParts(input)
    if(word !== input){
        candicates.push({
            checkType: 'content',
            content: word,
        });
    }

    word = lemmatizeAdjective(input);
    if(word !== input){
        candicates.push({
            checkType: 'content',
            content: word,
        });
    }

    word = lemmatizeNoun(input);
    if(word !== input){
        candicates.push({
            checkType: 'content',
            content: word,
        });
    }

    word = lemmatizeVerb(input);
    if(word !== input){
        candicates.push({
            checkType: 'content',
            content: word,
        });
    }
    
    return candicates;
}

function lemma(){
    return guess;
}

export default lemma;