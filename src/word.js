'use strict';

import { getWordParts } from './language.js';
import {  TOKEN_TAG } from './html.js';
import { simplifyDefinition } from './dictionary/simplify-definition.js'
import { createSimplifyDefinitionOptions } from './service/optionService.js'
import { encode } from 'html-entities';
import { getSearchTypeDescription } from './dictionary/search-type.js'

function buildAnnotationParameters(searchResult, simplifyDefinitionOptions) {
    
    let word = searchResult.word;
    let baseWord = searchResult.baseWord;
    let searchType = searchResult.searchType;
    let baseSearchType = searchResult.baseSearchType;
    let definition = searchResult.definition;
    
    let shortDefinition = definition;
    let middleDefinition = definition;
    if(simplifyDefinitionOptions){
        shortDefinition = simplifyDefinition(searchResult.lookupResult, searchResult.deepLookupResult, simplifyDefinitionOptions);
        middleDefinition = simplifyDefinition(searchResult.lookupResult, searchResult.deepLookupResult, createSimplifyDefinitionOptions(6, false));
    }

    if(baseWord) {
        middleDefinition = addPrefixBySearchType(baseSearchType, searchResult.baseWord, middleDefinition);
    } else {
        middleDefinition = addPrefixBySearchType(searchType, searchResult.word, middleDefinition);
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
        definition, shortDefinition, middleDefinition, word, searchType, baseWord, parts
    };
    return annotationParameters;
}

function addPrefixBySearchType(searchType, word, definition){
    let result = definition;
    let desc = getSearchTypeDescription(searchType, false);
    if(desc){
        result = desc + word + ':' + definition;
    }

    return result;
}

function annotateWord(token, searchResult, sentenceId, sentenceNumber, tokenNumber, simplifyDefinitionOptions) {
    let annotationParameters = buildAnnotationParameters(searchResult, simplifyDefinitionOptions);
    let { definition, shortDefinition, middleDefinition, word, searchType, baseWord, parts } = annotationParameters;
    let formatted = format(token, definition, shortDefinition, middleDefinition, word, searchType, baseWord, parts, sentenceId, sentenceNumber, tokenNumber);
    //console.log('formatted:'+formatted);

    return formatted;
}

function updateWordAnnotation(textElement, searchResult, showShortDefinition, simplifyDefinitionOptions){
    //console.log(textElement.tagName);
    let annotationParameters = buildAnnotationParameters(searchResult, simplifyDefinitionOptions);
    let { definition, shortDefinition, middleDefinition, word, searchType, baseWord, parts } = annotationParameters;
    //console.log(`updateWordAnnotation: ${word}`);

    let escapedWord = word.replace(/&/g, "&amp;");
    let escapedBaseWord = baseWord.replace(/&/g, "&amp;");

    textElement.classList.remove('mea-nonword');
    textElement.classList.add('mea-word');

    textElement.setAttribute('data-word', escapedWord);
    textElement.setAttribute('data-search-type', searchType);
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
    let searchType = '';
    let baseWord = '';
    let parts = '';

    let result = format(text, definition, shortDefinition, word, searchType, baseWord, parts, sentenceId, sentenceNumber, tokenNumber);

    return result;
}

function format(token, definition, shortDefinition, middleDefinition, word, searchType, baseWord, parts, sentenceId, sentenceNumber, tokenNumber) {
    baseWord = encode(baseWord);
    word = encode(word);
    token = encode(token);
    shortDefinition = encode(shortDefinition);
    middleDefinition = encode(middleDefinition);

    let type = word ? 'mea-word' : 'mea-nonword';

    let s = `<${TOKEN_TAG} class="mea-element mea-highlight mea-hide ${type}" data-word="${word}" data-search-type="${searchType}" data-base-word="${baseWord}" data-parts="${parts}" data-footnote="${middleDefinition}" data-footnote-short="${shortDefinition}" data-sentence-id="${sentenceId}" data-sentence-number="${sentenceNumber}" data-token-number="${tokenNumber}">${token}</${TOKEN_TAG}>`;
    return s;
}


function getWordFromElement(element) {
    return element.getAttribute('data-word');
}

function getBaseWordFromElement(element) {
    return element.getAttribute('data-base-word');
}

export { annotateWord, annotateNonword, updateWordAnnotation, getWordFromElement, getBaseWordFromElement };