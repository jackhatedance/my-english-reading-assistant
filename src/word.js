'use strict';

import { getWordParts } from './language.js';
import {  TOKEN_TAG } from './html.js';
import { simplifyDefinition } from './dictionary/simplify-definition.js'
import { createSimplifyDefinitionOptions } from './service/optionService.js'
import { encode } from 'html-entities';
import { getSearchTypeDescription } from './dictionary/search-type.js'
import { isRegularTransform } from './lemma.js'
import { hasOnlyLinkOrFormDefinition } from './dictionary/entry-utils.js'

function buildAnnotationParameters(searchResult, simplifyDefinitionOptions) {
    let query = searchResult.query;
    let word = searchResult.word;
    let baseWord = searchResult.baseWord;
    let searchType = searchResult.searchType;
    let baseSearchType = searchResult.baseSearchType;
    let definition = searchResult.definition;
    let targetWord = getTargetWord(searchResult);

    
    let shortDefinition = definition;
    let middleDefinition = definition;
    if(simplifyDefinitionOptions){
        shortDefinition = simplifyDefinition(searchResult.lookupResult, searchResult.deepLookupResult, simplifyDefinitionOptions);
        middleDefinition = simplifyDefinition(searchResult.lookupResult, searchResult.deepLookupResult, createSimplifyDefinitionOptions(6, false));
    }

    if(searchResult.deepLookupResult && hasOnlyLinkOrFormDefinition(searchResult.lookupResult.json)) {
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
        definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts
    };
    return annotationParameters;
}

function getTargetWord(searchResult){
    const { lookupResult, deepLookupResult, word, baseWord } = searchResult;
    if(!baseWord){
        return word;
    }

    let regularTransform = isRegularTransform(baseWord, word);
    if(regularTransform){
        return baseWord;
    }else {
        return word;
    }

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
    let { definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts } = annotationParameters;
    let formatted = format(token, definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts, sentenceId, sentenceNumber, tokenNumber);
    //console.log('formatted:'+formatted);

    return formatted;
}

function updateWordAnnotation(textElement, searchResult, showShortDefinition, simplifyDefinitionOptions){
    //console.log(textElement.tagName);
    let annotationParameters = buildAnnotationParameters(searchResult, simplifyDefinitionOptions);
    let { definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts } = annotationParameters;
    //console.log(`updateWordAnnotation: ${word}`);

    let escapedQuery = query.replace(/&/g, "&amp;");
    let escapedWord = word.replace(/&/g, "&amp;");
    let escapedBaseWord = baseWord.replace(/&/g, "&amp;");
    let escapedTargetWord = targetWord.replace(/&/g, "&amp;");

    textElement.classList.remove('mea-nonword');
    textElement.classList.add('mea-word');

    textElement.setAttribute('data-query', escapedQuery);
    textElement.setAttribute('data-word', escapedWord);
    textElement.setAttribute('data-base-word', escapedBaseWord);
    textElement.setAttribute('data-target-word', escapedTargetWord);
    textElement.setAttribute('data-parts', `${parts}`);
    textElement.setAttribute('data-footnote', middleDefinition);

    if(!showShortDefinition){
        shortDefinition = '';
    }
    textElement.setAttribute('data-footnote-short', shortDefinition);
}

function updateNonWordAnnotation(textElement, query){
    textElement.classList.remove('mea-word');
    textElement.classList.add('mea-nonword');

    let definition = '';
    let shortDefinition = '';
    let word = '';
    let baseWord = '';
    let targetWord = '';
    let parts = '';

    textElement.setAttribute('data-query', query);
    textElement.setAttribute('data-word', word);
    textElement.setAttribute('data-base-word', baseWord);
    textElement.setAttribute('data-target-word', targetWord);
    textElement.setAttribute('data-parts', parts);
    textElement.setAttribute('data-footnote', definition);
    textElement.setAttribute('data-footnote-short', shortDefinition);
}

function annotateNonword(text, sentenceId, sentenceNumber, tokenNumber) {
    let definition = '';
    let shortDefinition = '';
    let word = '';
    let baseWord = '';
    let targetWord = '';
    let parts = '';

    let result = format(text, definition, shortDefinition, word, baseWord, targetWord, parts, sentenceId, sentenceNumber, tokenNumber);

    return result;
}

function format(token, definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts, sentenceId, sentenceNumber, tokenNumber) {
    baseWord = encode(baseWord);
    word = encode(word);
    targetWord = encode(targetWord);
    token = encode(token);
    shortDefinition = encode(shortDefinition);
    middleDefinition = encode(middleDefinition);

    let type = word ? 'mea-word' : 'mea-nonword';

    let s = `<${TOKEN_TAG} class="mea-element mea-highlight mea-hide ${type}" data-query="${query}" data-word="${word}" data-base-word="${baseWord}" data-target-word="${targetWord}" data-parts="${parts}" data-footnote="${middleDefinition}" data-footnote-short="${shortDefinition}" data-sentence-id="${sentenceId}" data-sentence-number="${sentenceNumber}" data-token-number="${tokenNumber}">${token}</${TOKEN_TAG}>`;
    return s;
}

function getQueryFromElement(element) {
    return element.getAttribute('data-query');
}

function getWordFromElement(element) {
    return element.getAttribute('data-word');
}

function getBaseWordFromElement(element) {
    return element.getAttribute('data-base-word');
}

function getTargetWordFromElement(element) {
    return element.getAttribute('data-target-word');
}

export { annotateWord, annotateNonword, updateWordAnnotation, updateNonWordAnnotation, getQueryFromElement, getWordFromElement, getBaseWordFromElement, getTargetWordFromElement, getTargetWord };