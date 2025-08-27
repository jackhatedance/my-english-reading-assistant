'use strict';

import { getWordPartObjects } from './language.js';
import {  TOKEN_TAG } from './html.js';
import { mergeEntries } from './dictionary/entry-utils.js'
import { pronunciationsToText } from './dictionary/definition-formatter.js'
import { simplifyDefinition } from './dictionary/simplify-definition.js'
import { createSimplifyDefinitionOptions } from './service/optionService.js'
import { encode } from 'html-entities';
import { isRegularTransform } from './lemma.js'

function buildAnnotationParameters(searchResult, simplifyDefinitionOptions, pronunciationRegion) {
    let query = searchResult.query;
    let word = searchResult.word;
    let baseWord = searchResult.baseWord;
    let searchType = searchResult.searchType;
    let baseSearchType = searchResult.baseSearchType;
    let definition = searchResult.definition;
    let targetWord = getTargetWord(searchResult);
    let pronunciation = getPronunciation(searchResult, targetWord, pronunciationRegion);
    
    let shortDefinition = definition;
    let middleDefinition = definition;
    if(simplifyDefinitionOptions){
        shortDefinition = simplifyDefinition(word, searchType, searchResult.lookupResult, baseWord, baseSearchType, searchResult.deepLookupResult, simplifyDefinitionOptions);
        middleDefinition = simplifyDefinition(word, searchType, searchResult.lookupResult, baseWord, baseSearchType, searchResult.deepLookupResult, createSimplifyDefinitionOptions(6, false));
    }

    let effectiveWord = baseWord? baseWord : word;
    let wordPartObjs = getWordPartObjects(effectiveWord);
    let parts = '';
    if (wordPartObjs) {
        let partArray = [];
        for (let partObj of wordPartObjs) {
            partArray.push(partObj.word);
        }
        parts = partArray.join(' ');
    }

    let annotationParameters = {
        pronunciation, definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts
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

function getPronunciation(searchResult, targetWord, pronunciationRegion){
    const { lookupResult, deepLookupResult, word, baseWord } = searchResult;

    let _lookupResult;
    if(word == targetWord){
        _lookupResult = lookupResult;
    }else {
        _lookupResult = deepLookupResult.lookupResult;
    }

    let entries = _lookupResult.json;
    if(entries.length == 0){
        return '';
    }

    let entry = mergeEntries(entries);
    
    let pronunciation = pronunciationsToText(entry.headword.pronunciations, pronunciationRegion);    
            
    if(!pronunciation){
        pronunciation = '';
    }
    return pronunciation;

}

function annotateWord(token, searchResult, sentenceId, sentenceNumber, tokenNumber, simplifyDefinitionOptions, pronunciationRegion) {
    let annotationParameters = buildAnnotationParameters(searchResult, simplifyDefinitionOptions, pronunciationRegion);
    let { pronunciation, definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts } = annotationParameters;
    let formatted = format(token, pronunciation, definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts, sentenceId, sentenceNumber, tokenNumber);
    //console.log('formatted:'+formatted);

    return formatted;
}

function updateWordAnnotation(textElement, searchResult, showShortDefinition, simplifyDefinitionOptions, pronunciationRegion){
    //console.log(textElement.tagName);
    let annotationParameters = buildAnnotationParameters(searchResult, simplifyDefinitionOptions, pronunciationRegion);
    let { pronunciation, definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts } = annotationParameters;
    //console.log(`updateWordAnnotation: ${word}`);

    let escapedQuery = query.replace(/&/g, "&amp;");
    let escapedWord = word.replace(/&/g, "&amp;");
    let escapedBaseWord = baseWord.replace(/&/g, "&amp;");
    let escapedTargetWord = targetWord.replace(/&/g, "&amp;");
    let escapedPronunciation = pronunciation.replace(/&/g, "&amp;");

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

    textElement.setAttribute('data-pronunciation', escapedPronunciation);
}

function updateNonWordAnnotation(textElement, query){
    textElement.classList.remove('mea-word');
    textElement.classList.add('mea-nonword');

    let pronunciation = '';
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
    textElement.setAttribute('data-pronunciation', pronunciation);
    textElement.setAttribute('data-footnote', definition);
    textElement.setAttribute('data-footnote-short', shortDefinition);
}

function annotateNonword(text, sentenceId, sentenceNumber, tokenNumber) {
    let pronunciation = '';
    let definition = '';
    let shortDefinition = '';
    let word = '';
    let baseWord = '';
    let targetWord = '';
    let parts = '';

    let result = format(text, pronunciation, definition, shortDefinition, word, baseWord, targetWord, parts, sentenceId, sentenceNumber, tokenNumber);

    return result;
}

function format(token, pronunciation, definition, shortDefinition, middleDefinition, query, word, baseWord, targetWord, parts, sentenceId, sentenceNumber, tokenNumber) {
    baseWord = encode(baseWord);
    word = encode(word);
    targetWord = encode(targetWord);
    token = encode(token);
    pronunciation = encode(pronunciation);
    shortDefinition = encode(shortDefinition);
    middleDefinition = encode(middleDefinition);

    let type = word ? 'mea-word' : 'mea-nonword';

    let s = `<${TOKEN_TAG} class="mea-element mea-highlight mea-hide ${type}" data-query="${query}" data-word="${word}" data-base-word="${baseWord}" data-target-word="${targetWord}" data-parts="${parts}" data-pronunciation="${pronunciation}" data-footnote="${middleDefinition}" data-footnote-short="${shortDefinition}" data-sentence-id="${sentenceId}" data-sentence-number="${sentenceNumber}" data-token-number="${tokenNumber}">${token}</${TOKEN_TAG}>`;
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