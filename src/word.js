'use strict';

import { getWordParts } from './language.js';
import {  TOKEN_TAG } from './html.js';
import { simplifyDefinition } from './dictionary/simplify-definition.js'
import { createSimplifyDefinitionOptions } from './service/optionService.js'
import { encode } from 'html-entities';

function buildAnnotationParameters(searchResult, simplifyDefinitionOptions) {
    
    let word = searchResult.word;
    let baseWord = searchResult.baseWord;
    let definition = searchResult.definition;
    
    let shortDefinition = definition;
    let middleDefinition = definition;
    if(simplifyDefinitionOptions){
        shortDefinition = simplifyDefinition(searchResult.lookupResult, searchResult.deepLookupResult, simplifyDefinitionOptions);
        middleDefinition = simplifyDefinition(searchResult.lookupResult, searchResult.deepLookupResult, createSimplifyDefinitionOptions(6, false));
    }

    if (searchResult.searchType === 'stem') {
        middleDefinition = '根' + searchResult.baseWord + ':' + middleDefinition;
    }
    if (searchResult.searchType === 'removeSuffixOrPrefix') {
        middleDefinition = '源' + searchResult.baseWord + ':' + middleDefinition;
    }
    if (searchResult.searchType === 'lemma') {
        middleDefinition = '原' + searchResult.baseWord + ':' + middleDefinition;
    }
    if (searchResult.searchType === 'compounding') {
        middleDefinition = '复' + searchResult.baseWord + ':' + middleDefinition;
    }

    let effectiveWord = baseWord? baseWord : word;
    let wordPartObjs = getWordParts(effectiveWord);
    let parts = '';
    if (wordPartObjs) {
        let partArray = [];
        for (let partObj of wordPartObjs) {
            partArray.push(partObj.word);
        }
        parts = partArray.join(' ');
    }

    let annotationParameters = {
        definition, shortDefinition, middleDefinition, word, baseWord, parts
    };
    return annotationParameters;
}

function annotateWord(token, searchResult, sentenceId, sentenceNumber, tokenNumber, simplifyDefinitionOptions) {
    let annotationParameters = buildAnnotationParameters(searchResult, simplifyDefinitionOptions);
    let { definition, shortDefinition, middleDefinition, word, baseWord, parts } = annotationParameters;
    let formatted = format(token, definition, shortDefinition, middleDefinition, word, baseWord, parts, sentenceId, sentenceNumber, tokenNumber);
    //console.log('formatted:'+formatted);

    return formatted;
}

function updateWordAnnotation(textElement, searchResult, showShortDefinition, simplifyDefinitionOptions){
    //console.log(textElement.tagName);
    let annotationParameters = buildAnnotationParameters(searchResult, simplifyDefinitionOptions);
    let { definition, shortDefinition, middleDefinition, word, baseWord, parts } = annotationParameters;

    let escapedWord = word.replace(/&/g, "&amp;");
    let escapedBaseWord = baseWord.replace(/&/g, "&amp;");

    textElement.classList.remove('mea-nonword');
    textElement.classList.add('mea-word');

    textElement.setAttribute('data-word', escapedWord);
    textElement.setAttribute('data-base-word', escapedBaseWord);
    textElement.setAttribute('data-parts', `${parts}`);
    textElement.setAttribute('data-footnote', middleDefinition);

    if(!showShortDefinition){
        shortDefinition = '';
    }
    textElement.setAttribute('data-footnote-short', shortDefinition);
}

function annotateNonword(text, sentenceId, sentenceNumber, tokenNumber) {
    let definition = '';
    let shortDefinition = '';
    let word = '';
    let baseWord = '';
    let parts = '';

    let result = format(text, definition, shortDefinition, word, baseWord, parts, sentenceId, sentenceNumber, tokenNumber);

    return result;
}

function format(token, definition, shortDefinition, middleDefinition, word, baseWord, parts, sentenceId, sentenceNumber, tokenNumber) {
    baseWord = encode(baseWord);
    word = encode(word);
    token = encode(token);
    shortDefinition = encode(shortDefinition);
    middleDefinition = encode(middleDefinition);

    let type = word ? 'mea-word' : 'mea-nonword';

    let s = `<${TOKEN_TAG} class="mea-element mea-highlight mea-hide ${type}" data-word="${word}" data-base-word="${baseWord}" data-parts="${parts}" data-footnote="${middleDefinition}" data-footnote-short="${shortDefinition}" data-sentence-id="${sentenceId}" data-sentence-number="${sentenceNumber}" data-token-number="${tokenNumber}">${token}</${TOKEN_TAG}>`;
    return s;
}


function getWordFromElement(element) {
    return element.getAttribute('data-word');
}

function getBaseWordFromElement(element) {
    return element.getAttribute('data-base-word');
}

export { annotateWord, annotateNonword, updateWordAnnotation, getWordFromElement, getBaseWordFromElement };